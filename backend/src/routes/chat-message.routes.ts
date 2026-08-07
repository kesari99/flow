import { Router } from "express";
import { ChatMessageController } from "@server/controllers/chat-message.controller";
import { IChatMessageService } from "@server/services/chat-message.service";
import {
  validateBody,
  validateParams,
  validateQuery,
  idParamSchema,
  sessionIdParamSchema,
  chatFlowIdParamSchema,
} from "@server/validators";
import {
  createMessageSchema,
  messageListQuerySchema,
} from "@server/dtos/chat-message.request.dto";

export function createChatMessageRoutes(
  chatMessageService: IChatMessageService,
): Router {
  const router = Router();
  const controller = new ChatMessageController(chatMessageService);

  router.get(
    "/session/:sessionId",
    validateParams(sessionIdParamSchema),
    validateQuery(messageListQuerySchema),
    (req, res, next) => controller.getBySessionId(req, res, next),
  );
  router.get(
    "/chatflow/:chatflowId",
    validateParams(chatFlowIdParamSchema),
    validateQuery(messageListQuerySchema),
    (req, res, next) => controller.getByChatFlowId(req, res, next),
  );
  router.get(
    "/session/:sessionId/history",
    validateParams(sessionIdParamSchema),
    (req, res, next) => controller.getConversationHistory(req, res, next),
  );
  router.delete(
    "/session/:sessionId",
    validateParams(sessionIdParamSchema),
    (req, res, next) => controller.deleteBySessionId(req, res, next),
  );
  router.post("/", validateBody(createMessageSchema), (req, res, next) =>
    controller.create(req, res, next),
  );
  router.get("/:id", validateParams(idParamSchema), (req, res, next) =>
    controller.getById(req, res, next),
  );
  router.delete("/:id", validateParams(idParamSchema), (req, res, next) =>
    controller.delete(req, res, next),
  );

  return router;
}
