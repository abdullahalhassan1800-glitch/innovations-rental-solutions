import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Compass,
  Download,
  ExternalLink,
  FileText,
  Layers,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trees,
} from "lucide-react";
import { getProjectBySlug, getSimilarProjects, getSavedProjectIds, getPublishedFaqs } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { ProjectCard } from "@/components/projects/project-card";
import { FavoriteButton } from "@/components/projects/favorite-button";
import { LeadForm } from "@/components/forms/lead-form";
import { SiteVisitForm } from "@/components/forms/site-visit-form";
import { Accordion } from "@/components/ui/accordion";
import { StatusBadge, DemoBadge, Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { AmenityIcon } from "@/components/ui/amenity-icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE, STATUS_LABELS } from "@/lib/constants";
import {
  formatINR,
  formatMonthYear,
  formatPriceRange,
  parseBhk,
  parseJsonArray,
  whatsappLink,
} from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  const image = project.heroImage ?? project.images[0]?.url ?? "/images/exterior-1.jpg";
  const title = project.metaTitle ?? `${project.name}, ${project.location.name}`;
  const description =
    project.metaDescription ??
    `${project.tagline ?? project.name} — demo ${project.category.toLowerCase()} in ${project.location.name} starting at ${formatPriceRange(project.startingPrice, project.maxPrice)}. Sample data only.`;
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/projects/${project.slug}`,
      images: [{ url: image, alt: `${project.name} demonstration image` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [similar, user, globalFaqs] = await Promise.all([
    getSimilarProjects(project, 3),
    getCurrentUser(),
    getPublishedFaqs(4),
  ]);
  const savedIds = new Set(await getSavedProjectIds(user?.id));

  void db.project.update({ where: { id: project.id }, data: { views: { increment: 1 } } }).catch(() => undefined);

  const images = project.images.length
    ? project.images
    : project.heroImage
      ? [{ id: "hero", url: project.heroImage, alt: `${project.name} demonstration image` }]
      : [];
  const configs = parseBhk(project.bhkConfigs);
  const highlights = parseJsonArray<string>(project.highlights);
  const nearby = parseJsonArray<{ name: string; distance: string }>(project.nearbyPlaces);
  const amenities = project.amenities.map((item) => item.amenity);
  const brochure = project.brochures[0];

  const projectFaqs = [
    {
      question: `What is the starting price of ${project.name}?`,
      answer: `This demonstration listing shows a starting price of ${formatINR(project.startingPrice)}${project.maxPrice ? ` and a maximum of ${formatINR(project.maxPrice)}` : ""}. These figures are sample data and are not a quotation or an offer.`,
    },
    {
      question: "When is possession expected?",
      answer: project.possessionDate
        ? `The sample possession date shown is ${formatMonthYear(project.possessionDate)}. Actual delivery timelines must always be confirmed in the developer's official documents.`
        : "No possession date is recorded for this demonstration listing. Ask the developer for a written timeline.",
    },
    {
      question: "Is the project RERA registered?",
      answer:
        project.reraVerified && project.reraNumber
          ? `The listing displays RERA registration ${project.reraNumber}, marked as verified by the project record. Always re-check the number on the relevant state RERA portal.`
          : "No verified RERA registration is recorded for this demonstration listing. Do not rely on the sample data shown here; verify any registration independently on the state RERA portal.",
    },
    {
      question: "Can I book a site visit?",
      answer:
        "Yes — use the site-visit form on this page. It stores a demo request in the Innovations database so you can see how the workflow behaves. No real appointment is created.",
    },
  ];

  const faqItems = [
    ...projectFaqs,
    ...globalFaqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
  ].slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE.url}/projects` },
          { "@type": "ListItem", position: 3, name: project.name, item: `${SITE.url}/projects/${project.slug}` },
        ],
      },
      {
        "@type": "ApartmentComplex",
        name: project.name,
        description: project.description,
        url: `${SITE.url}/projects/${project.slug}`,
        image: images[0] ? `${SITE.url}${images[0].url}` : undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: project.address,
          addressLocality: project.location.city,
          addressRegion: project.location.state,
          addressCountry: "IN",
        },
        ...(project.mapLat && project.mapLng
          ? { geo: { "@type": "GeoCoordinates", latitude: project.mapLat, longitude: project.mapLng } }
          : {}),
        ...(project.possessionDate ? { yearBuilt: project.possessionDate.getFullYear() } : {}),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b border-line bg-surface/70">
        <div className="shell py-4">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[0.7rem] text-ink-muted">
            <Link href="/" className="transition hover:text-brass">Home</Link>
            <ChevronRight className="size-3 opacity-60" />
            <Link href="/projects" className="transition hover:text-brass">Projects</Link>
            <ChevronRight className="size-3 opacity-60" />
            <Link href={`/location/${project.location.slug}`} className="transition hover:text-brass">{project.location.name}</Link>
            <ChevronRight className="size-3 opacity-60" />
            <span className="text-ink">{project.name}</span>
          </nav>
        </div>
      </div>

      <section className="shell py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
          <div>
            <ProjectGallery images={images} projectName={project.name} />

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              <Badge tone="forest">{project.category}</Badge>
              <Badge>{project.propertyType === "RESIDENTIAL" ? "Residential" : "Commercial"}</Badge>
              {project.isDemo && <DemoBadge />}
              {project.featured && <Badge tone="brass">Featured</Badge>}
            </div>

            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-brass">{project.developer.name}</p>
                <h1 className="display-lg mt-2.5 balance">{project.name}</h1>
                {project.tagline && <p className="lede mt-3 max-w-2xl pretty">{project.tagline}</p>}
                <p className="mt-3.5 flex items-start gap-1.5 text-[0.85rem] text-ink-soft">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brass" /> {project.address}
                </p>
              </div>
              <FavoriteButton projectId={project.id} initialSaved={savedIds.has(project.id)} className="shrink-0" />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-y-6 rounded-[16px] border border-line bg-surface px-5 py-6 shadow-card sm:grid-cols-4 sm:gap-x-4 sm:divide-x sm:divide-line">
              <div className="sm:pr-4">
                <p className="eyebrow-plain">Starting from</p>
                <p className="mt-2 font-display text-[1.3rem] leading-none">{formatINR(project.startingPrice)}</p>
              </div>
              <div className="sm:px-4">
                <p className="eyebrow-plain">Configuration</p>
                <p className="mt-2 text-[0.86rem] font-semibold">
                  {configs.length
                    ? project.propertyType === "COMMERCIAL"
                      ? configs.join(" · ")
                      : `${configs.join(" · ")} BHK`
                    : project.category}
                </p>
              </div>
              <div className="sm:px-4">
                <p className="eyebrow-plain">Possession</p>
                <p className="mt-2 flex items-center gap-1.5 text-[0.86rem] font-semibold">
                  <CalendarClock className="size-3.5 text-brass" /> {formatMonthYear(project.possessionDate)}
                </p>
              </div>
              <div className="sm:pl-4">
                <p className="eyebrow-plain">Status</p>
                <p className="mt-2 text-[0.86rem] font-semibold">{STATUS_LABELS[project.status] ?? project.status}</p>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-lift">
              <div className="relative border-b border-line bg-sand/40 p-6">
                <span className="absolute right-5 top-5 size-9 rounded-full border border-brass/25" aria-hidden />
                <p className="eyebrow-plain">Private inquiry</p>
                <p className="mt-3 font-display text-[1.75rem] tracking-[-0.02em]">{formatPriceRange(project.startingPrice, project.maxPrice)}</p>
                <p className="mt-1.5 text-[0.72rem] text-ink-muted">Demo price · sample inventory</p>
              </div>
              <div className="grid gap-2.5 p-5">
                <ButtonLink href="#site-visit" variant="primary" className="w-full">
                  <CalendarClock className="size-4" /> Request a site visit
                </ButtonLink>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-line bg-surface text-[0.76rem] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/50 hover:text-brass"
                  >
                    <Phone className="size-3.5" /> Call
                  </a>
                  <a
                    href={whatsappLink(`Hi Innovations, I'd like to know more about ${project.name} (demo listing).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-forest/25 bg-forest-soft text-[0.76rem] font-semibold text-night transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/45"
                  >
                    <MessageCircle className="size-3.5" /> WhatsApp
                  </a>
                </div>
                <a
                  href={brochure?.fileUrl ?? `/api/projects/${project.slug}/brochure`}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-brass/40 bg-brass-pale/60 text-[0.76rem] font-semibold text-brass-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-pale"
                >
                  <Download className="size-3.5" /> Demo brochure (PDF)
                </a>
              </div>
              <div className="border-t border-line bg-cream/70 px-5 py-4">
                <p className="flex items-start gap-2 text-[0.68rem] leading-relaxed text-ink-muted">
                  <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-rust" />
                  Demonstration listing. Prices, approvals, RERA and availability are samples and must be independently verified.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[16px] border border-line bg-surface p-5 shadow-card">
              <p className="eyebrow-plain">Project snapshot</p>
              <dl className="mt-4 space-y-3 text-[0.8rem]">
                <div className="flex justify-between gap-4 border-b border-line/70 pb-2.5"><dt className="text-ink-muted">Category</dt><dd className="text-right font-medium">{project.category}</dd></div>
                <div className="flex justify-between gap-4 border-b border-line/70 pb-2.5"><dt className="text-ink-muted">Possession</dt><dd className="text-right font-medium">{formatMonthYear(project.possessionDate)}</dd></div>
                <div className="flex justify-between gap-4 border-b border-line/70 pb-2.5"><dt className="text-ink-muted">Project status</dt><dd className="text-right font-medium">{STATUS_LABELS[project.status] ?? project.status}</dd></div>
                <div className="flex justify-between gap-4 border-b border-line/70 pb-2.5"><dt className="text-ink-muted">RERA</dt><dd className="text-right font-medium">{project.reraVerified && project.reraNumber ? project.reraNumber : "Not verified"}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-ink-muted">Developer</dt><dd className="text-right font-medium">{project.developer.name}</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-line bg-surface/60">
        <div className="shell grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr] lg:py-20">
          <div>
            <p className="eyebrow">The project</p>
            <h2 className="display-md mt-4">An overview, without the noise.</h2>
            <p className="mt-6 whitespace-pre-line text-[0.95rem] leading-[1.85] text-ink-soft">{project.description}</p>
            {highlights.length > 0 && (
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-[0.84rem] text-ink-soft">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-forest" /> {highlight}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 self-start">
            {[
              { icon: BedDouble, label: "Configurations", value: configs.length ? configs.join(", ") : project.category },
              { icon: Layers, label: "Project type", value: project.propertyType === "RESIDENTIAL" ? "Residential" : "Commercial" },
              { icon: Building2, label: "Developer", value: project.developer.name },
              { icon: MapPin, label: "Location", value: project.location.name },
              { icon: Ruler, label: "Starting size", value: project.floorPlans[0]?.areaSqft ? `${project.floorPlans[0].areaSqft} sq ft` : "Ask developer" },
              { icon: FileText, label: "Brochure", value: brochure ? "Available" : "On request" },
            ].map((item) => (
              <div key={item.label} className="group rounded-[14px] border border-line bg-surface p-4 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-brass/40">
                <item.icon className="size-4 text-brass" />
                <p className="mt-3.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-ink-muted">{item.label}</p>
                <p className="mt-1.5 text-[0.85rem] font-semibold leading-snug">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Pricing</p>
            <h2 className="display-md mt-4">Configurations & sample pricing.</h2>
          </div>
          <p className="max-w-sm text-[0.72rem] leading-relaxed text-ink-muted">
            All prices are demonstration values. Taxes, charges and payment plans are illustrative and not an offer.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-[16px] border border-line bg-surface shadow-card">
          <table className="table-clean w-full min-w-[620px]">
            <caption className="sr-only">Sample configurations and pricing for {project.name}</caption>
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Configuration</th>
                <th scope="col">Carpet area</th>
                <th scope="col">Sample price</th>
                <th scope="col">Floor plan</th>
              </tr>
            </thead>
            <tbody>
              {(project.floorPlans.length
                ? project.floorPlans
                : [{ id: "base", name: project.category, bhk: null, areaSqft: null, price: project.startingPrice, imageUrl: null }]
              ).map((plan) => (
                <tr key={plan.id}>
                  <td className="font-display text-[1rem] text-ink">{plan.name}</td>
                  <td>{plan.bhk ? `${plan.bhk} BHK` : project.category}</td>
                  <td>{plan.areaSqft ? `${plan.areaSqft.toLocaleString("en-IN")} sq ft` : "On request"}</td>
                  <td className="font-semibold text-ink">{formatINR(plan.price ?? project.startingPrice)}</td>
                  <td>
                    <Link href="#floor-plans" className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[0.72rem] font-semibold text-forest transition hover:border-brass/50 hover:text-brass">
                      View plan <ArrowUpRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-line bg-sand/30">
        <div className="shell py-14 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Amenities</p>
              <h2 className="display-md mt-4">The everyday, considered.</h2>
            </div>
            <Badge tone="forest">{amenities.length} listed</Badge>
          </div>
          {amenities.length ? (
            <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {amenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center gap-3 rounded-[12px] border border-line bg-surface px-4 py-3.5 shadow-card transition duration-300 hover:border-brass/40">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest-soft text-night">
                    <AmenityIcon name={amenity.name} className="size-4" />
                  </span>
                  <span className="text-[0.82rem] font-medium">{amenity.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink-muted">Amenities are listed on request for this project.</p>
          )}
          {project.amenityNotes && <p className="mt-5 text-[0.8rem] text-ink-soft">{project.amenityNotes}</p>}
        </div>
      </section>

      <section id="floor-plans" className="shell scroll-mt-28 py-14 md:py-20">
        <p className="eyebrow">Floor plans</p>
        <h2 className="display-md mt-4">See the shape of the space.</h2>
        {project.floorPlans.length ? (
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {project.floorPlans.map((plan) => (
              <div key={plan.id} className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-card transition duration-300 hover:-translate-y-1 hover:border-brass/40 hover:shadow-lift">
                <div className="relative aspect-[4/3] bg-white">
                  {plan.imageUrl ? (
                    <Image src={plan.imageUrl} alt={`${project.name} ${plan.name} demonstration floor plan`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-4" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-ink-muted">Plan on request</div>
                  )}
                </div>
                <div className="border-t border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[1.05rem]">{plan.name}</p>
                      <p className="mt-1 text-[0.72rem] text-ink-muted">
                        {plan.bhk ? `${plan.bhk} BHK` : "Config"} {plan.areaSqft ? `· ${plan.areaSqft.toLocaleString("en-IN")} sq ft` : ""}
                      </p>
                    </div>
                    <p className="text-[0.82rem] font-semibold text-forest">{formatINR(plan.price ?? project.startingPrice)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">Floor plans are available on request from the sales team.</p>
        )}
      </section>

      <section className="border-y border-line bg-surface/60">
        <div className="shell py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="eyebrow">Location</p>
              <h2 className="display-md mt-4">The address, in context.</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">{project.location.description}</p>
              <div className="mt-6 overflow-hidden rounded-[16px] border border-line bg-surface shadow-card">
                {project.mapEmbedUrl ? (
                  <iframe
                    src={project.mapEmbedUrl}
                    title={`Map showing ${project.name}`}
                    loading="lazy"
                    className="h-[320px] w-full border-0"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex h-[260px] flex-col items-center justify-center gap-3 bg-sand/40 p-6 text-center">
                    <MapPin className="size-6 text-brass" />
                    <p className="text-sm font-medium">{project.address}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.75rem] font-semibold text-forest underline decoration-brass/50 underline-offset-4 transition hover:text-brass"
                    >
                      Open in Google Maps <ExternalLink className="inline size-3" />
                    </a>
                  </div>
                )}
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-[0.82rem] text-ink-soft">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brass" /> {project.address}
              </p>
            </div>

            <div>
              <p className="eyebrow-plain">Nearby</p>
              <h3 className="mt-2 font-display text-[1.4rem] tracking-[-0.02em]">Landmarks & connectivity</h3>
              {nearby.length ? (
                <ul className="mt-5 divide-y divide-line border-y border-line">
                  {nearby.map((place) => (
                    <li key={`${place.name}-${place.distance}`} className="flex items-start justify-between gap-4 py-3.5">
                      <span className="flex items-start gap-2 text-[0.84rem]">
                        <Compass className="mt-0.5 size-4 shrink-0 text-brass" /> {place.name}
                      </span>
                      <span className="shrink-0 text-[0.75rem] font-semibold text-ink-muted">{place.distance}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-ink-muted">Landmark data is not recorded for this demonstration listing.</p>
              )}
              <Link href={`/location/${project.location.slug}`} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest transition hover:text-brass">
                Explore {project.location.name} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Developer</p>
            <h2 className="display-md mt-4">{project.developer.name}</h2>
            {project.developer.description && (
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{project.developer.description}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {project.developer.establishedYear && <Badge>Est. {project.developer.establishedYear}</Badge>}
              <DemoBadge />
              <Badge tone="forest"><BadgeCheck className="mr-1 size-3" /> Profile on Innovations</Badge>
            </div>
            <div className="mt-6 rounded-[14px] border border-brass/30 bg-brass-pale/50 p-5">
              <p className="eyebrow-plain">Verification note</p>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-soft">
                This developer is fictional and exists only for demonstration. Approvals, delivery history and financials
                shown anywhere on this site are not verified claims.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[14px] border border-line bg-surface p-5 shadow-card">
              <ShieldCheck className="size-5 text-forest" />
              <h3 className="mt-3 font-display text-lg">RERA status</h3>
              {project.reraVerified && project.reraNumber ? (
                <>
                  <p className="mt-2 text-[0.82rem] text-ink-soft">Recorded as verified in the project database.</p>
                  <p className="mt-2 font-mono text-[0.75rem] font-semibold">{project.reraNumber}</p>
                </>
              ) : (
                <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">
                  No verified RERA registration is recorded. Always check the state RERA portal before making any decision.
                </p>
              )}
            </div>
            <div className="rounded-[14px] border border-line bg-surface p-5 shadow-card">
              <Trees className="size-5 text-forest" />
              <h3 className="mt-3 font-display text-lg">Possession</h3>
              <p className="mt-2 text-[0.82rem] text-ink-soft">
                Sample timeline: <strong className="text-ink">{formatMonthYear(project.possessionDate)}</strong>. Confirm in writing with the developer.
              </p>
            </div>
            <div className="rounded-[14px] border border-line bg-surface p-5 shadow-card sm:col-span-2">
              <Sparkles className="size-5 text-brass" />
              <h3 className="mt-3 font-display text-lg">A note on this listing</h3>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">
                Everything on this page is demonstration content. Prices are not offers, availability is not guaranteed,
                and images are sourced from Unsplash to illustrate the type of space. Use the inquiry form to see the
                end-to-end workflow, not to contact a real developer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="site-visit" className="scroll-mt-28 border-y border-line bg-night text-paper">
        <div className="shell grid gap-10 py-14 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow text-brass-soft">Next step</p>
            <h2 className="display-md mt-4 text-paper">Visit the address.<br />Or ask us first.</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/60">
              Request a site visit or a callback. The forms below write to the local demo database and your dashboard,
              so you can see exactly how a real inquiry would be handled.
            </p>
            <div className="mt-7 space-y-3 text-sm text-paper/70">
              <p className="flex items-center gap-3"><Phone className="size-4 text-brass-soft" /> {SITE.phone}</p>
              <p className="flex items-center gap-3"><MessageCircle className="size-4 text-brass-soft" /> WhatsApp available on {SITE.phone}</p>
              <p className="flex items-center gap-3"><MapPin className="size-4 text-brass-soft" /> {SITE.address}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <SiteVisitForm projectId={project.id} projectName={project.name} defaults={{ name: user?.name, email: user?.email, phone: user?.phone ?? undefined }} />
            <LeadForm
              projectId={project.id}
              projectName={project.name}
              defaultType="CALLBACK"
              source={`project:${project.slug}`}
              compact
              heading="Request a callback"
              defaults={{ name: user?.name, email: user?.email, phone: user?.phone ?? undefined }}
            />
          </div>
        </div>
      </section>

      <section className="shell py-14 md:py-20">
        <p className="eyebrow">Questions</p>
        <h2 className="display-md mt-4">Answers for this listing.</h2>
        <Accordion items={faqItems} className="mt-7" />
      </section>

      {similar.length > 0 && (
        <section className="border-t border-line bg-surface/60">
          <div className="shell py-14 md:py-20">
            <SectionHeading
              eyebrow="Keep looking"
              title="Similar addresses."
              description="Projects in the same location or price band, pulled from the same demo database."
              action={{ label: "Browse all projects", href: "/projects" }}
            />
            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <ProjectCard key={item.id} project={item} saved={savedIds.has(item.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="sticky bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur md:hidden">
        <div className="shell flex items-center justify-between gap-3 py-3">
          <div>
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-ink-muted">Starting from</p>
            <p className="font-display text-[1.1rem]">{formatPriceRange(project.startingPrice, project.maxPrice)}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex size-10 items-center justify-center rounded-full border border-line" aria-label="Call Innovations"><Phone className="size-4" /></a>
            <ButtonLink href="#site-visit" size="sm">Book a visit <ArrowUpRight className="size-3.5" /></ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
