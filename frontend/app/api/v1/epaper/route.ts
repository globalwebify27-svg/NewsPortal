import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "..", "backend", "prisma", "epaper_db.json");
const ALT_DB_FILE_PATH = path.join(process.cwd(), "epaper_db.json");

function getDbPath(): string {
  try {
    if (fs.existsSync(DB_FILE_PATH)) return DB_FILE_PATH;
  } catch (e) {}
  try {
    if (fs.existsSync(ALT_DB_FILE_PATH)) return ALT_DB_FILE_PATH;
  } catch (e) {}
  return ALT_DB_FILE_PATH;
}

function readEpaperData(): any {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(DB_FILE_PATH, "utf-8"));
    }
  } catch (e) {}
  try {
    if (fs.existsSync(ALT_DB_FILE_PATH)) {
      return JSON.parse(fs.readFileSync(ALT_DB_FILE_PATH, "utf-8"));
    }
  } catch (e) {}
  return null;
}

function writeEpaperData(data: any): boolean {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {}
  try {
    fs.writeFileSync(ALT_DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {}
  return true;
}

export async function GET() {
  const data = readEpaperData();
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    writeEpaperData(body);
    return NextResponse.json({ success: true, data: body, message: "e-Paper data saved to database" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}
