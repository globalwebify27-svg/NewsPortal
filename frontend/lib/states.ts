export interface IndianState {
  code: string;
  nameEn: string;
  nameHi: string;
  slug: string;
}

export const INDIAN_STATES: IndianState[] = [
  { code: "JH", nameEn: "Jharkhand", nameHi: "झारखंड", slug: "jharkhand" },
  { code: "BR", nameEn: "Bihar", nameHi: "बिहार", slug: "bihar" },
  { code: "UP", nameEn: "Uttar Pradesh", nameHi: "उत्तर प्रदेश", slug: "uttar-pradesh" },
  { code: "DL", nameEn: "Delhi", nameHi: "दिल्ली", slug: "delhi" },
  { code: "MH", nameEn: "Maharashtra", nameHi: "महाराष्ट्र", slug: "maharashtra" },
  { code: "WB", nameEn: "West Bengal", nameHi: "पश्चिम बंगाल", slug: "west-bengal" },
  { code: "RJ", nameEn: "Rajasthan", nameHi: "राजस्थान", slug: "rajasthan" },
  { code: "MP", nameEn: "Madhya Pradesh", nameHi: "मध्य प्रदेश", slug: "madhya-pradesh" },
  { code: "GJ", nameEn: "Gujarat", nameHi: "गुजरात", slug: "gujarat" },
  { code: "PB", nameEn: "Punjab", nameHi: "पंजाब", slug: "punjab" },
  { code: "HR", nameEn: "Haryana", nameHi: "हरियाणा", slug: "haryana" },
  { code: "TN", nameEn: "Tamil Nadu", nameHi: "तमिलनाडु", slug: "tamil-nadu" },
  { code: "KA", nameEn: "Karnataka", nameHi: "कर्नाटक", slug: "karnataka" },
  { code: "KL", nameEn: "Kerala", nameHi: "केरल", slug: "kerala" },
  { code: "OD", nameEn: "Odisha", nameHi: "ओडिशा", slug: "odisha" },
  { code: "TS", nameEn: "Telangana", nameHi: "तेलंगाना", slug: "telangana" },
  { code: "AP", nameEn: "Andhra Pradesh", nameHi: "आंध्र प्रदेश", slug: "andhra-pradesh" },
  { code: "CG", nameEn: "Chhattisgarh", nameHi: "छत्तीसगढ़", slug: "chhattisgarh" },
  { code: "UK", nameEn: "Uttarakhand", nameHi: "उत्तराखंड", slug: "uttarakhand" },
  { code: "HP", nameEn: "Himachal Pradesh", nameHi: "हिमाचल प्रदेश", slug: "himachal-pradesh" },
  { code: "JK", nameEn: "Jammu & Kashmir", nameHi: "जम्मू और कश्मीर", slug: "jammu-kashmir" },
  { code: "AS", nameEn: "Assam", nameHi: "असम", slug: "assam" },
  { code: "GA", nameEn: "Goa", nameHi: "गोवा", slug: "goa" },
  { code: "TR", nameEn: "Tripura", nameHi: "त्रिपुरा", slug: "tripura" },
  { code: "ML", nameEn: "Meghalaya", nameHi: "मेघालय", slug: "meghalaya" },
  { code: "MN", nameEn: "Manipur", nameHi: "मणिपुर", slug: "manipur" },
  { code: "NL", nameEn: "Nagaland", nameHi: "नागालैंड", slug: "nagaland" },
  { code: "AR", nameEn: "Arunachal Pradesh", nameHi: "अरुणाचल प्रदेश", slug: "arunachal-pradesh" },
  { code: "MZ", nameEn: "Mizoram", nameHi: "मिजोरम", slug: "mizoram" },
  { code: "SK", nameEn: "Sikkim", nameHi: "सिक्किम", slug: "sikkim" },
];

/**
 * Automatically detects the user's Indian state using IP Geolocation services
 */
export async function autoDetectUserIndianState(): Promise<IndianState | null> {
  if (typeof window !== "undefined") {
    try {
      const cachedCode = sessionStorage.getItem("ga_selected_state");
      if (cachedCode) {
        const found = INDIAN_STATES.find((s) => s.code === cachedCode);
        if (found) return found;
      }
    } catch (_) {}
  }

  const fetchWithTimeout = async (url: string, timeoutMs = 1200) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { cache: "no-store", signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch {
      clearTimeout(timer);
      return null;
    }
  };

  try {
    const res = await fetchWithTimeout("https://ipapi.co/json/");
    if (res && res.ok) {
      const data = await res.json();
      const region = (data.region || data.region_code || "").toLowerCase();
      const city = (data.city || "").toLowerCase();

      if (region || city) {
        const found = INDIAN_STATES.find((st) => {
          const name = st.nameEn.toLowerCase();
          const slugName = st.slug.replace(/-/g, " ");
          return (
            region.includes(name) ||
            name.includes(region) ||
            region.includes(slugName) ||
            city.includes(name)
          );
        });
        if (found) return found;
      }
    }
  } catch (e) {}

  try {
    const res2 = await fetchWithTimeout("https://ip-api.com/json/?fields=regionName,city,countryCode");
    if (res2 && res2.ok) {
      const data2 = await res2.json();
      const rName = (data2.regionName || "").toLowerCase();
      if (rName) {
        const found2 = INDIAN_STATES.find((st) => {
          const name = st.nameEn.toLowerCase();
          return rName.includes(name) || name.includes(rName);
        });
        if (found2) return found2;
      }
    }
  } catch (err) {}

  return null;
}
