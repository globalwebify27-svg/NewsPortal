import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getArticleBySlug, deleteArticleByIdOrSlug } from "@/lib/services/articles";

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

  return NextResponse.json({
    success: true,
    data: article,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  if (!slug) {
    return NextResponse.json({ success: false, message: "Slug/ID is required" }, { status: 400 });
  }

  const success = await deleteArticleByIdOrSlug(slug);

  if (success) {
    try {
      revalidatePath("/");
      revalidatePath("/latest");
    } catch (e) {}
  }

  return NextResponse.json({
    success,
    message: success ? "Article deleted successfully" : "Failed to delete article",
  });
}
