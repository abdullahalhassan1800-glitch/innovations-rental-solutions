export const SITE = {
  name: "Housirentz Innovations",
  legalName: "Housirentz Innovations Pvt. Ltd.",
  tagline: "Own Premium Property with Zero Investment.",
  description:
    "Housirentz Innovations Pvt. Ltd. helps you own premium property with zero investment — no down payment, rent paid in advance, and up to 5% rental yield. Verified residential projects across Mangalore, Bangalore, Bengaluru and Greater Noida West.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  phone: process.env.NEXT_PUBLIC_SALES_PHONE || "+91 9310 688 426",
  email: process.env.NEXT_PUBLIC_SALES_EMAIL || "info@housirentzinnovations.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919310688426",
  address: "HSR Layout Bangalore, Karnataka - 560102",
  hours: "Mon–Sat, 9:30am – 7:00pm IST",
  demoDisclaimer:
    "Housirentz Innovations is a rental investment platform. All projects, developers, prices, images and references shown are for illustration only. Verify pricing, approvals and availability with our advisor before making any decision.",
} as const;

export type NavChild = { label: string; href: string; blurb?: string };
export type NavLink = { label: string; href: string; children?: readonly NavChild[] };

export const LOCATION_LINKS = [
  { label: "Mangalore", href: "/location/mangalore", blurb: "Coastal Karnataka city with verified builder partnerships." },
  { label: "Bangalore", href: "/location/bangalore", blurb: "IT city with strong rental demand and growth corridors." },
  { label: "Bengaluru", href: "/location/bengaluru", blurb: "Premium residential market with Gravity Homes developments." },
  { label: "Greater Noida West", href: "/location/greater-noida-west", blurb: "NCR destination with accessible entry from ₹85 Lacs." },
] as const;

export const MORE_LINKS: readonly NavChild[] = [
  { label: "All properties", href: "/properties", blurb: "Curated rental investment properties." },
  { label: "Locations", href: "/location/mangalore", blurb: "Mangalore, Bangalore, Bengaluru and Greater Noida West." },
  { label: "FAQs", href: "/faq", blurb: "Rental yield, documentation and how the model works." },
];

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Benefits", href: "/benefits" },
  { label: "Properties", href: "/properties", children: MORE_LINKS },
  { label: "Why Housirentz", href: "/why-housirentz" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_LINKS = {
  explore: [
    { label: "All properties", href: "/properties" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Benefits", href: "/benefits" },
    { label: "Why Housirentz", href: "/why-housirentz" },
    { label: "FAQ", href: "/faq" },
    { label: "Blog", href: "/blog" },
  ],
  company: [
    { label: "About Housirentz", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms & conditions", href: "/terms" },
  ],
  account: [
    { label: "Login", href: "/login" },
    { label: "Create account", href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Saved projects", href: "/dashboard/saved" },
  ],
} as const;

export type ProjectStatus =
  | "NEW_LAUNCH"
  | "UNDER_CONSTRUCTION"
  | "READY_TO_MOVE"
  | "UPCOMING";

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; description: string }[] = [
  { value: "NEW_LAUNCH", label: "New launch", description: "Recently introduced to the market" },
  { value: "UNDER_CONSTRUCTION", label: "Under construction", description: "Work has commenced on site" },
  { value: "READY_TO_MOVE", label: "Ready to move", description: "Possession available now" },
  { value: "UPCOMING", label: "Upcoming", description: "Announced, sales opening soon" },
];

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  PROJECT_STATUSES.map((s) => [s.value, s.label]),
);

export const PROPERTY_TYPES = [
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
] as const;

export const PROJECT_CATEGORIES = [
  "Apartment",
  "Villa",
  "Plot",
  "Studio",
  "Penthouse",
  "Resort",
  "Serviced apartment",
  "Office",
  "Retail",
  "SCO",
] as const;

export const INQUIRY_TYPES = [
  { value: "CALLBACK", label: "Request a callback" },
  { value: "SITE_VISIT", label: "Schedule a site visit" },
  { value: "BROCHURE", label: "Download brochure" },
  { value: "CONTACT", label: "Contact sales" },
  { value: "GENERAL", label: "General inquiry" },
] as const;

export const INQUIRY_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "SPAM"] as const;
export const VISIT_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
export const USER_ROLES = ["USER", "AGENT", "ADMIN"] as const;

export const BHK_OPTIONS = ["1", "2", "3", "4", "5+"] as const;

export const BUDGET_OPTIONS = [
  { label: "Under ₹50 L", min: "0", max: "5000000" },
  { label: "₹50 L – ₹75 L", min: "5000000", max: "7500000" },
  { label: "₹75 L – ₹1 Cr", min: "7500000", max: "10000000" },
  { label: "₹1 Cr – ₹1.5 Cr", min: "10000000", max: "15000000" },
  { label: "₹1.5 Cr – ₹2.5 Cr", min: "15000000", max: "25000000" },
  { label: "₹2.5 Cr +", min: "25000000", max: "" },
] as const;

export const POSSESSION_OPTIONS = [
  { label: "Ready now", value: "READY_TO_MOVE" },
  { label: "By 2026", value: "2026" },
  { label: "By 2027", value: "2027" },
  { label: "2028 or later", value: "2028+" },
] as const;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured first" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "possession", label: "Possession: soonest" },
] as const;

export const PAGE_SIZE = 9;

export const DEMO_IMAGE_CREDITS =
  "Photography sourced from Unsplash for demonstration purposes.";
