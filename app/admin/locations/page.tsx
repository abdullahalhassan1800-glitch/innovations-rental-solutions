import type { Metadata } from "next";
import { db } from "@/lib/db";
import { LocationManager } from "@/components/admin/location-manager";
import { parseJsonArray } from "@/lib/utils";

export const metadata: Metadata = { title: "Locations" };

export default async function AdminLocationsPage() {
  const rows = await db.location.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const locations = rows.map((location) => ({
    ...location,
    highlights: parseJsonArray<string>(location.highlights),
  }));

  return (
    <>
      <div className="mb-5">
        <p className="eyebrow">Directory</p>
        <h1 className="mt-3 font-display text-3xl">Locations.</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          These micro-markets power the location pages, filters and search. Keep descriptions factual and
          clearly labelled as sample copy.
        </p>
      </div>
      <LocationManager locations={locations} />
    </>
  );
}
