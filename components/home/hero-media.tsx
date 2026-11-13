/**
 * Full-bleed cinematic hero media: a muted, looping background video.
 * Drop a replacement at public/videos/hero.mp4 (or pass `src`) to change it.
 */
export function HeroMedia({
  src = "/videos/hero.mp4",
  className,
}: {
  src?: string;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden bg-night ${className ?? ""}`}>
      <video
        className="absolute inset-0 size-full object-cover object-center motion-reduce:opacity-0"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
        disablePictureInPicture
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* Smooth charcoal-to-purple gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-night via-sand-deep/70 to-sand-deep/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-sand-deep/20 to-violet-deep/55" />
      <div className="grain absolute inset-0" />
    </div>
  );
}
