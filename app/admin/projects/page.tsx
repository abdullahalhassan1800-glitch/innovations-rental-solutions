import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ExternalLink, FolderKanban, Pencil, Plus, Search, Star } from "lucide-react";
import { db } from "@/lib/db";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ProjectActions } from "@/components/admin/project-actions";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { PROJECT_STATUSES, PROPERTY_TYPES } from "@/lib/constants";
import { formatPriceShort, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

const PAGE_SIZE = 12;
const TABS = [
  { value: "all", label: "Active" },
  { value: "drafts", label: "Drafts" },
  { value: "featured", label: "Featured" },
  { value: "archived", label: "Archived" },
] as const;

type Tab = (typeof TABS)[number]["value"];

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = one(params.q).trim();
  const status = one(params.status);
  const type = one(params.type);
  const requestedTab = one(params.tab) as Tab;
  const tab: Tab = TABS.some((item) => item.value === requestedTab) ? requestedTab : "all";
  const page = Math.max(1, Number(one(params.page)) || 1);

  const where: Prisma.ProjectWhereInput = {
    ...(tab === "archived" ? { archived: true } : { archived: false }),
    ...(tab === "drafts" ? { published: false } : {}),
    ...(tab === "featured" ? { featured: true } : {}),
    ...(status ? { status } : {}),
    ...(type ? { propertyType: type } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { tagline: { contains: q } },
            { address: { contains: q } },
            { developer: { name: { contains: q } } },
            { location: { name: { contains: q } } },
          ],
        }
      : {}),
  };

  const [
    total,
    projects,
    allCount,
    draftCount,
    featuredCount,
    archivedCount,
    developerCount,
    locationCount,
  ] = await Promise.all([
    db.project.count({ where }),
    db.project.findMany({
      where,
      include: {
        developer: { select: { name: true } },
        location: { select: { name: true } },
        images: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          take: 1,
          select: { url: true, alt: true },
        },
        _count: { select: { inquiries: true, siteVisits: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.project.count({ where: { archived: false } }),
    db.project.count({ where: { archived: false, published: false } }),
    db.project.count({ where: { archived: false, featured: true } }),
    db.project.count({ where: { archived: true } }),
    db.developer.count(),
    db.location.count(),
  ]);

  const counts: Record<Tab, number> = {
    all: allCount,
    drafts: draftCount,
    featured: featuredCount,
    archived: archivedCount,
  };
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function tabHref(value: Tab) {
    const search = new URLSearchParams();
    if (value !== "all") search.set("tab", value);
    if (q) search.set("q", q);
    if (status) search.set("status", status);
    if (type) search.set("type", type);
    const query = search.toString();
    return query ? `/admin/projects?${query}` : "/admin/projects";
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="mt-3 font-display text-3xl">Projects.</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Manage listings, media, pricing and publication state. {total} matching records.
          </p>
        </div>
        <ButtonLink href="/admin/projects/new" size="sm">
          <Plus className="size-3.5" /> New project
        </ButtonLink>
      </div>

      {(developerCount === 0 || locationCount === 0) && (
        <div className="mt-5 rounded border border-brass/40 bg-brass-pale/60 px-4 py-3 text-[0.78rem] text-ink-soft">
          Add at least one{" "}
          {developerCount === 0 && (
            <Link href="/admin/developers" className="font-semibold text-forest underline">developer</Link>
          )}
          {developerCount === 0 && locationCount === 0 && " and "}
          {locationCount === 0 && (
            <Link href="/admin/locations" className="font-semibold text-forest underline">location</Link>
          )}{" "}
          before creating a project.
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((item) => (
          <Link
            key={item.value}
            href={tabHref(item.value)}
            aria-current={tab === item.value ? "page" : undefined}
            className={cn(
              "relative -mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-[0.78rem] font-semibold transition",
              tab === item.value
                ? "border-forest text-forest"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
            <span className="rounded-full bg-cream px-1.5 py-0.5 text-[0.62rem] font-semibold text-ink-muted">
              {counts[item.value]}
            </span>
          </Link>
        ))}
      </div>

      <form method="get" className="mt-4 flex flex-wrap items-center gap-2">
        {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search project, developer, location"
            aria-label="Search projects"
            className="field pl-9"
          />
        </div>
        <select name="status" defaultValue={status} aria-label="Filter by status" className="field w-auto">
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <select name="type" defaultValue={type} aria-label="Filter by property type" className="field w-auto">
          <option value="">All types</option>
          {PROPERTY_TYPES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex h-[42px] items-center rounded-full border border-ink/20 bg-surface px-4 text-[0.78rem] font-semibold transition hover:border-brass/50 hover:text-brass"
        >
          Apply
        </button>
        {(q || status || type) && (
          <Link href={tabHref(tab)} className="text-[0.74rem] font-medium text-ink-muted underline-offset-2 hover:text-forest hover:underline">
            Reset
          </Link>
        )}
      </form>

      {projects.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={FolderKanban}
          title={q || status || type ? "No projects match these filters" : "No projects in this view"}
          description={
            q || status || type
              ? "Try a broader search, or reset the filters to see the full inventory."
              : "Create your first project to start building the public catalogue."
          }
          action={
            q || status || type ? (
              <ButtonLink href="/admin/projects" size="sm" variant="outline">Reset filters</ButtonLink>
            ) : (
              <ButtonLink href="/admin/projects/new" size="sm">Create a project</ButtonLink>
            )
          }
        />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
          <table className="table-clean w-full min-w-[860px]">
            <thead>
              <tr>
                <th scope="col">Project</th>
                <th scope="col">Location</th>
                <th scope="col">Type</th>
                <th scope="col">Price</th>
                <th scope="col">Status</th>
                <th scope="col">Updated</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const image = project.images[0];
                return (
                  <tr key={project.id} className="transition hover:bg-cream/40">
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          role="img"
                          aria-label={image?.alt || `${project.name} cover`}
                          className="size-12 shrink-0 rounded border border-line bg-sand bg-cover bg-center"
                          style={image?.url ? { backgroundImage: `url("${image.url.replace(/"/g, "%22")}")` } : undefined}
                        />
                        <div className="min-w-0">
                          <Link href={`/admin/projects/${project.id}`} className="block truncate font-semibold text-ink hover:text-forest">
                            {project.name}
                          </Link>
                          <p className="truncate text-[0.66rem] text-ink-muted">{project.developer.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            {project.featured && (
                              <span className="inline-flex items-center gap-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-brass-soft">
                                <Star className="size-2.5 fill-current" /> Featured
                              </span>
                            )}
                            {!project.published && <Badge>Draft</Badge>}
                            {project.archived && <Badge tone="rust">Archived</Badge>}
                            {project._count.inquiries > 0 && (
                              <span className="text-[0.6rem] text-ink-muted">{project._count.inquiries} leads</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-[0.78rem]">{project.location.name}</td>
                    <td>
                      <p className="text-[0.78rem]">{project.category}</p>
                      <p className="text-[0.62rem] uppercase tracking-wide text-ink-muted">{project.propertyType}</p>
                    </td>
                    <td className="whitespace-nowrap font-medium text-ink">{formatPriceShort(project.startingPrice)}</td>
                    <td><StatusBadge status={project.status} /></td>
                    <td className="whitespace-nowrap text-[0.72rem]">
                      {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(project.updatedAt)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          className="inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-ink/30 hover:text-ink"
                          title="View public page"
                          aria-label={`View ${project.name} public page`}
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-forest/40 hover:text-forest"
                          title="Edit project"
                          aria-label={`Edit ${project.name}`}
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <ProjectActions
                          id={project.id}
                          published={project.published}
                          featured={project.featured}
                          archived={project.archived}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/admin/projects"
        params={{ tab: tab === "all" ? undefined : tab, q, status, type }}
      />
    </>
  );
}
