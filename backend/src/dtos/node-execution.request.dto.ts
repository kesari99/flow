import { z } from "zod";

export const createNodeExecutionSchema = z.object({
  sessionId: z.string().uuid(),
  nodeId: z.string().min(1),
  nodeType: z.string().min(1),
  inputs: z.record(z.unknown()).optional(),
});

export const updateNodeExecutionSchema = z.object({
  outputs: z.record(z.unknown()).optional(),
  executionTime: z.number().nonnegative().optional(),
  status: z.enum(["success", "failed", "running"]).optional(),
  error: z.string().optional(),
});

export const completeExecutionSchema = z.object({
  outputs: z.record(z.unknown()),
  executionTime: z.number().nonnegative(),
});

export const failExecutionSchema = z.object({
  error: z.string().min(1),
  executionTime: z.number().nonnegative().optional(),
});

export const nodeExecutionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional().default("timestamp"),
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("DESC"),
  sessionId: z.string().uuid().optional(),
  nodeId: z.string().optional(),
  nodeType: z.string().optional(),
  status: z.string().optional(),
});

export type CreateNodeExecutionRequest = z.infer<typeof createNodeExecutionSchema>;
export type NodeExecutionListQuery = z.infer<typeof nodeExecutionListQuerySchema>;
