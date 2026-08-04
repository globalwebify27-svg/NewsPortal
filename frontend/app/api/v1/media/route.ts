// =============================================================================
// Media Library API Route — Next.js App Router
// GET: fetch all uploaded media from DB
// =============================================================================

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        altText: true,
        size: true,
        createdAt: true,
        mimeType: true,
      },
    });

    return NextResponse.json({ success: true, data: media });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch media" },
      { status: 500 }
    );
  }
}
