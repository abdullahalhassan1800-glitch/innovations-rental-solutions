import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Compass,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import { Stars } from "@/components/ui/stars";
import { Reveal } from "@/components/ui/reveal";
import { LeadModal } from "@/components/forms/lead-modal";
import { HeroMedia } from "@/components/home/hero-media";
import { HeroHeading } from "@/components/home/hero-heading";
import { RentalCalculator } from "@/components/home/rental-calculator";
import {
  getFeaturedProjects,
  getPublishedTestimonials,
  getSavedProjectIds,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Housirentz Innovations â€” Own Premium Property with Zero Investment",
  description:
    "Own premium property with zero investment â€” no down payment, rent paid in advance, and up to 5% rental yield. Verified residential projects across Mangalore, Bangalore, Bengaluru and Greater Noida West.",
  alternates: { canonical: "/" },
};

const TRUST = [
  {
    title: "Premium Builder",
    copy: "Quality developments from reputed partners",
  },
  {
    title: "Verified Project",
    copy: "Every listing screened for legal & rental fit",
  },
  {
    title: "Transparent Process",
    copy: "Clear steps from selection to payouts",
  },
  {
    title: "Legal Documentation",
    copy: "Compliant agreements & paperwork handled",
  },
];

const WHY_CARDS = [
  {
    title: "Zero Investment",
    copy: "Begin your real estate journey without locking large personal capital upfront.",
  },
  {
    title: "No Down Payment",
    copy: "Skip the traditional down payment barrier and move forward with confidence.",
  },
  {
    title: "Advance Rental Income",
    copy: "Start earning with rent paid in advance through our structured rental model.",
  },
  {
    title: "Premium Residential Properties",
    copy: "Access verified, premium residential projects from trusted builder partners.",
  },
  {
    title: "Long-Term Wealth Creation",
    copy: "Build lasting wealth with a clear path from rental income to future ownership.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Can I own property without down payment?",
    answer:
      "Yes. The Housirentz model is designed so eligible buyers can begin their property journey without a traditional down payment. Final eligibility and ownership pathway depend on the selected project and agreement terms.",
  },
  {
    question: "Is rental income guaranteed?",
    answer:
      "Rental income is structured as per the investment model and project agreement. While the model aims to provide regular rental returns, income is subject to the specific terms, project conditions, and applicable agreementâ€”and should not be treated as an absolute guarantee.",
  },
  {
    question: "How is rental yield calculated?",
    answer:
      "Rental yield is generally calculated as annual rental income divided by the investment value, expressed as a percentage. For example, if annual rent is â‚¹2,70,000 on a â‚¹45,00,000 value, the yield is 5%. Actual yield depends on project terms.",
  },
  {
    question: "Is documentation transparent?",
    answer:
      "Yes. Housirentz focuses on clear, transparent documentation at every stepâ€”from property selection to agreements. Our team assists with paperwork so you understand the terms before you proceed.",
  },
];

export default async function HomePage() {
  const [featured, testimonials, user] = await Promise.all([
    getFeaturedProjects(5),
    getPublishedTestimonials(3),
    getCurrentUser(),
  ]);

  const savedIds = new Set(await getSavedProjectIds(user?.id));

  return (
    <>
      {/* Hero */}
      <section
        data-ai-avoid
        className="relative flex min-h-[80svh] md:min-h-[92svh] flex-col justify-end overflow-hidden bg-night text-paper"
      >
        <HeroMedia />

        <div className="shell relative flex flex-1 flex-col justify-end pb-10 pt-28 md:pb-14">
          <div className="max-w-4xl animate-fade-up">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-brass/40 bg-brass/10 px-3.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-brass-soft backdrop-blur">
                <Sparkles className="size-3" /> Rental Yield Investment Model
              </span>
            </div>

            <HeroHeading />

            <p className="mt-4 max-w-xl text-[0.98rem] leading-[1.8] text-paper/65 pretty sm:mt-5">
              Own premium property with zero investment. Generate passive rental income while building long-term wealth
              through our unique Housirentz model.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8">
              <ButtonLink href="/properties" variant="primary" size="lg">
                Get Free Consultation <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/properties" variant="outline" size="lg">
                View Properties <ArrowRight className="size-4" />
              </ButtonLink>
              <LeadModal label="Private enquiry" size="lg" source="home-hero" className="border-paper/25 bg-transparent text-paper hover:border-brass-soft hover:bg-paper/[0.06] hover:text-brass-soft" />
            </div>

            <div className="mt-8 flex items-start gap-2 text-[0.65rem] text-paper/45">
              <div className="flex items-center gap-1.5">
                <X className="size-3.5 text-brass-soft" />
                <span>No Down Payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarClock className="size-3.5 text-brass-soft" />
                <span>Rent Paid in Advance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Investors */}
      <section className="border-b border-line bg-surface/50 py-16 md:py-20">
        <div className="shell py-8 md:py-12">
          <p className="eyebrow text-center">Confidence First</p>
          <h2 className="display-md mt-4 text-center balance">Trusted by Investors</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => (
              <div key={item.title} className="rounded-[14px] border border-line bg-surface p-6 text-center shadow-card">
                <h3 className="font-display text-lg mt-2 text-paper">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="shell py-20 md:py-28 grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div className="absolute -inset-4 rounded-[20px] border border-brass/20" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-paper/10 bg-night shadow-float">
            <Image
              src="/images/rentofree/about-team.webp"
              alt="Housirentz team collaborating"
              fill
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-brass-soft">Who We Are</p>
              <h3 className="mt-2 max-w-xs font-display text-[1.3rem] leading-snug text-paper">
                Housrentz Innovations Pvt. Ltd.
              </h3>
              <Image
                src="/images/Who We Are.png"
                alt="Who We Are"
                width={800}
                height={600}
                className="mt-4 rounded-md border border-line/80"
                priority
              />
            <div>
              <h3 className="mt-2 max-w-xs font-display text-[1.3rem] leading-snug text-paper">
                Housirentz Innovations Pvt. Ltd.
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <p className="eyebrow">About Housirentz</p>
          <h2 className="display-lg mt-4 balance">Making Rental Investing Accessible</h2>
          <p className="lede mt-4 max-w-xl">
            Housirentz Innovations is a company focused on making rental investing more accessible, transparent and
            convenient for investors. Housirentz operates as the digital platform through which we connect investors with
            verified rental property opportunities, secure agreements and professional rental management services.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <Compass className="mt-0.5 size-4 shrink-0 text-brass" />
              <div>
                <p className="font-medium text-paper">Mission</p>
                <p className="mt-1 text-sm text-ink-muted">Make rental investing accessible, transparent and rewarding.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 size-4 shrink-0 text-brass" />
              <div>
                <p className="font-medium text-paper">Vision</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Become India&rsquo;s most trusted rental investment platform.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-brass" />
              <div>
                <p className="font-medium text-paper">Experience</p>
                <p className="mt-1 text-sm text-ink-muted">
                  12+ years guiding investors across major Indian cities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="shell py-20 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow">Benefits</p>
            <h2 className="display-lg mt-4 balance">Why Investors Love This Model</h2>
            <p className="lede mt-4 max-w-xl">
              A smarter way to earn rental income and build long-term wealthâ€”without heavy upfront capital.
            </p>
          </div>
          <div className="flex gap-3">
            <ButtonLink href="/properties" variant="outline" size="sm">
              View Properties <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="sm">
              Get Free Consultation <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {WHY_CARDS.map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <div className="rounded-[14px] border border-line bg-surface p-6 shadow-card hover:border-brass/40 transition">
                <h3 className="font-display text-lg leading-tight text-paper">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center">
          <ButtonLink href="/properties" variant="primary" size="lg" className="w-full md:w-auto">
            See These Benefits in Action <ArrowRight className="ml-2 size-4" />
          </ButtonLink>
        </div>
      </section>

      {/* Rental Calculator */}
      <RentalCalculator />

      {/* Available Properties */}
      <section className="border-y border-line bg-surface/50 py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Available Properties"
            title={<>Curated, verified assets ready for investment.</>}
            description="Explore verified properties and talk to an advisor about your goals."
            action={{ label: "View All Properties", href: "/properties" }}
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project, index) => (
              <Reveal key={project.id} delay={index * 80}>
                <Link href={`/projects/${project.slug}`} className="group block">
                  <ProjectCard project={project} saved={savedIds.has(project.id)} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Traditional vs Housirentz */}
      <section className="bg-night gradient-purple-b text-paper py-20 md:py-28">
        <div className="shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow text-brass-soft">Traditional vs Housirentz</p>
              <h2 className="display-lg mt-4 text-paper balance">A Clearer Path Into Real Estate</h2>
              <p className="text-sm leading-relaxed text-paper/60 max-w-xl">
                Traditional buying often means high down payments, heavy EMIs, and delayed returns. Housirentz is designed
                to lower the entry barrier while opening the door to rental income sooner.
              </p>
            </div>
          </div>

          <div className="mt-10 overflow-x-auto rounded-[16px] border border-line bg-surface shadow-card">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line text-[0.62rem] uppercase tracking-[0.16em] text-paper/50">
                  <th className="px-5 py-4">Comparison Point</th>
                  <th className="px-5 py-4 text-right">Traditional Buying</th>
                  <th className="px-5 py-4 text-right font-semibold text-brass">Housirentz</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line/70 last:border-0">
                  <td className="px-5 py-4 text-sm text-paper/80">Down Payment</td>
                  <td className="px-5 py-4 text-sm text-right text-paper">High down payment</td>
                  <td className="px-5 py-4 text-sm text-right font-semibold text-brass">Zero down payment</td>
                </tr>
                <tr className="border-b border-line/70 last:border-0">
                  <td className="px-5 py-4 text-sm text-paper/80">Monthly Commitment</td>
                  <td className="px-5 py-4 text-sm text-right text-paper">Huge EMI burden</td>
                  <td className="px-5 py-4 text-sm text-right font-semibold text-brass">Flexible investment structure</td>
                </tr>
                <tr className="border-b border-line/70 last:border-0">
                  <td className="px-5 py-4 text-sm text-paper/80">Returns</td>
                  <td className="px-5 py-4 text-sm text-right text-paper">Delayed returns</td>
                  <td className="px-5 py-4 text-sm text-right font-semibold text-brass">Rental income opportunity</td>
                </tr>
                <tr className="border-b border-line/70 last:border-0">
                  <td className="px-5 py-4 text-sm text-paper/80">Entry Barrier</td>
                  <td className="px-5 py-4 text-sm text-right text-paper">High capital requirement</td>
                  <td className="px-5 py-4 text-sm text-right font-semibold text-brass">Low entry barrier</td>
                </tr>
                <tr className="border-b border-line/70 last:border-0">
                  <td className="px-5 py-4 text-sm text-paper/80">Process Speed</td>
                  <td className="px-5 py-4 text-sm text-right text-paper">Long waiting period</td>
                  <td className="px-5 py-4 text-sm text-right font-semibold text-brass">Faster investment process</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4 px-5 py-3 text-[0.62rem] leading-relaxed text-paper/50">
              Subject to project eligibility, documentation, and applicable agreement terms.
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center">
            <ButtonLink href="/contact" variant="outline" size="lg" className="w-full md:w-auto">
              Get Free Consultation <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="shell py-20 md:py-28">
        <SectionHeading
          eyebrow="Support"
          title={<>Frequently Asked Questions</>}
          description="Clear answers to the questions investors ask most."
          action={{ label: "Read All FAQs", href: "/blog#faqs" }}
        />
        <div className="mt-12 space-y-4 max-w-3xl">
          {FAQ_ITEMS.map((faq) => (
            <div key={faq.question} className="rounded-[12px] border border-line bg-surface p-5 shadow-card">
              <h3 className="font-medium text-paper">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
            </div>
          ))}
          <div className="mt-8 text-center">
            <ButtonLink href="/blog#faqs" variant="outline">
              Still Have Questions? <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-night gradient-purple-b text-paper py-20 md:py-28">
        <div className="shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow text-brass-soft">What Investors Say</p>
              <h2 className="display-lg mt-4 text-paper balance">Real experiences from people who chose Housirentz.</h2>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 80}>
                <figure className="flex h-full flex-col rounded-[16px] border border-paper/10 bg-paper/[0.035] p-6 transition duration-500 hover:border-brass/30 hover:bg-paper/[0.06]">
                  <Stars rating={testimonial.rating} />
                  <blockquote className="mt-4 flex-1 font-display text-[1.08rem] leading-relaxed text-paper/85">
                    â€œ{testimonial.quote}â€
                  </blockquote>
                  <figcaption className="mt-5 border-t border-paper/10 pt-4">
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    {testimonial.role && (
                      <p className="mt-0.5 text-[0.7rem] text-paper/45">{testimonial.role}</p>
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center">
            <ButtonLink href="/contact" variant="outline" size="lg" className="w-full md:w-auto">
              Ready to Build Your Second Income? <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}






