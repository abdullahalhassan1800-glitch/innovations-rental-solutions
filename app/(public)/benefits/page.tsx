import { ArrowRight, CalendarClock, Compass, ShieldCheck, TrendingUp, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

const BENEFITS = [
  {
    title: "Up to 5% Rental Yield",
    copy: "Enjoy regular passive income through structured rental returns.",
    icon: TrendingUp,
  },
  {
    title: "Zero Initial Investment",
    copy: "Own property without blocking your savings in heavy upfront capital.",
    icon: X,
  },
  {
    title: "No Down Payment",
    copy: "Start your investment journey easily without traditional down payment barriers.",
    icon: CalendarClock,
  },
  {
    title: "Wealth Appreciation",
    copy: "Benefit from increasing property values over time while you earn rental income.",
    icon: TrendingUp,
  },
  {
    title: "Secure Investment",
    copy: "Invest in properties from reputed developers with verified project credentials.",
    icon: ShieldCheck,
  },
  {
    title: "Professional Support",
    copy: "Get complete documentation and investment assistance from our expert team.",
    icon: Compass,
  },
];

export const metadata = {
  title: "Benefits | Rental Investment with Housirentz",
  description:
    "Why investors love the Housirentz model — up to 5% rental yield, zero investment, no down payment, wealth appreciation, secure investment and professional support.",
  alternates: { canonical: "/benefits" },
};

export default function BenefitsPage() {
  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="eyebrow">Benefits</p>
            <h1 className="display-lg mt-4 balance">Why Investors Love This Model</h1>
            <p className="lede mt-4 max-w-xl">
              A smarter way to earn rental income and build long-term wealth—without heavy upfront capital.
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-20 md:py-28">
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <div key={benefit.title} className="rounded-[14px] border border-line bg-surface p-6 shadow-card">
              <benefit.icon className="mb-4 size-6 text-brass" />
              <h3 className="font-display text-lg leading-tight text-paper">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{benefit.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex items-center justify-center">
          <ButtonLink href="/properties" variant="outline" size="lg" className="w-full md:w-auto">
            See These Benefits in Action <ArrowRight className="ml-2 size-4" />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
