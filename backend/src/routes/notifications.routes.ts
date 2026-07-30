// =============================================================================
// Notification Routes — User Inbox & Admin Push Broadcast
// =============================================================================

import { Router } from "express";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  sendBroadcastNotification,
} from "../controllers/notifications.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/rbac.middleware";

export const notificationsRouter = Router();

notificationsRouter.use(protect);

notificationsRouter.get("/", getUserNotifications);
notificationsRouter.patch("/:id/read", markAsRead);
notificationsRouter.post("/read-all", markAllAsRead);

// Admin Broadcast Push
notificationsRouter.post("/broadcast", requireAdmin, sendBroadcastNotification);
