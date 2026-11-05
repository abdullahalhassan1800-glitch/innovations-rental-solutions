"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { LeadDefaults } from "./lead-form";

const TIME_SLOTS = ["10:00 – 12:00", "12:00 – 14:00", "14:00 – 16:00", "16:00 – 18:00"];

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function SiteVisitForm({
  projectId,
  projectName,
  defaults,
  className,
}: {
  projectId: string;
  projectName: string;
  defaults?: LeadDefaults;
  className?: string;
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    setMessage("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/site-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          email: String(data.get("email") ?? ""),
          preferredDate: String(data.get("preferredDate") ?? ""),
          preferredTime: String(data.get("preferredTime") ?? ""),
          message: String(data.get("message") ?? ""),
          website: String(data.get("website") ?? ""),
          consent: data.get("consent") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (Array.isArray(result.issues)) {
          const errors: Record<string, string> = {};
          for (const issue of result.issues) {
            if (issue.path) errors[String(issue.path)] = issue.message;
          }
          setFieldErrors(errors);
        }
        throw new Error(result.error || "Could not request a site visit");
      }
      setStatus("success");
      setMessage(result.message || "Site visit requested. The team will confirm your slot shortly.");
      form.reset();
      toast("Site visit requested", "success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={cn("surface flex flex-col items-start gap-4 p-6", className)}>
        <span className="flex size-11 items-center justify-center rounded-full bg-forest-soft text-night">
          <CheckCircle2 className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-xl">Site visit requested</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{message}</p>
          <p className="mt-2 text-[0.72rem] text-ink-muted">You can track the status in your dashboard under Site visits.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>Request another slot</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("surface p-6", className)} noValidate>
      <div className="mb-5">
        <p className="eyebrow-plain">Visit {projectName}</p>
        <h3 className="mt-2 font-display text-xl">Schedule a site visit</h3>
        <p className="mt-1 text-sm text-ink-muted">Choose a preferred slot. Requests are confirmed by the team.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="visit-name" className="field-label">Full name</label>
          <input id="visit-name" name="name" required autoComplete="name" defaultValue={defaults?.name} className="field" />
          {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="visit-phone" className="field-label">Mobile number</label>
          <input id="visit-phone" name="phone" required type="tel" autoComplete="tel" defaultValue={defaults?.phone} className="field" />
          {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="visit-email" className="field-label">Email <span className="normal-case tracking-normal">(optional)</span></label>
          <input id="visit-email" name="email" type="email" autoComplete="email" defaultValue={defaults?.email} className="field" />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>
        <div>
          <label htmlFor="visit-date" className="field-label"><CalendarDays className="mr-1 inline size-3" /> Preferred date</label>
          <input id="visit-date" name="preferredDate" type="date" min={today()} required className="field" />
          {fieldErrors.preferredDate && <p className="field-error">{fieldErrors.preferredDate}</p>}
        </div>
        <div>
          <label htmlFor="visit-time" className="field-label"><Clock3 className="mr-1 inline size-3" /> Preferred time</label>
          <select id="visit-time" name="preferredTime" required className="field" defaultValue="">
            <option value="" disabled>Select a slot</option>
            {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
          </select>
          {fieldErrors.preferredTime && <p className="field-error">{fieldErrors.preferredTime}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="visit-message" className="field-label">Anything we should know? <span className="normal-case tracking-normal">(optional)</span></label>
          <textarea id="visit-message" name="message" rows={2} className="field resize-none" />
        </div>
      </div>

      <div className="absolute -left-[9999px]" aria-hidden>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[0.76rem] leading-relaxed text-ink-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 size-3.5 accent-forest" />
        <span>I agree to be contacted about this site visit. This is a demo booking, not a real appointment.</span>
      </label>
      {fieldErrors.consent && <p className="field-error">{fieldErrors.consent}</p>}

      {status === "error" && (
        <p role="alert" className="mt-4 rounded border border-rust/25 bg-rust/10 px-3 py-2 text-sm text-rust">{message}</p>
      )}

      <Button type="submit" className="mt-5 w-full" loading={status === "loading"}>
        {status === "loading" ? "Requesting" : "Request site visit"}
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.66rem] text-ink-muted">
        <ShieldCheck className="size-3.5 text-forest" /> Private by default. No spam calls.
      </p>
    </form>
  );
}
