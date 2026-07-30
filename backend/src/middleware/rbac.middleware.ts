// =============================================================================
// RBAC Middleware — Role-Based Access Control
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "./error.middleware";

// ─── Role Hierarchy (higher number = more permissions) ───────────────────────
const ROLE_LEVELS: Record<Role, number> = {
  [Role.READER]: 0,
  [Role.AUTHOR]: 1,
  [Role.REPORTER]: 2,
  [Role.EDITOR]: 3,
  [Role.PUBLISHER]: 4,
  [Role.ADMIN]: 5,
  [Role.SUPERADMIN]: 6,
};

// ─── Require specific roles ───────────────────────────────────────────────────
export function requireRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required."));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new ForbiddenError(
          `Access denied. Required roles: ${roles.join(", ")}. Your role: ${req.user.role}`
        )
      );
      return;
    }
    next();
  };
}

// ─── Require minimum role level ───────────────────────────────────────────────
export function requireMinRole(minRole: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required."));
      return;
    }

    const userLevel = ROLE_LEVELS[req.user.role];
    const requiredLevel = ROLE_LEVELS[minRole];

    if (userLevel < requiredLevel) {
      next(
        new ForbiddenError(
          `Access denied. Minimum required role: ${minRole}. Your role: ${req.user.role}`
        )
      );
      return;
    }
    next();
  };
}

// ─── Shorthand Role Guards ────────────────────────────────────────────────────
export const requireSuperAdmin = requireRoles(Role.SUPERADMIN);
export const requireAdmin = requireMinRole(Role.ADMIN);
export const requirePublisher = requireMinRole(Role.PUBLISHER);
export const requireEditor = requireMinRole(Role.EDITOR);
export const requireReporter = requireMinRole(Role.REPORTER);
export const requireAuthor = requireMinRole(Role.AUTHOR);
