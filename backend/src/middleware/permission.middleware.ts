// =============================================================================
// Database-Driven Permission Middleware
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "./error.middleware";
import { prisma } from "../config/database";

/**
 * Fetch permissions list for a user from database / role link
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      roleId: true,
      customRole: {
        select: {
          slug: true,
          permissions: {
            select: {
              permission: { select: { slug: true } },
            },
          },
        },
      },
    },
  });

  if (!user) return [];

  // SuperAdmin gets all permissions wildcard
  if (user.role === "SUPERADMIN" || user.customRole?.slug === "super_admin") {
    return ["*"];
  }

  // If user is linked to customRole
  if (user.customRole?.permissions) {
    return user.customRole.permissions.map((p) => p.permission.slug);
  }

  // Fallback to role enum mapped permissions if roleId is not set
  if (user.role === "ADMIN") {
    return ["*"];
  }

  if (user.role === "PUBLISHER" || user.role === "EDITOR") {
    return [
      "articles:view", "articles:create", "articles:edit_own", "articles:edit_any",
      "articles:delete", "articles:publish", "articles:approve", "articles:reject",
      "articles:schedule", "articles:restore", "categories:manage", "tags:manage",
      "media:manage", "comments:manage"
    ];
  }

  if (user.role === "REPORTER" || user.role === "AUTHOR") {
    return ["articles:view", "articles:create", "articles:edit_own", "media:manage"];
  }

  return [];
}

/**
 * Middleware enforcing that the logged-in user possesses required permissions
 */
export function requirePermission(...requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required.");
      }

      const userPerms = await getUserPermissions(req.user.id);

      // SuperAdmin bypass
      if (userPerms.includes("*")) {
        return next();
      }

      const hasAll = requiredPermissions.every((perm) => userPerms.includes(perm));

      if (!hasAll) {
        throw new ForbiddenError(
          `Access denied. Required permission(s): ${requiredPermissions.join(", ")}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check permission with ownership context (e.g. author editing own draft)
 */
export function requireOwnershipOrPermission(
  permAny: string,
  permOwn: string,
  getOwnerIdFromReq: (req: Request) => Promise<string | null> | string | null
) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required.");
      }

      const userPerms = await getUserPermissions(req.user.id);

      if (userPerms.includes("*") || userPerms.includes(permAny)) {
        return next();
      }

      if (userPerms.includes(permOwn)) {
        const ownerId = await getOwnerIdFromReq(req);
        if (ownerId && ownerId === req.user.id) {
          return next();
        }
      }

      throw new ForbiddenError("Access denied. You do not have permission to modify this resource.");
    } catch (error) {
      next(error);
    }
  };
}
