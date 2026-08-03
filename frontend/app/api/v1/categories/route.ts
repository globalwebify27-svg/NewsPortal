import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.warn("Failed fetching categories from DB:", error);
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}
