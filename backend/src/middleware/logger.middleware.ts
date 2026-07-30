// =============================================================================
// Request Logger Middleware
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "http";

    logger.log(level, `${method} ${originalUrl} ${statusCode} ${duration}ms`, {
      ip: req.headers["x-forwarded-for"] || ip,
      userAgent: req.headers["user-agent"],
      userId: (req as Request & { user?: { id: string } }).user?.id,
    });
  });

  next();
}
