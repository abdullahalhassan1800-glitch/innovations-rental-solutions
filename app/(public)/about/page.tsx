import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPublishedTestimonials } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { Stars } from "@/components/ui/stars";

export const metadata = {
  title: "About Housirentz | Rental Investment Platform",
  description:
    "Why choose Housirentz — zero investment, no down payment, advance rental income, premium residential properties and long-term wealth creation.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const testimonials = await getPublishedTestimonials(3);

  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="eyebrow">Why Choose Housirentz</p>
            <h1 className="display-lg mt-4 balance">Stop Saving for Years.<br />Start Earning from Real Estate Today.</h1>
            <p className="lede mt-4 max-w-xl">
              Unlike traditional property investment, our model helps you begin wealth creation without heavy upfront
              capital.
            </p>
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

      <section className="bg-night text-paper py-20 md:py-28">
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
    </>
  );
}
