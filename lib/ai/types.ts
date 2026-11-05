export type ChatCard = {
  id: string;
  name: string;
  slug: string;
  developer: string;
  location: string;
  priceLabel: string;
  startingPrice: number;
  configLabel: string;
  statusLabel: string;
  propertyType: string;
  possession: string;
  image: string | null;
  amenitiesCount: number;
  isDemo: boolean;
};

export type ComparisonTable = {
  projects: { id: string; name: string; slug: string }[];
  rows: { label: string; values: string[] }[];
};

export type AssistantResponse = {
  reply: string;
  /** Optional shorter script for browser speech synthesis. */
  speech?: string;
  language: "en" | "hi" | "hinglish";
  intent: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bhk?: string;
    propertyType?: string;
    category?: string;
    status?: string;
    sort?: string;
    amenities: string[];
  };
  projects: ChatCard[];
  comparison?: ComparisonTable;
  suggestions: string[];
  meta: {
    total: number;
    relaxed: boolean;
    provider: string;
  };
};
