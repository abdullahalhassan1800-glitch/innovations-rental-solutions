"use client";

import { useEffect, useState } from "react";
import { MessageCircle, User, X } from "lucide-react";
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

  if (open && step === "success") {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="surface rounded-[20px] border border-line p-8 shadow-2xl w-[420px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-base">Message Sent</h3>
            <button
              onClick={() => { setOpen(false); setStep("welcome"); setForm({ name: "", phone: "", email: "", message: "" }); }}
              className="p-1 text-ink-muted hover:bg-night/10 rounded-lg"
            >
              <X className="size-5" />
            </button>
          </div>
          <p className="text-sm text-ink-soft">
            Thank you! Your details have been sent to our team. We&rsquo;ll get back to you shortly at{' '}
            <span className="text-brass font-semibold">{form.email || form.phone}</span>.
          </p>
          <div className="mt-8">
            <Button onClick={() => { setOpen(false); setStep("welcome"); setForm({ name: "", phone: "", email: "", message: "" }); }} variant="outline" className="w-full">
              New Message
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
      <div className={`fixed bottom-6 right-6 z-50 ${open ? "z-[60]" : ""}`}>
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-brass text-night p-3 shadow-lg hover:bg-brass-soft transition-all"
          aria-label="Open chatbot"
        >
          <MessageCircle className="size-5" />
        </button>

        {open && step !== "success" && (
          <div role="dialog" aria-label="Innovations Support" className="surface rounded-[20px] border border-line p-0 shadow-2xl w-[420px] mt-4 flex flex-col">
            <div className="bg-brass text-night rounded-t-[20px] px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-base">Innovations Support</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-night hover:bg-night/10 rounded-lg"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 text-ink-soft text-base leading-relaxed h-[420px] overflow-y-auto space-y-4">
              <p className="text-sm">
                Hi! I&rsquo;m here to help. Share your details and I&rsquo;ll forward them to our sales team.
              </p>
              {error && (
                <p className="text-rust text-xs">{error}</p>
              )}
              {step === "welcome" ? (
                <>
                  <p className="text-ink-muted">Quickly tell us:</p>
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => setStep("details")}
                      className="w-full text-left py-2 border border-line rounded-lg hover:bg-surface/50 transition"
                    >
                      <User className="mr-2 size-4 text-brass" /> Share my details
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="cb-name" className="block text-xs text-ink-muted mb-1">
                      Your name
                    </label>
                    <input
                      id="cb-name"
                      className="w-full rounded border border-line bg-night px-3 py-2 text-paper focus:border-brass"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div>
                    <label htmlFor="cb-phone" className="block text-xs text-ink-muted mb-1">
                      Phone number
                    </label>
                    <input
                      id="cb-phone"
                      className="w-full rounded border border-line bg-night px-3 py-2 text-paper focus:border-brass"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 92059 08398"
                    />
                  </div>
                  <div>
                    <label htmlFor="cb-email" className="block text-xs text-ink-muted mb-1">
                      Email (optional)
                    </label>
                    <input
                      id="cb-email"
                      className="w-full rounded border border-line bg-night px-3 py-2 text-paper focus:border-brass"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. name@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="cb-message" className="block text-xs text-ink-muted mb-1">
                      What are you looking for?
                    </label>
                    <textarea
                      id="cb-message"
                      className="w-full rounded border border-line bg-night px-3 py-2 text-paper focus:border-brass"
                      value={form.message}
                      onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      placeholder="e.g. 2 BHK flat in Noida under 75 lakh"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brass text-night font-medium py-2"
                  >
                    {submitting ? "Sending..." : "Send Details"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
