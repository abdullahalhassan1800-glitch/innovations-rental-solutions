"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Phone, X, LayoutDashboard, UserRound, ArrowUpRight, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LeadModal } from "@/components/forms/lead-modal";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SITE } from "@/lib/constants";

type HeaderUser = { name: string; role: string } | null;

export function SiteHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const firstPath = useRef(true);
  useEffect(() => {
    // Do not close the menu during the initial mount effect: a fast click can
    // otherwise open the drawer and have it immediately closed again.
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden border-b border-paper/10 bg-night text-paper md:block">
        <div className="shell flex h-9 items-center justify-between text-[0.62rem] uppercase tracking-[0.20em] text-paper/50">
          <p>Noida · Delhi · NCR</p>
          <div className="flex items-center gap-6">
            <span className="text-brass-soft/90">Rental Investment Properties</span>
            <a href={`mailto:${SITE.email}`} className="hidden items-center gap-1.5 hover:text-paper lg:flex">
              <Mail className="size-3" /> {SITE.email}
            </a>
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-paper">
              <Phone className="size-3" /> {SITE.phone}
            </a>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "border-b backdrop-blur-xl transition-all duration-500",
          scrolled
            ? "border-paper/10 bg-night/90 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.9)]"
            : "border-paper/[0.06] bg-night/70",
        )}
      >
        <div className="shell flex h-[74px] items-center justify-between gap-5">
          <Logo invert />

          <nav aria-label="Primary" className="hidden items-center gap-3.5 lg:flex">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label} className="group relative">
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 py-2 text-[0.62rem] font-medium uppercase tracking-[0.14em] transition-colors hover:text-brass-soft",
                      link.children.some((child) => isActive(child.href))
                        ? "text-brass-soft"
                        : "text-paper/70",
                    )}
                  >
                    {link.label}
                    <ChevronDown className="size-3 transition-transform duration-300 group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-[14px] border border-paper/10 bg-surface p-2 shadow-float">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "group/item block rounded-lg border-l-2 px-3.5 py-3 transition-colors hover:border-brass hover:bg-paper/[0.04]",
                            isActive(child.href) ? "border-brass bg-paper/[0.04]" : "border-transparent",
                          )}
                        >
                          <span className="block text-[0.88rem] font-medium text-paper">{child.label}</span>
                          {child.blurb && (
                            <span className="mt-0.5 block text-[0.68rem] leading-relaxed text-ink-muted">{child.blurb}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative py-2 text-[0.62rem] font-medium uppercase tracking-[0.14em] transition-colors hover:text-brass-soft",
                    isActive(link.href) ? "text-brass-soft" : "text-paper/70",
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-px bg-brass" aria-hidden />
                  )}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-4 xl:flex">
            {user ? (
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-3.5 py-2 text-[0.72rem] font-medium text-paper/80 transition hover:border-brass/45 hover:text-paper"
              >
                {user.role === "ADMIN" ? (
                  <LayoutDashboard className="size-3.5" />
                ) : (
                  <UserRound className="size-3.5" />
                )}
                <span className="max-w-[8rem] truncate">{user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <LeadModal label="Enquire" size="sm" source="header" className="px-5" />
            )}
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-paper/20 text-paper transition hover:border-brass/60 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-0 z-[60] h-[100dvh] overflow-y-auto bg-night pt-[74px] lg:hidden"
        >
          <div className="shell flex flex-col pb-10">
            <div className="flex items-center justify-between border-b border-paper/10 py-4">
              <Logo invert />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-full border border-paper/20 text-paper"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav aria-label="Mobile" className="mt-2">
              {NAV_LINKS.map((link, index) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-baseline gap-4 border-b border-paper/[0.08] py-4 font-display text-[1.5rem] tracking-[-0.02em]",
                      isActive(link.href) || link.children?.some((child) => isActive(child.href))
                        ? "text-brass-soft"
                        : "text-paper",
                    )}
                  >
                    <span aria-hidden className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-brass">
                      0{index + 1}
                    </span>
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="-mt-1 space-y-0.5 border-b border-paper/[0.08] pb-3 pl-14">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block py-2 text-[0.92rem] font-medium transition-colors hover:text-brass-soft",
                            isActive(child.href) ? "text-brass-soft" : "text-paper/65",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href={user ? dashboardHref : "/login"}
                className="flex items-baseline gap-4 border-b border-paper/[0.08] py-4 font-display text-[1.5rem] tracking-[-0.02em] text-paper"
              >
                <span aria-hidden className="font-sans text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-brass">
                  0{NAV_LINKS.length + 1}
                </span>
                {user ? "Dashboard" : "Contact"}
              </Link>
            </nav>

            <div className="mt-8 flex flex-col gap-3">
              <LeadModal label="Start a private enquiry" source="mobile-menu" className="w-full" />
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 py-3 text-sm text-paper/70"
              >
                <Phone className="size-4 text-brass" /> {SITE.phone}
              </a>
              <Link href="/contact" className="flex items-center justify-center gap-1.5 py-2 text-[0.78rem] font-semibold text-brass-soft">
                Contact the team <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
