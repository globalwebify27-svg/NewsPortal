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
  // Match standard YouTube URL patterns
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  // If user entered raw 11-char ID
  if (trimmed.length === 11 && !trimmed.includes("/")) {
    return trimmed;
  }
  return trimmed;
}

export const DEFAULT_VIDEOS: YouTubeVideoItem[] = [
  {
    id: "yt-1",
    title: "जब आमने-सामने आए पवन सिंह और तेजस्वी यादव, देखिए सियासत...",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    category: "Politics",
    duration: "01:08",
    description: "पवन सिंह और तेजस्वी यादव की आमने-सामने मुलाकात की ताजा खबर।",
    author: "Global Awaaz TV",
    publishedAt: "2026-07-29",
    views: "142K views"
  },
  {
    id: "yt-2",
    title: "'भ्रूण हत्या' का स्टिंग ऑपरेशन: मोतिहारी के DM सौरभ सुमन ने अंश हॉस्पिटल्स...",
    youtubeUrl: "https://www.youtube.com/watch?v=21X5lGlDOfg",
    youtubeId: "21X5lGlDOfg",
    category: "News",
    duration: "02:43",
    description: "मोतिहारी के DM द्वारा स्टिंग ऑपरेशन की विस्तृत रिपोर्ट।",
    author: "Global Awaaz News",
    publishedAt: "2026-07-29",
    views: "98K views"
  },
  {
    id: "yt-3",
    title: "बिहार में छात्रों पर गोली चली है और एके 47 का इस्तेमाल हुआ: तारिक...",
    youtubeUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso",
    youtubeId: "L_LUpnjgPso",
    category: "Bihar",
    duration: "03:01",
    description: "तारिक अनवर का बड़ा बयान - बिहार छात्र आंदोलन और पुलिस की कार्रवाई।",
    author: "Global Awaaz India",
    publishedAt: "2026-07-28",
    views: "210K views"
  },
  {
    id: "yt-4",
    title: "हाथ में लाठी और माथे पर पट्टी लगाकर संसद पहुंचे पप्पू यादव अलग...",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    category: "National",
    duration: "01:51",
    description: "संसद भवन पहुंचे सांसद पप्पू यादव का अनोखा विरोध प्रदर्शन।",
    author: "Global Awaaz TV",
    publishedAt: "2026-07-28",
    views: "340K views"
  },
  {
    id: "yt-5",
    title: "मैं सभी मतदाताओं से अपील करता हूं कि...: नीतीश कुमार ने नीरज सिन्हा...",
    youtubeUrl: "https://www.youtube.com/watch?v=21X5lGlDOfg",
    youtubeId: "21X5lGlDOfg",
    category: "Politics",
    duration: "01:07",
    description: "मुख्यमंत्री नीतीश कुमार की जनता से अपील।",
    author: "Global Awaaz Politics",
    publishedAt: "2026-07-27",
    views: "85K views"
  },
  {
    id: "yt-6",
    title: "कांग्रेस नेता करुणा का आरोप- 'निष्पक्षता छोड़ सत्ताधारी दल के लि...",
    youtubeUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso",
    youtubeId: "L_LUpnjgPso",
    category: "News",
    duration: "02:00",
    description: "बिहार पुलिस और प्रशासन पर कांग्रेस नेता करुणा का गंभीर आरोप।",
    author: "Global Awaaz News",
    publishedAt: "2026-07-27",
    views: "115K views"
  },
  {
    id: "yt-7",
    title: "सांप के काटने पर न हों पैनिक, सिविल सर्जन डॉ. ललित रंजन पाठ...",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    category: "Health",
    duration: "01:07",
    description: "सर्पदंश के प्राथमिक उपचार और सावधानी से जुड़ी विशेषज्ञ सलाह।",
    author: "Global Awaaz Health",
    publishedAt: "2026-07-26",
    views: "54K views"
  },
  {
    id: "yt-8",
    title: "Video: क्या बेतिया में होगा बड़ा आंदोलन? बुलडोजर एक्शन के...",
    youtubeUrl: "https://www.youtube.com/watch?v=21X5lGlDOfg",
    youtubeId: "21X5lGlDOfg",
    category: "News",
    duration: "01:43",
    description: "बेतिया में बुलडोजर एक्शन के खिलाफ सड़कों पर उतरे लोग।",
    author: "Global Awaaz News",
    publishedAt: "2026-07-26",
    views: "190K views"
  }
];

export function getStoredVideos(): YouTubeVideoItem[] {
  if (typeof window === "undefined") return DEFAULT_VIDEOS;
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load custom videos:", e);
  }
  return DEFAULT_VIDEOS;
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
