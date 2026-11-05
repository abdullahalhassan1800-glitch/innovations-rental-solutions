import type { Metadata } from "next";
import { db } from "@/lib/db";
import { AmenityManager } from "@/components/admin/amenity-manager";

export const metadata: Metadata = { title: "Amenities" };

export default async function AdminAmenitiesPage() {
  const amenities = await db.amenity.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="mb-5">
        <p className="eyebrow">Directory</p>
        <h1 className="mt-3 font-display text-3xl">Amenities.</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          The shared amenity vocabulary used by project forms and public filters. Keep names short and
          specific.
        </p>
      </div>
      <AmenityManager amenities={amenities} />
    </>
  );
}
