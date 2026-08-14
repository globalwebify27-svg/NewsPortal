/**
 * Universal Media Upload Helper for Global Awaaz
 * Bypasses Vercel's 4.5MB serverless payload limit by uploading large video & image files
 * directly to Hostinger storage, returning clean relative URLs (/uploads/filename.mp4).
 */

export function cleanVideoUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();

  // 1. YouTube / Vimeo / external embed links
  if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com")) {
    return url;
  }

  // 2. Remove malformed leading /https/, /http/, /https:/, /https//, etc.
  url = url.replace(/^\/?(https?:?\/?\/?)+/g, "");

  // 3. Remove Hostinger or site domains if embedded in path
  url = url
    .replace("yellowgreen-rook-384455.hostingersite.com", "")
    .replace("www.globalawaaz.com", "")
    .replace("globalawaaz.com", "")
    .replace(/^\/?(https?:?\/?\/?)+/g, "");

  // 4. Normalize /public/uploads/ -> /uploads/
  if (url.includes("uploads/")) {
    const idx = url.indexOf("uploads/");
    url = "/" + url.slice(idx);
  }

  if (url.startsWith("/public/uploads/")) {
    url = url.replace("/public/uploads/", "/uploads/");
  }

  if (!url.startsWith("/")) {
    url = "/" + url;
  }

  return url;
}

export async function uploadMediaDirectly(file: File): Promise<string> {
  if (!file) throw new Error("No file provided");

  const hostingerUploadUrl = process.env.NEXT_PUBLIC_HOSTINGER_UPLOAD_URL || "https://yellowgreen-rook-384455.hostingersite.com/upload.php";
  const hostingerSecret = "GlobalAwaazMediaSecret2026";

  // 1. Direct Upload to Hostinger PHP Storage Bridge (Bypasses Vercel 4.5MB Limit)
  try {
    const sanitizedFileName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
    const renamedFile = new File([file], sanitizedFileName, { type: file.type });

    const formData = new FormData();
    formData.append("file", renamedFile);

    const response = await fetch(hostingerUploadUrl, {
      method: "POST",
      headers: {
        "X-Api-Key": hostingerSecret,
      },
      body: formData,
    });

    if (response.ok) {
      const resJson = await response.json();
      if (resJson.success && resJson.url) {
        return cleanVideoUrl(resJson.url as string);
      }
    }
  } catch (directErr) {
    console.warn("Direct Hostinger upload failed, attempting Next.js API fallback:", directErr);
  }

  // 2. Fallback to /api/v1/media/upload
  const formData = new FormData();
  formData.append("file", file);

  const fallbackRes = await fetch("/api/v1/media/upload", {
    method: "POST",
    body: formData,
  });

  if (!fallbackRes.ok) {
    const errText = await fallbackRes.text();
    if (fallbackRes.status === 413 || errText.includes("TOO_LARGE")) {
      throw new Error("File size exceeds serverless limit. Please compress video or upload under 50MB.");
    }
    throw new Error(`Upload server error (${fallbackRes.status})`);
  }

  const fallbackJson = await fallbackRes.json();
  if (fallbackJson.success && (fallbackJson.url || fallbackJson.data?.url)) {
    const raw = fallbackJson.url || fallbackJson.data?.url;
    return cleanVideoUrl(raw);
  }

  throw new Error(fallbackJson.message || fallbackJson.error || "Media upload failed");
}
