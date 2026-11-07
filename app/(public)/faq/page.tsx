import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

const FAQS = [
  {
    question: "Can I own property without down payment?",
    answer:
      "Yes. The Housirentz model is designed so eligible buyers can begin their property journey without a traditional down payment. Final eligibility and ownership pathway depend on the selected project and agreement terms.",
  },
  {
    question: "Is rental income guaranteed?",
    answer:
      "Rental income is structured as per the investment model and project agreement. While the model aims to provide regular rental returns, income is subject to the specific terms, project conditions, and applicable agreement—and should not be treated as an absolute guarantee.",
  },
  {
    question: "How is rental yield calculated?",
    answer:
      "Rental yield is generally calculated as annual rental income divided by the investment value, expressed as a percentage. For example, if annual rent is ₹2,70,000 on a ₹45,00,000 value, the yield is 5%. Actual yield depends on project terms.",
  },
  {
    question: "Is documentation transparent?",
    answer:
      "Yes. Housirentz focuses on clear, transparent documentation at every step—from property selection to agreements. Our team assists with paperwork so you understand the terms before you proceed.",
  },
  {
    question: "Can NRIs invest?",
    answer:
      "Yes. NRIs can participate in eligible Housirentz opportunities, subject to applicable regulations and documentation. Our advisors assist with the required process, paperwork, and onboarding for NRI buyers.",
  },
  {
    question: "Which cities are properties available in?",
    answer:
      "We currently offer curated projects across cities including Bangalore, Mangalore, Greater Noida West, and other locations through our builder partners. Visit the Properties page for the latest listings.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply reach out via our Contact page or WhatsApp. An advisor will understand your goals, suggest suitable properties, and guide you through the next steps.",
  },
];

export const metadata = {
  title: "FAQ | Housirentz Rental Investment",
  description:
    "Frequently asked questions about Housirentz rental investment — down payment, rental yield, NRI investment, documentation, and how to get started.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="eyebrow">Support</p>
            <h1 className="display-lg mt-4 balance">Frequently Asked Questions</h1>
            <p className="lede mt-4 max-w-xl">
              Clear answers to the questions investors ask most. Still have questions? Contact us for a free consultation.
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-20 md:py-28">
        <div className="mt-12 space-y-4 max-w-3xl">
          {FAQS.map((faq, index) => (
            <div key={faq.question} className="rounded-[12px] border border-line bg-surface p-6 shadow-card">
              <h3 className="font-medium text-paper">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
            </div>
          ))}
          <div className="mt-10 text-center">
            <ButtonLink href="/contact" variant="outline" size="lg" className="w-full md:w-auto">
              Still Have Questions? <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
