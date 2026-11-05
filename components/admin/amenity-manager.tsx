"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AmenityIcon } from "@/components/ui/amenity-icon";

type AmenityRow = { id: string; name: string; icon: string | null; _count: { projects: number } };

export function AmenityManager({ amenities }: { amenities: AmenityRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<AmenityRow | null>(null);
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
      icon: String(data.get("icon") ?? ""),
    };
    try {
      const response = await fetch(
        editing ? `/api/admin/amenities/${editing.id}` : "/api/admin/amenities",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save the amenity");
      toast(editing ? "Amenity updated" : "Amenity created", "success");
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function remove(amenity: AmenityRow) {
    if (!window.confirm(`Delete "${amenity.name}"? It will be removed from ${amenity._count.projects} project(s).`)) return;
    setBusyId(amenity.id);
    try {
      const response = await fetch(`/api/admin/amenities/${amenity.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete the amenity");
      toast("Amenity deleted", "success");
      if (editing?.id === amenity.id) reset();
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
      <section className="min-w-0 rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="font-display text-lg">Master list</h2>
          <span className="text-[0.68rem] text-ink-muted">{amenities.length} amenities</span>
        </div>
        {amenities.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-muted">No amenities yet.</p>
        ) : (
          <ul className="grid gap-1 p-3 sm:grid-cols-2">
            {amenities.map((amenity) => (
              <li
                key={amenity.id}
                className="group flex items-center gap-2.5 rounded border border-transparent px-2.5 py-2 transition hover:border-line hover:bg-cream/50"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-forest-soft text-night">
                  <AmenityIcon name={amenity.name} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.8rem] font-medium">{amenity.name}</p>
                  <p className="text-[0.62rem] text-ink-muted">
                    {amenity._count.projects} {amenity._count.projects === 1 ? "project" : "projects"}
                    {amenity.icon ? ` · icon: ${amenity.icon}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-60 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(amenity);
                      setError("");
                      setFormKey((value) => value + 1);
                    }}
                    className="inline-flex h-7 items-center rounded border border-line bg-surface px-2 text-[0.66rem] font-semibold transition hover:border-forest/40 hover:text-forest"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(amenity)}
                    disabled={busyId === amenity.id}
                    className="inline-flex size-7 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-rust/40 hover:text-rust disabled:opacity-50"
                    aria-label={`Delete ${amenity.name}`}
                  >
                    <Trash2 className="size-3" />
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
            <Sparkles className="size-4 text-brass" />
            <h2 className="font-display text-lg">{editing ? "Edit amenity" : "Add amenity"}</h2>
          </div>
          {editing && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-ink-muted hover:text-ink">
              <X className="size-3" /> Cancel
            </button>
          )}
        </div>

        <form key={`${editing?.id ?? "new"}-${formKey}`} onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="amenity-name" className="field-label">Name *</label>
            <input id="amenity-name" name="name" required defaultValue={editing?.name ?? ""} className="field" placeholder="e.g. Swimming Pool" />
          </div>
          <div>
            <label htmlFor="amenity-icon" className="field-label">Icon key</label>
            <input id="amenity-icon" name="icon" defaultValue={editing?.icon ?? ""} className="field" placeholder="optional" />
            <p className="mt-1 text-[0.66rem] text-ink-muted">
              The public icon is chosen from the amenity name; this key is reserved for future icon packs.
            </p>
          </div>
          {error && <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-[0.78rem] text-rust">{error}</p>}
          <Button type="submit" loading={saving} className="w-full">
            {editing ? <Save className="size-4" /> : <Plus className="size-4" />}
            {editing ? "Save changes" : "Add amenity"}
          </Button>
        </form>

        <p className="mt-4 border-t border-line pt-3 text-[0.66rem] leading-relaxed text-ink-muted">
          Removing an amenity detaches it from every project. It does not delete the projects.
        </p>
      </section>
    </div>
  );
}
