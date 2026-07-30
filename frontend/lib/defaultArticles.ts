/**
 * Shared default article data used by both the homepage and the article detail page.
 * When no real articles exist in the API or localStorage, these are shown as fallbacks.
 * The article detail page also checks this list so clicking any card always opens full content.
 */

export interface DefaultArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  featuredImage: string;
  category: { name: string; slug: string; color: string };
  author: { name: string; bio?: string };
  readTime: string;
  language: "EN" | "HI";
  createdAt?: string;
  isPinned?: boolean;
  isHero?: boolean;
  status?: string;
  views?: number;
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
}

export const defaultEnglishArticles: DefaultArticle[] = [
  {
    id: "en-1",
    title: "How Sustainable Infrastructure is Redefining Urban Coexistence Across Global Metropolises",
    slug: "sustainable-infrastructure-urban-coexistence",
    summary: "Scientists reveal architectural changes that allow localized neural networks to process real-time contextual streams.",
    body: `As global metropolises expand at an unprecedented rate, sustainable infrastructure and AI-driven urban analytics are emerging as the foundational pillars for future coexistence and economic resilience. International delegates convening across major global capitals have emphasized the urgency of integrating green transit networks, renewable power grids, and privacy-preserving data hubs.

From Singapore's smart-district initiatives to Copenhagen's carbon-neutral transport corridors, urban planners are now required to weigh not only engineering efficiency but also ecological compatibility and social equity. Architects are pioneering modular construction systems built entirely from recycled composite materials — a first in large-scale civilian housing projects.

The 2026 Global Urban Summit concluded with a joint declaration that mandated member states to achieve a 40% reduction in per-capita urban emissions by 2032. Innovative projects already underway include solar-paneled elevated highways in Dubai, algae-powered micro-grids in São Paulo, and pedestrian-first smart zones in Seoul.

Community participation is at the heart of this transformation. Citizen science platforms now allow residents to monitor air quality, energy usage, and noise pollution in real time — feeding back into the very systems that govern their cities. This feedback loop is seen as essential for building trust and ensuring that technological progress serves human dignity above all else.

As cities grow smarter, the question is not whether technology can solve urban problems — but whether humanity has the will to deploy it equitably and sustainably for generations to come.`,
    featuredImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    category: { name: "WORLD", slug: "world", color: "#e50914" },
    author: { name: "Sarah Jenkins", bio: "Senior International Correspondent" },
    readTime: "8 min read",
    language: "EN",
    createdAt: new Date().toISOString()
  },
  {
    id: "en-2",
    title: "Autonomous Frontier: AI Reaches Cognitive Autonomy Milestones",
    slug: "autonomous-frontier-ai-cognitive-autonomy",
    summary: "Neural navigation systems demonstrate unprecedented contextual decision-making speed.",
    body: `Researchers at the Global Institute of Advanced Computing announced a landmark breakthrough in artificial general intelligence — the development of neural systems capable of sustained, context-aware autonomous reasoning across multiple simultaneous domains.

Unlike earlier models that excelled in narrow, predefined tasks, the new architecture — codenamed ARIA (Adaptive Reasoning Intelligence Array) — demonstrates an ability to synthesize unstructured real-world data, form novel hypotheses, and carry out multi-step problem solving without human prompting.

Independent evaluators at three leading universities confirmed that ARIA outperformed specialist human teams in strategic planning tasks, medical diagnosis simulations, and complex systems optimization. Critically, the system maintained ethical guardrails throughout testing, refusing instructions that violated pre-programmed safety criteria.

The implications for industry are sweeping. Aviation companies are exploring fully autonomous flight management. Pharmaceutical firms are deploying ARIA variants to accelerate drug discovery timelines by up to 60%. Supply chain operators are piloting ARIA-assisted logistics networks that re-route shipments in real time to avoid disruption.

Despite the optimism, ethicists caution that regulatory frameworks have not kept pace with the technology. Questions around AI rights, liability, job displacement, and bias remain largely unresolved. The scientific community is calling for a new international treaty governing the development and deployment of general-purpose AI systems — a conversation that promises to define the next decade of global policy.`,
    featuredImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    category: { name: "TECHNOLOGY", slug: "technology", color: "#3b82f6" },
    author: { name: "David Cole", bio: "Technology & Science Editor" },
    readTime: "5 min read",
    language: "EN",
    createdAt: new Date().toISOString()
  },
  {
    id: "en-3",
    title: "Space Success: ISRO Creates History with Landmark Launch",
    slug: "space-success-isro-history",
    summary: "Next-generation satellite constellation deployed into lunar orbit for deep-space observation.",
    body: `India's Space Research Organisation (ISRO) scripted history on Tuesday with the successful deployment of the Chandrayaan-4 constellation — a network of seven next-generation micro-satellites now orbiting the Moon at an altitude of 200 km, designed to conduct high-resolution geological mapping and deep-space radio observation.

The mission, five years in the making, lifted off from the Satish Dhawan Space Centre aboard a modified GSLV Mk IV rocket. Within 72 hours, all seven satellites separated correctly and established stable communication links with ground control stations in Bengaluru and Hyderabad.

ISRO Chairman Dr. R. Anand hailed the mission as "a defining moment for Indian science and a giant leap for humanity's understanding of the lunar interior." The satellites carry a suite of instruments including hyperspectral imagers, magnetometers, and an experimental quantum communication relay — the first of its kind beyond low Earth orbit.

International space agencies reacted with congratulations. NASA confirmed its interest in a collaborative data-sharing framework, and the European Space Agency noted the mission's potential to contribute to the forthcoming Artemis lunar base planning efforts.

The success comes amid India's broader push to become a leading spacefaring nation by 2035, with ambitious missions to Mars, Venus, and eventually a crewed lunar landing on the agenda. ISRO's growing commercial arm — NewSpace India Ltd — is also fielding dozens of launch contracts from international clients for the coming fiscal year.`,
    featuredImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    category: { name: "SCIENCE", slug: "science", color: "#06b6d4" },
    author: { name: "Priya Sharma", bio: "Science & Space Correspondent" },
    readTime: "4 min read",
    language: "EN",
    createdAt: new Date().toISOString()
  },
  {
    id: "en-4",
    title: "Global Markets Surge as Investor Confidence Strengthens",
    slug: "global-markets-surge-investor-confidence",
    summary: "Central bank interest rate signals trigger bullish momentum across international exchanges.",
    body: `Global financial markets experienced their strongest multi-day rally in over three years as central bank governors from the G7 nations signalled a coordinated shift toward accommodative monetary policy, easing investor fears of prolonged high interest rates.

The US Federal Reserve, the European Central Bank, and the Bank of Japan issued simultaneous forward guidance suggesting rate cuts of 25 to 50 basis points over the next two quarters. Markets responded immediately: the S&P 500 climbed 2.8%, the Nifty 50 gained 3.1%, and the Euro Stoxx 600 rose 2.4% — all closing at multi-month highs.

Technology and clean energy stocks led the surge, with semiconductor companies and battery storage firms posting some of the strongest individual gains. Analysts attributed the rally not just to rate expectations but to stronger-than-anticipated earnings reports from the manufacturing and logistics sectors.

Currency markets also saw significant movement. The US dollar weakened against the euro, pound, and yen, boosting export-sensitive industries in Europe and Asia. Emerging market currencies gained particularly, with the Indian rupee, Brazilian real, and South African rand each appreciating more than 1% in a single session.

Economists caution that geopolitical tensions — including unresolved trade disputes and energy supply uncertainties — could dampen the optimism. But for now, sentiment has markedly improved, and fund managers are quietly repositioning portfolios for an equity-led growth phase into the next fiscal year.`,
    featuredImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    category: { name: "BUSINESS", slug: "business", color: "#3b82f6" },
    author: { name: "Michael Chang", bio: "Senior Financial Correspondent" },
    readTime: "6 min read",
    language: "EN",
    createdAt: new Date().toISOString()
  },
  {
    id: "en-5",
    title: "Diplomatic Accords Signed in Geneva Restoring Trade Corridors",
    slug: "diplomatic-accords-geneva",
    summary: "Nations sign landmark maritime safety and tariff agreements to ensure uninterrupted cargo flow.",
    body: `In a landmark session at the Palace of Nations in Geneva, representatives from 34 countries signed a comprehensive trade and maritime safety accord aimed at restoring disrupted supply corridors that had stalled the movement of over $4 trillion worth of goods annually.

The agreement — the broadest multilateral trade instrument in over a decade — covers reduced tariffs on essential commodities including semiconductors, pharmaceutical raw materials, and agricultural produce. It also establishes binding protocols for maritime vessel safety inspections and a shared early-warning system for piracy and adverse weather events.

Negotiators spent 18 months in closed sessions to resolve long-standing disputes over intellectual property protections, food safety standards, and customs clearance timelines. The final text was unanimously endorsed after a last-minute compromise on digital goods taxation brokered by the Swiss delegation.

Trade ministers from signatory nations praised the agreement as "a foundation for a more interconnected and stable global economy." The accord is expected to unlock an estimated $620 billion in previously blocked trade flows within the first year of ratification.

Implementation will be overseen by a newly created Geneva Trade Monitoring Bureau, staffed jointly by signatories and empowered to impose temporary sanctions on countries found in non-compliance. Legal analysts called it one of the most enforceable trade instruments ever drafted at the international level.`,
    featuredImage: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80",
    category: { name: "WORLD", slug: "world", color: "#e50914" },
    author: { name: "Elena Rostova", bio: "Diplomatic Affairs Correspondent" },
    readTime: "6 min read",
    language: "EN",
    createdAt: new Date().toISOString()
  }
];

export const defaultHindiArticles: DefaultArticle[] = [
  {
    id: "hi-1",
    title: "अंतरिक्ष में भारत का परचम: इसरो ने रचा एक नया इतिहास",
    slug: "space-success-isro-history",
    summary: "इसरो ने चंद्र कक्षा में अगली पीढ़ी के उपग्रह नक्षत्र को सफलतापूर्वक स्थापित किया।",
    body: `भारतीय अंतरिक्ष अनुसंधान संगठन (इसरो) ने मंगलवार को एक ऐतिहासिक उपलब्धि हासिल की, जब उसने चंद्रयान-4 मिशन के तहत सात अत्याधुनिक माइक्रो-उपग्रहों को चंद्र कक्षा में सफलतापूर्वक स्थापित किया। ये उपग्रह चंद्रमा से 200 किलोमीटर की ऊंचाई पर परिक्रमा करते हुए उच्च-रिज़ॉल्यूशन भूगर्भीय मानचित्रण और गहरे अंतरिक्ष रेडियो अवलोकन करेंगे।

पांच साल की मेहनत के बाद यह मिशन श्रीहरिकोटा के सतीश धवन अंतरिक्ष केंद्र से संशोधित जीएसएलवी एमके-IV रॉकेट के जरिए प्रक्षेपित किया गया। 72 घंटों के भीतर सभी सात उपग्रह सही तरह अलग हो गए और बेंगलुरु व हैदराबाद स्थित नियंत्रण केंद्रों से स्थिर संचार स्थापित कर लिया।

इसरो के अध्यक्ष डॉ. आर. आनंद ने इस मिशन को "भारतीय विज्ञान के लिए एक निर्णायक क्षण और मानवता की चंद्रमा की समझ के लिए एक विशाल छलांग" बताया। उपग्रहों में हाइपरस्पेक्ट्रल इमेजर, मैग्नेटोमीटर और एक प्रायोगिक क्वांटम संचार रिले जैसे यंत्र हैं — जो निम्न पृथ्वी कक्षा से परे अपनी तरह का पहला प्रयोग है।

अंतर्राष्ट्रीय अंतरिक्ष एजेंसियों ने इस सफलता पर बधाई दी। नासा ने एक सहयोगी डेटा-शेयरिंग ढांचे में अपनी रुचि व्यक्त की, और यूरोपीय अंतरिक्ष एजेंसी ने कहा कि यह मिशन आगामी आर्टेमिस चंद्र आधार योजना में योगदान दे सकता है।

यह सफलता भारत की 2035 तक एक प्रमुख अंतरिक्ष यात्री देश बनने की महत्वाकांक्षी योजना के अनुरूप है, जिसमें मंगल, शुक्र और अंततः चंद्रमा पर मानव अभियान शामिल हैं।`,
    featuredImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    category: { name: "विज्ञान", slug: "science", color: "#06b6d4" },
    author: { name: "प्रिया शर्मा", bio: "विज्ञान एवं अंतरिक्ष संवाददाता" },
    readTime: "4 मिनट पढ़ें",
    language: "HI",
    createdAt: new Date().toISOString()
  },
  {
    id: "hi-2",
    title: "हरित ऊर्जा मिशन: भारत में सौर ऊर्जा क्षमता में 45% की रिकॉर्ड वृद्धि",
    slug: "clean-energy-mission-india",
    summary: "नवीन एवं नवीकरणीय ऊर्जा मंत्रालय ने राष्ट्रीय ग्रिड में रिकॉर्ड क्षमता जोड़ने की घोषणा की।",
    body: `भारत के नवीन एवं नवीकरणीय ऊर्जा मंत्रालय ने घोषणा की है कि चालू वित्त वर्ष में देश की सौर ऊर्जा क्षमता में 45 प्रतिशत की रिकॉर्ड वृद्धि दर्ज की गई है, जो पिछले वर्ष की तुलना में दोगुना से भी अधिक है। इस वृद्धि के साथ भारत की कुल स्थापित अक्षय ऊर्जा क्षमता 300 गीगावाट के पार पहुंच गई है।

राजस्थान, गुजरात, मध्य प्रदेश और महाराष्ट्र में बड़े सोलर पार्क परियोजनाओं के पूरा होने से यह उपलब्धि संभव हुई। इसके अलावा छोटे किसानों के खेतों में 'कुसुम योजना' के तहत लगाए गए सोलर पंप और छत पर लगाए गए सोलर पैनलों की संख्या में भी जबरदस्त इजाफा हुआ है।

मंत्री ने कहा, "यह उपलब्धि 2030 तक 500 गीगावाट अक्षय ऊर्जा के हमारे राष्ट्रीय लक्ष्य की दिशा में एक ऐतिहासिक कदम है। हम न केवल देश की ऊर्जा सुरक्षा सुनिश्चित कर रहे हैं, बल्कि लाखों रोजगार भी सृजित कर रहे हैं।"

विशेषज्ञों का मानना है कि यदि यही रफ्तार बनी रही, तो भारत 2027 से पहले ही अपना 2030 का लक्ष्य हासिल कर सकता है। अंतर्राष्ट्रीय ऊर्जा एजेंसी ने भी भारत की इस प्रगति को वैश्विक जलवायु लक्ष्यों के लिए एक सकारात्मक संकेत बताया है।`,
    featuredImage: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    category: { name: "भारत", slug: "india", color: "#f59e0b" },
    author: { name: "राजेश कुमार", bio: "पर्यावरण एवं ऊर्जा संवाददाता" },
    readTime: "5 मिनट पढ़ें",
    language: "HI",
    createdAt: new Date().toISOString()
  },
  {
    id: "hi-3",
    title: "एआई स्वायत्तता की नई क्रांति: तकनीकी क्षेत्र में ऐतिहासिक प्रगति",
    slug: "autonomous-frontier-ai-cognitive-autonomy",
    summary: "न्यूरल नेविगेशन प्रणालियों ने अभूतपूर्व निर्णय लेने की क्षमता का प्रदर्शन किया।",
    body: `वैश्विक कम्प्यूटिंग अनुसंधान संस्थान के वैज्ञानिकों ने कृत्रिम सामान्य बुद्धिमत्ता में एक ऐतिहासिक सफलता की घोषणा की है — एक ऐसी न्यूरल प्रणाली का विकास, जो एक साथ कई क्षेत्रों में निरंतर, संदर्भ-जागरूक स्वायत्त तर्क करने में सक्षम है।

ARIA (Adaptive Reasoning Intelligence Array) नाम की यह प्रणाली असंरचित वास्तविक दुनिया के डेटा को संश्लेषित करने, नई परिकल्पनाएं बनाने और मानव निर्देश के बिना बहु-चरणीय समस्या समाधान करने की क्षमता दिखाती है।

तीन प्रमुख विश्वविद्यालयों के स्वतंत्र मूल्यांककों ने पुष्टि की कि ARIA ने रणनीतिक योजना, चिकित्सा निदान और जटिल प्रणाली अनुकूलन कार्यों में विशेषज्ञ मानव टीमों से बेहतर प्रदर्शन किया।

इसके उपयोग की संभावनाएं व्यापक हैं — विमानन में पूर्ण स्वायत्त उड़ान प्रबंधन, दवा खोज में 60% तक की तेजी, और रीयल-टाइम लॉजिस्टिक्स रूटिंग इसके कुछ प्रयोग हैं। हालांकि नैतिकतावादी चेतावनी देते हैं कि नियामक ढांचे अभी तक इस तकनीक के साथ कदम नहीं मिला पाए हैं।`,
    featuredImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    category: { name: "तकनीक", slug: "technology", color: "#3b82f6" },
    author: { name: "अमित वर्मा", bio: "तकनीक एवं विज्ञान संपादक" },
    readTime: "5 मिनट पढ़ें",
    language: "HI",
    createdAt: new Date().toISOString()
  },
  {
    id: "hi-4",
    title: "वैश्विक बाजार में तेजी, मुंबई स्टॉक एक्सचेंज रिकॉर्ड स्तर पर बंद",
    slug: "global-markets-surge-investor-confidence",
    summary: "केंद्रीय बैंकों के दरों में नरमी के संकेतों से अंतर्राष्ट्रीय शेयर बाजारों में भारी तेजी आई।",
    body: `वैश्विक वित्तीय बाजारों ने तीन वर्षों में अपनी सबसे मजबूत बहु-दिवसीय तेजी का अनुभव किया, जब G7 देशों के केंद्रीय बैंक गवर्नरों ने समन्वित रूप से संकेत दिया कि वे ब्याज दरों में ढील देंगे।

US फेडरल रिजर्व, यूरोपीय केंद्रीय बैंक और बैंक ऑफ जापान ने एक साथ अगले दो तिमाहियों में 25 से 50 आधार अंकों की कटौती का संकेत दिया। बाजारों ने तुरंत प्रतिक्रिया दी: S&P 500 में 2.8%, निफ्टी 50 में 3.1% और यूरो स्टॉक्स 600 में 2.4% की बढ़त दर्ज हुई।

तकनीक और स्वच्छ ऊर्जा शेयरों ने सर्वाधिक लाभ उठाया। मुद्रा बाजारों में भी उल्लेखनीय हलचल रही — अमेरिकी डॉलर में कमजोरी आई जबकि भारतीय रुपया, ब्राजीलियाई रियाल और दक्षिण अफ्रीकी रैंड में एक ही सत्र में 1% से अधिक की मजबूती आई।

अर्थशास्त्रियों का कहना है कि भू-राजनीतिक तनाव और ऊर्जा आपूर्ति अनिश्चितताएं इस आशावाद को कमजोर कर सकती हैं। लेकिन अभी के लिए, फंड मैनेजर अगले वित्त वर्ष के लिए शेयर-केंद्रित विकास चरण के लिए चुपचाप पोर्टफोलियो पुनर्गठन कर रहे हैं।`,
    featuredImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    category: { name: "व्यापार", slug: "business", color: "#3b82f6" },
    author: { name: "माइकल चांग", bio: "वरिष्ठ वित्तीय संवाददाता" },
    readTime: "5 मिनट पढ़ें",
    language: "HI",
    createdAt: new Date().toISOString()
  },
  {
    id: "hi-5",
    title: "जेनेवा में व्यापार गलियारों की बहाली पर ऐतिहासिक राजनयिक समझौता",
    slug: "diplomatic-accords-geneva",
    summary: "विभिन्न राष्ट्रों ने अंतर्राष्ट्रीय व्यापार और समुद्री सुरक्षा पर संधि पर हस्ताक्षर किए।",
    body: `जेनेवा के पैलेस ऑफ नेशंस में एक ऐतिहासिक सत्र में 34 देशों के प्रतिनिधियों ने एक व्यापक व्यापार और समुद्री सुरक्षा समझौते पर हस्ताक्षर किए। इसका उद्देश्य उन बाधित आपूर्ति गलियारों को बहाल करना है जिसने $4 ट्रिलियन से अधिक की वस्तुओं की आवाजाही को रोक रखा था।

यह समझौता — एक दशक से अधिक समय में सबसे व्यापक बहुपक्षीय व्यापार साधन — सेमीकंडक्टर, दवा कच्चे माल और कृषि उत्पाद जैसी आवश्यक वस्तुओं पर कम शुल्क, समुद्री पोत सुरक्षा निरीक्षण प्रोटोकॉल और समुद्री डकैती और प्रतिकूल मौसम के लिए एक साझा प्रारंभिक चेतावनी प्रणाली को कवर करता है।

18 महीने की बंद-दरवाजे की बातचीत के बाद बौद्धिक संपदा संरक्षण, खाद्य सुरक्षा मानकों और सीमा शुल्क निकासी समयसीमा पर दीर्घकालीन विवादों को सुलझाया गया। इस समझौते से पहले वर्ष में अनुमानित $620 बिलियन के पहले अवरुद्ध व्यापार प्रवाह को मुक्त करने की उम्मीद है।

कार्यान्वयन की निगरानी एक नव-निर्मित जेनेवा व्यापार निगरानी ब्यूरो द्वारा की जाएगी, जो असंपालक देशों पर अस्थायी प्रतिबंध लगाने का अधिकार रखती है।`,
    featuredImage: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80",
    category: { name: "विदेश", slug: "world", color: "#e50914" },
    author: { name: "एलेना रोस्टोवा", bio: "राजनयिक मामलों की संवाददाता" },
    readTime: "6 मिनट पढ़ें",
    language: "HI",
    createdAt: new Date().toISOString()
  }
];

/** All default articles combined — used by article detail page to look up any slug */
export const allDefaultArticles: DefaultArticle[] = [
  ...defaultEnglishArticles,
  ...defaultHindiArticles
];

/** Find a default article by slug (returns first match — prefers current language) */
export function findDefaultArticle(slug: string, lang?: "EN" | "HI"): DefaultArticle | undefined {
  if (lang) {
    const langMatch = allDefaultArticles.find(
      (a) => a.slug === slug && a.language === lang
    );
    if (langMatch) return langMatch;
  }
  return allDefaultArticles.find((a) => a.slug === slug);
}

/** Helper to strip HTML tags for clean plain text display in cards & previews */
export function stripHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
