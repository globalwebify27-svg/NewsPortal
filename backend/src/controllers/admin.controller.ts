// =============================================================================
// Admin Controller — Dashboard Metrics, Breaking News, Site Settings & Audit Logs
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { ArticleStatus, Role } from "@prisma/client";
import { prisma } from "../config/database";
import { cache, cacheKeys } from "../config/redis";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.utils";
import { getPaginationParams } from "../utils/response.utils";
import { NotFoundError } from "../middleware/error.middleware";

// ─── 1. Dashboard Overview Metrics ───────────────────────────────────────────
export async function getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      reviewArticles,
      totalViews,
      totalUsers,
      totalComments,
      totalCategories,
      recentArticles,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      prisma.article.count({ where: { status: ArticleStatus.REVIEW } }),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.category.count(),
      prisma.article.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { name: true } },
        },
      }),
    ]);

    const stats = {
      overview: {
        totalArticles,
        publishedArticles,
        draftArticles,
        reviewArticles,
        totalViews: totalViews._sum.views || 0,
        totalUsers,
        totalComments,
        totalCategories,
      },
      recentArticles,
    };

    sendSuccess(res, stats, "Dashboard statistics retrieved successfully.");
  } catch (error) {
    next(error);
  }
}

// ─── 2. Breaking News Ticker Management ──────────────────────────────────────
export async function getBreakingNews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await prisma.breakingNews.findMany({
      orderBy: { priority: "asc" },
    });
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
}

export async function createBreakingNews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { text, textHi, link, priority, isActive, expiresAt } = req.body;

    const item = await prisma.breakingNews.create({
      data: {
        text,
        textHi,
        link,
        priority: Number(priority) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await cache.del(cacheKeys.breakingNews());

    sendCreated(res, item, "Breaking news item created.");
  } catch (error) {
    next(error);
  }
}

export async function updateBreakingNews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { text, textHi, link, priority, isActive, expiresAt } = req.body;

    const item = await prisma.breakingNews.update({
      where: { id },
      data: {
        ...(text !== undefined && { text }),
        ...(textHi !== undefined && { textHi }),
        ...(link !== undefined && { link }),
        ...(priority !== undefined && { priority: Number(priority) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });

    await cache.del(cacheKeys.breakingNews());

    sendSuccess(res, item, "Breaking news item updated.");
  } catch (error) {
    next(error);
  }
}

export async function deleteBreakingNews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.breakingNews.delete({ where: { id } });
    await cache.del(cacheKeys.breakingNews());
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

// ─── 3. Site Settings Management ─────────────────────────────────────────────
export async function getSiteSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { group: "asc" },
    });
    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
}

export async function updateSiteSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key, value } = req.body;

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    await cache.del(cacheKeys.siteSettings());

    sendSuccess(res, setting, "Setting updated.");
  } catch (error) {
    next(error);
  }
}

// ─── 4. User Management (Admin View) ─────────────────────────────────────────
export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const role = req.query.role as Role | undefined;

    const where: any = {};
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          _count: { select: { authoredArticles: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    sendSuccess(res, { users, total, page, limit });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role: role as Role }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    sendSuccess(res, user, "User role / status updated.");
  } catch (error) {
    next(error);
  }
}

// ─── 6. Real-Time System Telemetry & Vitals ────────────────────────────────────
export async function getSystemVitals(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const memory = process.memoryUsage();
    const uptime = process.uptime();

    const startDb = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startDb;

    const vitals = {
      status: "HEALTHY",
      uptimeSeconds: Math.floor(uptime),
      memoryUsageMB: {
        rss: (memory.rss / (1024 * 1024)).toFixed(2),
        heapUsed: (memory.heapUsed / (1024 * 1024)).toFixed(2),
        heapTotal: (memory.heapTotal / (1024 * 1024)).toFixed(2),
      },
      dbLatencyMs,
      redisConnected: true,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    };

    sendSuccess(res, vitals, "System telemetry retrieved.");
  } catch (error) {
    next(error);
  }
}

// ─── 7. System Audit Logs ─────────────────────────────────────────────────────
export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.auditLog.count(),
    ]);

    sendSuccess(res, { logs, total, page, limit });
  } catch (error) {
    next(error);
  }
}
