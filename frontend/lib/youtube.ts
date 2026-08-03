export interface YouTubeVideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  category: string;
  description?: string;
  author?: string;
  publishedAt?: string;
  views?: string;
  duration?: string;
}

export const LOCAL_STORAGE_VIDEOS_KEY = "ga_custom_videos";

export function extractYouTubeId(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  if (trimmed.length === 11 && !trimmed.includes("/")) {
    return trimmed;
  }
  return trimmed;
}

export const DEFAULT_VIDEOS: YouTubeVideoItem[] = [];

export function getStoredVideos(): YouTubeVideoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load custom videos:", e);
  }
  return [];
}

export function saveStoredVideos(videos: YouTubeVideoItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(videos));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.warn("Failed to save custom videos:", e);
  }
}
