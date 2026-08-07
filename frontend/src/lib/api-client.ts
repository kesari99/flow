import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginatedResult,
  PaginationMeta,
} from "@/schemas/chat-flow.schema";

export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiErrorResponse["errors"];

  constructor(status: number, errors: ApiErrorResponse["errors"]) {
    super(errors[0]?.message ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function parseResponse<T>(
  response: Response,
): Promise<ApiSuccessResponse<T>> {
  const body = (await response.json()) as
    | ApiSuccessResponse<T>
    | ApiErrorResponse;

  if (!response.ok || !("success" in body) || body.success !== true) {
    const errors =
      body && "errors" in body && Array.isArray(body.errors)
        ? body.errors
        : [{ message: `Request failed (${response.status})` }];
    throw new ApiError(response.status, errors);
  }

  return body;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await parseResponse<T>(response);
  return body.data;
}

export async function apiRequestPaginated<T>(
  path: string,
  init?: RequestInit,
): Promise<PaginatedResult<T>> {
  const response = await fetch(path, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = await parseResponse<T[]>(response);
  const pagination = (body.meta?.pagination ?? {
    page: 1,
    limit: Array.isArray(body.data) ? body.data.length : 0,
    totalItems: Array.isArray(body.data) ? body.data.length : 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }) as PaginationMeta;

  return {
    data: body.data,
    pagination,
  };
}
