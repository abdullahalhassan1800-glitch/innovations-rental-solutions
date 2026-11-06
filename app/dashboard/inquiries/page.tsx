import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAccountActivity } from "@/lib/account";
import { InquiryBadge, DemoBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { INQUIRY_TYPES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Inquiry history" };

const typeLabels = Object.fromEntries(INQUIRY_TYPES.map((type) => [type.value, type.label]));

export default async function InquiriesPage() {
  const user = await requireUser();
  const { inquiries } = await getAccountActivity(user);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">History</p>
          <h1 className="mt-3 font-display text-3xl">Your inquiries.</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Requests you have sent while signed in with this email or mobile number. Status is updated by
            the Innovations team in the sample workspace.
          </p>
        </div>
        <DemoBadge />
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          className="mt-7"
          icon={MessageSquare}
          title="No inquiries yet"
          description="Send a callback request or ask about a project and it will appear here."
          action={<ButtonLink href="/projects" size="sm">Find a project</ButtonLink>}
        />
      ) : (
        <div className="mt-7 space-y-3">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="rounded-md border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    {typeLabels[inquiry.inquiryType] ?? inquiry.inquiryType}
                  </p>
                  <h2 className="mt-1 font-display text-xl">
                    {inquiry.project ? (
                      <Link href={`/projects/${inquiry.project.slug}`} className="hover:text-forest">
                        {inquiry.project.name}
                      </Link>
                    ) : (
                      inquiry.projectName ?? "General inquiry"
                    )}
                  </h2>
                  <p className="mt-1 text-[0.7rem] text-ink-muted">Sent {formatDateTime(inquiry.createdAt)}</p>
                </div>
                <InquiryBadge status={inquiry.status} label={inquiry.status} />
              </div>
              {inquiry.message && (
                <p className="mt-4 rounded border border-line bg-cream/50 px-3 py-2.5 text-[0.82rem] leading-relaxed text-ink-soft">
                  {inquiry.message}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-[0.7rem] text-ink-muted">
                <span>Source: {inquiry.source ?? "website"}</span>
                {inquiry.project && (
                  <Link href={`/projects/${inquiry.project.slug}`} className="font-semibold text-forest hover:text-brass">
                    View project
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

