"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type DeveloperRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  establishedYear: number | null;
  website: string | null;
  logoUrl: string | null;
  isDemo: boolean;
  _count: { projects: number };
};

export function DeveloperManager({ developers }: { developers: DeveloperRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<DeveloperRow | null>(null);
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
      slug: String(data.get("slug") ?? "") || undefined,
      description: String(data.get("description") ?? ""),
      establishedYear: String(data.get("establishedYear") ?? "") || null,
      website: String(data.get("website") ?? ""),
      logoUrl: String(data.get("logoUrl") ?? "") || null,
      isDemo: data.get("isDemo") === "on",
    };

    try {
      const response = await fetch(
        editing ? `/api/admin/developers/${editing.id}` : "/api/admin/developers",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save the developer");
      toast(editing ? "Developer updated" : "Developer created", "success");
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function remove(developer: DeveloperRow) {
    if (!window.confirm(`Delete ${developer.name}? This cannot be undone.`)) return;
    setBusyId(developer.id);
    try {
      const response = await fetch(`/api/admin/developers/${developer.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete the developer");
      toast("Developer deleted", "success");
      if (editing?.id === developer.id) reset();
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]">
      <section className="min-w-0 overflow-hidden rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="font-display text-lg">Directory</h2>
          <span className="text-[0.68rem] text-ink-muted">{developers.length} developers</span>
        </div>
        {developers.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-muted">No developers yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {developers.map((developer) => (
              <li key={developer.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {developer.name}
                    {developer.isDemo && <span className="rounded-full border border-line bg-cream px-1.5 py-0.5 text-[0.58rem] uppercase tracking-wide text-ink-muted">Sample</span>}
                  </p>
                  <p className="mt-0.5 text-[0.68rem] text-ink-muted">
                    /{developer.slug}
                    {developer.establishedYear ? ` · Since ${developer.establishedYear}` : ""}
                    {` · ${developer._count.projects} ${developer._count.projects === 1 ? "project" : "projects"}`}
                  </p>
                  {developer.description && (
                    <p className="mt-1.5 line-clamp-2 max-w-xl text-[0.74rem] leading-relaxed text-ink-soft">
                      {developer.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(developer);
                      setError("");
                      setFormKey((value) => value + 1);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-forest/40 hover:text-forest"
                    aria-label={`Edit ${developer.name}`}
                    title="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(developer)}
                    disabled={busyId === developer.id}
                    className="inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-rust/40 hover:text-rust disabled:opacity-50"
                    aria-label={`Delete ${developer.name}`}
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface h-fit p-4 lg:sticky lg:top-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {editing ? <Pencil className="size-4 text-brass" /> : <Building2 className="size-4 text-brass" />}
            <h2 className="font-display text-lg">{editing ? "Edit developer" : "Add developer"}</h2>
          </div>
          {editing && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-ink-muted hover:text-ink"
            >
              <X className="size-3" /> Cancel
            </button>
          )}
        </div>
        <p className="mt-1 text-[0.7rem] text-ink-muted">
          Fictional developer profiles only. Do not add claims about real companies.
        </p>

        <form key={`${editing?.id ?? "new"}-${formKey}`} onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="developer-name" className="field-label">Name *</label>
            <input id="developer-name" name="name" required defaultValue={editing?.name ?? ""} className="field" />
          </div>
          <div>
            <label htmlFor="developer-slug" className="field-label">Slug</label>
            <input id="developer-slug" name="slug" defaultValue={editing?.slug ?? ""} className="field" placeholder="auto-generated" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="developer-year" className="field-label">Established</label>
              <input
                id="developer-year"
                name="establishedYear"
                type="number"
                min={1950}
                max={new Date().getFullYear()}
                defaultValue={editing?.establishedYear ?? ""}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="developer-sample" className="field-label">Sample record</label>
              <label className="flex h-[42px] items-center gap-2 rounded border border-line bg-surface px-3 text-[0.78rem]">
                <input type="checkbox" name="isDemo" defaultChecked={editing?.isDemo ?? true} className="size-3.5 accent-forest" />
                Sample data
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="developer-website" className="field-label">Website</label>
            <input id="developer-website" name="website" type="url" defaultValue={editing?.website ?? ""} className="field" placeholder="https://example.com" />
          </div>
          <div>
            <label htmlFor="developer-logo" className="field-label">Logo URL</label>
            <input id="developer-logo" name="logoUrl" defaultValue={editing?.logoUrl ?? ""} className="field" placeholder="/images/logo.svg" />
          </div>
          <div>
            <label htmlFor="developer-description" className="field-label">Description</label>
            <textarea
              id="developer-description"
              name="description"
              rows={4}
              defaultValue={editing?.description ?? ""}
              className="field resize-none"
              maxLength={2000}
              placeholder="A short, factual profile."
            />
          </div>

          {error && <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-[0.78rem] text-rust">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={saving} className={cn("flex-1", !editing && "w-full")}>
              {editing ? <Save className="size-4" /> : <Plus className="size-4" />}
              {editing ? "Save changes" : "Add developer"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

