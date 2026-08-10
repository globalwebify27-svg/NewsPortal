import { fetchWithCache, clearCacheKey } from "./settingsCache";

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

export async function fetchCentralVideos(): Promise<{ videos: YouTubeVideoItem[]; liveTvConfig: any }> {
  try {
    const data = await fetchWithCache<{ success?: boolean; videos?: YouTubeVideoItem[]; liveTvConfig?: any }>("/api/v1/videos", 15000);
    if (data && data.success && Array.isArray(data.videos)) {
      return { videos: data.videos, liveTvConfig: data.liveTvConfig };
    }
  } catch (e) {
    console.warn("Failed to fetch central videos from database:", e);
  }
  return { videos: [], liveTvConfig: null };
}

export async function saveCentralVideos(videos: YouTubeVideoItem[], liveTvConfig?: any) {
  try {
    clearCacheKey("/api/v1/videos");
    await fetch("/api/v1/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videos, liveTvConfig })
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ga_videos_updated"));
    }
  } catch (e) {
    console.warn("Failed to save central videos to database:", e);
  }
}
