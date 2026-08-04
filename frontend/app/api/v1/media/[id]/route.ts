// =============================================================================
// Media Delete API Route — Next.js App Router
// DELETE /api/v1/media/[id]
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ success: false, message: "Media not found" }, { status: 404 });
    }

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Media deleted." });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to delete media" },
      { status: 500 }
    );
  }
}
