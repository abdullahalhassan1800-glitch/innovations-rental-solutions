import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Eye, MessagesSquare } from "lucide-react";
import { db } from "@/lib/db";
import { ProjectForm, type ProjectFormValues } from "@/components/admin/project-form";
import { parseBhk, parseJsonArray } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id }, select: { name: true } });
  return { title: project ? `Edit ${project.name}` : "Project not found" };
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const [project, developers, locations, amenities] = await Promise.all([
    db.project.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
        floorPlans: { orderBy: { sortOrder: "asc" } },
        amenities: { select: { amenityId: true } },
        _count: { select: { inquiries: true, siteVisits: true } },
      },
    }),
    db.developer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.location.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, city: true },
    }),
    db.amenity.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!project) notFound();

  const values: ProjectFormValues = {
    id: project.id,
    name: project.name,
    slug: project.slug,
    tagline: project.tagline,
    developerId: project.developerId,
    locationId: project.locationId,
    address: project.address,
    propertyType: project.propertyType,
    category: project.category,
    startingPrice: project.startingPrice,
    maxPrice: project.maxPrice,
    bhkConfigs: parseBhk(project.bhkConfigs),
    status: project.status,
    possessionDate: project.possessionDate ? project.possessionDate.toISOString().slice(0, 10) : null,
    reraNumber: project.reraNumber,
    reraVerified: project.reraVerified,
    description: project.description,
    highlights: parseJsonArray<string>(project.highlights),
    amenityNotes: project.amenityNotes,
    amenityIds: project.amenities.map((item) => item.amenityId),
    mapEmbedUrl: project.mapEmbedUrl,
    mapLat: project.mapLat,
    mapLng: project.mapLng,
    nearbyPlaces: parseJsonArray<{ name: string; distance: string }>(project.nearbyPlaces),
    brochureUrl: project.brochureUrl,
    heroImage: project.heroImage,
    images: project.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      isCover: image.isCover,
    })),
    floorPlans: project.floorPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      bhk: plan.bhk,
      areaSqft: plan.areaSqft,
      price: plan.price,
      imageUrl: plan.imageUrl,
    })),
    featured: project.featured,
    published: project.published,
    isDemo: project.isDemo,
    metaTitle: project.metaTitle,
    metaDescription: project.metaDescription,
  };

  return (
    <>
      <div className="mb-5 grid gap-2 rounded border border-line bg-surface p-3 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-[0.74rem] text-ink-soft">
          <Eye className="size-3.5 text-brass" /> {project.views} public views
        </div>
        <Link href="/admin/leads" className="flex items-center gap-2 text-[0.74rem] text-ink-soft transition hover:text-forest">
          <MessagesSquare className="size-3.5 text-brass" /> {project._count.inquiries} leads
        </Link>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <span className="text-[0.68rem] text-ink-muted">
            {project.published ? "Publicly visible" : "Draft — hidden from the public site"}
          </span>
          <Link
            href={`/projects/${project.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-forest hover:text-brass"
          >
            View <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      <ProjectForm
        project={values}
        developers={developers}
        locations={locations}
        amenities={amenities}
      />
    </>
  );
}
