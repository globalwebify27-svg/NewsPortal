import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DB_FILE_PATH = path.join(process.cwd(), "..", "backend", "prisma", "seo_settings_db.json");
const ALT_DB_FILE_PATH = path.join(process.cwd(), "seo_settings_db.json");

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "seo_settings_data" }
    });
    if (setting && setting.value) {
      const parsed = JSON.parse(setting.value);
      return NextResponse.json(
        { success: true, data: parsed },
        { headers: NO_CACHE_HEADERS }
      );
    }
  } catch (err) {
    console.error("Error reading SEO settings from Prisma DB:", err);
  }

  // Fallback to local file
  try {
    if (fs.existsSync(ALT_DB_FILE_PATH)) {
      const fileData = fs.readFileSync(ALT_DB_FILE_PATH, "utf-8");
      return NextResponse.json(
        { success: true, data: JSON.parse(fileData) },
        { headers: NO_CACHE_HEADERS }
      );
    }
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileData = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return NextResponse.json(
        { success: true, data: JSON.parse(fileData) },
        { headers: NO_CACHE_HEADERS }
      );
    }
  } catch (e) {}

  return NextResponse.json({ success: true, data: [] }, { headers: NO_CACHE_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const jsonStr = JSON.stringify(body);

    // Save to Prisma MySQL Database for serverless persistence
    try {
      await prisma.siteSetting.upsert({
        where: { key: "seo_settings_data" },
        update: { value: jsonStr, group: "seo" },
        create: {
          key: "seo_settings_data",
          value: jsonStr,
          label: "SEO Page Configurations",
          group: "seo"
        }
      });
    } catch (dbErr: any) {
      console.error("Error saving SEO settings to Prisma DB:", dbErr);
      return NextResponse.json(
        { success: false, message: `Database write failed: ${dbErr?.message || "DB Error"}` },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // Save local file backups
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_FILE_PATH, jsonStr, "utf-8");
    } catch (e) {}
    try {
      fs.writeFileSync(ALT_DB_FILE_PATH, jsonStr, "utf-8");
    } catch (e) {}

    // Purge Next.js page cache for every path that was updated
    // so the new title/meta shows immediately on the next page visit
    try {
      // Always purge the homepage
      revalidatePath("/");

      // Purge every specific page path that was saved
      if (Array.isArray(body)) {
        const uniquePaths = new Set<string>();
        body.forEach((item: any) => {
          if (item?.path && typeof item.path === "string") {
            uniquePaths.add(item.path);
          }
        });
        uniquePaths.forEach((p) => revalidatePath(p));
      }
    } catch (rvErr) {
      console.warn("revalidatePath failed (safe to ignore in dev):", rvErr);
    }

    return NextResponse.json(
      { success: true, data: body, message: "SEO settings saved successfully" },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("POST /api/v1/seo-settings error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

