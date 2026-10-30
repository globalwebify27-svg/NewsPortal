import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";
import sharp from "sharp";
import { cleanMediaUrl } from "@/lib/mediaUpload";
import { requireAdminAuth } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request);
  if (!auth.ok) return auth.response;

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
    const isAlreadyWebP = file.type === "image/webp" || /\.webp$/i.test(file.name) || fileExt.toLowerCase() === ".webp";
    const isSvg = file.type.includes("svg") || /\.svg$/i.test(file.name);
    const sizeInKb = buffer.length / 1024;

    // RULE 1: Never re-compress an image that is ALREADY WebP!
    // Re-compressing an existing WebP causes generation loss (blurriness, color fading, fuzzy edges).
    // Preserve 100% of the original WebP buffer as-is!
    if (isAlreadyWebP) {
      fileExt = ".webp";
      mimeType = "image/webp";
      console.log(`[Upload] Already WebP (${sizeInKb.toFixed(1)} KB) — keeping 100% original buffer to prevent quality loss`);
    } else if (isImage && !isSvg) {
      // RULE 2: For non-WebP images (JPG, PNG, TIFF, BMP):
      // If already under 120KB, preserve original to avoid re-compression degradation
      if (sizeInKb <= 120) {
        console.log(`[Upload] Image is already small (${sizeInKb.toFixed(1)} KB) — preserving original without re-compressing`);
      } else {
        try {
          const optimizedBuffer = await sharp(buffer, { failOn: "none" })
            .rotate() // Auto-orient photo based on EXIF metadata
            .resize({
              width: 2560,
              height: 2560,
              fit: "inside",
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3,
            })
            .sharpen({
              sigma: 1.15,
              m1: 0.9,
              m2: 0.4,
            })
            .webp({
              quality: 92,
              effort: 5,
              smartSubsample: true,
            })
            .toBuffer();

          if (optimizedBuffer && optimizedBuffer.length > 0) {
            buffer = optimizedBuffer;
            fileExt = ".webp";
            mimeType = "image/webp";
            console.log(`[Upload] Converted non-WebP to high-clarity WebP (${sizeInKb.toFixed(1)} KB ➔ ${(buffer.length / 1024).toFixed(1)} KB)`);
          }
        } catch (sharpErr) {
          console.warn("Sharp WebP conversion fallback, using original file:", sharpErr);
        }
      }
    }

    const sanitizeName = path.basename(file.name, path.extname(file.name)).toLowerCase().replace(/[^a-z0-9]/g, "-");
    const uniqueFilename = `${sanitizeName}_${Date.now()}${fileExt}`;

    let publicUrl = "";

    // OPTION A: Hostinger Remote PHP Upload Bridge
    const hostingerUploadUrl = process.env.HOSTINGER_UPLOAD_URL;
    // Security: never fall back to a hardcoded secret. Require explicit env var.
    const hostingerSecret = process.env.HOSTINGER_MEDIA_SECRET;
    if (!hostingerSecret && process.env.NODE_ENV === "production") {
      console.error("[Upload] HOSTINGER_MEDIA_SECRET is not set. Upload to remote storage is disabled.");
    }

    if (hostingerUploadUrl && hostingerSecret) {
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
            publicUrl = cleanMediaUrl(resJson.url as string);
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

    // OPTION B: Fallback Serverless Base64 / Local Disk
    if (!publicUrl) {
      const isServerless = Boolean(
        process.env.VERCEL ||
        process.env.NEXT_PUBLIC_VERCEL_ENV ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.NODE_ENV === "production"
      );

      if (isServerless) {
        // On serverless hosts (e.g. Vercel), local disk is ephemeral and runtime uploads in /public/uploads/ return 404.
        // Convert to Base64 Data URL so images display instantly on live site without git push.
        const base64 = buffer.toString("base64");
        publicUrl = `data:${mimeType};base64,${base64}`;
      } else {
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
