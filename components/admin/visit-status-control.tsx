"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { VISIT_STATUSES } from "@/lib/constants";

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function VisitStatusControl({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [current, setCurrent] = useState(status);
  const [busy, setBusy] = useState(false);

  async function update(next: string) {
    if (next === "CANCELLED" && !window.confirm("Cancel this site visit?")) {
      setCurrent(current);
      return;
    }
    setCurrent(next);
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/site-visits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update the visit");
      toast("Site visit updated", "success");
      router.refresh();
    } catch (error) {
      setCurrent(current);
      toast(error instanceof Error ? error.message : "Something went wrong", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={current}
      disabled={busy}
      onChange={(event) => update(event.target.value)}
      aria-label="Site visit status"
      className="field h-8 min-w-[7.5rem] py-1 text-[0.7rem]"
    >
      {VISIT_STATUSES.map((value) => (
        <option key={value} value={value}>{LABELS[value] ?? value}</option>
      ))}
    </select>
  );
}
