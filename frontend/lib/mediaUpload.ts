/**
 * Universal Media Upload Helper for Global Awaaz
 * Bypasses Vercel's 4.5MB serverless payload limit by uploading large video & image files
 * directly to Hostinger storage, returning clean relative URLs (/uploads/filename.mp4).
 */

export async function uploadMediaDirectly(file: File): Promise<string> {
  if (!file) throw new Error("No file provided");

  const hostingerUploadUrl = process.env.NEXT_PUBLIC_HOSTINGER_UPLOAD_URL || "https://yellowgreen-rook-384455.hostingersite.com/upload.php";
  const hostingerSecret = "GlobalAwaazMediaSecret2026";

  // 1. Direct Upload to Hostinger PHP Storage Bridge (Bypasses Vercel 4.5MB Limit)
  try {
    const formData = new FormData();
    formData.append("file", file);

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
        let cleanUrl = (resJson.url as string)
          .replace("https://yellowgreen-rook-384455.hostingersite.com", "")
          .replace("http://yellowgreen-rook-384455.hostingersite.com", "")
          .replace("//yellowgreen-rook-384455.hostingersite.com", "")
          .replace("https://www.globalawaaz.com", "")
          .replace("https://globalawaaz.com", "");

        if (cleanUrl.startsWith("/public/uploads/")) {
          cleanUrl = cleanUrl.replace("/public/uploads/", "/uploads/");
        }
        if (!cleanUrl.startsWith("/")) {
          cleanUrl = "/" + cleanUrl;
        }

        return cleanUrl;
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
    let cleanUrl = fallbackJson.url || fallbackJson.data?.url;
    cleanUrl = cleanUrl
      .replace("https://yellowgreen-rook-384455.hostingersite.com", "")
      .replace("http://yellowgreen-rook-384455.hostingersite.com", "")
      .replace("//yellowgreen-rook-384455.hostingersite.com", "")
      .replace("https://www.globalawaaz.com", "")
      .replace("https://globalawaaz.com", "");

    if (cleanUrl.startsWith("/public/uploads/")) {
      cleanUrl = cleanUrl.replace("/public/uploads/", "/uploads/");
    }
    if (!cleanUrl.startsWith("/")) {
      cleanUrl = "/" + cleanUrl;
    }
    return cleanUrl;
  }

  throw new Error(fallbackJson.message || fallbackJson.error || "Media upload failed");
}
