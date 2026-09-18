// =============================================================================
// City News Settings API Route — Next.js App Router
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/apiAuth";
import { getCityNewsSettings, saveCityNewsSettings } from "@/lib/services/settings";

// GET /api/v1/city-news-settings — returns all city news settings
export async function GET() {
  try {
    const data = await getCityNewsSettings();
    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch city news settings";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

// POST /api/v1/city-news-settings — upsert city news settings
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const pairs: { key: string; value: string }[] = body.settings
      ? body.settings
      : [{ key: body.key, value: body.value }];

    await saveCityNewsSettings(pairs);
    return NextResponse.json({ success: true, message: "City news settings saved successfully." });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save city news settings";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
