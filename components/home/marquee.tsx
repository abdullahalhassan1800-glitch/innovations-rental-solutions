import { cn } from "@/lib/utils";

export function MarqueeRibbon({
  items,
  reverse = false,
  tone = "dark",
  className,
}: {
  items: string[];
  reverse?: boolean;
  tone?: "dark" | "gold";
  className?: string;
}) {
  const loop = [...items, ...items];
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y py-3.5",
        tone === "gold"
          ? "border-brass/40 bg-brass text-night"
          : "border-paper/10 bg-surface text-paper/70",
        className,
      )}
      aria-hidden
    >
      <div className={cn(reverse ? "marquee-reverse" : "marquee", "items-center gap-8 whitespace-nowrap")}>
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-8 text-[0.68rem] font-semibold uppercase tracking-[0.28em]">
            {item}
            <span className={cn("inline-block size-1.5 rounded-full", tone === "gold" ? "bg-night/60" : "bg-brass")} />
          </span>
        ))}
      </div>
    </div>
  );
}
