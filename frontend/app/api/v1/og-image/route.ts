import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imgParam = searchParams.get("img") || searchParams.get("url");

    if (!imgParam) {
      return new NextResponse("Missing img parameter", { status: 400 });
    }

    let targetUrl = decodeURIComponent(imgParam).trim();

    if (targetUrl.startsWith("https//")) targetUrl = targetUrl.replace("https//", "https://");
    if (targetUrl.startsWith("http//")) targetUrl = targetUrl.replace("http//", "http://");

    if (targetUrl.startsWith("/")) {
      const hostingerOrigin = process.env.HOSTINGER_MEDIA_ORIGIN || "https://yellowgreen-rook-384455.hostingersite.com";
      const cleanPath = targetUrl.includes("/uploads/") && !targetUrl.includes("/public/uploads/")
        ? targetUrl.replace("/uploads/", "/public/uploads/")
        : targetUrl;
      targetUrl = `${hostingerOrigin.replace(/\/$/, "")}${cleanPath}`;
    }

    // Fetch raw image
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      const logoRes = await fetch("https://www.globalawaaz.com/logo.png");
      const logoBuffer = await logoRes.arrayBuffer();
      const jpegLogo = await sharp(Buffer.from(logoBuffer))
        .resize({ width: 1200, height: 630, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .jpeg({ quality: 90 })
        .toBuffer();

      return new NextResponse(jpegLogo, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Convert any image format (webp, png, gif, etc.) into WhatsApp-compliant 1200x630 JPEG
    const jpegBuffer = await sharp(inputBuffer)
      .resize({
        width: 1200,
        height: 630,
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 88, progressive: true })
      .toBuffer();

    return new NextResponse(jpegBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": jpegBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("OG Image generation error:", error);
    try {
      const logoRes = await fetch("https://www.globalawaaz.com/logo.png");
      const logoBuffer = await logoRes.arrayBuffer();
      const jpegLogo = await sharp(Buffer.from(logoBuffer))
        .resize({ width: 1200, height: 630, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .jpeg({ quality: 90 })
        .toBuffer();

      return new NextResponse(jpegLogo, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      return new NextResponse("Error generating OG image", { status: 500 });
    }
  }
}
