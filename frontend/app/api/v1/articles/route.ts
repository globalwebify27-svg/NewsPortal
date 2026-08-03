import { NextRequest, NextResponse } from "next/server";
import { getPublicArticles } from "@/lib/services/articles";

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
