import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DB_FILE_PATH = path.join(process.cwd(), "social_links_db.json");

export interface SocialLinks {
  facebook: string;
  twitter: string;
  youtube: string;
  instagram: string;
  linkedin: string;
  whatsapp: string;
  telegram: string;
}

const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  facebook: "",
  twitter: "",
  youtube: "",
  instagram: "",
  linkedin: "",
  whatsapp: "",
  telegram: ""
};

function readSocialData(): SocialLinks {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return { ...DEFAULT_SOCIAL_LINKS, ...JSON.parse(content) };
    }
  } catch (e) {
    console.error("Error reading social links storage:", e);
  }
  return DEFAULT_SOCIAL_LINKS;
}

function writeSocialData(data: SocialLinks): boolean {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing social links storage:", e);
    return false;
  }
}

// GET /api/v1/social-settings -> Returns active social media links map
export async function GET() {
  const data = readSocialData();
  return NextResponse.json({ success: true, data });
}

// POST /api/v1/social-settings -> Saves & updates social media links centrally
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const current = readSocialData();

    const updated: SocialLinks = {
      facebook: String(body.facebook !== undefined ? body.facebook : current.facebook).trim(),
      twitter: String(body.twitter !== undefined ? body.twitter : current.twitter).trim(),
      youtube: String(body.youtube !== undefined ? body.youtube : current.youtube).trim(),
      instagram: String(body.instagram !== undefined ? body.instagram : current.instagram).trim(),
      linkedin: String(body.linkedin !== undefined ? body.linkedin : current.linkedin).trim(),
      whatsapp: String(body.whatsapp !== undefined ? body.whatsapp : current.whatsapp).trim(),
      telegram: String(body.telegram !== undefined ? body.telegram : current.telegram).trim(),
    };

    writeSocialData(updated);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "✓ All Social Media Links saved & updated live globally across the platform!"
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
