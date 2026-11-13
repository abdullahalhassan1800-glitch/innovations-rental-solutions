import Image from "next/image";
import { ArrowRight, Compass, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { getProjectCounts, getPublishedTestimonials } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { Stars } from "@/components/ui/stars";

const VALUES = [
  {
    icon: Compass,
    title: "Premium Builder",
    copy: "Quality developments from reputed partners",
  },
  {
    icon: ShieldCheck,
    title: "Verified Project",
    copy: "Every listing screened for legal & rental fit",
  },
  {
    icon: HeartHandshake,
    title: "Transparent Process",
    copy: "Clear steps from selection to payouts",
  },
  {
    icon: Users,
    title: "Legal Documentation",
    copy: "Compliant agreements & paperwork handled",
  },
];

export const metadata = {
  title: "About Housirentz | Rental Investment Platform",
  description:
    "Why choose Housirentz — zero investment, no down payment, advance rental income, premium residential properties and long-term wealth creation.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [counts, testimonials] = await Promise.all([getProjectCounts(), getPublishedTestimonials(3)]);

  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="eyebrow">About Housirentz</p>
            <h1 className="display-lg mt-4 balance">Making Rental Investing Accessible</h1>
            <p className="lede mt-5 max-w-xl pretty">
              Housirentz Innovations Pvt. Ltd. is a company focused on making rental investing more accessible,
              transparent and convenient for investors. Housirentz operates as the digital platform through which we
              connect investors with verified rental property opportunities, secure agreements, and professional rental
              management services.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/properties">View Properties <ArrowRight className="size-4" /></ButtonLink>
              <ButtonLink href="/contact" variant="outline">Talk to the team</ButtonLink>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Badge tone="brass">{counts.total} verified properties</Badge>
              <Badge>{counts.locations} locations</Badge>
              <Badge>{counts.developers} builder partners</Badge>
              <Badge tone="forest">Rental yield up to 5%</Badge>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-line">
              <Image src="/images/rentofree/about-team.webp" alt="Housirentz team collaborating" fill sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 -left-4 max-w-[15rem] rounded-[14px] border border-line bg-surface p-4 shadow-card sm:-left-6">
              <p className="font-display text-[1.05rem] leading-snug">“Rental investing made accessible, transparent and rewarding.”</p>
              <p className="mt-2 text-[0.65rem] uppercase tracking-[0.12em] text-ink-muted">Housirentz mission</p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-20 md:py-28">
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { title: "Zero Investment", copy: "Begin your real estate journey without locking large personal capital upfront." },
            { title: "No Down Payment", copy: "Skip the traditional down payment barrier and move forward with confidence." },
            { title: "Advance Rental Income", copy: "Start earning with rent paid in advance through our structured rental model." },
            { title: "Premium Residential Properties", copy: "Access verified, premium residential projects from trusted builder partners." },
            { title: "Long-Term Wealth Creation", copy: "Build lasting wealth with a clear path from rental income to future ownership." },
          ].map((item) => (
            <div key={item.title} className="rounded-[14px] border border-line bg-surface p-6 shadow-card">
              <h3 className="font-display text-lg leading-tight text-paper">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-night gradient-purple-b text-paper py-20 md:py-28">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow text-brass-soft">Traditional vs Housirentz</p>
              <h2 className="display-md mt-4 text-paper">A Clearer Path Into Real Estate</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-paper/60">
                Traditional buying often means high down payments, heavy EMIs, and delayed returns. Housirentz is
                designed to lower the entry barrier while opening the door to rental income sooner.
              </p>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] border border-line bg-surface">
                <Image
                  src="/images/rentofree/hero-building.webp"
                  alt="Premium residential property"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-night/40 to-night" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-brass-soft">Premium residential property</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-20 md:py-28">
        <div className="overflow-x-auto rounded-[16px] border border-line bg-surface shadow-card">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted">
                <th className="px-5 py-4">Comparison Point</th>
                <th className="px-5 py-4 text-right font-semibold text-brass">Housirentz</th>
                <th className="px-5 py-4 text-right">Traditional Buying</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line/70 last:border-0">
                <td className="px-5 py-4 text-sm text-ink-soft">Down Payment</td>
                <td className="px-5 py-4 text-sm text-right font-semibold text-brass">Zero down payment</td>
                <td className="px-5 py-4 text-sm text-right text-ink-soft">High down payment</td>
              </tr>
              <tr className="border-b border-line/70 last:border-0">
                <td className="px-5 py-4 text-sm text-ink-soft">Monthly Commitment</td>
                <td className="px-5 py-4 text-sm text-right font-semibold text-brass">Flexible investment structure</td>
                <td className="px-5 py-4 text-sm text-right text-ink-soft">Huge EMI burden</td>
              </tr>
              <tr className="border-b border-line/70 last:border-0">
                <td className="px-5 py-4 text-sm text-ink-soft">Returns</td>
                <td className="px-5 py-4 text-sm text-right font-semibold text-brass">Rental income opportunity</td>
                <td className="px-5 py-4 text-sm text-right text-ink-soft">Delayed returns</td>
              </tr>
              <tr className="border-b border-line/70 last:border-0">
                <td className="px-5 py-4 text-sm text-ink-soft">Entry Barrier</td>
                <td className="px-5 py-4 text-sm text-right font-semibold text-brass">Low entry barrier</td>
                <td className="px-5 py-4 text-sm text-right text-ink-soft">High capital requirement</td>
              </tr>
              <tr className="border-b border-line/70 last:border-0">
                <td className="px-5 py-4 text-sm text-ink-soft">Process Speed</td>
                <td className="px-5 py-4 text-sm text-right font-semibold text-brass">Faster investment process</td>
                <td className="px-5 py-4 text-sm text-right text-ink-soft">Long waiting period</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 px-5 py-3 text-[0.62rem] leading-relaxed text-ink-muted">
            Subject to project eligibility, documentation, and applicable agreement terms.
          </p>
        </div>
      </section>

      <div className="shell py-20 md:py-28">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="eyebrow">Ready to Explore Housirentz?</p>
          <h3 className="font-display text-2xl text-paper">Get a free consultation and see if this model fits your goals.</h3>
          <ButtonLink href="/contact" variant="primary" size="lg" className="w-full md:w-auto">
            Get Free Consultation <ArrowRight className="ml-2 size-4" />
          </ButtonLink>
          <p className="mt-3 text-[0.65rem] text-ink-muted">
            WhatsApp available on {SITE.whatsapp} · Email: {SITE.email}
          </p>
        </div>
      </div>

      <section className="shell py-14 md:py-20">
        <SectionHeading
          eyebrow="Trust pillars"
          title="Four pillars of trust."
          description="Every project we list goes through our verification framework."
        />
        <div className="mt-9 grid gap-4 md:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-[14px] border border-line bg-surface p-6 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-brass/10 text-brass mb-3">
                <value.icon className="size-4" />
              </span>
              <h2 className="mt-2 font-display text-lg">{value.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{value.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">Our Story</p>
            <h2 className="display-lg mt-4">Who We Are</h2>
            <p className="lede mt-4 max-w-xl">
              Housirentz Innovations Pvt. Ltd. is focused on making rental investing more accessible, transparent and
              convenient for investors. We combine real-estate expertise with a modern digital experience to help
              investors participate in rental assets with greater clarity and confidence.
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Compass className="mt-0.5 size-4 shrink-0 text-brass" />
                <div>
                  <p className="font-medium text-paper">Mission</p>
                  <p className="mt-1 text-sm text-ink-muted">Make rental investing accessible, transparent and rewarding.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brass" />
                <div>
                  <p className="font-medium text-paper">Vision</p>
                  <p className="mt-1 text-sm text-ink-muted">Become India&rsquo;s most trusted rental investment platform.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-brass" />
                <div>
                  <p className="font-medium text-paper">Experience</p>
                  <p className="mt-1 text-sm text-ink-muted">12+ years guiding investors across major Indian cities.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, value: "5+", label: "Verified projects" },
              { icon: Compass, value: "4", label: "Cities covered" },
              { icon: ShieldCheck, value: "100%", label: "Legal documentation" },
              { icon: ArrowRight, value: "12+", label: "Years experience" },
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
            <SectionHeading eyebrow="What Investors Say" title="Real experiences." description="Illustrative testimonials from Housirentz investors." />
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
            <p className="font-display text-2xl">Have a question about rental investing?</p>
            <p className="mt-1 text-sm text-ink-muted">Reach the Housirentz team at {SITE.email} or {SITE.phone}.</p>
          </div>
          <div className="flex gap-3">
            <ButtonLink href="/contact">Contact</ButtonLink>
            <ButtonLink href="/properties" variant="outline">Browse properties</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
