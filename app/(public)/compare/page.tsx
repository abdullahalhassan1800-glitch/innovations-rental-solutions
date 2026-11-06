import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, Scale, ShieldAlert, X } from "lucide-react";
import { db } from "@/lib/db";
import { ComparePicker } from "@/components/projects/compare-picker";
import { StatusBadge, DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SITE, STATUS_LABELS } from "@/lib/constants";
import {
  formatINR,
  formatMonthYear,
  formatPriceShort,
  parseBhk,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compare projects",
  description:
    "Compare Innovations demonstration projects side by side on price, configuration, location, status, possession and amenities.",
  alternates: { canonical: "/compare" },
};

type PageProps = { searchParams: Promise<{ ids?: string | string[] }> };

export default async function ComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.ids) ? params.ids.join(",") : params.ids ?? "";
  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 3);

  const [options, selectedRows] = await Promise.all([
    db.project.findMany({
      where: { published: true, archived: false },
      select: {
        id: true,
        name: true,
        slug: true,
        startingPrice: true,
        location: { select: { name: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    ids.length
      ? db.project.findMany({
          where: { id: { in: ids }, published: true, archived: false },
          include: {
            developer: { select: { name: true } },
            location: { select: { name: true, city: true } },
            images: {
              orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
              take: 1,
            },
            amenities: { include: { amenity: { select: { name: true } } } },
            floorPlans: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        })
      : Promise.resolve([]),
  ]);

  const projects = ids
    .map((id) => selectedRows.find((project) => project.id === id))
    .filter((project): project is NonNullable<typeof project> => Boolean(project));

  const pickerOptions = options.map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    location: project.location.name,
    startingPrice: formatPriceShort(project.startingPrice),
  }));

  const remainingHref = (id: string) => {
    const rest = ids.filter((item) => item !== id);
    return rest.length ? `/compare?ids=${rest.join(",")}` : "/compare";
  };

  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-[0.72rem] text-ink-muted">
            <Link href="/" className="hover:text-forest">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-ink">Compare</span>
          </nav>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Side by side</p>
              <h1 className="display-lg mt-4 balance">Compare with context.</h1>
              <p className="lede mt-4 max-w-xl pretty">
                Up to three demonstration projects, compared on the fields that actually change a
                decision. Every value comes from the local database.
              </p>
            </div>
            <div className="rounded-[14px] border border-brass/30 bg-brass-pale/60 p-4">
              <p className="flex items-center gap-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-brass-soft">
                <Scale className="size-3.5" /> Sample comparison
              </p>
              <p className="mt-1.5 max-w-[15rem] text-[0.74rem] leading-relaxed text-ink-soft">
                Sample data only. Always verify prices, approvals and possession independently.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-8 md:py-12">
        <ComparePicker projects={pickerOptions} initialIds={ids} compact={projects.length > 0} />

        {projects.length === 0 ? (
          <div className="mt-8 rounded-[14px] border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
            <Scale className="mx-auto size-6 text-brass" />
            <h2 className="mt-4 font-display text-2xl">Nothing selected yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              Select at least two projects above and choose “Compare”. You can also start from a project
              page or ask the assistant to compare projects for you.
            </p>
            <ButtonLink href="/projects" variant="outline" size="sm" className="mt-5">
              Browse projects <ArrowRight className="size-3.5" />
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.74rem] text-ink-muted">
                Comparing {projects.length} {projects.length === 1 ? "project" : "projects"} from the sample database.
              </p>
              <Link href="/compare" className="text-[0.72rem] font-semibold text-forest hover:text-brass">
                Start over
              </Link>
            </div>

            <div className="overflow-x-auto rounded-[14px] border border-line bg-surface">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <caption className="sr-only">Comparison of selected Innovations demonstration projects</caption>
                <thead>
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 w-40 border-b border-r border-line bg-cream/95 p-4 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Compare
                    </th>
                    {projects.map((project) => (
                      <th key={project.id} scope="col" className="min-w-[220px] border-b border-line p-4 align-top">
                        <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded border border-line bg-sand">
                          {project.images[0] ? (
                            <Image
                              src={project.images[0].url}
                              alt={project.images[0].alt || `${project.name} demonstration image`}
                              fill
                              sizes="(max-width: 900px) 50vw, 260px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-ink-muted">No image</div>
                          )}
                        </div>
                        <Link href={`/projects/${project.slug}`} className="font-display text-lg leading-tight hover:text-forest">
                          {project.name}
                        </Link>
                        <p className="mt-1 text-[0.7rem] text-ink-muted">{project.developer.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <StatusBadge status={project.status} />
                          {project.isDemo && <DemoBadge />}
                        </div>
                        <Link
                          href={remainingHref(project.id)}
                          className="mt-3 inline-flex items-center gap-1 text-[0.68rem] font-medium text-ink-muted hover:text-rust"
                        >
                          <X className="size-3" /> Remove
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <CompareRow label="Starting price" values={projects.map((p) => formatINR(p.startingPrice))} />
                  <CompareRow
                    label="Maximum price"
                    values={projects.map((p) => (p.maxPrice ? formatINR(p.maxPrice) : "—"))}
                  />
                  <CompareRow label="Location" values={projects.map((p) => p.location.name)} />
                  <CompareRow label="Address" values={projects.map((p) => p.address)} />
                  <CompareRow
                    label="Type"
                    values={projects.map((p) => (p.propertyType === "RESIDENTIAL" ? "Residential" : "Commercial"))}
                  />
                  <CompareRow label="Category" values={projects.map((p) => p.category)} />
                  <CompareRow
                    label="Configuration"
                    values={projects.map((p) => {
                      const configs = parseBhk(p.bhkConfigs);
                      return configs.length
                        ? p.propertyType === "COMMERCIAL"
                          ? configs.join(" · ")
                          : `${configs.join(" · ")} BHK`
                        : "—";
                    })}
                  />
                  <CompareRow label="Status" values={projects.map((p) => STATUS_LABELS[p.status] ?? p.status)} />
                  <CompareRow label="Possession" values={projects.map((p) => formatMonthYear(p.possessionDate))} />
                  <CompareRow
                    label="RERA"
                    values={projects.map((p) =>
                      p.reraVerified && p.reraNumber ? p.reraNumber : "Not verified — sample",
                    )}
                  />
                  <CompareRow
                    label="Starting size"
                    values={projects.map((p) =>
                      p.floorPlans[0]?.areaSqft ? `${p.floorPlans[0].areaSqft.toLocaleString("en-IN")} sq ft` : "On request",
                    )}
                  />
                  <CompareRow
                    label="Amenities"
                    values={projects.map((p) =>
                      p.amenities.length
                        ? p.amenities.slice(0, 6).map((item) => item.amenity.name).join(", ") +
                          (p.amenities.length > 6 ? ` +${p.amenities.length - 6} more` : "")
                        : "—",
                    )}
                  />
                  <tr>
                    <th scope="row" className="sticky left-0 z-10 w-40 border-b border-r border-line bg-cream/95 p-4 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Next step
                    </th>
                    {projects.map((project) => (
                      <td key={project.id} className="border-b border-line p-4 align-top">
                        <div className="grid gap-2">
                          <ButtonLink href={`/projects/${project.slug}`} size="sm">
                            View project <ArrowRight className="size-3.5" />
                          </ButtonLink>
                          <ButtonLink href={`/projects/${project.slug}#site-visit`} size="sm" variant="outline">
                            Request a visit
                          </ButtonLink>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-[14px] border border-amber-400/30 bg-amber-400/10 p-4 text-[0.75rem] leading-relaxed text-amber-200">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              <p>
                This comparison is generated from demonstration records. It is not a recommendation,
                valuation or offer. {SITE.demoDisclaimer}
              </p>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-4 rounded-[14px] border border-line bg-surface p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="flex items-center gap-2 font-display text-xl">
              <CheckCircle2 className="size-4 text-forest" /> Want a human view?
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Share what matters to you and the Innovations team will respond with a considered shortlist.
            </p>
          </div>
          <ButtonLink href="/contact">Talk to us</ButtonLink>
        </div>
      </section>
    </>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <th scope="row" className="sticky left-0 z-10 border-b border-r border-line bg-cream/95 p-4 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </th>
      {values.map((value, index) => (
        <td key={`${label}-${index}`} className="border-b border-line p-4 text-[0.82rem] leading-relaxed text-ink-soft">
          {value}
        </td>
      ))}
    </tr>
  );
}

