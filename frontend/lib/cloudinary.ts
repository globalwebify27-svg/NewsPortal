// =============================================================================
// Local Media Storage Handler for Next.js App Router
// Stores all uploaded files locally in public/uploads directory on project disk
// =============================================================================

import fs from "fs";
import path from "path";

export const uploadImageToDisk = uploadImageToCloudinary;

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

    return {
      url: `/uploads/${filename}`,
      publicId: filename,
      width: 1200,
      height: 800,
    };
  } catch (err: any) {
    console.warn("Local disk write error (read-only filesystem or disk error):", err?.message);
    if (base64Data.startsWith("data:")) {
      return {
        url: base64Data,
        publicId: `data_${Date.now()}`,
        width: 1200,
        height: 800,
      };
    }
    throw new Error(err?.message || "Failed to save media file to public/uploads directory");
  }
}
