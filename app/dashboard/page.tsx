import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarClock,
  Clock3,
  Heart,
  MessageSquare,
  Plus,
  UserRound,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAccountActivity } from "@/lib/account";
import { projectCardInclude } from "@/lib/queries";
import { InquiryBadge, DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatDateTime, formatPriceShort } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

const visitLabels: Record<string, string> = {
  PENDING: "Pending confirmation",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const [activity, saved] = await Promise.all([
    getAccountActivity(user),
    db.savedProject.findMany({
      where: { userId: user.id },
      include: { project: { include: projectCardInclude } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const openInquiries = activity.inquiries.filter((inquiry) => !["CLOSED", "SPAM"].includes(inquiry.status)).length;
  const upcomingVisits = activity.visits.filter(
    (visit) => !["CANCELLED", "COMPLETED"].includes(visit.status) && visit.preferredDate >= new Date(new Date().toDateString()),
  );

  const stats = [
    { label: "Saved projects", value: activity.savedCount, href: "/dashboard/saved", icon: Heart },
    { label: "Open inquiries", value: openInquiries, href: "/dashboard/inquiries", icon: MessageSquare },
    { label: "Upcoming visits", value: upcomingVisits.length, href: "/dashboard/visits", icon: CalendarClock },
    { label: "Profile complete", value: user.phone ? "Yes" : "Add phone", href: "/dashboard/profile", icon: UserRound },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-3 font-display text-3xl">Good to see you, {user.name.split(" ")[0]}.</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Your private shortlist, inquiries and site visits in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/projects" size="sm" variant="outline">Browse projects</ButtonLink>
          <ButtonLink href="/dashboard/profile" size="sm">Profile settings</ButtonLink>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group rounded-md border border-line bg-surface p-5 transition hover:border-ink/25 hover:shadow-card">
            <div className="flex items-center justify-between">
              <stat.icon className="size-4 text-brass" />
              <ArrowRight className="size-3.5 text-ink-muted opacity-0 transition group-hover:opacity-100" />
            </div>
            <p className="mt-4 font-display text-2xl">{stat.value}</p>
            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-ink-muted">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-md border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="eyebrow-plain">Recent inquiries</p>
              <h2 className="mt-1 font-display text-xl">Your conversations</h2>
            </div>
            <Link href="/dashboard/inquiries" className="text-[0.72rem] font-semibold text-forest hover:text-brass">
              View all
            </Link>
          </div>
          {activity.inquiries.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare className="mx-auto size-5 text-ink-muted" />
              <p className="mt-3 text-sm font-medium">No inquiries yet</p>
              <p className="mt-1 text-[0.78rem] text-ink-muted">Send a request from any project page and it will appear here.</p>
              <ButtonLink href="/projects" size="sm" variant="outline" className="mt-4">Find a project</ButtonLink>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {activity.inquiries.slice(0, 4).map((inquiry) => (
                <li key={inquiry.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="text-[0.85rem] font-semibold">
                      {inquiry.project?.name ?? inquiry.projectName ?? "General inquiry"}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[0.74rem] text-ink-muted">
                      {inquiry.message || "No message added."}
                    </p>
                    <p className="mt-1 text-[0.68rem] text-ink-muted">{formatDateTime(inquiry.createdAt)}</p>
                  </div>
                  <InquiryBadge status={inquiry.status} label={inquiry.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="eyebrow-plain">Next visits</p>
              <h2 className="mt-1 font-display text-xl">Site visits</h2>
            </div>
            <Link href="/dashboard/visits" className="text-[0.72rem] font-semibold text-forest hover:text-brass">
              View all
            </Link>
          </div>
          {upcomingVisits.length === 0 ? (
            <div className="py-8 text-center">
              <CalendarClock className="mx-auto size-5 text-ink-muted" />
              <p className="mt-3 text-sm font-medium">No upcoming visits</p>
              <p className="mt-1 text-[0.78rem] text-ink-muted">Request a visit from any project page.</p>
              <ButtonLink href="/projects" size="sm" variant="outline" className="mt-4">Explore projects</ButtonLink>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {upcomingVisits.slice(0, 3).map((visit) => (
                <li key={visit.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.85rem] font-semibold">{visit.project?.name ?? "Site visit"}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-[0.72rem] text-ink-muted">
                        <Clock3 className="size-3.5 text-brass" /> {formatDate(visit.preferredDate)} · {visit.preferredTime}
                      </p>
                    </div>
                    <InquiryBadge status={visit.status} label={visitLabels[visit.status] ?? visit.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow-plain">Your shortlist</p>
            <h2 className="mt-1 font-display text-xl">Recently saved</h2>
          </div>
          <Link href="/dashboard/saved" className="text-[0.72rem] font-semibold text-forest hover:text-brass">
            View all
          </Link>
        </div>

        {saved.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={Heart}
            title="Nothing saved yet"
            description="Tap the heart on any project card to keep it here for later."
            action={<ButtonLink href="/projects" size="sm"><Plus className="size-3.5" /> Browse projects</ButtonLink>}
          />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {saved.map(({ project }) => (
              <Link key={project.id} href={`/projects/${project.slug}`} className="group overflow-hidden rounded-md border border-line bg-surface transition hover:border-ink/25 hover:shadow-card">
                <div className="relative aspect-[16/9] bg-sand">
                  {project.images[0] ? (
                    <Image src={project.images[0].url} alt={project.images[0].alt || project.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                  ) : null}
                  <div className="absolute left-2.5 top-2.5"><DemoBadge /></div>
                </div>
                <div className="p-4">
                  <p className="text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">{project.developer.name}</p>
                  <p className="mt-1 font-display text-lg leading-tight group-hover:text-forest">{project.name}</p>
                  <p className="mt-1 text-[0.72rem] text-ink-muted">
                    {project.location.name} · from {formatPriceShort(project.startingPrice)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
