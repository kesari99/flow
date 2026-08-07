import { z } from "zod";

export const createChatFlowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  flowData: z.record(z.unknown()).optional().default({}),
  isPublic: z.boolean().optional().default(false),
  chatbotConfig: z.record(z.unknown()).optional(),
  runtimeConfig: z.record(z.unknown()).optional(),
  authorId: z.number().int().positive().optional(),
  workspaceId: z.number().int().positive().optional(),
});

export const updateChatFlowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  flowData: z.record(z.unknown()).optional(),
  isPublic: z.boolean().optional(),
  chatbotConfig: z.record(z.unknown()).nullable().optional(),
  runtimeConfig: z.record(z.unknown()).nullable().optional(),
});

export const chatFlowListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("DESC"),
  workspaceId: z.coerce.number().int().optional(),
  authorId: z.coerce.number().int().optional(),
  deployed: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  isPublic: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const updateFlowDataSchema = z.object({
  flowData: z.record(z.unknown()),
});

export const updateChatbotConfigSchema = z.object({
  config: z.record(z.unknown()),
});

export const updateRuntimeConfigSchema = z.object({
  config: z.record(z.unknown()),
});

export const executeChatFlowSchema = z.object({
  userMessage: z.string().min(1, "userMessage is required"),
  sessionId: z.string().uuid().optional(),
});

export type CreateChatFlowRequest = z.infer<typeof createChatFlowSchema>;
export type UpdateChatFlowRequest = z.infer<typeof updateChatFlowSchema>;
export type ChatFlowListQuery = z.infer<typeof chatFlowListQuerySchema>;
export type ExecuteChatFlowRequest = z.infer<typeof executeChatFlowSchema>;
