// =============================================================================
// GET /api/v1/admin/stats — Live Real Database Metrics for Editorial Console
// =============================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      totalArticles,
      publishedArticles,
      pendingArticles,
      draftArticles,
      viewsAggregate,
      totalCategories,
      totalUsers,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: ArticleStatus.PENDING_REVIEW } }),
      prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      prisma.article.aggregate({
        _sum: {
          views: true,
        },
      }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.user.count(),
    ]);

    const realTotalViews = viewsAggregate._sum.views || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalArticles,
        publishedArticles,
        pendingArticles,
        draftArticles,
        totalViews: realTotalViews,
        totalCategories: totalCategories || 0,
        totalUsers: totalUsers || 0,
      },
    });
  } catch (error: any) {
    console.error("[admin/stats] Error aggregating live database stats:", error);
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
