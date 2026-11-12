import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED_RESET !== "true") {
  throw new Error("Refusing to reset data in production. Set ALLOW_SEED_RESET=true to override.");
}

const json = (value) => JSON.stringify(value);

const mapUrl = (lat, lng, spread = 0.018) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${lng - spread}%2C${lat - spread}%2C${lng + spread}%2C${lng + spread}&layer=mapnik&marker=${lat}%2C${lng}`;

const developers = [
  {
    name: "Westline",
    slug: "westline",
    description:
      "Reputed builder partner behind Signature in Mangalore, known for quality residential developments in coastal Karnataka.",
    establishedYear: 2010,
    website: "https://www.rentofree.com",
  },
  {
    name: "Parth Group",
    slug: "parth-group",
    description:
      "Bangalore-based developer delivering residential apartments with strong rental demand in the city's growth corridors.",
    establishedYear: 2008,
    website: "https://www.rentofree.com",
  },
  {
    name: "Gravity Homes",
    slug: "gravity-homes",
    description:
      "Karnataka developer focused on premium residential and garden-oriented homes with verified rental yield potential.",
    establishedYear: 2012,
    website: "https://www.rentofree.com",
  },
  {
    name: "Aqua Gardens",
    slug: "aqua-gardens",
    description:
      "Developer behind Vrinda Gardens in Greater Noida West, offering accessible NCR entry points with rental yield upside.",
    establishedYear: 2014,
    website: "https://www.rentofree.com",
  },
];

const locations = [
  {
    name: "Mangalore",
    slug: "mangalore",
    city: "Mangalore",
    state: "Karnataka",
    sortOrder: 1,
    imageUrl: "/images/rentofree/1.webp",
    description:
      "Coastal Karnataka city with a growing residential market, verified builder partnerships and rental yield opportunities under the Rentofree model.",
    highlights: [
      "Coastal Karnataka location",
      "Premium residential investment",
      "Verified builder partnership",
      "5% rental yield potential",
    ],
  },
  {
    name: "Bangalore",
    slug: "bangalore",
    city: "Bangalore",
    state: "Karnataka",
    sortOrder: 2,
    imageUrl: "/images/rentofree/2.webp",
    description:
      "India's IT capital with strong rental demand, growth corridor locations and verified residential investment opportunities.",
    highlights: [
      "IT city rental demand",
      "Growth corridor addresses",
      "Verified builder partnership",
      "5% rental yield potential",
    ],
  },
  {
    name: "Bengaluru",
    slug: "bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    sortOrder: 3,
    imageUrl: "/images/rentofree/3.webp",
    description:
      "Premium Bengaluru residential market with higher-ticket assets, Gravity Homes developments and structured rental yield options.",
    highlights: [
      "Premium residential address",
      "Gravity Homes development",
      "5% rental yield model",
      "Consultation and site visit support",
    ],
  },
  {
    name: "Greater Noida West",
    slug: "greater-noida-west",
    city: "Greater Noida West",
    state: "Uttar Pradesh",
    sortOrder: 4,
    imageUrl: "/images/rentofree/4.webp",
    description:
      "NCR's value-led residential destination with accessible entry points starting at ₹85 Lacs and 5% rental yield potential.",
    highlights: [
      "NCR / Greater Noida West location",
      "Accessible entry ticket from ₹85 Lacs",
      "5% rental yield opportunity",
      "Transparent listing support",
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
  "Security",
  "Parking",
  "Power backup",
  "Community spaces",
  "Gym",
  "Swimming pool",
  "Kids play area",
  "Landscaped campus",
  "Club facilities",
  "Open spaces",
  "Park",
  "Community hall",
  "Play area",
  "Gardens",
  "Walking tracks",
];

const projects = [
  {
    name: "Signature",
    slug: "signature",
    tagline: "Premium residential investment in Mangalore with verified documentation.",
    developer: "westline",
    location: "mangalore",
    address: "Mangalore, Karnataka",
    propertyType: "RESIDENTIAL",
    category: "Premium Residential",
    startingPrice: 15000000,
    maxPrice: 45000000,
    bhkConfigs: ["2", "3", "4"],
    status: "READY_TO_MOVE",
    possessionDate: "2026-12-31",
    featured: true,
    lat: 12.9141,
    lng: 74.856,
    description:
      "Signature by Westline is a premium residential investment in Mangalore, curated for the Rentofree model with verified documentation and rental yield potential. A quality development from a reputed builder partner, screened for legal and rental fit.",
    highlights: [
      "Title & legal verification support",
      "Structured rental yield model",
      "Premium builder partner project",
      "Site visit and advisor assistance",
    ],
    amenities: ["Clubhouse", "Landscaped Gardens", "Security", "Parking", "Power backup", "Community spaces"],
    images: ["1.webp", "hero-building.webp", "property-interior.webp", "property-amenities.webp"],
    floorPlans: [
      { name: "2 BHK · Type A", bhk: "2", areaSqft: 1240, price: 15000000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "3 BHK · Type B", bhk: "3", areaSqft: 1685, price: 30000000, imageUrl: "/images/floorplan-3bhk.svg" },
      { name: "4 BHK · Type C", bhk: "4", areaSqft: 2340, price: 45000000, imageUrl: "/images/floorplan-4bhk.svg" },
    ],
    nearby: [
      { name: "City centre", distance: "2.0 km" },
      { name: "Railway station", distance: "3.5 km" },
      { name: "Airport", distance: "15 km" },
    ],
  },
  {
    name: "Parth Gardenia",
    slug: "parth-gardenia",
    tagline: "Bangalore residential investment with 5% rental yield potential.",
    developer: "parth-group",
    location: "bangalore",
    address: "Bangalore, Karnataka",
    propertyType: "RESIDENTIAL",
    category: "Residential Apartments",
    startingPrice: 13000000,
    maxPrice: 26000000,
    bhkConfigs: ["2", "3"],
    status: "READY_TO_MOVE",
    possessionDate: "2026-06-30",
    featured: true,
    lat: 12.9716,
    lng: 77.5946,
    description:
      "Parth Gardenia is a residential project in Bangalore designed for investors who want city demand with a clearer rental pathway. Strong rental demand in a major IT city with flexible configurations across price bands.",
    highlights: [
      "Located in Bangalore's growth corridor",
      "5% rental yield opportunity",
      "Verified builder partnership",
      "Advisor-led onboarding",
    ],
    amenities: ["Gym", "Swimming pool", "Kids play area", "Security", "Parking", "Clubhouse"],
    images: ["2.webp", "property-parth-gardenia.webp", "property-interior.webp", "property-amenities.webp"],
    floorPlans: [
      { name: "2 BHK", bhk: "2", areaSqft: 1100, price: 13000000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "3 BHK", bhk: "3", areaSqft: 1450, price: 26000000, imageUrl: "/images/floorplan-3bhk.svg" },
    ],
    nearby: [
      { name: "IT corridor", distance: "3.0 km" },
      { name: "Metro station", distance: "1.5 km" },
      { name: "Hospital", distance: "2.5 km" },
    ],
  },
  {
    name: "Gravity Aranya",
    slug: "gravity-aranya",
    tagline: "Premium Bengaluru listing from Gravity Homes with 5% rental yield.",
    developer: "gravity-homes",
    location: "bengaluru",
    address: "Bengaluru, Karnataka",
    propertyType: "RESIDENTIAL",
    category: "Premium Homes",
    startingPrice: 35000000,
    maxPrice: 35000000,
    bhkConfigs: ["3", "4"],
    status: "READY_TO_MOVE",
    possessionDate: "2026-09-30",
    featured: true,
    lat: 12.9716,
    lng: 77.5946,
    description:
      "Gravity Aranya offers a premium residential setting in Bengaluru from Gravity Homes. Positioned for investors seeking higher-ticket residential assets with rental yield and consultation support.",
    highlights: [
      "Premium Bengaluru address",
      "Gravity Homes development",
      "5% rental yield model",
      "Consultation and site visit support",
    ],
    amenities: ["Landscaped campus", "Club facilities", "Security", "Parking", "Power backup", "Open spaces"],
    images: ["3.webp", "hero-building.webp", "property-interior.webp", "property-amenities.webp"],
    floorPlans: [
      { name: "3 BHK · Premium", bhk: "3", areaSqft: 1800, price: 35000000, imageUrl: "/images/floorplan-3bhk.svg" },
      { name: "4 BHK · Premium", bhk: "4", areaSqft: 2400, price: 35000000, imageUrl: "/images/floorplan-4bhk.svg" },
    ],
    nearby: [
      { name: "City centre", distance: "4.0 km" },
      { name: "Metro station", distance: "2.0 km" },
      { name: "Hospital", distance: "3.0 km" },
    ],
  },
  {
    name: "Vrinda Gardens",
    slug: "vrinda-gardens",
    tagline: "Accessible NCR residential option starting at ₹85 Lacs.",
    developer: "aqua-gardens",
    location: "greater-noida-west",
    address: "Greater Noida West, NCR",
    propertyType: "RESIDENTIAL",
    category: "Residential",
    startingPrice: 8500000,
    maxPrice: 8500000,
    bhkConfigs: ["2", "3"],
    status: "READY_TO_MOVE",
    possessionDate: "2026-03-31",
    featured: true,
    lat: 28.4749,
    lng: 77.5121,
    description:
      "Vrinda Gardens in Greater Noida West is listed for investors who want a lower entry ticket in the NCR region. Starting from ₹85 Lacs with 5% rental yield potential under the Rentofree model.",
    highlights: [
      "Starting from ₹85 Lacs",
      "NCR / Greater Noida West location",
      "5% rental yield opportunity",
      "Transparent listing support",
    ],
    amenities: ["Park", "Security", "Parking", "Community hall", "Power backup", "Play area"],
    images: ["4.webp", "property-lakeview.webp", "property-interior.webp", "property-amenities.webp"],
    floorPlans: [
      { name: "2 BHK", bhk: "2", areaSqft: 950, price: 8500000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "3 BHK", bhk: "3", areaSqft: 1200, price: 8500000, imageUrl: "/images/floorplan-3bhk.svg" },
    ],
    nearby: [
      { name: "Expressway", distance: "5.0 km" },
      { name: "Metro station", distance: "3.0 km" },
      { name: "Schools", distance: "1.5 km" },
    ],
  },
  {
    name: "Gravity Smera Gardens",
    slug: "gravity-smera",
    tagline: "Karnataka residential project from Gravity Homes starting at 2.3 Cr.",
    developer: "gravity-homes",
    location: "bengaluru",
    address: "Karnataka",
    propertyType: "RESIDENTIAL",
    category: "Residential Gardens",
    startingPrice: 23000000,
    maxPrice: 23000000,
    bhkConfigs: ["2", "3"],
    status: "READY_TO_MOVE",
    possessionDate: "2026-12-31",
    featured: false,
    lat: 12.9716,
    lng: 77.5946,
    description:
      "Gravity Smera Gardens is a Karnataka residential project from Gravity Homes, listed for Rentofree investors at 2.3 Cr. Combines residential living with garden-oriented planning.",
    highlights: [
      "Gravity Homes project",
      "Starting at 2.3 Cr",
      "5% rental yield",
      "Site visit on request",
    ],
    amenities: ["Gardens", "Clubhouse", "Security", "Parking", "Walking tracks", "Community spaces"],
    images: ["Project_smera_banner.webp", "property-interior.webp", "property-amenities.webp"],
    floorPlans: [
      { name: "2 BHK · Garden-facing", bhk: "2", areaSqft: 1100, price: 23000000, imageUrl: "/images/floorplan-2bhk.svg" },
      { name: "3 BHK · Garden-facing", bhk: "3", areaSqft: 1400, price: 23000000, imageUrl: "/images/floorplan-3bhk.svg" },
    ],
    nearby: [
      { name: "City centre", distance: "3.0 km" },
      { name: "Metro station", distance: "2.0 km" },
      { name: "Garden", distance: "0.5 km" },
    ],
  },
];

const faqs = [
  {
    question: "What is the Rentofree model?",
    answer:
      "The Rentofree model lets you own premium property with zero investment — no down payment, rent paid in advance, and up to 5% rental yield. It's designed to make rental investing accessible and transparent.",
    category: "Model",
    sortOrder: 1,
  },
  {
    question: "Are these verified listings?",
    answer:
      "Yes. Every project listed is screened for legal and rental fit. We work with reputed builder partners and handle documentation, agreements and rental management professionally.",
    category: "Listings",
    sortOrder: 2,
  },
  {
    question: "Can NRIs invest?",
    answer:
      "Yes. NRIs can participate in eligible Rentofree opportunities, subject to applicable regulations and documentation. Our advisors assist with the required process, paperwork and onboarding.",
    category: "NRI",
    sortOrder: 3,
  },
  {
    question: "How is rental yield calculated?",
    answer:
      "Rental yield is generally calculated as annual rental income divided by the investment value, expressed as a percentage. For example, if annual rent is ₹2,70,000 on a ₹45,00,000 value, the yield is 5%.",
    category: "Returns",
    sortOrder: 4,
  },
  {
    question: "Can I schedule a site visit?",
    answer:
      "Yes. Open any project page and choose “Book a site visit”, or contact us directly. Our advisor will get back to you shortly.",
    category: "Site visits",
    sortOrder: 5,
  },
  {
    question: "How is my personal information protected?",
    answer:
      "Your details are handled securely and used only to connect you with our sales team. See the privacy policy for the full data-handling statement.",
    category: "Privacy",
    sortOrder: 6,
  },
];

const testimonials = [
  {
    name: "Rahul Mehta",
    role: "Bangalore · Investor",
    quote:
      "The process was clear from day one. I started receiving rental income without the usual down payment stress.",
    rating: 3,
    sortOrder: 1,
  },
  {
    name: "Priya Sharma",
    role: "Dubai · NRI Investor",
    quote:
      "Documentation support made everything smooth. Housirentz helped me invest confidently as an NRI.",
    rating: 4,
    sortOrder: 2,
  },
  {
    name: "Vikram Reddy",
    role: "Hyderabad · Investor",
    quote:
      "I compared traditional buying with Housirentz and chose this model. The rental yield and support exceeded expectations.",
    rating: 5,
    sortOrder: 3,
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
      name: process.env.SEED_ADMIN_NAME || "Housirentz Admin",
      email: (process.env.SEED_ADMIN_EMAIL || "admin@housirentz.demo").toLowerCase(),
      passwordHash: adminHash,
      role: "ADMIN",
      phone: "9999900001",
    },
  });
  const agent = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "agent@housirentz.demo",
      passwordHash: agentHash,
      role: "AGENT",
      phone: "9999900002",
    },
  });
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo Buyer",
      email: "demo@housirentz.demo",
      passwordHash: userHash,
      role: "USER",
      phone: "9999900003",
    },
  });

  const developerMap = new Map();
  for (const developer of developers) {
    const created = await prisma.developer.create({ data: { ...developer, isDemo: false } });
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
        heroImage: `/images/rentofree/${cover}`,
        featured: p.featured,
        published: true,
        isDemo: false,
        images: {
          create: p.images.map((img, index) => ({
            url: `/images/rentofree/${img}`,
            alt: `${p.name} — image ${index + 1}`,
            sortOrder: index,
            isCover: index === 0,
          })),
        },
        amenities: {
          create: p.amenities.map((name) => ({ amenityId: amenityMap.get(name)?.id })).filter(Boolean),
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
              title: `${p.name} — brochure`,
              fileUrl: `/api/projects/${p.slug}/brochure`,
              fileSize: 48_000,
            },
          ],
        },
        metaTitle: `${p.name} — ${p.location.name} | Housirentz Innovations`,
        metaDescription: `${p.tagline} Explore pricing, configurations and possession details for ${p.name}, ${location.name}.`,
      },
    });
    projectMap.set(p.slug, project);
  }

  for (const faq of faqs) {
    await prisma.faq.create({ data: { ...faq, published: true } });
  }
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: { ...testimonial, published: true } });
  }

  const savedSlugs = ["signature", "parth-gardenia", "gravity-aranya"];
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
      project: "signature",
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
      project: "parth-gardenia",
      inquiryType: "BROCHURE",
      message: "Requesting the brochure.",
      status: "NEW",
      source: "project-page",
      assignedToId: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      name: "Ishita Rao",
      phone: "9812345678",
      email: null,
      project: "gravity-aranya",
      inquiryType: "CONTACT",
      message: "Looking for a 2,000 sq ft office suite in Bengaluru.",
      status: "QUALIFIED",
      source: "project-page",
      assignedToId: agent.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
    },
    {
      name: "Dev Kapoor",
      phone: "9988776655",
      email: "dev@example.com",
      project: "vrinda-gardens",
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
          note: "Introductory call completed, details shared over WhatsApp.",
        },
      });
    }
  }

  await prisma.siteVisit.createMany({
    data: [
      {
        userId: demoUser.id,
        projectId: projectMap.get("signature").id,
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
        projectId: projectMap.get("vrinda-gardens").id,
        name: "Dev Kapoor",
        phone: "9988776655",
        email: "dev@example.com",
        preferredDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
        preferredTime: "4:00 PM – 5:00 PM",
        message: "Site visit with family.",
        status: "PENDING",
      },
    ],
  });

  console.log(`Seeded ${projects.length} projects, ${locations.length} locations, ${developers.length} developers.`);
  console.log(`Admin: ${admin.email} / ${adminPassword}`);
  console.log("Agent: agent@housirentz.demo / Agent@12345");
  console.log("Buyer: demo@housirentz.demo / Demo@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });