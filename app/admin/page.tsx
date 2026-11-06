import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Eye,
  FolderKanban,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { InquiryBadge, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatDateTime, formatPriceShort } from "@/lib/utils";
import { PROJECT_STATUSES } from "@/lib/constants";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const [
    totalProjects,
    publishedProjects,
    archivedProjects,
    featuredProjects,
    totalLeads,
    newLeads,
    pendingVisits,
    totalUsers,
    recentLeads,
    recentVisits,
    topProjects,
    statusGroups,
  ] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { published: true, archived: false } }),
    db.project.count({ where: { archived: true } }),
    db.project.count({ where: { featured: true, archived: false } }),
    db.inquiry.count(),
    db.inquiry.count({ where: { status: "NEW" } }),
    db.siteVisit.count({ where: { status: "PENDING" } }),
    db.user.count({ where: { isActive: true } }),
    db.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { project: { select: { name: true } }, assignedTo: { select: { name: true } } },
    }),
    db.siteVisit.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { project: { select: { name: true } } },
    }),
    db.project.findMany({
      where: { archived: false },
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, name: true, slug: true, views: true, startingPrice: true, status: true, published: true },
    }),
    db.project.groupBy({
      by: ["status"],
      where: { archived: false },
      _count: { _all: true },
    }),
  ]);

  const stats = [
    { label: "Published projects", value: publishedProjects, sub: `${totalProjects} total · ${archivedProjects} archived`, icon: FolderKanban, href: "/admin/projects" },
    { label: "New leads", value: newLeads, sub: `${totalLeads} lifetime leads`, icon: MessageSquare, href: "/admin/leads?status=NEW" },
    { label: "Visits pending", value: pendingVisits, sub: "Awaiting confirmation", icon: CalendarClock, href: "/admin/site-visits" },
    { label: "Active users", value: totalUsers, sub: `${featuredProjects} featured projects`, icon: Users, href: "/admin/users" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 font-display text-3xl">Workspace overview.</h1>
          <p className="mt-2 text-sm text-ink-muted">A live snapshot of projects, leads and site visits in the sample database.</p>
        </div>
        <ButtonLink href="/admin/projects/new" size="sm"><Plus className="size-3.5" /> New project</ButtonLink>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group rounded-md border border-line bg-surface p-5 transition hover:border-ink/25 hover:shadow-card">
            <div className="flex items-center justify-between">
              <stat.icon className="size-4 text-brass" />
              <ArrowUpRight className="size-3.5 text-ink-muted opacity-0 transition group-hover:opacity-100" />
            </div>
            <p className="mt-4 font-display text-3xl">{stat.value}</p>
            <p className="mt-1 text-[0.72rem] font-semibold">{stat.label}</p>
            <p className="mt-0.5 text-[0.66rem] text-ink-muted">{stat.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-md border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-line p-4">
            <div>
              <p className="eyebrow-plain">Pipeline</p>
              <h2 className="mt-0.5 font-display text-lg">Recent leads</h2>
            </div>
            <Link href="/admin/leads" className="text-[0.7rem] font-semibold text-forest hover:text-brass">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-clean w-full min-w-[560px]">
              <thead>
                <tr>
                  <th scope="col">Lead</th>
                  <th scope="col">Project</th>
                  <th scope="col">Status</th>
                  <th scope="col">Received</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-ink hover:text-forest">
                        {lead.name}
                      </Link>
                      <p className="text-[0.66rem] text-ink-muted">{lead.phone}</p>
                    </td>
                    <td className="max-w-[10rem] truncate">{lead.project?.name ?? lead.projectName ?? "General"}</td>
                    <td><InquiryBadge status={lead.status} label={lead.status} /></td>
                    <td className="text-[0.72rem]">{formatDateTime(lead.createdAt)}</td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-ink-muted">No leads yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-md border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow-plain">Inventory</p>
              <h2 className="mt-0.5 font-display text-lg">By status</h2>
            </div>
            <Building2 className="size-4 text-brass" />
          </div>
          <div className="mt-4 space-y-3">
            {PROJECT_STATUSES.map((status) => {
              const count = statusGroups.find((row) => row.status === status.value)?._count._all ?? 0;
              const pct = totalProjects ? Math.round((count / totalProjects) * 100) : 0;
              return (
                <div key={status.value}>
                  <div className="flex items-center justify-between text-[0.72rem]">
                    <span className="text-ink-soft">{status.label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sand">
                    <div className="h-full rounded-full bg-forest" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <p className="eyebrow-plain">Most viewed</p>
            <ul className="mt-2 space-y-2">
              {topProjects.map((project) => (
                <li key={project.id} className="flex items-center justify-between gap-3 text-[0.74rem]">
                  <Link href={`/projects/${project.slug}`} className="min-w-0 truncate font-medium hover:text-forest">
                    {project.name}
                  </Link>
                  <span className="flex shrink-0 items-center gap-1 text-ink-muted">
                    <Eye className="size-3" /> {project.views}
                  </span>
                </li>
              ))}
              {topProjects.length === 0 && <li className="text-[0.74rem] text-ink-muted">No projects yet.</li>}
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-md border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-line p-4">
            <div>
              <p className="eyebrow-plain">Appointments</p>
              <h2 className="mt-0.5 font-display text-lg">Recent site visits</h2>
            </div>
            <Link href="/admin/site-visits" className="text-[0.7rem] font-semibold text-forest hover:text-brass">View all</Link>
          </div>
          <ul className="divide-y divide-line">
            {recentVisits.map((visit) => (
              <li key={visit.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-[0.8rem] font-semibold">{visit.name}</p>
                  <p className="truncate text-[0.68rem] text-ink-muted">{visit.project?.name ?? "Project visit"} · {visit.preferredTime}</p>
                </div>
                <InquiryBadge status={visit.status} label={visit.status} />
              </li>
            ))}
            {recentVisits.length === 0 && <li className="p-6 text-center text-sm text-ink-muted">No site visits yet.</li>}
          </ul>
        </section>

        <section className="rounded-md border border-line bg-surface p-5">
          <p className="eyebrow-plain">Quick actions</p>
          <h2 className="mt-1 font-display text-lg">Keep the workspace tidy.</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              { label: "Add a project", href: "/admin/projects/new", icon: Plus },
              { label: "Review new leads", href: "/admin/leads?status=NEW", icon: MessageSquare },
              { label: "Confirm visits", href: "/admin/site-visits?status=PENDING", icon: CalendarClock },
              { label: "Manage content", href: "/admin/faqs", icon: CheckCircle2 },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 rounded border border-line bg-cream/50 px-3 py-2.5 text-[0.76rem] font-medium transition hover:border-forest/30 hover:bg-forest-soft/40"
              >
                <action.icon className="size-3.5 text-brass" /> {action.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 rounded border border-brass/30 bg-brass-pale/40 p-3 text-[0.7rem] leading-relaxed text-ink-soft">
            Sample data only. Lead contact details are private and must not be exported or shared. RERA
            numbers are only displayed when a record is explicitly marked verified.
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {topProjects.slice(0, 2).map((project) => (
          <div key={project.id} className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface p-4">
            <div>
              <p className="font-display text-lg">{project.name}</p>
              <p className="text-[0.68rem] text-ink-muted">From {formatPriceShort(project.startingPrice)} · {project.published ? "Published" : "Draft"}</p>
            </div>
            <StatusBadge status={project.status} />
          </div>
        ))}
      </div>
    </>
  );
}

