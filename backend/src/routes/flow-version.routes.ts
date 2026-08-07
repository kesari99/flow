import { Router } from "express";
import { FlowVersionController } from "@server/controllers/flow-version.controller";
import { IFlowVersionService } from "@server/services/flow-version.service";
import {
  validateBody,
  validateParams,
  validateQuery,
  uuidParamSchema,
  flowIdParamSchema,
  flowIdAndVersionNumberSchema,
} from "@server/validators";
import {
  createVersionSchema,
  versionListQuerySchema,
} from "@server/dtos/flow-version.request.dto";

export function createFlowVersionRoutes(
  flowVersionService: IFlowVersionService,
): Router {
  const router = Router();
  const controller = new FlowVersionController(flowVersionService);

  router.get(
    "/flow/:flowId",
    validateParams(flowIdParamSchema),
    validateQuery(versionListQuerySchema),
    (req, res, next) => controller.getByFlowId(req, res, next),
  );
  router.get(
    "/flow/:flowId/latest",
    validateParams(flowIdParamSchema),
    (req, res, next) => controller.getLatestVersion(req, res, next),
  );
  router.get(
    "/flow/:flowId/version/:versionNumber",
    validateParams(flowIdAndVersionNumberSchema),
    (req, res, next) => controller.getByVersionNumber(req, res, next),
  );
  router.delete(
    "/flow/:flowId",
    validateParams(flowIdParamSchema),
    (req, res, next) => controller.deleteByFlowId(req, res, next),
  );
  router.post("/", validateBody(createVersionSchema), (req, res, next) =>
    controller.create(req, res, next),
  );
  router.get("/:id", validateParams(uuidParamSchema), (req, res, next) =>
    controller.getById(req, res, next),
  );
  router.post(
    "/:id/restore",
    validateParams(uuidParamSchema),
    (req, res, next) => controller.restoreVersion(req, res, next),
  );
  router.delete("/:id", validateParams(uuidParamSchema), (req, res, next) =>
    controller.delete(req, res, next),
  );

  return router;
}
