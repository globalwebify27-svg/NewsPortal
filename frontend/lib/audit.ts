// =============================================================================
// Security Audit Logger — Global Awaaz NewsPortal
// Records security-critical events directly into MySQL (audit_logs table).
// STRICT SECURITY RULE: Passwords, tokens, and MFA secrets are never logged.
// =============================================================================

import { prisma } from "./prisma";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGIN_LOCKED"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "PASSWORD_RESET_REQUEST"
  | "USER_CREATE"
  | "USER_UPDATE"
  | "USER_DELETE"
  | "USER_STATUS_CHANGE"
  | "ROLE_CHANGE"
  | "PERMISSION_UPDATE"
  | "MFA_ENABLE"
  | "MFA_DISABLE";

export interface LogAuditParams {
  userId?: string | null;
  action: AuditAction;
  resource?: string;
  resourceId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Sanitize an object to ensure sensitive keys are never persisted in logs */
function sanitizeAuditData(data?: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;

  const SENSITIVE_KEYS = new Set([
    "password",
    "plainPassword",
    "token",
    "refreshToken",
    "twoFASecret",
    "secret",
    "jwt",
  ]);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Log a security event to MySQL audit_logs.
 * Non-blocking: will not crash caller if audit logging encounters a transient error.
 */
export async function logAuditEvent(params: LogAuditParams): Promise<void> {
  try {
    const cleanBefore = sanitizeAuditData(params.before);
    const cleanAfter = sanitizeAuditData(params.after);

    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        resource: params.resource || "AUTH",
        resourceId: params.resourceId || null,
        before: (cleanBefore as any) ?? undefined,
        after: (cleanAfter as any) ?? undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    // Audit failures should be visible in server logs but never interrupt user request flow
    console.error("[audit_log] Failed to write audit event:", error);
  }
}
