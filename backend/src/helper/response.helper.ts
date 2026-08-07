import { BaseError } from "@server/utils/errors";
import { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { message: string; field?: string; details?: unknown }[];
  meta?: Record<string, unknown>;
}

export class ResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200,
    meta?: Record<string, unknown>,
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      meta,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): Response {
    return this.success(
      res,
      data,
      message || "Resource created successfully",
      201,
    );
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(res: Response, error: Error | BaseError): Response {
    if (error instanceof BaseError) {
      const response: ApiResponse<null> = {
        success: false,
        errors: error.serializeErrors(),
      };
      return res.status(error.statusCode).json(response);
    }

    // Handle unexpected errors
    const response: ApiResponse<null> = {
      success: false,
      errors: [{ message: "An unexpected error occurred" }],
    };

    return res.status(500).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    },
    message?: string,
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      meta: { pagination },
    };
    return res.status(200).json(response);
  }
}
