import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdminAuth } from "@/lib/apiAuth";

const DB_FILE_PATH = path.join(process.cwd(), "..", "backend", "prisma", "epaper_db.json");
const ALT_DB_FILE_PATH = path.join(process.cwd(), "epaper_db.json");

export interface EPaperEdition {
  id: string;
  title: string;
  date: string;
  edition: string;
  pdfUrl: string;
  thumbnailUrl?: string;
  totalPages?: number;
  pages?: string[];
  [key: string]: unknown;
}

function getDbPath(): string {
  try {
    if (fs.existsSync(DB_FILE_PATH)) return DB_FILE_PATH;
  } catch (e) {}
  try {
    if (fs.existsSync(ALT_DB_FILE_PATH)) return ALT_DB_FILE_PATH;
  } catch (e) {}
  return ALT_DB_FILE_PATH;
}

function readEpaperData(): EPaperEdition[] {
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
  return [];
}

function writeEpaperData(data: unknown): boolean {
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
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    writeEpaperData(body);
    return NextResponse.json({ success: true, data: body, message: "e-Paper data saved to database" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
