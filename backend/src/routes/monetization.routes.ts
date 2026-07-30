// =============================================================================
// Monetization & Newsletter Routes
// =============================================================================

import { Router } from "express";
import {
  getActiveAds,
  createAd,
  trackAdImpression,
  trackAdClick,
  deleteAd,
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers,
} from "../controllers/monetization.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/rbac.middleware";

export const monetizationRouter = Router();

// Ads Public
monetizationRouter.get("/ads", getActiveAds);
monetizationRouter.post("/ads/:id/impression", trackAdImpression);
monetizationRouter.post("/ads/:id/click", trackAdClick);

// Ads Admin
monetizationRouter.post("/ads", protect, requireAdmin, createAd);
monetizationRouter.delete("/ads/:id", protect, requireAdmin, deleteAd);

// Newsletter Public
monetizationRouter.post("/newsletter/subscribe", subscribeNewsletter);
monetizationRouter.post("/newsletter/unsubscribe", unsubscribeNewsletter);

// Newsletter Admin
monetizationRouter.get("/newsletter/subscribers", protect, requireAdmin, getNewsletterSubscribers);
