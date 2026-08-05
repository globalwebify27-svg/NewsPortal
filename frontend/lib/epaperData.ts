import { DefaultArticle } from "./defaultArticles";

export interface EPaperEdition {
  id: string;
  nameHi: string;
  nameEn: string;
  cityHi: string;
  cityEn: string;
  stateHi: string;
  stateEn: string;
  isPopular?: boolean;
}

export interface EPaperPage {
  pageNumber: number;
  titleHi: string;
  titleEn: string;
  imageUrl?: string;
  pdfUrl?: string;
  articles?: Array<{
    title: string;
    category: string;
    summary: string;
    image?: string;
    pageRef?: string;
  }>;
}

export interface EPaperIssue {
  id: string;
  editionId: string;
  date: string; // YYYY-MM-DD
  displayDateHi: string;
  displayDateEn: string;
  issueNumber: string;
  volumeNumber: string;
  totalPages: number;
  pdfUrl?: string;
  pages: EPaperPage[];
  weatherInfo?: {
    temp: string;
    conditionHi: string;
    conditionEn: string;
    city: string;
  };
  leadStory?: {
    title: string;
    subtitle: string;
    summary: string;
    image: string;
    pageRef: string;
  };
  secondaryStory?: {
    title: string;
    summary: string;
    image: string;
    pageRef: string;
  };
  bottomStories?: Array<{
    categoryHi: string;
    categoryEn: string;
    title: string;
    summary: string;
    image: string;
    pageRef: string;
  }>;
}

export const defaultEditions: EPaperEdition[] = [
  { id: "patna", nameHi: "ग्लोबल आवाज़ (पटना)", nameEn: "Global Awaaz (Patna)", cityHi: "पटना", cityEn: "Patna", stateHi: "बिहार", stateEn: "Bihar", isPopular: true },
  { id: "ranchi", nameHi: "ग्लोबल आवाज़ (रांची)", nameEn: "Global Awaaz (Ranchi)", cityHi: "रांची", cityEn: "Ranchi", stateHi: "झारखंड", stateEn: "Jharkhand" },
  { id: "delhi", nameHi: "ग्लोबल आवाज़ (दिल्ली)", nameEn: "Global Awaaz (Delhi)", cityHi: "नई दिल्ली", cityEn: "New Delhi", stateHi: "दिल्ली", stateEn: "Delhi" },
  { id: "mumbai", nameHi: "ग्लोबल आवाज़ (मुंबई)", nameEn: "Global Awaaz (Mumbai)", cityHi: "मुंबई", cityEn: "Mumbai", stateHi: "महाराष्ट्र", stateEn: "Maharashtra" }
];

export const defaultEPaperIssue: EPaperIssue = {
  id: "issue-2026-08-04-patna",
  editionId: "patna",
  date: "2026-08-04",
  displayDateHi: "4 अगस्त 2026",
  displayDateEn: "4 August 2026",
  issueNumber: "212",
  volumeNumber: "01",
  totalPages: 16,
  weatherInfo: {
    temp: "32°C",
    conditionHi: "पटना, बिहार",
    conditionEn: "Patna, Bihar",
    city: "Patna"
  },
  leadStory: {
    title: "बिहार में निवेश के नए अवसर",
    subtitle: "सरकार की नई नीति से उद्योगों को मिलेगा बढ़ावा",
    summary: "पटना: बिहार सरकार ने राज्य में निवेश को बढ़ावा देने के लिए नई औद्योगिक नीति 2026 की घोषणा की है। इस नीति के तहत निवेशकों को विशेष सब्सिडी और सुविधाएं दी जाएंगी। उद्योग मंत्री ने बताया कि इससे लाखों नए रोजगार के अवसर पैदा होंगे।",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    pageRef: "पृष्ठ 3 पर"
  },
  secondaryStory: {
    title: "झारखंड के युवाओं के लिए बड़ी सौगात",
    summary: "रांची: झारखंड सरकार ने युवाओं के कौशल विकास के लिए नई योजना शुरू की है। इसके तहत 50,000 युवाओं को विभिन्न क्षेत्रों में प्रशिक्षण दिया जाएगा।",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    pageRef: "पृष्ठ 5 पर"
  },
  bottomStories: [
    {
      categoryHi: "देश-दुनिया",
      categoryEn: "World",
      title: "चंद्रयान-4 की तैयारियां शुरू",
      summary: "इसरो ने चंद्रयान-4 मिशन की तैयारियों की आधिकारिक घोषणा की है।",
      image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80",
      pageRef: "पृष्ठ 8"
    },
    {
      categoryHi: "खेल",
      categoryEn: "Sports",
      title: "भारत ने जीती टी20 सीरीज",
      summary: "भारतीय टीम ने शानदार प्रदर्शन करते हुए टी20 सीरीज 3-1 से अपने नाम की।",
      image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80",
      pageRef: "पृष्ठ 12"
    },
    {
      categoryHi: "व्यापार",
      categoryEn: "Business",
      title: "शेयर बाजार में तेजी जारी",
      summary: "सेंसेक्स और निफ्टी में लगातार दूसरे दिन बढ़त, निवेशकों के चेहरे खिले।",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
      pageRef: "पृष्ठ 10"
    }
  ],
  pages: Array.from({ length: 16 }, (_, i) => ({
    pageNumber: i + 1,
    titleHi: `पृष्ठ ${i + 1} — ${i === 0 ? "मुख्य पृष्ठ (Front Page)" : i === 1 ? "राज्य समाचार" : i === 2 ? "संपादकीय एवं विचार" : i === 3 ? "देश-विदेश" : "विशेष कवरेज"}`,
    titleEn: `Page ${i + 1} — ${i === 0 ? "Front Page" : i === 1 ? "State News" : i === 2 ? "Editorial" : i === 3 ? "National & World" : "Feature Stories"}`
  }))
};

export const LOCAL_STORAGE_EPAPER_KEY = "ga_epaper_issues";

export function getStoredEPaperIssues(): EPaperIssue[] {
  if (typeof window === "undefined") return [defaultEPaperIssue];
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_EPAPER_KEY);
    let issuesList: EPaperIssue[] = [];
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        issuesList = parsed;
      }
    }
    
    // Also auto-compile from custom articles published in admin (grouped by date)
    const customArticlesRaw = localStorage.getItem("ga_custom_articles");
    if (customArticlesRaw) {
      const customArticles = JSON.parse(customArticlesRaw);
      if (Array.isArray(customArticles) && customArticles.length > 0) {
        // Group articles by YYYY-MM-DD
        const groupedByDate: Record<string, any[]> = {};
        customArticles.forEach((art) => {
          let rawDate = art.createdAt || art.publishedAt || new Date().toISOString();
          let dateKey = rawDate.split("T")[0];
          if (!dateKey || dateKey.length < 10) dateKey = "2026-08-04";
          if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
          groupedByDate[dateKey].push(art);
        });

        // For every date, compile for each edition so articles added on that date populate e-Paper
        Object.keys(groupedByDate).forEach((d) => {
          defaultEditions.forEach((ed) => {
            const compiled = compileEPaperFromArticles(groupedByDate[d], d, ed.id);
            const existingIdx = issuesList.findIndex((i) => i.date === d && i.editionId === ed.id);
            if (existingIdx >= 0) {
              // Update with freshly added articles of that date
              issuesList[existingIdx] = compiled;
            } else {
              issuesList.push(compiled);
            }
          });
        });
      }
    }

    if (issuesList.length > 0) {
      return issuesList;
    }
  } catch (e) {}
  return [defaultEPaperIssue];
}

export function saveEPaperIssue(issue: EPaperIssue): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredEPaperIssues();
    const filtered = current.filter((i) => !(i.editionId === issue.editionId && i.date === issue.date));
    const updated = [issue, ...filtered];
    localStorage.setItem(LOCAL_STORAGE_EPAPER_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("ga_epaper_updated"));
  } catch (e) {}
}

export function formatHindiDateString(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const monthsHi = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
    return `${d.getDate()} ${monthsHi[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

export function compileEPaperFromArticles(articles: DefaultArticle[] | any[], date: string = "2026-08-04", editionId: string = "patna"): EPaperIssue {
  const edition = defaultEditions.find((e) => e.id === editionId) || defaultEditions[0];
  const displayDateHi = formatHindiDateString(date);
  
  const lead = articles[0] || {
    title: "बिहार में निवेश के नए अवसर",
    summary: "पटना: बिहार सरकार ने राज्य में निवेश को बढ़ावा देने के लिए नई औद्योगिक नीति 2026 की घोषणा की है।",
    featuredImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
  };

  const secondary = articles[1] || {
    title: "झारखंड के युवाओं के लिए बड़ी सौगात",
    summary: "रांची: कौशल विकास योजना के तहत 50,000 युवाओं को प्रशिक्षण।",
    featuredImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
  };

  const story3 = articles[2] || {
    title: "चंद्रयान-4 की तैयारियां शुरू",
    summary: "इसरो ने चंद्रयान-4 मिशन की तैयारियों की घोषणा की।",
    featuredImage: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80"
  };

  const story4 = articles[3] || {
    title: "भारत ने जीती टी20 सीरीज",
    summary: "भारतीय टीम ने शानदार प्रदर्शन करते हुए सीरीज जीती।",
    featuredImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80"
  };

  const story5 = articles[4] || {
    title: "शेयर बाजार में तेजी जारी",
    summary: "सेंसेक्स और निफ्टी में लगातार बढ़त।",
    featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80"
  };

  return {
    id: `issue-${date}-${editionId}`,
    editionId: edition.id,
    date,
    displayDateHi,
    displayDateEn: date,
    issueNumber: "212",
    volumeNumber: "01",
    totalPages: 16,
    weatherInfo: {
      temp: "32°C",
      conditionHi: `${edition.cityHi}, ${edition.stateHi}`,
      conditionEn: `${edition.cityEn}, ${edition.stateEn}`,
      city: edition.cityEn
    },
    leadStory: {
      title: lead.title || lead.titleHi || "विशेष मुख्य समाचार",
      subtitle: "सरकार की नई नीति से उद्योगों को मिलेगा बढ़ावा",
      summary: lead.summary || lead.summaryHi || "विशेष रिपोर्ट: ताज समाचार एवं मुख्य अपडेट्स।",
      image: lead.featuredImage || lead.imageUrl || lead.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
      pageRef: "पृष्ठ 3 पर"
    },
    secondaryStory: {
      title: secondary.title || secondary.titleHi || "राज्य की बड़ी खबर",
      summary: secondary.summary || secondary.summaryHi || "ताज़ा समाचार और विस्तृत विश्लेषण।",
      image: secondary.featuredImage || secondary.imageUrl || secondary.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      pageRef: "पृष्ठ 5 पर"
    },
    bottomStories: [
      {
        categoryHi: story3.category?.name || "देश-दुनिया",
        categoryEn: story3.category?.name || "World",
        title: story3.title || story3.titleHi || "अंतरराष्ट्रीय अपडेट",
        summary: story3.summary || story3.summaryHi || "मुख्य अंतरराष्ट्रीय अपडेट्स।",
        image: story3.featuredImage || story3.imageUrl || story3.image || "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80",
        pageRef: "पृष्ठ 8"
      },
      {
        categoryHi: story4.category?.name || "खेल",
        categoryEn: story4.category?.name || "Sports",
        title: story4.title || story4.titleHi || "खेल समाचार",
        summary: story4.summary || story4.summaryHi || "खेल जगत की बड़ी खबर।",
        image: story4.featuredImage || story4.imageUrl || story4.image || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80",
        pageRef: "पृष्ठ 12"
      },
      {
        categoryHi: story5.category?.name || "व्यापार",
        categoryEn: story5.category?.name || "Business",
        title: story5.title || story5.titleHi || "बिजनेस समाचार",
        summary: story5.summary || story5.summaryHi || "बिजनेस एवं बाजार अपडेट्स।",
        image: story5.featuredImage || story5.imageUrl || story5.image || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
        pageRef: "पृष्ठ 10"
      }
    ],
    pages: Array.from({ length: 16 }, (_, i) => ({
      pageNumber: i + 1,
      titleHi: `पृष्ठ ${i + 1} — ${i === 0 ? "मुख्य पृष्ठ" : i === 1 ? "राज्य" : i === 2 ? "विचार" : "समाचार"}`,
      titleEn: `Page ${i + 1} — ${i === 0 ? "Front Page" : i === 1 ? "State" : i === 2 ? "Opinion" : "News"}`
    }))
  };
}
