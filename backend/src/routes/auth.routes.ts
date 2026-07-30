// =============================================================================
// Auth Routes — Public & Protected Authentication Endpoints
// =============================================================================

import { Router } from "express";
import {
  register,
  login,
  verifyEmailOTP,
  resendEmailOTP,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimit.middleware";

export const authRouter = Router();

// ─── Public Routes (Rate Limited) ─────────────────────────────────────────────
authRouter.post("/register", authRateLimiter, register);
authRouter.post("/login", authRateLimiter, login);
authRouter.post("/verify-otp", authRateLimiter, verifyEmailOTP);
authRouter.post("/resend-otp", authRateLimiter, resendEmailOTP);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", authRateLimiter, forgotPassword);
authRouter.post("/reset-password", authRateLimiter, resetPassword);

// ─── Protected Routes (Requires Bearer Token or Cookie) ────────────────────────
authRouter.use(protect);

authRouter.get("/me", getMe);
authRouter.post("/change-password", changePassword);
