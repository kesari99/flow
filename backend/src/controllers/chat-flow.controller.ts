import { NextFunction, Request, Response } from "express";
import { IChatFlowService } from "@server/services/chat-flow.service";
import { ResponseHelper } from "@server/helper/response.helper";
import { AuthRequest } from "@server/auth";

export class ChatFlowController {
  constructor(private readonly chatFlowService: IChatFlowService) {}

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const flow = await this.chatFlowService.getById(Number(req.params.id));
      ResponseHelper.success(res, flow, "Chat flow retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const authorId = req.body.authorId ?? 1;
      const workspaceId = req.body.workspaceId ?? 1;
      const data = {
        name: req.body.name,
        description: req.body.description,
        flowData: req.body.flowData,
        isPublic: req.body.isPublic,
        chatbotConfig: req.body.chatbotConfig,
        runtimeConfig: req.body.runtimeConfig,
      };
      const flow = await this.chatFlowService.create(data, authorId, workspaceId);
      ResponseHelper.created(res, flow, "Chat flow created successfully");
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const flow = await this.chatFlowService.update(
        Number(req.params.id),
        req.body,
      );
      ResponseHelper.success(res, flow, "Chat flow updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.chatFlowService.delete(Number(req.params.id));
      ResponseHelper.success(res, null, "Chat flow deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, unknown>;
      const result = await this.chatFlowService.list(
        {
          workspaceId: query.workspaceId as number | undefined,
          authorId: query.authorId as number | undefined,
          deployed: query.deployed as boolean | undefined,
          isPublic: query.isPublic as boolean | undefined,
        },
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
        "Chat flows retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async deploy(req: Request, res: Response, next: NextFunction) {
    try {
      const flow = await this.chatFlowService.deploy(Number(req.params.id));
      ResponseHelper.success(res, flow, "Chat flow deployed successfully");
    } catch (error) {
      next(error);
    }
  }

  async undeploy(req: Request, res: Response, next: NextFunction) {
    try {
      const flow = await this.chatFlowService.undeploy(Number(req.params.id));
      ResponseHelper.success(res, flow, "Chat flow undeployed successfully");
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const authorId = Number(req.body?.authorId) || 1;
      const flow = await this.chatFlowService.duplicate(
        Number(req.params.id),
        authorId,
      );
      ResponseHelper.created(res, flow, "Chat flow duplicated successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateFlowData(req: Request, res: Response, next: NextFunction) {
    try {
      const flow = await this.chatFlowService.updateFlowData(
        Number(req.params.id),
        req.body.flowData,
      );
      ResponseHelper.success(res, flow, "Flow data updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateChatbotConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const flow = await this.chatFlowService.updateChatbotConfig(
        Number(req.params.id),
        req.body.config,
      );
      ResponseHelper.success(res, flow, "Chatbot config updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateRuntimeConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const flow = await this.chatFlowService.updateRuntimeConfig(
        Number(req.params.id),
        req.body.config,
      );
      ResponseHelper.success(res, flow, "Runtime config updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async execute(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const result = await this.chatFlowService.execute(Number(req.params.id), {
        userMessage: req.body.userMessage,
        sessionId: req.body.sessionId,
        userId,
      });
      ResponseHelper.success(res, result, "Flow executed successfully");
    } catch (error) {
      next(error);
    }
  }
}
