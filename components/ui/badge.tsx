import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";

const statusStyles: Record<string, string> = {
  NEW_LAUNCH: "border-brass/30 bg-brass-pale text-brass-soft",
  READY_TO_MOVE: "border-ink/15 bg-night/[0.06] text-ink-soft",
  UNDER_CONSTRUCTION: "border-forest/25 bg-forest-soft text-night",
  UPCOMING: "border-line bg-cream text-ink-muted",
};

const inquiryStyles: Record<string, string> = {
  NEW: "bg-brass-pale text-brass-soft border-brass/30",
  CONTACTED: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  QUALIFIED: "bg-forest-soft text-night border-forest/20",
  CLOSED: "bg-night/[0.05] text-ink-muted border-line",
  SPAM: "border-rust/30 bg-rust/10 text-rust",
  PENDING: "bg-brass-pale text-brass-soft border-brass/30",
  CONFIRMED: "bg-forest-soft text-night border-forest/20",
  COMPLETED: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  CANCELLED: "bg-night/[0.05] text-ink-muted border-line",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em]",
        statusStyles[status] ?? "border-line bg-cream text-ink-muted",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function InquiryBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.08em]",
        inquiryStyles[status] ?? "border-line bg-cream text-ink-muted",
      )}
    >
      {label ?? status}
    </span>
  );
}

export function DemoBadge({ className, subtle = false }: { className?: string; subtle?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em]",
        subtle
          ? "border-paper/25 bg-night/25 text-paper/85 backdrop-blur"
          : "border-line bg-cream/80 text-ink-muted",
        className,
      )}
      title="Sample data for demonstration only"
    >
      Sample
    </span>
  );
}

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "neutral" | "forest" | "brass" | "rust";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em]",
        tone === "neutral" && "border-line bg-cream text-ink-muted",
        tone === "forest" && "border-forest/20 bg-forest-soft text-night",
        tone === "brass" && "border-brass/30 bg-brass-pale text-brass-soft",
        tone === "rust" && "border-rust/20 bg-rust/10 text-rust",
        className,
      )}
    >
      {children}
    </span>
  );
}

