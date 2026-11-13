import Link from "next/link";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { getAllAmenities, getAllDevelopers, getAllLocations, getSavedProjectIds, searchProjects } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { parseProjectParams, pageNumber } from "@/lib/search-params";
import { ProjectCard } from "@/components/projects/project-card";
import { FilterPanel } from "@/components/projects/filter-panel";
import { SortSelect } from "@/components/projects/sort-select";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPriceShort } from "@/lib/utils";
import { BUDGET_OPTIONS, POSSESSION_OPTIONS, SORT_OPTIONS, STATUS_LABELS } from "@/lib/constants";

type Params = Record<string, string | string[] | undefined>;

export async function ProjectsListingPage({
  params,
  basePath,
  lockedType,
  lockedLocation,
  lockedCategory,
  hideHeader = false,
  eyebrow,
  title,
  description,
}: {
  params: Params;
  basePath: string;
  lockedType?: "RESIDENTIAL" | "COMMERCIAL";
  lockedLocation?: string;
  lockedCategory?: string;
  hideHeader?: boolean;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const filters = parseProjectParams(params, lockedType);
  if (lockedLocation) filters.location = lockedLocation;
  if (lockedCategory) filters.category = lockedCategory;
  const page = pageNumber(params);

  const [result, locations, developers, amenities, user] = await Promise.all([
    searchProjects(filters, page),
    getAllLocations(),
    getAllDevelopers(),
    getAllAmenities(),
    getCurrentUser(),
  ]);
  const savedIds = await getSavedProjectIds(user?.id);
  const savedSet = new Set(savedIds);

  const chips: { label: string; key: string; value?: string }[] = [];
  if (filters.q) chips.push({ label: `“${filters.q}”`, key: "q" });
  if (filters.location) {
    const name = locations.find((l) => l.slug === filters.location)?.name ?? filters.location;
    chips.push({ label: name, key: "location" });
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    const budget = BUDGET_OPTIONS.find(
      (b) => Number(b.min) === (filters.minPrice ?? 0) && (b.max ? Number(b.max) === filters.maxPrice : filters.maxPrice == null),
    );
    chips.push({
      label: budget?.label ?? `${formatPriceShort(filters.minPrice ?? 0)} – ${formatPriceShort(filters.maxPrice)}`,
      key: "budget",
    });
  }
  if (filters.bhk) chips.push({ label: `${filters.bhk} BHK`, key: "bhk" });
  if (!lockedType && filters.propertyType) {
    chips.push({
      label: filters.propertyType === "RESIDENTIAL" ? "Residential" : "Commercial",
      key: "propertyType",
    });
  }
  if (!lockedCategory && filters.category) chips.push({ label: filters.category, key: "category" });
  if (filters.status) chips.push({ label: STATUS_LABELS[filters.status] ?? filters.status, key: "status" });
  if (filters.possession) {
    const p = POSSESSION_OPTIONS.find((option) => option.value === filters.possession);
    chips.push({ label: p?.label ?? `Possession ${filters.possession}`, key: "possession" });
  }
  if (filters.developer) {
    const name = developers.find((d) => d.slug === filters.developer || d.id === filters.developer)?.name;
    chips.push({ label: name ?? filters.developer, key: "developer" });
  }
  for (const amenity of filters.amenities ?? []) chips.push({ label: amenity, key: "amenities", value: amenity });

  const hrefWithout = (key: string, removeValue?: string) => {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k === "page" || k === key) {
        if (k === key && removeValue && Array.isArray(v)) {
          v.filter((item) => item !== removeValue).forEach((item) => query.append(k, item));
        }
        continue;
      }
      if (v == null) continue;
      if (Array.isArray(v)) v.forEach((item) => query.append(k, item));
      else query.set(k, v);
    }
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const hasFilters = chips.length > 0;
  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === (filters.sort || "featured"))?.label;

  return (
    <>
      {!hideHeader && (
        <section className="relative overflow-hidden border-b border-line bg-surface">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(124,92,232,0.18),transparent_55%)]" aria-hidden />
          <div className="shell relative py-12 md:py-16">
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-[0.7rem] text-ink-muted">
              <Link href="/" className="transition hover:text-brass">Home</Link>
              <ChevronRight className="size-3 opacity-60" />
              <span className="text-ink">{title}</span>
            </nav>
            <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">{eyebrow}</p>
                <h1 className="display-lg mt-5 balance">{title}</h1>
                <p className="lede mt-4 max-w-xl pretty">{description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brass">{result.total} sample {result.total === 1 ? "project" : "projects"}</Badge>
                <Badge>Sample inventory</Badge>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="shell py-10 md:py-14">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <p className="text-[0.8rem] text-ink-muted">
            Showing <span className="font-semibold text-ink">{result.projects.length}</span> of{" "}
            <span className="font-semibold text-ink">{result.total}</span> projects
            {activeSortLabel ? ` · ${activeSortLabel}` : ""}
          </p>
          <SortSelect basePath={basePath} />
        </div>

        {hasFilters && (
          <div className="mb-7 flex flex-wrap items-center gap-2">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink-muted">Filters</span>
            {chips.map((chip) => (
              <Link
                key={`${chip.key}-${chip.value ?? ""}`}
                href={hrefWithout(chip.key, chip.value)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.72rem] font-medium text-ink-soft shadow-card transition hover:border-rust/40 hover:text-rust"
              >
                {chip.label}
                <span aria-hidden className="text-ink-muted group-hover:text-rust">×</span>
              </Link>
            ))}
            <Link href={basePath} className="ml-1 text-[0.72rem] font-semibold text-forest underline decoration-brass/50 underline-offset-4 transition hover:text-brass">
              Clear all
            </Link>
          </div>
        )}

        <details className="mb-6 overflow-hidden rounded-[14px] border border-line bg-surface shadow-card lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            Filters & sorting
            <span className="rounded-full border border-line px-2.5 py-1 text-[0.64rem] font-medium text-ink-muted">Tap to open</span>
          </summary>
          <div className="border-t border-line p-4">
            <FilterPanel
              basePath={basePath}
              locations={locations}
              developers={developers}
              amenities={amenities}
              current={params}
              lockedType={lockedType}
              lockedLocation={lockedLocation}
              lockedCategory={lockedCategory}
              idPrefix="filter-mobile"
            />
          </div>
        </details>

        <div className="grid gap-8 lg:grid-cols-[270px_minmax(0,1fr)] xl:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <div className="rounded-[16px] border border-line bg-surface p-5 shadow-card">
                <FilterPanel
                  basePath={basePath}
                  locations={locations}
                  developers={developers}
                  amenities={amenities}
                  current={params}
                  lockedType={lockedType}
                  lockedLocation={lockedLocation}
                  lockedCategory={lockedCategory}
                  idPrefix="filter-desktop"
                />
              </div>
              <div className="relative mt-4 overflow-hidden rounded-[16px] border border-brass/30 bg-brass-pale/70 p-5">
                <span className="absolute -right-6 -top-6 size-20 rounded-full border border-brass/20" aria-hidden />
                <p className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-brass-soft">
                  <Sparkles className="size-3.5" /> Not sure where to start?
                </p>
                <p className="mt-2.5 text-[0.8rem] leading-relaxed text-ink-soft">
                  Describe your brief in English, Hindi or Hinglish and let Innovations AI shortlist from the database.
                </p>
                <p className="mt-3.5 flex items-center gap-1 text-[0.75rem] font-semibold text-forest">
                  Open the assistant <ArrowRight className="size-3.5" />
                </p>
              </div>
            </div>
          </aside>

          <div>
            {result.projects.length === 0 ? (
              <EmptyState
                title="No projects match those filters"
                description="Try widening the budget, removing an amenity, or exploring another location. The inventory on this sample is intentionally limited."
                action={
                  <ButtonLink href={basePath} variant="primary" size="sm">
                    Reset filters
                  </ButtonLink>
                }
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {result.projects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      saved={savedSet.has(project.id)}
                      priority={index < 3}
                    />
                  ))}
                </div>
                <Pagination
                  page={result.page}
                  pageCount={result.pageCount}
                  basePath={basePath}
                  params={params}
                />
              </>
            )}

            <div className="relative mt-14 overflow-hidden rounded-[18px] border border-line bg-night p-6 text-paper shadow-lift sm:p-8">
              <div className="absolute -right-16 -top-16 size-52 rounded-full border border-paper/10" aria-hidden />
              <div className="absolute -bottom-24 -left-10 size-52 rounded-full border border-brass/15" aria-hidden />
              <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="eyebrow text-brass-soft">A human view</p>
                  <p className="mt-2 font-display text-[1.5rem] tracking-[-0.02em]">Want a second opinion?</p>
                  <p className="mt-1.5 text-sm text-paper/60">Share your brief with the Innovations team. No obligation, no spam.</p>
                </div>
                <ButtonLink href="/contact" variant="gold" size="sm" className="shrink-0">
                  Talk to us <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

