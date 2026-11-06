import { db } from "./db";
import { slugify, toJsonList } from "./utils";
import type { z } from "zod";
import type { projectSchema } from "./validation";

export type ProjectInput = z.infer<typeof projectSchema>;

function possessions(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function scalarData(input: ProjectInput) {
  return {
    name: input.name,
    tagline: input.tagline || null,
    developerId: input.developerId,
    locationId: input.locationId,
    address: input.address,
    propertyType: input.propertyType,
    category: input.category,
    startingPrice: input.startingPrice,
    maxPrice: input.maxPrice ?? null,
    bhkConfigs: toJsonList(input.bhkConfigs) ?? "[]",
    status: input.status,
    possessionDate: possessions(input.possessionDate),
    reraNumber: input.reraVerified ? input.reraNumber || null : null,
    reraVerified: input.reraVerified,
    description: input.description,
    highlights: toJsonList(input.highlights) ?? "[]",
    amenityNotes: input.amenityNotes || null,
    mapEmbedUrl: input.mapEmbedUrl || null,
    mapLat: input.mapLat ?? null,
    mapLng: input.mapLng ?? null,
    nearbyPlaces: input.nearbyPlaces.length ? JSON.stringify(input.nearbyPlaces) : null,
    brochureUrl: input.brochureUrl || null,
    heroImage: input.heroImage || input.images[0]?.url || null,
    featured: input.featured,
    published: input.published,
    isDemo: input.isDemo,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
  };
}

export async function assertProjectSlug(slug: string, excludeId?: string) {
  const existing = await db.project.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== excludeId) {
    throw new Error("A project with this slug already exists");
  }
}

export async function createProject(input: ProjectInput) {
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);
  await assertProjectSlug(slug);

  return db.project.create({
    data: {
      ...scalarData(input),
      slug,
      images: {
        create: input.images.map((image, index) => ({
          url: image.url,
          alt: image.alt || null,
          sortOrder: index,
          isCover: image.isCover ?? index === 0,
        })),
      },
      amenities: {
        create: input.amenityIds.map((amenityId) => ({ amenityId })),
      },
      floorPlans: {
        create: input.floorPlans.map((plan, index) => ({
          name: plan.name,
          bhk: plan.bhk || null,
          areaSqft: plan.areaSqft ?? null,
          price: plan.price ?? null,
          imageUrl: plan.imageUrl || null,
          sortOrder: index,
        })),
      },
      ...(input.brochureUrl
        ? {
            brochures: {
              create: [
                {
                  title: `${input.name} — sample brochure`,
                  fileUrl: input.brochureUrl,
                },
              ],
            },
          }
        : {}),
    },
    select: { id: true, slug: true },
  });
}

export async function updateProject(id: string, input: ProjectInput) {
  const existing = await db.project.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!existing) throw new Error("Project not found");
  const slug = input.slug ? slugify(input.slug) : existing.slug;
  if (slug !== existing.slug) await assertProjectSlug(slug, id);

  return db.$transaction(async (tx) => {
    await tx.projectImage.deleteMany({ where: { projectId: id } });
    await tx.floorPlan.deleteMany({ where: { projectId: id } });
    await tx.projectAmenity.deleteMany({ where: { projectId: id } });
    await tx.brochure.deleteMany({ where: { projectId: id } });

    return tx.project.update({
      where: { id },
      data: {
        ...scalarData(input),
        slug,
        images: {
          create: input.images.map((image, index) => ({
            url: image.url,
            alt: image.alt || null,
            sortOrder: index,
            isCover: image.isCover ?? index === 0,
          })),
        },
        amenities: {
          create: input.amenityIds.map((amenityId) => ({ amenityId })),
        },
        floorPlans: {
          create: input.floorPlans.map((plan, index) => ({
            name: plan.name,
            bhk: plan.bhk || null,
            areaSqft: plan.areaSqft ?? null,
            price: plan.price ?? null,
            imageUrl: plan.imageUrl || null,
            sortOrder: index,
          })),
        },
        ...(input.brochureUrl
          ? {
              brochures: {
                create: [
                  {
                    title: `${input.name} — sample brochure`,
                    fileUrl: input.brochureUrl,
                  },
                ],
              },
            }
          : {}),
      },
      select: { id: true, slug: true },
    });
  });
}

