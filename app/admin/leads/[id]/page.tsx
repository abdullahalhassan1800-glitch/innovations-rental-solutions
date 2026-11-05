import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Clock,
  Mail,
  MessageCircle,
  Phone,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";
import { LeadDetailPanel } from "@/components/admin/lead-detail-panel";
import { InquiryBadge, Badge } from "@/components/ui/badge";
import { formatDateTime, whatsappLink } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = await db.inquiry.findUnique({ where: { id }, select: { name: true } });
  return { title: lead ? `Lead — ${lead.name}` : "Lead not found" };
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CLOSED: "Closed",
  SPAM: "Spam",
};

export default async function AdminLeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [lead, agents] = await Promise.all([
    db.inquiry.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        notes: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    db.user.findMany({
      where: { isActive: true, role: { in: ["ADMIN", "AGENT"] } },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!lead) notFound();

  const whatsapp = whatsappLink(
    `Hello ${lead.name}, this is the Innovations demo team following up on your inquiry.`,
  );

  return (
    <>
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-[0.74rem] font-medium text-ink-muted transition hover:text-forest"
      >
        <ArrowLeft className="size-3.5" /> Back to leads
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Private lead</p>
          <h1 className="mt-2 font-display text-3xl">{lead.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.72rem] text-ink-muted">
            <InquiryBadge status={lead.status} label={STATUS_LABELS[lead.status] ?? lead.status} />
            <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {formatDateTime(lead.createdAt)}</span>
            <span>Source: {lead.source || "website"}</span>
            <Badge>{lead.inquiryType.replace(/_/g, " ")}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[0.76rem] font-semibold transition hover:border-brass/50 hover:text-brass"
          >
            <Phone className="size-3.5" /> Call
          </a>
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-forest bg-forest px-3 text-[0.76rem] font-semibold text-night transition hover:bg-forest-deep"
          >
            <MessageCircle className="size-3.5" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded border border-brass/30 bg-brass-pale/50 px-3 py-2 text-[0.68rem] leading-relaxed text-ink-soft">
        <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-brass-soft" />
        Customer contact data is private. Use it only to respond to this inquiry. This record is fictional
        demo data.
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <section className="surface p-5">
            <p className="eyebrow-plain">Contact</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <a href={`tel:${lead.phone}`} className="flex items-center gap-2.5 rounded border border-line bg-cream/40 p-3 text-[0.8rem] transition hover:border-forest/30">
                <Phone className="size-4 text-brass" />
                <span>
                  <span className="block text-[0.62rem] uppercase tracking-wide text-ink-muted">Mobile</span>
                  {lead.phone}
                </span>
              </a>
              <div className="flex items-center gap-2.5 rounded border border-line bg-cream/40 p-3 text-[0.8rem]">
                <Mail className="size-4 text-brass" />
                <span className="min-w-0">
                  <span className="block text-[0.62rem] uppercase tracking-wide text-ink-muted">Email</span>
                  <span className="block truncate">{lead.email || "Not provided"}</span>
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <p className="eyebrow-plain">Project interest</p>
              {lead.project ? (
                <Link href={`/projects/${lead.project.slug}`} target="_blank" className="mt-2 inline-flex items-center gap-2 text-[0.86rem] font-semibold text-forest hover:text-brass">
                  <Building2 className="size-4" /> {lead.project.name}
                </Link>
              ) : (
                <p className="mt-2 flex items-center gap-2 text-[0.82rem] text-ink-soft">
                  <Building2 className="size-4 text-brass" /> {lead.projectName || "No specific project"}
                </p>
              )}
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <p className="eyebrow-plain">Message</p>
              <p className="mt-2 whitespace-pre-line text-[0.84rem] leading-relaxed text-ink-soft">
                {lead.message || "No message included with this inquiry."}
              </p>
            </div>
          </section>

          <section className="surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow-plain">Audit trail</p>
                <h2 className="mt-1 font-display text-lg">Internal notes</h2>
              </div>
              <span className="text-[0.68rem] text-ink-muted">{lead.notes.length} notes</span>
            </div>

            {lead.notes.length === 0 ? (
              <p className="mt-4 rounded border border-dashed border-line bg-cream/30 px-4 py-8 text-center text-[0.78rem] text-ink-muted">
                No notes yet. Add the first update from the panel on the right.
              </p>
            ) : (
              <ol className="mt-4 space-y-3">
                {lead.notes.map((note) => (
                  <li key={note.id} className="rounded border border-line bg-cream/40 p-3">
                    <p className="whitespace-pre-line text-[0.8rem] leading-relaxed text-ink-soft">{note.note}</p>
                    <p className="mt-2 text-[0.62rem] text-ink-muted">
                      {note.author?.name ?? "System"} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <LeadDetailPanel
            id={lead.id}
            status={lead.status}
            assignedToId={lead.assignedToId}
            agents={agents}
          />

          <div className="surface p-4 text-[0.72rem] text-ink-soft">
            <p className="eyebrow-plain">Current owner</p>
            {lead.assignedTo ? (
              <>
                <p className="mt-1.5 font-semibold">{lead.assignedTo.name}</p>
                <p className="text-[0.66rem] text-ink-muted">{lead.assignedTo.email}</p>
              </>
            ) : (
              <p className="mt-1.5 text-ink-muted">Unassigned — choose an owner before following up.</p>
            )}
            <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[0.64rem] text-ink-muted">
              <Sparkles className="size-3 text-brass" /> Demo inquiry · no real customer
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
