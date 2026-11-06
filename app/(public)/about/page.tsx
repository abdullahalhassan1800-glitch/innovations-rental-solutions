import Image from "next/image";
import { ArrowRight, Compass, HeartHandshake, ShieldCheck, Sparkles, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { getProjectCounts, getPublishedTestimonials } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { Stars } from "@/components/ui/stars";

export const metadata = {
  title: "About Innovations",
  description:
    "Innovations is a demonstration real-estate discovery platform for Noida, Greater Noida, Noida Extension and Delhi NCR. Learn how the sample is structured and what is — and is not — verified.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: Compass,
    title: "Clarity over volume",
    copy: "Fewer, better-structured listings. The goal is a shortlist you can actually reason about, not an infinite feed.",
  },
  {
    icon: ShieldCheck,
    title: "Verification is explicit",
    copy: "We label sample data, avoid invented approvals and only show RERA details when a project record marks them verified.",
  },
  {
    icon: HeartHandshake,
    title: "The human stays in charge",
    copy: "AI helps with search and comparison. Decisions, visits and negotiations remain with you and the people you choose to speak to.",
  },
];

const TIMELINE = [
  { year: "2024", title: "A research habit", copy: "The project began as a structured way to compare NCR addresses without relying on listing noise." },
  { year: "2025", title: "A database-first prototype", copy: "Projects, developers, locations, amenities and floor plans were modelled as first-class records." },
  { year: "2026", title: "A full demonstration", copy: "Search, saved projects, inquiries, site visits, admin workflows and a multilingual assistant came together in this sample." },
];

export default async function AboutPage() {
  const [counts, testimonials] = await Promise.all([getProjectCounts(), getPublishedTestimonials(3)]);

  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell grid gap-10 py-12 md:py-18 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow">About Innovations</p>
            <h1 className="display-lg mt-4 balance">A quieter way to<br />look at property.</h1>
            <p className="lede mt-5 max-w-xl pretty">
              Innovations is a demonstration platform for exploring residential and commercial addresses
              across Noida, Greater Noida, Noida Extension and Delhi NCR. It is built around a simple
              belief: better decisions start with better-structured information.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/projects">Explore the collection <ArrowRight className="size-4" /></ButtonLink>
              <ButtonLink href="/contact" variant="outline">Talk to the team</ButtonLink>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Badge tone="brass">{counts.total} sample projects</Badge>
              <Badge>{counts.locations} locations</Badge>
              <Badge>{counts.developers} sample developers</Badge>
              <Badge tone="forest">Sample data only</Badge>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-line">
              <Image src="/images/exterior-3.jpg" alt="Demonstration residential architecture" fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 -left-4 max-w-[15rem] rounded-[14px] border border-line bg-surface p-4 shadow-card sm:-left-6">
              <p className="font-display text-[1.05rem] leading-snug">“The shortlist should feel considered, not crowded.”</p>
              <p className="mt-2 text-[0.65rem] uppercase tracking-[0.12em] text-ink-muted">Innovations design principle</p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-14 md:py-20">
        <SectionHeading
          eyebrow="What we believe"
          title="Three principles, applied consistently."
          description="These are the rules the demonstration is built around — from the database schema to the language used on every page."
        />
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-[14px] border border-line bg-surface p-6">
              <span className="flex size-10 items-center justify-center rounded-full bg-forest-soft text-night">
                <value.icon className="size-4" />
              </span>
              <h2 className="mt-4 font-display text-xl">{value.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{value.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-night text-paper">
        <div className="shell grid gap-10 py-14 md:py-20 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow text-brass-soft">How it came together</p>
            <h2 className="display-lg mt-4 text-paper">Built in the open,<br />labelled as a sample.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">
              This is not a brokerage, a marketplace or a claim of real inventory. It is a carefully
              engineered demonstration of how a modern property platform should behave.
            </p>
            <div className="mt-6 rounded-[14px] border border-brass/25 bg-brass/[0.07] p-4 text-[0.78rem] leading-relaxed text-paper/65">
              {SITE.demoDisclaimer}
            </div>
          </div>
          <div className="space-y-0">
            {TIMELINE.map((item) => (
              <div key={item.year} className="flex gap-6 border-t border-paper/10 py-6 first:border-t-0 first:pt-0">
                <span className="w-14 shrink-0 font-display text-2xl text-brass-soft/70">{item.year}</span>
                <div>
                  <h3 className="font-display text-xl">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-paper/55">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">The experience</p>
            <h2 className="display-lg mt-4">What you can actually do here.</h2>
            <p className="lede mt-4">
              Everything in the sample is connected: the database drives search, the assistant reads only
              from it, and your account keeps a private record of the projects and conversations you care about.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {[
                "Search and filter by location, budget, BHK, status, possession, amenities and developer.",
                "Save projects, compare up to three side by side and return to them from your dashboard.",
                "Submit inquiries and site-visit requests with validation, duplicate checks and rate limiting.",
                "Ask the assistant in English, Hindi or Hinglish, with optional voice input and spoken replies.",
                "Use the admin workspace to manage projects, developers, locations, leads and content.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-brass" /> {item}
                </li>
              ))}
            </ul>
            <ButtonLink href="/faq" variant="outline" className="mt-7">Read the FAQs</ButtonLink>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, value: "3", label: "User roles" },
              { icon: Compass, value: "4", label: "NCR corridors" },
              { icon: ShieldCheck, value: "0", label: "Invented RERA claims" },
              { icon: Sparkles, value: "3", label: "Assistant languages" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[14px] border border-line bg-surface p-6">
                <stat.icon className="size-5 text-brass" />
                <p className="mt-4 font-display text-4xl">{stat.value}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="border-t border-line bg-sand/35">
          <div className="shell py-14 md:py-20">
            <SectionHeading eyebrow="Sample voices" title="What the sample is trying to feel like." description="Illustrative testimonials, not real client outcomes." />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure key={testimonial.id} className="rounded-[14px] border border-line bg-surface p-6">
                  <Stars rating={testimonial.rating} />
                  <blockquote className="mt-3 font-display text-[1.06rem] leading-relaxed">“{testimonial.quote}”</blockquote>
                  <figcaption className="mt-4 border-t border-line pt-3 text-[0.78rem]">
                    <span className="font-semibold">{testimonial.name}</span>
                    {testimonial.role && <span className="text-ink-muted"> · {testimonial.role}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="shell py-12">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[14px] border border-line bg-surface p-7 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl">Have a question about the sample?</p>
            <p className="mt-1 text-sm text-ink-muted">Reach the Innovations team at {SITE.email} or {SITE.phone}.</p>
          </div>
          <div className="flex gap-3">
            <ButtonLink href="/contact">Contact</ButtonLink>
            <ButtonLink href="/projects" variant="outline">Browse projects</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

