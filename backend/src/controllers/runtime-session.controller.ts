import { NextFunction, Request, Response } from "express";
import { IRuntimeSessionService } from "@server/services/runtime-session.service";
import { ResponseHelper } from "@server/helper/response.helper";
import { RuntimeSessionStatus } from "@shared/types";

export class RuntimeSessionController {
  constructor(private readonly runtimeSessionService: IRuntimeSessionService) {}

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await this.runtimeSessionService.getById(req.params.id);
      ResponseHelper.success(res, session, "Session retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await this.runtimeSessionService.create(req.body);
      ResponseHelper.created(res, session, "Session created successfully");
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, unknown>;
      const result = await this.runtimeSessionService.list(
        {
          flowId: query.flowId as number | undefined,
          userId: query.userId as string | undefined,
          status: query.status as RuntimeSessionStatus | undefined,
          startDate: query.startDate
            ? new Date(String(query.startDate))
            : undefined,
          endDate: query.endDate ? new Date(String(query.endDate)) : undefined,
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
        "Sessions retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await this.runtimeSessionService.complete(
        req.params.id,
        req.body?.outputs,
      );
      ResponseHelper.success(res, session, "Session completed successfully");
    } catch (error) {
      next(error);
    }
  }

  async fail(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await this.runtimeSessionService.fail(
        req.params.id,
        req.body?.error,
      );
      ResponseHelper.success(res, session, "Session marked as failed");
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await this.runtimeSessionService.cancel(req.params.id);
      ResponseHelper.success(res, session, "Session cancelled successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateVariables(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await this.runtimeSessionService.updateVariables(
        req.params.id,
        req.body.variables,
      );
      ResponseHelper.success(
        res,
        session,
        "Session variables updated successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async updateOutputs(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await this.runtimeSessionService.updateOutputs(
        req.params.id,
        req.body.outputs,
      );
      ResponseHelper.success(
        res,
        session,
        "Session outputs updated successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.runtimeSessionService.delete(req.params.id);
      ResponseHelper.success(res, null, "Session deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await this.runtimeSessionService.getSessionStats(
        req.params.id,
      );
      ResponseHelper.success(res, stats, "Session stats retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
