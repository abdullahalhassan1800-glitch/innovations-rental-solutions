import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type AccordionItem = {
  id?: string;
  question: string;
  answer: string;
};

export function Accordion({
  items,
  className,
  defaultOpen = -1,
}: {
  items: AccordionItem[];
  className?: string;
  defaultOpen?: number;
}) {
  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item, index) => (
        <details key={item.id ?? item.question} className="group" open={index === defaultOpen}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left transition-colors hover:text-brass [&::-webkit-details-marker]:hidden">
            <span className="font-display text-[1.08rem] leading-snug text-ink">{item.question}</span>
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition group-open:rotate-180 group-open:border-forest group-open:text-forest">
              <ChevronDown className="size-4" />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 pr-12 text-sm leading-relaxed text-ink-soft">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
