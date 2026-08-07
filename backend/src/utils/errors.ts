export abstract class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: unknown;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    details: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }

  abstract serializeErrors(): {
    message: string;
    field?: string;
    details?: unknown;
  }[];
}

export class NotFoundError extends BaseError {
  constructor(
    resource: string,
    identifier: string | number,
    details?: string,
  ) {
    super(`${resource} with id '${identifier}' not found`, 404, true, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
  serializeErrors() {
    return [{ message: this.message, details: this.details }];
  }
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

export class ValidationError extends BaseError {
  public readonly errors: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[]) {
    super("Validation failed", 400, true, errors);
    Object.setPrototypeOf(this, ValidationError.prototype);
    this.errors = errors;
  }

  serializeErrors() {
    return this.errors.map((err) => ({
      message: err.message,
      field: err.field,
      details: err.value,
    }));
  }
}

export class ConflictError extends BaseError {
  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} '${value}' already exists`, 409, true, {
      field,
      value,
    });
    Object.setPrototypeOf(this, ConflictError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, details: this.details }];
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401, true, undefined);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = "Forbidden access") {
    super(message, 403, true, undefined);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class BusinessRuleError extends BaseError {
  constructor(message: string, details?: unknown) {
    super(message, 422, true, details);
    Object.setPrototypeOf(this, BusinessRuleError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message, details: this.details }];
  }
}
