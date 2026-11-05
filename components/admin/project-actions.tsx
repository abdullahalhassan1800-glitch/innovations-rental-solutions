"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Eye, EyeOff, Loader2, Star, StarOff, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Action = "publish" | "unpublish" | "feature" | "unfeature" | "archive" | "restore";

export function ProjectActions({
  id,
  published,
  featured,
  archived,
}: {
  id: string;
  published: boolean;
  featured: boolean;
  archived: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState<string | null>(null);

  async function patch(action: Action) {
    setPending(action);
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update the project");
      toast(result.message || "Project updated", "success");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Something went wrong", "error");
    } finally {
      setPending(null);
    }
  }

  async function permanentDelete() {
    if (!window.confirm("Permanently delete this project and its images, plans and leads? This cannot be undone.")) {
      return;
    }
    setPending("delete");
    try {
      const response = await fetch(`/api/admin/projects/${id}?permanent=true`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete the project");
      toast("Project permanently deleted", "success");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Something went wrong", "error");
    } finally {
      setPending(null);
    }
  }

  const buttonClass =
    "inline-flex size-8 items-center justify-center rounded border border-line bg-surface text-ink-muted transition hover:border-ink/30 hover:text-ink disabled:opacity-50";

  return (
    <div className="flex items-center justify-end gap-1.5">
      {archived ? (
        <>
          <button
            type="button"
            className={buttonClass}
            onClick={() => patch("restore")}
            disabled={pending !== null}
            title="Restore project"
            aria-label="Restore project"
          >
            {pending === "restore" ? <Loader2 className="size-3.5 animate-spin" /> : <ArchiveRestore className="size-3.5" />}
          </button>
          <button
            type="button"
            className={cn(buttonClass, "hover:border-rust/40 hover:text-rust")}
            onClick={permanentDelete}
            disabled={pending !== null}
            title="Delete permanently"
            aria-label="Delete project permanently"
          >
            {pending === "delete" ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={buttonClass}
            onClick={() => patch(published ? "unpublish" : "publish")}
            disabled={pending !== null}
            title={published ? "Unpublish project" : "Publish project"}
            aria-label={published ? "Unpublish project" : "Publish project"}
          >
            {pending === (published ? "unpublish" : "publish") ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : published ? (
              <Eye className="size-3.5" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
          </button>
          <button
            type="button"
            className={cn(buttonClass, featured && "border-brass/40 bg-brass-pale text-brass-soft")}
            onClick={() => patch(featured ? "unfeature" : "feature")}
            disabled={pending !== null}
            title={featured ? "Remove from featured" : "Mark as featured"}
            aria-label={featured ? "Remove from featured" : "Mark as featured"}
          >
            {pending === (featured ? "unfeature" : "feature") ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : featured ? (
              <StarOff className="size-3.5" />
            ) : (
              <Star className="size-3.5" />
            )}
          </button>
          <button
            type="button"
            className={cn(buttonClass, "hover:border-rust/40 hover:text-rust")}
            onClick={() => patch("archive")}
            disabled={pending !== null}
            title="Archive project"
            aria-label="Archive project"
          >
            {pending === "archive" ? <Loader2 className="size-3.5 animate-spin" /> : <Archive className="size-3.5" />}
          </button>
        </>
      )}
    </div>
  );
}
