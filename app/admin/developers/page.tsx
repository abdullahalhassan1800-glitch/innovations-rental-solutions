import type { Metadata } from "next";
import { db } from "@/lib/db";
import { DeveloperManager } from "@/components/admin/developer-manager";

export const metadata: Metadata = { title: "Developers" };

export default async function AdminDevelopersPage() {
  const developers = await db.developer.findMany({
    include: { _count: { select: { projects: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="mb-5">
        <p className="eyebrow">Directory</p>
        <h1 className="mt-3 font-display text-3xl">Developers.</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Manage the developer profiles linked to projects. Sample data only — never publish claims about
          real companies without written authorization.
        </p>
      </div>
      <DeveloperManager developers={developers} />
    </>
  );
}

