import { NextFunction, Request, Response } from 'express';
import { BaseError } from '@server/utils/errors';
import { ResponseHelper } from '@server/helper/response.helper';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof BaseError) {
    return ResponseHelper.error(res, err);
  }

  return ResponseHelper.error(res, err);
};
