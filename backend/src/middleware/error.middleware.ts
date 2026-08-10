// =============================================================================
// Error Handling Middleware — Global 404 & Error Handler
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { ZodError } from "zod";

// ─── Custom Error Class ───────────────────────────────────────────────────────
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized. Please log in.") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "You do not have permission to perform this action.") {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  errors?: Record<string, string[]>;
  constructor(message: string = "Validation failed", errors?: Record<string, string[]>) {
    super(message, 422);
    this.errors = errors;
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists.") {
    super(message, 409);
  }
}

// ─── 404 Handler ─────────────────────────────────────────────────────────────
export function notFound(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Zod validation error
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const field = e.path.join(".");
      fieldErrors[field] = fieldErrors[field] || [];
      fieldErrors[field].push(e.message);
    });
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: fieldErrors,
      statusCode: 422,
    });
    return;
  }

  // Prisma unique constraint
  if ((err as unknown as Record<string, unknown>).code === "P2002") {
    res.status(409).json({
      success: false,
      message: "A record with this data already exists.",
      statusCode: 409,
    });
    return;
  }

  // Prisma not found
  if ((err as unknown as Record<string, unknown>).code === "P2025") {
    res.status(404).json({
      success: false,
      message: "Record not found.",
      statusCode: 404,
    });
    return;
  }

  // Operational errors (AppError)
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`[AppError] ${err.message}`, { stack: err.stack });
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      ...(err instanceof ValidationError && err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ success: false, message: "Invalid token.", statusCode: 401 });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({ success: false, message: "Token expired.", statusCode: 401 });
    return;
  }

  // Unknown / unhandled errors
  logger.error(`[UnhandledError] ${err.message}`, { stack: err.stack });

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred. Please try again."
        : err.message,
    statusCode: 500,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
}
