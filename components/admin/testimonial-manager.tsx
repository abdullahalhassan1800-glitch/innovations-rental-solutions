"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareQuote, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";

type TestimonialRow = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  rating: number;
  published: boolean;
  sortOrder: number;
};

export function TestimonialManager({ testimonials }: { testimonials: TestimonialRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function reset() {
    setEditing(null);
    setError("");
    setFormKey((value) => value + 1);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      role: String(data.get("role") ?? ""),
      quote: String(data.get("quote") ?? ""),
      rating: String(data.get("rating") ?? "5"),
      published: data.get("published") === "on",
      sortOrder: String(data.get("sortOrder") ?? "0"),
    };
    try {
      const response = await fetch(
        editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save the testimonial");
      toast(editing ? "Testimonial updated" : "Testimonial created", "success");
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function remove(testimonial: TestimonialRow) {
    if (!window.confirm("Delete this testimonial? This cannot be undone.")) return;
    setBusyId(testimonial.id);
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete the testimonial");
      toast("Testimonial deleted", "success");
      if (editing?.id === testimonial.id) reset();
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0 rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="font-display text-lg">Testimonials</h2>
          <span className="text-[0.68rem] text-ink-muted">
            {testimonials.filter((item) => item.published).length} published
          </span>
        </div>
        {testimonials.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-muted">No testimonials yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {testimonials.map((testimonial) => (
              <li key={testimonial.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{testimonial.name}</p>
                      {testimonial.role && <span className="text-[0.68rem] text-ink-muted">{testimonial.role}</span>}
                      {!testimonial.published && <Badge tone="rust">Hidden</Badge>}
                    </div>
                    <Stars rating={testimonial.rating} className="mt-1" />
                    <blockquote className="mt-1.5 line-clamp-3 text-[0.78rem] leading-relaxed text-ink-soft">
                      “{testimonial.quote}”
                    </blockquote>
                    <p className="mt-1 text-[0.6rem] text-ink-muted">Sort order {testimonial.sortOrder}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(testimonial);
                        setError("");
                        setFormKey((value) => value + 1);
                      }}
                      className="inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-forest/40 hover:text-forest"
                      aria-label="Edit testimonial"
                      title="Edit"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(testimonial)}
                      disabled={busyId === testimonial.id}
                      className="inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-rust/40 hover:text-rust disabled:opacity-50"
                      aria-label="Delete testimonial"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface h-fit p-4 lg:sticky lg:top-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="size-4 text-brass" />
            <h2 className="font-display text-lg">{editing ? "Edit testimonial" : "Add testimonial"}</h2>
          </div>
          {editing && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-ink-muted hover:text-ink">
              <X className="size-3" /> Cancel
            </button>
          )}
        </div>
        <p className="mt-1 text-[0.7rem] text-ink-muted">
          Demo testimonials must be clearly fictional. Never present invented quotes as real client reviews.
        </p>

        <form key={`${editing?.id ?? "new"}-${formKey}`} onSubmit={onSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="testimonial-name" className="field-label">Name *</label>
              <input id="testimonial-name" name="name" required defaultValue={editing?.name ?? ""} className="field" />
            </div>
            <div>
              <label htmlFor="testimonial-role" className="field-label">Role / context</label>
              <input id="testimonial-role" name="role" defaultValue={editing?.role ?? ""} className="field" placeholder="Sample buyer" />
            </div>
          </div>
          <div>
            <label htmlFor="testimonial-quote" className="field-label">Quote *</label>
            <textarea
              id="testimonial-quote"
              name="quote"
              required
              rows={5}
              minLength={20}
              maxLength={1000}
              defaultValue={editing?.quote ?? ""}
              className="field resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="testimonial-rating" className="field-label">Rating</label>
              <select id="testimonial-rating" name="rating" defaultValue={String(editing?.rating ?? 5)} className="field">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating} / 5</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="testimonial-order" className="field-label">Sort order</label>
              <input id="testimonial-order" name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} className="field" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-[0.78rem]">
            <input type="checkbox" name="published" defaultChecked={editing?.published ?? true} className="size-4 accent-forest" />
            Published on the homepage
          </label>
          {error && <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-[0.78rem] text-rust">{error}</p>}
          <Button type="submit" loading={saving} className="w-full">
            {editing ? <Save className="size-4" /> : <Plus className="size-4" />}
            {editing ? "Save changes" : "Add testimonial"}
          </Button>
        </form>
      </section>
    </div>
  );
}
