// =============================================================================
// 2FA Security Controller
// =============================================================================

import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { sendSuccess } from "../utils/response.utils";
import { UnauthorizedError, BadRequestError } from "../middleware/error.middleware";
import { generate2FASecret, verify2FAToken } from "../services/twofa.service";
import { logAudit } from "../services/audit.service";

export async function setup2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required.");

    const data = await generate2FASecret(req.user.email);

    // Temporarily stash secret in user record until verified
    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFASecret: data.secret },
    });

    sendSuccess(res, {
      qrCodeUrl: data.qrCodeUrl,
      secret: data.secret,
      backupCodes: data.backupCodes,
    }, "2FA setup initiated. Scan QR code and enter verification token.");
  } catch (error) {
    next(error);
  }
}

export async function enable2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required.");
    const { token, backupCodes } = req.body;

    if (!token) throw new BadRequestError("Verification token is required.");

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { twoFASecret: true, email: true },
    });

    if (!user?.twoFASecret) {
      throw new BadRequestError("2FA has not been initiated. Call setup first.");
    }

    const isValid = verify2FAToken(user.twoFASecret, token);
    if (!isValid) {
      throw new BadRequestError("Invalid 2FA code. Please check your authenticator app.");
    }

    // Save backup codes and mark 2FA enabled
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFAEnabled: true,
        twoFAVerifiedAt: new Date(),
        twoFABackupCodes: backupCodes ? JSON.stringify(backupCodes) : null,
      },
    });

    await logAudit(req, {
      action: "ENABLE_2FA",
      resource: "users",
      resourceId: req.user.id,
    });

    sendSuccess(res, { twoFAEnabled: true }, "2FA authentication successfully enabled!");
  } catch (error) {
    next(error);
  }
}

export async function disable2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required.");
    const { password } = req.body;

    if (!password) throw new BadRequestError("Password verification required to disable 2FA.");

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true },
    });

    if (!user?.password) throw new BadRequestError("Password not set.");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new BadRequestError("Incorrect password.");

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        twoFAEnabled: false,
        twoFASecret: null,
        twoFABackupCodes: null,
        twoFAVerifiedAt: null,
      },
    });

    await logAudit(req, {
      action: "DISABLE_2FA",
      resource: "users",
      resourceId: req.user.id,
    });

    sendSuccess(res, { twoFAEnabled: false }, "2FA authentication has been disabled.");
  } catch (error) {
    next(error);
  }
}

export async function get2FAStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required.");

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { twoFAEnabled: true, twoFAVerifiedAt: true },
    });

    sendSuccess(res, {
      twoFAEnabled: user?.twoFAEnabled || false,
      twoFAVerifiedAt: user?.twoFAVerifiedAt,
    });
  } catch (error) {
    next(error);
  }
}
