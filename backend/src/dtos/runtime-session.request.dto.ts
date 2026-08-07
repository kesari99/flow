import { z } from "zod";

export const createSessionSchema = z.object({
  flowId: z.number().int().positive(),
  userId: z.string().uuid(),
  inputs: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateVariablesSchema = z.object({
  variables: z.record(z.unknown()),
});

export const updateOutputsSchema = z.object({
  outputs: z.record(z.unknown()),
});

export const failSessionSchema = z.object({
  error: z.string().optional(),
});

export const completeSessionSchema = z.object({
  outputs: z.record(z.unknown()).optional(),
});

export const sessionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional().default("started_at"),
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("DESC"),
  flowId: z.coerce.number().int().optional(),
  userId: z.string().uuid().optional(),
  status: z
    .enum(["pending", "running", "completed", "failed", "cancelled"])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CreateSessionRequest = z.infer<typeof createSessionSchema>;
export type SessionListQuery = z.infer<typeof sessionListQuerySchema>;
