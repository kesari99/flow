import { Router } from "express";
import { ChatFlowController } from "@server/controllers/chat-flow.controller";
import { IChatFlowService } from "@server/services/chat-flow.service";
import {
  validateBody,
  validateParams,
  validateQuery,
  idParamSchema,
} from "@server/validators";
import {
  createChatFlowSchema,
  updateChatFlowSchema,
  chatFlowListQuerySchema,
  updateFlowDataSchema,
  updateChatbotConfigSchema,
  updateRuntimeConfigSchema,
  executeChatFlowSchema,
} from "@server/dtos/chat-flow.request.dto";

export function createChatFlowRoutes(chatFlowService: IChatFlowService): Router {
  const router = Router();
  const controller = new ChatFlowController(chatFlowService);

  router.get("/", validateQuery(chatFlowListQuerySchema), (req, res, next) =>
    controller.list(req, res, next),
  );
  router.post("/", validateBody(createChatFlowSchema), (req, res, next) =>
    controller.create(req, res, next),
  );
  router.get("/:id", validateParams(idParamSchema), (req, res, next) =>
    controller.getById(req, res, next),
  );
  router.put(
    "/:id",
    validateParams(idParamSchema),
    validateBody(updateChatFlowSchema),
    (req, res, next) => controller.update(req, res, next),
  );
  router.delete("/:id", validateParams(idParamSchema), (req, res, next) =>
    controller.delete(req, res, next),
  );
  router.post("/:id/deploy", validateParams(idParamSchema), (req, res, next) =>
    controller.deploy(req, res, next),
  );
  router.post(
    "/:id/undeploy",
    validateParams(idParamSchema),
    (req, res, next) => controller.undeploy(req, res, next),
  );
  router.post(
    "/:id/duplicate",
    validateParams(idParamSchema),
    (req, res, next) => controller.duplicate(req, res, next),
  );
  router.patch(
    "/:id/flow-data",
    validateParams(idParamSchema),
    validateBody(updateFlowDataSchema),
    (req, res, next) => controller.updateFlowData(req, res, next),
  );
  router.patch(
    "/:id/chatbot-config",
    validateParams(idParamSchema),
    validateBody(updateChatbotConfigSchema),
    (req, res, next) => controller.updateChatbotConfig(req, res, next),
  );
  router.patch(
    "/:id/runtime-config",
    validateParams(idParamSchema),
    validateBody(updateRuntimeConfigSchema),
    (req, res, next) => controller.updateRuntimeConfig(req, res, next),
  );
  router.post(
    "/:id/execute",
    validateParams(idParamSchema),
    validateBody(executeChatFlowSchema),
    (req, res, next) => controller.execute(req, res, next),
  );

  return router;
}
