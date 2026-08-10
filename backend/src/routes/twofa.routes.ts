// =============================================================================
// 2FA Express Routes
// =============================================================================

import { Router } from "express";
import {
  setup2FA,
  enable2FA,
  disable2FA,
  get2FAStatus,
} from "../controllers/twofa.controller";
import { protect } from "../middleware/auth.middleware";

export const twofaRouter = Router();

twofaRouter.use(protect);

twofaRouter.get("/status", get2FAStatus);
twofaRouter.post("/setup", setup2FA);
twofaRouter.post("/enable", enable2FA);
twofaRouter.post("/disable", disable2FA);
