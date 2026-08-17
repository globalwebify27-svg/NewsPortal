import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

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

    let dbSaved = false;
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
      dbSaved = true;
    } catch (dbErr) {
      console.error("Error saving SEO settings to Prisma DB:", dbErr);
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

    return NextResponse.json(
      { success: true, data: body, dbSaved, message: "SEO settings saved successfully" },
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

