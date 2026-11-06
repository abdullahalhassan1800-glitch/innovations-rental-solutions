import Link from "next/link";
import { ArrowRight, HelpCircle, MessageCircle } from "lucide-react";
import { getPublishedFaqs } from "@/lib/queries";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Frequently asked questions",
  description:
    "Answers about Innovations's sample projects, pricing, RERA verification, site visits, saved projects, the AI assistant and privacy.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();
  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));
  const byCategory = categories.map((category) => ({
    category,
    items: faqs.filter((faq) => faq.category === category),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-line bg-surface/60">
        <div className="shell py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
            <div>
              <p className="eyebrow">Help centre</p>
              <h1 className="display-lg mt-4 balance">Questions,<br />answered plainly.</h1>
              <p className="lede mt-4 max-w-xl">
                Everything you need to know about the demonstration, the data, the assistant and how
                your information is handled.
              </p>
            </div>
            <div className="rounded-[14px] border border-line bg-surface p-5">
              <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <HelpCircle className="size-4 text-brass" /> Still unsure?
              </p>
              <p className="mt-2 text-sm text-ink-soft">Ask the assistant in the corner, or send the team a note.</p>
              <ButtonLink href="/contact" size="sm" className="mt-4 w-full">Contact the team</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow-plain">On this page</p>
            <nav aria-label="FAQ categories" className="mt-4 space-y-1">
              {byCategory.map((group) => (
                <a
                  key={group.category}
                  href={`#${group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="block border-b border-line py-2 text-[0.8rem] text-ink-soft transition hover:text-forest"
                >
                  {group.category} <span className="text-ink-muted">({group.items.length})</span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-10">
            {byCategory.map((group) => (
              <section key={group.category} id={group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-24">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl">{group.category}</h2>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <Accordion items={group.items.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }))} className="mt-4" />
              </section>
            ))}

            <div className="rounded-[14px] border border-line bg-night p-6 text-paper">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.14em] text-brass-soft">
                    <MessageCircle className="size-4" /> A real conversation
                  </p>
                  <p className="mt-2 font-display text-xl">Can&apos;t find your answer?</p>
                  <p className="mt-1 text-sm text-paper/55">Email {SITE.email} or call {SITE.phone}.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ButtonLink href="/contact" variant="gold" size="sm">Contact us</ButtonLink>
                  <ButtonLink href="/projects" variant="light" size="sm">Browse projects <ArrowRight className="size-3.5" /></ButtonLink>
                </div>
              </div>
            </div>

            <p className="text-[0.72rem] leading-relaxed text-ink-muted">
              {SITE.demoDisclaimer} Read the{" "}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-forest">privacy policy</Link>{" "}
              and{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-forest">terms</Link>{" "}
              for the full demonstration notice.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

