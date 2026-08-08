// =============================================================================
// Advertisement Settings API Route — Next.js App Router
// Handles sticky ad & leaderboard banner configuration via SiteSetting database model
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const AD_KEYS = [
  // Sticky Banner Keys
  "ad_sticky_enabled",
  "ad_sticky_text",
  "ad_sticky_link",
  "ad_sticky_image",
  "ad_sticky_bg",
  "ad_sticky_badge",
  // Leaderboard Banner Keys
  "ad_leaderboard_enabled",
  "ad_leaderboard_image",
  "ad_leaderboard_title",
  "ad_leaderboard_subtitle",
  "ad_leaderboard_link",
  "ad_leaderboard_btn_text",
  "ad_leaderboard_badge",
  "ad_leaderboard_height",
  // Left Sidebar Top News Grid Banner Keys
  "ad_left_grid_enabled",
  "ad_left_grid_image",
  "ad_left_grid_title",
  "ad_left_grid_subtitle",
  "ad_left_grid_link",
  "ad_left_grid_btn_text",
  "ad_left_grid_badge"
];

// GET /api/v1/ad-settings — returns all ad settings as a key-value map
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: AD_KEYS } },
    });

    const map: Record<string, string> = {
      ad_sticky_enabled: "true",
      ad_sticky_text: "📢 SPECIAL ANNOUNCEMENT: Reach Millions of Readers with Global Awaaz Digital Sponsorships!",
      ad_sticky_link: "/advertise",
      ad_sticky_image: "",
      ad_sticky_bg: "#000000",
      ad_sticky_badge: "SPONSORED",
      ad_leaderboard_enabled: "true",
      ad_leaderboard_image: "",
      ad_leaderboard_title: "GLOBAL AWAAZ DIGITAL MEDIA COVERAGE",
      ad_leaderboard_subtitle: "Get real-time news updates across Bihar, Jharkhand & National headlines 24/7",
      ad_leaderboard_link: "/advertise",
      ad_leaderboard_btn_text: "Advertise With Us",
      ad_leaderboard_badge: "ADVERTISEMENT",
      ad_leaderboard_height: "110",
      ad_left_grid_enabled: "true",
      ad_left_grid_image: "",
      ad_left_grid_title: "GLOBAL AWAAZ SPONSORSHIP",
      ad_left_grid_subtitle: "Promote your brand to millions of readers across Bihar, Jharkhand & India.",
      ad_left_grid_link: "/advertise",
      ad_left_grid_btn_text: "Advertise With Us",
      ad_left_grid_badge: "SPONSORED"
    };

    for (const s of settings) {
      if (s.key === "ad_sticky_bg" && s.value.includes("#1e293b")) {
        map[s.key] = "#000000";
      } else {
        map[s.key] = s.value;
      }
    }

    return NextResponse.json({ success: true, data: map });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch ad settings" },
      { status: 500 }
    );
  }
}

// POST /api/v1/ad-settings — upsert ad settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pairs: { key: string; value: string }[] = body.settings
      ? body.settings
      : [{ key: body.key, value: body.value }];

    for (const { key, value } of pairs) {
      if (!AD_KEYS.includes(key)) {
        return NextResponse.json(
          { success: false, message: `Key '${key}' is not a permitted ad setting.` },
          { status: 400 }
        );
      }
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), label: key, group: "advertisements" },
      });
    }

    return NextResponse.json({ success: true, message: "Advertisement settings saved." });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to save ad settings" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/ad-settings — reset settings
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key && AD_KEYS.includes(key)) {
      await prisma.siteSetting.deleteMany({ where: { key } });
    } else {
      await prisma.siteSetting.deleteMany({ where: { key: { in: AD_KEYS } } });
    }

    return NextResponse.json({ success: true, message: "Ad setting reset." });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to reset ad settings" },
      { status: 500 }
    );
  }
}
