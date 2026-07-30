// =============================================================================
// Monetization & Communication Controller — Ads & Newsletter
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { AdZone, AdType } from "@prisma/client";
import { prisma } from "../config/database";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.utils";
import { NotFoundError, ValidationError, ConflictError } from "../middleware/error.middleware";

// =============================================================================
// 1. ADVERTISEMENT MANAGEMENT & TRACKING
// =============================================================================

export async function getActiveAds(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const zone = req.query.zone as AdZone | undefined;

    const where: any = { isActive: true };
    if (zone) where.zone = zone;

    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, ads);
  } catch (error) {
    next(error);
  }
}

export async function createAd(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, zone, type, imageUrl, targetUrl, htmlCode, startDate, endDate } = req.body;

    if (!name || !zone) {
      throw new ValidationError("Ad name and target zone are required.");
    }

    const ad = await prisma.advertisement.create({
      data: {
        name,
        zone: zone as AdZone,
        type: (type as AdType) || AdType.IMAGE_BANNER,
        imageUrl,
        targetUrl,
        htmlCode,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    sendCreated(res, ad, "Ad campaign created.");
  } catch (error) {
    next(error);
  }
}

export async function trackAdImpression(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.advertisement.update({
      where: { id },
      data: { impressions: { increment: 1 } },
    });
    sendSuccess(res, null, "Impression recorded");
  } catch (error) {
    next(error);
  }
}

export async function trackAdClick(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.advertisement.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
    sendSuccess(res, null, "Click recorded");
  } catch (error) {
    next(error);
  }
}

export async function deleteAd(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.advertisement.delete({ where: { id } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// 2. NEWSLETTER SUBSCRIPTION ENGINE
// =============================================================================

export async function subscribeNewsletter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, name, source } = req.body;

    if (!email || !email.includes("@")) {
      throw new ValidationError("Valid email address is required.");
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.isActive) {
        sendSuccess(res, existing, "You are already subscribed to Global Awaaz!");
        return;
      }
      // Re-activate
      const reactivated = await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { isActive: true, unsubscribedAt: null },
      });
      sendSuccess(res, reactivated, "Welcome back! Subscription reactivated.");
      return;
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        name,
        source: source || "homepage",
      },
    });

    sendCreated(res, subscriber, "Thank you for subscribing to Global Awaaz!");
  } catch (error) {
    next(error);
  }
}

export async function unsubscribeNewsletter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email?.toLowerCase() },
    });

    if (!subscriber) throw new NotFoundError("Subscription not found.");

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false, unsubscribedAt: new Date() },
    });

    sendSuccess(res, null, "You have been unsubscribed from the newsletter.");
  } catch (error) {
    next(error);
  }
}

export async function getNewsletterSubscribers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
    });
    sendSuccess(res, subscribers);
  } catch (error) {
    next(error);
  }
}
