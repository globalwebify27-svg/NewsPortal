import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

    const decodedFilename = decodeURIComponent(filenamePath);

    // 1. Check local filesystem public/uploads directory first
    const candidateLocalPaths = Array.from(new Set([
      path.join(process.cwd(), "public", "uploads", filenamePath),
      path.join(process.cwd(), "public", "uploads", decodedFilename),
      path.join(process.cwd(), "public", "uploads", filenamePath.replace(/-/g, "_")),
      path.join(process.cwd(), "public", "uploads", decodedFilename.replace(/-/g, "_")),
      path.join(process.cwd(), "public", "uploads", filenamePath.replace(/-/g, " ")),
      path.join(process.cwd(), "public", "uploads", decodedFilename.replace(/-/g, " ")),
    ]));

    for (const localPath of candidateLocalPaths) {
      if (fs.existsSync(localPath)) {
        try {
          const fileBuffer = await fs.promises.readFile(localPath);
          const ext = path.extname(localPath).toLowerCase();
          const contentType =
            ext === ".mp4" ? "video/mp4"
            : ext === ".webm" ? "video/webm"
            : ext === ".png" ? "image/png"
            : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg"
            : ext === ".webp" ? "image/webp"
            : ext === ".svg" ? "image/svg+xml"
            : ext === ".gif" ? "image/gif"
            : "application/octet-stream";

          const resHeaders = new Headers();
          resHeaders.set("Content-Type", contentType);
          resHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
          resHeaders.set("Accept-Ranges", "bytes");

          return new NextResponse(fileBuffer, {
            status: 200,
            headers: resHeaders,
          });
        } catch (readErr) {
          console.warn("Failed to read local upload file:", readErr);
        }
      }
    }

    // 2. Fallback to Hostinger remote storage server
    const hostingerOrigin =
      process.env.HOSTINGER_MEDIA_ORIGIN ||
      "https://yellowgreen-rook-384455.hostingersite.com";

    const fetchHeaders: Record<string, string> = {};
    if (req.headers.get("range")) {
      fetchHeaders["range"] = req.headers.get("range")!;
    }

    const candidateRemotePaths = Array.from(new Set([
      `/uploads/${filenamePath}`,
      `/public/uploads/${filenamePath}`,
      `/uploads/${decodedFilename}`,
      `/public/uploads/${decodedFilename}`,
      `/uploads/${filenamePath.replace(/-/g, "_")}`,
      `/public/uploads/${filenamePath.replace(/-/g, "_")}`,
      `/uploads/${filenamePath.replace(/-/g, " ")}`,
      `/public/uploads/${filenamePath.replace(/-/g, " ")}`
    ]));

    let response: Response | null = null;

    for (const relPath of candidateRemotePaths) {
      try {
        const testUrl = `${hostingerOrigin}${relPath}`;
        const res = await fetch(testUrl, { headers: fetchHeaders });
        if (res.ok) {
          response = res;
          break;
        }
      } catch (err) {
        // try next candidate
      }
    }

    if (!response || !response.ok) {
      return new NextResponse(`File not found on local or storage server`, {
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
