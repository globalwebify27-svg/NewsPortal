import { NextRequest, NextResponse } from "next/server";
import { getArticleBySlug, deleteArticleByIdOrSlug } from "@/lib/services/articles";
import { fastRevalidateAfterArticle } from "@/lib/revalidation";
import { requireChiefOrAbove } from "@/lib/apiAuth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  if (!slug) {
    return NextResponse.json({ success: false, message: "Slug is required" }, { status: 400 });
  }

  const article = await getArticleBySlug(slug);

  if (!article) {
    return NextResponse.json({ success: false, message: "Article not found" }, { status: 404 });
  }

  const response = NextResponse.json({
    success: true,
    data: article,
  });

  // 5m edge cache + 24h stale-while-revalidate to absorb repeat views & social crawlers
  response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  return response;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const auth = await requireChiefOrAbove(request);
  if (!auth.ok) return auth.response;

  const { slug } = params;
  if (!slug) {
    return NextResponse.json({ success: false, message: "Slug/ID is required" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || undefined;

  const success = await deleteArticleByIdOrSlug(slug, id);

  if (success) {
    fastRevalidateAfterArticle({ slug });
  }

  return NextResponse.json({
    success,
    message: success ? "Article deleted successfully" : "Failed to delete article",
  });
}
