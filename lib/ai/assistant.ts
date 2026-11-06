import { db } from "../db";
import { projectCardInclude, searchProjects, type ProjectCardData } from "../queries";
import { SITE, STATUS_LABELS } from "../constants";
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
      "Hello! I'm Innovations AI. Tell me a location, budget, BHK or property type and I'll search our live project database.",
    results: (n: number) =>
      n === 1
        ? "I found 1 project that matches your brief."
        : `I found ${n} projects that match your brief.`,
    noExact: "I couldn't find an exact match, so here are the closest options from our database.",
    noResults:
      "I couldn't find a project for that combination. Try a wider budget or another location — inventory changes often.",
    cheapestFirst: "Sorted by the lowest starting price.",
    newestFirst: "Newest projects first.",
    expensiveFirst: "Sorted by the highest starting price.",
    soonestFirst: "Sorted by the earliest possession.",
    compare: "Here's a side-by-side comparison from our database.",
    compareNeedTwo: "Pick two or three projects to compare. These matches are a good start.",
    siteVisit: `You can schedule a site visit from any project page, or call ${SITE.phone} — the sales team will confirm your slot.`,
    visitOnly: `Site visits are arranged by our sales team. Call ${SITE.phone} or message us on WhatsApp and we'll confirm a slot. You can also open any project page and tap "Book a site visit".`,
    contact: `You can reach the sales team on ${SITE.phone} or at ${SITE.email}. Office: ${SITE.address}. Hours: ${SITE.hours}.`,
    fees: `Exact charges depend on the project and the deal, so the team shares a written breakup before booking. Call ${SITE.phone} for the current figures.`,
    booking: `The team handles booking end to end — shortlist, site visit, documents and the payment schedule. Call ${SITE.phone} or email ${SITE.email} to start.`,
    documents: `The sales team shares the exact document checklist for the project you choose. Call ${SITE.phone} and they'll send it across.`,
    loan: `Home-loan support is available through our sales team. Call ${SITE.phone} and they'll walk you through the lender options.`,
    options: "Here are some featured projects from our database.",
    suggestions: {
      compare: "Compare these projects",
      visit: "Book a site visit",
      ready: "Show ready-to-move options",
      cheap: "Show options under ₹75 L",
      noida: "Projects in Noida",
    },
  },
  hinglish: {
    greeting:
      "Namaste! Main Innovations AI hoon. Aap location, budget, BHK ya property type batayiye — main live database se matching projects dhoondh kar dikhaunga.",
    results: (n: number) =>
      n === 1
        ? "Database mein 1 project mila jo aapki requirement se match karta hai."
        : `Database mein ${n} projects mile jo aapki requirement se match karte hain.`,
    noExact: "Exact match nahi mila, lekin yeh closest options hain jo database mein available hain.",
    noResults:
      "Is combination ke liye koi project nahi mila. Budget thoda badha kar ya doosri location try kariye — inventory update hoti rehti hai.",
    cheapestFirst: "Matches sabse kam starting price ke hisaab se sort kiye hain.",
    newestFirst: "Matches mein sabse naye projects pehle dikhaye hain.",
    expensiveFirst: "Matches sabse zyada starting price ke hisaab se sort kiye hain.",
    soonestFirst: "Matches mein sabse jaldi possession wale projects pehle hain.",
    compare: "Yahan aapke chune hue projects ka database-based comparison hai.",
    compareNeedTwo: "Comparison ke liye do ya teen projects chuniye. Shuruaat ke liye yeh matches hain:",
    siteVisit: `Kisi bhi project page se site visit schedule kar sakte hain, ya ${SITE.phone} par call kariye — sales team aapka slot confirm karegi.`,
    visitOnly: `Site visit sales team arrange karti hai. ${SITE.phone} par call kariye ya WhatsApp par message kariye, hum slot confirm kar denge. Kisi bhi project page par "Book a site visit" bhi hai.`,
    contact: `Sales team se ${SITE.phone} par ya ${SITE.email} par baat kar sakte hain. Office: ${SITE.address}. Office hours ${SITE.hours}.`,
    fees: `Exact charges project aur deal par depend karte hain, isliye team booking se pehle written breakup deti hai. Current figures ke liye ${SITE.phone} par call kariye.`,
    booking: `Booking ka poora process team handle karti hai — shortlist, site visit, documents aur payment schedule. Shuru karne ke liye ${SITE.phone} par call kariye ya ${SITE.email} par email kariye.`,
    documents: `Aapke chune hue project ka exact document checklist sales team share karti hai. ${SITE.phone} par call kariye aur wo aapko bhej degi.`,
    loan: `Home-loan support sales team ke through milta hai. ${SITE.phone} par call kariye aur wo lender options samjha dengi.`,
    options: "Yeh database ke kuch featured projects hain.",
    suggestions: {
      compare: "In projects ko compare karein",
      visit: "Site visit book karein",
      ready: "Ready-to-move options dikhayein",
      cheap: "₹75 L se kam options dikhayein",
      noida: "Noida ke projects",
    },
  },
  hi: {
    greeting:
      "नमस्ते! मैं Innovations AI हूँ। अपनी लोकेशन, बजट, BHK या प्रॉपर्टी टाइप बताइए — मैं लाइव डेटाबेस से मिलते-जुलते प्रोजेक्ट दिखाऊँगा।",
    results: (n: number) =>
      n === 1
        ? "डेटाबेस में 1 प्रोजेक्ट मिला जो आपकी ज़रूरत से मेल खाता है।"
        : `डेटाबेस में ${n} प्रोजेक्ट मिले जो आपकी ज़रूरत से मेल खाते हैं।`,
    noExact: "सटीक मैच नहीं मिला, लेकिन ये डेटाबेस के सबसे नज़दीकी विकल्प हैं।",
    noResults:
      "इस संयोजन के लिए कोई प्रोजेक्ट नहीं मिला। बजट थोड़ा बढ़ाकर या दूसरी लोकेशन आज़माइए — उपलब्धता बदलती रहती है।",
    cheapestFirst: "मैचों को सबसे कम शुरुआती कीमत के हिसाब से क्रमबद्ध किया है।",
    newestFirst: "मैचों में सबसे नए प्रोजेक्ट पहले दिखाए गए हैं।",
    expensiveFirst: "मैचों को सबसे ज़्यादा शुरुआती कीमत के हिसाब से क्रमबद्ध किया है।",
    soonestFirst: "मैचों में सबसे जल्दी पज़ेशन वाले प्रोजेक्ट पहले हैं।",
    compare: "यहाँ आपके चुने हुए प्रोजेक्ट्स की डेटाबेस-आधारित तुलना है।",
    compareNeedTwo: "तुलना के लिए दो या तीन प्रोजेक्ट चुनिए। शुरुआत के लिए ये मैच हैं:",
    siteVisit: `किसी भी प्रोजेक्ट पेज से साइट विज़िट शेड्यूल कर सकते हैं, या ${SITE.phone} पर कॉल कीजिए — सेल्स टीम आपका स्लॉट कन्फर्म करेगी।`,
    visitOnly: `साइट विज़िट सेल्स टीम तय करती है। ${SITE.phone} पर कॉल कीजिए या WhatsApp पर मैसेज कीजिए, हम स्लॉट कन्फर्म कर देंगे। किसी भी प्रोजेक्ट पेज पर "Book a site visit" भी है।`,
    contact: `सेल्स टीम से ${SITE.phone} पर या ${SITE.email} पर संपर्क कर सकते हैं। ऑफिस: ${SITE.address}। समय: ${SITE.hours}।`,
    fees: `सटीक शुल्क प्रोजेक्ट और डील पर निर्भर करते हैं, इसलिए टीम बुकिंग से पहले लिखित ब्रेकअप देती है। मौजूदा आँकड़ों के लिए ${SITE.phone} पर कॉल कीजिए।`,
    booking: `बुकिंग का पूरा काम टीम संभालती है — शॉर्टलिस्ट, साइट विज़िट, दस्तावेज़ और भुगतान योजना। शुरू करने के लिए ${SITE.phone} पर कॉल कीजिए या ${SITE.email} पर ईमेल कीजिए।`,
    documents: `आपके चुने हुए प्रोजेक्ट की सटीक दस्तावेज़ सूची सेल्स टीम भेजती है। ${SITE.phone} पर कॉल कीजिए और वो आपको भेज देगी।`,
    loan: `होम-लोन सहायता सेल्स टीम के ज़रिए मिलती है। ${SITE.phone} पर कॉल कीजिए और वो लेंडर विकल्प समझा देगी।`,
    options: "ये डेटाबेस के कुछ फ़ीचर्ड प्रोजेक्ट हैं।",
    suggestions: {
      compare: "इन प्रोजेक्ट्स की तुलना करें",
      visit: "साइट विज़िट बुक करें",
      ready: "रेडी-टू-मूव विकल्प दिखाएँ",
      cheap: "₹75 लाख से कम विकल्प",
      noida: "नोएडा के प्रोजेक्ट",
    },
  },
} as const;

function joinList(items: string[], lang: ChatLanguage) {
  if (items.length <= 1) return items.join("");
  const and = lang === "hi" ? "और" : "and";
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

function textPrice(value: number, lang: ChatLanguage) {
  if (lang !== "hi") return formatPriceShort(value);
  if (value >= 10_000_000) {
    const crore = value / 10_000_000;
    return `₹${Number.isInteger(crore) ? crore : crore.toFixed(2).replace(/\.?0+$/, "")} करोड़`;
  }
  if (value >= 100_000) {
    const lakh = value / 100_000;
    return `₹${Number.isInteger(lakh) ? lakh : lakh.toFixed(2).replace(/\.?0+$/, "")} लाख`;
  }
  return formatPriceShort(value);
}

function configPhrase(configs: string[], lang: ChatLanguage) {
  if (!configs.length) return "";
  return `${joinList(configs, lang)} BHK`;
}

function budgetPhrase(intent: SearchIntent, lang: ChatLanguage) {
  const price = (value: number) => textPrice(value, lang);
  if (intent.minPrice && intent.maxPrice) {
    if (lang === "en") return `between ${price(intent.minPrice)} and ${price(intent.maxPrice)}`;
    if (lang === "hi") return `${price(intent.minPrice)} से ${price(intent.maxPrice)} के बीच`;
    return `${price(intent.minPrice)} se ${price(intent.maxPrice)} ke beech`;
  }
  if (intent.maxPrice) {
    if (lang === "en") return `under ${price(intent.maxPrice)}`;
    if (lang === "hi") return `${price(intent.maxPrice)} से कम`;
    return `${price(intent.maxPrice)} se kam`;
  }
  if (intent.minPrice) {
    if (lang === "en") return `above ${price(intent.minPrice)}`;
    if (lang === "hi") return `${price(intent.minPrice)} से ज़्यादा`;
    return `${price(intent.minPrice)} se zyada`;
  }
  return "";
}

function searchSentence(intent: SearchIntent, lang: ChatLanguage) {
  const where = locationLabel(intent.location);
  const budget = budgetPhrase(intent, lang);
  const bhk = intent.bhk ? `${intent.bhk} BHK` : "";
  const type =
    intent.propertyType === "COMMERCIAL" ? intent.category ?? "commercial" : intent.category ?? "";
  const what = [bhk, type].filter(Boolean).join(" ");
  const amenityNames = intent.amenities.slice(0, 2);
  const amenity = amenityNames.length
    ? lang === "en"
      ? `with ${joinList(amenityNames, "en")}`
      : lang === "hi"
        ? `${joinList(amenityNames, "hi")} के साथ`
        : `${joinList(amenityNames, "hinglish")} ke saath`
    : "";

  if (lang === "en") {
    const parts = [what ? `${what} projects` : "projects", amenity, budget].filter(Boolean);
    return `Searching ${where} for ${parts.join(" ")}.`;
  }
  if (lang === "hi") {
    const parts = [budget, what ? `${what} प्रोजेक्ट` : "प्रोजेक्ट", amenity].filter(Boolean);
    return `${where} में ${parts.join(" ")} खोज रहा हूँ।`;
  }
  const parts = [budget, what ? `${what} ke projects` : "projects", amenity].filter(Boolean);
  return `${where} mein ${parts.join(" ")} dhoondh raha hoon.`;
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

function spokenConfig(label: string, language: ChatLanguage) {
  const match = label.match(/^([\d+\s,]+)\s*BHK$/i);
  if (!match) return label === "—" ? "" : label;
  const units = match[1]
    .split(",")
    .map((unit) => unit.trim())
    .filter(Boolean);
  if (units.length < 2) return label;
  return `${joinList(units, language)} BHK`;
}

/** Short speech script: the key written sentences plus the top matches. */
function speechForReply(reply: string, cards: ChatCard[], language: ChatLanguage) {
  if (!cards.length) return reply;
  const from = language === "hi" ? "से शुरू" : language === "hinglish" ? "se shuru" : "onwards";
  const top = cards
    .slice(0, 2)
    .map((card) => {
      const config = spokenConfig(card.configLabel, language);
      return `${card.name}${config ? `, ${config}` : ""}, ${spokenPrice(card.startingPrice, language)} ${from}`;
    })
    .join(". ");
  const lead = reply.split(/(?<=[.!?।])\s+/).slice(0, 2).join(" ");
  return `${lead} ${top}.`;
}

const STATUS_WORDS: Record<ChatLanguage, Record<string, string>> = {
  en: {
    NEW_LAUNCH: "new launch",
    UNDER_CONSTRUCTION: "under construction",
    READY_TO_MOVE: "ready to move",
    UPCOMING: "upcoming",
  },
  hinglish: {
    NEW_LAUNCH: "new launch",
    UNDER_CONSTRUCTION: "under construction",
    READY_TO_MOVE: "ready-to-move",
    UPCOMING: "upcoming",
  },
  hi: {
    NEW_LAUNCH: "नया लॉन्च",
    UNDER_CONSTRUCTION: "निर्माणाधीन",
    READY_TO_MOVE: "रेडी-टू-मूव",
    UPCOMING: "आगामी",
  },
};

function statusWord(status: string, language: ChatLanguage) {
  return STATUS_WORDS[language][status] ?? (STATUS_LABELS[status] ?? status).toLowerCase();
}

function projectDetailReply(project: AssistantProject, language: ChatLanguage) {
  const config = configPhrase(parseBhk(project.bhkConfigs), language);
  const price = textPrice(project.startingPrice, language);
  const possession = formatMonthYear(project.possessionDate);
  const possessionLine = possession === "—" ? "" : possession;
  const type = project.category.toLowerCase();
  const status = statusWord(project.status, language);

  if (language === "hi") {
    return `${project.name}, ${project.location.name} में ${project.developer.name} का ${status} ${type} प्रोजेक्ट है। ${config ? `${config} ` : ""}कीमत ${price} से शुरू होती है${possessionLine ? ` और पज़ेशन ${possessionLine} है` : ""}।`;
  }
  if (language === "hinglish") {
    return `${project.name}, ${project.location.name} mein ${project.developer.name} ka ${status} ${type} project hai. ${config ? `${config} ` : ""}ki keemat ${price} se shuru hoti hai${possessionLine ? ` aur possession ${possessionLine} hai` : ""}.`;
  }
  return `${project.name} is a ${status} ${type} project by ${project.developer.name} in ${project.location.name}. ${config ? `${config} units start at ${price}` : `Units start at ${price}`}${possessionLine ? `, with possession in ${possessionLine}` : ""}.`;
}

type FaqTopic = "siteVisit" | "contact" | "fees" | "booking" | "documents" | "loan";

function detectFaqTopic(message: string): FaqTopic | null {
  if (/(?:site\s*visit|visit|tour|dekhne\s+aana|साइट\s*विज़िट|साइट\s*विजिट|विज़िट|देखने\s+आना)/iu.test(message)) {
    return "siteVisit";
  }
  if (/(?:fees?|charges?|brokerage|commission|शुल्क|फीस|चार्ज|ब्रोकरेज|कमीशन)/iu.test(message)) return "fees";
  if (/(?:documents?|paperwork|kagaz|registry|agreement|दस्तावेज़|कागज|रजिस्ट्री)/iu.test(message)) {
    return "documents";
  }
  if (/(?:home\s*loan|loan|emi|finance|लोन|फाइनेंस|ईएमआई)/iu.test(message)) return "loan";
  if (/(?:booking|book\s+(?:a|kar|karna)|बुकिंग|बुक\s*कर)/iu.test(message)) return "booking";
  if (/(?:contact|phone|call|whatsapp|email|number|sales\s*team|office\s+address|address|संपर्क|फोन|ईमेल|नंबर|पता|ऑफिस\s*का\s*पता)/iu.test(message)) {
    return "contact";
  }
  return null;
}

function faqReply(topic: FaqTopic, language: ChatLanguage) {
  const copy = LANG_COPY[language];
  switch (topic) {
    case "siteVisit":
      return copy.visitOnly;
    case "contact":
      return copy.contact;
    case "fees":
      return copy.fees;
    case "booking":
      return copy.booking;
    case "documents":
      return copy.documents;
    case "loan":
      return copy.loan;
  }
}

function wantsOptions(message: string) {
  return /(?:^|\s)(?:options?|choices?|what\s+do\s+you\s+have|show\s+me\s+(?:some\s+)?(?:projects?|options?)|(?:projects?|options?)\s+dikha\w*|kya\s+kya\s+hai|विकल्प|दिखाइए|दिखाओ)(?:\s|[?.!,]|$)/iu.test(
    message,
  );
}

function isQuestion(message: string) {
  return /(?:\?|kya|kaise|kab|kitna|kitne|kitni|price|possession|status|detail|about|batao|bataiye|jankari|baare|क्या|कैसे|कब|कीमत|पज़ेशन|जानकारी|बारे)/iu.test(
    message,
  );
}

function isFollowUp(message: string) {
  return /(?:^|\s)(?:iski|iska|iske|uski|uska|uske|this\s+project|that\s+project|is\s+project|us\s+project|इसका|इसकी|इसके|उसका|उसकी|उसके)(?:\s|[?.!,]|$)/iu.test(
    message,
  );
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

  const detailResponse = (project: AssistantProject): AssistantResponse => {
    const reply = projectDetailReply(project, language);
    return {
      reply,
      speech: reply,
      language,
      intent: publicIntent(intent),
      projects: [toCard(project)],
      suggestions: [copy.suggestions.visit, copy.suggestions.compare, copy.suggestions.ready],
      meta: { total: 1, relaxed: false, provider: providerResult.provider },
    };
  };

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

  const mentioned = await findMentionedProjects(message);
  if (mentioned.length === 1 && (!hasSearchCriteria(intent) || isQuestion(message))) {
    return detailResponse(mentioned[0]);
  }

  if (!hasSearchCriteria(intent) && isFollowUp(message) && contextIds.length) {
    const project = await db.project.findFirst({
      where: { id: contextIds[0], published: true, archived: false },
      include: projectCardInclude,
    });
    if (project) return detailResponse(project);
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

  const faqTopic = detectFaqTopic(message);
  if (faqTopic && (faqTopic === "contact" || !hasSearchCriteria(intent))) {
    const reply = faqReply(faqTopic, language);
    return {
      reply,
      speech: reply,
      language,
      intent: publicIntent(intent),
      projects: [],
      suggestions: [copy.suggestions.noida, copy.suggestions.ready, copy.suggestions.cheap],
      meta: { total: 0, relaxed: false, provider: providerResult.provider },
    };
  }

  if (!hasSearchCriteria(intent) && wantsOptions(message)) {
    const featured = await db.project.findMany({
      where: { published: true, archived: false },
      include: projectCardInclude,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 3,
    });
    const cards = featured.map(toCard);
    return {
      reply: copy.options,
      speech: speechForReply(copy.options, cards, language),
      language,
      intent: publicIntent(intent),
      projects: cards,
      suggestions: [copy.suggestions.compare, copy.suggestions.visit, copy.suggestions.ready],
      meta: { total: cards.length, relaxed: false, provider: providerResult.provider },
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
  if (projects.length > 0 && intent.sort === "price-desc") lines.push(copy.expensiveFirst);
  if (projects.length > 0 && intent.sort === "newest") lines.push(copy.newestFirst);
  if (projects.length > 0 && intent.sort === "possession") lines.push(copy.soonestFirst);
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
