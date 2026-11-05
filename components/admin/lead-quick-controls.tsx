"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { INQUIRY_STATUSES } from "@/lib/constants";

type Agent = { id: string; name: string };

const LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CLOSED: "Closed",
  SPAM: "Spam",
};

export function LeadQuickControls({
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
  const [busy, setBusy] = useState(false);

  async function update(payload: Record<string, unknown>, message: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update the lead");
      toast(message, "success");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Something went wrong", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={status}
        disabled={busy}
        onChange={(event) => update({ status: event.target.value }, "Lead status updated")}
        aria-label="Lead status"
        className="field h-8 min-w-[7.5rem] py-1 text-[0.7rem]"
      >
        {INQUIRY_STATUSES.map((value) => (
          <option key={value} value={value}>{LABELS[value] ?? value}</option>
        ))}
      </select>
      <select
        value={assignedToId ?? ""}
        disabled={busy}
        onChange={(event) =>
          update(
            { assignedToId: event.target.value || null },
            event.target.value ? "Lead assigned" : "Lead unassigned",
          )
        }
        aria-label="Assigned agent"
        className="field h-8 min-w-[7.5rem] py-1 text-[0.7rem]"
      >
        <option value="">Unassigned</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>{agent.name}</option>
        ))}
      </select>
    </div>
  );
}
