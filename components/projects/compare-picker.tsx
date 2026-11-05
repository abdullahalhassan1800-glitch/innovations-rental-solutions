"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Option = {
  id: string;
  name: string;
  slug: string;
  location: string;
  startingPrice: string;
};

export function ComparePicker({
  projects,
  initialIds = [],
  compact = false,
}: {
  projects: Option[];
  initialIds?: string[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialIds.slice(0, 3));
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(q) ||
        project.location.toLowerCase().includes(q),
    );
  }, [projects, query]);

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  function apply() {
    if (selected.length < 2) return;
    router.push(`/compare?ids=${selected.join(",")}`);
  }

  return (
    <div className={cn("rounded-md border border-line bg-surface", compact ? "p-4" : "p-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            {selected.length}/3 selected
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Pick two or three projects to compare side by side.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected([])}
              className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-ink-muted hover:text-rust"
            >
              <X className="size-3" /> Clear
            </button>
          )}
          <Button type="button" size="sm" onClick={apply} disabled={selected.length < 2}>
            Compare {selected.length >= 2 ? selected.length : ""}
          </Button>
        </div>
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search projects or locations"
          className="field pl-9"
          aria-label="Search projects to compare"
        />
      </div>

      <div className={cn("mt-3 grid gap-2 overflow-y-auto pr-1", compact ? "max-h-64" : "max-h-80")}>
        {filtered.map((project) => {
          const isSelected = selected.includes(project.id);
          const isDisabled = !isSelected && selected.length >= 3;
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => toggle(project.id)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center justify-between gap-3 rounded border px-3 py-2.5 text-left transition",
                isSelected
                  ? "border-brass/50 bg-brass/10"
                  : "border-line bg-cream/40 hover:border-ink/25",
                isDisabled && "cursor-not-allowed opacity-45",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-[0.84rem] font-semibold">{project.name}</span>
                <span className="mt-0.5 block text-[0.7rem] text-ink-muted">
                  {project.location} · from {project.startingPrice}
                </span>
              </span>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded border",
                  isSelected ? "border-forest bg-forest text-night" : "border-line bg-surface",
                )}
              >
                {isSelected && <Check className="size-3" />}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="rounded border border-dashed border-line px-3 py-6 text-center text-sm text-ink-muted">
            No projects match that search.
          </p>
        )}
      </div>
    </div>
  );
}
