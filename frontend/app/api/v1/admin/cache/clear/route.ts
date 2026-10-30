// =============================================================================
// Admin Fast Cache Revalidation API Route — Next.js App Router
// POST: Purges all in-memory server cache and revalidates Next.js ISR pages
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireChiefOrAbove } from "@/lib/apiAuth";
import { fastRevalidateEverything } from "@/lib/revalidation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireChiefOrAbove(request);
  if (!auth.ok) return auth.response;

  try {
    const result = fastRevalidateEverything();
    return NextResponse.json({
      success: true,
      message: "Website cache purged and all pages revalidated successfully!",
      timestamp: result.timestamp,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to purge and revalidate cache" },
      { status: 500 }
    );
  }
}
