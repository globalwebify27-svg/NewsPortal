import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    // 1. Ensure public/uploads directory exists on disk
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 2. Generate clean unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = path.extname(file.name) || ".jpg";
    const sanitizeName = path.basename(file.name, fileExt).toLowerCase().replace(/[^a-z0-9]/g, "-");
    const uniqueFilename = `${sanitizeName}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // 3. Write file to public/uploads
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    // 4. Save record to database Media table (if DB connected)
    let savedMedia: any = null;
    try {
      savedMedia = await prisma.media.create({
        data: {
          url: publicUrl,
          publicId: uniqueFilename,
          type: file.type.startsWith("video") ? MediaType.VIDEO : file.type.endsWith("pdf") ? MediaType.DOCUMENT : MediaType.IMAGE,
          mimeType: file.type || "image/jpeg",
          size: file.size || 0,
          altText: file.name.replace(/\.[^.]+$/, "") || "Uploaded Media",
          folder: "uploads",
        },
      });
    } catch (dbErr: any) {
      console.warn("Media DB save skipped/fallback:", dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: savedMedia?.id ?? `local_${Date.now()}`,
        url: publicUrl,
        publicId: uniqueFilename,
        size: file.size,
        mimeType: file.type,
        savedToLibrary: !!savedMedia,
      },
    });
  } catch (error: any) {
    console.error("Local Media Upload Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to save file to local public/uploads directory",
      },
      { status: 500 }
    );
  }
}
