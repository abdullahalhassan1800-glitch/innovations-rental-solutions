import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { formatPriceShort, parseBhk } from "@/lib/utils";
import type { ProjectCardData } from "@/lib/queries";
import { StatusBadge, DemoBadge } from "@/components/ui/badge";
import { FavoriteButton } from "./favorite-button";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  saved = false,
  className,
  priority = false,
}: {
  project: ProjectCardData;
  saved?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const configs = parseBhk(project.bhkConfigs);
  const configLabel = configs.length
    ? project.propertyType === "COMMERCIAL"
      ? configs.join(" · ")
      : configs.map((c) => `${c} BHK`).join(" · ")
    : project.category;
  const image = project.images[0]?.url ?? project.heroImage;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[14px] border border-line/90 bg-surface shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-brass/45 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <Link href={`/projects/${project.slug}`} className="image-zoom absolute inset-0" aria-label={`View ${project.name}`}>
          {image ? (
            <Image
              src={image}
              alt={project.images[0]?.alt || `${project.name} in ${project.location.name}`}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-sand text-sm text-ink-muted">
              Image coming soon
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night/65 via-night/5 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          <StatusBadge status={project.status} className="pointer-events-auto bg-surface/95 backdrop-blur" />
          {project.isDemo && <DemoBadge subtle />}
        </div>

        <FavoriteButton
          projectId={project.id}
          initialSaved={saved}
          className="absolute right-3 top-3 z-10"
        />

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <p className="flex items-center gap-1.5 rounded-full bg-night/45 px-3 py-1 text-[0.66rem] font-medium text-paper backdrop-blur">
            <MapPin className="size-3 text-brass-soft" /> {project.location.name}
          </p>
          <span className="flex size-9 items-center justify-center rounded-full border border-paper/30 bg-surface/95 text-ink opacity-0 transition-all duration-300 group-hover:opacity-100">
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink-muted">
          <span className="mr-1.5 inline-block size-1 rounded-full bg-brass align-middle" aria-hidden />
          {project.developer.name}
        </p>
        <h3 className="mt-2 font-display text-[1.32rem] leading-tight tracking-[-0.025em]">
          <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-forest">
            {project.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-1 text-[0.76rem] text-ink-muted">{project.category} · {configLabel}</p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line/80 pt-4 [margin-top:1.35rem]">
          <div>
            <p className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-ink-muted">Starting from</p>
            <p className="mt-1 font-display text-[1.35rem] leading-none text-ink">
              {formatPriceShort(project.startingPrice)}
              <span className="ml-1.5 align-middle font-sans text-[0.58rem] font-bold uppercase tracking-[0.12em] text-brass">onwards</span>
            </p>
          </div>
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-forest transition-all duration-300 hover:border-brass/50 hover:bg-brass-pale/50 hover:text-brass"
          >
            Explore <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
