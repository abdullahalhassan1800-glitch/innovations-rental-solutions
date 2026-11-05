import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { UserManager } from "@/components/admin/user-manager";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const rows = await db.user.findMany({
    include: {
      _count: { select: { inquiries: true, savedProjects: true, siteVisits: true } },
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });
  const users = rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    _count: user._count,
  }));

  return (
    <>
      <div className="mb-5">
        <p className="eyebrow">Access</p>
        <h1 className="mt-3 font-display text-3xl">Users.</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Manage buyer, agent and administrator access. Roles are enforced on the server for every
          protected route and API call.
        </p>
      </div>
      <UserManager users={users} currentUserId={admin.id} />
    </>
  );
}
