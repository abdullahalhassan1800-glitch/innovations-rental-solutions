import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Clock3, MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAccountActivity } from "@/lib/account";
import { InquiryBadge, DemoBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Site visits" };

const visitLabels: Record<string, string> = {
  PENDING: "Pending confirmation",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function VisitsPage() {
  const user = await requireUser();
  const { visits } = await getAccountActivity(user);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Appointments</p>
          <h1 className="mt-3 font-display text-3xl">Site visits.</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Demo requests are stored locally and reviewed in the admin workspace. No real appointment is
            created.
          </p>
        </div>
        <DemoBadge />
      </div>

      {visits.length === 0 ? (
        <EmptyState
          className="mt-7"
          icon={CalendarClock}
          title="No site visits requested"
          description="Open a project page and choose “Request a site visit” to see the workflow."
          action={<ButtonLink href="/projects" size="sm">Browse projects</ButtonLink>}
        />
      ) : (
        <div className="mt-7 space-y-3">
          {visits.map((visit) => (
            <article key={visit.id} className="rounded-md border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Site visit request
                  </p>
                  <h2 className="mt-1 font-display text-xl">
                    {visit.project ? (
                      <Link href={`/projects/${visit.project.slug}`} className="hover:text-forest">
                        {visit.project.name}
                      </Link>
                    ) : (
                      "Project visit"
                    )}
                  </h2>
                </div>
                <InquiryBadge status={visit.status} label={visitLabels[visit.status] ?? visit.status} />
              </div>

              <div className="mt-4 grid gap-2 rounded border border-line bg-cream/50 p-3.5 text-[0.8rem] text-ink-soft sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-brass" /> {formatDate(visit.preferredDate)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="size-4 text-brass" /> {visit.preferredTime}
                </p>
              </div>

              {visit.message && <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-soft">{visit.message}</p>}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-[0.7rem] text-ink-muted">
                <span>Requested {formatDateTime(visit.createdAt)}</span>
                {visit.project && (
                  <Link href={`/projects/${visit.project.slug}#site-visit`} className="font-semibold text-forest hover:text-brass">
                    Request another slot
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 rounded-md border border-line bg-surface p-4 text-[0.74rem] leading-relaxed text-ink-muted">
        <MapPin className="mt-0.5 size-4 shrink-0 text-brass" />
        <p>Site addresses shown on project pages are demonstration addresses. Do not travel to them.</p>
      </div>
    </>
  );
}
