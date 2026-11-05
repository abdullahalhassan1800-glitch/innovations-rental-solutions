import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  dark = false,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: { label: string; href: string };
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className={cn("eyebrow", dark && "text-brass-soft")}>{eyebrow}</p>}
        <h2 className={cn("display-lg mt-5 balance", dark ? "text-paper" : "text-ink")}>{title}</h2>
        {description && (
          <p className={cn("lede mt-4 max-w-xl pretty", dark && "text-paper/65")}>{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-all duration-300",
            dark
              ? "border-paper/20 text-paper hover:border-brass-soft hover:bg-surface/[0.06] hover:text-brass-soft"
              : "border-line bg-surface text-ink hover:border-brass/50 hover:text-brass hover:shadow-card",
          )}
        >
          {action.label}
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
