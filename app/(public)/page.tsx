import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Compass,
  Home,
  KeyRound,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Waves,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import { Accordion } from "@/components/ui/accordion";
import { Stars } from "@/components/ui/stars";
import { Reveal } from "@/components/ui/reveal";
import { LeadForm } from "@/components/forms/lead-form";
import { LeadModal } from "@/components/forms/lead-modal";
import { HeroMedia } from "@/components/home/hero-media";
import { HeroHeading } from "@/components/home/hero-heading";
import { MarqueeRibbon } from "@/components/home/marquee";
import {
  getAllLocations,
  getFeaturedProjects,
  getProjectCounts,
  getProjectsByCategory,
  getProjectsByStatus,
  getProjectsByType,
  getPublishedFaqs,
  getPublishedTestimonials,
  getSavedProjectIds,
} from "@/lib/queries";
import type { ProjectCardData } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { BHK_OPTIONS, BUDGET_OPTIONS, SITE } from "@/lib/constants";
import { formatMonthYear, formatPriceShort } from "@/lib/utils";

export const metadata = {
  title: "Innovations Rental Solutions — Resort, serviced, commercial & residential",
  description:
    "Explore resort housing, commercial spaces, service apartments and residential properties across Delhi NCR and select Indian destinations. Compare projects, save favourites and speak to the Innovations team.",
  alternates: { canonical: "/" },
};

const WHY = [
  {
    icon: Compass,
    title: "A considered shortlist",
    copy: "We curate by location, liveability and long-term fit — not by the loudest advertisement. Every project page is structured for comparison.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent by default",
    copy: "Prices, possession and configuration are shown exactly as they exist in our database. Sample listings are labelled clearly.",
  },
  {
    icon: TrendingUp,
    title: "Built for better decisions",
    copy: "Save projects, compare side by side and keep every enquiry and site visit in one private dashboard.",
  },
];

const PROCESS = [
  {
    step: "01",
    icon: Search,
    title: "Define your brief",
    copy: "Location, budget, configuration and the way you want to live. Tell the assistant or use the filters.",
  },
  {
    step: "02",
    icon: Compass,
    title: "Shortlist with context",
    copy: "Compare projects on price, possession, amenities and developer. Save the ones worth a second look.",
  },
  {
    step: "03",
    icon: KeyRound,
    title: "Visit and decide",
    copy: "Request a site visit or callback. Your enquiry history stays available in your dashboard.",
  },
];

const PRIVILEGES = [
  { title: "Curated, not crowded", copy: "A finite edit per collection, with the detail that actually changes a decision." },
  { title: "Every number labelled", copy: "Demonstration pricing and approvals are marked. Nothing is dressed up as verified." },
  { title: "One private workspace", copy: "Saved shortlists, enquiries and site visits stay in one account." },
  { title: "A human second opinion", copy: "Use the assistant for speed, then speak to a person when the shortlist is ready." },
];

const MODEL_BY_CATEGORY: Record<string, string> = {
  Resort: "Resort-managed homes",
  "Serviced apartment": "Managed serviced stays",
  Retail: "High-street retail",
  SCO: "Shop-cum-office",
  Office: "Grade-A workspace",
  Apartment: "Residential ownership",
  Villa: "Low-density villa",
  Studio: "Compact studio",
};

export default async function HomePage() {
  const [
    featured,
    newLaunches,
    residential,
    commercial,
    resortProjects,
    servicedProjects,
    locations,
    counts,
    testimonials,
    faqs,
    user,
  ] = await Promise.all([
    getFeaturedProjects(6),
    getProjectsByStatus("NEW_LAUNCH", 3),
    getProjectsByType("RESIDENTIAL", 3),
    getProjectsByType("COMMERCIAL", 3),
    getProjectsByCategory("Resort", 2),
    getProjectsByCategory("Serviced apartment", 2),
    getAllLocations(),
    getProjectCounts(),
    getPublishedTestimonials(3),
    getPublishedFaqs(5),
    getCurrentUser(),
  ]);

  const savedIds = new Set(await getSavedProjectIds(user?.id));

  const spotlight = [resortProjects[0], servicedProjects[0], commercial[0]].filter(Boolean) as ProjectCardData[];

  const collections = [
    {
      label: "Resort housing",
      blurb: "Resort-led homes with a managed rental intent, presented with the operating model.",
      href: "/resort-housing",
      image: resortProjects[0]?.images[0]?.url ?? "/images/pool-1.jpg",
      icon: Waves,
      count: counts.resort,
    },
    {
      label: "Commercial spaces",
      blurb: "Offices, retail and SCO addresses for a footprint that works harder.",
      href: "/commercial",
      image: commercial[0]?.images[0]?.url ?? "/images/commercial-1.jpg",
      icon: Store,
      count: counts.commercial,
    },
    {
      label: "Service apartments",
      blurb: "Furnished, professionally managed stays with the operating detail laid out plainly.",
      href: "/service-apartments",
      image: servicedProjects[0]?.images[0]?.url ?? "/images/apartment-1.jpg",
      icon: Building2,
      count: counts.serviced,
    },
    {
      label: "Residential properties",
      blurb: "Apartments, villas, penthouses and studios for the life you are building.",
      href: "/residential",
      image: residential[0]?.images[0]?.url ?? "/images/exterior-2.jpg",
      icon: Home,
      count: counts.residential,
    },
  ];

  return (
    <>
      {/* Cinematic hero */}
      <section
        data-ai-avoid
        className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden bg-night text-paper"
      >
        <HeroMedia />

        <div className="shell relative flex flex-1 flex-col justify-end pb-10 pt-28 md:pb-14">
          <div className="max-w-4xl animate-fade-up">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-brass/40 bg-brass/10 px-3.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-brass-soft backdrop-blur">
                <Sparkles className="size-3" /> The 2026 collection
              </span>
              <span className="hidden rounded-full border border-paper/20 px-3.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-paper/55 sm:inline-block">
                Demonstration inventory
              </span>
            </div>

            <HeroHeading />

            <p className="mt-4 max-w-xl text-[0.98rem] leading-[1.8] text-paper/65 pretty sm:mt-5">
              <span className="sm:hidden">
                Resort, commercial and serviced addresses across Delhi NCR.
              </span>
              <span className="hidden sm:inline">
                Resort housing, commercial spaces, service apartments and residential properties —
                one considered edit across Delhi NCR and select Indian destinations.
              </span>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8">
              <ButtonLink href="/projects" variant="primary" size="lg">
                Explore the collection <ArrowRight className="size-4" />
              </ButtonLink>
              <LeadModal label="Private enquiry" size="lg" source="home-hero" className="border-paper/25 bg-transparent text-paper hover:border-brass-soft hover:bg-paper/[0.06] hover:text-brass-soft" />
            </div>
          </div>

          <div className="glass mt-8 grid grid-cols-3 divide-x divide-paper/10 rounded-[14px] py-4 md:mt-14">
            {[
              { value: String(counts.total).padStart(2, "0"), label: "Curated addresses" },
              { value: String(counts.locations).padStart(2, "0"), label: "Destinations" },
              { value: "04", label: "Asset classes" },
            ].map((stat) => (
              <div key={stat.label} className="px-3 text-center sm:px-8">
                <p className="font-display text-[1.6rem] font-medium leading-none tracking-[-0.03em] text-paper sm:text-[1.9rem] md:text-[2.4rem]">
                  {stat.value}
                </p>
                <p className="mt-2 text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-paper/50 sm:text-[0.62rem] sm:tracking-[0.2em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 hidden flex-wrap items-center gap-x-6 gap-y-2 text-[0.66rem] text-paper/45 sm:flex">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-brass-soft" /> Sample data, clearly labelled
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-brass-soft" /> No yield promises
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-brass-soft" /> AI in three languages
            </span>
          </div>
        </div>
      </section>

      {/* Diagonal ribbon pair */}
      <div className="relative overflow-hidden bg-cream py-6">
        <div className="-ml-[2%] w-[104%] -rotate-[1.2deg]">
          <MarqueeRibbon
            items={["Resort housing", "Commercial spaces", "Service apartments", "Residential properties"]}
            tone="dark"
          />
        </div>
        <div className="-ml-[2%] mt-3 w-[104%] rotate-[1.2deg]">
          <MarqueeRibbon
            items={["Delhi NCR", "Noida", "Greater Noida", "Noida Extension", "NOIDA"]}
            reverse
            tone="gold"
          />
        </div>
      </div>

      {/* Spotlight */}
      <section className="shell py-20 md:py-28">
        <SectionHeading
          eyebrow="The spotlight collection"
          title={<>Three addresses,<br className="hidden sm:block" /> three intents.</>}
          description="A resort-led home, a managed serviced stay and a high-street retail address. Each is presented with the operating context first, so the intent is visible before the price."
          action={{ label: "View all projects", href: "/projects" }}
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {spotlight.map((project, index) => (
            <Reveal key={project.id} delay={index * 80}>
              <Link
                href={`/projects/${project.slug}`}
                className="group relative block min-h-[460px] overflow-hidden rounded-[16px] border border-paper/10 bg-surface"
              >
                <Image
                  src={project.heroImage ?? project.images[0]?.url ?? "/images/exterior-1.jpg"}
                  alt={`${project.name} demonstration project`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover opacity-75 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-night/10" />
                <div className="relative flex min-h-[460px] flex-col justify-between p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-paper/20 bg-night/40 px-3 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-paper/80 backdrop-blur">
                      {project.category}
                    </span>
                    <span className="rounded-full border border-brass/40 bg-brass/15 px-3 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-brass-soft backdrop-blur">
                      Sample
                    </span>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-brass-soft">
                      <MapPin className="size-3" /> {project.location.name}
                    </p>
                    <h3 className="mt-2 font-display text-[1.55rem] leading-tight tracking-[-0.025em] text-paper">
                      {project.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[0.8rem] leading-relaxed text-paper/60">
                      {project.tagline ?? project.description}
                    </p>
                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-paper/15 pt-4">
                      <div>
                        <p className="text-[0.54rem] font-semibold uppercase tracking-[0.18em] text-paper/40">Entry from</p>
                        <p className="mt-1 font-display text-[1.25rem] text-paper">{formatPriceShort(project.startingPrice)}</p>
                      </div>
                      <span className="flex size-9 items-center justify-center rounded-full bg-brass text-night transition group-hover:bg-brass-soft">
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Four collections */}
      <section className="border-y border-line bg-surface/50">
        <div className="shell py-20 md:py-28">
          <SectionHeading
            eyebrow="Four ways to look"
            title="One market. Four very different briefs."
            description="Start with the intent that matches you — a place to live, a space to trade from, a stay to operate, or a resort-led asset to hold."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {collections.map((collection, index) => (
              <Reveal key={collection.href} delay={index * 60}>
                <Link
                  href={collection.href}
                  className="group relative block h-[330px] overflow-hidden rounded-[16px] border border-paper/10 bg-night"
                >
                  <Image
                    src={collection.image}
                    alt={`${collection.label} demonstration`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover opacity-65 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                    <div className="flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-brass-soft">
                      <collection.icon className="size-3.5" /> {collection.label}
                    </div>
                    <h3 className="mt-2.5 max-w-md font-display text-[1.45rem] leading-tight tracking-[-0.025em] text-paper">
                      {collection.blurb}
                    </h3>
                    <p className="mt-3 flex items-center gap-2 text-[0.7rem] font-medium text-paper/55">
                      {collection.count} sample {collection.count === 1 ? "address" : "addresses"}
                      <span className="text-brass">·</span>
                      <span className="inline-flex items-center gap-1 text-paper/75 transition group-hover:text-brass-soft">
                        Explore <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Investment lens */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <p className="eyebrow">Invest smart</p>
            <h2 className="display-lg mt-5 balance">Read the operating model, not the promise.</h2>
            <p className="lede mt-4 max-w-md">
              Managed rentals, serviced stays and resort-led homes each carry a different
              operating reality. We put the model next to the entry price — and leave the
              projection to you and your adviser.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: TrendingUp, title: "Managed rental assets", copy: "Resort and serviced inventory is presented with its management model." },
                { icon: MapPin, title: "NCR-wide plus select destinations", copy: "Noida, Greater Noida, Noida Extension, NOIDA in one database." },
                { icon: ShieldCheck, title: "Sample data, labelled", copy: "No invented approvals, no yield promises, no unverified RERA claims." },
              ].map((item) => (
                <li key={item.title} className="flex gap-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brass/30 bg-brass/10 text-brass">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-paper">{item.title}</p>
                    <p className="mt-1 text-[0.8rem] leading-relaxed text-ink-muted">{item.copy}</p>
                  </div>
                </li>
              ))}
            </ul>
            <ButtonLink href="/about" variant="outline" size="sm" className="mt-7">
              How we present an asset <ArrowUpRight className="size-3.5" />
            </ButtonLink>
          </div>

          <div className="overflow-hidden rounded-[16px] border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-brass">Illustrative snapshot</p>
                <p className="mt-1 text-sm text-paper/70">Entry price and operating model</p>
              </div>
              <span className="rounded-full border border-paper/15 px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-paper/45">
                Sample
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-line text-[0.56rem] uppercase tracking-[0.16em] text-ink-muted">
                    <th className="px-5 py-3 font-semibold">Address</th>
                    <th className="px-3 py-3 font-semibold">Entry</th>
                    <th className="px-3 py-3 font-semibold">Model</th>
                    <th className="px-5 py-3 text-right font-semibold">Possession</th>
                  </tr>
                </thead>
                <tbody>
                  {spotlight.map((project) => (
                    <tr key={project.id} className="border-b border-line/70 last:border-0">
                      <td className="px-5 py-4">
                        <Link href={`/projects/${project.slug}`} className="group block">
                          <span className="block text-[0.84rem] font-semibold text-paper transition group-hover:text-brass-soft">
                            {project.name}
                          </span>
                          <span className="mt-0.5 block text-[0.66rem] text-ink-muted">{project.location.name}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-4 text-[0.8rem] text-paper/80">{formatPriceShort(project.startingPrice)}</td>
                      <td className="px-3 py-4 text-[0.74rem] text-ink-muted">{MODEL_BY_CATEGORY[project.category] ?? project.category}</td>
                      <td className="px-5 py-4 text-right text-[0.74rem] text-ink-muted">{formatMonthYear(project.possessionDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-line px-5 py-3 text-[0.62rem] leading-relaxed text-ink-muted">
              Illustrative demonstration data only. This is not an offer, a projection or a guarantee
              of rental income or capital appreciation.
            </p>
          </div>
        </div>
      </section>

      {/* About split */}
      <section className="border-y border-line bg-surface/50">
        <div className="shell grid gap-14 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow">About the practice</p>
            <h2 className="display-lg mt-5 balance">Less noise.<br />More signal.</h2>
            <p className="lede mt-4 max-w-xl">
              Property research is usually a maze of duplicate listings and unreturned calls.
              Innovations Rental Solutions is structured around clarity: one database, consistent
              detail, and an assistant that only answers from what it can verify.
            </p>
            <div className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {PRIVILEGES.map((item, index) => (
                <div key={item.title} className="border-t border-line pt-4">
                  <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-brass">0{index + 1}</p>
                  <h3 className="mt-2 text-[1.02rem] font-medium text-paper">{item.title}</h3>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-muted">{item.copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/about" variant="primary" size="sm">Read our approach</ButtonLink>
              <Link href="/faq" className="group inline-flex items-center gap-2 text-[0.78rem] font-semibold text-paper/70 transition hover:text-brass-soft">
                Read the FAQs <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="absolute -inset-4 rounded-[20px] border border-brass/20" aria-hidden />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-paper/10 bg-night shadow-float">
              <Image
                src="/images/exterior-11.jpg"
                alt="A demonstration residence at dusk"
                fill
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-brass-soft">The long view</p>
                <p className="mt-2 max-w-xs font-display text-[1.3rem] leading-snug text-paper">
                  An address is a decision about how you live, work and hold value.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-4 rounded-full border border-brass/40 bg-night px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-brass-soft shadow-float sm:-left-6">
              Sample data · not a broker-dealer
            </div>
          </div>
        </div>
      </section>

      {/* Featured shortlist */}
      <section className="shell py-20 md:py-28">
        <SectionHeading
          eyebrow="The shortlist"
          title={<>Featured addresses,<br className="hidden sm:block" /> chosen with intent.</>}
          description="A rotating edit of the projects our team would shortlist first — presented with the detail you need to compare them properly."
          action={{ label: "View all projects", href: "/projects" }}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 3).map((project, index) => (
            <Reveal key={project.id} delay={index * 70}>
              <ProjectCard project={project} saved={savedIds.has(project.id)} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* New launches */}
      <section className="border-y border-line bg-surface/50">
        <div className="shell py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:items-center">
            <div>
              <p className="eyebrow">Fresh to market</p>
              <h2 className="display-md mt-4 balance">New launches &amp; upcoming.</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
                The newest additions to the landscape, plus projects worth watching before sales open.
              </p>
              <div className="mt-6 flex flex-col">
                {[
                  { label: "New launches", href: "/projects?status=NEW_LAUNCH" },
                  { label: "Upcoming projects", href: "/projects?status=UPCOMING" },
                  { label: "Ready to move", href: "/projects?status=READY_TO_MOVE" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="group flex items-center justify-between border-b border-line py-3.5 text-sm font-medium transition hover:text-brass-soft">
                    {link.label} <ArrowRight className="size-4 text-brass transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {newLaunches.slice(0, 2).map((project) => (
                <ProjectCard key={project.id} project={project} saved={savedIds.has(project.id)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="shell py-20 md:py-28">
        <SectionHeading
          eyebrow="Where to look"
          title="Different geographies. Different rhythms."
          description="Start with the corridor that fits your commute, budget and appetite for what comes next."
          action={{ label: "All locations", href: "/location/noida" }}
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((location, index) => {
            const project = featured.find((item) => item.location.slug === location.slug);
            const image = location.imageUrl ?? project?.images[0]?.url ?? "/images/city-1.jpg";
            return (
              <Reveal key={location.id} delay={index * 60}>
                <Link href={`/location/${location.slug}`} className="group relative block overflow-hidden rounded-[14px] border border-paper/10 bg-night">
                  <Image
                    src={image}
                    alt={`${location.name} demonstration location`}
                    width={500}
                    height={620}
                    className="h-[320px] w-full object-cover opacity-65 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-brass-soft/80">{location.city}</p>
                    <h3 className="mt-1.5 font-display text-[1.35rem] tracking-[-0.02em] text-paper">{location.name}</h3>
                    <p className="mt-4 flex items-center justify-between border-t border-paper/15 pt-3 text-[0.68rem] font-medium text-paper/60">
                      Explore location <ArrowUpRight className="size-4 text-brass-soft transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Why + process */}
      <section className="border-y border-line bg-surface/50">
        <div className="shell grid gap-14 py-20 md:py-28 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Why Innovations</p>
            <h2 className="display-lg mt-5 balance">Clarity is the<br />whole product.</h2>
            <p className="lede mt-4 max-w-md">
              A consistent record for every address, a shortlist you control and an assistant that
              stays inside the data. No pressure, no invented claims.
            </p>
            <div className="mt-9 space-y-7">
              {WHY.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-brass shadow-card">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-[1.05rem] font-medium text-paper">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-brass/20 bg-night p-7 text-paper shadow-lift md:p-10">
            <p className="eyebrow">The buying process</p>
            <h2 className="display-md mt-5">From brief to keys,<br />without the guesswork.</h2>
            <div className="mt-9 space-y-1">
              {PROCESS.map((item) => (
                <div key={item.step} className="flex gap-5 border-t border-paper/10 py-6 first:border-t-0 first:pt-0">
                  <span className="font-display text-[1.9rem] leading-none text-brass-soft/45">{item.step}</span>
                  <div>
                    <h3 className="flex items-center gap-2 font-display text-[1.1rem]">
                      <item.icon className="size-4 text-brass-soft" /> {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-paper/55">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <ButtonLink href="/projects" variant="gold" size="sm">Start exploring</ButtonLink>
              <Link href="/faq" className="inline-flex h-9 items-center text-[0.78rem] font-semibold text-paper/70 transition hover:text-paper">
                Read the FAQs <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-night text-paper">
        <div className="shell py-20 md:py-28">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow">In their words</p>
              <h2 className="display-lg mt-5 text-paper">Quiet confidence,<br />from people who looked closely.</h2>
            </div>
            <p className="max-w-xs text-[0.72rem] leading-relaxed text-paper/45">
              Sample testimonials for this demonstration. They describe the intended experience,
              not real client outcomes.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={index * 80}>
                <figure className="flex h-full flex-col rounded-[16px] border border-paper/10 bg-paper/[0.035] p-6 transition duration-500 hover:border-brass/30 hover:bg-paper/[0.06]">
                  <Stars rating={testimonial.rating} />
                  <blockquote className="mt-4 flex-1 font-display text-[1.08rem] leading-relaxed text-paper/85">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-5 border-t border-paper/10 pt-4">
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    {testimonial.role && <p className="mt-0.5 text-[0.7rem] text-paper/45">{testimonial.role}</p>}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + lead */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Before you ask</p>
            <h2 className="display-lg mt-5">Questions,<br />answered plainly.</h2>
            <p className="lede mt-4 max-w-md">
              The short version on data, RERA, site visits and how the assistant works. More detail
              lives on the FAQ page.
            </p>
            <Accordion items={faqs.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }))} className="mt-8" />
            <Link href="/faq" className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brass-soft transition hover:text-brass">
              Read all FAQs <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
          </div>

          <div>
            <LeadForm
              heading="Tell us what you're looking for."
              description="Share a brief and the team will come back with a considered shortlist. This sample form stores requests locally in the project database."
              defaultType="CONTACT"
              source="homepage"
              defaults={{ name: user?.name, email: user?.email, phone: user?.phone ?? undefined }}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/location/noida" className="group rounded-[14px] border border-line bg-surface p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-brass/40">
                <MapPin className="size-4 text-brass" />
                <p className="mt-2.5 text-sm font-semibold">Noida</p>
                <p className="mt-0.5 text-[0.68rem] text-ink-muted">Established corridors</p>
              </Link>
              <Link href="/location/greater-noida" className="group rounded-[14px] border border-line bg-surface p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-brass/40">
                <Building2 className="size-4 text-brass" />
                <p className="mt-2.5 text-sm font-semibold">Greater Noida</p>
                <p className="mt-0.5 text-[0.68rem] text-ink-muted">Space to grow</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search band */}
      <section className="border-t border-line bg-surface/50">
        <div className="shell py-12 md:py-14">
          <form
            action="/projects"
            method="get"
            className="grid gap-5 rounded-[16px] border border-line bg-surface p-5 shadow-card md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] md:items-end md:gap-4 md:p-6"
          >
            <div>
              <label htmlFor="hero-location" className="field-label">Location</label>
              <select id="hero-location" name="location" className="field" defaultValue="">
                <option value="">All destinations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.slug}>{location.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="hero-type" className="field-label">Property</label>
              <select id="hero-type" name="propertyType" className="field" defaultValue="">
                <option value="">All asset classes</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            <div>
              <label htmlFor="hero-budget" className="field-label">Budget</label>
              <select id="hero-budget" name="budget" className="field" defaultValue="">
                <option value="">Any budget</option>
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option.label} value={`${option.min}-${option.max}`}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="hero-bhk" className="field-label">Configuration</label>
              <select id="hero-bhk" name="bhk" className="field" defaultValue="">
                <option value="">Any</option>
                {BHK_OPTIONS.map((bhk) => <option key={bhk} value={bhk}>{bhk} BHK</option>)}
              </select>
            </div>
            <button
              type="submit"
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-forest px-7 text-[0.8rem] font-semibold tracking-[0.02em] text-night transition-all duration-300 hover:-translate-y-0.5 hover:bg-brass-soft"
            >
              <Search className="size-4" /> Search
            </button>
          </form>
          <p className="mt-4 text-[0.62rem] leading-relaxed text-ink-muted">{SITE.demoDisclaimer}</p>
        </div>
      </section>

      {/* Contact strip */}
      <section className="border-t border-line bg-night">
        <div className="shell flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
          <div>
            <p className="eyebrow-plain">Still deciding?</p>
            <p className="mt-2 font-display text-[1.7rem] tracking-[-0.02em] text-paper">A human second opinion, whenever you need it.</p>
            <p className="mt-1.5 text-sm text-ink-muted">{SITE.hours} · {SITE.phone} · {SITE.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/contact" variant="primary">Contact us</ButtonLink>
            <ButtonLink href="/compare" variant="outline">Compare projects</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}


