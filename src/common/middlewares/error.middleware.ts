import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ResponseUtils } from '../utils';
import { HTTP_STATUS, MESSAGES } from '../constants';
import { env } from '../../config/env';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = MESSAGES.INTERNAL_ERROR;
  let errors: any = undefined;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = MESSAGES.VALIDATION_ERROR;
    errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = MESSAGES.VALIDATION_ERROR;
    errors = Object.values((error as any).errors).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));
  } else if (error.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId)
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid ID format';
  } else if ((error as any).code === 11000) {
    // Mongoose duplicate key error
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Duplicate field value';
    const field = Object.keys((error as any).keyValue)[0];
    errors = [{ field, message: `${field} already exists` }];
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  // Send error response
  res.status(statusCode).json(ResponseUtils.error(message, errors));
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json(
    ResponseUtils.error(`Route ${req.originalUrl} not found`)
  );
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};