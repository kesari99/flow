import { Router } from "express";
import { RuntimeSessionController } from "@server/controllers/runtime-session.controller";
import { IRuntimeSessionService } from "@server/services/runtime-session.service";
import {
  validateBody,
  validateParams,
  validateQuery,
  uuidParamSchema,
} from "@server/validators";
import {
  createSessionSchema,
  updateVariablesSchema,
  updateOutputsSchema,
  failSessionSchema,
  completeSessionSchema,
  sessionListQuerySchema,
} from "@server/dtos/runtime-session.request.dto";

export function createRuntimeSessionRoutes(
  runtimeSessionService: IRuntimeSessionService,
): Router {
  const router = Router();
  const controller = new RuntimeSessionController(runtimeSessionService);

  router.get("/", validateQuery(sessionListQuerySchema), (req, res, next) =>
    controller.list(req, res, next),
  );
  router.post("/", validateBody(createSessionSchema), (req, res, next) =>
    controller.create(req, res, next),
  );
  router.get("/:id", validateParams(uuidParamSchema), (req, res, next) =>
    controller.getById(req, res, next),
  );
  router.delete("/:id", validateParams(uuidParamSchema), (req, res, next) =>
    controller.delete(req, res, next),
  );
  router.post(
    "/:id/complete",
    validateParams(uuidParamSchema),
    validateBody(completeSessionSchema),
    (req, res, next) => controller.complete(req, res, next),
  );
  router.post(
    "/:id/fail",
    validateParams(uuidParamSchema),
    validateBody(failSessionSchema),
    (req, res, next) => controller.fail(req, res, next),
  );
  router.post(
    "/:id/cancel",
    validateParams(uuidParamSchema),
    (req, res, next) => controller.cancel(req, res, next),
  );
  router.patch(
    "/:id/variables",
    validateParams(uuidParamSchema),
    validateBody(updateVariablesSchema),
    (req, res, next) => controller.updateVariables(req, res, next),
  );
  router.patch(
    "/:id/outputs",
    validateParams(uuidParamSchema),
    validateBody(updateOutputsSchema),
    (req, res, next) => controller.updateOutputs(req, res, next),
  );
  router.get(
    "/:id/stats",
    validateParams(uuidParamSchema),
    (req, res, next) => controller.getStats(req, res, next),
  );

  return router;
}
