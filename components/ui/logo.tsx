import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

/**
 * Brand lockups. `logo-dark.png` is the light-on-navy artwork used on dark
 * surfaces (site header, footer, admin); `logo-light.png` is the
 * navy-on-transparent artwork for light surfaces. Both are cropped to the
 * artwork so they line up with the page gutter.
 */
const LOGOS = {
  dark: { src: "/images/logo-dark.png", width: 1774, height: 887 },
  light: { src: "/images/logo-light.png", width: 1200, height: 744 },
} as const;

export function Logo({
  className,
  invert = false,
  compact = false,
}: {
  className?: string;
  invert?: boolean;
  compact?: boolean;
}) {
  const logo = invert ? LOGOS.dark : LOGOS.light;

  return (
    <Link
      href="/"
      aria-label={`${SITE.name} home`}
      className={cn("group inline-flex items-center", className)}
    >
      <Image
        src={logo.src}
        alt=""
        width={logo.width}
        height={logo.height}
        priority
        className={cn(
          "w-auto shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5",
          compact ? "h-8" : invert ? "h-12" : "h-10",
        )}
      />
    </Link>
  );
}
