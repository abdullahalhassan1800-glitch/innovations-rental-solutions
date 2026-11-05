import { cn } from "@/lib/utils";
import { SearchX, type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-surface/60 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-sand/60 text-ink-muted">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 font-display text-xl">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
