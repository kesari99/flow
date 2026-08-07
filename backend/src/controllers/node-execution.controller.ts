import { NextFunction, Request, Response } from "express";
import { INodeExecutionService } from "@server/services/node-execution.service";
import { ResponseHelper } from "@server/helper/response.helper";

export class NodeExecutionController {
  constructor(private readonly nodeExecutionService: INodeExecutionService) {}

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const execution = await this.nodeExecutionService.getById(
        Number(req.params.id),
      );
      ResponseHelper.success(
        res,
        execution,
        "Node execution retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async getBySessionId(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, unknown>;
      const result = await this.nodeExecutionService.getBySessionId(
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
        "Node executions retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, unknown>;
      const result = await this.nodeExecutionService.list(
        {
          sessionId: query.sessionId as string | undefined,
          nodeId: query.nodeId as string | undefined,
          nodeType: query.nodeType as string | undefined,
          status: query.status as string | undefined,
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
        "Node executions retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const execution = await this.nodeExecutionService.create(req.body);
      ResponseHelper.created(
        res,
        execution,
        "Node execution created successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const execution = await this.nodeExecutionService.update(
        Number(req.params.id),
        req.body,
      );
      ResponseHelper.success(
        res,
        execution,
        "Node execution updated successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async completeExecution(req: Request, res: Response, next: NextFunction) {
    try {
      const execution = await this.nodeExecutionService.completeExecution(
        Number(req.params.id),
        req.body.outputs,
        req.body.executionTime,
      );
      ResponseHelper.success(
        res,
        execution,
        "Node execution completed successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async failExecution(req: Request, res: Response, next: NextFunction) {
    try {
      const execution = await this.nodeExecutionService.failExecution(
        Number(req.params.id),
        req.body.error,
        req.body.executionTime,
      );
      ResponseHelper.success(res, execution, "Node execution marked as failed");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.nodeExecutionService.delete(Number(req.params.id));
      ResponseHelper.success(res, null, "Node execution deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteBySessionId(req: Request, res: Response, next: NextFunction) {
    try {
      await this.nodeExecutionService.deleteBySessionId(req.params.sessionId);
      ResponseHelper.success(
        res,
        null,
        "All node executions deleted successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async getSessionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await this.nodeExecutionService.getSessionExecutionStats(
        req.params.sessionId,
      );
      ResponseHelper.success(
        res,
        stats,
        "Session execution stats retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }
}
