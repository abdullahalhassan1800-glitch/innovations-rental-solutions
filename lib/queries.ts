import { db } from "./db";
import { PAGE_SIZE } from "./constants";
import type { Prisma } from "@prisma/client";

export type ProjectSearchFilters = {
  q?: string;
  location?: string;
  propertyType?: string;
  category?: string;
  bhk?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  possession?: string;
  amenities?: string[];
  developer?: string;
  featured?: boolean;
  sort?: string;
};

export const projectCardInclude = {
  developer: { select: { id: true, name: true, slug: true } },
  location: { select: { id: true, name: true, slug: true, city: true } },
  images: {
    orderBy: [{ isCover: "desc" as const }, { sortOrder: "asc" as const }],
    take: 1,
    select: { id: true, url: true, alt: true, isCover: true },
  },
  _count: { select: { amenities: true } },
} satisfies Prisma.ProjectInclude;

export type ProjectCardData = Prisma.ProjectGetPayload<{ include: typeof projectCardInclude }>;

function buildWhere(filters: ProjectSearchFilters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {
    published: true,
    archived: false,
    ...(filters.featured ? { featured: true } : {}),
  };

  if (filters.q) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q } },
      { tagline: { contains: q } },
      { description: { contains: q } },
      { address: { contains: q } },
      { category: { contains: q } },
      { developer: { name: { contains: q } } },
      { location: { name: { contains: q } } },
    ];
  }

  if (filters.location) {
    where.location = { slug: filters.location };
  }
  if (filters.developer) {
    where.developer = { OR: [{ slug: filters.developer }, { id: filters.developer }] };
  }
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.category) where.category = filters.category;
  if (filters.bhk) where.bhkConfigs = { contains: `"${filters.bhk}"` };
  if (filters.status) where.status = filters.status;

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { startingPrice: { gte: filters.minPrice ?? 0, ...(filters.maxPrice ? { lte: filters.maxPrice } : {}) } },
    ];
  }

  if (filters.possession) {
    if (filters.possession === "READY_TO_MOVE") {
      where.status = "READY_TO_MOVE";
    } else if (filters.possession === "2028+") {
      where.possessionDate = { gte: new Date("2028-01-01T00:00:00.000Z") };
    } else if (/^\d{4}$/.test(filters.possession)) {
      const year = Number(filters.possession);
      where.possessionDate = {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
      };
    }
  }

  if (filters.amenities?.length) {
    for (const name of filters.amenities) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        { amenities: { some: { amenity: { name } } } },
      ];
    }
  }

  return where;
}

function buildOrderBy(sort?: string): Prisma.ProjectOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ startingPrice: "asc" }, { createdAt: "desc" }];
    case "price-desc":
      return [{ startingPrice: "desc" }, { createdAt: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    case "possession":
      return [{ possessionDate: "asc" }, { createdAt: "desc" }];
    default:
      return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

export async function searchProjects(filters: ProjectSearchFilters, page = 1) {
  const where = buildWhere(filters);
  const safePage = Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1);
  const [total, projects] = await Promise.all([
    db.project.count({ where }),
    db.project.findMany({
      where,
      include: projectCardInclude,
      orderBy: buildOrderBy(filters.sort),
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    projects,
    total,
    page: safePage,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getFeaturedProjects(limit = 3) {
  return db.project.findMany({
    where: { published: true, archived: false, featured: true },
    include: projectCardInclude,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
}

export async function getProjectsByStatus(status: string, limit = 3) {
  return db.project.findMany({
    where: { published: true, archived: false, status },
    include: projectCardInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getProjectsByType(propertyType: string, limit = 3) {
  return db.project.findMany({
    where: { published: true, archived: false, propertyType },
    include: projectCardInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getProjectsByCategory(category: string, limit = 3) {
  return db.project.findMany({
    where: { published: true, archived: false, category },
    include: projectCardInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getProjectBySlug(slug: string) {
  return db.project.findFirst({
    where: { slug, published: true, archived: false },
    include: {
      developer: true,
      location: true,
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      amenities: { include: { amenity: true } },
      floorPlans: { orderBy: { sortOrder: "asc" } },
      brochures: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getSimilarProjects(project: { id: string; locationId: string; propertyType: string; startingPrice: number }, limit = 3) {
  return db.project.findMany({
    where: {
      published: true,
      archived: false,
      id: { not: project.id },
      OR: [
        { locationId: project.locationId },
        { propertyType: project.propertyType },
      ],
      startingPrice: {
        gte: Math.floor(project.startingPrice * 0.6),
        lte: Math.ceil(project.startingPrice * 1.6),
      },
    },
    include: projectCardInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getSavedProjectIds(userId?: string | null) {
  if (!userId) return [] as string[];
  const rows = await db.savedProject.findMany({
    where: { userId },
    select: { projectId: true },
  });
  return rows.map((r) => r.projectId);
}

export async function getAllLocations() {
  return db.location.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getAllDevelopers() {
  return db.developer.findMany({ orderBy: { name: "asc" } });
}

export async function getAllAmenities() {
  return db.amenity.findMany({ orderBy: { name: "asc" } });
}

export async function getPublishedFaqs(limit?: number) {
  return db.faq.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    ...(limit ? { take: limit } : {}),
  });
}

export async function getPublishedTestimonials(limit?: number) {
  return db.testimonial.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    ...(limit ? { take: limit } : {}),
  });
}

export async function getProjectCounts() {
  const [total, residential, commercial, resort, serviced, locations, developers] = await Promise.all([
    db.project.count({ where: { published: true, archived: false } }),
    db.project.count({ where: { published: true, archived: false, propertyType: "RESIDENTIAL" } }),
    db.project.count({ where: { published: true, archived: false, propertyType: "COMMERCIAL" } }),
    db.project.count({ where: { published: true, archived: false, category: "Resort" } }),
    db.project.count({ where: { published: true, archived: false, category: "Serviced apartment" } }),
    db.location.count(),
    db.developer.count(),
  ]);
  return { total, residential, commercial, resort, serviced, locations, developers };
}
