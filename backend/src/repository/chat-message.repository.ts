import { ChatMessage } from "@server/models/chat-message.model";
import { BaseRepository, IBaseRepository } from ".";
import {
  PaginationOptions,
  PaginationResult,
} from "@server/helper/pagination.helper";
import { ChatMessageCreationAttributes } from "@shared/types";
import { Transaction } from "sequelize";

export interface IChatMessageRepository extends IBaseRepository<ChatMessage> {
  findBySessionId(
    sessionId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatMessage>>;
  findByChatFlowId(
    chatflowId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatMessage>>;
  findBySessionIdAndRole(
    sessionId: string,
    role: string,
  ): Promise<ChatMessage[]>;
  addMessage(
    data: ChatMessageCreationAttributes,
    transaction?: Transaction,
  ): Promise<ChatMessage>;
  addMessagesBulk(
    data: ChatMessageCreationAttributes[],
    transaction?: Transaction,
  ): Promise<ChatMessage[]>;
  deleteBySessionId(
    sessionId: string,
    transaction?: Transaction,
  ): Promise<number>;
}

export class ChatMessageRepository
  extends BaseRepository<ChatMessage>
  implements IChatMessageRepository
{
  constructor() {
    super(ChatMessage, "ChatMessage");
  }

  async findBySessionId(
    sessionId: string,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatMessage>> {
    const whereOptions = { session_id: sessionId };
    return await this.findAndCountAll(pagination, whereOptions);
  }
  async findByChatFlowId(
    chatflowId: number,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<ChatMessage>> {
    const whereOptions = { chatflow_id: chatflowId };
    return await this.findAndCountAll(pagination, whereOptions);
  }

  async findBySessionIdAndRole(
    sessionId: string,
    role: string,
  ): Promise<ChatMessage[]> {
    const options = { where: { role, session_id: sessionId } };
    return await this.findAll(options);
  }

  async addMessage(
    data: ChatMessageCreationAttributes,
    transaction?: Transaction,
  ): Promise<ChatMessage> {
    return await this.create(data, transaction);
  }

  async addMessagesBulk(
    data: ChatMessageCreationAttributes[],
    transaction?: Transaction,
  ): Promise<ChatMessage[]> {
    return await this.bulkCreate(data, transaction);
  }

  async deleteBySessionId(
    sessionId: string,
    transaction?: Transaction,
  ): Promise<number> {
    return this.model.destroy({
      where: { session_id: sessionId },
      transaction,
    });
  }
}
