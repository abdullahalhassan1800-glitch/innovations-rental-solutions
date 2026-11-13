"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Lock, Mail, Phone, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";
const PHONE_RE = /^(\+91)?[6-9]\d{9}$/;

export function LeadModal({
  label = "Enquire now",
  source = "lead-modal",
  size = "md",
  className,
}: {
  label?: string;
  source?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    inquiryType: "CALLBACK",
    email: "",
    city: "",
    brief: "",
    consent: false,
  });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setStep(1);
    setStatus("idle");
    setMessage("");
    setErrors({});
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("input")?.focus();
    }, 40);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, close]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  function goToStepTwo() {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    const digits = form.phone.replace(/[^\d]/g, "").replace(/^91(?=\d{10}$)/, "");
    if (!PHONE_RE.test(digits)) next.phone = "Enter a valid 10-digit Indian mobile number.";
    setErrors(next);
    if (Object.keys(next).length === 0) setStep(2);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.consent) next.consent = "Please agree to be contacted about this enquiry.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone,
          email: form.email,
          message: [form.city ? `City: ${form.city}` : "", form.brief].filter(Boolean).join("\n"),
          inquiryType: form.inquiryType,
          source,
          website: "",
          consent: true,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (Array.isArray(result.issues)) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of result.issues) {
            if (issue.path) fieldErrors[String(issue.path)] = issue.message;
          }
          setErrors(fieldErrors);
        }
        throw new Error(result.error || "Could not send your request.");
      }
      setStatus("success");
      setMessage(result.message || "Thank you — the team will be in touch shortly.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group inline-flex items-center justify-center gap-2 rounded-full border border-brass bg-brass font-semibold tracking-[0.02em] text-night shadow-[0_18px_40px_-24px_rgba(124,92,232,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:border-brass-soft hover:bg-brass-soft active:translate-y-0",
          size === "sm" && "h-9 px-4 text-[0.74rem]",
          size === "md" && "h-11 px-6 text-[0.8rem]",
          size === "lg" && "h-12 px-7 text-[0.84rem]",
          className,
        )}
      >
        {label}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <div
            className="absolute inset-0 bg-night/85 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto border border-brass/25 bg-surface p-6 shadow-float sm:rounded-[18px] sm:p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close enquiry form"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-line text-ink-muted transition hover:border-brass/50 hover:text-ink"
            >
              <X className="size-4" />
            </button>

            {status === "success" ? (
              <div className="py-6 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brass/15 text-brass">
                  <CheckCircle2 className="size-7" />
                </span>
                <h2 id="lead-modal-title" className="mt-5 font-display text-2xl">Request received</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{message}</p>
                <p className="mt-4 text-[0.68rem] leading-relaxed text-ink-muted">
                  This is a demonstration platform. No real sales team is attached to these sample projects.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-line px-5 text-[0.78rem] font-semibold text-ink transition hover:border-brass/50"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-6 pr-8">
                  <div>
                    <p className="eyebrow">Private enquiry</p>
                    <h2 id="lead-modal-title" className="mt-3 font-display text-[1.6rem] leading-tight">
                      {step === 1 ? "Start with your details." : "One last thing."}
                    </h2>
                    <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-muted">
                      {step === 1
                        ? "Two short steps. A specialist will come back with a considered shortlist."
                        : "Tell us where you are looking and how you would like to be contacted."}
                    </p>
                  </div>
                  <span className="mt-1 shrink-0 font-display text-[0.8rem] tracking-[0.2em] text-brass">
                    0{step} / 02
                  </span>
                </div>

                <div className="mt-5 flex gap-1.5" aria-hidden>
                  <span className="h-0.5 flex-1 bg-brass" />
                  <span className={cn("h-0.5 flex-1 transition-colors", step === 2 ? "bg-brass" : "bg-line")} />
                </div>

                <form onSubmit={onSubmit} className="mt-6" noValidate>
                  {step === 1 ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="modal-name" className="field-label">Full name</label>
                        <div className="relative">
                          <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                          <input
                            id="modal-name"
                            name="name"
                            autoComplete="name"
                            className="field pl-10"
                            placeholder="Your name"
                            value={form.name}
                            onChange={(event) => update("name", event.target.value)}
                          />
                        </div>
                        {errors.name && <p className="field-error">{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="modal-phone" className="field-label">Mobile number</label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                          <input
                            id="modal-phone"
                            name="phone"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            className="field pl-10"
                            placeholder="10-digit mobile"
                            value={form.phone}
                            onChange={(event) => update("phone", event.target.value)}
                          />
                        </div>
                        {errors.phone && <p className="field-error">{errors.phone}</p>}
                      </div>
                      <div>
                        <label htmlFor="modal-interest" className="field-label">I am interested in</label>
                        <select
                          id="modal-interest"
                          className="field"
                          value={form.inquiryType}
                          onChange={(event) => update("inquiryType", event.target.value)}
                        >
                          <option value="CALLBACK">A callback from the team</option>
                          <option value="SITE_VISIT">Scheduling a site visit</option>
                          <option value="BROCHURE">Project details &amp; brochure</option>
                          <option value="CONTACT">Pricing and availability</option>
                          <option value="GENERAL">A general question</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={goToStepTwo}
                        className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-brass bg-brass text-[0.82rem] font-semibold text-night transition hover:bg-brass-soft"
                      >
                        Continue <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="modal-email" className="field-label">
                          Email <span className="normal-case tracking-normal">(optional)</span>
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                          <input
                            id="modal-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className="field pl-10"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(event) => update("email", event.target.value)}
                          />
                        </div>
                        {errors.email && <p className="field-error">{errors.email}</p>}
                      </div>
                      <div>
                        <label htmlFor="modal-city" className="field-label">City you are looking in</label>
                        <input
                          id="modal-city"
                          name="city"
                          className="field"
                          placeholder="Noida, Delhi, NOIDA…"
                          value={form.city}
                          onChange={(event) => update("city", event.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="modal-brief" className="field-label">
                          Your brief <span className="normal-case tracking-normal">(optional)</span>
                        </label>
                        <textarea
                          id="modal-brief"
                          name="brief"
                          rows={2}
                          className="field resize-none"
                          placeholder="Budget, configuration, timeline…"
                          value={form.brief}
                          onChange={(event) => update("brief", event.target.value)}
                        />
                      </div>
                      <label className="flex cursor-pointer items-start gap-2.5 text-[0.74rem] leading-relaxed text-ink-muted">
                        <input
                          type="checkbox"
                          checked={form.consent}
                          onChange={(event) => update("consent", event.target.checked)}
                          className="mt-0.5 size-3.5 accent-brass"
                        />
                        <span>
                          I agree to be contacted about this enquiry. Sample data only — this form is not connected to a real sales team.
                        </span>
                      </label>
                      {errors.consent && <p className="field-error">{errors.consent}</p>}

                      {status === "error" && (
                        <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-sm text-rust">
                          {message}
                        </p>
                      )}

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-line px-5 text-[0.78rem] font-semibold text-ink-muted transition hover:border-brass/50 hover:text-ink"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={status === "loading"}
                          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-brass bg-brass text-[0.82rem] font-semibold text-night transition hover:bg-brass-soft disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {status === "loading" ? "Sending…" : "Request a callback"}
                          {status !== "loading" && <ArrowRight className="size-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </form>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[0.64rem] text-ink-muted">
                  <Lock className="size-3 text-brass" /> Your details stay private.
                  <span className="text-ink-muted/60">·</span>
                  <ShieldCheck className="size-3 text-brass" /> Sample only
                  <span className="text-ink-muted/60">·</span>
                  <Sparkles className="size-3 text-brass" /> No spam
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

