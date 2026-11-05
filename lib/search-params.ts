import type { ProjectSearchFilters } from "@/lib/queries";

type Params = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function numeric(value: string | string[] | undefined) {
  const raw = one(value);
  if (!raw) return undefined;
  const num = Number(raw);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
}

export function parseProjectParams(params: Params, lockedType?: string): ProjectSearchFilters {
  const budget = one(params.budget);
  let minPrice = numeric(params.minPrice);
  let maxPrice = numeric(params.maxPrice);
  if (budget) {
    const [min, max] = budget.split("-");
    minPrice = numeric(min);
    maxPrice = numeric(max);
  }

  return {
    q: one(params.q)?.slice(0, 100),
    location: one(params.location),
    propertyType: lockedType || one(params.propertyType),
    category: one(params.category),
    bhk: one(params.bhk),
    minPrice,
    maxPrice,
    status: one(params.status),
    possession: one(params.possession),
    amenities: Array.isArray(params.amenities) ? params.amenities : params.amenities ? [params.amenities] : [],
    developer: one(params.developer),
    sort: one(params.sort),
  };
}

export function pageNumber(params: Params) {
  const value = Number(one(params.page) || 1);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}
