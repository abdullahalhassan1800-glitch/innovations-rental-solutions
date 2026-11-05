"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortSelect({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const value = searchParams.get("sort") || "featured";

  return (
    <label className="flex items-center gap-2 text-[0.75rem] text-ink-muted">
      <span className="whitespace-nowrap">Sort</span>
      <select
        value={value}
        disabled={pending}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          if (event.target.value === "featured") params.delete("sort");
          else params.set("sort", event.target.value);
          params.delete("page");
          const query = params.toString();
          startTransition(() => router.push(query ? `${basePath}?${query}` : basePath, { scroll: false }));
        }}
        className="h-9 rounded-full border border-line bg-surface px-3.5 text-[0.78rem] text-ink transition focus:border-brass focus:outline-none"
        aria-label="Sort projects"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
