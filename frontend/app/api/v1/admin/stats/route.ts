// =============================================================================
// GET /api/v1/admin/stats — Live Real Database Metrics for Editorial Console
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { requireAdminAuth } from "@/lib/apiAuth";
import { serverCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

const CACHE_KEY_STATS = "admin:stats:summary";

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  const cached = serverCache.get<any>(CACHE_KEY_STATS);
  if (cached) {
    return NextResponse.json({ success: true, data: cached });
  }

  try {
    // Consolidated 3 queries instead of 7 individual round-trips
    const [
      statusGroups,
      viewsAggregate,
      totalCategories,
      totalUsers,
    ] = await Promise.all([
      prisma.article.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.article.aggregate({
        _sum: {
          views: true,
        },
      }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.user.count(),
    ]);

    let totalArticles = 0;
    let publishedArticles = 0;
    let pendingArticles = 0;
    let draftArticles = 0;

    for (const group of statusGroups) {
      const count = group._count.id;
      totalArticles += count;
      if (group.status === ArticleStatus.PUBLISHED) publishedArticles = count;
      else if (group.status === ArticleStatus.PENDING_REVIEW) pendingArticles = count;
      else if (group.status === ArticleStatus.DRAFT) draftArticles = count;
    }

    const realTotalViews = viewsAggregate._sum.views || 0;

    const statsData = {
      totalArticles,
      publishedArticles,
      pendingArticles,
      draftArticles,
      totalViews: realTotalViews,
      totalCategories: totalCategories || 0,
      totalUsers: totalUsers || 0,
    };

    serverCache.set(CACHE_KEY_STATS, statsData, 20_000); // 20s TTL

    return NextResponse.json({
      success: true,
      data: statsData,
    });
  } catch (error: any) {
    console.error("[admin/stats] Error aggregating live database stats:", error);
    const stale = serverCache.getStale<any>(CACHE_KEY_STATS);
    if (stale) {
      return NextResponse.json({ success: true, data: stale });
    }
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load admin stats",
        data: {
          totalArticles: 0,
          publishedArticles: 0,
          pendingArticles: 0,
          draftArticles: 0,
          totalViews: 0,
          totalCategories: 0,
          totalUsers: 0,
        },
      },
      { status: 500 }
    );
  }
}
