// =============================================================================
// Logo Settings API Route — Next.js App Router
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/apiAuth";
import { getLogoSettings, saveLogoSettings, deleteLogoSetting } from "@/lib/services/settings";

// GET /api/v1/logo-settings — returns all logo-related settings as a map
export async function GET() {
  try {
    const data = await getLogoSettings();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch logo settings";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// POST /api/v1/logo-settings — upsert logo settings
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const pairs: { key: string; value: string }[] = body.settings
      ? body.settings
      : [{ key: body.key, value: body.value }];

    await saveLogoSettings(pairs);
    return NextResponse.json({ success: true, message: "Logo settings saved." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save logo settings";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// DELETE /api/v1/logo-settings?key=site_logo_url — delete a logo setting
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { success: false, message: "Valid key query param is required." },
        { status: 400 }
      );
    }

    const deleted = await deleteLogoSetting(key);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: `Key '${key}' is not a permitted logo setting.` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: `Setting '${key}' deleted.` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete logo setting";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
