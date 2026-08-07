import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { ResponseHelper } from "@server/helper/response.helper";
import { ValidationError, ValidationErrorDetail } from "@server/utils/errors";

function toValidationError(error: ZodError): ValidationError {
  const validationErrors: ValidationErrorDetail[] = error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
    value: "received" in err ? (err as { received?: unknown }).received : undefined,
  }));
  return new ValidationError(validationErrors);
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return ResponseHelper.error(res, toValidationError(error));
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return ResponseHelper.error(res, toValidationError(error));
      }
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return ResponseHelper.error(res, toValidationError(error));
      }
      next(error);
    }
  };
}
