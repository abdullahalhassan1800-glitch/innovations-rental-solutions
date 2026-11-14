/**
 * Database-agnostic natural language intent parser for the Innovations
 * assistant. Pure functions only â€” no network, no database, easy to test.
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
  "kaunsi", "kaun", "kaise", "batao", "bataiye", "bata", "dikhao", "dikhaiye", "dikha", "mujhe",
  "ghar", "kamre", "zameen", "dukaan", "paas", "ke paas", "se kam", "se zyada", "budget mein",
  "dekhna", "dekhni", "dekhan", "hai", "hain", "hoga", "hogi", "kar", "karo", "kare", "karna",
  "milega", "milegi", "options", "achha", "accha", "sasta", "sasti", "paisa", "kitne ka", "kahan",
  "wala", "wali", "lena", "dena", "chahiye tha", "bhai", "yaar", "turant", "jaldi", "paas mein",
  "ke aas paas", "farak", "fark", "antar", "tulna", "lagega", "padega", "dijiye",
];

const LOCATIONS: { slug: string; label: string; pattern: RegExp }[] = [
  {
    slug: "noida-extension",
    label: "Noida Extension",
    pattern:
      /noida\s*(?:extension|extn|ext\b|west)|greater\s*noida\s*west|g\.?\s*noida\s*west|extension|noida\s*ext|à¤¨à¥‹à¤à¤¡à¤¾\s*(?:à¤à¤•à¥à¤¸à¤Ÿà¥‡à¤‚à¤¶à¤¨|à¤à¤•à¥à¤¸à¥à¤Ÿà¥‡à¤‚à¤¶à¤¨|à¤µà¥‡à¤¸à¥à¤Ÿ)|à¤—à¥à¤°à¥‡à¤Ÿà¤°\s*à¤¨à¥‹à¤à¤¡à¤¾\s*à¤µà¥‡à¤¸à¥à¤Ÿ/i,
  },
  {
    slug: "greater-noida",
    label: "Greater Noida",
    pattern:
      /greater\s*noida|gr\.?\s*noida|greaternoida|greater noida west|yamuna\s*expressway|jewar|knowledge\s*park|tech\s*zone|à¤—à¥à¤°à¥‡à¤Ÿà¤°\s*à¤¨à¥‹à¤à¤¡à¤¾/i,
  },
  {
    slug: "delhi-ncr",
    label: "Delhi NCR",
    pattern:
      /delhi\s*ncr|\bdelhi\b|\bncr\b|gurugram|gurgaon|faridabad|ghaziabad|dwarka|rohini|indirapuram|vaishali|kaushambi|à¤¦à¤¿à¤²à¥à¤²à¥€|à¤—à¥à¤°à¥à¤—à¥à¤°à¤¾à¤®|à¤—à¥à¤¡à¤¼à¤—à¤¾à¤‚à¤µ|à¤«à¤°à¥€à¤¦à¤¾à¤¬à¤¾à¤¦|à¤—à¤¾à¤œà¤¿à¤¯à¤¾à¤¬à¤¾à¤¦|à¤à¤¨à¤¸à¥€à¤†à¤°/i,
  },
  {
    slug: "noida",
    label: "Noida",
    pattern: /\bnoida\b|à¤¨à¥‹à¤à¤¡à¤¾|à¤¨à¥‰à¤à¤¡à¤¾/i,
  },
];

const AMENITIES: { name: string; pattern: RegExp }[] = [
  { name: "Swimming Pool", pattern: /swimming|swim\s*pool|\bpool\b|à¤¤à¥ˆà¤°à¤¾à¤•à¥€|à¤¸à¥à¤µà¤¿à¤®à¤¿à¤‚à¤—|à¤ªà¥‚à¤²/i },
  { name: "Gymnasium", pattern: /gym(nasium)?|fitness|workout|à¤œà¤¿à¤®|à¤µà¥à¤¯à¤¾à¤¯à¤¾à¤®/i },
  { name: "Clubhouse", pattern: /club\s*house|clubhouse|à¤•à¥à¤²à¤¬\s*à¤¹à¤¾à¤‰à¤¸|à¤•à¥à¤²à¤¬/i },
  {
    name: "Landscaped Gardens",
    pattern: /garden|greenery|green\s*space|landscap|\bparks?\b|à¤¬à¤—à¥€à¤šà¤¾|à¤¬à¤—à¤¼à¥€à¤šà¤¾|à¤¹à¤°à¤¿à¤¯à¤¾à¤²à¥€/i,
  },
  { name: "Kids' Play Area", pattern: /kids?|children|play\s*area|à¤¬à¤šà¥à¤šà¥‹à¤‚|à¤¬à¤šà¥à¤šà¥‡/i },
  { name: "24x7 Security", pattern: /security|gated|cctv|guards?|à¤¸à¥à¤°à¤•à¥à¤·à¤¾|à¤¸à¥€à¤¸à¥€à¤Ÿà¥€à¤µà¥€|à¤—à¤¾à¤°à¥à¤¡/i },
  { name: "Power Backup", pattern: /power\s*backup|backup|generator|inverter|à¤¬à¤¿à¤œà¤²à¥€|à¤œà¤¨à¤°à¥‡à¤Ÿà¤°/i },
  { name: "Covered Parking", pattern: /parking|car\s*park|à¤ªà¤¾à¤°à¥à¤•à¤¿à¤‚à¤—/i },
  { name: "Sports Court", pattern: /sports?|tennis|badminton|basketball|à¤–à¥‡à¤²|à¤Ÿà¥‡à¤¨à¤¿à¤¸|à¤¬à¥ˆà¤¡à¤®à¤¿à¤‚à¤Ÿà¤¨/i },
  { name: "Yoga Deck", pattern: /yoga|meditation|à¤¯à¥‹à¤—|à¤§à¥à¤¯à¤¾à¤¨/i },
  { name: "Co-working Lounge", pattern: /co.?working|workspace|work\s*from\s*home|à¤µà¤°à¥à¤•à¤¸à¥à¤ªà¥‡à¤¸/i },
  { name: "Retail Arcade", pattern: /retail arcade|high\s*street|shops?|market|à¤¦à¥à¤•à¤¾à¤¨|à¤¬à¤¾à¤œà¤¼à¤¾à¤°/i },
  { name: "Concierge", pattern: /concierge|à¤¹à¥‰à¤¸à¥à¤ªà¤¿à¤Ÿà¥ˆà¤²à¤¿à¤Ÿà¥€/i },
  { name: "EV Charging", pattern: /ev\s*charg|electric vehicle|à¤ˆà¤µà¥€|à¤šà¤¾à¤°à¥à¤œà¤¿à¤‚à¤—/i },
  { name: "Amphitheatre", pattern: /amphitheatre|amphitheater|à¤à¤®à¥à¤«à¥€à¤¥à¤¿à¤à¤Ÿà¤°/i },
  { name: "Jogging Track", pattern: /jogging|running track|à¤¦à¥Œà¤¡à¤¼|à¤œà¥‰à¤—à¤¿à¤‚à¤—/i },
  { name: "Spa", pattern: /\bspa\b|à¤¸à¥à¤ªà¤¾/i },
  { name: "Rooftop Lounge", pattern: /rooftop|sky lounge|à¤›à¤¤/i },
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
  if (u.startsWith("cr") || u.includes("à¤•à¤°à¥‹à¤¡à¤¼")) return Math.round(amount * 10_000_000);
  if (u.startsWith("l") || u.includes("à¤²à¤¾à¤–") || u === "lac" || u === "lacs") {
    return Math.round(amount * 100_000);
  }
  return Math.round(amount);
}

/**
 * Speech recognition often returns spoken numbers instead of digits, especially
 * for Hindi and Hinglish. These word lists let the rules engine understand
 * phrases such as "seventy five lakh", "pachattar lakh" and "à¤ªà¤šà¤¹à¤¤à¥à¤¤à¤° à¤²à¤¾à¤–".
 */
const SPOKEN_NUMBERS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, panch: 5, paanch: 5, chhe: 6, che: 6, saat: 7,
  aath: 8, nau: 9, das: 10, bees: 20, tees: 30, chalees: 40, chalis: 40, pachas: 50, pachaas: 50,
  saath: 60, sattar: 70, assi: 80, nabbe: 90, sau: 100,
  pachees: 25, pachchis: 25, paintees: 35, paintalis: 45, pachpan: 55, painsath: 65,
  pachattar: 75, pachasi: 85, panchanbe: 95,
  "à¤à¤•": 1, "à¤¦à¥‹": 2, "à¤¤à¥€à¤¨": 3, "à¤šà¤¾à¤°": 4, "à¤ªà¤¾à¤‚à¤š": 5, "à¤ªà¤¾à¤à¤š": 5, "à¤›à¤¹": 6, "à¤¸à¤¾à¤¤": 7,
  "à¤†à¤ ": 8, "à¤¨à¥Œ": 9, "à¤¦à¤¸": 10, "à¤¬à¥€à¤¸": 20, "à¤¤à¥€à¤¸": 30, "à¤šà¤¾à¤²à¥€à¤¸": 40, "à¤ªà¤šà¤¾à¤¸": 50,
  "à¤¸à¤¾à¤ ": 60, "à¤¸à¤¤à¥à¤¤à¤°": 70, "à¤…à¤¸à¥à¤¸à¥€": 80, "à¤¨à¤¬à¥à¤¬à¥‡": 90, "à¤¸à¥Œ": 100,
  "à¤ªà¤šà¥à¤šà¥€à¤¸": 25, "à¤ªà¥ˆà¤‚à¤¤à¥€à¤¸": 35, "à¤ªà¥ˆà¤‚à¤¤à¤¾à¤²à¥€à¤¸": 45, "à¤ªà¤šà¤ªà¤¨": 55, "à¤ªà¥ˆà¤‚à¤¸à¤ ": 65,
  "à¤ªà¤šà¤¹à¤¤à¥à¤¤à¤°": 75, "à¤ªà¤šà¤¾à¤¸à¥€": 85, "à¤ªà¤‚à¤šà¤¾à¤¨à¤¬à¥‡": 95,
};

const SPOKEN_FRACTIONS: Record<string, number> = {
  dedh: 1.5, "à¤¡à¥‡à¤¢à¤¼": 1.5, dhai: 2.5, "à¤¢à¤¾à¤ˆ": 2.5, sava: 1.25, sawa: 1.25, "à¤¸à¤µà¤¾": 1.25,
  aadha: 0.5, "à¤†à¤§à¤¾": 0.5,
};

export function parseSpokenNumberPhrase(phrase: string): number | null {
  const tokens = phrase
    .toLowerCase()
    // Keep \p{M}: Devanagari vowel signs are combining marks, and stripping
    // them would mangle words such as "à¤ªà¤šà¤¹à¤¤à¥à¤¤à¤°" and "à¤¡à¥‡à¤¢à¤¼".
    .replace(/[^\p{L}\p{M}\p{N}\s.-]/gu, " ")
    .replace(/-/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length || tokens.some((token) => /\d/.test(token))) return null;

  for (let size = Math.min(3, tokens.length); size >= 1; size -= 1) {
    const slice = tokens.slice(-size);
    if (slice.length === 2 && (slice[0] === "paune" || slice[0] === "à¤ªà¥Œà¤¨à¥‡")) {
      const base = SPOKEN_NUMBERS[slice[1]];
      if (base) return base - 0.25;
    }
    if (slice.length === 2 && (slice[0] === "sava" || slice[0] === "à¤¸à¤µà¤¾")) {
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
    // after a digit â€” otherwise "3 ... seventy five lakh" became "375 lakh".
    /([\p{L}\p{M}][\p{L}\p{M}\s.-]{1,39}?)\s*(crores?|crore|cr\b|lakhs?|lacs?|lac\b|à¤•à¤°à¥‹à¤¡à¤¼|à¤²à¤¾à¤–)/giu,
    (match, prefix: string, unit: string) => {
      const value = parseSpokenNumberPhrase(prefix);
      return value == null ? match : `${value} ${unit}`;
    },
  );
}

function extractBudget(message: string): { minPrice?: number; maxPrice?: number } {
  const text = normaliseSpokenAmounts(message).replace(/,/g, "").toLowerCase();
  const tokens: { value: number; index: number }[] = [];
  const regex = /(\d+(?:\.\d+)?)\s*(crores?|cr\b|crore|à¤•à¤°à¥‹à¤¡à¤¼|à¤²à¤¾à¤–|lakhs?|lacs?|lac\b|l\b)/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    tokens.push({ value: amountToRupees(Number(match[1]), match[2]), index: match.index });
  }

  if (tokens.length === 0) {
    // Plain rupee amounts, e.g. "budget 7500000"
    const plain = text.match(/(?:â‚¹|rs\.?|inr)\s*(\d{5,})/i) || text.match(/\b(\d{6,})\b/);
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
  if (/(above|over|minimum|starting|se zyada|se upar|plus|zyada|à¤Šà¤ªà¤°|à¤…à¤§à¤¿à¤•)/i.test(context)) {
    return { minPrice: value };
  }
  return { maxPrice: value };
}

function extractBhk(message: string): string | undefined {
  const numeric = message.match(/(\d)\s*(?:bhk|b\.h\.k\.?|bedrooms?|bed\b|à¤•à¤®à¤°à¥‡|à¤¬à¥€à¤à¤šà¤•à¥‡)/i);
  if (numeric) return numeric[1] === "5" ? "5+" : numeric[1];

  const words: Record<string, string> = {
    ek: "1", do: "2", teen: "3", char: "4", chaar: "4", paanch: "5+", panch: "5+",
    à¤à¤•: "1", à¤¦à¥‹: "2", à¤¤à¥€à¤¨: "3", à¤šà¤¾à¤°: "4", à¤ªà¤¾à¤‚à¤š: "5+", "à¤ªà¤¾à¤à¤š": "5+",
  };
  for (const [word, value] of Object.entries(words)) {
    // Unicode-aware boundaries so Devanagari words such as "à¤¦à¥‹ à¤¬à¥€à¤à¤šà¤•à¥‡" match.
    const pattern = new RegExp(
      `(?:^|[^\\p{L}])${escapeRegExp(word)}(?:[^\\p{L}]|$)\\s*(?:bhk|bedroom|kamre|à¤•à¤®à¤°à¥‡|à¤¬à¥€à¤à¤šà¤•à¥‡)`,
      "iu",
    );
    if (pattern.test(message)) return value;
  }
  return undefined;
}

function extractProperty(message: string): { propertyType?: "RESIDENTIAL" | "COMMERCIAL"; category?: string } {
  const m = message.toLowerCase();
  if (/\b(serviced?\s+apartment|service\s+apartment|serviced?\s+suite|managed\s+suite|à¤°à¥‡à¤¸à¥€à¤¡à¥‡à¤‚à¤¸à¥€|à¤¸à¤°à¥à¤µà¤¿à¤¸ à¤…à¤ªà¤¾à¤°à¥à¤Ÿà¤®à¥‡à¤‚à¤Ÿ)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Serviced apartment" };
  }
  if (/\b(resort|villa\s+resort|resort\s+home|à¤°à¤¿à¤œà¤¼à¥‰à¤°à¥à¤Ÿ|à¤°à¤¿à¤œà¥‰à¤°à¥à¤Ÿ)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Resort" };
  }
  if (/\b(shop|showroom|retail|high\s*street|dukaan|à¤¦à¥à¤•à¤¾à¤¨|sco)\b/.test(m)) {
    return { propertyType: "COMMERCIAL", category: /sco/.test(m) ? "SCO" : "Retail" };
  }
  if (/\b(office|workplace|co.?working|corporate|coworking|à¤‘à¤«à¤¿à¤¸)\b/.test(m)) {
    return { propertyType: "COMMERCIAL", category: "Office" };
  }
  if (/\b(commercial|investment property|à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤•)\b/.test(m)) {
    return { propertyType: "COMMERCIAL" };
  }
  if (/\b(plot|land|zameen|à¤œà¤¼à¤®à¥€à¤¨|à¤œà¤®à¥€à¤¨)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Plot" };
  }
  if (/\b(villa|kothi|bungalow|à¤µà¤¿à¤²à¤¾)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Villa" };
  }
  if (/\b(penthouse|pent\s*house)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Penthouse" };
  }
  if (/\b(studio|1\s*rk|à¤à¤• à¤•à¤®à¤°à¤¾)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL", category: "Studio" };
  }
  if (/\b(flat|apartment|residential|ghar|à¤˜à¤°|à¤«à¥à¤²à¥ˆà¤Ÿ)\b/.test(m)) {
    return { propertyType: "RESIDENTIAL" };
  }
  return {};
}

function extractStatus(message: string): string | undefined {
  const m = message.toLowerCase();
  if (
    /ready\s*to\s*(move|shift)|ready possession|possession ready|immediate possession|completed project|turant|shift ho sakte|ready hai|à¤°à¤¹à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤¤à¥ˆà¤¯à¤¾à¤°|à¤¤à¥ˆà¤¯à¤¾à¤° à¤¹à¥ˆ|à¤¤à¥à¤°à¤‚à¤¤/.test(
      m,
    )
  ) {
    return "READY_TO_MOVE";
  }
  if (/new\s*launch|newly launched|naya launch|nayi launch|à¤¨à¤¯à¤¾ à¤²à¥‰à¤¨à¥à¤š|à¤¨à¤ˆ à¤²à¥‰à¤¨à¥à¤šà¤¿à¤‚à¤—/.test(m)) return "NEW_LAUNCH";
  if (/under\s*construction|construction|ban raha|à¤¨à¤¿à¤°à¥à¤®à¤¾à¤£à¤¾à¤§à¥€à¤¨|à¤¬à¤¨ à¤°à¤¹à¤¾/.test(m)) return "UNDER_CONSTRUCTION";
  if (/upcoming|aane wala|à¤†à¤¨à¥‡ à¤µà¤¾à¤²à¤¾/.test(m)) return "UPCOMING";
  return undefined;
}

function extractPossessionYear(message: string): number | undefined {
  const match = message.match(/\b(20[2-4]\d)\b/);
  if (!match) return undefined;
  if (/possession|by|tak|ready|à¤®à¤¿à¤²à¥‡à¤—à¤¾|à¤•à¤¬/i.test(message)) return Number(match[1]);
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
    /^(hi+|hii+|hello+|hey+|hlo+|namaste(?:\s*ji)?|namaskar|ram\s*ram|salaam|sat\s*sri\s*akal|good\s*(morning|evening|afternoon)|à¤¨à¤®à¤¸à¥à¤¤à¥‡|à¤¨à¤®à¤¸à¥à¤•à¤¾à¤°|à¤¹à¤¾à¤¯|à¤¹à¥ˆà¤²à¥‹|à¤°à¤¾à¤®\s*à¤°à¤¾à¤®)[\s!,.]*$/i.test(
      text,
    );

  const sort = extractSort(text);
  const compare =
    /\b(compare|comparison|versus|vs\.?|better between|difference|side by side|tulna|compare karo|kaunsa better|kaunsi better|kaun better|farak|fark|antar)\b/i.test(
      text,
    );
  const siteVisit =
    /\b(site\s*visit|site\s*dekh\w*|visit|tour|dekhne\s+aana|property\s+dekh\w*)\b/i.test(
      text,
    ) ||
    /(?:à¤¸à¤¾à¤‡à¤Ÿ\s*à¤µà¤¿à¤œà¤¼à¤¿à¤Ÿ|à¤¸à¤¾à¤‡à¤Ÿ\s*à¤µà¤¿à¤œà¤¿à¤Ÿ|à¤µà¤¿à¤œà¤¼à¤¿à¤Ÿ|à¤¦à¥‡à¤–à¤¨à¥‡\s+à¤†à¤¨à¤¾|à¤ªà¥à¤°à¥‰à¤ªà¤°à¥à¤Ÿà¥€\s+à¤¦à¥‡à¤–à¤¨à¥€)/u.test(text);

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
  // `\b` is ASCII-only in JavaScript, so Devanagari words such as "à¤¸à¤¸à¥à¤¤à¤¾"
  // never matched. Use Unicode-aware boundaries for the Latin alternatives and
  // plain matches for the Devanagari ones.
  const cheapest =
    /(?:^|[^\p{L}])(?:cheap(?:est)?|affordable|budget[-\s]?friendly|lowest\s*price|low\s*price|sasta|sasti)(?:[^\p{L}]|$)/iu.test(
      message,
    ) || /(?:à¤•à¤®\s*à¤¬à¤œà¤Ÿ|à¤¸à¤¸à¥à¤¤à¤¾|à¤¸à¤¸à¥à¤¤à¥€|à¤•à¤¿à¤«à¤¾à¤¯à¤¤à¥€)/u.test(message);
  if (cheapest) return "price-asc";

  const expensive =
    /(?:^|[^\p{L}])(?:luxur(?:y|ious)|premium|high[-\s]?end|expensive|mehnga|mehangi)(?:[^\p{L}]|$)/iu.test(
      message,
    ) || /(?:à¤²à¤•à¥à¤œà¤¼à¤°à¥€|à¤²à¤•à¥à¤œà¤°à¥€|à¤ªà¥à¤°à¥€à¤®à¤¿à¤¯à¤®|à¤®à¤¹à¤‚à¤—à¤¾|à¤®à¤¹à¤à¤—à¤¾|à¤®à¤¹à¤‚à¤—à¥€)/u.test(message);
  if (expensive) return "price-desc";

  const newest =
    /(?:^|[^\p{L}])(?:latest|newest|naye\s+projects?)(?:[^\p{L}]|$)/iu.test(message) ||
    /(?:à¤¨à¤\s*à¤ªà¥à¤°à¥‹à¤œà¥‡à¤•à¥à¤Ÿà¥à¤¸?|à¤¨à¤ˆ\s*à¤²à¥‰à¤¨à¥à¤šà¤¿à¤‚à¤—)/u.test(message);
  if (newest) return "newest";

  if (
    /(?:earliest|soonest|jaldi(?:se)?)\s+possession/i.test(message) ||
    /possession\s+(?:soon|earliest|jaldi)/i.test(message) ||
    /(?:à¤œà¤²à¥à¤¦à¥€|à¤œà¤²à¥à¤¦\s*à¤¸à¥‡)\s*à¤ªà¤œà¤¼à¥‡à¤¶à¤¨|à¤ªà¤œà¤¼à¥‡à¤¶à¤¨\s*(?:à¤œà¤²à¥à¤¦à¥€|à¤œà¤²à¥à¤¦)/u.test(message)
  ) {
    return "possession";
  }
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

