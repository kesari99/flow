import { Router } from "express";
import { NodeExecutionController } from "@server/controllers/node-execution.controller";
import { INodeExecutionService } from "@server/services/node-execution.service";
import {
  validateBody,
  validateParams,
  validateQuery,
  idParamSchema,
  sessionIdParamSchema,
} from "@server/validators";
import {
  createNodeExecutionSchema,
  updateNodeExecutionSchema,
  completeExecutionSchema,
  failExecutionSchema,
  nodeExecutionListQuerySchema,
} from "@server/dtos/node-execution.request.dto";

export function createNodeExecutionRoutes(
  nodeExecutionService: INodeExecutionService,
): Router {
  const router = Router();
  const controller = new NodeExecutionController(nodeExecutionService);

  router.get(
    "/",
    validateQuery(nodeExecutionListQuerySchema),
    (req, res, next) => controller.list(req, res, next),
  );
  router.post("/", validateBody(createNodeExecutionSchema), (req, res, next) =>
    controller.create(req, res, next),
  );
  router.get(
    "/session/:sessionId",
    validateParams(sessionIdParamSchema),
    validateQuery(nodeExecutionListQuerySchema),
    (req, res, next) => controller.getBySessionId(req, res, next),
  );
  router.get(
    "/session/:sessionId/stats",
    validateParams(sessionIdParamSchema),
    (req, res, next) => controller.getSessionStats(req, res, next),
  );
  router.delete(
    "/session/:sessionId",
    validateParams(sessionIdParamSchema),
    (req, res, next) => controller.deleteBySessionId(req, res, next),
  );
  router.get("/:id", validateParams(idParamSchema), (req, res, next) =>
    controller.getById(req, res, next),
  );
  router.put(
    "/:id",
    validateParams(idParamSchema),
    validateBody(updateNodeExecutionSchema),
    (req, res, next) => controller.update(req, res, next),
  );
  router.post(
    "/:id/complete",
    validateParams(idParamSchema),
    validateBody(completeExecutionSchema),
    (req, res, next) => controller.completeExecution(req, res, next),
  );
  router.post(
    "/:id/fail",
    validateParams(idParamSchema),
    validateBody(failExecutionSchema),
    (req, res, next) => controller.failExecution(req, res, next),
  );
  router.delete("/:id", validateParams(idParamSchema), (req, res, next) =>
    controller.delete(req, res, next),
  );

  return router;
}
