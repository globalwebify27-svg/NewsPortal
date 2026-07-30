// =============================================================================
// Analytics Routes — Real-time Heartbeats & Admin Reporting APIs
// =============================================================================

import { Router } from "express";
import {
  trackHeartbeat,
  getRealtimeUsers,
  getArticleLeaderboard,
  getCategoryTraffic,
  getTrafficTrends,
} from "../controllers/analytics.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/rbac.middleware";

export const analyticsRouter = Router();

// Public heartbeat endpoint
analyticsRouter.post("/heartbeat", trackHeartbeat);

// Admin-protected reporting endpoints
analyticsRouter.use(protect, requireAdmin);

analyticsRouter.get("/realtime", getRealtimeUsers);
analyticsRouter.get("/leaderboard", getArticleLeaderboard);
analyticsRouter.get("/categories", getCategoryTraffic);
analyticsRouter.get("/trends", getTrafficTrends);
