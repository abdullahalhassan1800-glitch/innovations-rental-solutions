/**
 * Database-agnostic natural language intent parser for the Innovations
 * assistant. Pure functions only — no network, no database, easy to test.
 */

export type ChatLanguage = "en" | "hi" | "hinglish";

export type SearchSort = "price-asc" | "price-desc" | "newest" | "possession";

export type SearchIntent = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bhk?: string;
  propertyType?: "RESIDENTIAL" | "COMMERCIAL";
  category?: string;
  status?: string;
  possessionYear?: number;
  amenities: string[];
  sort?: SearchSort;
  compare: boolean;
  siteVisit: boolean;
  greeting: boolean;
};

export const EMPTY_INTENT: SearchIntent = {
  amenities: [],
  compare: false,
  siteVisit: false,
  greeting: false,
};

const HINGLISH_MARKERS = [
  "chahiye", "chaiye", "mein", "main", "ke andar", "andar", "kitna", "kitne", "kya", "kaunsa",
  "kaunsi", "batao", "bataiye", "bata", "dikhao", "dikhaiye", "dikha", "mujhe", "ghar", "kamre",
  "zameen", "dukaan", "paas", "ke paas", "se kam", "se zyada", "budget mein", "dekhna", "dekhni",
  "dekhan", "hai", "hain", "kar", "karo", "karna", "milega", "milegi", "options", "achha", "accha",
  "sasta", "sasti", "paisa", "kitne ka", "kahan", "wala", "wali", "lena", "dena", "chahiye tha",
  "bhai", "yaar", "turant", "jaldi", "paas mein", "ke aas paas", "farak", "fark", "antar", "tulna",
];

const LOCATIONS: { slug: string; label: string; pattern: RegExp }[] = [
  {
    slug: "noida-extension",
    label: "Noida Extension",
    pattern:
      /noida\s*(?:extension|extn|ext\b|west)|greater\s*noida\s*west|g\.?\s*noida\s*west|extension|noida\s*ext|नोएडा\s*(?:एक्सटेंशन|एक्स्टेंशन|वेस्ट)|ग्रेटर\s*नोएडा\s*वेस्ट/i,
  },
  {
    slug: "greater-noida",
    label: "Greater Noida",
    pattern:
      /greater\s*noida|gr\.?\s*noida|greaternoida|greater noida west|yamuna\s*expressway|jewar|knowledge\s*park|tech\s*zone|ग्रेटर\s*नोएडा/i,
  },
  {
    slug: "delhi-ncr",
    label: "Delhi NCR",
    pattern:
      /delhi\s*ncr|\bdelhi\b|\bncr\b|gurugram|gurgaon|faridabad|ghaziabad|dwarka|rohini|indirapuram|vaishali|kaushambi|दिल्ली|गुरुग्राम|गुड़गांव|फरीदाबाद|गाजियाबाद|एनसीआर/i,
  },
  {
    slug: "noida",
    label: "Noida",
    pattern: /\bnoida\b|नोएडा|नॉएडा/i,
  },
];

const AMENITIES: { name: string; pattern: RegExp }[] = [
  { name: "Swimming Pool", pattern: /swimming|swim\s*pool|\bpool\b|तैराकी|स्विमिंग|पूल/i },
  { name: "Gymnasium", pattern: /gym(nasium)?|fitness|workout|जिम|व्यायाम/i },
  { name: "Clubhouse", pattern: /club\s*house|clubhouse|क्लब\s*हाउस|क्लब/i },
  {
    name: "Landscaped Gardens",
    pattern: /garden|greenery|green\s*space|landscap|\bparks?\b|बगीचा|बग़ीचा|हरियाली/i,
  },
  { name: "Kids' Play Area", pattern: /kids?|children|play\s*area|बच्चों|बच्चे/i },
  { name: "24x7 Security", pattern: /security|gated|cctv|guards?|सुरक्षा|सीसीटीवी|गार्ड/i },
  { name: "Power Backup", pattern: /power\s*backup|backup|generator|inverter|बिजली|जनरेटर/i },
  { name: "Covered Parking", pattern: /parking|car\s*park|पार्किंग/i },
  { name: "Sports Court", pattern: /sports?|tennis|badminton|basketball|खेल|टेनिस|बैडमिंटन/i },
  { name: "Yoga Deck", pattern: /yoga|meditation|योग|ध्यान/i },
  { name: "Co-working Lounge", pattern: /co.?working|workspace|work\s*from\s*home|वर्कस्पेस/i },
  { name: "Retail Arcade", pattern: /retail arcade|high\s*street|shops?|market|दुकान|बाज़ार/i },
  { name: "Concierge", pattern: /concierge|हॉस्पिटैलिटी/i },
  { name: "EV Charging", pattern: /ev\s*charg|electric vehicle|ईवी|चार्जिंग/i },
  { name: "Amphitheatre", pattern: /amphitheatre|amphitheater|एम्फीथिएटर/i },
  { name: "Jogging Track", pattern: /jogging|running track|दौड़|जॉगिंग/i },
  { name: "Spa", pattern: /\bspa\b|स्पा/i },
  { name: "Rooftop Lounge", pattern: /rooftop|sky lounge|छत/i },
];

export function detectLanguage(message: string): ChatLanguage {
  if (/[\u0900-\u097F]/.test(message)) return "hi";
  const lower = message.toLowerCase();
  if (HINGLISH_MARKERS.some((word) => new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(lower))) {
    return "hinglish";
  }
  return "en";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function amountToRupees(amount: number, unit: string) {
  const u = unit.toLowerCase();
  if (u.startsWith("cr") || u.includes("करोड़")) return Math.round(amount * 10_000_000);
  if (u.startsWith("l") || u.includes("लाख") || u === "lac" || u === "lacs") {
    return Math.round(amount * 100_000);
  }
  return Math.round(amount);
}

/**
 * Speech recognition often returns spoken numbers instead of digits, especially
 * for Hindi and Hinglish. These word lists let the rules engine understand
 * phrases such as "seventy five lakh", "pachattar lakh" and "पचहत्तर लाख".
 */
const SPOKEN_NUMBERS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, panch: 5, paanch: 5, chhe: 6, che: 6, saat: 7,
  aath: 8, nau: 9, das: 10, bees: 20, tees: 30, chalees: 40, pachas: 50, pachaas: 50,
  saath: 60, sattar: 70, assi: 80, nabbe: 90, sau: 100,
  pachees: 25, pachchis: 25, paintees: 35, paintalis: 45, pachpan: 55, painsath: 65,
  pachattar: 75, pachasi: 85, panchanbe: 95,
  "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "छह": 6, "सात": 7,
  "आठ": 8, "नौ": 9, "दस": 10, "बीस": 20, "तीस": 30, "चालीस": 40, "पचास": 50,
  "साठ": 60, "सत्तर": 70, "अस्सी": 80, "नब्बे": 90, "सौ": 100,
  "पच्चीस": 25, "पैंतीस": 35, "पैंतालीस": 45, "पचपन": 55, "पैंसठ": 65,
  "पचहत्तर": 75, "पचासी": 85, "पंचानबे": 95,
};

const SPOKEN_FRACTIONS: Record<string, number> = {
  dedh: 1.5, "डेढ़": 1.5, dhai: 2.5, "ढाई": 2.5, sava: 1.25, sawa: 1.25, "सवा": 1.25,
  aadha: 0.5, "आधा": 0.5,
};

function parseSpokenNumberPhrase(phrase: string): number | null {
  const tokens = phrase
    .toLowerCase()
    // Keep \p{M}: Devanagari vowel signs are combining marks, and stripping
    // them would mangle words such as "पचहत्तर" and "डेढ़".
    .replace(/[^\p{L}\p{M}\p{N}\s.-]/gu, " ")
    .replace(/-/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length || tokens.some((token) => /\d/.test(token))) return null;

  for (let size = Math.min(3, tokens.length); size >= 1; size -= 1) {
    const slice = tokens.slice(-size);
    if (slice.length === 2 && (slice[0] === "paune" || slice[0] === "पौने")) {
      const base = SPOKEN_NUMBERS[slice[1]];
      if (base) return base - 0.25;
    }
    if (slice.length === 2 && (slice[0] === "sava" || slice[0] === "सवा")) {
      const base = SPOKEN_NUMBERS[slice[1]];
      if (base) return base + 0.25;
    }
    const exact = SPOKEN_FRACTIONS[slice.join(" ")] ?? SPOKEN_NUMBERS[slice.join(" ")];
    if (exact != null) return exact;
    if (slice.length === 2) {
      const tens = SPOKEN_NUMBERS[slice[0]];
      const ones = SPOKEN_NUMBERS[slice[1]];
      if (tens && ones && tens >= 20 && tens % 10 === 0 && ones < 10) return tens + ones;
    }
  }
  return null;
}

function normaliseSpokenAmounts(text: string) {
  return text.replace(
    // Start on a letter (or Devanagari mark) so the match never eats the space
    // after a digit — otherwise "3 ... seventy five lakh" became "375 lakh".
    /([\p{L}\p{M}][\p{L}\p{M}\s.-]{1,39}?)\s*(crores?|crore|cr\b|lakhs?|lacs?|lac\b|करोड़|लाख)/giu,
    (match, prefix: string, unit: string) => {
      const value = parseSpokenNumberPhrase(prefix);
      return value == null ? match : `${value} ${unit}`;
    },
  );
}

function extractBudget(message: string): { minPrice?: number; maxPrice?: number } {
  const text = normaliseSpokenAmounts(message).replace(/,/g, "").toLowerCase();
  const tokens: { value: number; index: number }[] = [];
  const regex = /(\d+(?:\.\d+)?)\s*(crores?|cr\b|crore|करोड़|लाख|lakhs?|lacs?|lac\b|l\b)/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    tokens.push({ value: amountToRupees(Number(match[1]), match[2]), index: match.index });
  }

  if (tokens.length === 0) {
    // Plain rupee amounts, e.g. "budget 7500000"
    const plain = text.match(/(?:₹|rs\.?|inr)\s*(\d{5,})/i) || text.match(/\b(\d{6,})\b/);
    if (plain) {
      const value = Number(plain[1]);
      if (value >= 100_000) return { maxPrice: value };
    }
    return {};
  }

  if (tokens.length >= 2) {
    const values = tokens.slice(0, 2).map((t) => t.value).sort((a, b) => a - b);
    return { minPrice: values[0], maxPrice: values[1] };
  }

  const value = tokens[0].value;
  const context = text.slice(Math.max(0, tokens[0].index - 40), tokens[0].index + 30);
  if (/(above|over|minimum|starting|se zyada|se upar|plus|zyada|ऊपर|अधिक)/i.test(context)) {
    return { minPrice: value };
  }
  return { maxPrice: value };
}

function extractBhk(message: string): string | undefined {
  const numeric = message.match(/(\d)\s*(?:bhk|b\.h\.k\.?|bedrooms?|bed\b|कमरे|बीएचके)/i);
  if (numeric) return numeric[1] === "5" ? "5+" : numeric[1];

  const words: Record<string, string> = {
    ek: "1", do: "2", teen: "3", char: "4", chaar: "4", paanch: "5+", panch: "5+",
    एक: "1", दो: "2", तीन: "3", चार: "4", पांच: "5+", "पाँच": "5+",
  };
  for (const [word, value] of Object.entries(words)) {
    // Unicode-aware boundaries so Devanagari words such as "दो बीएचके" match.
    const pattern = new RegExp(
      `(?:^|[^\\p{L}])${escapeRegExp(word)}(?:[^\\p{L}]|$)\\s*(?:bhk|bedroom|kamre|कमरे|बीएचके)`,
      "iu",
    );
    if (pattern.test(message)) return value;
  }
  return undefined;
}

function extractProperty(message: string): { propertyType?: "RESIDENTIAL" | "COMMERCIAL"; category?: string } {
  const m = message.toLowerCase();
  if (/\b(serviced?\s+apartment|service\s+apartment|serviced?\s+suite|managed\s+suite|रेसीडेंसी|सर्विस अपार्टमेंट)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Serviced apartment" };
  }
  if (/\b(resort|villa\s+resort|resort\s+home|रिज़ॉर्ट|रिजॉर्ट)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Resort" };
  }
  if (/\b(shop|showroom|retail|high\s*street|dukaan|दुकान|sco)\b/.test(m)) {
    return { propertyType: "COMMERCIAL", category: /sco/.test(m) ? "SCO" : "Retail" };
  }
  if (/\b(office|workplace|co.?working|corporate|coworking|ऑफिस)\b/.test(m)) {
    return { propertyType: "COMMERCIAL", category: "Office" };
  }
  if (/\b(commercial|investment property|व्यावसायिक)\b/.test(m)) {
    return { propertyType: "COMMERCIAL" };
  }
  if (/\b(plot|land|zameen|ज़मीन|जमीन)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Plot" };
  }
  if (/\b(villa|kothi|bungalow|विला)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Villa" };
  }
  if (/\b(penthouse|pent\s*house)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Penthouse" };
  }
  if (/\b(studio|1\s*rk|एक कमरा)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Studio" };
  }
  if (/\b(flat|apartment|residential|ghar|घर|फ्लैट)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL" };
  }
  return {};
}

function extractStatus(message: string): string | undefined {
  const m = message.toLowerCase();
  if (
    /ready\s*to\s*(move|shift)|ready possession|possession ready|immediate possession|completed project|turant|shift ho sakte|ready hai|रहने के लिए तैयार|तैयार है|तुरंत/.test(
      m,
    )
  ) {
    return "READY_TO_MOVE";
  }
  if (/new\s*launch|newly launched|naya launch|nayi launch|नया लॉन्च|नई लॉन्चिंग/.test(m)) return "NEW_LAUNCH";
  if (/under\s*construction|construction|ban raha|निर्माणाधीन|बन रहा/.test(m)) return "UNDER_CONSTRUCTION";
  if (/upcoming|aane wala|आने वाला/.test(m)) return "UPCOMING";
  return undefined;
}

function extractPossessionYear(message: string): number | undefined {
  const match = message.match(/\b(20[2-4]\d)\b/);
  if (!match) return undefined;
  if (/possession|by|tak|ready|मिलेगा|कब/i.test(message)) return Number(match[1]);
  return undefined;
}

export function parseIntent(message: string): SearchIntent {
  const text = message.trim();
  if (!text) return { ...EMPTY_INTENT };

  const location = LOCATIONS.find((l) => l.pattern.test(text))?.slug;
  const budget = extractBudget(text);
  const property = extractProperty(text);
  const amenities = AMENITIES.filter((a) => a.pattern.test(text)).map((a) => a.name);
  const greeting =
    /^(hi+|hii+|hello+|hey+|hlo+|namaste(?:\s*ji)?|namaskar|ram\s*ram|salaam|sat\s*sri\s*akal|good\s*(morning|evening|afternoon)|नमस्ते|नमस्कार|हाय|हैलो|राम\s*राम)[\s!,.]*$/i.test(
      text,
    );

  const sort = extractSort(text);
  const compare =
    /\b(compare|comparison|versus|vs\.?|better between|difference|side by side|tulna|compare karo|kaunsa better|kaunsi better|kaun better|farak|fark|antar)\b/i.test(
      text,
    );
  const siteVisit =
    /\b(site\s*visit|visit|tour|dekhna|dekhni|dekhan|dikhana|dikhao|milne aana|dekhne aana|property dekhni|site dekhni)\b/i.test(
      text,
    );

  return {
    location,
    minPrice: budget.minPrice,
    maxPrice: budget.maxPrice,
    bhk: extractBhk(text),
    propertyType: property.propertyType,
    category: property.category,
    status: extractStatus(text),
    possessionYear: extractPossessionYear(text),
    amenities,
    sort,
    compare,
    siteVisit,
    greeting,
  };
}

function extractSort(message: string): SearchSort | undefined {
  if (
    /\b(cheap(est)?|affordable|budget[-\s]?friendly|lowest price|low price|sasta|sasti|kam budget|कम बजट|सस्ता|सस्ती)\b/i.test(
      message,
    )
  ) {
    return "price-asc";
  }
  if (/\b(latest|newest|naye projects|नए प्रोजेक्ट्स?)\b/i.test(message)) return "newest";
  return undefined;
}

export function mergeIntents(...intents: (Partial<SearchIntent> | null | undefined)[]): SearchIntent {
  const merged: SearchIntent = { ...EMPTY_INTENT, amenities: [] };
  for (const intent of intents) {
    if (!intent) continue;
    if (intent.location) merged.location = intent.location;
    if (intent.minPrice != null) merged.minPrice = intent.minPrice;
    if (intent.maxPrice != null) merged.maxPrice = intent.maxPrice;
    if (intent.bhk) merged.bhk = intent.bhk;
    if (intent.propertyType) merged.propertyType = intent.propertyType;
    if (intent.category) merged.category = intent.category;
    if (intent.status) merged.status = intent.status;
    if (intent.possessionYear) merged.possessionYear = intent.possessionYear;
    if (intent.amenities?.length) {
      merged.amenities = Array.from(new Set([...merged.amenities, ...intent.amenities]));
    }
    if (intent.sort) merged.sort = intent.sort;
    if (intent.compare) merged.compare = true;
    if (intent.siteVisit) merged.siteVisit = true;
    if (intent.greeting) merged.greeting = true;
  }
  return merged;
}

export function hasSearchCriteria(intent: SearchIntent) {
  return Boolean(
    intent.location ||
      intent.minPrice != null ||
      intent.maxPrice != null ||
      intent.bhk ||
      intent.propertyType ||
      intent.category ||
      intent.status ||
      intent.possessionYear ||
      intent.sort ||
      intent.amenities.length,
  );
}

export function locationLabel(slug?: string) {
  if (!slug) return "Delhi NCR";
  return LOCATIONS.find((l) => l.slug === slug)?.label ?? "Delhi NCR";
}

const LOCATION_SLUGS = new Set(LOCATIONS.map((l) => l.slug));

/** Whitelist and shape data returned by an external intent provider. */
export function sanitiseExternalIntent(input: unknown): Partial<SearchIntent> | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const out: Partial<SearchIntent> = {};

  if (typeof raw.location === "string") {
    const normalised = raw.location.toLowerCase().trim().replace(/\s+/g, "-");
    if (LOCATION_SLUGS.has(normalised)) out.location = normalised;
  }
  if (typeof raw.minPrice === "number" && raw.minPrice >= 0 && raw.minPrice < 1_000_000_000) {
    out.minPrice = Math.round(raw.minPrice);
  }
  if (typeof raw.maxPrice === "number" && raw.maxPrice >= 0 && raw.maxPrice < 1_000_000_000) {
    out.maxPrice = Math.round(raw.maxPrice);
  }
  if (typeof raw.bhk === "string" && /^[1-5]\+?$/.test(raw.bhk.trim())) {
    out.bhk = raw.bhk.trim();
  }
  if (raw.propertyType === "RESIDENTIAL" || raw.propertyType === "COMMERCIAL") {
    out.propertyType = raw.propertyType;
  }
  if (typeof raw.category === "string" && raw.category.length < 40) out.category = raw.category;
  if (typeof raw.status === "string" && /^(NEW_LAUNCH|UNDER_CONSTRUCTION|READY_TO_MOVE|UPCOMING)$/.test(raw.status)) {
    out.status = raw.status;
  }
  if (typeof raw.possessionYear === "number" && raw.possessionYear >= 2020 && raw.possessionYear <= 2050) {
    out.possessionYear = raw.possessionYear;
  }
  if (
    raw.sort === "price-asc" ||
    raw.sort === "price-desc" ||
    raw.sort === "newest" ||
    raw.sort === "possession"
  ) {
    out.sort = raw.sort;
  }
  if (Array.isArray(raw.amenities)) {
    out.amenities = raw.amenities
      .filter((a): a is string => typeof a === "string")
      .map((a) => AMENITIES.find((entry) => entry.name.toLowerCase() === a.toLowerCase())?.name)
      .filter((a): a is string => Boolean(a));
  }
  if (raw.compare === true) out.compare = true;
  if (raw.siteVisit === true) out.siteVisit = true;
  return out;
}
