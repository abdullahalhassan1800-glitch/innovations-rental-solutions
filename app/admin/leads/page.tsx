import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Lock, MessagesSquare, Search } from "lucide-react";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ButtonLink } from "@/components/ui/button";
import { InquiryBadge } from "@/components/ui/badge";
import { LeadQuickControls } from "@/components/admin/lead-quick-controls";
import { INQUIRY_STATUSES, INQUIRY_TYPES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Leads" };

const PAGE_SIZE = 15;

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CLOSED: "Closed",
  SPAM: "Spam",
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = one(params.q).trim();
  const status = one(params.status);
  const type = one(params.type);
  const assigned = one(params.assigned);
  const page = Math.max(1, Number(one(params.page)) || 1);

  const where: Prisma.InquiryWhereInput = {
    ...(status && INQUIRY_STATUSES.includes(status as (typeof INQUIRY_STATUSES)[number]) ? { status } : {}),
    ...(type && INQUIRY_TYPES.some((item) => item.value === type) ? { inquiryType: type } : {}),
    ...(assigned
      ? assigned === "unassigned"
        ? { assignedToId: null }
        : { assignedToId: assigned }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
            { projectName: { contains: q } },
            { message: { contains: q } },
            { project: { name: { contains: q } } },
          ],
        }
      : {}),
  };

  const [total, leads, groups, agents] = await Promise.all([
    db.inquiry.count({ where }),
    db.inquiry.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, slug: true } },
        assignedTo: { select: { id: true, name: true } },
        _count: { select: { notes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.inquiry.groupBy({ by: ["status"], _count: { _all: true } }),
    db.user.findMany({
      where: { isActive: true, role: { in: ["ADMIN", "AGENT"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const countFor = (value: string) => groups.find((group) => group.status === value)?._count._all ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(q || status || type || assigned);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h1 className="mt-3 font-display text-3xl">Leads.</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Private inquiries from the website and AI assistant. Handle contact data with care.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/30 bg-brass-pale px-2.5 py-1 text-[0.64rem] font-semibold text-brass-soft">
          <Lock className="size-3" /> Private data
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {INQUIRY_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/leads?status=${value}`}
            className="rounded border border-line bg-surface px-3 py-2.5 transition hover:border-forest/30 hover:bg-forest-soft/30"
          >
            <p className="font-display text-2xl">{countFor(value)}</p>
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {STATUS_LABELS[value] ?? value}
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
            placeholder="Name, phone, email, project"
            aria-label="Search leads"
            className="field pl-9"
          />
        </div>
        <select name="status" defaultValue={status} aria-label="Filter by status" className="field w-auto">
          <option value="">All statuses</option>
          {INQUIRY_STATUSES.map((value) => (
            <option key={value} value={value}>{STATUS_LABELS[value] ?? value}</option>
          ))}
        </select>
        <select name="type" defaultValue={type} aria-label="Filter by inquiry type" className="field w-auto">
          <option value="">All types</option>
          {INQUIRY_TYPES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <select name="assigned" defaultValue={assigned} aria-label="Filter by owner" className="field w-auto">
          <option value="">All owners</option>
          <option value="unassigned">Unassigned</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex h-[42px] items-center rounded-full border border-ink/20 bg-surface px-4 text-[0.78rem] font-semibold transition hover:border-brass/50 hover:text-brass"
        >
          Apply
        </button>
        {hasFilters && (
          <Link href="/admin/leads" className="text-[0.74rem] font-medium text-ink-muted hover:text-forest">
            Reset
          </Link>
        )}
      </form>

      {leads.length === 0 ? (
        <EmptyState
          className="mt-5"
          icon={MessagesSquare}
          title={hasFilters ? "No leads match these filters" : "No leads yet"}
          description={
            hasFilters
              ? "Try clearing a filter or searching for a different contact."
              : "Website inquiries, brochure requests and AI-handover leads will appear here."
          }
          action={
            hasFilters ? (
              <ButtonLink href="/admin/leads" size="sm" variant="outline">Clear filters</ButtonLink>
            ) : (
              <ButtonLink href="/contact" size="sm" variant="outline">View contact page</ButtonLink>
            )
          }
        />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
          <table className="table-clean w-full min-w-[900px]">
            <thead>
              <tr>
                <th scope="col">Lead</th>
                <th scope="col">Interest</th>
                <th scope="col">Source</th>
                <th scope="col">Status &amp; owner</th>
                <th scope="col">Received</th>
                <th scope="col" className="text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="transition hover:bg-cream/40">
                  <td>
                    <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-ink hover:text-forest">
                      {lead.name}
                    </Link>
                    <p className="text-[0.68rem] text-ink-muted">{lead.phone}</p>
                    {lead.email && <p className="truncate text-[0.66rem] text-ink-muted">{lead.email}</p>}
                  </td>
                  <td>
                    <p className="max-w-[12rem] truncate text-[0.78rem] font-medium">
                      {lead.project?.name ?? lead.projectName ?? "General inquiry"}
                    </p>
                    <p className="text-[0.64rem] uppercase tracking-wide text-ink-muted">
                      {lead.inquiryType.replace(/_/g, " ")}
                    </p>
                  </td>
                  <td className="max-w-[9rem] truncate text-[0.7rem]">{lead.source || "website"}</td>
                  <td>
                    <div className="flex items-start gap-2">
                      <InquiryBadge status={lead.status} label={STATUS_LABELS[lead.status] ?? lead.status} />
                      <LeadQuickControls
                        id={lead.id}
                        status={lead.status}
                        assignedToId={lead.assignedToId}
                        agents={agents}
                      />
                    </div>
                    {lead._count.notes > 0 && (
                      <p className="mt-1 text-[0.62rem] text-ink-muted">{lead._count.notes} note(s)</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-[0.72rem]">{formatDateTime(lead.createdAt)}</td>
                  <td className="text-right">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="inline-flex h-8 items-center rounded border border-line bg-surface px-2.5 text-[0.7rem] font-semibold text-forest transition hover:border-forest/40"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/admin/leads"
        params={{ q, status, type, assigned }}
      />

      <p className="mt-5 rounded border border-line bg-cream/60 px-4 py-3 text-[0.68rem] leading-relaxed text-ink-muted">
        Lead data is visible to signed-in administrators only. Do not export, screenshot or share customer
        contact details outside the workspace. All leads in this sample database are fictitious samples.
      </p>
    </>
  );
}

