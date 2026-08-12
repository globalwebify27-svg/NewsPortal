import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DB_FILE_PATH = path.join(process.cwd(), "..", "backend", "prisma", "seo_settings_db.json");
const ALT_DB_FILE_PATH = path.join(process.cwd(), "seo_settings_db.json");

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "seo_settings_data" }
    });
    if (setting && setting.value) {
      const parsed = JSON.parse(setting.value);
      return NextResponse.json({ success: true, data: parsed });
    }
  } catch (err) {
    console.error("Error reading SEO settings from Prisma DB:", err);
  }

  // Fallback to local file
  try {
    if (fs.existsSync(ALT_DB_FILE_PATH)) {
      const fileData = fs.readFileSync(ALT_DB_FILE_PATH, "utf-8");
      return NextResponse.json({ success: true, data: JSON.parse(fileData) });
    }
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileData = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return NextResponse.json({ success: true, data: JSON.parse(fileData) });
    }
  } catch (e) {}

  return NextResponse.json({ success: true, data: {} });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const jsonStr = JSON.stringify(body);

    // Save to Prisma MySQL Database for serverless persistence
    try {
      await prisma.siteSetting.upsert({
        where: { key: "seo_settings_data" },
        update: { value: jsonStr },
        create: {
          key: "seo_settings_data",
          value: jsonStr,
          label: "SEO Page Configurations",
          group: "seo"
        }
      });
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

    return NextResponse.json({ success: true, data: body, message: "SEO settings saved to database" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}

