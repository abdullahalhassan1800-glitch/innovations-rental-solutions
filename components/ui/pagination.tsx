import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params?: Record<string, string | string[] | undefined>;
}) {
  if (pageCount <= 1) return null;

  const hrefFor = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (key === "page" || value == null) continue;
      if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
      else search.set(key, value);
    }
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-brass/50 hover:text-brass",
          page <= 1 && "pointer-events-none opacity-40",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Link>
      {pages.map((p, index) =>
        p === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-ink-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full border text-sm font-medium transition",
              p === page
                ? "border-forest bg-forest text-night shadow-card"
                : "border-line bg-surface text-ink hover:border-brass/50 hover:text-brass",
            )}
          >
            {p}
          </Link>
        ),
      )}
      <Link
        href={hrefFor(Math.min(pageCount, page + 1))}
        aria-disabled={page >= pageCount}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-brass/50 hover:text-brass",
          page >= pageCount && "pointer-events-none opacity-40",
        )}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
