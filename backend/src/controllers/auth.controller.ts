// =============================================================================
// Auth Controller — Register, Login, Logout, Refresh, OTP, Password Reset
// =============================================================================

import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/database";
import { redis } from "../config/redis";
import {
  generateTokenPair,
  verifyToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/jwt.utils";
import { sendSuccess, sendCreated } from "../utils/response.utils";
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../middleware/error.middleware";
import { sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail } from "../utils/email.utils";
import { generateOTP, storeOTP, verifyOTP } from "../utils/otp.utils";
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validations/auth.validation";

// ─── 1. Register User ─────────────────────────────────────────────────────────
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError("An account with this email address already exists.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Send OTP for email verification
    const otp = generateOTP();
    await storeOTP(user.email, otp);
    sendOTPEmail(user.email, otp, user.name).catch(() => {});

    // Generate tokens
    const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role });

    // Store session in DB
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    // Set cookies
    res.cookie("accessToken", tokens.accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", tokens.refreshToken, refreshTokenCookieOptions);

    sendCreated(
      res,
      { user, ...tokens },
      "Registration successful! Please check your email for the verification code."
    );
  } catch (error) {
    next(error);
  }
}

// ─── 2. Login User ────────────────────────────────────────────────────────────
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user || !user.password) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been deactivated. Please contact support.");
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role });

    // Create session record
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    // Set cookies
    res.cookie("accessToken", tokens.accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", tokens.refreshToken, refreshTokenCookieOptions);

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    };

    sendSuccess(res, { user: userObj, ...tokens }, "Logged in successfully!");
  } catch (error) {
    next(error);
  }
}

// ─── 3. Verify OTP ────────────────────────────────────────────────────────────
export async function verifyEmailOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = verifyOTPSchema.parse(req.body);

    const isValid = await verifyOTP(data.email.toLowerCase(), data.otp);
    if (!isValid) {
      throw new ValidationError("Invalid or expired verification code.");
    }

    const user = await prisma.user.update({
      where: { email: data.email.toLowerCase() },
      data: { isVerified: true },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });

    sendWelcomeEmail(user.email, user.name).catch(() => {});

    sendSuccess(res, { user }, "Email verified successfully!");
  } catch (error) {
    next(error);
  }
}

// ─── 4. Resend OTP ────────────────────────────────────────────────────────────
export async function resendEmailOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = resendOTPSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundError("User with this email does not exist.");
    }

    if (user.isVerified) {
      sendSuccess(res, null, "Email is already verified.");
      return;
    }

    const otp = generateOTP();
    await storeOTP(user.email, otp);
    await sendOTPEmail(user.email, otp, user.name);

    sendSuccess(res, null, "A new verification code has been sent to your email.");
  } catch (error) {
    next(error);
  }
}

// ─── 5. Refresh Access Token ──────────────────────────────────────────────────
export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rToken) {
      throw new UnauthorizedError("Refresh token is required.");
    }

    const decoded = verifyToken(rToken, "refresh");

    // Check if session exists and is not revoked
    const session = await prisma.session.findUnique({
      where: { refreshToken: rToken },
      include: { user: true },
    });

    if (!session || session.isRevoked || !session.user.isActive) {
      throw new UnauthorizedError("Session has expired or been revoked. Please log in again.");
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });

    res.cookie("accessToken", tokens.accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", tokens.refreshToken, refreshTokenCookieOptions);

    sendSuccess(res, tokens, "Token refreshed successfully.");
  } catch (error) {
    next(error);
  }
}

// ─── 6. Logout User ───────────────────────────────────────────────────────────
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (rToken) {
      await prisma.session.updateMany({
        where: { refreshToken: rToken },
        data: { isRevoked: true },
      });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    sendSuccess(res, null, "Logged out successfully.");
  } catch (error) {
    next(error);
  }
}

// ─── 7. Forgot Password ───────────────────────────────────────────────────────
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      // Store reset token in Redis for 1 hour
      await redis.setex(`password_reset:${hashedToken}`, 3600, user.id);

      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password.html?token=${resetToken}`;
      sendPasswordResetEmail(user.email, resetUrl, user.name).catch(() => {});
    }

    // Always send generic success response to prevent user enumeration
    sendSuccess(
      res,
      null,
      "If an account with that email exists, a password reset link has been sent."
    );
  } catch (error) {
    next(error);
  }
}

// ─── 8. Reset Password ────────────────────────────────────────────────────────
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = resetPasswordSchema.parse(req.body);

    const hashedToken = crypto.createHash("sha256").update(data.token).digest("hex");
    const userId = await redis.get(`password_reset:${hashedToken}`);

    if (!userId) {
      throw new ValidationError("Password reset token is invalid or has expired.");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate reset token
    await redis.del(`password_reset:${hashedToken}`);

    // Revoke all existing user sessions for security
    await prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    sendSuccess(res, null, "Password reset successfully. You can now log in with your new password.");
  } catch (error) {
    next(error);
  }
}

// ─── 9. Get Current User Profile (Me) ─────────────────────────────────────────
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        website: true,
        twitterHandle: true,
        isVerified: true,
        twoFAEnabled: true,
        createdAt: true,
      },
    });

    sendSuccess(res, { user }, "User profile retrieved.");
  } catch (error) {
    next(error);
  }
}

// ─── 10. Change Password ──────────────────────────────────────────────────────
export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const data = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.password) {
      throw new UnauthorizedError("User not found.");
    }

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new ValidationError("Current password is incorrect.");
    }

    const newHashedPassword = await bcrypt.hash(data.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHashedPassword },
    });

    sendSuccess(res, null, "Password changed successfully.");
  } catch (error) {
    next(error);
  }
}
