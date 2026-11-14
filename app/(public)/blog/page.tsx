import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

const BLOG_POSTS = [
  {
    slug: "rent-to-own-property-provider-in-india",
    title: "Rent to Own Property Provider in India: Own Your Dream Home with Housirentz",
    category: "investment",
    date: "23 Oct 2026",
    image: "/images/rentofree/c8d35d0a-rent-to-own-property-provider-in-india.webp",
    excerpt: "Housirentz is a reliable Rent to Own Property Provider in India that assists you in owning your dream home without having to worry about making a high down payment.",
  },
  {
    slug: "rent-to-own-property-provider-in-bangalore",
    title: "Rent to Own Property Provider in Bangalore – Own Your Home with Housirentz",
    category: "investment",
    date: "16 Oct 2026",
    image: "/images/rentofree/7adbc169-rent-to-own-property-provider-in-bangalore.webp",
    excerpt: "Housirentz is a trusted Rent to Own Property Provider in Bangalore, helping families and working professionals move into their dream homes without a large down payment or heavy EMIs.",
  },
  {
    slug: "real-estate-investment-for-rental-income-bangalore",
    title: "Renting Out a Flat in Bangalore: Where to Buy, What You'll Earn, and What Can Go Wrong",
    category: "investment",
    date: "10 Oct 2026",
    image: "/images/rentofree/0102b05c-real-estate-investment-for-rental-income-Bangalore.webp",
    excerpt: "A friend of mine once bought a flat near Whitefield because the builder's brochure promised 'assured returns.' Eight months later he was paying a full EMI, the flat was empty, and...",
  },
  {
    slug: "rental-property-investment",
    title: "Rental Property Investment: A Complete Guide to Building Passive Income",
    category: "investment",
    date: "06 Oct 2026",
    image: "/images/rentofree/cf704e6e-rental-property-investment.webp",
    excerpt: "Rental property investment includes purchasing of property for rent purpose to make periodic income and grow the asset value over time.",
  },
  {
    slug: "rental-income-property-in-mangalore",
    title: "Rental Income Property in Mangalore: Where Should You Invest for Better Returns?",
    category: "investment",
    date: "30 Sept 2026",
    image: "/images/rentofree/d9aca0e7-rental-income-property-in-mangalore.webp",
    excerpt: "Ask anyone who has rented out a flat in Mangalore and you'll hear the same thing: finding tenants isn't the hard part. Choosing the right locality is.",
  },
  {
    slug: "zero-investment-property",
    title: "Zero Investment Property: A Practical Way to Get Into Real Estate",
    category: "investment",
    date: "28 Sept 2026",
    image: "/images/rentofree/307da88a-zero-investment-property.webp",
    excerpt: "Most people assume property investing starts with a big cheque. A down payment, a loan, a few years of EMIs, and only then the first rent. That picture keeps a lot of capable investors out of the market.",
  },
  {
    slug: "high-rental-yield-property-in-india",
    title: "How to Choose a High Rental Yield Property in India",
    category: "investment",
    date: "23 Sept 2026",
    image: "/images/rentofree/b3560c77-rental-yield.png",
    excerpt: "Ask ten property buyers in India what they're looking for, and nine will say 'good appreciation potential.' Almost nobody leads with rent. That's a mistake.",
  },
  {
    slug: "nri-real-estate-investment-in-india",
    title: "NRI Real Estate Investment in India: How to Buy, Rent & Manage Property From Abroad",
    category: "investment",
    date: "21 Sept 2026",
    image: "/images/rentofree/a0ca2f5a-NRI-Real-Estate-Investment-in-India.png",
    excerpt: "Buying property in India while sitting in Dubai, London, or Toronto sounds daunting on paper, and honestly, a lot of NRIs put it off for years simply because they don't know where to start.",
  },
  {
    slug: "property-investment-for-rental-income",
    title: "Rental Income Properties for Sale — Start Investing Today",
    category: "investment",
    date: "21 Sept 2026",
    image: "/images/rentofree/15227176-d86e2aae-645c-4881-9e3c-34ccdc68a515.png",
    excerpt: "It is a specific form of regret that many of us have — the regret that one could have bought a flat five years ago when prices were lower.",
  },
  {
    slug: "zero-down-payment-property-investment",
    title: "Buy Property With Zero Down Payment Investment Plans",
    category: "investment",
    date: "19 Sept 2026",
    image: "/images/rentofree/58232db7-eed7e591-3a18-438e-8cfb-29beced6aa84.png",
    excerpt: "There's a specific moment a lot of aspiring investors hit: the numbers on a property look good, the location checks out, the math on rental returns makes sense — but then the down payment question arises.",
  },
  {
    slug: "rental-income-property-in-bangalore",
    title: "Buy Rental Income Property in Bangalore | Best Investment Deals",
    category: "investment",
    date: "17 Sept 2026",
    image: "/images/rentofree/21221072-ab25f0b7-79ef-4a97-9913-9a867c59c867.png",
    excerpt: "Bangalore doesn't really need an introduction anymore. It is the city wherein an overwhelming number of India's technology employees reside, wherein IT parks keep coming up along the Outer Ring Road.",
  },
  {
    slug: "property-investment-without-down-payment",
    title: "How to Invest in Real Estate Without Putting Up a Down Payment: The Comprehensive Guide",
    category: "investment",
    date: "16 Sept 2026",
    image: "/images/rentofree/ce6093dc-34b35243-61ad-44e5-b6b2-68ede3bdcf81.png",
    excerpt: "Ask most people why they haven't invested in real estate yet, and you'll hear some version of the same answer: 'I don't have enough saved for a down payment.' It's a fair answer — but it shouldn't be the end of the story.",
  },
];

export const metadata = {
  title: "Housirentz Blog | Rental Yield & Property Investing Guides",
  description:
    "Guides on Housirentz, rental yield, and smarter property investing. Learn about zero down payment, NRI investment, rental income properties and more.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <>
      <section className="border-b border-line bg-surface/60">
        <div className="shell py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="eyebrow">Blog</p>
            <h1 className="display-lg mt-4 balance">Housirentz Blog</h1>
            <p className="lede mt-4 max-w-xl">
              Guides on Housirentz, rental yield, and smarter property investing. From zero down payment to NRI
              investment, we cover what matters to rental investors.
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-20 md:py-28">
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="group block rounded-[16px] border border-line bg-surface shadow-card hover:border-brass/40 transition overflow-hidden">
              <Link href={`/blog/${post.slug}`} className="block">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="h-48 w-full object-cover opacity-85 transition group-hover:scale-[1.03] group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-night/30 to-night" />
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.14em] text-brass-soft mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" /> {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3" /> {post.category}
                  </span>
                </div>
                <Link href={`/blog/${post.slug}`} className="block">
                  <h3 className="font-display text-lg leading-tight text-paper group-hover:text-brass transition">{post.title}</h3>
                </Link>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{post.excerpt}</p>
                <a
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex items-center gap-2 text-[0.72rem] font-semibold text-brass transition hover:text-brass-soft"
                >
                  Read More <ArrowRight className="size-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="shell py-20 md:py-28 border-t border-line">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow text-brass-soft">Frequently Asked Questions</p>
          <h2 className="display-lg mt-4 balance text-paper">Clear answers to the questions investors ask most.</h2>
          <div className="mt-12 space-y-4">
            {[
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
                  "We currently offer curated projects across Noida, Delhi and NCR through our builder partners. Visit the Properties page for the latest listings.",
              },
              {
                question: "How do I get started?",
                answer:
                  "Simply reach out via our Contact page or WhatsApp. An advisor will understand your goals, suggest suitable properties, and guide you through the next steps.",
              },
            ].map((faq) => (
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
        </div>
      </section>
    </>
  );
}
