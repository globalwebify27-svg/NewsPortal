export interface YouTubeVideoItem {
  id: string;
  title: string;
  youtubeUrl?: string;
  videoUrl?: string;
  youtubeId: string;
  category: string;
  description?: string;
  author?: string;
  publishedAt?: string;
  views?: string;
  duration?: string;
  thumbnailUrl?: string;
  timeAgo?: string;
  isLive?: boolean;
}

export const LOCAL_STORAGE_VIDEOS_KEY = "ga_custom_videos";

export function extractYouTubeId(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();

  // Handle 11-character YouTube video ID directly
  if (trimmed.length === 11 && !trimmed.includes("/") && !trimmed.includes(".")) {
    return trimmed;
  }

  // Regex matching watch, shorts, live, embed, v, youtu.be, m.youtube.com
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  return trimmed;
}

export const DEFAULT_VIDEOS: YouTubeVideoItem[] = [];

// Synchronous local storage reader (used as fallback or initial fast load)
export function getStoredVideos(): YouTubeVideoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load local custom videos:", e);
  }
  return [];
}

// Synchronous local storage writer
export function saveStoredVideos(videos: YouTubeVideoItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(videos));
    window.dispatchEvent(new Event("storage"));
    // Also trigger central database sync
    saveCentralVideos(videos).catch((err) => console.warn("Failed central video sync:", err));
  } catch (e) {
    console.warn("Failed to save custom videos:", e);
  }
}

// Fetch central video data from database API across all machines
export async function fetchCentralVideos(): Promise<{ videos: YouTubeVideoItem[]; liveTvConfig: any }> {
  try {
    const res = await fetch("/api/v1/videos", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        // Cache to localStorage for fast immediate render
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(data.videos));
          if (data.liveTvConfig) {
            localStorage.setItem("ga_livetv_config", JSON.stringify(data.liveTvConfig));
          }
        }
        return { videos: data.videos, liveTvConfig: data.liveTvConfig };
      }
    }
  } catch (e) {
    console.warn("Failed to fetch central videos from database:", e);
  }
  return { videos: getStoredVideos(), liveTvConfig: null };
}

// Save central video data to database API
export async function saveCentralVideos(videos: YouTubeVideoItem[], liveTvConfig?: any) {
  try {
    await fetch("/api/v1/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videos, liveTvConfig })
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ga_videos_updated"));
      window.dispatchEvent(new Event("storage"));
    }
  } catch (e) {
    console.warn("Failed to save central videos to database:", e);
  }
}
