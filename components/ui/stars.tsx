import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ rating = 5, className }: { rating?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("size-3.5", i < rating ? "fill-brass text-brass" : "fill-transparent text-line")}
          aria-hidden
        />
      ))}
    </div>
  );
}
