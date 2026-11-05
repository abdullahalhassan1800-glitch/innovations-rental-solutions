"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export function FavoriteButton({
  projectId,
  initialSaved = false,
  className,
  dark = false,
}: {
  projectId: string;
  initialSaved?: boolean;
  className?: string;
  dark?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  async function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    startTransition(async () => {
      try {
        const response = await fetch(`/api/saved/${projectId}`, { method: "POST" });
        if (response.status === 401) {
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not update saved projects");
        setSaved(Boolean(data.saved));
        toast(data.saved ? "Saved to your dashboard" : "Removed from saved projects", "success");
        router.refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : "Something went wrong", "error");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? "Remove from saved projects" : "Save this project"}
      aria-pressed={saved}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border backdrop-blur transition-all duration-200",
        dark
          ? "border-paper/25 bg-night/30 text-paper hover:bg-night/50"
          : "border-line bg-surface/90 text-ink hover:border-brass hover:text-brass",
        saved && "border-brass bg-brass text-night hover:text-night",
        pending && "opacity-60",
        className,
      )}
    >
      <Heart className={cn("size-4", saved && "fill-current")} />
    </button>
  );
}
