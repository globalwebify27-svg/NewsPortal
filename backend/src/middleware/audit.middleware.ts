// =============================================================================
// Security Audit Logger Middleware — Enterprise Action Tracking
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { logger } from "../config/logger";

export function auditLog(action: string, resource: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || null;
        const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
        const userAgent = req.headers["user-agent"] || "";

        prisma.auditLog
          .create({
            data: {
              userId,
              action,
              resource,
              resourceId: (req.params.id as string) || (req.params.articleId as string) || null,
              after: req.body ? JSON.parse(JSON.stringify(req.body)) : null,
              ipAddress,
              userAgent,
            },
          })
          .catch((err) => {
            logger.error("Failed to write audit log:", err);
          });
      }
    });

    next();
  };
}
