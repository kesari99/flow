import {
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { IUnitOfWork } from "@server/storage/unit-of-work";
import { BusinessRuleError, NotFoundError } from "@server/utils/errors";
import { ChatMessageAttributes } from "@shared/types";

export interface CreateMessageDTO {
  sessionId: string;
  chatflowId: number;
  role: string;
  content: string;
  sourceDocuments?: Record<string, unknown>[];
  fileAnnotations?: Record<string, unknown>[];
}

export interface IChatMessageService {
  getBySessionId(
    sessionId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatMessageAttributes>>;
  getByChatFlowId(
    chatflowId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatMessageAttributes>>;
  getById(id: number): Promise<ChatMessageAttributes>;
  create(data: CreateMessageDTO): Promise<ChatMessageAttributes>;
  delete(id: number): Promise<void>;
  deleteBySessionId(sessionId: string): Promise<void>;
  getConversationHistory(sessionId: string): Promise<ChatMessageAttributes[]>;
}

export class ChatMessageService implements IChatMessageService {
  private readonly unitOfWork: IUnitOfWork;

  constructor(unitOfWork: IUnitOfWork) {
    this.unitOfWork = unitOfWork;
  }

  async getByChatFlowId(
    chatflowId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatMessageAttributes>> {
    const flow = await this.unitOfWork.chatFlows.findById(chatflowId);
    if (!flow) throw new NotFoundError("ChatFlow", chatflowId);

    const result = await this.unitOfWork.chatMessages.findByChatFlowId(
      chatflowId,
      pagination,
    );

    return {
      data: result.data.map((msg) => msg.get({ plain: true })),
      pagination: result.pagination,
    };
  }

  async getBySessionId(
    sessionId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatMessageAttributes>> {
    const session = await this.unitOfWork.runtimeSessions.findById(sessionId);
    if (!session) throw new NotFoundError("RuntimeSession", sessionId);

    const result = await this.unitOfWork.chatMessages.findBySessionId(
      sessionId,
      pagination,
    );

    return {
      data: result.data.map((msg) => msg.get({ plain: true })),
      pagination: result.pagination,
    };
  }

  async getById(id: number): Promise<ChatMessageAttributes> {
    const message = await this.unitOfWork.chatMessages.findById(id, {
      include: ["chatFlow", "session"],
    });

    if (!message) throw new NotFoundError("ChatMessage", id);
    return message.get({ plain: true });
  }

  async create(data: CreateMessageDTO): Promise<ChatMessageAttributes> {
    const session = await this.unitOfWork.runtimeSessions.findById(
      data.sessionId,
    );
    if (!session) throw new NotFoundError("RuntimeSession", data.sessionId);

    if (data.chatflowId !== session.flow_id) {
      throw new BusinessRuleError(
        "Session does not belong to the specified chat flow",
      );
    }

    const validRoles = ["user", "assistant", "system", "function"];
    if (!validRoles.includes(data.role)) {
      throw new BusinessRuleError(
        `Invalid role: ${data.role}. Must be one of: ${validRoles.join(", ")}`,
      );
    }

    const message = await this.unitOfWork.chatMessages.addMessage({
      session_id: data.sessionId,
      chatflow_id: data.chatflowId,
      role: data.role,
      content: data.content,
      source_documents: data.sourceDocuments || null,
      file_annotations: data.fileAnnotations || null,
    });

    return message.get({ plain: true });
  }

  async delete(id: number): Promise<void> {
    const message = await this.unitOfWork.chatMessages.findById(id);
    if (!message) throw new NotFoundError("ChatMessage", id);
    await this.unitOfWork.chatMessages.delete(id);
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    const session = await this.unitOfWork.runtimeSessions.findById(sessionId);
    if (!session) throw new NotFoundError("RuntimeSession", sessionId);
    await this.unitOfWork.chatMessages.deleteBySessionId(sessionId);
  }

  async getConversationHistory(
    sessionId: string,
  ): Promise<ChatMessageAttributes[]> {
    const session = await this.unitOfWork.runtimeSessions.findById(sessionId);
    if (!session) throw new NotFoundError("RuntimeSession", sessionId);

    const messages = await this.unitOfWork.chatMessages.findBySessionId(
      sessionId,
      {
        page: 1,
        limit: 1000,
        sortBy: "createdAt",
        sortOrder: "ASC",
      },
    );

    return messages.data.map((msg) => msg.get({ plain: true }));
  }
}
