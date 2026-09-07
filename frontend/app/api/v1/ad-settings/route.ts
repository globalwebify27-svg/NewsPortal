// =============================================================================
// Advertisement Settings API Route — Next.js App Router
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/apiAuth";
import { getAdSettings, saveAdSettings, deleteAdSetting } from "@/lib/services/settings";

// GET /api/v1/ad-settings — returns all ad settings as a key-value map
export async function GET() {
  try {
    const data = await getAdSettings();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch ad settings";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// POST /api/v1/ad-settings — upsert ad settings
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const pairs: { key: string; value: string }[] = body.settings
      ? body.settings
      : [{ key: body.key, value: body.value }];

    await saveAdSettings(pairs);
    return NextResponse.json({ success: true, message: "Advertisement settings saved." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save ad settings";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// DELETE /api/v1/ad-settings — reset settings
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    await deleteAdSetting(key);
    return NextResponse.json({ success: true, message: "Ad setting reset." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reset ad settings";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
