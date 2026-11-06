"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

type GalleryImage = { id: string; url: string; alt: string | null };

export function ProjectGallery({ images, projectName }: { images: GalleryImage[]; projectName: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const count = images.length;
  const current = images[index];

  const go = useCallback(
    (direction: number) => {
      setIndex((value) => (value + direction + count) % count);
    },
    [count],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "Escape") setLightbox(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go]);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  if (!count) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-[16px] border border-line bg-sand text-sm text-ink-muted">
        Images coming soon
      </div>
    );
  }

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-[18px] bg-night shadow-lift md:aspect-[16/9]">
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt || `${projectName} demonstration image ${index + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 900px"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/35 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-night/55 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-paper backdrop-blur">
            Sample gallery
          </span>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <span className="rounded-full bg-night/55 px-2.5 py-1 text-[0.62rem] font-medium text-paper backdrop-blur">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="flex size-9 items-center justify-center rounded-full bg-surface/90 text-ink transition hover:bg-surface"
            aria-label="View larger image"
          >
            <Expand className="size-4" />
          </button>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink opacity-90 transition hover:bg-surface md:opacity-0 md:group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink opacity-90 transition hover:bg-surface md:opacity-0 md:group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {images.map((image, imageIndex) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(imageIndex)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition",
                imageIndex === index ? "border-brass" : "border-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={`View image ${imageIndex + 1}`}
              aria-current={imageIndex === index}
            >
              <Image src={image.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-night/95 p-4" role="dialog" aria-modal="true" aria-label="Image viewer">
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-paper/20 text-paper hover:bg-surface/10"
            aria-label="Close image viewer"
          >
            <X className="size-5" />
          </button>
          <div className="relative h-[80vh] w-full max-w-6xl">
            <Image src={current.url} alt={current.alt || projectName} fill sizes="100vw" className="object-contain" />
          </div>
          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-paper/20 text-paper hover:bg-surface/10" aria-label="Previous image">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" onClick={() => go(1)} className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-paper/20 text-paper hover:bg-surface/10" aria-label="Next image">
                <ChevronRight className="size-5" />
              </button>
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-night/70 px-3 py-1 text-xs text-paper">{index + 1} / {count}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

