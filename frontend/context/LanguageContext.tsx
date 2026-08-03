"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "EN" | "HI";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    globalEdition: "Global Edition",
    subscribe: "Subscribe",
    live: "LIVE",
    logIn: "Log In",
    home: "Top News",
    latest: "Education",
    world: "World",
    india: "India",
    business: "Business",
    technology: "Technology",
    sports: "Sports",
    entertainment: "Entertainment",
    science: "Science",
    health: "Health",
    opinion: "Opinion",
    videos: "Videos",
    breakingNews: "BREAKING NEWS",
    search: "Search",
    searchPlaceholder: "Search news...",
    featuredStories: "FEATURED STORIES",
    latestNews: "LATEST NEWS",
    todaysTopStories: "TODAY'S TOP STORIES",
    trendingVideos: "Trending Videos",
    seeAllVideos: "See All Videos →",
    readMore: "Read More",
    trending: "TRENDING",
    hindiRegionalNews: "Hindi & Regional Spotlight",
    allRightsReserved: "All Rights Reserved",
    toggleText: "हिंदी",
    seeAll: "See all",
    politics: "Politics",
    defence: "Defence",
    diplomacy: "Diplomacy",
    national: "National",
    society: "Society",
    education: "Education",
    markets: "Markets",
    companies: "Companies",
    finance: "Finance",
    economy: "Economy",
    crypto: "Crypto",
    aiMl: "AI & ML",
    gadgets: "Gadgets",
    cloudSoftware: "Cloud & Software",
    spaceTech: "Space Tech",
    cybersecurity: "Cybersecurity",
    cricket: "Cricket",
    football: "Football",
    formula1: "Formula 1",
    olympics: "Olympics",
    movies: "Movies",
    tvSeries: "TV & Web Series",
    music: "Music",
    celebrity: "Celebrity",
    newsletterTitle: "Stay Ahead with The Global Morning Briefing",
    newsletterDesc: "Get curated editorial analysis, market intelligence, and breaking international updates delivered to your inbox every morning.",
    enterEmail: "Enter your email address...",
    subscribeBtn: "Subscribe Now",
    footerDesc: "Enterprise editorial media platform delivering world-class journalism, breaking updates, in-depth business analytics, and tech innovation.",
    categories: "Categories",
    company: "Company",
    aboutUs: "About Us",
    careers: "Careers",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    poweredBy: "Powered by Next.js & Express Architecture",
    by: "By",
    minRead: "min read",
    category: "Category",
    duration: "Duration",
    openVideoPortal: "Open Video Portal"
  },
  HI: {
    globalEdition: "ग्लोबल संस्करण",
    subscribe: "सदस्यता लें",
    live: "लाइव",
    logIn: "लॉग इन",
    home: "टॉप न्यूज़",
    latest: "शिक्षा",
    world: "विदेश",
    india: "भारत",
    business: "व्यापार",
    technology: "तकनीक",
    sports: "खेल",
    entertainment: "मनोरंजन",
    science: "विज्ञान",
    health: "स्वास्थ्य",
    opinion: "विचार",
    videos: "वीडियो",
    breakingNews: "ताज़ा समाचार",
    search: "खोजें",
    searchPlaceholder: "समाचार खोजें...",
    featuredStories: "प्रमुख समाचार",
    latestNews: "नवीनतम समाचार",
    todaysTopStories: "आज की मुख्य कहानियां",
    trendingVideos: "ट्रेंडिंग वीडियो",
    seeAllVideos: "सभी वीडियो देखें →",
    readMore: "और पढ़ें",
    trending: "ट्रेंडिंग",
    hindiRegionalNews: "हिंदी एवं क्षेत्रीय समाचार",
    allRightsReserved: "सर्वाधिकार सुरक्षित",
    toggleText: "English",
    seeAll: "सभी देखें",
    politics: "राजनीति",
    defence: "रक्षा",
    diplomacy: "कूटनीति",
    national: "राष्ट्रीय",
    society: "समाज",
    education: "शिक्षा",
    markets: "शेयर बाजार",
    companies: "कंपनियां",
    finance: "वित्त",
    economy: "अर्थव्यवस्था",
    crypto: "क्रिप्टो",
    aiMl: "एआई और मशीन लर्निंग",
    gadgets: "गेजेट्स",
    cloudSoftware: "क्लाउड और सॉफ्टवेयर",
    spaceTech: "अंतरिक्ष तकनीक",
    cybersecurity: "साइबर सुरक्षा",
    cricket: "क्रिकेट",
    football: "फुटबॉल",
    formula1: "फॉर्मूला 1",
    olympics: "ओलंपिक",
    movies: "सिनेमा",
    tvSeries: "टीवी और वेब सीरीज",
    music: "संगीत",
    celebrity: "सेलेब्रिटी",
    newsletterTitle: "ग्लोबल मॉर्निंग ब्रीफिंग के साथ आगे रहें",
    newsletterDesc: "हर सुबह अपने इनबॉक्स में संपादकीय विश्लेषण, बाजार की जानकारी और ताज़ा अंतरराष्ट्रीय अपडेट प्राप्त करें।",
    enterEmail: "अपना ईमेल पता दर्ज करें...",
    subscribeBtn: "अभी सब्सक्राइब करें",
    footerDesc: "विश्वस्तरीय पत्रकारिता, ताज़ा समाचार, गहन व्यावसायिक विश्लेषण और तकनीकी नवाचार देने वाला प्रमुख मीडिया संस्थान।",
    categories: "श्रेणियां",
    company: "कंपनी",
    aboutUs: "हमारे बारे में",
    careers: "करियर",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "सेवा की शर्तें",
    poweredBy: "नेक्स्ट.जेएस एवं एक्सप्रेस आर्किटेक्चर द्वारा संचालित",
    by: "द्वारा",
    minRead: "मिनट पढ़ें",
    category: "श्रेणी",
    duration: "अवधि",
    openVideoPortal: "वीडियो पोर्टल खोलें"
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("HI");

  useEffect(() => {
    const savedLang = localStorage.getItem("ga_language") as Language;
    if (savedLang === "EN" || savedLang === "HI") {
      setLangState(savedLang);
      document.documentElement.setAttribute("lang", savedLang.toLowerCase());
    } else {
      setLangState("HI");
      document.documentElement.setAttribute("lang", "hi");
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("ga_language", newLang);
    document.documentElement.setAttribute("lang", newLang.toLowerCase());
  };

  const toggleLang = () => {
    const nextLang = lang === "EN" ? "HI" : "EN";
    setLang(nextLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["EN"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
