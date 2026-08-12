import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const rawBytes = await file.arrayBuffer();
    let buffer = Buffer.from(rawBytes);

    let fileExt = path.extname(file.name) || ".jpg";
    let mimeType = file.type || "image/jpeg";
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|bmp|webp|tiff)$/i.test(file.name);

    // Optimize & Convert Images to WebP using sharp
    if (isImage && !file.type.includes("svg")) {
      try {
        buffer = await sharp(buffer)
          .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        fileExt = ".webp";
        mimeType = "image/webp";
      } catch (sharpErr) {
        console.warn("Sharp WebP conversion fallback, using original file:", sharpErr);
      }
    }

    const sanitizeName = path.basename(file.name, path.extname(file.name)).toLowerCase().replace(/[^a-z0-9]/g, "-");
    const uniqueFilename = `${sanitizeName}_${Date.now()}${fileExt}`;

    let publicUrl = "";

    // OPTION A: Hostinger Remote PHP Upload Bridge
    const hostingerUploadUrl = process.env.HOSTINGER_UPLOAD_URL || "https://yellowgreen-rook-384455.hostingersite.com/upload.php";
    const hostingerSecret = process.env.HOSTINGER_MEDIA_SECRET || "GlobalAwaazMediaSecret2026";

    if (hostingerUploadUrl) {
      try {
        const remoteFormData = new FormData();
        const blob = new Blob([buffer], { type: mimeType });
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
            // Rewrite Hostinger internal URL to main domain before storing
            publicUrl = (resJson.url as string).replace(
              "https://yellowgreen-rook-384455.hostingersite.com",
              "https://globalawaaz.com"
            );
          } else {
            console.warn("Hostinger bridge returned non-success:", resJson);
          }
        } else {
          console.warn(`Hostinger bridge HTTP ${response.status}: ${await response.text()}`);
        }
      } catch (remoteErr: any) {
        console.error("Hostinger Remote Bridge upload error:", remoteErr);
      }
    }

    // OPTION B: Fallback Local Disk / Base64 Data URL
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
        console.warn("Local disk write fallback:", fsErr?.message);
        const base64 = buffer.toString("base64");
        publicUrl = `data:${mimeType};base64,${base64}`;
      }
    }

    // Save record to database Media table
    let savedMedia: any = null;
    try {
      savedMedia = await prisma.media.create({
        data: {
          url: publicUrl,
          publicId: uniqueFilename,
          type: file.type.startsWith("video") ? MediaType.VIDEO : file.type.endsWith("pdf") ? MediaType.DOCUMENT : MediaType.IMAGE,
          mimeType: mimeType,
          size: buffer.length,
          altText: file.name.replace(/\.[^.]+$/, "") || "Uploaded Media",
          folder: "uploads",
        },
      });
    } catch (dbErr: any) {
      console.warn("Media DB save skipped:", dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: savedMedia?.id ?? `local_${Date.now()}`,
        url: publicUrl,
        publicId: uniqueFilename,
        size: buffer.length,
        mimeType: mimeType,
        format: "webp",
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
