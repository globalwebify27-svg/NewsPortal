// =============================================================================
// Logo Settings API Route — Next.js App Router
// Handles logo URL, size, and margin via the SiteSetting key-value store
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const LOGO_KEYS = [
  "site_logo_url",
  "site_logo_size",
  "site_logo_margin",
  "header_bg_gif",
  "header_bg_height",
  "header_bg_size_fit",
  "header_bg_overlay_opacity",
  "sidebar_video_ad_url",
  "sidebar_video_ad_title",
  "sidebar_video_ad_target_link",
  "sidebar_video_ad_enabled",
  "sidebar_video_ads_list"
];

// GET /api/v1/logo-settings — returns all logo-related settings as a map
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: LOGO_KEYS } },
    });

    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    return NextResponse.json({ success: true, data: map });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch logo settings" },
      { status: 500 }
    );
  }
}

// POST /api/v1/logo-settings — upsert logo settings
// Body: { key: string; value: string } or { settings: { key, value }[] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const pairs: { key: string; value: string }[] = body.settings
      ? body.settings
      : [{ key: body.key, value: body.value }];

    for (const { key, value } of pairs) {
      if (!LOGO_KEYS.includes(key)) {
        return NextResponse.json(
          { success: false, message: `Key '${key}' is not a permitted logo setting.` },
          { status: 400 }
        );
      }
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), label: key, group: "branding" },
      });
    }

    return NextResponse.json({ success: true, message: "Logo settings saved." });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to save logo settings" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/logo-settings?key=site_logo_url — delete a logo setting
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key || !LOGO_KEYS.includes(key)) {
      return NextResponse.json(
        { success: false, message: "Valid key query param is required." },
        { status: 400 }
      );
    }

    await prisma.siteSetting.deleteMany({ where: { key } });

    return NextResponse.json({ success: true, message: `Setting '${key}' deleted.` });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to delete logo setting" },
      { status: 500 }
    );
  }
}
