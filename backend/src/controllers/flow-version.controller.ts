import { NextFunction, Request, Response } from "express";
import { IFlowVersionService } from "@server/services/flow-version.service";
import { ResponseHelper } from "@server/helper/response.helper";

export class FlowVersionController {
  constructor(private readonly flowVersionService: IFlowVersionService) {}

  async getByFlowId(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, unknown>;
      const result = await this.flowVersionService.getByFlowId(
        Number(req.params.flowId),
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
        "Versions retrieved successfully",
      );
    } catch (error) {
      next(error);
    }
  }

  async getLatestVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await this.flowVersionService.getLatestVersion(
        Number(req.params.flowId),
      );
      ResponseHelper.success(res, version, "Latest version retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getByVersionNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await this.flowVersionService.getByVersionNumber(
        Number(req.params.flowId),
        Number(req.params.versionNumber),
      );
      ResponseHelper.success(res, version, "Version retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await this.flowVersionService.getById(req.params.id);
      ResponseHelper.success(res, version, "Version retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await this.flowVersionService.create(req.body);
      ResponseHelper.created(res, version, "Version created successfully");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.flowVersionService.delete(req.params.id);
      ResponseHelper.success(res, null, "Version deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteByFlowId(req: Request, res: Response, next: NextFunction) {
    try {
      await this.flowVersionService.deleteByFlowId(Number(req.params.flowId));
      ResponseHelper.success(res, null, "All versions deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async restoreVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.flowVersionService.restoreVersion(req.params.id);
      ResponseHelper.success(res, result, "Version restored successfully");
    } catch (error) {
      next(error);
    }
  }
}
