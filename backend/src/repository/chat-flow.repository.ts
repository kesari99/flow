import { ChatFlow } from "@server/models/chat-flow.model";
import { BaseRepository, IBaseRepository } from ".";
import {
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { FindOptions, Transaction } from "sequelize";
import { NotFoundError } from "@server/utils/errors";

export interface IChatFlowRepository extends IBaseRepository<ChatFlow> {
  findByWorkspaceId(
    workspaceId: number,
    pagination: PaginationOptions,
    options?: FindOptions<ChatFlow>,
  ): Promise<PaginationResult<ChatFlow>>;

  findByAuthorId(
    authorId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatFlow>>;
  findDeployed(
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatFlow>>;
  findPublic(
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatFlow>>;
  findByNameAndWorkspace(
    name: string,
    workspaceId: number,
  ): Promise<ChatFlow | null>;
  deploy(id: number, transaction?: Transaction): Promise<ChatFlow>;
  undeploy(id: number, transaction?: Transaction): Promise<ChatFlow>;
  duplicate(
    id: number,
    authorId: number,
    transaction?: Transaction,
  ): Promise<ChatFlow>;
  updateFlowData(
    id: number,
    flowData: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<ChatFlow>;
  updateChatbotConfig(
    id: number,
    config: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<ChatFlow>;
  updateRuntimeConfig(
    id: number,
    config: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<ChatFlow>;
}

export class ChatFlowRepository
  extends BaseRepository<ChatFlow>
  implements IChatFlowRepository
{
  constructor() {
    super(ChatFlow, "ChatFlow");
  }

  async findByWorkspaceId(
    workspaceId: number,
    pagination: PaginationOptions,
    _options?: FindOptions<ChatFlow>,
  ): Promise<PaginationResult<ChatFlow>> {
    const where = {
      workspace_id: workspaceId,
    };
    return await this.findAndCountAll(pagination, where);
  }

  async findByAuthorId(
    authorId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatFlow>> {
    const where = {
      author_id: authorId,
    };

    return await this.findAndCountAll(pagination, where);
  }

  async findDeployed(
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatFlow>> {
    const options = { deployed: true };

    return await this.findAndCountAll(pagination, options);
  }

  async findPublic(
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatFlow>> {
    const options = { is_public: true };

    return await this.findAndCountAll(pagination, options);
  }

  async findByNameAndWorkspace(
    name: string,
    workspaceId: number,
  ): Promise<ChatFlow | null> {
    const options = {
      where: { name, workspace_id: workspaceId },
    };

    return await this.findOne(options);
  }

  async deploy(id: number, transaction?: Transaction): Promise<ChatFlow> {
    const updated = await this.update(id, { deployed: true }, transaction);
    if (!updated) throw new NotFoundError(this.resourceName, id);
    return updated;
  }

  async undeploy(id: number, transaction?: Transaction): Promise<ChatFlow> {
    const updated = await this.update(id, { deployed: false }, transaction);
    if (!updated) throw new NotFoundError(this.resourceName, id);
    return updated;
  }

  async duplicate(
    id: number,
    authorId: number,
    transaction?: Transaction,
  ): Promise<ChatFlow> {
    const original = await this.findById(id);
    if (!original) throw new NotFoundError(this.resourceName, id);

    return this.create(
      {
        name: `${original.name} (Copy)`,
        description: original.description,
        flow_data: original.flow_data,
        deployed: false,
        is_public: false,
        author_id: authorId,
        workspace_id: original.workspace_id,
        chatbot_config: original.chatbot_config,
        runtime_config: original.runtime_config,
      },
      transaction,
    );
  }

  async updateFlowData(
    id: number,
    flowData: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<ChatFlow> {
    const updated = await this.update(id, { flow_data: flowData }, transaction);
    if (!updated) throw new NotFoundError(this.resourceName, id);
    return updated;
  }

  async updateChatbotConfig(
    id: number,
    config: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<ChatFlow> {
    const flow = await this.findById(id, { transaction });
    if (!flow) throw new NotFoundError(this.resourceName, id);

    const merged = { ...(flow.chatbot_config ?? {}), ...config };
    const updated = await this.update(
      id,
      { chatbot_config: merged },
      transaction,
    );
    if (!updated) throw new NotFoundError(this.resourceName, id);
    return updated;
  }

  async updateRuntimeConfig(
    id: number,
    config: Record<string, unknown>,
    transaction?: Transaction,
  ): Promise<ChatFlow> {
    const flow = await this.findById(id, { transaction });
    if (!flow) throw new NotFoundError(this.resourceName, id);

    const merged = { ...(flow.runtime_config ?? {}), ...config };
    const updated = await this.update(
      id,
      { runtime_config: merged },
      transaction,
    );
    if (!updated) throw new NotFoundError(this.resourceName, id);
    return updated;
  }
}
