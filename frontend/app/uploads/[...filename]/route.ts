import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filenamePath = Array.isArray(params.filename)
      ? params.filename.join("/")
      : params.filename || "";

    if (!filenamePath) {
      return new NextResponse("File not found", { status: 404 });
    }

    const hostingerOrigin =
      process.env.HOSTINGER_MEDIA_ORIGIN ||
      "https://yellowgreen-rook-384455.hostingersite.com";

    const fetchHeaders: Record<string, string> = {};
    if (req.headers.get("range")) {
      fetchHeaders["range"] = req.headers.get("range")!;
    }

    // Try primary /uploads/ path first on Hostinger
    let targetUrl = `${hostingerOrigin}/uploads/${filenamePath}`;
    let response = await fetch(targetUrl, { headers: fetchHeaders });

    // Fallback to /public/uploads/ path if primary returns 404
    if (!response.ok && response.status === 404) {
      targetUrl = `${hostingerOrigin}/public/uploads/${filenamePath}`;
      response = await fetch(targetUrl, { headers: fetchHeaders });
    }

    if (!response.ok) {
      return new NextResponse(`File not found on storage server (${response.status})`, {
        status: 404,
      });
    }

    const contentType =
      response.headers.get("content-type") ||
      (filenamePath.endsWith(".mp4")
        ? "video/mp4"
        : filenamePath.endsWith(".webm")
        ? "video/webm"
        : filenamePath.endsWith(".png")
        ? "image/png"
        : filenamePath.endsWith(".webp")
        ? "image/webp"
        : "application/octet-stream");

    const resHeaders = new Headers();
    resHeaders.set("Content-Type", contentType);
    resHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    resHeaders.set("Accept-Ranges", "bytes");

    if (response.headers.get("content-length")) {
      resHeaders.set("Content-Length", response.headers.get("content-length")!);
    }
    if (response.headers.get("content-range")) {
      resHeaders.set("Content-Range", response.headers.get("content-range")!);
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error("Uploads proxy streaming error:", err);
    return new NextResponse("Error loading media file", { status: 500 });
  }
}
