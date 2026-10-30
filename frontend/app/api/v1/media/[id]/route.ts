// =============================================================================
// Media Delete API Route — Next.js App Router
// DELETE /api/v1/media/[id]
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireChiefOrAbove } from "@/lib/apiAuth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireChiefOrAbove(request);
  if (!auth.ok) return auth.response;

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
