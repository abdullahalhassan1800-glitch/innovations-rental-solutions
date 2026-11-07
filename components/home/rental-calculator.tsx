"use client";

import { useState } from "react";
import { ArrowRight, Calendar, Percent, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function RentalCalculator() {
  const [investment, setInvestment] = useState("");
  const [yieldPercent, setYieldPercent] = useState("5");
  const [calculated, setCalculated] = useState<{ annual: number; monthly: number } | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = parseFloat(investment);
    const yld = parseFloat(yieldPercent);
    if (!inv || !yld) return;
    const annual = (inv * yld) / 100;
    setCalculated({ annual, monthly: annual / 12 });
  };

  return (
    <section className="bg-night text-paper py-20 md:py-28">
      <div className="shell grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <p className="eyebrow">Calculate Your Rental Income</p>
          <h2 className="display-lg mt-4 text-paper">Estimate your expected income.</h2>
          <p className="text-sm leading-relaxed text-paper/60">
            Enter your investment value and expected rental yield to estimate annual and monthly rental income.
          </p>
        </div>

        <div className="rounded-[18px] border border-brass/20 bg-surface p-8 md:p-12 shadow-card">
          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-paper/70">
                  Investment Value
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3 size-4 text-paper/50" />
                  <input
                    type="number"
                    name="investment"
                    className="w-full pl-10 rounded border border-brass/30 bg-night px-4 py-3 text-paper focus:border-brass outline-none"
                    placeholder="e.g. 4500000"
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-[0.6rem] text-paper/45">
                  ₹45,00,000 sample value → ₹2,25,000 annual at 5%
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-paper/70">
                  Rental Yield %
                </label>
                <div className="relative">
                  <Percent className="absolute left-4 top-3 size-4 text-paper/50" />
                  <input
                    type="number"
                    name="yield"
                    className="w-full pl-10 rounded border border-brass/30 bg-night px-4 py-3 text-paper focus:border-brass outline-none"
                    placeholder="5"
                    value={yieldPercent}
                    onChange={(e) => setYieldPercent(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-[0.6rem] text-paper/45">
                  Up to 5% yield on verified projects
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full md:w-auto items-center justify-center gap-2 rounded-full bg-brass text-night px-7 py-3 text-[0.8rem] font-semibold tracking-[0.02em] transition-all hover:bg-brass-soft"
            >
              Calculate Income <ArrowRight className="ml-2 size-4" />
            </button>

            {calculated && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 border border-brass/20 rounded-[14px] p-6 bg-surface/50">
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-paper/50">
                    Expected Annual Income
                  </p>
                  <p className="mt-1 font-display text-2xl text-brass">{`₹${calculated.annual.toLocaleString("en-IN")}`}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-paper/50">
                    Expected Monthly Income
                  </p>
                  <p className="mt-1 font-display text-2xl text-brass">{`₹${Math.round(calculated.monthly).toLocaleString("en-IN")}`}</p>
                </div>
              </div>
            )}

            <p className="mt-2 text-[0.65rem] leading-relaxed text-paper/50">
              Estimates only. Actual rental income depends on project terms, occupancy and agreement conditions.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
