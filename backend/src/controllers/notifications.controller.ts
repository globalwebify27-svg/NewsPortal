// =============================================================================
// Notifications Controller — In-App & Web Push Notification Center
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { io } from "../app";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.utils";
import { NotFoundError, UnauthorizedError, ValidationError } from "../middleware/error.middleware";
import { getPaginationParams } from "../utils/response.utils";

// ─── 1. Get User Inbox Notifications ───────────────────────────────────────────
export async function getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { page, limit, skip } = getPaginationParams(req.query);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);

    sendSuccess(res, { notifications, total, unreadCount, page, limit });
  } catch (error) {
    next(error);
  }
}

// ─── 2. Mark Notification as Read ─────────────────────────────────────────────
export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const id = req.params.id as string;

    const notif = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    sendSuccess(res, notif, "Notification marked as read.");
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    sendSuccess(res, null, "All notifications marked as read.");
  } catch (error) {
    next(error);
  }
}

// ─── 3. Broadcast Web Push Notification (Admin) ───────────────────────────────
export async function sendBroadcastNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, message, link, type } = req.body;

    if (!title || !message) {
      throw new ValidationError("Notification title and message are required.");
    }

    const payload = {
      type: type || "BREAKING_NEWS",
      title,
      message,
      link: link || "/",
      timestamp: new Date().toISOString(),
    };

    // Broadcast real-time push notification over WebSockets to all connected clients
    io.emit("notification:push", payload);

    sendSuccess(res, payload, "Live push notification broadcasted to all active readers!");
  } catch (error) {
    next(error);
  }
}
