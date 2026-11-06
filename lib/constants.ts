export const SITE = {
  name: "Housirentz Innovations",
  legalName: "Housirentz Innovations Pvt. Ltd.",
  tagline: "High-Yield Rental Real Estate, Reimagined.",
  description:
    "Housirentz Innovations Pvt. Ltd. is a premier real estate innovation firm specializing in the high-yield rental sector across India. We bridge the gap between property ownership and consistent wealth generation. Unlike traditional real estate firms, we don't just offer leisure homes — we deliver professionally managed rental solutions designed to generate steady income.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  phone: process.env.NEXT_PUBLIC_SALES_PHONE || "+91 9310 688 426",
  email: process.env.NEXT_PUBLIC_SALES_EMAIL || "info@housirentzinnovations.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919310688426",
  address: "HSR Layout Bangalore, Karnataka - 560102",
  hours: "Mon–Sat, 9:30am – 7:00pm IST",
  demoDisclaimer:
    "Housirentz Innovations is a demonstration platform. All projects, developers, prices, images and references shown are sample data for illustration only and are not verified listings or offers.",
} as const;

export type NavChild = { label: string; href: string; blurb?: string };
export type NavLink = { label: string; href: string; children?: readonly NavChild[] };

export const LOCATION_LINKS = [
  { label: "Noida", href: "/location/noida", blurb: "Established addresses, sector by sector." },
  { label: "Greater Noida", href: "/location/greater-noida", blurb: "Room to grow, close to the expressway." },
  { label: "Noida Extension", href: "/location/noida-extension", blurb: "New launches and value-led living." },
  { label: "Delhi NCR", href: "/location/delhi-ncr", blurb: "The wider capital-region corridor." },
] as const;

export const PROPERTY_TYPE_LINKS: readonly NavChild[] = [
  { label: "Residential properties", href: "/residential", blurb: "Apartments, villas, penthouses and studios." },
  { label: "Commercial spaces", href: "/commercial", blurb: "Offices, retail and SCO addresses." },
  { label: "Resort housing", href: "/resort-housing", blurb: "Resort-led homes with a managed rental intent." },
  { label: "Service apartments", href: "/service-apartments", blurb: "Furnished, professionally managed stays." },
];

export const MORE_LINKS: readonly NavChild[] = [
  { label: "All projects", href: "/projects", blurb: "Filter the full demonstration inventory." },
  { label: "Locations", href: "/location/noida", blurb: "Noida, Greater Noida, Noida Extension and NCR." },
  { label: "Compare projects", href: "/compare", blurb: "Place up to three addresses side by side." },
  { label: "FAQs", href: "/faq", blurb: "Data, RERA, site visits and how the assistant works." },
];

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Resort housing", href: "/resort-housing" },
  { label: "Commercial spaces", href: "/commercial" },
  { label: "Service apartments", href: "/service-apartments" },
  { label: "Residential properties", href: "/residential" },
  { label: "Projects", href: "/projects", children: MORE_LINKS },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_LINKS = {
  explore: [
    { label: "All projects", href: "/projects" },
    { label: "Resort housing", href: "/resort-housing" },
    { label: "Commercial spaces", href: "/commercial" },
    { label: "Service apartments", href: "/service-apartments" },
    { label: "Residential properties", href: "/residential" },
    { label: "Compare projects", href: "/compare" },
    { label: "New launches", href: "/projects?status=NEW_LAUNCH" },
    { label: "Ready to move", href: "/projects?status=READY_TO_MOVE" },
  ],
  company: [
    { label: "About Innovations Rental Solutions", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQs", href: "/faq" },
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
  { value: "AI", label: "Innovations AI" },
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
