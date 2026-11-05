"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type LocationRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  description: string | null;
  imageUrl: string | null;
  highlights: string[];
  sortOrder: number;
  _count: { projects: number };
};

export function LocationManager({ locations }: { locations: LocationRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState<LocationRow | null>(null);
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
    const highlights = String(data.get("highlights") ?? "")
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      name: String(data.get("name") ?? ""),
      slug: String(data.get("slug") ?? "") || undefined,
      city: String(data.get("city") ?? ""),
      state: String(data.get("state") ?? ""),
      description: String(data.get("description") ?? ""),
      imageUrl: String(data.get("imageUrl") ?? "") || null,
      highlights,
      sortOrder: String(data.get("sortOrder") ?? "0"),
    };

    try {
      const response = await fetch(
        editing ? `/api/admin/locations/${editing.id}` : "/api/admin/locations",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save the location");
      toast(editing ? "Location updated" : "Location created", "success");
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function remove(location: LocationRow) {
    if (!window.confirm(`Delete ${location.name}? This cannot be undone.`)) return;
    setBusyId(location.id);
    try {
      const response = await fetch(`/api/admin/locations/${location.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete the location");
      toast("Location deleted", "success");
      if (editing?.id === location.id) reset();
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
          <h2 className="font-display text-lg">Locations</h2>
          <span className="text-[0.68rem] text-ink-muted">{locations.length} micro-markets</span>
        </div>
        {locations.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-muted">No locations yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {locations.map((location) => (
              <li key={location.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{location.name}</p>
                  <p className="mt-0.5 text-[0.68rem] text-ink-muted">
                    /{location.slug} · {location.city}, {location.state} · {location._count.projects}{" "}
                    {location._count.projects === 1 ? "project" : "projects"} · order {location.sortOrder}
                  </p>
                  {location.description && (
                    <p className="mt-1.5 line-clamp-2 max-w-xl text-[0.74rem] leading-relaxed text-ink-soft">
                      {location.description}
                    </p>
                  )}
                  {location.highlights.length > 0 && (
                    <p className="mt-1 text-[0.66rem] text-ink-muted">{location.highlights.length} highlights</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(location);
                      setError("");
                      setFormKey((value) => value + 1);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-forest/40 hover:text-forest"
                    aria-label={`Edit ${location.name}`}
                    title="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(location)}
                    disabled={busyId === location.id}
                    className="inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-rust/40 hover:text-rust disabled:opacity-50"
                    aria-label={`Delete ${location.name}`}
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
            <MapPin className="size-4 text-brass" />
            <h2 className="font-display text-lg">{editing ? "Edit location" : "Add location"}</h2>
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

        <form key={`${editing?.id ?? "new"}-${formKey}`} onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="location-name" className="field-label">Name *</label>
            <input id="location-name" name="name" required defaultValue={editing?.name ?? ""} className="field" />
          </div>
          <div>
            <label htmlFor="location-slug" className="field-label">Slug</label>
            <input id="location-slug" name="slug" defaultValue={editing?.slug ?? ""} className="field" placeholder="auto-generated" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="location-city" className="field-label">City *</label>
              <input id="location-city" name="city" required defaultValue={editing?.city ?? "Noida"} className="field" />
            </div>
            <div>
              <label htmlFor="location-state" className="field-label">State *</label>
              <input id="location-state" name="state" required defaultValue={editing?.state ?? "Uttar Pradesh"} className="field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="location-order" className="field-label">Sort order</label>
              <input id="location-order" name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} className="field" />
            </div>
            <div>
              <label htmlFor="location-image" className="field-label">Image URL</label>
              <input id="location-image" name="imageUrl" defaultValue={editing?.imageUrl ?? ""} className="field" placeholder="/images/location.jpg" />
            </div>
          </div>
          <div>
            <label htmlFor="location-description" className="field-label">Description</label>
            <textarea
              id="location-description"
              name="description"
              rows={3}
              defaultValue={editing?.description ?? ""}
              className="field resize-none"
              maxLength={2000}
            />
          </div>
          <div>
            <label htmlFor="location-highlights" className="field-label">Highlights</label>
            <textarea
              id="location-highlights"
              name="highlights"
              rows={3}
              defaultValue={editing?.highlights.join("\n") ?? ""}
              className="field resize-none"
              placeholder={"One per line, e.g.\nExpressway access\nEstablished retail"}
            />
            <p className="mt-1 text-[0.66rem] text-ink-muted">One highlight per line (commas also work).</p>
          </div>

          {error && <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-[0.78rem] text-rust">{error}</p>}

          <Button type="submit" loading={saving} className="w-full">
            {editing ? <Save className="size-4" /> : <Plus className="size-4" />}
            {editing ? "Save changes" : "Add location"}
          </Button>
        </form>
      </section>
    </div>
  );
}
