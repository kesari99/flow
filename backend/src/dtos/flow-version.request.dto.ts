import { z } from "zod";

export const createVersionSchema = z.object({
  flowId: z.number().int().positive(),
  data: z.record(z.unknown()).optional(),
  inputs: z.record(z.unknown()).optional(),
  author: z.string().min(1),
  comment: z.string().max(1000).optional(),
});

export const versionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional().default("version_number"),
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("DESC"),
});

export type CreateVersionRequest = z.infer<typeof createVersionSchema>;
export type VersionListQuery = z.infer<typeof versionListQuerySchema>;
