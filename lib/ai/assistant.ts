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
      "Hello! I'm your Innovations property consultant. I can help you find the right home, office or retail space in Delhi NCR. Tell me your location, budget and BHK — I'll shortlist the best matches from our live database.",
    results: (n: number) =>
      n === 1
        ? "Here is my top recommendation based on your brief."
        : `Here are my top ${n} recommendations based on your brief.`,
    noExact: "I couldn't find an exact match, but here are the closest alternatives I'd recommend.",
    noResults:
      "I couldn't find a project for that combination. Try a wider budget or another location — inventory changes often.",
    cheapestFirst: "Shortlisted by lowest starting price — best for budget-focused buyers.",
    newestFirst: "Newest projects first — ideal if you want a fresh launch.",
    expensiveFirst: "Shortlisted by highest starting price — premium options first.",
    soonestFirst: "Shortlisted by earliest possession — best if you want to move in soon.",
    compare: "Here's my side-by-side comparison to help you decide.",
    compareNeedTwo: "Pick two or three projects and I'll compare them for you.",
    siteVisit: `I can schedule a site visit for you. Just call ${SITE.phone} or book from any project page — our team will confirm your slot.`,
    visitOnly: `Site visits are arranged by our team. Call ${SITE.phone} or message us on WhatsApp and we'll book your appointment. You can also open any project page and tap "Book a site visit".`,
    contact: `You can reach me and the sales team on ${SITE.phone} or at ${SITE.email}. Office: ${SITE.address}. Hours: ${SITE.hours}.`,
    fees: `Exact charges depend on the project and deal, so I'll get the team to share a written breakup before you book. Call ${SITE.phone} for current figures.`,
    booking: `I handle the full booking process — shortlist, site visit, documents and payment schedule. Call ${SITE.phone} or email ${SITE.email} to get started.`,
    documents: `I'll get you the exact document checklist for your chosen project. Call ${SITE.phone} and I'll send it across.`,
    loan: `Home-loan support is available through me. Call ${SITE.phone} and I'll walk you through lender options.`,
    options: "Here are some featured projects I recommend.",
    bookingAsk: "To book your site visit, please send me all of these in one message: your full name, mobile number, preferred date (YYYY-MM-DD), preferred time slot (e.g. 10:00–12:00), and the project name. Missing: {missing}.",
    bookingSuccess: (d: { projectName: string; date: string; time: string; phone: string }) =>
      `Your site visit is booked for ${d.projectName} on ${d.date} at ${d.time}. I'll have our team call ${d.phone} to confirm the slot.`,
    bookingMissing: (d: { missing: string }) =>
      `I still need these details: ${d.missing}. Please send name, mobile number, date (YYYY-MM-DD), time, and project name in one message.`,
    bookingInvalidPhone: "That phone number doesn't look valid. Please send a 10-digit Indian mobile number.",
    askBudget: "What is your budget range?",
    askBhk: "Which BHK are you looking for?",
    askSiteVisit: "Would you like me to schedule a site visit?",
    qualificationIntro: "Before I shortlist, let me understand your needs better:",
    recommendationNote: "Consultant's note:",
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
      "Namaste! Main aapka Innovations property consultant hoon. Main aapko Delhi NCR mein sahi home, office ya retail space dhoondhne mein madad kar sakta hoon. Aap location, budget aur BHK batayiye — main live database mein se best matches shortlist karunga.",
    results: (n: number) =>
      n === 1
        ? "Aapki requirement ke hisaab se meri top recommendation yeh hai."
        : `Aapki requirement ke hisaab se meri top ${n} recommendations yeh hain.`,
    noExact: "Exact match nahi mila, lekin main jo closest alternatives recommend karunga woh yeh hain.",
    noResults:
      "Is combination ke liye koi project nahi mila. Budget thoda badha kar ya doosri location try kariye — inventory update hoti rehti hai.",
    cheapestFirst: "Sabse kam starting price ke hisaab se shortlist kiye hain — budget-focused buyers ke liye best.",
    newestFirst: "Sabse naye projects pehle — agar aap fresh launch chahte hain toh ideal hai.",
    expensiveFirst: "Sabse zyada starting price ke hisaab se shortlist kiye hain — premium options pehle.",
    soonestFirst: "Sabse jaldi possession wale projects pehle — agar jaldi shift karna hai toh best.",
    compare: "Yahan meri side-by-side comparison hai jo aapke faisle mein madad karegi.",
    compareNeedTwo: "Do ya teen projects chuniye, main unki comparison karke batata hoon.",
    siteVisit: `Main aapke liye site visit schedule kar sakta hoon. Bas ${SITE.phone} par call kariye ya kisi bhi project page se book kariye — hamari team aapka slot confirm karegi.`,
    visitOnly: `Site visit hamari team arrange karti hai. ${SITE.phone} par call kariye ya WhatsApp par message kariye, hum aapka appointment book karenge. Kisi bhi project page par "Book a site visit" bhi hai.`,
    contact: `Aap mujhe aur sales team ko ${SITE.phone} par ya ${SITE.email} par contact kar sakte hain. Office: ${SITE.address}. Office hours ${SITE.hours}.`,
    fees: `Exact charges project aur deal par depend karte hain, isliye main team se likhit breakup ladwaunga booking se pehle. Current figures ke liye ${SITE.phone} par call kariye.`,
    booking: `Main poora booking process handle karta hoon — shortlist, site visit, documents aur payment schedule. Shuru karne ke liye ${SITE.phone} par call kariye ya ${SITE.email} par email kariye.`,
    documents: `Main aapke chune hue project ka exact document checklist dunga. ${SITE.phone} par call kariye aur main aapko bhej dunga.`,
    loan: `Home-loan support mere zariye available hai. ${SITE.phone} par call kariye aur main lender options samjhaunga.`,
    options: "Yeh kuch featured projects hain jo main recommend karta hoon.",
    bookingAsk: "Apni site visit book karne ke liye, please ye sab ek message mein bhejein: aapka pura naam, mobile number, preferred date (YYYY-MM-DD), preferred time slot (jaise 10:00–12:00), aur project ka naam. Kami: {missing}.",
    bookingSuccess: (d: { projectName: string; date: string; time: string; phone: string }) =>
      `Aapki site visit book ho gayi hai ${d.projectName} ke liye, ${d.date} ko ${d.time} par. Main apni team ko ${d.phone} par call karke slot confirm karwata hoon.`,
    bookingMissing: (d: { missing: string }) =>
      `Mujhe abhi ye chahiye: ${d.missing}. Naam, mobile number, date (YYYY-MM-DD), time, aur project naam ek message mein bhejein.`,
    bookingInvalidPhone: "Ye phone number valid nahi lag raha. Kripya ek 10-digit Indian mobile number bhejein.",
    askBudget: "Aapka budget kya hai?",
    askBhk: "Aap kis BHK ki talash mein hain?",
    askSiteVisit: "Kya aap chahte hain main site visit schedule karwaun?",
    qualificationIntro: "Shortlist karne se pehle, aapki needs samajhne ke liye thoda detail chahiye:",
    recommendationNote: "Consultant ki raye:",
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
      "नमस्ते! मैं आपका Innovations प्रॉपर्टी कंसल्टेंट हूँ। मैं आपको दिल्ली NCR में सही घर, ऑफिस या रिटेल स्पेस ढूंढने में मदद कर सकता हूँ। अपनी लोकेशन, बजट और BHK बताइए — मैं लाइव डेटाबेस से बेस्ट मैच शॉर्टलिस्ट करूँगा।",
    results: (n: number) =>
      n === 1
        ? "आपकी ज़रूरत के हिसाब से मेरी टॉप सिफारिश यह है।"
        : `आपकी ज़रूरत के हिसाब से मेरी टॉप ${n} सिफारिशें ये हैं।`,
    noExact: "सटीक मैच नहीं मिला, लेकिन मैं जिन निकटतम विकल्पों की सिफारिश करूँगा, वे ये हैं।",
    noResults:
      "इस संयोजन के लिए कोई प्रोजेक्ट नहीं मिला। बजट थोड़ा बढ़ाकर या दूसरी लोकेशन आज़माइए — उपलब्धता बदलती रहती है।",
    cheapestFirst: "सबसे कम शुरुआती कीमत के हिसाब से शॉर्टलिस्ट किए गए हैं — बजट-फोकस्ड खरीदारों के लिए सर्वोत्तम।",
    newestFirst: "सबसे नए प्रोजेक्ट पहले — अगर आप नया लॉन्च चाहते हैं तो आदर्श।",
    expensiveFirst: "सबसे ज़्यादा शुरुआती कीमत के हिसाब से शॉर्टलिस्ट किए गए हैं — प्रीमियम विकल्प पहले।",
    soonestFirst: "सबसे जल्दी कब्ज़े वाले प्रोजेक्ट पहले — अगर जल्दी शिफ्ट करना है तो सर्वोत्तम।",
    compare: "यहाँ मेरी साइड-बाय-साइड तुलना है जो आपके निर्णय में मदद करेगी।",
    compareNeedTwo: "दो या तीन प्रोजेक्ट चुनिए, मैं उनकी तुलना करके बताऊंगा।",
    siteVisit: `मैं आपके लिए साइट विज़िट शेड्यूल कर सकता हूँ। बस ${SITE.phone} पर कॉल कीजिए या किसी भी प्रोजेक्ट पेज से बुक कीजिए — हमारी टीम आपका स्लॉट कन्फर्म करेगी।`,
    visitOnly: `साइट विज़िट हमारी टीम तय करती है। ${SITE.phone} पर कॉल कीजिए या WhatsApp पर मैसेज कीजिए, हम आपका अपॉइंटमेंट बुक करेंगे। किसी भी प्रोजेक्ट पेज पर "Book a site visit" भी है।`,
    contact: `आप मुझसे और सेल्स टीम से ${SITE.phone} पर या ${SITE.email} पर संपर्क कर सकते हैं। ऑफिस: ${SITE.address}। समय: ${SITE.hours}।`,
    fees: `सटीक शुल्क प्रोजेक्ट और डील पर निर्भर करते हैं, इसलिए मैं बुकिंग से पहले टीम से लिखित ब्रेकअप दिलवाऊंगा। मौजूदा आंकड़ों के लिए ${SITE.phone} पर कॉल कीजिए।`,
    booking: `मैं पूरा बुकिंग प्रोसेस संभालता हूँ — शॉर्टलिस्ट, साइट विज़िट, दस्तावेज़ और भुगतान योजना। शुरू करने के लिए ${SITE.phone} पर कॉल कीजिए या ${SITE.email} पर ईमेल कीजिए।`,
    documents: `मैं आपके चुने हुए प्रोजेक्ट की सटीक दस्तावेज़ सूची दूंगा। ${SITE.phone} पर कॉल कीजिए और मैं आपको भेज दूंगा।`,
    loan: `होम-लोन सहायता मेरे ज़रिए उपलब्ध है। ${SITE.phone} पर कॉल कीजिए और मैं लेंडर विकल्प समझाऊंगा।`,
    options: "ये कुछ फीचर्ड प्रोजेक्ट हैं जिन्हें मैं सिफारिश करता हूँ।",
    bookingAsk: "अपनी साइट विज़िट बुक करने के लिए, कृपया ये सब एक संदेश में भेजें: आपका पूरा नाम, मोबाइल नंबर, पसंदीदा तारीख (YYYY-MM-DD), पसंदीदा समय स्लॉट (उदाहरण 10:00–12:00), और प्रोजेक्ट का नाम। गायब: {missing}.",
    bookingSuccess: (d: { projectName: string; date: string; time: string; phone: string }) =>
      `आपकी साइट विज़िट ${d.projectName} के लिए ${d.date} को ${d.time} पर बुक कर दी गई है। मैं अपनी टीम को ${d.phone} पर कॉल करके स्लॉट कन्फर्म करवाऊंगा।`,
    bookingMissing: (d: { missing: string }) =>
      `मुझे अभी ये चाहिए: ${d.missing}. कृपया नाम, मोबाइल नंबर, तारीख (YYYY-MM-DD), समय, और प्रोजेक्ट का नाम एक संदेश में भेजें।`,
    bookingInvalidPhone: "यह फोन नंबर वैध नहीं लग रहा। कृपया एक 10-अंकों का भारतीय मोबाइल नंबर भेजें।",
    askBudget: "आपका बजट क्या है?",
    askBhk: "आप किस BHK की तलाश में हैं?",
    askSiteVisit: "क्या आप चाहते हैं मैं साइट विज़िट निर्धारित कराऊं?",
    qualificationIntro: "शॉर्टलिस्ट करने से पहले, आपकी ज़रूरतें समझने के लिए थोड़ा विवरण चाहिए:",
    recommendationNote: "कंसल्टेंट की राय:",
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

/** ---------- Consultant recommendation notes ---------- */

const LOCALITY_INSIGHTS: Record<ChatLanguage, Record<string, string>> = {
  en: {
    noida: "Noida offers established infrastructure and quick connectivity to Delhi — great for end-users.",
    "noida-extension":
      "Noida Extension (Greater Noida West) gives you more space per rupee — ideal for first-time buyers and investors.",
    "greater-noida":
      "Greater Noida is perfect for bigger plots and upcoming commercial hubs near the expressway.",
    "delhi-ncr": "Delhi NCR covers the wider capital corridor — good for those who want central connectivity.",
  },
  hinglish: {
    noida: "Noida mein infrastructure achha hai aur Delhi se connectivity quick hai — end-users ke liye great hai.",
    "noida-extension":
      "Noida Extension (Greater Noida West) mein kam paise mein zyada space milta hai — first-time buyers aur investors ke liye ideal hai.",
    "greater-noida":
      "Greater Noida bade plots aur expressway ke paas commercial hubs ke liye perfect hai.",
    "delhi-ncr": "Delhi NCR capital region ka wider corridor hai — central connectivity chahne walon ke liye achha.",
  },
  hi: {
    noida: "नोएडा में स्थापित बुनियादी ढांचा और दिल्ली से तेज कनेक्टिविटी है — अंतिम उपयोगकर्ताओं के लिए बेहतरीन।",
    "noida-extension":
      "नोएडा एक्सटेंशन (ग्रेटर नोएडा वेस्ट) में कम रुपये में अधिक स्थान मिलता है — पहली बार खरीदने वालों और निवेशकों के लिए आदर्श।",
    "greater-noida":
      "ग्रेटर नोएडा बड़े भूखंडों और एक्सप्रेसवे के पास आगामी वाणिज्यिक केंद्रों के लिए आदर्श है।",
    "delhi-ncr": "दिल्ली एनसीआर व्यापक राजधानी गलियारा है — केंद्रीय कनेक्टिविटी चाहने वालों के लिए अच्छा।",
  },
};

function buildConsultantNote(
  intent: SearchIntent,
  cards: { name: string; startingPrice: number; location: string; statusLabel: string }[],
  language: ChatLanguage,
): string | null {
  const insights = LOCALITY_INSIGHTS[language];
  const loc = intent.location ? insights[intent.location] : null;

  if (loc) return loc;

  if (intent.sort === "price-asc" && cards.length > 0) {
    const cheapest = cards[0];
    if (language === "en")
      return `If budget is your priority, ${cheapest.name} starts at ₹${Math.round(cheapest.startingPrice / 100000)} L — great value.`;
    if (language === "hi")
      return `अगर बजट आपकी प्राथमिकता है, तो ${cheapest.name} की शुरुआत ₹${Math.round(cheapest.startingPrice / 100000)} L से होती है — बढ़िया वैल्यू है।`;
    return `Agar budget aapki priority hai, toh ${cheapest.name} ki shuruat ₹${Math.round(cheapest.startingPrice / 100000)} L se hoti hai — badhiya value hai.`;
  }

  return null;
}

/** ---------- End consultant notes ---------- */

/** ---------- Site-visit / call / appointment booking via AI ---------- */

const BOOKING_KEYWORDS = [
  // English
  "site visit", "site visit book", "book a site visit", "site visit booking",
  "appointment", "booking", "schedule", "slot", "slot book", "slot booking",
  "call me", "call karo", "call karna", "call karna hai", "bolao", "bolna hai",
  "time fix", "time fix karna", "mere liye book", "book for me",
  // Hinglish / Hindi
  "अपॉइंटमेंट", "अपॉइंटमेंट लें", "अपॉइंटमेंट लेंना", "बुक कर", "book kar",
  "book karna", "book karna hai", "बुकिंग", "बुकिंग कर", "बुकिंग करना",
  "स्लॉट", "स्लॉट बुक", "स्लॉट बुक करना", "टाइम फिक्स", "टाइम फिक्स करना",
  "site visit karna", "site visit karna hai", "site visit book karna",
  "site visit book karna hai", "mere liye site visit", "site visit ke liye",
  "mujhe site visit", "appointment lena", "appointment lena hai",
  "appointment book karna", "appointment book karna hai",
  "mere liye appointment", "mere liye call", "mere liye bolao",
];

const BOOKING_QUESTION_PATTERNS = [
  /kaise\s*book/, /how\s+(do\s+)?(i\s+)?book/, /booking\s+kaise/, /how\s+to\s+book/,
  /kaise\s*appointment/, /appointment\s+kaise/,
];

function detectBookingIntent(message: string): boolean {
  const m = message.toLowerCase();
  // "How do I book..." is a question, not a booking request
  if (BOOKING_QUESTION_PATTERNS.some((p) => p.test(m))) return false;
  return BOOKING_KEYWORDS.some((k) => m.includes(k.toLowerCase()));
}

interface BookingDetails {
  name?: string;
  phone?: string;
  email?: string;
  preferredDate?: string; // YYYY-MM-DD
  preferredTime?: string;
}

function parseBookingDetails(message: string): BookingDetails {
  const details: BookingDetails = {};

  // Phone: 10 digits starting with 6–9, optionally prefixed with +91 / 91
  const phoneMatch = message.match(/(?:\+91|91)?[6-9]\d{9}/);
  if (phoneMatch) details.phone = phoneMatch[0];

  // Date: YYYY-MM-DD, or DD-MM-YYYY / DD/MM/YYYY → normalise to YYYY-MM-DD
  const isoMatch = message.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  const dmyMatch = message.match(/\b(\d{2})[-/](\d{2})[-/](\d{4})\b/);
  if (isoMatch) {
    details.preferredDate = isoMatch[0];
  } else if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    details.preferredDate = `${y}-${m}-${d}`;
  }

  // Time slot: "10:00–12:00", "14:00-16:00", etc.
  const timeMatch = message.match(/\b(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})\b/);
  if (timeMatch) details.preferredTime = timeMatch[0];

  // Name: "mera naam X hai", "naam X hai", "my name is X", "i am X"
  const nameMatch = message.match(
    /(?:mera\s+naam|naam|my\s+name\s+is|i\s+am)\s+([a-zA-Z][a-zA-Z\s]{1,40})/i,
  );
  if (nameMatch) details.name = nameMatch[1].trim();

  return details;
}

const BOOKING_FIELD_LABELS: Record<ChatLanguage, Record<string, string>> = {
  en: {
    name: "full name",
    phone: "mobile number",
    date: "date (YYYY-MM-DD)",
    time: "time slot",
    project: "project name",
  },
  hinglish: {
    name: "aapka pura naam",
    phone: "mobile number",
    date: "date (YYYY-MM-DD)",
    time: "time slot",
    project: "project naam",
  },
  hi: {
    name: "aapka pura naam",
    phone: "mobile number",
    date: "tarikh (YYYY-MM-DD)",
    time: "samay slot",
    project: "project ka naam",
  },
};

function missingFieldsLabel(details: BookingDetails, hasProject: boolean, language: ChatLanguage): string {
  const labels = BOOKING_FIELD_LABELS[language];
  const missing: string[] = [];
  if (!details.name) missing.push(labels.name);
  if (!details.phone) missing.push(labels.phone);
  if (!details.preferredDate) missing.push(labels.date);
  if (!details.preferredTime) missing.push(labels.time);
  if (!hasProject) missing.push(labels.project);
  return missing.join(", ");
}

async function resolveProject(message: string, contextIds: string[]): Promise<AssistantProject | null> {
  if (contextIds.length > 0) {
    const found = await db.project.findFirst({
      where: { id: contextIds[0], published: true, archived: false },
      include: projectCardInclude,
    });
    if (found) return found;
  }
  const mentioned = await findMentionedProjects(message);
  return mentioned.length > 0 ? mentioned[0] : null;
}

type CompleteBookingDetails = BookingDetails & {
  name: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  projectId: string;
  projectName: string;
};

async function bookSiteVisit(
  details: CompleteBookingDetails,
  language: ChatLanguage,
): Promise<{ success: boolean; reply: string }> {
  const copy = LANG_COPY[language];

  // Validate phone
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  if (!phoneRegex.test(details.phone)) {
    return { success: false, reply: copy.bookingInvalidPhone };
  }

  // Validate date is today or later
  const visitDate = new Date(`${details.preferredDate}T00:00:00.000Z`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(visitDate.getTime()) || visitDate < today) {
    return { success: false, reply: "Please choose a date from today onwards." };
  }

  try {
    await db.$transaction(async (tx) => {
      const created = await tx.siteVisit.create({
        data: {
          projectId: details.projectId,
          name: details.name,
          phone: details.phone,
          email: details.email ?? null,
          preferredDate: visitDate,
          preferredTime: details.preferredTime,
          message: `Site visit booked via Innovations AI assistant.`,
          status: "PENDING",
        },
        select: { id: true },
      });

      await tx.inquiry.create({
        data: {
          name: details.name,
          phone: details.phone,
          email: details.email ?? null,
          projectId: details.projectId,
          projectName: details.projectName,
          inquiryType: "SITE_VISIT",
          message: `Site visit requested for ${details.preferredDate} (${details.preferredTime}) via AI assistant.`,
          source: "ai-assistant",
          status: "NEW",
        },
      });

      return created;
    });

    return {
      success: true,
      reply: copy.bookingSuccess({
        projectName: details.projectName,
        date: details.preferredDate,
        time: details.preferredTime,
        phone: details.phone,
      }),
    };
  } catch {
    return {
      success: false,
      reply: "Booking failed. Please try again or call us directly.",
    };
  }
}

/** ---------- End booking ---------- */

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

  // ---------- Booking flow: site visit / call / appointment via AI ----------
  if (detectBookingIntent(message)) {
    const details = parseBookingDetails(message);
    const project = await resolveProject(message, contextIds);
    const hasProject = Boolean(project);
    const missing = missingFieldsLabel(details, hasProject, language);

    if (missing) {
      const reply = copy.bookingAsk.replace("{missing}", missing);
      return {
        reply,
        speech: reply,
        language,
        intent: publicIntent(intent),
        projects: [],
        suggestions: [copy.suggestions.noida, copy.suggestions.ready],
        meta: { total: 0, relaxed: false, provider: providerResult.provider },
      };
    }

    const result = await bookSiteVisit(
      {
        name: details.name!,
        phone: details.phone!,
        email: details.email ?? "",
        projectId: project!.id,
        projectName: project!.name,
        preferredDate: details.preferredDate!,
        preferredTime: details.preferredTime!,
      } as CompleteBookingDetails,
      language,
    );

    return {
      reply: result.reply,
      speech: result.reply,
      language,
      intent: publicIntent(intent),
      projects: project ? [toCard(project)] : [],
      suggestions: [copy.suggestions.visit, copy.suggestions.ready],
      meta: { total: 0, relaxed: false, provider: providerResult.provider },
    };
  }

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

  // ---------- Clarification: ask for missing key criteria before searching ----------
  if (intent.location && (!intent.bhk || (!intent.minPrice && !intent.maxPrice))) {
    const copy = LANG_COPY[language];
    const where = locationLabel(intent.location);
    const missing: string[] = [];
    if (!intent.bhk) missing.push(copy.askBhk);
    if (!intent.minPrice && !intent.maxPrice) missing.push(copy.askBudget);

    if (language === "en") {
      return {
        reply: `I can help you find a property in ${where}. ${missing.join(" ")} ${copy.askSiteVisit}`,
        speech: `I can help you find a property in ${where}. ${missing.join(" ")} ${copy.askSiteVisit}`,
        language,
        intent: publicIntent(intent),
        projects: [],
        suggestions: [copy.suggestions.noida, copy.suggestions.ready, copy.suggestions.cheap],
        meta: { total: 0, relaxed: false, provider: providerResult.provider },
      };
    }
    if (language === "hi") {
      return {
        reply: `मैं आपकी ${where} में प्रॉपर्टी खोजने में मदद कर सकता हूँ। ${missing.join(" ")} ${copy.askSiteVisit}`,
        speech: `मैं आपकी ${where} में प्रॉपर्टी खोजने में मदद कर सकता हूँ। ${missing.join(" ")} ${copy.askSiteVisit}`,
        language,
        intent: publicIntent(intent),
        projects: [],
        suggestions: [copy.suggestions.noida, copy.suggestions.ready, copy.suggestions.cheap],
        meta: { total: 0, relaxed: false, provider: providerResult.provider },
      };
    }
    return {
      reply: `Main aapko ${where} mein property dhoondhne mein madad kar sakta hoon. ${missing.join(" ")} ${copy.askSiteVisit}`,
      speech: `Main aapko ${where} mein property dhoondhne mein madad kar sakta hoon. ${missing.join(" ")} ${copy.askSiteVisit}`,
      language,
      intent: publicIntent(intent),
      projects: [],
      suggestions: [copy.suggestions.noida, copy.suggestions.ready, copy.suggestions.cheap],
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

  // ---------- Consultant recommendation note ----------
  const consultantNote = buildConsultantNote(intent, cards, language);
  if (consultantNote) lines.push(copy.recommendationNote + " " + consultantNote);

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
