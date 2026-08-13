import { NextRequest, NextResponse } from "next/server";
import { getPublicArticles, getAllArticlesForAdmin, createOrUpdateArticle } from "@/lib/services/articles";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 50;
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const role = searchParams.get("role") || undefined;
  const authorId = searchParams.get("authorId") || undefined;
  const state = searchParams.get("state") || undefined;
  const district = searchParams.get("district") || undefined;
  const admin = searchParams.get("admin") === "true" || !!role || !!status;

  // Admin Request (queue, drafts, pending reviews, approvals, rejections)
  if (admin) {
    const result = await getAllArticlesForAdmin({ page, limit, category, tag, search, status, role, authorId });
    return NextResponse.json({
      success: true,
      data: result.articles,
      articles: result.articles,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit) || 1,
      },
    });
  }

  // Public Request (Strictly PUBLISHED articles only)
  const result = await getPublicArticles({ page, limit, category, tag, search, state, district });

  const response = NextResponse.json({
    success: true,
    data: result.articles,
    articles: result.articles,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit) || 1,
    },
  });

  // Optimized Server-Side & CDN Edge Cache (30s edge cache with 120s stale-while-revalidate)
  response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support bulk article list updates if passed as array or object with articles
    if (body?.articles && Array.isArray(body.articles)) {
      const saved = [];
      for (const art of body.articles) {
        const item = await createOrUpdateArticle({ ...art, userRole: body.userRole || art.userRole });
        if (item) saved.push(item);
      }
      return NextResponse.json({
        success: true,
        data: saved,
        message: "Articles batch saved successfully",
      });
    }

    if (!body || !body.title) {
      return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    }

    const created = await createOrUpdateArticle(body);
    if (!created) {
      return NextResponse.json({ success: false, message: "Failed to persist article" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: created,
      message: "Article saved to global database successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}
