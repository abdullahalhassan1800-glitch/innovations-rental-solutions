"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Mail, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"welcome" | "details" | "success">("welcome");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 2300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      setError("Please fill in name, phone and your requirement.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send message");
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setOpen(false);
    setStep("welcome");
    setForm({ name: "", phone: "", email: "", message: "" });
    setError("");
  };

  if (step === "success") {
    return (
      <div className="fixed bottom-6 right-6 z-[60]">
        <div className="surface rounded-[24px] border border-line p-6 shadow-2xl w-[440px] max-w-[90vw] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-brass text-night">
                <Mail className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-base leading-tight">Message Sent</h3>
                <p className="text-[0.65rem] text-ink-muted">
                  Your details are with our team.
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="p-1 text-ink-muted hover:bg-night/10 rounded-full transition"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>
          </div>
          <p className="text-sm text-ink-soft leading-relaxed">
            Thank you! We&rsquo;ll get back to you shortly at{" "}
            <span className="text-brass font-semibold">{form.email || form.phone}</span>.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={reset}
              variant="outline"
              className="flex-1"
            >
              New Message
            </Button>
            <Button onClick={() => setOpen(false)} variant="ghost" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop when panel is open */}
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-night/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Launcher button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[60] size-12 rounded-full bg-brass text-night shadow-float hover:bg-brass-soft hover:-translate-y-0.5 transition-all"
        aria-label="Open chat"
        title="Chat with us"
      >
        <MessageCircle className="size-5" />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Housirentz Support"
          className="fixed bottom-[calc(5rem+1rem)] right-6 z-[60] w-[400px] max-w-[92vw] flex flex-col"
        >
          <div className="surface rounded-[24px] border border-line shadow-2xl flex flex-col overflow-hidden mt-4">
            <header className="bg-brass text-night px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-night text-brass">
                  <MessageCircle className="size-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base leading-tight">Housirentz Support</h3>
                  <p className="text-[0.62rem] uppercase tracking-[0.1em] text-night/60">Rental Investment Advisor</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-night hover:bg-night/10 rounded-full transition"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="p-5 pb-1 overflow-y-auto flex-1 min-h-[300px] max-h-[560px]">
              <div className="flex flex-col gap-3 pt-1">
                <p className="text-sm text-ink-soft leading-relaxed">
                  Hi! I&rsquo;m here to help you with rental investment properties. Share your details and I&rsquo;ll forward them to our sales team.
                </p>

                {error && (
                  <p className="text-rust text-xs font-medium">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="cb-name" className="text-[0.68rem] font-medium text-ink-muted">
                        Your name
                      </label>
                      <input
                        id="cb-name"
                        autoFocus
                        className="field rounded-[10px] border border-line bg-night px-3.5 py-2.5 text-paper focus:border-brass focus:outline-none"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="cb-phone" className="text-[0.68rem] font-medium text-ink-muted">
                        Phone number
                      </label>
                      <input
                        id="cb-phone"
                        className="field rounded-[10px] border border-line bg-night px-3.5 py-2.5 text-paper focus:border-brass focus:outline-none"
                        value={form.phone}
                        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g. 92059 08398"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="cb-email" className="text-[0.68rem] font-medium text-ink-muted">
                        Email (optional)
                      </label>
                      <input
                        id="cb-email"
                        className="field rounded-[10px] border border-line bg-night px-3.5 py-2.5 text-paper focus:border-brass focus:outline-none"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g. name@example.com"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="cb-message" className="text-[0.68rem] font-medium text-ink-muted">
                        What are you looking for?
                      </label>
                      <textarea
                        id="cb-message"
                        className="field rounded-[10px] border border-line bg-night px-3.5 py-2.5 text-paper focus:border-brass focus:outline-none resize-none"
                        value={form.message}
                        onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                        rows={3}
                        placeholder="e.g. 2 BHK flat in Noida under 75 lakh"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-brass text-night font-semibold py-3 rounded-[12px] hover:bg-brass-soft transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="size-4 mr-2" />
                          Send Details
                        </>
                      )}
                    </Button>
                  </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
