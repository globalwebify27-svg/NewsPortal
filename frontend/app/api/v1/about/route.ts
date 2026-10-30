import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireChiefOrAbove } from "@/lib/apiAuth";
import { serverCache, TTL } from "@/lib/cache";

const CACHE_KEY_ABOUT = "about:page:content";

const DB_FILE_PATH = path.join(process.cwd(), "..", "backend", "prisma", "about_db.json");
const ALT_DB_FILE_PATH = path.join(process.cwd(), "about_db.json");

function readAboutData(): any {
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

function writeAboutData(data: any): boolean {
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
  const cached = serverCache.get(CACHE_KEY_ABOUT);
  if (cached) {
    const response = NextResponse.json({ success: true, data: cached });
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    return response;
  }

  const data = readAboutData();
  if (data) {
    serverCache.set(CACHE_KEY_ABOUT, data, TTL.ABOUT);
  }

  const response = NextResponse.json({ success: true, data: data || {} });
  response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  return response;
}

export async function POST(request: NextRequest) {
  const auth = await requireChiefOrAbove(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    writeAboutData(body);
    serverCache.delete(CACHE_KEY_ABOUT);
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/about");
      revalidatePath("/");
    } catch (e) {}
    return NextResponse.json({ success: true, data: body, message: "About Us page data saved to database" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 });
  }
}
