import { db } from "../db";
import { projectCardInclude, searchProjects, type ProjectCardData } from "../queries";
import { STATUS_LABELS } from "../constants";
import { formatMonthYear, formatPriceShort, parseBhk } from "../utils";
import {
  detectLanguage,
  hasSearchCriteria,
  locationLabel,
  mergeIntents,
  parseIntent,
  type ChatLanguage,
  type SearchIntent,
} from "./intent";
import { extractWithProvider } from "./provider";
import type { AssistantResponse, ChatCard, ComparisonTable } from "./types";

type HistoryMessage = { role: "user" | "assistant"; content: string };
type AssistantProject = ProjectCardData;

const LANG_COPY = {
  en: {
    greeting:
      "Hello! I'm Innovations AI. Tell me a location, budget, BHK or property type — I'll search our live project database and show you real matches.",
    searching: "Searching",
    results: (n: number) =>
      `I found ${n} ${n === 1 ? "project" : "projects"} in our database that match your brief.`,
    noExact: "I couldn't find an exact match, so here are the closest options from our database.",
    noResults:
      "I couldn't find a project for that combination. Try widening the budget or choosing another location — inventory changes often.",
    cheapestFirst: "I've sorted the matches by lowest starting price.",
    newestFirst: "I've sorted the matches with the newest additions first.",
    compare: "Here's a side-by-side comparison of the projects you selected, based on our database.",
    compareNeedTwo: "Choose two or three projects to compare. Here are some matches to start with:",
    siteVisit: "You can schedule a site visit from any project page — the sales team will confirm your slot.",
    suggestions: {
      compare: "Compare these projects",
      visit: "Book a site visit",
      ready: "Show ready-to-move options",
      cheap: "Show options under ₹75 L",
      noida: "Projects in Noida",
    },
    anywhere: "across Delhi NCR",
    under: "under",
    above: "above",
    between: "between",
    and: "and",
    bhk: "BHK",
    commercial: "commercial",
    amenity: "with",
    possession: "possession",
  },
  hinglish: {
    greeting:
      "Namaste! Main Innovations AI hoon. Aap location, budget, BHK ya property type batayiye — main live database se matching projects dhoondh kar dikhaunga.",
    searching: "Search kar raha hoon",
    results: (n: number) => `Database mein ${n} projects mile jo aapki requirement se match karte hain.`,
    noExact: "Exact match nahi mila, lekin yeh closest options hain jo database mein available hain.",
    noResults:
      "Is combination ke liye koi project nahi mila. Budget thoda badha kar ya doosri location try karke dekhein — inventory update hoti rehti hai.",
    cheapestFirst: "Matches ko sabse kam starting price ke hisaab se sort kiya hai.",
    newestFirst: "Matches mein sabse naye projects pehle dikhaye hain.",
    compare: "Yahan aapke chune hue projects ka database-based comparison hai.",
    compareNeedTwo: "Comparison ke liye do ya teen projects chuniye. Shuruaat ke liye yeh matches hain:",
    siteVisit: "Kisi bhi project page se site visit schedule kar sakte hain — sales team aapka slot confirm karegi.",
    suggestions: {
      compare: "In projects ko compare karein",
      visit: "Site visit book karein",
      ready: "Ready-to-move options dikhayein",
      cheap: "₹75 L se kam options dikhayein",
      noida: "Noida ke projects",
    },
    anywhere: "Delhi NCR mein",
    under: "se kam",
    above: "se zyada",
    between: "ke beech",
    and: "aur",
    bhk: "BHK",
    commercial: "commercial",
    amenity: "ke saath",
    possession: "possession",
  },
  hi: {
    greeting:
      "नमस्ते! मैं Innovations AI हूँ। अपनी लोकेशन, बजट, BHK या प्रॉपर्टी टाइप बताइए — मैं लाइव डेटाबेस से मिलते-जुलते प्रोजेक्ट दिखाऊँगा।",
    searching: "खोज रहा हूँ",
    results: (n: number) => `डेटाबेस में ${n} प्रोजेक्ट मिले जो आपकी ज़रूरत से मेल खाते हैं।`,
    noExact: "सटीक मैच नहीं मिला, लेकिन ये डेटाबेस के सबसे नज़दीकी विकल्प हैं।",
    noResults:
      "इस संयोजन के लिए कोई प्रोजेक्ट नहीं मिला। बजट थोड़ा बढ़ाकर या दूसरी लोकेशन आज़माइए — उपलब्धता बदलती रहती है।",
    cheapestFirst: "मैचों को सबसे कम शुरुआती कीमत के हिसाब से क्रमबद्ध किया है।",
    newestFirst: "मैचों में सबसे नए प्रोजेक्ट पहले दिखाए गए हैं।",
    compare: "यहाँ आपके चुने हुए प्रोजेक्ट्स की डेटाबेस-आधारित तुलना है।",
    compareNeedTwo: "तुलना के लिए दो या तीन प्रोजेक्ट चुनिए। शुरुआत के लिए ये मैच हैं:",
    siteVisit: "किसी भी प्रोजेक्ट पेज से साइट विज़िट शेड्यूल कर सकते हैं — सेल्स टीम आपका स्लॉट कन्फर्म करेगी।",
    suggestions: {
      compare: "इन प्रोजेक्ट्स की तुलना करें",
      visit: "साइट विज़िट बुक करें",
      ready: "रेडी-टू-मूव विकल्प दिखाएँ",
      cheap: "₹75 लाख से कम विकल्प",
      noida: "नोएडा के प्रोजेक्ट",
    },
    anywhere: "दिल्ली NCR में",
    under: "से कम",
    above: "से ज़्यादा",
    between: "के बीच",
    and: "और",
    bhk: "BHK",
    commercial: "कमर्शियल",
    amenity: "के साथ",
    possession: "पज़ेशन",
  },
} as const;

function budgetPhrase(intent: SearchIntent, lang: ChatLanguage) {
  const copy = LANG_COPY[lang];
  if (intent.minPrice && intent.maxPrice) {
    return `${copy.between} ${formatPriceShort(intent.minPrice)} ${copy.and} ${formatPriceShort(intent.maxPrice)}`;
  }
  if (lang === "en") {
    if (intent.maxPrice) return `${copy.under} ${formatPriceShort(intent.maxPrice)}`;
    if (intent.minPrice) return `${copy.above} ${formatPriceShort(intent.minPrice)}`;
  } else {
    if (intent.maxPrice) return `${formatPriceShort(intent.maxPrice)} ${copy.under}`;
    if (intent.minPrice) return `${formatPriceShort(intent.minPrice)} ${copy.above}`;
  }
  return "";
}

function searchSentence(intent: SearchIntent, lang: ChatLanguage) {
  const copy = LANG_COPY[lang];
  const where = intent.location ? locationLabel(intent.location) : copy.anywhere;
  const budget = budgetPhrase(intent, lang);
  const bhk = intent.bhk ? `${intent.bhk} ${copy.bhk}` : "";
  const type =
    intent.propertyType === "COMMERCIAL"
      ? copy.commercial
      : intent.category
        ? intent.category.toLowerCase()
        : "";
  const amenity = intent.amenities.length ? `${copy.amenity} ${intent.amenities.slice(0, 2).join(", ")}` : "";

  if (lang === "en") {
    const parts = [bhk, type, intent.amenities.length ? amenity : "", budget].filter(Boolean);
    return `Searching ${where} for ${parts.join(" ")} projects.`.replace(/\s+/g, " ");
  }
  const parts = [budget, bhk, type, amenity].filter(Boolean);
  if (lang === "hi") return `${where} में ${parts.join(" ")} प्रोजेक्ट ${copy.searching}।`;
  return `${where} mein ${parts.join(" ")} projects ${copy.searching} hoon.`;
}

function toCard(project: AssistantProject): ChatCard {
  const configs = parseBhk(project.bhkConfigs);
  return {
    id: project.id,
    name: project.name,
    slug: project.slug,
    developer: project.developer.name,
    location: project.location.name,
    priceLabel: `${formatPriceShort(project.startingPrice)} onwards`,
    startingPrice: project.startingPrice,
    configLabel: configs.length
      ? project.propertyType === "COMMERCIAL"
        ? configs.join(", ")
        : `${configs.join(", ")} BHK`
      : "—",
    statusLabel: STATUS_LABELS[project.status] ?? project.status,
    propertyType: project.propertyType,
    possession: formatMonthYear(project.possessionDate),
    image: project.images[0]?.url ?? project.heroImage ?? null,
    amenitiesCount: project._count.amenities,
    isDemo: project.isDemo,
  };
}

function spokenPrice(value: number, language: ChatLanguage) {
  const croreUnit = language === "hi" ? "करोड़" : "crore";
  const lakhUnit = language === "hi" ? "लाख" : "lakh";
  if (value >= 10_000_000) {
    const crore = value / 10_000_000;
    return `${Number.isInteger(crore) ? crore : crore.toFixed(2).replace(/\.?0+$/, "")} ${croreUnit}`;
  }
  if (value >= 100_000) {
    const lakh = value / 100_000;
    return `${Number.isInteger(lakh) ? lakh : lakh.toFixed(2).replace(/\.?0+$/, "")} ${lakhUnit}`;
  }
  return String(value);
}

/** Short speech script: the full text answer plus the top two result names. */
function speechForReply(reply: string, cards: ChatCard[], language: ChatLanguage) {
  if (!cards.length) return reply;
  const from =
    language === "hi" ? "से शुरू" : language === "hinglish" ? "se shuru" : "onwards";
  const top = cards
    .slice(0, 2)
    .map((card) => `${card.name}, ${card.configLabel}, ${spokenPrice(card.startingPrice, language)} ${from}`)
    .join(". ");
  return `${reply} ${top}.`;
}

async function queryProjects(intent: SearchIntent, take = 4) {
  const result = await searchProjects(
    {
      location: intent.location,
      propertyType: intent.propertyType,
      category: intent.category,
      bhk: intent.bhk,
      minPrice: intent.minPrice,
      maxPrice: intent.maxPrice,
      status: intent.status,
      possession: intent.possessionYear ? String(intent.possessionYear) : undefined,
      amenities: intent.amenities,
      sort: intent.sort ?? "featured",
    },
    1,
  );
  return result.projects.slice(0, take);
}

async function relaxedSearch(intent: SearchIntent) {
  const attempts: SearchIntent[] = [
    { ...intent, amenities: [] },
    { ...intent, amenities: [], minPrice: undefined, bhk: undefined },
    { ...intent, amenities: [], minPrice: undefined, maxPrice: undefined, status: undefined },
  ];
  for (const attempt of attempts) {
    if (!hasSearchCriteria(attempt)) continue;
    const projects = await queryProjects(attempt, 4);
    if (projects.length) return projects;
  }
  return db.project.findMany({
    where: { published: true, archived: false, featured: true },
    include: projectCardInclude,
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

function buildComparison(projects: AssistantProject[]): ComparisonTable {
  const rows: ComparisonTable["rows"] = [
    { label: "Starting price", values: projects.map((p) => `${formatPriceShort(p.startingPrice)} onwards`) },
    {
      label: "Configuration",
      values: projects.map((p) => {
        const configs = parseBhk(p.bhkConfigs);
        return configs.length
          ? p.propertyType === "COMMERCIAL"
            ? configs.join(", ")
            : `${configs.join(", ")} BHK`
          : "—";
      }),
    },
    { label: "Location", values: projects.map((p) => p.location.name) },
    { label: "Status", values: projects.map((p) => STATUS_LABELS[p.status] ?? p.status) },
    { label: "Possession", values: projects.map((p) => formatMonthYear(p.possessionDate)) },
    { label: "Developer", values: projects.map((p) => p.developer.name) },
    { label: "Amenities", values: projects.map((p) => String(p._count.amenities)) },
  ];
  return {
    projects: projects.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
    rows,
  };
}

/** Match project names mentioned explicitly in a user's message. */
async function findMentionedProjects(message: string) {
  const text = message.toLowerCase();
  const candidates = await db.project.findMany({
    where: { published: true, archived: false },
    include: projectCardInclude,
  });
  return candidates
    .filter((project) => project.name.length >= 4 && text.includes(project.name.toLowerCase()))
    .slice(0, 3);
}

export async function getAssistantResponse(input: {
  message: string;
  history?: HistoryMessage[];
  contextProjectIds?: string[];
}): Promise<AssistantResponse> {
  const message = input.message.slice(0, 600);
  const history = (input.history ?? []).slice(-8);
  const language = detectLanguage(message);

  const previousUserIntents = history.filter((m) => m.role === "user").map((m) => parseIntent(m.content));
  const providerResult = await extractWithProvider(message);
  const intent = mergeIntents(...previousUserIntents, providerResult.intent);

  const copy = LANG_COPY[language];
  const suggestions: string[] = [];

  const contextIds = Array.from(new Set(input.contextProjectIds ?? [])).filter(Boolean).slice(0, 3);

  if (intent.compare) {
    const mentioned = await findMentionedProjects(message);
    if (mentioned.length >= 2) {
      const mentionedCards = mentioned.map(toCard);
      return {
        reply: copy.compare,
        speech: speechForReply(copy.compare, mentionedCards, language),
        language,
        intent: publicIntent(intent),
        projects: mentionedCards,
        comparison: buildComparison(mentioned),
        suggestions: [copy.suggestions.visit, copy.suggestions.ready],
        meta: { total: mentioned.length, relaxed: false, provider: providerResult.provider },
      };
    }
  }

  if (intent.compare && contextIds.length >= 2) {
    const found = await db.project.findMany({
      where: { id: { in: contextIds }, published: true, archived: false },
      include: projectCardInclude,
    });
    const ordered = contextIds
      .map((id) => found.find((p) => p.id === id))
      .filter((p): p is AssistantProject => Boolean(p));
    if (ordered.length >= 2) {
      const orderedCards = ordered.map(toCard);
      return {
        reply: copy.compare,
        speech: speechForReply(copy.compare, orderedCards, language),
        language,
        intent: publicIntent(intent),
        projects: orderedCards,
        comparison: buildComparison(ordered),
        suggestions: [copy.suggestions.visit, copy.suggestions.ready],
        meta: { total: ordered.length, relaxed: false, provider: providerResult.provider },
      };
    }
  }

  if (intent.greeting && !hasSearchCriteria(intent)) {
    return {
      reply: copy.greeting,
      speech: copy.greeting,
      language,
      intent: publicIntent(intent),
      projects: [],
      suggestions: [
        "2 BHK in Noida under ₹75 L",
        "Commercial spaces in Noida Extension",
        "Ready-to-move projects",
      ],
      meta: { total: 0, relaxed: false, provider: providerResult.provider },
    };
  }

  if (!hasSearchCriteria(intent)) {
    const prompt =
      language === "hi"
        ? "मुझे लोकेशन, बजट, BHK या प्रॉपर्टी टाइप बताइए — जैसे “नोएडा में ₹70 लाख के अंदर 2 BHK”।"
        : language === "hinglish"
          ? "Mujhe location, budget, BHK ya property type batayiye — jaise “Noida mein 70 lakh ke andar 2 BHK”."
          : "Tell me a location, budget, BHK or property type — for example “2 BHK in Noida under ₹70 lakh”.";
    return {
      reply: prompt,
      speech: prompt,
      language,
      intent: publicIntent(intent),
      projects: [],
      suggestions: [
        "2 BHK in Noida under ₹75 L",
        "Projects in Greater Noida",
        "Commercial property in Noida Extension",
      ],
      meta: { total: 0, relaxed: false, provider: providerResult.provider },
    };
  }

  let projects = await queryProjects(intent, 4);
  let relaxed = false;
  if (projects.length === 0) {
    projects = await relaxedSearch(intent);
    relaxed = true;
  }

  const cards = projects.map(toCard);
  const lines: string[] = [searchSentence(intent, language)];

  if (projects.length === 0) {
    lines.push(copy.noResults);
  } else if (relaxed) {
    lines.push(copy.noExact);
  } else {
    lines.push(copy.results(projects.length));
  }

  if (projects.length > 0 && intent.sort === "price-asc") lines.push(copy.cheapestFirst);
  if (projects.length > 0 && intent.sort === "newest") lines.push(copy.newestFirst);
  if (intent.siteVisit) lines.push(copy.siteVisit);
  if (intent.compare && contextIds.length < 2 && projects.length >= 2) {
    lines.push(copy.compareNeedTwo);
    suggestions.push(copy.suggestions.compare);
  }

  if (cards.length >= 2) suggestions.push(copy.suggestions.compare);
  if (cards.length >= 1) suggestions.push(copy.suggestions.visit);
  if (!intent.location) suggestions.push(copy.suggestions.noida);
  suggestions.push(copy.suggestions.ready);
  if (!intent.maxPrice && !intent.minPrice && intent.sort !== "price-asc") suggestions.push(copy.suggestions.cheap);

  const reply = lines.join(" ");
  return {
    reply,
    speech: speechForReply(reply, cards, language),
    language,
    intent: publicIntent(intent),
    projects: cards,
    suggestions: Array.from(new Set(suggestions)).slice(0, 4),
    meta: { total: cards.length, relaxed, provider: providerResult.provider },
  };
}

function publicIntent(intent: SearchIntent): AssistantResponse["intent"] {
  return {
    location: intent.location,
    minPrice: intent.minPrice,
    maxPrice: intent.maxPrice,
    bhk: intent.bhk,
    propertyType: intent.propertyType,
    category: intent.category,
    status: intent.status,
    amenities: intent.amenities,
    sort: intent.sort,
  };
}
