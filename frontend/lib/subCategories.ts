export interface SubCategoryItem {
  en: string;
  hi: string;
}

export const MASTER_SUB_CATEGORIES: Record<string, SubCategoryItem[]> = {
  education: [
    { en: "Education News", hi: "शिक्षा समाचार" },
    { en: "Board Exams (10th/12th)", hi: "बोर्ड परीक्षा (10वीं/12वीं)" },
    { en: "Competitive Exams (UPSC/JEE/NEET)", hi: "प्रतियोगी परीक्षाएं" },
    { en: "College & Admissions", hi: "कॉलेज और प्रवेश" },
    { en: "Career Guidance", hi: "करियर मार्गदर्शन" }
  ],
  world: [
    { en: "International Affairs", hi: "अंतरराष्ट्रीय मामले" },
    { en: "World Politics", hi: "वैश्विक राजनीति" },
    { en: "Defence & Security", hi: "रक्षा व सुरक्षा" },
    { en: "Diplomacy", hi: "कूटनीति व संबंध" },
    { en: "Global Economy", hi: "ग्लोबल अर्थव्यवस्था" }
  ],
  india: [
    { en: "National News", hi: "राष्ट्रीय समाचार" },
    { en: "State Spotlight", hi: "राज्य मुख्य समाचार" },
    { en: "Governance & Society", hi: "शासन व समाज" }
  ],
  business: [
    { en: "Stock Markets", hi: "शेयर बाज़ार" },
    { en: "Companies & Startups", hi: "कंपनियां व स्टार्ट-अप" },
    { en: "Personal Finance & Tax", hi: "पर्सनल फाइनेंस" },
    { en: "Economy", hi: "अर्थव्यवस्था" },
    { en: "Crypto & Banking", hi: "क्रिप्टो व बैंकिंग" }
  ],
  technology: [
    { en: "AI & Machine Learning", hi: "एआई और मशीन लर्निंग" },
    { en: "Smartphones & Gadgets", hi: "स्मार्टफोन और गैजेट्स" },
    { en: "Cloud & Software", hi: "सॉफ्टवेयर और ऐप्स" },
    { en: "Space Tech", hi: "अंतरिक्ष तकनीक" },
    { en: "Cybersecurity", hi: "साइबर सुरक्षा" }
  ],
  sports: [
    { en: "Cricket", hi: "क्रिकेट" },
    { en: "Football", hi: "फुटबॉल" },
    { en: "Formula 1", hi: "फॉर्मूला 1" },
    { en: "Olympics & Athletics", hi: "ओलंपिक व अन्य खेल" }
  ],
  entertainment: [
    { en: "Cinema & Movies", hi: "सिनेमा और फिल्में" },
    { en: "OTT & Web Series", hi: "ओटीटी और वेब सीरीज" },
    { en: "Music & Songs", hi: "म्यूजिक और गाने" },
    { en: "Celebrity Updates", hi: "सेलेब्रिटी अपडेट्स" }
  ],
  science: [
    { en: "Space Exploration", hi: "अंतरिक्ष अनुसंधान" },
    { en: "Innovations & Discoveries", hi: "नवाचार व खोजें" },
    { en: "Environment & Climate", hi: "पर्यावरण व जलवायु" }
  ],
  health: [
    { en: "Fitness & Yoga", hi: "फिटनेस और योग" },
    { en: "Nutrition & Diet", hi: "आहार और पोषण" },
    { en: "Medical Breakthroughs", hi: "चिकित्सा शोध" }
  ],
  opinion: [
    { en: "Daily Editorials", hi: "दैनिक संपादकीय" },
    { en: "Expert Columns", hi: "विशेषज्ञ दृष्टिकोण" },
    { en: "Special Reports", hi: "विशेष विश्लेषणात्मक रिपोर्ट" }
  ],
  videos: [
    { en: "Trending Video Clips", hi: "ट्रेंडिंग वीडियो" },
    { en: "Ground Reports", hi: "ग्राउंड रिपोर्ट" },
    { en: "Documentaries", hi: "वृत्तचित्र" }
  ],
  latest: [
    { en: "Top Headlines", hi: "मुख्य समाचार" },
    { en: "Breaking News", hi: "ब्रेकिंग न्यूज़" },
    { en: "Editor's Choice", hi: "संपादकीय पसंद" }
  ]
};

export function getSubCategories(categoryKey: string): SubCategoryItem[] {
  if (!categoryKey) return [];
  const key = categoryKey.trim().toLowerCase();

  if (MASTER_SUB_CATEGORIES[key]) return MASTER_SUB_CATEGORIES[key];

  if (key.includes("educat") || key.includes("शिक्षा")) return MASTER_SUB_CATEGORIES.education;
  if (key.includes("world") || key.includes("विदेश")) return MASTER_SUB_CATEGORIES.world;
  if (key.includes("india") || key.includes("भारत")) return MASTER_SUB_CATEGORIES.india;
  if (key.includes("busin") || key.includes("व्यापार")) return MASTER_SUB_CATEGORIES.business;
  if (key.includes("tech") || key.includes("तकनीक")) return MASTER_SUB_CATEGORIES.technology;
  if (key.includes("sport") || key.includes("खेल")) return MASTER_SUB_CATEGORIES.sports;
  if (key.includes("entert") || key.includes("मनोरंजन")) return MASTER_SUB_CATEGORIES.entertainment;
  if (key.includes("scien") || key.includes("विज्ञान")) return MASTER_SUB_CATEGORIES.science;
  if (key.includes("health") || key.includes("स्वास्थ्य")) return MASTER_SUB_CATEGORIES.health;
  if (key.includes("opini") || key.includes("विचार")) return MASTER_SUB_CATEGORIES.opinion;
  if (key.includes("video") || key.includes("वीडियो")) return MASTER_SUB_CATEGORIES.videos;
  if (key.includes("top") || key.includes("मुख्य") || key.includes("latest") || key.includes("ताज़ा")) return MASTER_SUB_CATEGORIES.latest;

  return [];
}
