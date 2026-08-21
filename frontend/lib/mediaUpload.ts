/**
 * Universal Media Upload Helper for Global Awaaz
 * Bypasses Vercel's 4.5MB serverless payload limit by uploading large video & image files
 * directly to Hostinger storage, returning clean relative URLs (/uploads/filename.mp4).
 */

export function cleanMediaUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();

  // 1. Data URLs, YouTube / Vimeo / Cloudinary external links
  if (
    url.startsWith("data:") ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("res.cloudinary.com")
  ) {
    return url;
  }

  // 2. Fix malformed leading slash prefix: e.g. "/https://...", "/http:/...", "/https/public/uploads/..."
  if (/^\/(https?:?\/?)*/i.test(url)) {
    url = url.replace(/^\/(https?:?\/?)*/i, "");
  }

  // 3. Remove Hostinger or site domain prefixes
  url = url
    .replace("https://yellowgreen-rook-384455.hostingersite.com", "")
    .replace("http://yellowgreen-rook-384455.hostingersite.com", "")
    .replace("//yellowgreen-rook-384455.hostingersite.com", "")
    .replace("yellowgreen-rook-384455.hostingersite.com", "")
    .replace("https://www.globalawaaz.com", "")
    .replace("https://globalawaaz.com", "")
    .replace("http://www.globalawaaz.com", "")
    .replace("http://globalawaaz.com", "");

  // 4. Handle https://public/uploads/ or http://public/uploads/ or https://uploads/
  if (/^https?:\/\/(public\/)?uploads\//i.test(url)) {
    url = url.replace(/^https?:\/\/(public\/)?/i, "");
  }

  // 5. Normalize /public/uploads/ -> /uploads/
  if (url.includes("uploads/")) {
    const idx = url.indexOf("uploads/");
    url = "/" + url.slice(idx);
  }

  if (url.startsWith("/public/uploads/")) {
    url = url.replace("/public/uploads/", "/uploads/");
  }

  if (
    !url.startsWith("/") &&
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("data:")
  ) {
    url = "/" + url;
  }

  return url;
}

export function cleanVideoUrl(rawUrl: string): string {
  return cleanMediaUrl(rawUrl);
}

export async function uploadMediaDirectly(file: File): Promise<string> {
  if (!file) throw new Error("No file provided");

  // All uploads route through the server-side API.
  // The Hostinger URL and secret key are kept in server env vars — never exposed to the browser.
  const sanitizedFileName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
  const renamedFile = new File([file], sanitizedFileName, { type: file.type });

  const formData = new FormData();
  formData.append("file", renamedFile);

  const res = await fetch("/api/v1/media/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 413 || errText.includes("TOO_LARGE")) {
      throw new Error("File size exceeds serverless limit. Please compress the file or upload under 50MB.");
    }
    throw new Error(`Upload server error (${res.status})`);
  }

  const json = await res.json();
  if (json.success && (json.url || json.data?.url)) {
    return cleanVideoUrl(json.url || json.data?.url);
  }

  throw new Error(json.message || json.error || "Media upload failed");
}

