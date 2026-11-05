import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { getAllLocations } from "@/lib/queries";
import { ProjectsListingPage } from "@/components/projects/projects-listing-page";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatPriceShort, parseJsonArray } from "@/lib/utils";
import { SITE } from "@/lib/constants";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = await db.location.findUnique({ where: { slug } });
  if (!location) return { title: "Location not found" };
  return {
    title: `Property in ${location.name}`,
    description: `Explore demo residential and commercial projects in ${location.name}. Compare prices, configurations and possession timelines. Sample data only.`,
    alternates: { canonical: `/location/${location.slug}` },
    openGraph: {
      title: `Property in ${location.name} | Innovations`,
      description: location.description ?? `Explore demonstration projects in ${location.name}.`,
      url: `/location/${location.slug}`,
      images: [{ url: location.imageUrl ?? "/images/city-1.jpg", alt: `${location.name} demonstration view` }],
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const [location, allLocations] = await Promise.all([
    db.location.findUnique({ where: { slug } }),
    getAllLocations(),
  ]);
  if (!location) notFound();

  const [aggregate, residentialCount, commercialCount] = await Promise.all([
    db.project.aggregate({
      where: { locationId: location.id, published: true, archived: false },
      _count: true,
      _min: { startingPrice: true },
    }),
    db.project.count({ where: { locationId: location.id, published: true, archived: false, propertyType: "RESIDENTIAL" } }),
    db.project.count({ where: { locationId: location.id, published: true, archived: false, propertyType: "COMMERCIAL" } }),
  ]);
  const highlights = parseJsonArray<string>(location.highlights);

  return (
    <>
      <section className="relative overflow-hidden bg-night text-paper">
        <Image
          src={location.imageUrl ?? "/images/city-1.jpg"}
          alt={`${location.name} demonstration location`}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/30" />
        <div className="shell relative py-12 md:py-20">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[0.7rem] text-paper/55">
            <Link href="/" className="hover:text-paper">Home</Link>
            <ChevronRight className="size-3" />
            <Link href="/projects" className="hover:text-paper">Locations</Link>
            <ChevronRight className="size-3" />
            <span className="text-paper">{location.name}</span>
          </nav>

          <div className="mt-7 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow text-brass-soft">Location guide</p>
              <h1 className="display-lg mt-4 text-paper">{location.name}</h1>
              <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-paper/65 pretty">
                {location.description ??
                  `Explore demonstration residential and commercial addresses in ${location.name}.`}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge className="border-paper/20 bg-surface/10 text-paper">{aggregate._count} demo projects</Badge>
                <Badge className="border-paper/20 bg-surface/10 text-paper">{residentialCount} residential</Badge>
                <Badge className="border-paper/20 bg-surface/10 text-paper">{commercialCount} commercial</Badge>
                {aggregate._min.startingPrice && (
                  <Badge className="border-brass/40 bg-brass/15 text-brass-soft">
                    From {formatPriceShort(aggregate._min.startingPrice)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-[14px] border border-paper/15 bg-surface/[0.06] p-5 backdrop-blur-sm">
              <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brass-soft">
                <MapPin className="size-3.5" /> {location.city}, {location.state}
              </p>
              {highlights.length > 0 && (
                <ul className="mt-4 space-y-2.5">
                  {highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 text-[0.8rem] text-paper/70">
                      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brass-soft" /> {highlight}
                    </li>
                  ))}
                </ul>
              )}
              <ButtonLink href="/contact" variant="gold" size="sm" className="mt-5 w-full">
                Ask about {location.name} <ArrowRight className="size-3.5" />
              </ButtonLink>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-2 border-t border-paper/10 pt-5">
            {allLocations.map((item) => (
              <Link
                key={item.id}
                href={`/location/${item.slug}`}
                className={
                  item.slug === location.slug
                    ? "rounded-full border border-brass/60 bg-brass/15 px-3.5 py-1.5 text-[0.72rem] font-semibold text-brass-soft"
                    : "rounded-full border border-paper/15 px-3.5 py-1.5 text-[0.72rem] text-paper/60 transition hover:border-paper/40 hover:text-paper"
                }
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="border-b border-line bg-surface/60">
        <div className="shell flex flex-wrap items-center justify-between gap-2 py-3 text-[0.68rem] text-ink-muted">
          <p>{SITE.demoDisclaimer}</p>
          <Link href="/projects" className="font-semibold text-forest hover:text-brass">View all locations →</Link>
        </div>
      </div>

      <ProjectsListingPage
        params={{}}
        basePath={`/location/${location.slug}`}
        lockedLocation={location.slug}
        hideHeader
        eyebrow={`${location.name} collection`}
        title={`Projects in ${location.name}.`}
        description={`Demonstration inventory in ${location.name}, filterable by budget, configuration, status and amenities.`}
      />

      <section className="border-t border-line bg-sand/35">
        <div className="shell py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow-plain">Explore another corridor</p>
              <p className="mt-2 font-display text-xl">Noida, Greater Noida, Noida Extension & Delhi NCR.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allLocations.filter((item) => item.slug !== location.slug).map((item) => (
                <Link key={item.id} href={`/location/${item.slug}`} className="rounded border border-line bg-surface px-3 py-2 text-[0.75rem] font-medium hover:border-brass/40">
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
