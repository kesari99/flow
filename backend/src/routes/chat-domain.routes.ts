import { Router } from "express";
import { Sequelize } from "sequelize";
import { UnitOfWork } from "@server/storage/unit-of-work";
import { ChatFlowService } from "@server/services/chat-flow.service";
import { ChatMessageService } from "@server/services/chat-message.service";
import { FlowVersionService } from "@server/services/flow-version.service";
import { RuntimeSessionService } from "@server/services/runtime-session.service";
import { NodeExecutionService } from "@server/services/node-execution.service";
import { ChatFlowController } from "@server/controllers/chat-flow.controller";
import { IChatFlowService } from "@server/services/chat-flow.service";
import {
  validateBody,
  validateParams,
  idParamSchema,
} from "@server/validators";
import { executeChatFlowSchema } from "@server/dtos/chat-flow.request.dto";
import { createChatFlowRoutes } from "./chat-flow.routes";
import { createChatMessageRoutes } from "./chat-message.routes";
import { createFlowVersionRoutes } from "./flow-version.routes";
import { createRuntimeSessionRoutes } from "./runtime-session.routes";
import { createNodeExecutionRoutes } from "./node-execution.routes";

/** POST /api/chat/:id/execute (CHATFLOW_ENDPOINTS.EXECUTE) */
function createChatExecuteRoutes(chatFlowService: IChatFlowService): Router {
  const router = Router();
  const controller = new ChatFlowController(chatFlowService);

  router.post(
    "/:id/execute",
    validateParams(idParamSchema),
    validateBody(executeChatFlowSchema),
    (req, res, next) => controller.execute(req, res, next),
  );

  return router;
}

export function createChatDomainRoutes(sequelize: Sequelize): Router {
  const router = Router();
  const unitOfWork = new UnitOfWork(sequelize);

  const chatFlowService = new ChatFlowService(unitOfWork);
  const chatMessageService = new ChatMessageService(unitOfWork);
  const flowVersionService = new FlowVersionService(unitOfWork);
  const runtimeSessionService = new RuntimeSessionService(unitOfWork);
  const nodeExecutionService = new NodeExecutionService(unitOfWork);

  router.use("/chat-flows", createChatFlowRoutes(chatFlowService));
  router.use("/chat-messages", createChatMessageRoutes(chatMessageService));
  router.use("/flow-versions", createFlowVersionRoutes(flowVersionService));
  router.use(
    "/runtime-sessions",
    createRuntimeSessionRoutes(runtimeSessionService),
  );
  router.use("/node-executions", createNodeExecutionRoutes(nodeExecutionService));
  router.use("/chat", createChatExecuteRoutes(chatFlowService));

  return router;
}
