export interface AboutPageData {
  heroTagHi: string;
  heroTagEn: string;
  heroTitle: string;
  heroSubHi: string;
  heroSubEn: string;
  stats: Array<{ num: string; labelHi: string; labelEn: string }>;
  missionTitleHi: string;
  missionTitleEn: string;
  missionDescHi: string;
  missionDescEn: string;
  visionTitleHi: string;
  visionTitleEn: string;
  visionDescHi: string;
  visionDescEn: string;
  pillarsTitleHi: string;
  pillarsTitleEn: string;
  pillarsSubHi: string;
  pillarsSubEn: string;
  pillars: Array<{ titleHi: string; titleEn: string; descHi: string; descEn: string }>;
  ethicsTagHi: string;
  ethicsTagEn: string;
  ethicsTitleHi: string;
  ethicsTitleEn: string;
  ethicsDescHi: string;
  ethicsDescEn: string;
  ethicsPoints: Array<{ textHi: string; textEn: string }>;
  newsroomEmail: string;
  addressHi: string;
  addressEn: string;
  contactEmail1: string;
  contactEmail2: string;
  phone1: string;
  phone2: string;
}

export const defaultAboutData: AboutPageData = {
  heroTagHi: "हमारे बारे में",
  heroTagEn: "About Us",
  heroTitle: "GLOBAL AWAAZ",
  heroSubHi: "विश्वसनीय पत्रकारिता, निष्पक्ष विश्लेषण और त्वरित समाचार कवरेज का अग्रणी डिजिटल मीडिया प्लेटफॉर्म — LOCAL से GLOBAL तक।",
  heroSubEn: "A leading digital media platform committed to trusted journalism, unbiased analysis, and real-time coverage — from local towns to global headlines.",
  stats: [
    { num: "10M+", labelHi: "मासिक पाठक", labelEn: "Monthly Readers" },
    { num: "50+", labelHi: "वरिष्ठ पत्रकार", labelEn: "Senior Journalists" },
    { num: "24/7", labelHi: "लाइव कवरेज", labelEn: "Live Coverage" },
    { num: "100%", labelHi: "सटीक एवं निष्पक्ष", labelEn: "Accuracy & Trust" }
  ],
  missionTitleHi: "हमारा मिशन (Our Mission)",
  missionTitleEn: "Our Mission",
  missionDescHi: "ग्लोबल आवाज का उद्देश्य देश और दुनिया के हर नागरिक तक बिना किसी पक्षपात के सटीक, सत्य और तथ्य-आधारित समाचार पहुंचाना है। हम जमीनी मुद्दों, शासन की पारदर्शिता और समाज के हर वर्ग की आवाज को प्रमुखता से उठाते हैं।",
  missionDescEn: "Our mission at Global Awaaz is to deliver accurate, truthful, and evidence-based news to readers worldwide without bias. We focus on ground-level reporting, transparency, and elevating voices across society.",
  visionTitleHi: "हमारा विज़न (Our Vision)",
  visionTitleEn: "Our Vision",
  visionDescHi: "डिजिटल युग में पत्रकारिता के उच्चतम मानकों को स्थापित करना। हम अंतरराष्ट्रीय समाचारों के साथ-साथ स्थानीय क्षेत्रों (Local News) की ताज़ा जानकारियों को आधुनिक तकनीक के माध्यम से सुलभ बनाते हैं।",
  visionDescEn: "To set the highest benchmarks for journalism in the digital age. Combining international coverage with deep local reporting accessible across modern web and mobile apps.",
  pillarsTitleHi: "ग्लोबल आवाज के मुख्य स्तंभ",
  pillarsTitleEn: "Core Pillars of Global Awaaz",
  pillarsSubHi: "पत्रकारिता के वे सिद्धांत जिन पर हमारी संस्था की नींव टिकी है",
  pillarsSubEn: "The editorial principles that guide every story we publish",
  pillars: [
    {
      titleHi: "100% सत्यता एवं निष्पक्षता",
      titleEn: "Unbiased Integrity",
      descHi: "बिना किसी राजनीतिक या व्यावसायिक दबाव के स्वतंत्र पत्रकारिता।",
      descEn: "Independent journalism free from political or commercial influence."
    },
    {
      titleHi: "त्वरित एवं रियल-टाइम अपडेट",
      titleEn: "Real-Time Updates",
      descHi: "ब्रेकिंग न्यूज़ और ताज़ा समाचार 24 घंटे सीधे आप तक।",
      descEn: "Breaking news & live coverage delivered instantly to readers."
    },
    {
      titleHi: "गहन व्यावसायिक विश्लेषण",
      titleEn: "In-Depth Analysis",
      descHi: "बाजार, अर्थव्यवस्था और नीति पर विशेषज्ञों की विस्तृत रिपोर्ट।",
      descEn: "Expert analysis on markets, economy, and national policy."
    },
    {
      titleHi: "जनता की आवाज",
      titleEn: "Voice of People",
      descHi: "स्थानीय जन-समस्याओं को राष्ट्रीय पटल पर उजागर करना।",
      descEn: "Bringing local grassroots issues to the national spotlight."
    }
  ],
  ethicsTagHi: "संपादकीय प्रतिबद्धता",
  ethicsTagEn: "Editorial Ethics",
  ethicsTitleHi: "तथ्य, पारदर्शिता और जनहित हमारी प्राथमिकता है",
  ethicsTitleEn: "Accuracy, Transparency, & Public Interest First",
  ethicsDescHi: "ग्लोबल आवाज के सभी समाचार और रिपोर्ट कड़ी तथ्य-जांच (Fact Check) प्रक्रिया से गुजरते हैं। हम किसी भी भ्रामक जानकारी या सनसनीखेज खबरों को बढ़ावा नहीं देते।",
  ethicsDescEn: "Every story published on Global Awaaz undergoes strict fact-checking. We adhere strictly to ethical guidelines, eschewing clickbait in favor of verified journalism.",
  ethicsPoints: [
    { textHi: "सख्त तथ्य-जांच (Rigorous Fact Checking)", textEn: "Rigorous Fact Checking" },
    { textHi: "स्रोत की पुष्टि (Verified Source Standards)", textEn: "Verified Source Standards" },
    { textHi: "त्रुटि संशोधन की पारदर्शी नीति", textEn: "Transparent Correction Policy" }
  ],
  newsroomEmail: "newsroom@globalawaaz.com",
  addressHi: "Global Awaaz Media Tower, बाराखंबा रोड, कनाट प्लेस, नई दिल्ली - 110001",
  addressEn: "Global Awaaz Media Tower, Barakhamba Road, Connaught Place, New Delhi - 110001",
  contactEmail1: "contact@globalawaaz.com",
  contactEmail2: "editor@globalawaaz.com",
  phone1: "+91 (011) 4567-8900",
  phone2: "+91 (011) 4567-8901"
};

export const LOCAL_STORAGE_ABOUT_KEY = "ga_about_page_content";

export function getStoredAboutData(): AboutPageData {
  if (typeof window === "undefined") return defaultAboutData;
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_ABOUT_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      return { ...defaultAboutData, ...parsed };
    }
  } catch (e) {}
  return defaultAboutData;
}
