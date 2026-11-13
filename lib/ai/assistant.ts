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
  parseSpokenNumberPhrase,
  type ChatLanguage,
  type SearchIntent,
} from "./intent";
import { extractWithProvider } from "./provider";
import type { AssistantResponse, ChatCard, ComparisonTable, QualificationCollected, QualificationState, QualificationStep } from "./types";

type HistoryMessage = { role: "user" | "assistant"; content: string };
type AssistantProject = ProjectCardData;

const LANG_COPY = {
  en: {
    greeting:
      "Hi there! I'm your personal property consultant at Innovations. I'll help you find the perfect home, office or retail space — just tell me what you're looking for and I'll take care of the rest.",
    acknowledgment: "Got it!",
    thinking: "Let me check our database for you...",
    results: (n: number) =>
      n === 1
        ? "Here's my top pick for you."
        : `Here are my top ${n} picks that match what you're looking for.`,
    noExact: "I couldn't find an exact match, but here are the closest options I'd personally recommend.",
    noResults:
      "Hmm, nothing matches that combination just yet. Want to try a different budget or location?",
    cheapestFirst: "Starting with the most affordable options first.",
    newestFirst: "Freshest new launches at the top.",
    expensiveFirst: "Premium properties first.",
    soonestFirst: "Earliest possession dates first.",
    compare: "Here's a side-by-side comparison to help you decide.",
    compareNeedTwo: "Pick two or three projects and I'll walk you through the differences.",
    siteVisit: `I can book a site visit for you — just call ${SITE.phone} or tap "Book a site visit" on any project page, and our team will confirm your slot.`,
    visitOnly: `Our team handles site visits. Give us a call at ${SITE.phone} or message us on WhatsApp and we'll schedule your appointment.`,
    contact: `You can reach me directly at ${SITE.phone} or ${SITE.email}. Our office is at ${SITE.address}, open ${SITE.hours}.`,
    fees: `Charges vary by project and deal, so I'll get the team to send you a written cost breakup before anything is finalized. Call ${SITE.phone} for current figures.`,
    booking: `I'll handle the whole process for you — shortlisting, site visits, paperwork and payment schedule. Call ${SITE.phone} or email ${SITE.email} and we'll get started.`,
    documents: `I'll send you the exact document checklist for your chosen project. Just call ${SITE.phone} and I'll get it across to you.`,
    loan: `I can walk you through home-loan options. Call ${SITE.phone} and I'll explain everything step by step.`,
    options: "Here are some featured projects I'd recommend checking out.",
    bookingAsk: "To book your site visit, I just need a few details in one message: your full name, mobile number, preferred date (YYYY-MM-DD), time slot (e.g. 10:00–12:00), and which project you'd like to visit. Missing: {missing}.",
    bookingSuccess: (d: { projectName: string; date: string; time: string; phone: string }) =>
      `All set! Your site visit for ${d.projectName} is booked on ${d.date} at ${d.time}. Our team will call ${d.phone} shortly to confirm.`,
    bookingMissing: (d: { missing: string }) =>
      `I still need: ${d.missing}. Could you send me name, mobile number, date (YYYY-MM-DD), time, and project name in one message?`,
    bookingInvalidPhone: "That doesn't look like a valid mobile number. Could you send a 10-digit Indian number?",
    askBudget: "What's your budget range?",
    askBhk: "Which BHK are you thinking of?",
    askSiteVisit: "Shall I schedule a site visit for you?",
    qualificationIntro: "Let me understand your needs a bit better before I shortlist:",
    recommendationNote: "My honest take:",
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
      "Hi there! Main aapka personal property consultant hoon Innovations mein. Main aapko perfect home, office ya retail space dhoondhne mein madad karunga — bas bataiye aapko kya chahiye, baaki main handle kar lunga.",
    acknowledgment: "Samajh gaya!",
    thinking: "Chaliye main database check kar leta hoon aapke liye...",
    results: (n: number) =>
      n === 1
        ? "Yeh hai mera top pick aapke liye."
        : `Yeh hain mere top ${n} picks jo aapki requirement se match karte hain.`,
    noExact: "Exact match nahi mila, lekin main jo closest options recommend karunga woh yeh hain.",
    noResults:
      "Hmm, is combination ke liye abhi kuch nahi mila. Kya alag budget ya location try karna chahenge?",
    cheapestFirst: "Sabse affordable options shuruat mein.",
    newestFirst: "Sabse naye new launches pehle.",
    expensiveFirst: "Premium properties pehle.",
    soonestFirst: "Sabse jaldi possession wale pehle.",
    compare: "Yeh hai side-by-side comparison jo aapke decision mein madad karega.",
    compareNeedTwo: "Do ya teen projects chuniye, main aapko differences samjhaunga.",
    siteVisit: `Main aapke liye site visit book kar sakta hoon — bas ${SITE.phone} par call kariye ya kisi bhi project page par "Book a site visit" tap kariye, hamari team confirm kar degi.`,
    visitOnly: `Site visit hamari team handle karti hai. ${SITE.phone} par call kariye ya WhatsApp par message kariye, hum appointment schedule kar denge.`,
    contact: `Aap mujhe directly ${SITE.phone} par ya ${SITE.email} par contact kar sakte hain. Office ${SITE.address} pe hai, khula hai ${SITE.hours} tak.`,
    fees: `Charges project aur deal ke hisaab se vary hote hain, isliye main team se likhit breakup bhejunga booking se pehle. Current figures ke liye ${SITE.phone} par call kariye.`,
    booking: `Main poora process handle kar lunga aapke liye — shortlisting, site visit, paperwork aur payment schedule. ${SITE.phone} par call kariye ya ${SITE.email} par email kariye, shuru karte hain.`,
    documents: `Main aapke chune hue project ka exact document checklist bhejunga. Bas ${SITE.phone} par call kariye aur main aapko bhej dunga.`,
    loan: `Main aapko home-loan options samjha sakta hoon. ${SITE.phone} par call kariye aur main step by step samjhaunga.`,
    options: "Yeh kuch featured projects hain jo main check karne recommend karunga.",
    bookingAsk: "Site visit book karne ke liye mujhe ek message mein ye details chahiye: aapka pura naam, mobile number, preferred date (YYYY-MM-DD), time slot (jaise 10:00–12:00), aur kaunsa project visit karna hai. Missing: {missing}.",
    bookingSuccess: (d: { projectName: string; date: string; time: string; phone: string }) =>
      `All set! ${d.projectName} ke liye aapki site visit book hai ${d.date} ko ${d.time} pe. Hamari team jaldi hi ${d.phone} par call karke confirm karegi.`,
    bookingMissing: (d: { missing: string }) =>
      `Mujhe abhi ye chahiye: ${d.missing}. Name, mobile number, date (YYYY-MM-DD), time, aur project naam ek message mein bhejiye pls.`,
    bookingInvalidPhone: "Ye valid mobile number nahi lag raha. Kripya 10-digit Indian number bhejiye.",
    askBudget: "Aapka budget range kya hai?",
    askBhk: "Kiske BHK ke soch rahe hain?",
    askSiteVisit: "Main aapke liye site visit schedule karwaun?",
    qualificationIntro: "Shortlist karne se pehle, thoda aur samajhta hoon aapki needs:",
    recommendationNote: "Meri honest raye:",
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
      "नमस्ते! मैं आपका व्यक्तिगत प्रॉपर्टी कंसल्टेंट हूँ। मैं आपकी मदद करूँगा perfect home, office या retail space ढूंढने में — बस बताइए आपको क्या चाहिए, बाकी मैं देख लूँगा।",
    acknowledgment: "समझ गया!",
    results: (n: number) =>
      n === 1
        ? "यहाँ आपकी ज़रूरत के हिसाब से मेरा शीर्ष सुझाव है।"
        : `यहाँ मेरे शीर्ष ${n} सुझाव हैं जो आपकी ज़रूरत से मेल खाते हैं।`,
    noExact: "सटीक मैच नहीं मिला, लेकिन मैं जिन विकल्पों की सिफारिश करूँगा, वे ये हैं।",
    noResults:
      "हम्म, इस संयोजन के लिए अभी कुछ नहीं मिला। क्या आप अलग बजट या स्थान आज़माना चाहेंगे?",
    cheapestFirst: "सबसे किफायती विकल्प पहले।",
    newestFirst: "नवीनतम परियोजनाएँ पहले।",
    expensiveFirst: "प्रीमियम गुणवत्तापूर्ण संपत्तियाँ पहले।",
    soonestFirst: "सबसे जल्द कब्ज़ा उपलब्ध पहले।",
    compare: "यहाँ आपकी निर्णय लेने में मदद के लिए तुलनात्मक विवरण है।",
    compareNeedTwo: "दो या तीन परियोजनाएँ चुनें, मैं आपको अंतर समझाऊंगा।",
    siteVisit: `मैं आपके लिए साइट विज़िट बुक कर सकता हूँ — बस ${SITE.phone} पर कॉल करें या किसी भी प्रोजेक्ट पेज पर "साइट विज़िट बुक करें" पर क्लिक करें — हमारी टीम आपका स्लॉट कन्फर्म करेगी।`,
    visitOnly: `साइट विज़िट हमारी टीम तय करती है। ${SITE.phone} पर कॉल करें या व्हाट्सएप पर संदेश भेजें, हम आपका अपॉइंटमेंट तय कर देंगे।`,
    contact: `आप मुझसे सीधे ${SITE.phone} पर या ${SITE.email} पर संपर्क कर सकते हैं। हमारा कार्यालय ${SITE.address} पर है, खुला रहता है ${SITE.hours} तक।`,
    fees: `शुल्क परियोजना और सौदे के अनुसार भिन्न होते हैं, इसलिए मैं बुकिंग से पहले टीम से लिखित लागत विवरण भेजूंगा। वर्तमान आंकड़ों के लिए ${SITE.phone} पर कॉल करें।`,
    booking: `मैं पूरी प्रक्रिया आपकी मदद से पूरा करूँगा — शॉर्टलिस्टिंग, साइट विज़िट, दस्तावेज़ और भुगतान समय सारणी। ${SITE.phone} पर कॉल करें या ${SITE.email} पर ईमेल करें और हम शुरू करेंगे।`,
    documents: `मैं आपके चुने हुए प्रोजेक्ट की सटीक दस्तावेज़ सूची भेजूँगा। बस ${SITE.phone} पर कॉल करें और मैं आपको भेज दूँगा।`,
    loan: `मैं आपको होम-लोन विकल्पों के बारे में समझा सकता हूँ। ${SITE.phone} पर कॉल करें और मैं चरण-दर-चरण समझाऊंगा।`,
    options: "ये कुछ विशेष परियोजनाएँ हैं जिन्हें मैं देखना सुझाऊंगा।",
    bookingAsk: "अपनी साइट विज़िट बुक करने के लिए, कृपया एक संदेश में ये विवरण भेजें: आपका पूरा नाम, मोबाइल नंबर, पसंदीदा तारीख (YYYY-MM-DD), पसंदीदा समय स्लॉट (उदाहरण 10:00–12:00), और कौन सी परियोजना देखना चाहते हैं। गायब: {missing}.",
    bookingSuccess: (d: { projectName: string; date: string; time: string; phone: string }) =>
      `सब सेट है! ${d.projectName} के लिए आपकी साइट विज़िट ${d.date} को ${d.time} पर बुक कर दी गई है। हमारी टीम जल्द ही ${d.phone} पर कॉल करके पुष्टि करेगी।`,
    bookingMissing: (d: { missing: string }) =>
      `मुझे अभी भी चाहिए: ${d.missing}. कृपया नाम, मोबाइल नंबर, तारीख (YYYY-MM-DD), समय और परियोजना का नाम एक संदेश में भेजें।`,
    bookingInvalidPhone: "यह एक वैध मोबाइल नंबर नहीं दिखता है। कृपया 10-अंकों वाला भारतीय मोबाइल नंबर भेजें।",
    askBudget: "आपका बजट सीमा क्या है?",
    askBhk: "आप कितने बीएचके के बारे में सोच रहे हैं?",
    askSiteVisit: "क्या आप चाहते हैं मैं आपके लिए साइट विज़िट तय करूँ?",
    qualificationIntro: "शॉर्टलिस्ट करने से पहले, मुझे आपकी ज़रूरतें थोड़ा बेहतर समझने दें:",
    recommendationNote: "मेरा ईमानदार सुझाव:",
    suggestions: {
      compare: "प्रोजेक्ट्स की तुलना करें",
      visit: "साइट विज़िट बुक करें",
      ready: "तुरंत रहने योग्य विकल्प दिखाएँ",
      cheap: "₹75 लाख से कम विकल्प दिखाएँ",
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
    READY_TO_MOVE: "under construction",
    UPCOMING: "upcoming",
  },
  hinglish: {
    NEW_LAUNCH: "new launch",
    UNDER_CONSTRUCTION: "under construction",
    READY_TO_MOVE: "under construction",
    UPCOMING: "upcoming",
  },
  hi: {
    NEW_LAUNCH: "नया लॉन्च",
    UNDER_CONSTRUCTION: "निर्माणाधीन",
    READY_TO_MOVE: "निर्माणाधीन",
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

/** ---------- Qualification state machine (one question at a time) ---------- */

function parseBhkAnswer(message: string): string | undefined {
  const m = message.toLowerCase().trim();
  const direct = m.match(/\b([1-5])\s*bhk\b/) ?? m.match(/\b([1-5])\b/);
  if (direct) return direct[1] === "5" ? "5+" : direct[1];
  if (/(one|ek|1)\s*bhk/i.test(m)) return "1";
  if (/(two|do|2)\s*bhk/i.test(m)) return "2";
  if (/(three|teen|3)\s*bhk/i.test(m)) return "3";
  if (/(four|char|4)\s*bhk/i.test(m)) return "4";
  if (/(five|paanch|5\+?)\s*bhk/i.test(m)) return "5+";
  return undefined;
}

function parseBudgetAnswer(message: string): { minPrice?: number; maxPrice?: number } {
  const m = message.toLowerCase().replace(/,/g, "");

  function decide(minOrMax: "min" | "max", val: number) {
    const isMax = /under|se kam|ke andar|tak|below|less than/i.test(m);
    const isMin = /above|se zyada|se upar|minimum|starting|more than/i.test(m);
    if (isMax) return { maxPrice: val };
    if (isMin) return { minPrice: val };
    return { minPrice: val, maxPrice: val };
  }

  // Digit-based: "40 lakh", "2 crore", "1.5 crore"
  const croreMatch = m.match(/(\d+(?:\.\d+)?)\s*(crore|cr|\u0915\u0930\u094b\u092e)/);
  const lakhMatch = m.match(/(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|laakh|laakhs|\u0932\u093e\u0926\u094d\u0930\u0947)/);
  if (croreMatch) return decide("max", Math.round(Number(croreMatch[1]) * 10_000_000));
  if (lakhMatch) return decide("max", Math.round(Number(lakhMatch[1]) * 100_000));

  // Spoken word-based: "chalis laakh", "do crore", "पचहत्तर लाख"
  const spokenLakh = m.match(/([a-z\u0900-\u097f]+)\s*(lakh|lakhs|lac|lacs|laakh|laakhs|\u0932\u093e\u0926\u094d\u0930\u0947)/i);
  const spokenCrore = m.match(/([a-z\u0900-\u097f]+)\s*(crore|cr|\u0915\u0930\u094b\u092e)/i);
  if (spokenLakh) {
    const v = parseSpokenNumberPhrase(spokenLakh[1]);
    if (v) return decide("max", v * 100_000);
  }
  if (spokenCrore) {
    const v = parseSpokenNumberPhrase(spokenCrore[1]);
    if (v) return decide("max", v * 10_000_000);
  }

  // Plain digit number: "4000000"
  const numberMatch = m.match(/\b(\d{5,})\b/);
  if (numberMatch) {
    const val = Number(numberMatch[1]);
    if (val >= 100_000) return decide("max", val);
  }

  return {};
}

function parseSiteVisitAnswer(message: string): boolean | undefined {
  const m = message.toLowerCase().trim();
  if (/^(yes|y|haan|han|ha|sure|ok|okay|theek hai|thik hai|book|book kar|site visit|karna|karna hai|confirm)/.test(m)) {
    return true;
  }
  if (/^(no|n|nahi|na|nahin|mat|don.t|dont|nahi karna|mat karna|cancel)/.test(m)) {
    return false;
  }
  return undefined;
}

function qualificationQuestion(step: QualificationStep, language: ChatLanguage): string {
  const copy = LANG_COPY[language];

  // Add conversational acknowledgment before each question
  const ack = language === "en" ? copy.acknowledgment + ". " : language === "hi" ? copy.acknowledgment + ". " : copy.acknowledgment + ". ";

  if (step === "awaiting_bhk") {
    return `${ack}${copy.askBhk}`;
  }
  if (step === "awaiting_budget") {
    return `${ack}${copy.askBudget}`;
  }
  if (step === "awaiting_site_visit") {
    return `${ack}${copy.askSiteVisit}`;
  }
  return "";
}

function buildQualificationIntent(collected: QualificationCollected): Partial<SearchIntent> {
  const intent: Partial<SearchIntent> = {};
  if (collected.location) intent.location = collected.location;
  if (collected.bhk) intent.bhk = collected.bhk;
  if (collected.minPrice != null) intent.minPrice = collected.minPrice;
  if (collected.maxPrice != null) intent.maxPrice = collected.maxPrice;
  if (collected.siteVisit != null) intent.siteVisit = collected.siteVisit;
  return intent;
}

/** ---------- End qualification state machine ---------- */

export async function getAssistantResponse(input: {
  message: string;
  history?: HistoryMessage[];
  contextProjectIds?: string[];
  qualificationState?: QualificationState;
}): Promise<AssistantResponse> {
  const message = input.message.slice(0, 600);
  const history = (input.history ?? []).slice(-8);
  const language = detectLanguage(message);

  const previousUserIntents = history.filter((m) => m.role === "user").map((m) => parseIntent(m.content));
  const providerResult = await extractWithProvider(message);
  const intent = mergeIntents(...previousUserIntents, providerResult.intent);

  const inputQualState = input.qualificationState ?? { step: "idle" as QualificationStep, collected: {} };
  const copy = LANG_COPY[language];

  // ---------- Qualification: one question at a time ----------
  if (inputQualState.step !== "idle") {
    const collected = { ...inputQualState.collected };

    // Parse the user's answer based on current step
    if (inputQualState.step === "awaiting_bhk") {
      const bhk = parseBhkAnswer(message);
      if (!bhk) {
        return {
          reply: copy.askBhk,
          speech: copy.askBhk,
          language,
          intent: publicIntent(intent),
          projects: [],
          qualificationState: { step: "awaiting_bhk", collected },
          suggestions: [],
          meta: { total: 0, relaxed: false, provider: providerResult.provider },
        };
      }
      collected.bhk = bhk;
      inputQualState.step = "awaiting_budget";
      inputQualState.collected = collected;
    } else if (inputQualState.step === "awaiting_budget") {
      const budget = parseBudgetAnswer(message);
      if (budget.minPrice == null && budget.maxPrice == null) {
        return {
          reply: copy.askBudget,
          speech: copy.askBudget,
          language,
          intent: publicIntent(intent),
          projects: [],
          qualificationState: { step: "awaiting_budget", collected },
          suggestions: [],
          meta: { total: 0, relaxed: false, provider: providerResult.provider },
        };
      }
      collected.minPrice = budget.minPrice ?? collected.minPrice;
      collected.maxPrice = budget.maxPrice ?? collected.maxPrice;
      inputQualState.step = "awaiting_site_visit";
      inputQualState.collected = collected;
    } else if (inputQualState.step === "awaiting_site_visit") {
      const siteVisit = parseSiteVisitAnswer(message);
      if (siteVisit == null) {
        return {
          reply: copy.askSiteVisit,
          speech: copy.askSiteVisit,
          language,
          intent: publicIntent(intent),
          projects: [],
          qualificationState: { step: "awaiting_site_visit", collected },
          suggestions: [],
          meta: { total: 0, relaxed: false, provider: providerResult.provider },
        };
      }
      collected.siteVisit = siteVisit;
      inputQualState.step = "idle";
      inputQualState.collected = collected;
    }

    // If qualification is complete, merge collected data into intent and search
    if (inputQualState.step === "idle") {
      const qualifiedIntent = mergeIntents(intent, buildQualificationIntent(collected));
      // Re-run the normal flow with the qualified intent by setting variables
      Object.assign(intent, qualifiedIntent);
    } else {
      // Still waiting for more answers — ask the next question
      const nextQuestion = qualificationQuestion(inputQualState.step, language);
      const where = collected.location ? locationLabel(collected.location) : "";
      let reply: string;
      if (language === "en") {
        reply = where ? `In ${where}, ${nextQuestion}` : nextQuestion;
      } else if (language === "hi") {
        reply = where ? `${where} mein, ${nextQuestion}` : nextQuestion;
      } else {
        reply = where ? `${where} mein, ${nextQuestion}` : nextQuestion;
      }
      return {
        reply,
        speech: reply,
        language,
        intent: publicIntent(intent),
        projects: [],
        qualificationState: inputQualState,
        suggestions: [],
        meta: { total: 0, relaxed: false, provider: providerResult.provider },
      };
    }
  } else if (
    intent.location &&
    (!intent.bhk || (!intent.minPrice && !intent.maxPrice))
  ) {
    // Start qualification: location is known but bhk/budget missing
    const collected: QualificationCollected = { location: intent.location };
    inputQualState.step = "awaiting_bhk";
    inputQualState.collected = collected;

    const where = locationLabel(intent.location);
    let reply: string;
    if (language === "en") {
      reply = `I can help you find a property in ${where}. ${copy.acknowledgment} ${copy.askBhk}`;
    } else if (language === "hi") {
      reply = `मैं आपकी ${where} में प्रॉपर्टी खोजने में मदद कर सकता हूँ। ${copy.acknowledgment} ${copy.askBhk}`;
    } else {
      reply = `Main aapko ${where} mein property dhoondhne mein madad kar sakta hoon. ${copy.acknowledgment} ${copy.askBhk}`;
    }
    return {
      reply,
      speech: reply,
      language,
      intent: publicIntent(intent),
      projects: [],
      qualificationState: inputQualState,
      suggestions: [],
      meta: { total: 0, relaxed: false, provider: providerResult.provider },
    };
  }

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
    qualificationState: inputQualState.step === "idle" ? inputQualState : undefined,
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
