import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE } from "@/lib/constants";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/projects`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/residential`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/commercial`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/resort-housing`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/service-apartments`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/compare`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE.url}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE.url}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const [projects, locations] = await Promise.all([
      db.project.findMany({
        where: { published: true, archived: false },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.location.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    return [
      ...staticRoutes,
      ...locations.map((location) => ({
        url: `${SITE.url}/location/${location.slug}`,
        lastModified: location.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
      ...projects.map((project) => ({
        url: `${SITE.url}/projects/${project.slug}`,
        lastModified: project.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // The sitemap should still work before the database is seeded.
    return staticRoutes;
  }
}
