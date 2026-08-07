import { NextFunction, Request, Response } from "express";
import { IChatMessageService } from "@server/services/chat-message.service";
import { ResponseHelper } from "@server/helper/response.helper";

export class ChatMessageController {
  constructor(private readonly chatMessageService: IChatMessageService) {}

  async getBySessionId(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, unknown>;
      const result = await this.chatMessageService.getBySessionId(
        req.params.sessionId,
        {
          page: query.page as number | undefined,
          limit: query.limit as number | undefined,
          sortBy: query.sortBy as string | undefined,
          sortOrder: query.sortOrder as "ASC" | "DESC" | undefined,
        },
      );
      ResponseHelper.paginated(
        res,
        result.data,
        result.pagination,
        "Messages retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async getByChatFlowId(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, unknown>;
      const result = await this.chatMessageService.getByChatFlowId(
        Number(req.params.chatflowId),
        {
          page: query.page as number | undefined,
          limit: query.limit as number | undefined,
          sortBy: query.sortBy as string | undefined,
          sortOrder: query.sortOrder as "ASC" | "DESC" | undefined,
        },
      );
      ResponseHelper.paginated(
        res,
        result.data,
        result.pagination,
        "Messages retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await this.chatMessageService.getById(Number(req.params.id));
      ResponseHelper.success(res, message, "Message retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await this.chatMessageService.create(req.body);
      ResponseHelper.created(res, message, "Message created successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.chatMessageService.delete(Number(req.params.id));
      ResponseHelper.success(res, null, "Message deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteBySessionId(req: Request, res: Response, next: NextFunction) {
    try {
      await this.chatMessageService.deleteBySessionId(req.params.sessionId);
      ResponseHelper.success(res, null, "All messages deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getConversationHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const messages = await this.chatMessageService.getConversationHistory(
        req.params.sessionId,
      );
      ResponseHelper.success(
        res,
        messages,
        "Conversation history retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }
}
