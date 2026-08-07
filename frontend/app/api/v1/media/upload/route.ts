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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = path.extname(file.name) || ".jpg";
    const sanitizeName = path.basename(file.name, fileExt).toLowerCase().replace(/[^a-z0-9]/g, "-");
    const uniqueFilename = `${sanitizeName}_${Date.now()}${fileExt}`;

    let publicUrl = "";

    // OPTION A: Hostinger Remote PHP Upload Bridge
    const hostingerUploadUrl = process.env.HOSTINGER_UPLOAD_URL || "https://yellowgreen-rook-384455.hostingersite.com/upload.php";
    const hostingerSecret = process.env.HOSTINGER_MEDIA_SECRET || "GlobalAwaazMediaSecret2026";

    if (hostingerUploadUrl) {
      try {
        const remoteFormData = new FormData();
        const blob = new Blob([buffer], { type: file.type || "image/jpeg" });
        remoteFormData.append("file", blob, uniqueFilename);

        const response = await fetch(hostingerUploadUrl, {
          method: "POST",
          headers: {
            "X-Api-Key": hostingerSecret,
          },
          body: remoteFormData,
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.url) {
            publicUrl = resJson.url;
          }
        }
      } catch (remoteErr: any) {
        console.warn("Hostinger Remote Bridge upload failed, trying local fallback:", remoteErr?.message);
      }
    }

    // OPTION B: Fallback Local Disk / Base64 Data URL (when HOSTINGER_UPLOAD_URL is not set or fails)
    if (!publicUrl) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, uniqueFilename);
        await fs.promises.writeFile(filePath, buffer);
        publicUrl = `/uploads/${uniqueFilename}`;
      } catch (fsErr: any) {
        console.warn("Local disk write fallback (serverless environment):", fsErr?.message);
        const base64 = buffer.toString("base64");
        const mime = file.type || "image/png";
        publicUrl = `data:${mime};base64,${base64}`;
      }
    }

    // Save record to database Media table (if DB connected)
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
    console.error("Media Upload Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process media upload",
      },
      { status: 500 }
    );
  }
}
