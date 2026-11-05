import type { Metadata } from "next";
import { Building2, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { ProjectForm } from "@/components/admin/project-form";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const [developers, locations, amenities] = await Promise.all([
    db.developer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.location.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, city: true },
    }),
    db.amenity.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (developers.length === 0 || locations.length === 0) {
    return (
      <>
        <p className="eyebrow">Inventory</p>
        <h1 className="mt-3 font-display text-3xl">Add directory records first.</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-muted">
          Every project must belong to a developer and a location. Add at least one of each, then return
          here to create the listing.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="surface p-5">
            <Building2 className="size-5 text-brass" />
            <h2 className="mt-3 font-display text-xl">Developers</h2>
            <p className="mt-1 text-[0.78rem] text-ink-muted">{developers.length} in the directory.</p>
            <ButtonLink href="/admin/developers" size="sm" variant="outline" className="mt-4">
              Manage developers
            </ButtonLink>
          </div>
          <div className="surface p-5">
            <MapPin className="size-5 text-brass" />
            <h2 className="mt-3 font-display text-xl">Locations</h2>
            <p className="mt-1 text-[0.78rem] text-ink-muted">{locations.length} in the directory.</p>
            <ButtonLink href="/admin/locations" size="sm" variant="outline" className="mt-4">
              Manage locations
            </ButtonLink>
          </div>
        </div>
      </>
    );
  }

  return <ProjectForm developers={developers} locations={locations} amenities={amenities} />;
}
