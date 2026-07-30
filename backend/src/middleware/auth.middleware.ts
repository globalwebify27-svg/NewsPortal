// =============================================================================
// Auth Middleware — JWT Verification & User Hydration
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";
import { prisma } from "../config/database";
import { UnauthorizedError } from "./error.middleware";
import { Role } from "@prisma/client";

// ─── Extend Express Request ───────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: Role;
        isVerified: boolean;
        isActive: boolean;
      };
    }
  }
}

// ─── Protect Route — Requires Valid JWT ──────────────────────────────────────
export async function protect(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // Extract from Authorization header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Or from httpOnly cookie
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken as string;
    }

    if (!token) {
      throw new UnauthorizedError("No authentication token provided.");
    }

    // Verify token
    const decoded = verifyToken(token, "access");

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, isVerified: true, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedError("User not found. Please log in again.");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been deactivated.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

// ─── Optional Auth — Hydrates user if token present, continues regardless ────
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken as string;
    }

    if (token) {
      const decoded = verifyToken(token, "access");
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true, isVerified: true, isActive: true },
      });
      if (user?.isActive) req.user = user;
    }
  } catch {
    // silently fail — optional auth should not break the request
  }
  next();
}

// ─── Verified Email Required ──────────────────────────────────────────────────
export function requireVerified(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.isVerified) {
    next(new UnauthorizedError("Please verify your email address to continue."));
    return;
  }
  next();
}
