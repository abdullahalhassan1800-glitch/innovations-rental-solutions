import { ArrowRight, CalendarClock, Compass, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/constants";

const HOW_WORKS = [
  {
    step: "01",
    title: "Choose Your Property",
    copy: "Browse premium residential projects curated for location, quality, and long-term value. Our team helps you shortlist options that match your goals.",
  },
  {
    step: "02",
    title: "Complete Documentation",
    copy: "Our experts handle the legal process so your paperwork stays clear, compliant, and hassle-free—from agreements to registrations.",
  },
  {
    step: "03",
    title: "Receive Rental Income",
    copy: "Start earning rental returns as per the investment model, with transparent scheduled payouts and professional rental management.",
  },
  {
    step: "04",
    title: "Build Wealth",
    copy: "Enjoy rental income while your property appreciates—creating lasting long-term wealth and a clear ownership pathway.",
  },
];

const SUPPORT = [
  { title: "Expert Guidance", copy: "Dedicated advisors support you at every stage of the journey." },
  { title: "Verified Process", copy: "Every step is documented with clear terms and legal compliance." },
  { title: "Faster Onboarding", copy: "Move from interest to investment without long waiting periods." },
];

export const metadata = {
  title: "How It Works | Housirentz Rental Investment",
  description:
    "A simple 4-step process to start earning rental income. Choose your property, complete documentation, receive rental income, and build wealth.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="eyebrow">Path Way Model</p>
            <h1 className="display-lg mt-4 balance">A simple 4-step process to start earning and building long-term wealth.</h1>
            <p className="lede mt-4 max-w-xl">
              From selecting a property to earning rental income, our process is designed to be transparent,
              compliant and hassle-free for every investor.
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-20 md:py-28">
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {HOW_WORKS.map((item, index) => (
            <div key={item.step} className="flex flex-col gap-4 rounded-[16px] border border-line bg-surface p-6 shadow-card">
              <span className="font-display text-[2rem] leading-none text-brass-soft/20">{item.step}</span>
              <h3 className="font-display text-xl leading-tight text-paper">{item.title}</h3>
              <p className="text-sm leading-relaxed text-ink-muted">{item.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {SUPPORT.map((item) => (
            <div key={item.title} className="rounded-[12px] border border-line bg-surface p-5 shadow-card">
              <h3 className="font-medium text-paper">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{item.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <ButtonLink href="/contact" variant="primary" size="lg" className="w-full md:w-auto">
            Get Free Consultation <ArrowRight className="ml-2 size-4" />
          </ButtonLink>
        </div>
      </section>

      <section className="border-y border-line bg-surface/50 py-20 md:py-28">
        <div className="shell">
          <SectionHeading
            eyebrow="Why Us"
            title="Stop Saving for Years. Start Earning from Real Estate Today."
            description="Unlike traditional property investment, our model helps you begin wealth creation without heavy upfront capital."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { title: "Zero Investment", copy: "Begin your real estate journey without locking large personal capital upfront." },
              { title: "No Down Payment", copy: "Skip the traditional down payment barrier and move forward with confidence." },
              { title: "Advance Rental Income", copy: "Start earning with rent paid in advance through our structured rental model." },
            ].map((item) => (
              <div key={item.title} className="rounded-[14px] border border-line bg-surface p-6 shadow-card">
                <h3 className="font-display text-lg leading-tight text-paper">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
