import { mergeIntents, parseIntent, sanitiseExternalIntent, type SearchIntent } from "./intent";

export interface IntentProvider {
  id: string;
  /** Returns provider-extracted fields, or null to fall back to local rules. */
  extract(message: string): Promise<Partial<SearchIntent> | null>;
}

class RulesProvider implements IntentProvider {
  id = "rules";
  async extract() {
    return null;
  }
}

/**
 * OpenAI-compatible intent extractor. Works with OpenAI, Groq, Together,
 * OpenRouter, Ollama and similar services. It ONLY extracts search criteria;
 * all project facts are subsequently read from our own database.
 */
class OpenAiCompatibleProvider implements IntentProvider {
  id = "openai-compatible";
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
  }

  async extract(message: string): Promise<Partial<SearchIntent> | null> {
    const scrubbed = message.replace(/(?:\+?91[-\s]?)?[6-9]\d{9}/g, "[phone removed]");
    const system = `You extract real-estate search filters from a user message for a Noida/NCR property portal.
The message may be a speech transcript in English, Hindi (Devanagari) or Hinglish. Spoken numbers such as
"seventy five lakh", "pachattar lakh", "पचहत्तर लाख", "dedh crore" or "sava crore" must be converted to rupees.
Return ONLY a JSON object with any of these keys:
location (one of: noida, greater-noida, noida-extension, delhi-ncr),
minPrice/maxPrice (integer rupees, e.g. 70 lakh = 7000000, 1.25 crore = 12500000),
bhk (string 1-5 or "5+"), propertyType (RESIDENTIAL|COMMERCIAL),
category (Apartment|Villa|Plot|Studio|Penthouse|Resort|Serviced apartment|Office|Retail|SCO),
status (NEW_LAUNCH|UNDER_CONSTRUCTION|READY_TO_MOVE|UPCOMING),
possessionYear (integer), amenities (array of names from: Swimming Pool, Gymnasium, Clubhouse, Landscaped Gardens, Kids' Play Area, 24x7 Security, Power Backup, Covered Parking, Sports Court, Yoga Deck, Co-working Lounge, Retail Arcade, Concierge, EV Charging, Amphitheatre, Jogging Track, Spa, Rooftop Lounge),
sort (price-asc for "sasta"/"cheapest"/"low budget", newest for "latest"),
compare (boolean), siteVisit (boolean).
Examples:
"mujhe noida mein sasta 2 bhk chahiye" -> {"location":"noida","bhk":"2","sort":"price-asc"}
"पचहत्तर लाख के अंदर ग्रेटर नोएडा में फ्लैट" -> {"location":"greater-noida","maxPrice":7500000}
If no filters are present return {}. Never invent projects, prices or availability.`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: scrubbed },
          ],
        }),
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;
      const parsed = JSON.parse(content);
      return sanitiseExternalIntent(parsed);
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function getIntentProvider(): IntentProvider {
  const mode = (process.env.AI_PROVIDER || "auto").toLowerCase();
  const key = process.env.AI_API_KEY?.trim();
  if (mode !== "rules" && key) {
    return new OpenAiCompatibleProvider(
      key,
      process.env.AI_BASE_URL || "https://api.openai.com/v1",
      process.env.AI_MODEL || "gpt-4o-mini",
    );
  }
  return new RulesProvider();
}

export async function extractWithProvider(message: string): Promise<{ intent: SearchIntent; provider: string }> {
  const local = parseIntent(message);
  const provider = getIntentProvider();
  if (provider.id === "rules") return { intent: local, provider: "rules" };
  const external = await provider.extract(message);
  if (!external) return { intent: local, provider: "rules-fallback" };
  const cleaned = sanitiseExternalIntent(external);
  return {
    intent: mergeIntents(local, cleaned),
    provider: provider.id,
  };
}
