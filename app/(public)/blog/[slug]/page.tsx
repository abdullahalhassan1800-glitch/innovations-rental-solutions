import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/section-heading";

const BLOG_POSTS: Record<string, {
  title: string;
  category: string;
  date: string;
  image: string;
  content: string[];
}> = {
  "rent-to-own-property-provider-in-india": {
    title: "Rent to Own Property Provider in India: Own Your Dream Home with Housirentz",
    category: "investment",
    date: "23 Oct 2026",
    image: "/images/rentofree/c8d35d0a-rent-to-own-property-provider-in-india.webp",
    content: [
      "Housirentz is a reliable Rent to Own Property Provider in India that assists you in owning your dream home without having to worry about making a high down payment.",
      "With the Rent to Own model, you can move into your dream home now and gradually build ownership through structured rental payments.",
      "Our team guides you through documentation, legal verification and a clear path to full ownership.",
    ],
  },
  "rent-to-own-property-provider-in-bangalore": {
    title: "Rent to Own Property Provider in Bangalore – Own Your Home with Housirentz",
    category: "investment",
    date: "16 Oct 2026",
    image: "/images/rentofree/7adbc169-rent-to-own-property-provider-in-bangalore.webp",
    content: [
      "Housirentz is a trusted Rent to Own Property Provider in Bangalore, helping families and working professionals move into their dream homes without a large down payment or heavy EMIs.",
      "Bangalore's property market is competitive, but our Rent to Own model lowers the entry barrier significantly.",
      "Choose from verified residential projects across Bangalore with structured rental-to-own pathways.",
    ],
  },
  "real-estate-investment-for-rental-income-bangalore": {
    title: "Renting Out a Flat in Bangalore: Where to Buy, What You'll Earn, and What Can Go Wrong",
    category: "investment",
    date: "10 Oct 2026",
    image: "/images/rentofree/0102b05c-real-estate-investment-for-rental-income-Bangalore.webp",
    content: [
      "A friend of mine once bought a flat near Whitefield because the builder's brochure promised 'assured returns.' Eight months later he was paying a full EMI, the flat was empty, and the rental income never materialized.",
      "This story is common in Bangalore's rental market. Location, tenant demand and property quality matter more than promises.",
      "Housirentz helps you identify verified projects with genuine rental yield potential, not marketing hype.",
    ],
  },
  "rental-property-investment": {
    title: "Rental Property Investment: A Complete Guide to Building Passive Income",
    category: "investment",
    date: "06 Oct 2026",
    image: "/images/rentofree/cf704e6e-rental-property-investment.webp",
    content: [
      "Rental property investment includes purchasing of property for rent purpose to make periodic income and grow the asset value over time.",
      "The key metrics to evaluate are rental yield, location appreciation potential, tenant demand and total cost of ownership.",
      "With Housirentz, you get verified projects where documentation and rental structure are transparent from day one.",
    ],
  },
  "rental-income-property-in-mangalore": {
    title: "Rental Income Property in Mangalore: Where Should You Invest for Better Returns?",
    category: "investment",
    date: "30 Sept 2026",
    image: "/images/rentofree/d9aca0e7-rental-income-property-in-mangalore.webp",
    content: [
      "Ask anyone who has rented out a flat in Mangalore and you'll hear the same thing: finding tenants isn't the hard part. Choosing the right locality is.",
      "Mangalore's rental market is driven by colleges, hospitals and IT parks. Proximity to these hubs determines rental demand.",
      "Our Signature project in Mangalore offers verified residential investment with 5% rental yield potential.",
    ],
  },
  "zero-investment-property": {
    title: "Zero Investment Property: A Practical Way to Get Into Real Estate",
    category: "investment",
    date: "28 Sept 2026",
    image: "/images/rentofree/307da88a-zero-investment-property.webp",
    content: [
      "Most people assume property investing starts with a big cheque. A down payment, a loan, a few years of EMIs, and only then the first rent.",
      "That picture keeps a lot of capable investors out of the market. But what if you could start without locking up your savings?",
      "Housirentz's Zero Investment model lets you begin your real estate journey without heavy upfront capital.",
    ],
  },
  "high-rental-yield-property-in-india": {
    title: "How to Choose a High Rental Yield Property in India",
    category: "investment",
    date: "23 Sept 2026",
    image: "/images/rentofree/b3560c77-rental-yield.png",
    content: [
      "Ask ten property buyers in India what they're looking for, and nine will say 'good appreciation potential.' Almost nobody leads with rent. That's a mistake, because appreciation takes years while rent starts immediately.",
      "High rental yield means your property generates meaningful monthly income relative to its purchase price.",
      "Look for locations with tenant demand, verified builders and transparent rental structures — all available through Housirentz.",
    ],
  },
  "nri-real-estate-investment-in-india": {
    title: "NRI Real Estate Investment in India: How to Buy, Rent & Manage Property From Abroad",
    category: "investment",
    date: "21 Sept 2026",
    image: "/images/rentofree/a0ca2f5a-NRI-Real-Estate-Investment-in-India.png",
    content: [
      "Buying property in India while sitting in Dubai, London, or Toronto sounds daunting on paper, and honestly, a lot of NRIs put it off for years simply because they don't know where to start.",
      "The biggest concerns for NRIs are documentation, legal compliance, tenant management and repatriation of rental income.",
      "Housirentz advisors assist NRIs with required paperwork, property verification and onboarding — remotely if needed.",
    ],
  },
  "property-investment-for-rental-income": {
    title: "Rental Income Properties for Sale — Start Investing Today",
    category: "investment",
    date: "21 Sept 2026",
    image: "/images/rentofree/15227176-d86e2aae-645c-4881-9e3c-34ccdc68a515.png",
    content: [
      "It is a specific form of regret that many of us have — the regret that one could have bought a flat five years ago when prices were lower and rental demand was rising.",
      "But the best time to start is now. Rental income properties combine monthly cash flow with long-term appreciation.",
      "Explore Housirentz's verified rental properties and speak with an advisor about your goals.",
    ],
  },
  "zero-down-payment-property-investment": {
    title: "Buy Property With Zero Down Payment Investment Plans",
    category: "investment",
    date: "19 Sept 2026",
    image: "/images/rentofree/58232db7-eed7e591-3a18-438e-8cfb-29beced6aa84.png",
    content: [
      "There's a specific moment a lot of aspiring investors hit: the numbers on a property look good, the location checks out, the math on rental returns makes sense — but then the down payment question arises.",
      "Traditional property buying requires 20%+ down payment, which locks most people out of the market.",
      "Housirentz's Zero Down Payment model removes that barrier entirely.",
    ],
  },
  "rental-income-property-in-bangalore": {
    title: "Buy Rental Income Property in Bangalore | Best Investment Deals",
    category: "investment",
    date: "17 Sept 2026",
    image: "/images/rentofree/21221072-ab25f0b7-79ef-4a97-9913-9a867c59c867.png",
    content: [
      "Bangalore doesn't really need an introduction anymore. It is the city wherein an overwhelming number of India's technology employees reside, wherein IT parks keep coming up along the Outer Ring Road.",
      "Rental demand in Bangalore is consistent, driven by IT professionals, students and relocating families.",
      "Housirentz lists verified Bangalore properties with rental yield potential and professional management support.",
    ],
  },
  "property-investment-without-down-payment": {
    title: "How to Invest in Real Estate Without Putting Up a Down Payment: The Comprehensive Guide",
    category: "investment",
    date: "16 Sept 2026",
    image: "/images/rentofree/ce6093dc-34b35243-61ad-44e5-b6b2-68ede3bdcf81.png",
    content: [
      "Ask most people why they haven't invested in real estate yet, and you'll hear some version of the same answer: 'I don't have enough saved for a down payment.' It's a fair answer — but it shouldn't be the end of the story.",
      "There are legitimate structures that let you enter property investment without traditional down payment barriers.",
      "Housirentz specializes in these alternative investment pathways with verified builder partners.",
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];
  if (!post) return { title: "Blog post not found" };
  return {
    title: `${post.title} | Housirentz Blog`,
    description: post.content[0],
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS[slug];

  if (!post) notFound();

  return (
    <article className="shell py-20 md:py-28 max-w-2xl mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
        <div>
          <p className="eyebrow text-brass-soft">Blog</p>
          <h1 className="display-lg mt-4 text-paper">{post.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-muted">
          <Clock className="size-3.5" /> {post.date}
          <span className="w-px h-3 bg-line mx-2" aria-hidden />
          <User className="size-3.5" /> {post.category}
        </div>
      </div>

      <Image
        src={post.image}
        alt={post.title}
        className="w-full h-64 object-cover rounded-[16px] border border-line mb-8 shadow-card"
        sizes="(max-width: 768px) 100vw, 720px"
      />

      <div className="prose prose-paper max-w-none text-sm lg:text-base leading-relaxed">
        {post.content.map((paragraph, i) => (
          <p key={i} className="mb-6 text-ink-soft">{paragraph}</p>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-line flex items-center justify-between gap-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brass hover:text-brass-soft transition"
        >
          <ArrowLeft className="size-4" /> Back to Blog
        </Link>
        <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-brass hover:text-brass-soft transition">
          Talk to Advisor <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
