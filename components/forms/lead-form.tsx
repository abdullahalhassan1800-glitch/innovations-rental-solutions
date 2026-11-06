"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { INQUIRY_TYPES } from "@/lib/constants";

type InquiryType = (typeof INQUIRY_TYPES)[number]["value"];

export type LeadDefaults = {
  name?: string;
  email?: string;
  phone?: string;
};

export function LeadForm({
  projectId,
  projectName,
  defaultType = "CALLBACK",
  source = "website",
  defaults,
  compact = false,
  heading,
  description,
  className,
}: {
  projectId?: string;
  projectName?: string;
  defaultType?: InquiryType;
  source?: string;
  defaults?: LeadDefaults;
  compact?: boolean;
  heading?: string;
  description?: string;
  className?: string;
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [inquiryType, setInquiryType] = useState<InquiryType>(defaultType);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    setMessage("");
    setFieldErrors({});

    const payload = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
      consent: data.get("consent") === "on",
      inquiryType,
      projectId: projectId ?? undefined,
      projectName: projectName ?? undefined,
      source,
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        throw new Error(result.error || "Could not send your request");
      }
      setStatus("success");
      setMessage(result.message || "Thank you — the team will be in touch shortly.");
      form.reset();
      toast("Request received — our team will be in touch.", "success");
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
          <h3 className="font-display text-xl">Request received</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{message}</p>
        </div>
        <p className="text-[0.7rem] text-ink-muted">
          This is a demonstration platform — no real sales team is attached to these sample projects.
        </p>
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
          Send another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("surface p-6", className)} noValidate>
      {heading && (
        <div className="mb-5">
          <p className="eyebrow-plain">{projectName ? projectName : "Speak to the team"}</p>
          <h3 className="mt-2 font-display text-xl">{heading}</h3>
          {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
        </div>
      )}

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <div>
          <label htmlFor="lead-name" className="field-label">Full name</label>
          <input id="lead-name" name="name" required autoComplete="name" defaultValue={defaults?.name} className="field" placeholder="Your name" />
          {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
        </div>
        <div>
          <label htmlFor="lead-phone" className="field-label">Mobile number</label>
          <input id="lead-phone" name="phone" required type="tel" inputMode="numeric" autoComplete="tel" defaultValue={defaults?.phone} className="field" placeholder="10-digit mobile" />
          {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
        </div>
        <div className={cn(!compact && "sm:col-span-2")}>
          <label htmlFor="lead-email" className="field-label">Email <span className="normal-case tracking-normal">(optional)</span></label>
          <input id="lead-email" name="email" type="email" autoComplete="email" defaultValue={defaults?.email} className="field" placeholder="you@example.com" />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>
        <div className={cn(!compact && "sm:col-span-2")}>
          <label htmlFor="lead-type" className="field-label">I would like to</label>
          <select
            id="lead-type"
            name="inquiryType"
            className="field"
            value={inquiryType}
            onChange={(event) => setInquiryType(event.target.value as InquiryType)}
          >
            <option value="CALLBACK">Request a callback</option>
            <option value="CONTACT">Ask about pricing / availability</option>
            <option value="GENERAL">General inquiry</option>
          </select>
        </div>
        <div className={cn(!compact && "sm:col-span-2")}>
          <label htmlFor="lead-message" className="field-label">Your brief <span className="normal-case tracking-normal">(optional)</span></label>
          <textarea id="lead-message" name="message" rows={compact ? 2 : 3} className="field resize-none" placeholder="Configuration, budget, timeline…" />
          {fieldErrors.message && <p className="field-error">{fieldErrors.message}</p>}
        </div>
      </div>

      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="lead-website">Website</label>
        <input id="lead-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[0.76rem] leading-relaxed text-ink-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 size-3.5 accent-forest" />
        <span>
          I agree to be contacted about this inquiry. Sample data only — this form is not connected to a real sales team.
        </span>
      </label>
      {fieldErrors.consent && <p className="field-error">{fieldErrors.consent}</p>}

      {status === "error" && (
        <p role="alert" className="mt-4 rounded border border-rust/25 bg-rust/10 px-3 py-2 text-sm text-rust">
          {message}
        </p>
      )}

      <Button type="submit" variant="primary" className="mt-5 w-full" loading={status === "loading"}>
        {status === "loading" ? "Sending" : "Send my request"}
        {status !== "loading" && <ArrowRight className="size-4" />}
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.66rem] text-ink-muted">
        <ShieldCheck className="size-3.5 text-forest" /> Your details stay private. No spam, ever.
      </p>
      {compact && (
        <p className="mt-3 flex items-center gap-1.5 text-[0.66rem] text-ink-muted">
          <Sparkles className="size-3.5 text-brass" /> Responses are illustrative for this demonstration.
        </p>
      )}
    </form>
  );
}

