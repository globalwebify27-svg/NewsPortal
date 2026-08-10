// =============================================================================
// Audit Service — Enterprise Activity Logging
// =============================================================================

import { Request } from "express";
import { prisma } from "../config/database";

export interface LogAuditOptions {
  action: string;
  resource: string;
  resourceId?: string;
  before?: any;
  after?: any;
}

export async function logAudit(req: Request, options: LogAuditOptions): Promise<void> {
  try {
    const userId = req.user?.id || null;
    const ipAddress = req.ip || (req.headers["x-forwarded-for"] as string) || null;
    const userAgent = req.headers["user-agent"] || null;

    await prisma.auditLog.create({
      data: {
        userId,
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId || null,
        before: options.before ? JSON.parse(JSON.stringify(options.before)) : undefined,
        after: options.after ? JSON.parse(JSON.stringify(options.after)) : undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    console.error("⚠️ Audit log failed to write:", err);
  }
}
