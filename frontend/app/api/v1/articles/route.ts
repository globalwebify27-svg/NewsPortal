import { NextRequest, NextResponse } from "next/server";
import { getPublicArticles, createOrUpdateArticle } from "@/lib/services/articles";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const search = searchParams.get("search") || undefined;

  const result = await getPublicArticles({ page, limit, category, tag, search });

  return NextResponse.json({
    success: true,
    data: result.articles,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit) || 1,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
