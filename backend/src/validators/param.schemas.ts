import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export const flowIdParamSchema = z.object({
  flowId: z.string().regex(/^\d+$/, "Flow ID must be a number").transform(Number),
});

export const flowIdAndVersionNumberSchema = z.object({
  flowId: z.string().regex(/^\d+$/, "Flow ID must be a number").transform(Number),
  versionNumber: z
    .string()
    .regex(/^\d+$/, "Version number must be a number")
    .transform(Number),
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid("Session ID must be a valid UUID"),
});

export const chatFlowIdParamSchema = z.object({
  chatflowId: z
    .string()
    .regex(/^\d+$/, "Chat flow ID must be a number")
    .transform(Number),
});
