import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "gold" | "outline" | "ghost" | "light" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "accent-gradient border border-forest text-night shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_18px_40px_-24px_rgba(124,92,232,0.75)] hover:border-brass-soft",
  gold: "accent-gradient border border-brass text-night shadow-[0_1px_0_rgba(255,255,255,0.28)_inset,0_18px_40px_-24px_rgba(124,92,232,0.85)] hover:border-brass-soft",
  outline:
    "border border-ink/20 bg-transparent text-ink hover:border-brass/60 hover:bg-paper/[0.06]",
  ghost: "border border-transparent bg-transparent text-ink hover:bg-paper/[0.07]",
  light: "border border-paper/30 bg-paper text-night hover:border-brass-soft hover:bg-brass-soft",
  danger: "border border-rust bg-rust text-night hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.76rem] gap-1.5",
  md: "h-11 px-6 text-[0.82rem] gap-2",
  lg: "h-12 px-7 text-[0.86rem] gap-2",
};

const base =
  "inline-flex items-center justify-center rounded-full font-semibold tracking-[0.02em] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 whitespace-nowrap";

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
