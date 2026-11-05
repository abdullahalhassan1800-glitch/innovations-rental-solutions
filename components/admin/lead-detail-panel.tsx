"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { INQUIRY_STATUSES } from "@/lib/constants";

type Agent = { id: string; name: string; role: string };

const LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CLOSED: "Closed",
  SPAM: "Spam",
};

export function LeadDetailPanel({
  id,
  status,
  assignedToId,
  agents,
}: {
  id: string;
  status: string;
  assignedToId: string | null;
  agents: Agent[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [nextStatus, setNextStatus] = useState(status);
  const [nextAgent, setNextAgent] = useState(assignedToId ?? "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          assignedToId: nextAgent || null,
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update the lead");
      toast("Lead updated", "success");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface p-4">
      <p className="eyebrow-plain">Workflow</p>
      <h2 className="mt-1 font-display text-lg">Manage this lead</h2>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor="lead-status" className="field-label">Status</label>
          <select
            id="lead-status"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
            className="field"
          >
            {INQUIRY_STATUSES.map((value) => (
              <option key={value} value={value}>{LABELS[value] ?? value}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-owner" className="field-label">Assigned to</label>
          <select
            id="lead-owner"
            value={nextAgent}
            onChange={(event) => setNextAgent(event.target.value)}
            className="field"
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}{agent.role === "ADMIN" ? " (admin)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-note" className="field-label">Add an internal note</label>
          <textarea
            id="lead-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            maxLength={1000}
            className="field resize-none"
            placeholder="Call outcome, next step, site visit preference…"
          />
          <p className="mt-1 text-[0.64rem] text-ink-muted">
            Notes are visible to staff only and stored in the audit history.
          </p>
        </div>
      </div>

      {error && <p role="alert" className="mt-3 rounded border border-rust/25 bg-rust/10 px-3 py-2 text-[0.78rem] text-rust">{error}</p>}

      <Button type="submit" loading={saving} className="mt-4 w-full">
        <Save className="size-4" /> Save lead
      </Button>
      <p className="mt-2 flex items-center gap-1.5 text-[0.64rem] text-ink-muted">
        <StickyNote className="size-3" /> A note is only added when the field has content.
      </p>
    </form>
  );
}
