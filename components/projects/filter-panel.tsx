import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { BHK_OPTIONS, BUDGET_OPTIONS, POSSESSION_OPTIONS, PROJECT_STATUSES, SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FilterValue = string | string[] | undefined;

export function FilterPanel({
  basePath,
  locations,
  developers,
  amenities,
  current,
  lockedType,
  lockedLocation,
  lockedCategory,
  idPrefix = "filter",
  className,
}: {
  basePath: string;
  locations: { id: string; name: string; slug: string }[];
  developers: { id: string; name: string; slug: string }[];
  amenities: { id: string; name: string }[];
  current: Record<string, FilterValue>;
  lockedType?: string;
  lockedLocation?: string;
  lockedCategory?: string;
  /** Keeps input ids unique when the panel is rendered twice (mobile + desktop). */
  idPrefix?: string;
  className?: string;
}) {
  const value = (key: string) => {
    const v = current[key];
    return Array.isArray(v) ? v[0] ?? "" : v ?? "";
  };
  const selectedAmenities = Array.isArray(current.amenities)
    ? current.amenities
    : current.amenities
      ? [current.amenities]
      : [];
  const min = value("minPrice");
  const max = value("maxPrice");
  const budgetValue = min || max ? `${min || "0"}-${max}` : "";
  const activeCount =
    ["q", "location", "bhk", "status", "possession", "developer", "minPrice", "maxPrice"].filter((k) => value(k)).length +
    selectedAmenities.length;

  return (
    <div className={cn("", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg">
          <SlidersHorizontal className="size-4 text-brass" /> Refine
          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-forest text-[0.62rem] text-night">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <Link href={basePath} className="flex items-center gap-1 text-[0.72rem] font-medium text-ink-muted hover:text-rust">
            <X className="size-3" /> Clear all
          </Link>
        )}
      </div>

      <form action={basePath} method="get" className="space-y-5">
        {lockedType && <input type="hidden" name="propertyType" value={lockedType} />}
        {lockedLocation && <input type="hidden" name="location" value={lockedLocation} />}
        {lockedCategory && <input type="hidden" name="category" value={lockedCategory} />}

        <div>
          <label htmlFor={`${idPrefix}-q`} className="field-label">Search</label>
          <input
            id={`${idPrefix}-q`}
            name="q"
            defaultValue={value("q")}
            placeholder="Project, developer, sector…"
            className="field"
          />
        </div>

        <div>
          <label htmlFor={`${idPrefix}-location`} className="field-label">Location</label>
          {lockedLocation ? (
            <input className="field" value={locations.find((l) => l.slug === lockedLocation)?.name ?? lockedLocation} readOnly disabled />
          ) : (
            <select id={`${idPrefix}-location`} name="location" defaultValue={value("location")} className="field">
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.slug}>{location.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor={`${idPrefix}-budget`} className="field-label">Budget</label>
          <select id={`${idPrefix}-budget`} name="budget" defaultValue={budgetValue} className="field">
            <option value="">Any budget</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option.label} value={`${option.min}-${option.max}`}>{option.label}</option>
            ))}
          </select>
          <p className="mt-1 text-[0.65rem] text-ink-muted">Filters by project starting price.</p>
        </div>

        {!lockedType && (
          <div>
            <label htmlFor={`${idPrefix}-type`} className="field-label">Property type</label>
            <select id={`${idPrefix}-type`} name="propertyType" defaultValue={value("propertyType")} className="field">
              <option value="">All types</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor={`${idPrefix}-bhk`} className="field-label">Configuration</label>
          <select id={`${idPrefix}-bhk`} name="bhk" defaultValue={value("bhk")} className="field">
            <option value="">Any configuration</option>
            {BHK_OPTIONS.map((bhk) => (
              <option key={bhk} value={bhk}>{bhk} BHK</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-status`} className="field-label">Project status</label>
          <select id={`${idPrefix}-status`} name="status" defaultValue={value("status")} className="field">
            <option value="">Any status</option>
            {PROJECT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-possession`} className="field-label">Possession</label>
          <select id={`${idPrefix}-possession`} name="possession" defaultValue={value("possession")} className="field">
            <option value="">Any timeline</option>
            {POSSESSION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-developer`} className="field-label">Developer</label>
          <select id={`${idPrefix}-developer`} name="developer" defaultValue={value("developer")} className="field">
            <option value="">All developers</option>
            {developers.map((developer) => (
              <option key={developer.id} value={developer.slug}>{developer.name}</option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="field-label">Amenities</legend>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {amenities.map((amenity) => (
              <label key={amenity.id} className="flex cursor-pointer items-center gap-2.5 text-[0.8rem] text-ink-soft">
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity.name}
                  defaultChecked={selectedAmenities.includes(amenity.name)}
                  className="size-3.5 rounded border-line accent-forest"
                />
                {amenity.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={`${idPrefix}-sort`} className="field-label">Sort by</label>
          <select id={`${idPrefix}-sort`} name="sort" defaultValue={value("sort") || "featured"} className="field">
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-forest text-[0.8rem] font-semibold text-night shadow-[0_16px_30px_-22px_rgba(12,53,39,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-deep"
        >
          Apply filters
        </button>
      </form>
    </div>
  );
}
