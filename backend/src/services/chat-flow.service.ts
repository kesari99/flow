import {
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { executeFlow } from "@server/services/ai-engine.client";
import { IUnitOfWork } from "@server/storage/unit-of-work";
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
} from "@server/utils/errors";
import { ChatFlowAttributes } from "@shared/types";
import { randomUUID } from "crypto";

export interface CreateChatFlowDTO {
  name: string;
  description?: string;
  flowData?: Record<string, unknown>;
  isPublic?: boolean;
  chatbotConfig?: Record<string, unknown>;
  runtimeConfig?: Record<string, unknown>;
}

export interface UpdateChatFlowDTO {
  name?: string;
  description?: string;
  flowData?: Record<string, unknown>;
  isPublic?: boolean;
  chatbotConfig?: Record<string, unknown>;
  runtimeConfig?: Record<string, unknown>;
}

export interface ChatFlowListFilters {
  workspaceId?: number;
  authorId?: number;
  deployed?: boolean;
  isPublic?: boolean;
}

export interface ExecuteChatFlowDTO {
  userMessage: string;
  sessionId?: string;
  userId: string;
}

export interface ExecuteChatFlowResult {
  response: string;
  sessionId: string;
  tokens: number;
  metadata: Record<string, unknown>;
}

export interface IChatFlowService {
  getById(id: number): Promise<ChatFlowAttributes>;
  create(
    data: CreateChatFlowDTO,
    authorId: number,
    workspaceId: number,
  ): Promise<ChatFlowAttributes>;
  update(id: number, data: UpdateChatFlowDTO): Promise<ChatFlowAttributes>;
  delete(id: number): Promise<void>;
  list(
    filters: ChatFlowListFilters,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatFlowAttributes>>;
  deploy(id: number): Promise<ChatFlowAttributes>;
  undeploy(id: number): Promise<ChatFlowAttributes>;
  duplicate(id: number, authorId: number): Promise<ChatFlowAttributes>;
  updateFlowData(
    id: number,
    flowData: Record<string, unknown>,
  ): Promise<ChatFlowAttributes>;
  updateChatbotConfig(
    id: number,
    config: Record<string, unknown>,
  ): Promise<ChatFlowAttributes>;
  updateRuntimeConfig(
    id: number,
    config: Record<string, unknown>,
  ): Promise<ChatFlowAttributes>;
  execute(
    flowId: number,
    data: ExecuteChatFlowDTO,
  ): Promise<ExecuteChatFlowResult>;
}

export class ChatFlowService implements IChatFlowService {
  private readonly unitOfWork: IUnitOfWork;

  constructor(unitOfWork: IUnitOfWork) {
    this.unitOfWork = unitOfWork;
  }

  async getById(id: number): Promise<ChatFlowAttributes> {
    const flow = await this.unitOfWork.chatFlows.findById(id, {
      include: ["messages", "versions", "sessions"],
    });

    if (!flow) {
      throw new NotFoundError("ChatFlow", id);
    }

    return flow.get({ plain: true });
  }

  async create(
    data: CreateChatFlowDTO,
    authorId: number,
    workspaceId: number,
  ): Promise<ChatFlowAttributes> {
    const existingFlow = await this.unitOfWork.chatFlows.findByNameAndWorkspace(
      data.name,
      workspaceId,
    );

    if (existingFlow) {
      throw new ConflictError("ChatFlow", "name", data.name);
    }

    return this.unitOfWork.withTransaction(async (uow) => {
      const flow = await uow.chatFlows.create(
        {
          name: data.name,
          description: data.description ?? null,
          flow_data: data.flowData || {},
          deployed: false,
          is_public: data.isPublic || false,
          author_id: authorId,
          workspace_id: workspaceId,
          chatbot_config: data.chatbotConfig || null,
          runtime_config: data.runtimeConfig || null,
        },
        uow.transaction ?? undefined,
      );

      await uow.flowVersions.createVersion(
        {
          id: randomUUID(),
          flow_id: flow.id,
          data: data.flowData || {},
          inputs: null,
          author: String(authorId),
          comment: "Initial version",
          version_number: 1,
        },
        uow.transaction ?? undefined,
      );

      return flow.get({ plain: true });
    });
  }

  async update(
    id: number,
    data: UpdateChatFlowDTO,
  ): Promise<ChatFlowAttributes> {
    const existingFlow = await this.unitOfWork.chatFlows.findById(id);
    if (!existingFlow) {
      throw new NotFoundError("ChatFlow", id);
    }

    if (data.name && data.name !== existingFlow.name) {
      const duplicate = await this.unitOfWork.chatFlows.findByNameAndWorkspace(
        data.name,
        existingFlow.workspace_id,
      );
      if (duplicate) {
        throw new ConflictError("ChatFlow", "name", data.name);
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.flowData !== undefined) updateData.flow_data = data.flowData;
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic;
    if (data.chatbotConfig !== undefined)
      updateData.chatbot_config = data.chatbotConfig;
    if (data.runtimeConfig !== undefined)
      updateData.runtime_config = data.runtimeConfig;

    const updated = await this.unitOfWork.chatFlows.update(id, updateData);
    if (!updated) throw new NotFoundError("ChatFlow", id);
    return updated.get({ plain: true });
  }

  async delete(id: number): Promise<void> {
    const flow = await this.unitOfWork.chatFlows.findById(id);
    if (!flow) throw new NotFoundError("ChatFlow", id);

    if (flow.deployed) {
      throw new BusinessRuleError(
        "Cannot delete a deployed chat flow. Undeploy it first.",
      );
    }

    await this.unitOfWork.withTransaction(async (uow) => {
      await uow.flowVersions.deleteByFlowId(id, uow.transaction ?? undefined);
      await uow.runtimeSessions.deleteByFlowId(id, uow.transaction ?? undefined);
      await uow.chatFlows.delete(id, uow.transaction ?? undefined);
    });
  }

  async list(
    filters: ChatFlowListFilters,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatFlowAttributes>> {
    let result;

    if (filters.workspaceId) {
      result = await this.unitOfWork.chatFlows.findByWorkspaceId(
        filters.workspaceId,
        pagination,
      );
    } else if (filters.authorId) {
      result = await this.unitOfWork.chatFlows.findByAuthorId(
        filters.authorId,
        pagination,
      );
    } else if (filters.isPublic) {
      result = await this.unitOfWork.chatFlows.findPublic(pagination);
    } else if (filters.deployed) {
      result = await this.unitOfWork.chatFlows.findDeployed(pagination);
    } else {
      result = await this.unitOfWork.chatFlows.findAndCountAll(pagination, {});
    }

    return {
      data: result.data.map((flow) => flow.get({ plain: true })),
      pagination: result.pagination,
    };
  }

  async deploy(id: number): Promise<ChatFlowAttributes> {
    const flow = await this.unitOfWork.chatFlows.findById(id);
    if (!flow) throw new NotFoundError("ChatFlow", id);

    if (!flow.flow_data || Object.keys(flow.flow_data).length === 0) {
      throw new BusinessRuleError(
        "Cannot deploy a chat flow without flow data",
      );
    }

    const deployed = await this.unitOfWork.chatFlows.deploy(id);
    return deployed.get({ plain: true });
  }

  async undeploy(id: number): Promise<ChatFlowAttributes> {
    const undeployed = await this.unitOfWork.chatFlows.undeploy(id);
    return undeployed.get({ plain: true });
  }

  async duplicate(
    id: number,
    authorId: number,
  ): Promise<ChatFlowAttributes> {
    return this.unitOfWork.withTransaction(async (uow) => {
      const duplicated = await uow.chatFlows.duplicate(
        id,
        authorId,
        uow.transaction ?? undefined,
      );

      const versions = await uow.flowVersions.findByFlowId(id, {
        page: 1,
        limit: 1000,
      });

      for (const version of versions.data) {
        await uow.flowVersions.createVersion(
          {
            id: randomUUID(),
            flow_id: duplicated.id,
            data: version.data,
            inputs: version.inputs,
            author: String(authorId),
            comment: `Copied from version ${version.version_number}`,
            version_number: version.version_number,
          },
          uow.transaction ?? undefined,
        );
      }

      return duplicated.get({ plain: true });
    });
  }

  async updateFlowData(
    id: number,
    flowData: Record<string, unknown>,
  ): Promise<ChatFlowAttributes> {
    const updated = await this.unitOfWork.chatFlows.updateFlowData(id, flowData);
    return updated.get({ plain: true });
  }

  async updateChatbotConfig(
    id: number,
    config: Record<string, unknown>,
  ): Promise<ChatFlowAttributes> {
    const updated = await this.unitOfWork.chatFlows.updateChatbotConfig(
      id,
      config,
    );
    return updated.get({ plain: true });
  }

  async updateRuntimeConfig(
    id: number,
    config: Record<string, unknown>,
  ): Promise<ChatFlowAttributes> {
    const updated = await this.unitOfWork.chatFlows.updateRuntimeConfig(
      id,
      config,
    );
    return updated.get({ plain: true });
  }

  async execute(
    flowId: number,
    data: ExecuteChatFlowDTO,
  ): Promise<ExecuteChatFlowResult> {
    if (!data.userMessage?.trim()) {
      throw new BusinessRuleError("userMessage is required");
    }

    const flow = await this.unitOfWork.chatFlows.findById(flowId);
    if (!flow) throw new NotFoundError("ChatFlow", flowId);

    let sessionId = data.sessionId;
    if (sessionId) {
      const existing = await this.unitOfWork.runtimeSessions.findById(
        sessionId,
      );
      if (!existing) throw new NotFoundError("RuntimeSession", sessionId);
      if (existing.flow_id !== flowId) {
        throw new BusinessRuleError(
          "Session does not belong to the specified chat flow",
        );
      }
    } else {
      const session = await this.unitOfWork.runtimeSessions.createSession({
        id: randomUUID(),
        flow_id: flowId,
        user_id: data.userId,
        inputs: { userMessage: data.userMessage },
        variables: {},
        outputs: null,
        status: "running",
        metadata: null,
        started_at: new Date(),
        completed_at: null,
      });
      sessionId = session.id;
    }

    const history = await this.unitOfWork.chatMessages.findBySessionId(
      sessionId,
      {
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "ASC",
      },
    );

    const messages = history.data.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    await this.unitOfWork.chatMessages.addMessage({
      session_id: sessionId,
      chatflow_id: flowId,
      role: "user",
      content: data.userMessage,
      source_documents: null,
      file_annotations: null,
    });

    const aiResult = await executeFlow({
      flowId,
      userMessage: data.userMessage,
      messages,
      sessionId,
      flowData: (flow.flow_data || {}) as Record<string, unknown>,
    });

    await this.unitOfWork.chatMessages.addMessage({
      session_id: sessionId,
      chatflow_id: flowId,
      role: "assistant",
      content: aiResult.response,
      source_documents: null,
      file_annotations: null,
    });

    if (aiResult.nodeResults?.length) {
      for (const nodeResult of aiResult.nodeResults) {
        try {
          await this.unitOfWork.nodeExecutions.createExecution({
            session_id: sessionId,
            node_id: nodeResult.node_id,
            node_type: nodeResult.node_type,
            inputs: null,
            outputs: nodeResult.outputs || null,
            execution_time: nodeResult.execution_time ?? null,
            status: nodeResult.status,
            error: nodeResult.error || null,
            timestamp: new Date(),
          });
        } catch {
          // Best-effort recording; do not fail the chat response
        }
      }
    }

    return {
      response: aiResult.response,
      sessionId,
      tokens: aiResult.tokens,
      metadata: aiResult.metadata,
    };
  }
}
