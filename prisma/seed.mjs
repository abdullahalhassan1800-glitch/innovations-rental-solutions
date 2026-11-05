import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED_RESET !== "true") {
  throw new Error("Refusing to reset data in production. Set ALLOW_SEED_RESET=true to override.");
}

const json = (value) => JSON.stringify(value);

const mapUrl = (lat, lng, spread = 0.018) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${lng - spread}%2C${lat - spread}%2C${lng + spread}%2C${lat + spread}&layer=mapnik&marker=${lat}%2C${lng}`;

const developers = [
  {
    name: "Aurelia Estates",
    slug: "aurelia-estates",
    description:
      "A demo developer profile: Aurelia Estates is a fictional studio-led developer imagined around quiet, landscape-first residences in Noida.",
    establishedYear: 2012,
    website: "https://example.com",
  },
  {
    name: "Meridian Habitat",
    slug: "meridian-habitat",
    description:
      "A demo developer profile: Meridian Habitat is a fictional developer focused on transit-connected urban homes across Delhi NCR.",
    establishedYear: 2009,
    website: "https://example.com",
  },
  {
    name: "Nova Verde Developers",
    slug: "nova-verde-developers",
    description:
      "A demo developer profile: Nova Verde is a fictional value-led developer with projects in Noida Extension and Greater Noida.",
    establishedYear: 2015,
    website: "https://example.com",
  },
  {
    name: "Arclight Realty",
    slug: "arclight-realty",
    description:
      "A demo developer profile: Arclight Realty is a fictional commercial specialist imagined for grade-A offices and high-street retail.",
    establishedYear: 2011,
    website: "https://example.com",
  },
  {
    name: "Sanctum Spaces",
    slug: "sanctum-spaces",
    description:
      "A demo developer profile: Sanctum Spaces is a fictional boutique developer focused on low-density villas and courtyard homes.",
    establishedYear: 2018,
    website: "https://example.com",
  },
  {
    name: "Northline Group",
    slug: "northline-group",
    description:
      "A demo developer profile: Northline Group is a fictional developer creating compact, connected homes for first-time buyers.",
    establishedYear: 2016,
    website: "https://example.com",
  },
];

const locations = [
  {
    name: "Noida",
    slug: "noida",
    city: "Noida",
    state: "Uttar Pradesh",
    sortOrder: 1,
    imageUrl: "/images/city-1.jpg",
    description:
      "Noida pairs mature sector infrastructure with expressway access, metro connectivity and a deep resale market. From Sector 150's green belt to Sector 94's riverfront corridor, the city offers both established neighbourhoods and new premium addresses.",
    highlights: [
      "Noida–Greater Noida Expressway",
      "Aqua Line and Blue Line metro",
      "Sector 18 and DLF Mall of India",
      "Jewar Airport access via expressway",
    ],
  },
  {
    name: "Greater Noida",
    slug: "greater-noida",
    city: "Greater Noida",
    state: "Uttar Pradesh",
    sortOrder: 2,
    imageUrl: "/images/exterior-7.jpg",
    description:
      "Greater Noida offers planned sectors, wide roads and relative value. Knowledge Park, Alpha and the Yamuna Expressway corridor attract buyers looking for space, institutions and longer-term infrastructure upside.",
    highlights: [
      "Knowledge Park education hub",
      "Yamuna Expressway",
      "Alpha and Beta commercial centres",
      "Formula 1 circuit and sports facilities",
    ],
  },
  {
    name: "Noida Extension",
    slug: "noida-extension",
    city: "Greater Noida West",
    state: "Uttar Pradesh",
    sortOrder: 3,
    imageUrl: "/images/apartment-1.jpg",
    description:
      "Noida Extension — also called Greater Noida West — has become a value-led residential destination for Delhi NCR homebuyers. Sector 1, 12 and 16C offer newer towers, schools and retail, with direct links to Noida and NH-24.",
    highlights: [
      "NH-24 and Noida–Greater Noida link",
      "Newer residential towers and schools",
      "Gaur City and Sector 1 high street",
      "Aqua Line metro feeder connectivity",
    ],
  },
  {
    name: "Delhi NCR",
    slug: "delhi-ncr",
    city: "New Delhi",
    state: "Delhi",
    sortOrder: 4,
    imageUrl: "/images/exterior-11.jpg",
    description:
      "Our Delhi NCR coverage is a demonstration selection of addresses across the wider capital region. Use it to explore how Innovations handles multi-city inventory; live inventory would be verified market by market.",
    highlights: [
      "Wider NCR coverage",
      "Metro-connected neighbourhoods",
      "South Delhi demonstration listing",
      "Cross-city comparison",
    ],
  },
];

const amenityNames = [
  "Swimming Pool",
  "Gymnasium",
  "Clubhouse",
  "Landscaped Gardens",
  "Kids' Play Area",
  "24x7 Security",
  "Power Backup",
  "Covered Parking",
  "Sports Court",
  "Yoga Deck",
  "Co-working Lounge",
  "Retail Arcade",
  "Concierge",
  "EV Charging",
  "Amphitheatre",
  "Jogging Track",
  "Spa",
  "Rooftop Lounge",
];

const projects = [
  {
    name: "Aurelia Grove",
    slug: "aurelia-grove",
    tagline: "A garden-first address on the Sector 150 green belt.",
    developer: "aurelia-estates",
    location: "noida",
    address: "Sector 150, Noida, Uttar Pradesh 201310",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 14500000,
    maxPrice: 29000000,
    bhkConfigs: ["2", "3", "4"],
    status: "NEW_LAUNCH",
    possessionDate: "2028-12-31",
    featured: true,
    lat: 28.5012,
    lng: 77.4125,
    description:
      "Aurelia Grove is a demo residential concept arranged around a central woodland walk, with a limited collection of two, three and four-bedroom homes. The design brief favours deep balconies, cross ventilation and a quiet material palette. Every figure and approval shown on this demonstration listing is illustrative.",
    highlights: [
      "Low-density towers around a central green",
      "Deep balconies and cross-ventilated layouts",
      "Clubhouse with wellness and work lounges",
      "Expressway access within a short drive",
    ],
    amenities: ["Swimming Pool", "Gymnasium", "Clubhouse", "Landscaped Gardens", "Kids' Play Area", "24x7 Security", "Covered Parking", "Jogging Track"],
    images: ["exterior-1", "interior-1", "pool-1", "lobby-1", "exterior-13"],
    floorPlans: [
      { name: "2 BHK · Type A", bhk: "2", areaSqft: 1240, price: 14500000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "3 BHK · Type B", bhk: "3", areaSqft: 1685, price: 20500000, imageUrl: "/images/floorplan-3bhk.svg" },
      { name: "4 BHK · Type C", bhk: "4", areaSqft: 2340, price: 29000000, imageUrl: "/images/floorplan-4bhk.svg" },
    ],
    nearby: [
      { name: "Noida–Greater Noida Expressway", distance: "1.8 km" },
      { name: "Jaypee Greens Golf Course", distance: "4.2 km" },
      { name: "Sector 148 Metro (Aqua Line)", distance: "5.1 km" },
      { name: "DPS Sector 132", distance: "6.4 km" },
    ],
  },
  {
    name: "The Meridian",
    slug: "the-meridian",
    tagline: "Riverfront residences with a quieter point of view.",
    developer: "meridian-habitat",
    location: "noida",
    address: "Sector 94, Noida, Uttar Pradesh 201301",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 32000000,
    maxPrice: 58000000,
    bhkConfigs: ["3", "4"],
    status: "UNDER_CONSTRUCTION",
    possessionDate: "2027-06-30",
    featured: true,
    lat: 28.5451,
    lng: 77.3652,
    description:
      "The Meridian is a demo premium residential project with a riverfront orientation and a restrained, hotel-like arrival sequence. The concept includes larger three and four-bedroom homes, a residents' spa and a sky lounge. It is sample inventory created to demonstrate the Innovations experience.",
    highlights: [
      "Riverfront-facing demonstration layout",
      "Sky lounge and residents' spa",
      "Three and four-bedroom residences",
      "Close to Sector 18 and the expressway",
    ],
    amenities: ["Swimming Pool", "Gymnasium", "Clubhouse", "24x7 Security", "Power Backup", "Covered Parking", "Spa", "Rooftop Lounge", "Concierge"],
    images: ["exterior-2", "interior-2", "exterior-9", "interior-5"],
    floorPlans: [
      { name: "3 BHK · River View", bhk: "3", areaSqft: 1980, price: 32000000, imageUrl: "/images/floorplan-3bhk.svg" },
      { name: "4 BHK · Sky Suite", bhk: "4", areaSqft: 2870, price: 58000000, imageUrl: "/images/floorplan-4bhk.svg" },
    ],
    nearby: [
      { name: "Sector 18 Market", distance: "3.6 km" },
      { name: "Okhla Bird Sanctuary", distance: "2.9 km" },
      { name: "Botanical Garden Metro", distance: "6.8 km" },
      { name: "Apollo Hospital Noida", distance: "7.2 km" },
    ],
  },
  {
    name: "Arclight One",
    slug: "arclight-one",
    tagline: "Grade-A workspace, ready for the next chapter.",
    developer: "arclight-realty",
    location: "noida",
    address: "Sector 62, Noida, Uttar Pradesh 201309",
    propertyType: "COMMERCIAL",
    category: "Office",
    startingPrice: 7500000,
    maxPrice: 24000000,
    bhkConfigs: ["Office suites"],
    status: "READY_TO_MOVE",
    possessionDate: "2025-03-31",
    featured: false,
    lat: 28.6272,
    lng: 77.3649,
    description:
      "Arclight One is a demonstration commercial address imagined around efficient floor plates, a double-height lobby and shared amenities for growing teams. Suite sizes and pricing are sample data and do not represent a live offer. The project is marked ready to move purely to exercise listing states.",
    highlights: [
      "Efficient floor plates from 1,800 sq ft",
      "Double-height arrival lobby",
      "Meeting and co-working lounges",
      "Sector 62 metro connectivity",
    ],
    amenities: ["24x7 Security", "Power Backup", "Covered Parking", "Co-working Lounge", "Retail Arcade", "EV Charging", "Concierge"],
    images: ["commercial-1", "office-1", "commercial-2"],
    floorPlans: [
      { name: "Office suite · 1,800 sq ft", bhk: "Office", areaSqft: 1800, price: 7500000, imageUrl: "/images/floorplan-office.svg" },
      { name: "Office suite · 4,200 sq ft", bhk: "Office", areaSqft: 4200, price: 16800000, imageUrl: "/images/floorplan-office.svg" },
    ],
    nearby: [
      { name: "Sector 62 Metro", distance: "1.2 km" },
      { name: "Sector 18 Market", distance: "8.4 km" },
      { name: "Noida City Centre", distance: "7.1 km" },
      { name: "Expressway entry", distance: "9.6 km" },
    ],
  },
  {
    name: "Nova Verde Central",
    slug: "nova-verde-central",
    tagline: "Everyday ease, thoughtfully planned in Noida Extension.",
    developer: "nova-verde-developers",
    location: "noida-extension",
    address: "Sector 16C, Noida Extension, Uttar Pradesh 201009",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 6800000,
    maxPrice: 10500000,
    bhkConfigs: ["2", "3"],
    status: "NEW_LAUNCH",
    possessionDate: "2027-09-30",
    featured: true,
    lat: 28.5786,
    lng: 77.4492,
    description:
      "Nova Verde Central is a demo mid-market residential project designed around a central courtyard and a shaded pedestrian loop. It explores two and three-bedroom homes for buyers who want newer construction without moving too far from Noida. All particulars are illustrative sample data.",
    highlights: [
      "Central courtyard and shaded walkways",
      "Two and three-bedroom homes",
      "Retail edge for daily needs",
      "NH-24 connectivity",
    ],
    amenities: ["Swimming Pool", "Gymnasium", "Clubhouse", "Landscaped Gardens", "Kids' Play Area", "24x7 Security", "Power Backup", "Covered Parking", "Retail Arcade", "Amphitheatre"],
    images: ["exterior-3", "interior-3", "exterior-7", "pool-1"],
    floorPlans: [
      { name: "2 BHK · Courtyard", bhk: "2", areaSqft: 990, price: 6800000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "3 BHK · Courtyard", bhk: "3", areaSqft: 1320, price: 10500000, imageUrl: "/images/floorplan-3bhk.svg" },
    ],
    nearby: [
      { name: "Gaur City Mall", distance: "2.4 km" },
      { name: "Sector 16C market", distance: "0.8 km" },
      { name: "Noida Extension bus terminal", distance: "3.1 km" },
      { name: "NH-24", distance: "4.6 km" },
    ],
  },
  {
    name: "Sanctum Parkside",
    slug: "sanctum-parkside",
    tagline: "A park at the doorstep, calm inside.",
    developer: "sanctum-spaces",
    location: "noida-extension",
    address: "Sector 12, Noida Extension, Uttar Pradesh 201009",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 6200000,
    maxPrice: 9500000,
    bhkConfigs: ["2", "3"],
    status: "UNDER_CONSTRUCTION",
    possessionDate: "2027-03-31",
    featured: false,
    lat: 28.5921,
    lng: 77.4564,
    description:
      "Sanctum Parkside is a demo residential project that places a public park along one edge and a quieter residential court along the other. The sample layouts are compact, daylight-led two and three-bedroom homes. It is not a live project and no approval should be inferred.",
    highlights: [
      "Direct park frontage",
      "Compact, daylight-led layouts",
      "Community lawn and play area",
      "Walking distance to schools",
    ],
    amenities: ["Landscaped Gardens", "Kids' Play Area", "24x7 Security", "Power Backup", "Covered Parking", "Jogging Track", "Yoga Deck"],
    images: ["exterior-4", "interior-4", "exterior-8"],
    floorPlans: [
      { name: "2 BHK · Park View", bhk: "2", areaSqft: 920, price: 6200000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "3 BHK · Park View", bhk: "3", areaSqft: 1240, price: 9500000, imageUrl: "/images/floorplan-3bhk.svg" },
    ],
    nearby: [
      { name: "Sector 12 park", distance: "0.2 km" },
      { name: "Gaur City Mall", distance: "3.2 km" },
      { name: "Noida Extension schools", distance: "1.6 km" },
      { name: "NH-24", distance: "5.4 km" },
    ],
  },
  {
    name: "Northline Residences",
    slug: "northline-residences",
    tagline: "Room for the whole family, closer than you think.",
    developer: "northline-group",
    location: "noida-extension",
    address: "Sector 1, Noida Extension, Uttar Pradesh 201306",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 11500000,
    maxPrice: 18000000,
    bhkConfigs: ["3", "4"],
    status: "UNDER_CONSTRUCTION",
    possessionDate: "2027-12-31",
    featured: false,
    lat: 28.5852,
    lng: 77.4301,
    description:
      "Northline Residences is a demo family-oriented project with larger three and four-bedroom homes around a shared garden and sports court. The site is imagined near the Sector 1 high street. Prices, timelines and amenities are sample data for demonstration only.",
    highlights: [
      "Family-sized three and four-bedroom homes",
      "Shared sports court and garden",
      "Near Sector 1 high street",
      "Two-car parking in select layouts",
    ],
    amenities: ["Swimming Pool", "Gymnasium", "Clubhouse", "Landscaped Gardens", "Kids' Play Area", "24x7 Security", "Power Backup", "Covered Parking", "Sports Court", "Amphitheatre"],
    images: ["apartment-1", "interior-6", "apartment-2"],
    floorPlans: [
      { name: "3 BHK · Family", bhk: "3", areaSqft: 1580, price: 11500000, imageUrl: "/images/floorplan-3bhk.svg" },
      { name: "4 BHK · Family", bhk: "4", areaSqft: 2110, price: 18000000, imageUrl: "/images/floorplan-4bhk.svg" },
    ],
    nearby: [
      { name: "Sector 1 high street", distance: "1.1 km" },
      { name: "Gaur City Mall", distance: "4.3 km" },
      { name: "NH-24", distance: "4.9 km" },
      { name: "Noida Extension schools", distance: "2.0 km" },
    ],
  },
  {
    name: "Meridian Courtyard",
    slug: "meridian-courtyard",
    tagline: "A ready address in the heart of Greater Noida.",
    developer: "meridian-habitat",
    location: "greater-noida",
    address: "Alpha 2, Greater Noida, Uttar Pradesh 201310",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 7200000,
    maxPrice: 11000000,
    bhkConfigs: ["2", "3"],
    status: "READY_TO_MOVE",
    possessionDate: "2025-01-31",
    featured: false,
    lat: 28.4801,
    lng: 77.5048,
    description:
      "Meridian Courtyard is a demo ready-to-move project concept in Greater Noida's Alpha 2. The sample brief centres on a shaded courtyard, a small residents' club and everyday retail at the edge. Ready-to-move status is used for illustration only and has not been verified.",
    highlights: [
      "Established Alpha 2 location",
      "Courtyard planning with retail edge",
      "Residents' club and gym",
      "Wide sector roads",
    ],
    amenities: ["Gymnasium", "Clubhouse", "Landscaped Gardens", "24x7 Security", "Power Backup", "Covered Parking", "Retail Arcade"],
    images: ["exterior-5", "interior-7", "exterior-10"],
    floorPlans: [
      { name: "2 BHK · Courtyard", bhk: "2", areaSqft: 1080, price: 7200000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "3 BHK · Courtyard", bhk: "3", areaSqft: 1490, price: 11000000, imageUrl: "/images/floorplan-3bhk.svg" },
    ],
    nearby: [
      { name: "Alpha 2 market", distance: "0.9 km" },
      { name: "Knowledge Park", distance: "3.4 km" },
      { name: "Pari Chowk", distance: "5.8 km" },
      { name: "Greater Noida bus terminal", distance: "4.2 km" },
    ],
  },
  {
    name: "Aurelia Business Bay",
    slug: "aurelia-business-bay",
    tagline: "Workspace with room to think.",
    developer: "aurelia-estates",
    location: "greater-noida",
    address: "Knowledge Park V, Greater Noida, Uttar Pradesh 201306",
    propertyType: "COMMERCIAL",
    category: "Office",
    startingPrice: 5500000,
    maxPrice: 16000000,
    bhkConfigs: ["Office suites"],
    status: "UNDER_CONSTRUCTION",
    possessionDate: "2027-06-30",
    featured: true,
    lat: 28.4724,
    lng: 77.5032,
    description:
      "Aurelia Business Bay is a demo office development imagined for the Knowledge Park corridor, with flexible suites, a shared conference floor and a landscaped arrival court. The listing is illustrative and does not constitute a commercial offer or approval.",
    highlights: [
      "Flexible office suites",
      "Shared conference floor",
      "Landscaped arrival court",
      "Knowledge Park institutional cluster",
    ],
    amenities: ["24x7 Security", "Power Backup", "Covered Parking", "Co-working Lounge", "EV Charging", "Concierge", "Retail Arcade"],
    images: ["commercial-3", "commercial-2", "lobby-1"],
    floorPlans: [
      { name: "Office suite · 1,200 sq ft", bhk: "Office", areaSqft: 1200, price: 5500000, imageUrl: "/images/floorplan-office.svg" },
      { name: "Office floor · 3,600 sq ft", bhk: "Office", areaSqft: 3600, price: 16000000, imageUrl: "/images/floorplan-office.svg" },
    ],
    nearby: [
      { name: "Knowledge Park V", distance: "0.6 km" },
      { name: "Pari Chowk", distance: "6.4 km" },
      { name: "Greater Noida Expressway", distance: "4.1 km" },
      { name: "Delta 1 metro", distance: "5.2 km" },
    ],
  },
  {
    name: "Nova Verde Highstreet",
    slug: "nova-verde-highstreet",
    tagline: "A neighbourhood high street that works after hours.",
    developer: "nova-verde-developers",
    location: "noida-extension",
    address: "Sector 1, Noida Extension, Uttar Pradesh 201306",
    propertyType: "COMMERCIAL",
    category: "Retail",
    startingPrice: 4500000,
    maxPrice: 12000000,
    bhkConfigs: ["SCO units", "Retail"],
    status: "NEW_LAUNCH",
    possessionDate: "2027-03-31",
    featured: false,
    lat: 28.5812,
    lng: 77.4388,
    description:
      "Nova Verde Highstreet is a demo SCO and retail concept for a growing Noida Extension neighbourhood. The plan studies a shaded retail edge with flexible shop units and a small food court. It is sample data only; no tenancy, return or approval is implied.",
    highlights: [
      "Flexible SCO and retail units",
      "Shaded pedestrian high street",
      "Food court and plaza",
      "Residential catchment",
    ],
    amenities: ["24x7 Security", "Power Backup", "Covered Parking", "Retail Arcade", "Amphitheatre", "EV Charging"],
    images: ["commercial-2", "commercial-1", "city-1"],
    floorPlans: [
      { name: "Retail · Ground floor", bhk: "Retail", areaSqft: 650, price: 4500000, imageUrl: "/images/floorplan-retail.svg" },
      { name: "SCO · Two floors", bhk: "SCO", areaSqft: 1450, price: 12000000, imageUrl: "/images/floorplan-retail.svg" },
    ],
    nearby: [
      { name: "Sector 1 high street", distance: "0.4 km" },
      { name: "Gaur City Mall", distance: "3.9 km" },
      { name: "Noida Extension schools", distance: "1.8 km" },
      { name: "NH-24", distance: "4.2 km" },
    ],
  },
  {
    name: "Arclight Sky Penthouse",
    slug: "arclight-sky-penthouse",
    tagline: "The top floor, kept deliberately rare.",
    developer: "arclight-realty",
    location: "noida",
    address: "Sector 107, Noida, Uttar Pradesh 201304",
    propertyType: "RESIDENTIAL",
    category: "Penthouse",
    startingPrice: 45000000,
    maxPrice: 75000000,
    bhkConfigs: ["4", "5+"],
    status: "UPCOMING",
    possessionDate: "2029-06-30",
    featured: false,
    lat: 28.5402,
    lng: 77.3746,
    description:
      "Arclight Sky Penthouse is a demo collection imagined as a small set of top-floor homes with private terraces. The concept is included to demonstrate an upcoming, high-value listing and comparison flows. It is not a live launch and no booking is being accepted.",
    highlights: [
      "Private rooftop terraces",
      "Limited top-floor collection",
      "Panoramic city views",
      "Announced for a future phase",
    ],
    amenities: ["Swimming Pool", "Gymnasium", "Clubhouse", "24x7 Security", "Power Backup", "Covered Parking", "Spa", "Rooftop Lounge", "Concierge"],
    images: ["exterior-6", "interior-8", "exterior-11"],
    floorPlans: [
      { name: "4 BHK · Terrace Home", bhk: "4", areaSqft: 3200, price: 45000000, imageUrl: "/images/floorplan-4bhk.svg" },
      { name: "5 BHK · Sky Terrace", bhk: "5+", areaSqft: 4600, price: 75000000, imageUrl: "/images/floorplan-4bhk.svg" },
    ],
    nearby: [
      { name: "Sector 107 market", distance: "1.0 km" },
      { name: "Noida Expressway", distance: "2.6 km" },
      { name: "Sector 137 metro", distance: "3.8 km" },
      { name: "DPS Sector 132", distance: "4.4 km" },
    ],
  },
  {
    name: "Sanctum Vanya Villas",
    slug: "sanctum-vanya-villas",
    tagline: "Low-density villas along the Yamuna corridor.",
    developer: "sanctum-spaces",
    location: "greater-noida",
    address: "Yamuna Expressway, Greater Noida, Uttar Pradesh 203201",
    propertyType: "RESIDENTIAL",
    category: "Villa",
    startingPrice: 22000000,
    maxPrice: 36000000,
    bhkConfigs: ["3", "4"],
    status: "NEW_LAUNCH",
    possessionDate: "2028-03-31",
    featured: true,
    lat: 28.4213,
    lng: 77.5238,
    description:
      "Sanctum Vanya Villas is a demo low-density villa concept for the Yamuna Expressway corridor. Each home is imagined around a private courtyard, with shared orchards and a small residents' pavilion. It is illustrative sample data, including the villa count and pricing.",
    highlights: [
      "Private courtyards and terraces",
      "Low-density villa neighbourhood",
      "Shared orchard and pavilion",
      "Yamuna Expressway access",
    ],
    amenities: ["Swimming Pool", "Clubhouse", "Landscaped Gardens", "24x7 Security", "Power Backup", "Covered Parking", "Sports Court", "Yoga Deck", "Spa"],
    images: ["exterior-7", "exterior-12", "interior-1"],
    floorPlans: [
      { name: "3 BHK · Courtyard Villa", bhk: "3", areaSqft: 2450, price: 22000000, imageUrl: "/images/floorplan-villa.svg" },
      { name: "4 BHK · Garden Villa", bhk: "4", areaSqft: 3100, price: 36000000, imageUrl: "/images/floorplan-villa.svg" },
    ],
    nearby: [
      { name: "Yamuna Expressway", distance: "1.4 km" },
      { name: "Jewar Airport (proposed)", distance: "22 km" },
      { name: "Formula 1 circuit", distance: "8.6 km" },
      { name: "Knowledge Park", distance: "12 km" },
    ],
  },
  {
    name: "Northline Studios",
    slug: "northline-studios",
    tagline: "A compact address that makes room for more.",
    developer: "northline-group",
    location: "noida",
    address: "Sector 76, Noida, Uttar Pradesh 201301",
    propertyType: "RESIDENTIAL",
    category: "Studio",
    startingPrice: 4500000,
    maxPrice: 6800000,
    bhkConfigs: ["1"],
    status: "READY_TO_MOVE",
    possessionDate: "2024-12-31",
    featured: false,
    lat: 28.5702,
    lng: 77.3904,
    description:
      "Northline Studios is a demo compact-living concept with studio and one-bedroom homes near Sector 76. The sample design focuses on efficient storage, shared work lounges and a small rooftop garden. It is included to demonstrate low-budget search and ready-to-move filtering.",
    highlights: [
      "Efficient studio layouts",
      "Shared work lounge",
      "Rooftop garden",
      "Sector 76 connectivity",
    ],
    amenities: ["Gymnasium", "24x7 Security", "Power Backup", "Covered Parking", "Co-working Lounge", "Rooftop Lounge"],
    images: ["apartment-2", "interior-5", "office-1"],
    floorPlans: [
      { name: "Studio · Compact", bhk: "1", areaSqft: 480, price: 4500000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "1 BHK · Studio Plus", bhk: "1", areaSqft: 640, price: 6800000, imageUrl: "/images/floorplan-2bhk.svg" },
    ],
    nearby: [
      { name: "Sector 76 metro", distance: "1.2 km" },
      { name: "Sector 18 Market", distance: "5.8 km" },
      { name: "Noida City Centre", distance: "4.6 km" },
      { name: "NH-24", distance: "6.3 km" },
    ],
  },
  {
    name: "Meridian Edge",
    slug: "meridian-edge",
    tagline: "Value-led homes with a metro connection.",
    developer: "meridian-habitat",
    location: "noida",
    address: "Sector 137, Noida, Uttar Pradesh 201305",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 4800000,
    maxPrice: 8200000,
    bhkConfigs: ["1", "2"],
    status: "READY_TO_MOVE",
    possessionDate: "2025-06-30",
    featured: false,
    lat: 28.5104,
    lng: 77.4051,
    description:
      "Meridian Edge is a demo value-led residential project near Sector 137, imagined for first-time buyers who want a metro connection. The sample inventory includes one and two-bedroom homes and a compact shared amenity deck. All details are illustrative.",
    highlights: [
      "One and two-bedroom homes",
      "Metro-connected location",
      "Compact shared amenity deck",
      "Demonstration ready-to-move inventory",
    ],
    amenities: ["Gymnasium", "Landscaped Gardens", "24x7 Security", "Power Backup", "Covered Parking", "Jogging Track"],
    images: ["exterior-8", "interior-3", "exterior-2"],
    floorPlans: [
      { name: "1 BHK · Metro", bhk: "1", areaSqft: 610, price: 4800000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "2 BHK · Metro", bhk: "2", areaSqft: 960, price: 8200000, imageUrl: "/images/floorplan-3bhk.svg" },
    ],
    nearby: [
      { name: "Sector 137 metro", distance: "0.9 km" },
      { name: "Noida Expressway", distance: "1.8 km" },
      { name: "Sector 18 Market", distance: "10.2 km" },
      { name: "DPS Sector 132", distance: "4.0 km" },
    ],
  },
  {
    name: "Aurelia Aria",
    slug: "aurelia-aria",
    tagline: "A quieter rhythm in Noida Extension.",
    developer: "aurelia-estates",
    location: "noida-extension",
    address: "Sector 1, Noida Extension, Uttar Pradesh 201306",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 11000000,
    maxPrice: 16500000,
    bhkConfigs: ["3", "4"],
    status: "UNDER_CONSTRUCTION",
    possessionDate: "2027-11-30",
    featured: false,
    lat: 28.5818,
    lng: 77.4352,
    description:
      "Aurelia Aria is a demo three and four-bedroom residential concept that continues the developer's landscape-first approach in Noida Extension. The sample brief includes a residents' pavilion, a lap pool and a small retail edge. It is not a live project.",
    highlights: [
      "Three and four-bedroom homes",
      "Landscape-first planning",
      "Lap pool and pavilion",
      "Sector 1 convenience",
    ],
    amenities: ["Swimming Pool", "Gymnasium", "Clubhouse", "Landscaped Gardens", "Kids' Play Area", "24x7 Security", "Power Backup", "Covered Parking", "Retail Arcade"],
    images: ["exterior-9", "interior-4", "pool-1"],
    floorPlans: [
      { name: "3 BHK · Aria", bhk: "3", areaSqft: 1520, price: 11000000, imageUrl: "/images/floorplan-3bhk.svg" },
      { name: "4 BHK · Aria", bhk: "4", areaSqft: 2050, price: 16500000, imageUrl: "/images/floorplan-4bhk.svg" },
    ],
    nearby: [
      { name: "Sector 1 high street", distance: "0.7 km" },
      { name: "Gaur City Mall", distance: "4.1 km" },
      { name: "NH-24", distance: "4.7 km" },
      { name: "Noida Extension schools", distance: "1.5 km" },
    ],
  },
  {
    name: "Nova Verde Crest",
    slug: "nova-verde-crest",
    tagline: "A future phase with a longer view.",
    developer: "nova-verde-developers",
    location: "greater-noida",
    address: "Sector 1, Greater Noida West, Uttar Pradesh 203207",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 6600000,
    maxPrice: 9800000,
    bhkConfigs: ["2", "3"],
    status: "UPCOMING",
    possessionDate: "2028-12-31",
    featured: false,
    lat: 28.4749,
    lng: 77.5121,
    description:
      "Nova Verde Crest is a demo upcoming-phase concept exploring compact two and three-bedroom homes with a shared courtyard and work lounge. It exists to demonstrate upcoming-project discovery and saved-project flows. Details are illustrative and subject to change.",
    highlights: [
      "Upcoming demonstration phase",
      "Courtyard and work lounge",
      "Two and three-bedroom homes",
      "Greater Noida West context",
    ],
    amenities: ["Gymnasium", "Landscaped Gardens", "Kids' Play Area", "24x7 Security", "Power Backup", "Covered Parking", "Co-working Lounge", "Jogging Track"],
    images: ["exterior-10", "interior-2", "exterior-12"],
    floorPlans: [
      { name: "2 BHK · Crest", bhk: "2", areaSqft: 950, price: 6600000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "3 BHK · Crest", bhk: "3", areaSqft: 1280, price: 9800000, imageUrl: "/images/floorplan-3bhk.svg" },
    ],
    nearby: [
      { name: "NH-24", distance: "5.2 km" },
      { name: "Gaur City Mall", distance: "6.8 km" },
      { name: "Sector 1 high street", distance: "4.9 km" },
      { name: "Noida Extension schools", distance: "5.1 km" },
    ],
  },
  {
    name: "Meridian South",
    slug: "meridian-south",
    tagline: "A capital-region address, kept simple.",
    developer: "meridian-habitat",
    location: "delhi-ncr",
    address: "Greater Kailash II, New Delhi 110048 (demonstration)",
    propertyType: "RESIDENTIAL",
    category: "Apartment",
    startingPrice: 32000000,
    maxPrice: 52000000,
    bhkConfigs: ["3", "4"],
    status: "UNDER_CONSTRUCTION",
    possessionDate: "2028-06-30",
    featured: false,
    lat: 28.5244,
    lng: 77.2066,
    description:
      "Meridian South is a demonstration listing included only to show how Innovations handles Delhi NCR inventory. It does not represent a real project, address, approval or offer. The sample brief imagines a small, centrally located residential building.",
    highlights: [
      "Delhi NCR demonstration listing",
      "Central location concept",
      "Small-building typology",
      "Metro-connected neighbourhood",
    ],
    amenities: ["Gymnasium", "Clubhouse", "24x7 Security", "Power Backup", "Covered Parking", "Concierge"],
    images: ["exterior-11", "interior-6", "city-1"],
    floorPlans: [
      { name: "3 BHK · South", bhk: "3", areaSqft: 1750, price: 32000000, imageUrl: "/images/floorplan-3bhk.svg" },
      { name: "4 BHK · South", bhk: "4", areaSqft: 2380, price: 52000000, imageUrl: "/images/floorplan-4bhk.svg" },
    ],
    nearby: [
      { name: "GK II market", distance: "0.8 km" },
      { name: "Greater Kailash metro", distance: "1.4 km" },
      { name: "Lotus Temple", distance: "5.2 km" },
      { name: "Nehru Place", distance: "4.6 km" },
    ],
  },
  {
    name: "Sanctum Vanya Retreat",
    slug: "sanctum-vanya-retreat",
    tagline: "Resort-led villas with a managed rental intent.",
    developer: "sanctum-spaces",
    location: "greater-noida",
    address: "Sector 22D, Greater Noida, Uttar Pradesh 201308 (demonstration)",
    propertyType: "RESIDENTIAL",
    category: "Resort",
    startingPrice: 19500000,
    maxPrice: 34000000,
    bhkConfigs: ["2", "3"],
    status: "UNDER_CONSTRUCTION",
    possessionDate: "2029-03-31",
    featured: true,
    lat: 28.4298,
    lng: 77.5285,
    description:
      "Sanctum Vanya Retreat is a demonstration resort-housing concept, shown only to illustrate how Innovations presents managed rental inventory. The brief imagines low-rise villas around a landscaped water court, with an on-site management desk and a rental pool option. It does not represent a real project, approval, return or offer.",
    highlights: [
      "Demonstration resort-housing concept",
      "Low-rise villas around a water court",
      "Optional rental-pool management desk",
      "Landscaped resort core with spa and pool",
    ],
    amenities: ["Swimming Pool", "Spa", "Clubhouse", "Landscaped Gardens", "24x7 Security", "Concierge", "Rooftop Lounge", "Covered Parking"],
    images: ["exterior-8", "pool-1", "interior-3", "lobby-1", "exterior-12"],
    floorPlans: [
      { name: "2 BHK Villa · Retreat", bhk: "2", areaSqft: 1520, price: 19500000, imageUrl: "/images/floorplan-villa.svg" },
      { name: "3 BHK Villa · Retreat", bhk: "3", areaSqft: 2140, price: 34000000, imageUrl: "/images/floorplan-3bhk.svg" },
    ],
    nearby: [
      { name: "Noida–Greater Noida Expressway", distance: "3.4 km" },
      { name: "Buddh International Circuit", distance: "6.1 km" },
      { name: "Knowledge Park metro (Aqua Line)", distance: "4.8 km" },
      { name: "Greater Noida West market", distance: "7.2 km" },
    ],
  },
  {
    name: "Aurelia Lagoon Residences",
    slug: "aurelia-lagoon-residences",
    tagline: "Water-facing resort apartments, managed as a rental asset.",
    developer: "aurelia-estates",
    location: "noida-extension",
    address: "Sector 16C, Noida Extension, Uttar Pradesh 201009 (demonstration)",
    propertyType: "RESIDENTIAL",
    category: "Resort",
    startingPrice: 12800000,
    maxPrice: 21500000,
    bhkConfigs: ["1", "2", "3"],
    status: "NEW_LAUNCH",
    possessionDate: "2029-06-30",
    featured: false,
    lat: 28.5702,
    lng: 77.4523,
    description:
      "Aurelia Lagoon Residences is sample resort-housing inventory created for this demonstration. It imagines a lagoon-facing apartment cluster with a managed hospitality desk and a furnished rental programme. All figures, timelines and operating details are illustrative and are not an offer or a promise of returns.",
    highlights: [
      "Demonstration resort-apartment concept",
      "Lagoon-facing orientation for most homes",
      "Managed hospitality desk on site",
      "Furnished rental programme option",
    ],
    amenities: ["Swimming Pool", "Spa", "Gymnasium", "Landscaped Gardens", "Rooftop Lounge", "24x7 Security", "EV Charging", "Jogging Track"],
    images: ["exterior-5", "pool-1", "interior-5", "exterior-9"],
    floorPlans: [
      { name: "1 BHK · Lagoon", bhk: "1", areaSqft: 780, price: 12800000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "2 BHK · Lagoon", bhk: "2", areaSqft: 1180, price: 16800000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "3 BHK · Lagoon", bhk: "3", areaSqft: 1640, price: 21500000, imageUrl: "/images/floorplan-3bhk.svg" },
    ],
    nearby: [
      { name: "Noida Extension metro (proposed)", distance: "2.2 km" },
      { name: "Gaur City Mall", distance: "3.1 km" },
      { name: "Noida–Greater Noida Expressway", distance: "5.6 km" },
      { name: "Sector 121 market", distance: "6.4 km" },
    ],
  },
  {
    name: "Northline Managed Suites",
    slug: "northline-managed-suites",
    tagline: "Furnished serviced apartments with a single operating desk.",
    developer: "northline-group",
    location: "noida",
    address: "Sector 62, Noida, Uttar Pradesh 201309 (demonstration)",
    propertyType: "RESIDENTIAL",
    category: "Serviced apartment",
    startingPrice: 8900000,
    maxPrice: 14200000,
    bhkConfigs: ["1", "2"],
    status: "READY_TO_MOVE",
    possessionDate: "2026-04-30",
    featured: true,
    lat: 28.6273,
    lng: 77.3718,
    description:
      "Northline Managed Suites is a demonstration serviced-apartment listing. The concept covers furnished studios and one-bedroom suites with housekeeping, a front desk and short-stay licensing notes shown up front. Nothing here is a real inventory, licence or return claim.",
    highlights: [
      "Demonstration serviced-apartment concept",
      "Furnished suites with housekeeping",
      "Single front desk for short and long stays",
      "Walkable to the Sector 62 office belt",
    ],
    amenities: ["Concierge", "Co-working Lounge", "Gymnasium", "24x7 Security", "Power Backup", "Covered Parking", "Retail Arcade", "EV Charging"],
    images: ["apartment-1", "interior-2", "lobby-1", "apartment-2"],
    floorPlans: [
      { name: "Studio Suite", bhk: "1", areaSqft: 520, price: 8900000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "1 BHK Suite", bhk: "1", areaSqft: 720, price: 11200000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "2 BHK Suite", bhk: "2", areaSqft: 1040, price: 14200000, imageUrl: "/images/floorplan-2bhk.svg" },
    ],
    nearby: [
      { name: "Sector 62 metro (Blue Line)", distance: "0.9 km" },
      { name: "Sector 62 office belt", distance: "1.2 km" },
      { name: "Fortis Hospital Noida", distance: "3.4 km" },
      { name: "DLF Mall of India", distance: "6.8 km" },
    ],
  },
  {
    name: "Arclight Business Suites",
    slug: "arclight-business-suites",
    tagline: "Compact managed suites for extended business stays.",
    developer: "arclight-realty",
    location: "delhi-ncr",
    address: "Okhla Phase III, New Delhi 110020 (demonstration)",
    propertyType: "RESIDENTIAL",
    category: "Serviced apartment",
    startingPrice: 11500000,
    maxPrice: 18600000,
    bhkConfigs: ["1", "2"],
    status: "UNDER_CONSTRUCTION",
    possessionDate: "2027-12-31",
    featured: false,
    lat: 28.5486,
    lng: 77.2682,
    description:
      "Arclight Business Suites is sample inventory for the demonstration only. The brief describes a small block of furnished suites aimed at extended business stays, with a reception, housekeeping and meeting rooms. No approval, licence or rental yield shown here has been verified.",
    highlights: [
      "Demonstration serviced-suite concept",
      "Built for extended business stays",
      "Meeting rooms and reception desk",
      "Close to the Okhla business district",
    ],
    amenities: ["Concierge", "Co-working Lounge", "Gymnasium", "24x7 Security", "Power Backup", "Covered Parking", "Retail Arcade"],
    images: ["commercial-2", "interior-7", "lobby-1", "office-1"],
    floorPlans: [
      { name: "1 BHK Suite · Business", bhk: "1", areaSqft: 690, price: 11500000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "2 BHK Suite · Business", bhk: "2", areaSqft: 980, price: 18600000, imageUrl: "/images/floorplan-2bhk.svg" },
    ],
    nearby: [
      { name: "Okhla NSIC metro (Magenta Line)", distance: "1.1 km" },
      { name: "Okhla Industrial Estate", distance: "1.6 km" },
      { name: "Jamia Millia Islamia", distance: "3.2 km" },
      { name: "Apollo Spectra Okhla", distance: "2.4 km" },
    ],
  },
];

const faqs = [
  {
    question: "How does Innovations verify the projects listed here?",
    answer:
      "This is a demonstration platform, so the projects shown are sample data and are not verified listings. In a live deployment, Innovations would verify developer identity, project documents and RERA registration before marking a listing verified. We never display a RERA number as verified unless it has been checked against the relevant state authority.",
    category: "Listings",
    sortOrder: 1,
  },
  {
    question: "Are the prices and possession dates shown final?",
    answer:
      "No. All prices, configurations and possession dates in this demo are illustrative. In a live project, pricing is subject to developer inventory, floor rise, taxes and prevailing offers, and possession dates are estimates. Always confirm current details directly with the sales team.",
    category: "Pricing",
    sortOrder: 2,
  },
  {
    question: "Can I schedule a site visit through Innovations?",
    answer:
      "Yes. Open any project page and choose “Schedule a site visit”, or ask the AI assistant. Your request is stored securely and a sales coordinator would confirm the slot. In this demo, requests are stored in the local database and are not sent to a real sales team.",
    category: "Site visits",
    sortOrder: 3,
  },
  {
    question: "What does the AI assistant do with my conversation?",
    answer:
      "The assistant extracts search criteria such as location, budget and BHK, then queries the Innovations database for matching projects. With the default configuration it runs entirely on our server using rules. If an AI provider is configured, only the scrubbed message is sent for intent extraction; project facts always come from our database.",
    category: "AI assistant",
    sortOrder: 4,
  },
  {
    question: "Does the AI assistant support Hindi and Hinglish?",
    answer:
      "Yes. You can type or speak in English, Hindi (Devanagari) or Hinglish. Voice input and spoken replies use the browser's Web Speech APIs, so support varies by browser. Text input always works as a fallback.",
    category: "AI assistant",
    sortOrder: 5,
  },
  {
    question: "How do I save projects for later?",
    answer:
      "Create a free account and use the bookmark icon on any project card. Saved projects are private to your account and appear under Dashboard → Saved projects. You can remove them at any time.",
    category: "Account",
    sortOrder: 6,
  },
  {
    question: "Can I compare projects side by side?",
    answer:
      "Yes. Use the comparison section on the homepage, the compare page, or ask the AI assistant to compare two or three projects. The comparison uses database fields such as starting price, configuration, location, status, possession and amenities.",
    category: "Listings",
    sortOrder: 7,
  },
  {
    question: "What is RERA and why does the badge say “not verified”?",
    answer:
      "RERA is the Real Estate (Regulation and Development) Act regime under which many projects must register. Because this site is a demonstration, no RERA number is presented as real. The “not verified” badge is deliberate: we do not invent approvals. Buyers should independently verify any registration on the relevant state RERA portal.",
    category: "Legal",
    sortOrder: 8,
  },
  {
    question: "How is my personal information protected?",
    answer:
      "Passwords are hashed with bcrypt and sessions use signed, HTTP-only cookies. Lead data is only visible to authorised staff through the admin dashboard. See the privacy policy for the full demonstration data-handling statement.",
    category: "Privacy",
    sortOrder: 9,
  },
  {
    question: "Is this a real estate brokerage?",
    answer:
      "No. Innovations is a demonstration project built to showcase a modern real-estate discovery experience. It is not a registered broker, does not solicit bookings and does not sell property. All project and developer names are fictional.",
    category: "General",
    sortOrder: 10,
  },
];

const testimonials = [
  {
    name: "Ananya Mehra",
    role: "Sample buyer · Noida Extension",
    quote:
      "What I liked was the calm. Instead of twenty tabs and pushy calls, I could compare three projects on price, possession and amenities, then ask follow-up questions in Hinglish.",
    rating: 5,
    sortOrder: 1,
  },
  {
    name: "Rohan Bhatia",
    role: "Sample buyer · Noida",
    quote:
      "The filters actually worked the way I think about a home: budget first, then BHK, then how soon I can move in. The comparison table saved a weekend of spreadsheets.",
    rating: 5,
    sortOrder: 2,
  },
  {
    name: "Sana Qureshi",
    role: "Sample investor · Greater Noida",
    quote:
      "I was looking at commercial units and appreciated that the listing did not pretend to have approvals. The demo disclaimer was clear, which made the whole experience feel more honest.",
    rating: 5,
    sortOrder: 3,
  },
  {
    name: "Vikram Sethi",
    role: "Sample buyer · Sector 137",
    quote:
      "The AI assistant understood “Noida mein 70 lakh ke andar 2 BHK” immediately and showed real cards from the database. No imaginary projects.",
    rating: 4,
    sortOrder: 4,
  },
  {
    name: "Neha Kulkarni",
    role: "Sample buyer · Greater Noida West",
    quote:
      "Saving projects and coming back later was simple. The dashboard kept my inquiries and site visit request in one place.",
    rating: 5,
    sortOrder: 5,
  },
  {
    name: "Arjun Malhotra",
    role: "Sample buyer · Delhi NCR",
    quote:
      "A clean, fast site with sensible details. I would want the live version to carry verified RERA data, but as a product demonstration it is unusually complete.",
    rating: 5,
    sortOrder: 6,
  },
];

async function main() {
  console.log("Resetting Innovations demo data…");
  await prisma.leadNote.deleteMany();
  await prisma.siteVisit.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.savedProject.deleteMany();
  await prisma.projectAmenity.deleteMany();
  await prisma.projectImage.deleteMany();
  await prisma.floorPlan.deleteMany();
  await prisma.brochure.deleteMany();
  await prisma.project.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.location.deleteMany();
  await prisma.developer.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  const [adminHash, agentHash, userHash] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash("Agent@12345", 12),
    bcrypt.hash("Demo@12345", 12),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: process.env.SEED_ADMIN_NAME || "Innovations Admin",
      email: (process.env.SEED_ADMIN_EMAIL || "admin@innovations.demo").toLowerCase(),
      passwordHash: adminHash,
      role: "ADMIN",
      phone: "9999900001",
    },
  });
  const agent = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "agent@innovations.demo",
      passwordHash: agentHash,
      role: "AGENT",
      phone: "9999900002",
    },
  });
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo Buyer",
      email: "demo@innovations.demo",
      passwordHash: userHash,
      role: "USER",
      phone: "9999900003",
    },
  });

  const developerMap = new Map();
  for (const developer of developers) {
    const created = await prisma.developer.create({ data: { ...developer, isDemo: true } });
    developerMap.set(developer.slug, created);
  }

  const locationMap = new Map();
  for (const location of locations) {
    const created = await prisma.location.create({
      data: {
        name: location.name,
        slug: location.slug,
        city: location.city,
        state: location.state,
        description: location.description,
        imageUrl: location.imageUrl,
        highlights: json(location.highlights),
        sortOrder: location.sortOrder,
      },
    });
    locationMap.set(location.slug, created);
  }

  const amenityMap = new Map();
  for (const name of amenityNames) {
    const created = await prisma.amenity.create({ data: { name } });
    amenityMap.set(name, created);
  }

  const projectMap = new Map();
  for (const p of projects) {
    const developer = developerMap.get(p.developer);
    const location = locationMap.get(p.location);
    const cover = p.images[0];
    const project = await prisma.project.create({
      data: {
        name: p.name,
        slug: p.slug,
        tagline: p.tagline,
        developerId: developer.id,
        locationId: location.id,
        address: p.address,
        propertyType: p.propertyType,
        category: p.category,
        startingPrice: p.startingPrice,
        maxPrice: p.maxPrice,
        bhkConfigs: json(p.bhkConfigs),
        status: p.status,
        possessionDate: new Date(p.possessionDate),
        reraNumber: null,
        reraVerified: false,
        description: p.description,
        highlights: json(p.highlights),
        mapEmbedUrl: mapUrl(p.lat, p.lng),
        mapLat: p.lat,
        mapLng: p.lng,
        nearbyPlaces: json(p.nearby),
        brochureUrl: `/api/projects/${p.slug}/brochure`,
        heroImage: `/images/${cover}.jpg`,
        featured: p.featured,
        published: true,
        isDemo: true,
        images: {
          create: p.images.map((img, index) => ({
            url: `/images/${img}.jpg`,
            alt: `${p.name} — demonstration image ${index + 1}`,
            sortOrder: index,
            isCover: index === 0,
          })),
        },
        amenities: {
          create: p.amenities.map((name) => ({ amenityId: amenityMap.get(name).id })),
        },
        floorPlans: {
          create: p.floorPlans.map((plan, index) => ({
            name: plan.name,
            bhk: plan.bhk,
            areaSqft: plan.areaSqft,
            price: plan.price,
            imageUrl: plan.imageUrl,
            sortOrder: index,
          })),
        },
        brochures: {
          create: [
            {
              title: `${p.name} — demo brochure`,
              fileUrl: `/api/projects/${p.slug}/brochure`,
              fileSize: 48_000,
            },
          ],
        },
        metaTitle: `${p.name} — demo project in ${location.name} | Innovations`,
        metaDescription: `${p.tagline} Explore demo pricing, configurations and possession details for ${p.name}, ${location.name}. Sample data only.`,
      },
    });
    projectMap.set(p.slug, project);
  }

  // A draft listing so admins can see the draft state without affecting the
  // public site.
  await prisma.project.create({
    data: {
      name: "Aurelia Riverside (draft)",
      slug: "aurelia-riverside-draft",
      tagline: "Internal draft — not published.",
      developerId: developerMap.get("aurelia-estates").id,
      locationId: locationMap.get("noida").id,
      address: "Sector 150, Noida (draft address)",
      propertyType: "RESIDENTIAL",
      category: "Apartment",
      startingPrice: 15000000,
      maxPrice: 22000000,
      bhkConfigs: json(["3", "4"]),
      status: "UPCOMING",
      possessionDate: new Date("2029-12-31"),
      description:
        "This is an unpublished draft listing seeded so the admin dashboard can demonstrate draft and published states. It is sample data and is not visible on the public website.",
      highlights: json(["Draft listing", "Admin-only"]),
      featured: false,
      published: false,
      isDemo: true,
      heroImage: "/images/exterior-12.jpg",
      images: { create: [{ url: "/images/exterior-12.jpg", alt: "Draft project", isCover: true }] },
      amenities: { create: [{ amenityId: amenityMap.get("Landscaped Gardens").id }] },
    },
  });

  for (const faq of faqs) {
    await prisma.faq.create({ data: { ...faq, published: true } });
  }
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: { ...testimonial, published: true } });
  }

  const savedSlugs = ["aurelia-grove", "nova-verde-central", "the-meridian"];
  for (const slug of savedSlugs) {
    await prisma.savedProject.create({
      data: { userId: demoUser.id, projectId: projectMap.get(slug).id },
    });
  }

  const inquirySeeds = [
    {
      name: demoUser.name,
      phone: demoUser.phone,
      email: demoUser.email,
      project: "aurelia-grove",
      inquiryType: "CALLBACK",
      message: "Please call me in the evening about the 3 BHK layouts.",
      status: "CONTACTED",
      source: "project-page",
      assignedToId: agent.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
    {
      name: "Karan Verma",
      phone: "9876543210",
      email: "karan@example.com",
      project: "nova-verde-central",
      inquiryType: "BROCHURE",
      message: "Requesting the demo brochure.",
      status: "NEW",
      source: "ai-assistant",
      assignedToId: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      name: "Ishita Rao",
      phone: "9812345678",
      email: null,
      project: "arclight-one",
      inquiryType: "CONTACT",
      message: "Looking for a 2,000 sq ft office suite in Noida.",
      status: "QUALIFIED",
      source: "project-page",
      assignedToId: agent.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
    },
    {
      name: "Dev Kapoor",
      phone: "9988776655",
      email: "dev@example.com",
      project: "sanctum-vanya-villas",
      inquiryType: "SITE_VISIT",
      message: "Would like to see the villa layout this weekend.",
      status: "NEW",
      source: "homepage",
      assignedToId: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 20),
    },
  ];

  for (const inquiry of inquirySeeds) {
    const created = await prisma.inquiry.create({
      data: {
        name: inquiry.name,
        phone: inquiry.phone,
        email: inquiry.email,
        projectId: projectMap.get(inquiry.project).id,
        projectName: projectMap.get(inquiry.project).name,
        inquiryType: inquiry.inquiryType,
        message: inquiry.message,
        status: inquiry.status,
        source: inquiry.source,
        assignedToId: inquiry.assignedToId,
        createdAt: inquiry.createdAt,
      },
    });
    if (inquiry.status !== "NEW") {
      await prisma.leadNote.create({
        data: {
          inquiryId: created.id,
          authorId: agent.id,
          note: "Demo note: introductory call completed, details shared over WhatsApp.",
        },
      });
    }
  }

  await prisma.siteVisit.createMany({
    data: [
      {
        userId: demoUser.id,
        projectId: projectMap.get("aurelia-grove").id,
        name: demoUser.name,
        phone: demoUser.phone,
        email: demoUser.email,
        preferredDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
        preferredTime: "11:00 AM – 12:00 PM",
        message: "Interested in the 3 BHK show flat.",
        status: "CONFIRMED",
      },
      {
        userId: null,
        projectId: projectMap.get("sanctum-vanya-villas").id,
        name: "Dev Kapoor",
        phone: "9988776655",
        email: "dev@example.com",
        preferredDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
        preferredTime: "4:00 PM – 5:00 PM",
        message: "Villa site visit with family.",
        status: "PENDING",
      },
    ],
  });

  console.log(`Seeded ${projects.length + 1} projects, ${locations.length} locations, ${developers.length} demo developers.`);
  console.log(`Admin: ${admin.email} / ${adminPassword}`);
  console.log("Agent: agent@innovations.demo / Agent@12345");
  console.log("Buyer: demo@innovations.demo / Demo@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
