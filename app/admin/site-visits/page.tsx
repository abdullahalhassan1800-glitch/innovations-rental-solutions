import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { CalendarClock, Lock, Search } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { VisitStatusControl } from "@/components/admin/visit-status-control";
import { VISIT_STATUSES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Site visits" };

const PAGE_SIZE = 15;

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminSiteVisitsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = one(params.q).trim();
  const status = one(params.status);
  const page = Math.max(1, Number(one(params.page)) || 1);

  const where: Prisma.SiteVisitWhereInput = {
    ...(status && VISIT_STATUSES.includes(status as (typeof VISIT_STATUSES)[number]) ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
            { project: { name: { contains: q } } },
            { message: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, visits, groups] = await Promise.all([
    db.siteVisit.count({ where }),
    db.siteVisit.findMany({
      where,
      include: { project: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.siteVisit.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (value: string) => groups.find((group) => group.status === value)?._count._all ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(q || status);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Appointments</p>
          <h1 className="mt-3 font-display text-3xl">Site visits.</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Confirm appointments and keep the visit pipeline tidy. Contact details are private.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/30 bg-brass-pale px-2.5 py-1 text-[0.64rem] font-semibold text-brass-soft">
          <Lock className="size-3" /> Private data
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {VISIT_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/site-visits?status=${value}`}
            className="rounded border border-line bg-surface px-3 py-2.5 transition hover:border-forest/30 hover:bg-forest-soft/30"
          >
            <p className="font-display text-2xl">{countFor(value)}</p>
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {LABELS[value] ?? value}
            </p>
          </Link>
        ))}
      </div>

      <form method="get" className="mt-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Name, phone, project"
            aria-label="Search site visits"
            className="field pl-9"
          />
        </div>
        <select name="status" defaultValue={status} aria-label="Filter by status" className="field w-auto">
          <option value="">All statuses</option>
          {VISIT_STATUSES.map((value) => (
            <option key={value} value={value}>{LABELS[value] ?? value}</option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex h-[42px] items-center rounded-full border border-ink/20 bg-surface px-4 text-[0.78rem] font-semibold transition hover:border-brass/50 hover:text-brass"
        >
          Apply
        </button>
        {hasFilters && (
          <Link href="/admin/site-visits" className="text-[0.74rem] font-medium text-ink-muted hover:text-forest">
            Reset
          </Link>
        )}
      </form>

      {visits.length === 0 ? (
        <EmptyState
          className="mt-5"
          icon={CalendarClock}
          title={hasFilters ? "No visits match these filters" : "No site visits yet"}
          description={
            hasFilters
              ? "Try clearing the status filter or searching for another visitor."
              : "Visit requests from project pages will appear here for confirmation."
          }
          action={
            hasFilters ? (
              <ButtonLink href="/admin/site-visits" size="sm" variant="outline">Clear filters</ButtonLink>
            ) : (
              <ButtonLink href="/projects" size="sm" variant="outline">Browse projects</ButtonLink>
            )
          }
        />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
          <table className="table-clean w-full min-w-[940px]">
            <thead>
              <tr>
                <th scope="col">Visitor</th>
                <th scope="col">Project</th>
                <th scope="col">Preferred slot</th>
                <th scope="col">Message</th>
                <th scope="col">Status</th>
                <th scope="col">Requested</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="transition hover:bg-cream/40">
                  <td>
                    <p className="font-semibold text-ink">{visit.name}</p>
                    <p className="text-[0.68rem] text-ink-muted">{visit.phone}</p>
                    {visit.email && <p className="truncate text-[0.66rem] text-ink-muted">{visit.email}</p>}
                  </td>
                  <td>
                    {visit.project ? (
                      <Link href={`/projects/${visit.project.slug}`} target="_blank" className="max-w-[12rem] truncate text-[0.78rem] font-medium hover:text-forest">
                        {visit.project.name}
                      </Link>
                    ) : (
                      <span className="text-[0.74rem] text-ink-muted">Project removed</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-[0.74rem]">
                    <p className="font-medium">{formatDate(visit.preferredDate)}</p>
                    <p className="text-[0.66rem] text-ink-muted">{visit.preferredTime}</p>
                  </td>
                  <td className="max-w-[14rem]">
                    <p className="line-clamp-2 text-[0.72rem] text-ink-soft">{visit.message || "—"}</p>
                  </td>
                  <td><VisitStatusControl id={visit.id} status={visit.status} /></td>
                  <td className="whitespace-nowrap text-[0.7rem]">{formatDateTime(visit.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/admin/site-visits"
        params={{ q, status }}
      />
    </>
  );
}
