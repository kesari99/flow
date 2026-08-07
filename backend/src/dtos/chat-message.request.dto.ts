import { z } from "zod";

export const createMessageSchema = z.object({
  sessionId: z.string().uuid(),
  chatflowId: z.number().int().positive(),
  role: z.enum(["user", "assistant", "system", "function"]),
  content: z.string().min(1).max(100000),
  sourceDocuments: z.array(z.record(z.unknown())).optional(),
  fileAnnotations: z.array(z.record(z.unknown())).optional(),
});

export const messageListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("ASC"),
});

export type CreateMessageRequest = z.infer<typeof createMessageSchema>;
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;
