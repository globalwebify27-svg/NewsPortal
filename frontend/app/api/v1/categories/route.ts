import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/apiAuth";
import { serverCache, TTL } from "@/lib/cache";

export const dynamic = "force-dynamic";

const CACHE_KEY_CATEGORIES = "categories:active";

// GET /api/v1/categories -> Fetch active categories from MySQL DB
export async function GET() {
  const cached = serverCache.get(CACHE_KEY_CATEGORIES);
  if (cached) {
    return NextResponse.json({ success: true, data: cached });
  }

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        nameHi: true,
        slug: true,
        color: true,
        icon: true,
        description: true,
        descHi: true,
      },
    });

    serverCache.set(CACHE_KEY_CATEGORIES, categories, TTL.CATEGORIES);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.warn("Failed fetching categories from DB:", error);
    const fallback = serverCache.getStale<any[]>(CACHE_KEY_CATEGORIES);
    if (fallback) {
      return NextResponse.json({ success: true, data: fallback });
    }
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}

// POST /api/v1/categories -> Create or Update Category in MySQL DB
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { id, name, nameHi, slug, color, icon, description, order } = body;

    if (!name) {
      return NextResponse.json({ success: false, message: "Category name is required" }, { status: 400 });
    }

    const cleanSlug = (slug || name).toLowerCase().trim().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const cat = await prisma.category.upsert({
      where: id ? { id } : { slug: cleanSlug },
      update: {
        name: name.trim(),
        nameHi: nameHi || null,
        slug: cleanSlug,
        color: color || "#e50914",
        icon: icon || null,
        description: description || null,
        order: Number(order) || 0,
        isActive: true,
      },
      create: {
        id: id || undefined,
        name: name.trim(),
        nameHi: nameHi || null,
        slug: cleanSlug,
        color: color || "#e50914",
        icon: icon || null,
        description: description || null,
        order: Number(order) || 0,
        isActive: true,
      },
    });

    serverCache.delete(CACHE_KEY_CATEGORIES);

    return NextResponse.json({
      success: true,
      data: cat,
      message: `Category '${cat.name}' saved successfully in MySQL DB`,
    });
  } catch (error: any) {
    console.error("Failed saving category to DB:", error);
    return NextResponse.json({ success: false, message: error?.message || "Database error" }, { status: 500 });
  }
}

// DELETE /api/v1/categories?id=... -> Delete category from MySQL DB
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Category ID is required" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });
    serverCache.delete(CACHE_KEY_CATEGORIES);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully from MySQL DB",
    });
  } catch (error: any) {
    console.error("Failed deleting category from DB:", error);
    return NextResponse.json({ success: false, message: error?.message || "Database error" }, { status: 500 });
  }
}
