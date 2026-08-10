import { INDIAN_STATES } from "./states";

export interface CityDistrict {
  id: string;
  nameEn: string;
  nameHi: string;
  stateCode: string;
}

export const INDIAN_DISTRICTS: CityDistrict[] = [
  // Jharkhand Districts & Major Cities
  { id: "ranchi", nameEn: "Ranchi", nameHi: "रांची", stateCode: "JH" },
  { id: "dhanbad", nameEn: "Dhanbad", nameHi: "धनबाद", stateCode: "JH" },
  { id: "jamshedpur", nameEn: "Jamshedpur / East Singhbhum", nameHi: "जमशेदपुर / पूर्वी सिंहभूम", stateCode: "JH" },
  { id: "bokaro", nameEn: "Bokaro", nameHi: "बोकारो", stateCode: "JH" },
  { id: "hazaribagh", nameEn: "Hazaribagh", nameHi: "हजारीबाग", stateCode: "JH" },
  { id: "deoghar", nameEn: "Deoghar", nameHi: "देवघर", stateCode: "JH" },
  { id: "giridih", nameEn: "Giridih", nameHi: "गिरिडीह", stateCode: "JH" },
  { id: "ramgarh", nameEn: "Ramgarh", nameHi: "रामगढ़", stateCode: "JH" },
  { id: "dumka", nameEn: "Dumka", nameHi: "दुमका", stateCode: "JH" },
  { id: "palamu", nameEn: "Palamu / Daltonganj", nameHi: "पलामू / मेदिनीनगर", stateCode: "JH" },
  { id: "chaibasa", nameEn: "Chaibasa / West Singhbhum", nameHi: "चाईबासा / पश्चिमी सिंहभूम", stateCode: "JH" },
  { id: "godda", nameEn: "Godda", nameHi: "गोड्डा", stateCode: "JH" },
  { id: "sahebganj", nameEn: "Sahebganj", nameHi: "साहिबगंज", stateCode: "JH" },
  { id: "koderma", nameEn: "Koderma", nameHi: "कोडरमा", stateCode: "JH" },
  { id: "chatra", nameEn: "Chatra", nameHi: "चतरा", stateCode: "JH" },

  // Bihar Districts & Major Cities
  { id: "patna", nameEn: "Patna", nameHi: "पटना", stateCode: "BR" },
  { id: "gaya", nameEn: "Gaya", nameHi: "गया", stateCode: "BR" },
  { id: "muzaffarpur", nameEn: "Muzaffarpur", nameHi: "मुजफ्फरपुर", stateCode: "BR" },
  { id: "bhagalpur", nameEn: "Bhagalpur", nameHi: "भागलपुर", stateCode: "BR" },
  { id: "darbhanga", nameEn: "Darbhanga", nameHi: "दरभंगा", stateCode: "BR" },
  { id: "purnea", nameEn: "Purnea", nameHi: "पूर्णिया", stateCode: "BR" },
  { id: "begusarai", nameEn: "Begusarai", nameHi: "बेगूसराय", stateCode: "BR" },
  { id: "nalanda", nameEn: "Nalanda / Bihar Sharif", nameHi: "नालंदा / बिहारशरीफ", stateCode: "BR" },
  { id: "ara", nameEn: "Bhojpur / Ara", nameHi: "भोजपुर / आरा", stateCode: "BR" },
  { id: "samastipur", nameEn: "Samastipur", nameHi: "समस्तीपुर", stateCode: "BR" },
  { id: "chhapra", nameEn: "Saran / Chhapra", nameHi: "सारण / छपरा", stateCode: "BR" },

  // Uttar Pradesh Major Cities
  { id: "lucknow", nameEn: "Lucknow", nameHi: "लखनऊ", stateCode: "UP" },
  { id: "kanpur", nameEn: "Kanpur", nameHi: "कानपुर", stateCode: "UP" },
  { id: "varanasi", nameEn: "Varanasi", nameHi: "वाराणसी", stateCode: "UP" },
  { id: "noida", nameEn: "Gautam Buddha Nagar / Noida", nameHi: "नोएडा / ग्रेटर नोएडा", stateCode: "UP" },
  { id: "agra", nameEn: "Agra", nameHi: "आगरा", stateCode: "UP" },
  { id: "prayagraj", nameEn: "Prayagraj", nameHi: "प्रयागराज", stateCode: "UP" },
  { id: "gorakhpur", nameEn: "Gorakhpur", nameHi: "गोरखपुर", stateCode: "UP" },

  // Delhi & NCR
  { id: "delhi", nameEn: "Delhi NCR", nameHi: "दिल्ली एनसीआर", stateCode: "DL" },

  // West Bengal
  { id: "kolkata", nameEn: "Kolkata", nameHi: "कोलकाता", stateCode: "WB" },
  { id: "siliguri", nameEn: "Siliguri", nameHi: "सिलीगुड़ी", stateCode: "WB" },
  { id: "asansol", nameEn: "Asansol", nameHi: "आसनसोल", stateCode: "WB" },

  // National / Statewide
  { id: "national", nameEn: "National / Statewide", nameHi: "राष्ट्रीय / राज्यव्यापी", stateCode: "ALL" }
];

export function getDistrictsForState(stateCode: string): CityDistrict[] {
  if (!stateCode || stateCode === "ALL") return INDIAN_DISTRICTS;
  return INDIAN_DISTRICTS.filter((d) => d.stateCode === stateCode || d.id === "national");
}

export function findDistrictByName(name: string): CityDistrict | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();
  return INDIAN_DISTRICTS.find(
    (d) =>
      d.id === lower ||
      d.nameEn.toLowerCase().includes(lower) ||
      lower.includes(d.nameEn.toLowerCase()) ||
      d.nameHi.includes(name)
  );
}

export interface DetectedLocation {
  city: string;
  cityHi: string;
  stateCode: string;
  stateNameEn: string;
  stateNameHi: string;
  displayLocationEn?: string;
  displayLocationHi?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  temperature?: string;
  countryCode?: string;
  countryName?: string;
  isInternational?: boolean;
}

export async function fetchRealtimeTemperature(lat?: number, lon?: number): Promise<string> {
  if (!lat || !lon) return "28°C";
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.current_weather?.temperature !== undefined) {
        return `${Math.round(data.current_weather.temperature)}°C`;
      }
    }
  } catch (e) {}
  return "28°C";
}

/**
 * Real-time IP / VPN Geolocation detector for User City & District
 */
export async function autoDetectUserCity(): Promise<DetectedLocation | null> {
  // Check sessionStorage cache first (speed optimization)
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem("ga_user_geo_location");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (_) {}
  }

  const result = await detectLocationInternal();
  if (result && typeof window !== "undefined") {
    try {
      sessionStorage.setItem("ga_user_geo_location", JSON.stringify(result));
    } catch (_) {}
  }
  return result;
}

async function detectLocationInternal(): Promise<DetectedLocation | null> {

  try {
    const res = await fetch("https://ipwho.is/", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const cityStr = (data.city || "").trim();
        const regionStr = (data.region || "").trim();
        const countryCode = (data.country_code || "").toUpperCase();
        const countryName = (data.country || "").trim();
        const isInternational = Boolean(countryCode && countryCode !== "IN");
        const lat = data.latitude;
        const lon = data.longitude;
        const tz = data.timezone?.id || "Asia/Kolkata";

        let tempStr = "28°C";
        if (lat && lon) {
          tempStr = await fetchRealtimeTemperature(lat, lon);
        }

        const matchedCity = INDIAN_DISTRICTS.find((d) => {
          const lowerCity = cityStr.toLowerCase();
          const enLower = d.nameEn.toLowerCase();
          return lowerCity.includes(d.id) || enLower.includes(lowerCity) || lowerCity.includes(enLower.split(" ")[0].toLowerCase());
        });

        const matchedState = INDIAN_STATES.find((s) => {
          const regLower = regionStr.toLowerCase();
          const sNameLower = s.nameEn.toLowerCase();
          return regLower.includes(sNameLower) || sNameLower.includes(regLower);
        });

        if (matchedCity && !isInternational) {
          const stObj = INDIAN_STATES.find((s) => s.code === matchedCity.stateCode) || matchedState;
          const cityNameEn = matchedCity.nameEn.split("/")[0].trim();
          const cityNameHi = matchedCity.nameHi.split("/")[0].trim();
          return {
            city: cityNameEn,
            cityHi: cityNameHi,
            stateCode: matchedCity.stateCode,
            stateNameEn: stObj?.nameEn || regionStr || "Jharkhand",
            stateNameHi: stObj?.nameHi || regionStr || "झारखंड",
            displayLocationEn: `${cityNameEn}, ${stObj?.nameEn || regionStr}`,
            displayLocationHi: `${cityNameHi}, ${stObj?.nameHi || regionStr}`,
            latitude: lat,
            longitude: lon,
            timezone: tz,
            temperature: tempStr,
            countryCode: "IN",
            isInternational: false
          };
        } else if (cityStr) {
          const displayCountry = countryName || regionStr || "International";
          return {
            city: cityStr,
            cityHi: cityStr,
            stateCode: matchedState?.code || "JH",
            stateNameEn: displayCountry,
            stateNameHi: displayCountry,
            displayLocationEn: `${cityStr}, ${displayCountry}`,
            displayLocationHi: `${cityStr}, ${displayCountry}`,
            latitude: lat,
            longitude: lon,
            timezone: tz,
            temperature: tempStr,
            countryCode: countryCode,
            countryName: displayCountry,
            isInternational: isInternational
          };
        }
      }
    }
  } catch (e) {}

  // Provider 2: ipapi.co
  try {
    const res2 = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (res2.ok) {
      const data2 = await res2.json();
      const cityStr = (data2.city || "").trim();
      const regionStr = (data2.region || data2.region_code || "").trim();
      const countryCode = (data2.country_code || "").toUpperCase();
      const countryName = (data2.country_name || "").trim();
      const isInternational = Boolean(countryCode && countryCode !== "IN");

      const matchedCity = INDIAN_DISTRICTS.find((d) => {
        const lowerCity = cityStr.toLowerCase();
        const enLower = d.nameEn.toLowerCase();
        return lowerCity.includes(d.id) || enLower.includes(lowerCity) || lowerCity.includes(enLower.split(" ")[0].toLowerCase());
      });

      if (matchedCity && !isInternational) {
        const cityNameEn = matchedCity.nameEn.split("/")[0].trim();
        const cityNameHi = matchedCity.nameHi.split("/")[0].trim();
        const stObj = INDIAN_STATES.find((s) => s.code === matchedCity.stateCode);
        return {
          city: cityNameEn,
          cityHi: cityNameHi,
          stateCode: matchedCity.stateCode,
          stateNameEn: stObj?.nameEn || "Jharkhand",
          stateNameHi: stObj?.nameHi || "झारखंड",
          displayLocationEn: `${cityNameEn}, ${stObj?.nameEn || regionStr}`,
          displayLocationHi: `${cityNameHi}, ${stObj?.nameHi || regionStr}`,
          countryCode: "IN",
          isInternational: false
        };
      } else if (cityStr) {
        const displayCountry = countryName || regionStr || "International";
        return {
          city: cityStr,
          cityHi: cityStr,
          stateCode: "JH",
          stateNameEn: displayCountry,
          stateNameHi: displayCountry,
          displayLocationEn: `${cityStr}, ${displayCountry}`,
          displayLocationHi: `${cityStr}, ${displayCountry}`,
          countryCode: countryCode,
          countryName: displayCountry,
          isInternational: isInternational
        };
      }
    }
  } catch (e) {}

  // Provider 3: ip-api.com
  try {
    const res3 = await fetch("https://ip-api.com/json/?fields=city,regionName,countryCode,country", { cache: "no-store" });
    if (res3.ok) {
      const data3 = await res3.json();
      const cName = (data3.city || "").trim();
      const rName = (data3.regionName || "").trim();
      const countryCode = (data3.countryCode || "").toUpperCase();
      const countryName = (data3.country || "").trim();
      const isInternational = Boolean(countryCode && countryCode !== "IN");

      const matchedCity3 = INDIAN_DISTRICTS.find((d) => {
        const lowerC = cName.toLowerCase();
        const enLower = d.nameEn.toLowerCase();
        return lowerC.includes(d.id) || enLower.includes(lowerC) || lowerC.includes(enLower.split(" ")[0].toLowerCase());
      });

      if (matchedCity3 && !isInternational) {
        const cityNameEn = matchedCity3.nameEn.split("/")[0].trim();
        const cityNameHi = matchedCity3.nameHi.split("/")[0].trim();
        const stObj = INDIAN_STATES.find((s) => s.code === matchedCity3.stateCode);
        return {
          city: cityNameEn,
          cityHi: cityNameHi,
          stateCode: matchedCity3.stateCode,
          stateNameEn: stObj?.nameEn || "Jharkhand",
          stateNameHi: stObj?.nameHi || "झारखंड",
          displayLocationEn: `${cityNameEn}, ${stObj?.nameEn || rName}`,
          displayLocationHi: `${cityNameHi}, ${stObj?.nameHi || rName}`,
          countryCode: "IN",
          isInternational: false
        };
      } else if (cName) {
        const displayCountry = countryName || rName || "International";
        return {
          city: cName,
          cityHi: cName,
          stateCode: "JH",
          stateNameEn: displayCountry,
          stateNameHi: displayCountry,
          displayLocationEn: `${cName}, ${displayCountry}`,
          displayLocationHi: `${cName}, ${displayCountry}`,
          countryCode: countryCode,
          countryName: displayCountry,
          isInternational: isInternational
        };
      }
    }
  } catch (e) {}

  // Default fallback: Ranchi, Jharkhand
  return {
    city: "Ranchi",
    cityHi: "राँची",
    stateCode: "JH",
    stateNameEn: "Jharkhand",
    stateNameHi: "झारखंड",
    displayLocationEn: "Ranchi, Jharkhand",
    displayLocationHi: "राँची, झारखंड",
    countryCode: "IN",
    isInternational: false
  };
}
