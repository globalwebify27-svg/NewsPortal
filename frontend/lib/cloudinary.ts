// =============================================================================
// Local Media Storage Handler for Next.js App Router
// Stores all uploaded files locally in public/uploads on project disk
// =============================================================================

import fs from "fs";
import path from "path";

export async function uploadImageToCloudinary(
  base64Data: string,
  folder: string = "uploads"
): Promise<{ url: string; publicId: string; width?: number; height?: number }> {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const filename = `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.png`;
    const filepath = path.join(uploadsDir, filename);

    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], "base64");
      fs.writeFileSync(filepath, buffer);
    } else {
      const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Clean, "base64");
      fs.writeFileSync(filepath, buffer);
    }

    const publicUrl = `/uploads/${filename}`;

    return {
      url: publicUrl,
      publicId: filename,
      width: 1200,
      height: 800,
    };
  } catch (err: any) {
    console.error("Local file save error:", err);
    throw new Error("Failed to save media file to public/uploads directory");
  }
}
