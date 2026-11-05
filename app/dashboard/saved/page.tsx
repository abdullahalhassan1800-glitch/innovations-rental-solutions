import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectCardInclude } from "@/lib/queries";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Saved projects" };

export default async function SavedProjectsPage() {
  const user = await requireUser();
  const saved = await db.savedProject.findMany({
    where: { userId: user.id },
    include: { project: { include: projectCardInclude } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Shortlist</p>
          <h1 className="mt-3 font-display text-3xl">Saved projects.</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {saved.length} {saved.length === 1 ? "project" : "projects"} kept for a second look.
          </p>
        </div>
        <ButtonLink href="/projects" size="sm" variant="outline">Browse more</ButtonLink>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          className="mt-7"
          icon={Heart}
          title="Your shortlist is empty"
          description="Tap the heart icon on any project card or project page to save it here."
          action={<ButtonLink href="/projects" size="sm">Explore projects</ButtonLink>}
        />
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {saved.map(({ project }) => (
            <ProjectCard key={project.id} project={project} saved />
          ))}
        </div>
      )}
    </>
  );
}
