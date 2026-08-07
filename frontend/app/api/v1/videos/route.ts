// =============================================================================
// Custom Videos & Live TV Stream API Route — Next.js App Router
// Centralized persistence in MySQL database via SiteSetting model
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VIDEOS_SETTING_KEY = "custom_videos_list";
const LIVETV_SETTING_KEY = "livetv_stream_config";

const DEFAULT_INITIAL_VIDEOS = [
  {
    id: "vid-1",
    title: "GLOBAL SUMMIT 2026: World Leaders Sign Historic AI Governance Accords",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    category: "World",
    description: "Exclusive report on the Geneva AI summit agreements.",
    duration: "03:45",
    publishedAt: new Date().toISOString(),
    views: "12.4K views"
  }
];

// GET /api/v1/videos — Returns all videos and live TV configuration stored centrally in DB
export async function GET() {
  try {
    const videoSetting = await prisma.siteSetting.findUnique({
      where: { key: VIDEOS_SETTING_KEY },
    });

    const liveTvSetting = await prisma.siteSetting.findUnique({
      where: { key: LIVETV_SETTING_KEY },
    });

    let videos = DEFAULT_INITIAL_VIDEOS;
    if (videoSetting?.value) {
      try {
        videos = JSON.parse(videoSetting.value);
      } catch (e) {}
    }

    let liveTvConfig = {
      channelTitle: "GLOBAL AWAAZ NEWS 24/7",
      subtitle: "लाइव न्यूज़ बुलेटिन और मुख्य समाचार प्रसारण",
      streamUrl: "",
      googleNewsUrl: "https://news.google.com",
      whatsappUrl: "https://whatsapp.com"
    };

    if (liveTvSetting?.value) {
      try {
        liveTvConfig = JSON.parse(liveTvSetting.value);
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      videos,
      liveTvConfig
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// POST /api/v1/videos — Save custom videos list or live TV configuration to central DB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.videos !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: VIDEOS_SETTING_KEY },
        update: { value: JSON.stringify(body.videos) },
        create: {
          key: VIDEOS_SETTING_KEY,
          value: JSON.stringify(body.videos),
          label: "Custom Videos List",
          group: "content",
          type: "TEXT"
        },
      });
    }

    if (body.liveTvConfig !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key: LIVETV_SETTING_KEY },
        update: { value: JSON.stringify(body.liveTvConfig) },
        create: {
          key: LIVETV_SETTING_KEY,
          value: JSON.stringify(body.liveTvConfig),
          label: "Live TV Stream Config",
          group: "content",
          type: "TEXT"
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Videos & Live TV settings saved centrally to database."
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to save videos" },
      { status: 500 }
    );
  }
}
