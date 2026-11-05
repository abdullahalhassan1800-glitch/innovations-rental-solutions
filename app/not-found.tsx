import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass, Home, Search } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for could not be found.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader user={null} />
      <main id="main" className="shell flex min-h-[62vh] items-center py-16 md:py-24">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow">Error 404</p>
            <h1 className="display-xl mt-4 balance">This address doesn&apos;t exist.</h1>
            <p className="lede mt-5 max-w-lg pretty">
              The page may have moved, or the link may be incomplete. Start from the project
              collection or explore by location instead.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <ButtonLink href="/projects" size="md">
                <Search className="size-4" /> Browse projects
              </ButtonLink>
              <ButtonLink href="/" size="md" variant="outline">
                <Home className="size-4" /> Back home
              </ButtonLink>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[0.8rem] font-medium text-ink-muted">
              <Link href="/location/noida" className="inline-flex items-center gap-1.5 hover:text-forest">
                <Compass className="size-3.5" /> Noida
              </Link>
              <Link href="/location/greater-noida" className="inline-flex items-center gap-1.5 hover:text-forest">
                <Compass className="size-3.5" /> Greater Noida
              </Link>
              <Link href="/location/noida-extension" className="inline-flex items-center gap-1.5 hover:text-forest">
                <Compass className="size-3.5" /> Noida Extension
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-line bg-surface p-8">
            <span className="font-display text-[7rem] leading-none tracking-[-0.06em] text-sand md:text-[9rem]">
              404
            </span>
            <div className="mt-6 border-t border-line pt-5">
              <p className="eyebrow-plain">Try instead</p>
              <ul className="mt-3 space-y-2.5 text-[0.86rem]">
                {[
                  { label: "All projects", href: "/projects" },
                  { label: "Residential addresses", href: "/residential" },
                  { label: "Commercial spaces", href: "/commercial" },
                  { label: "Contact the desk", href: "/contact" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="inline-flex items-center gap-2 font-medium hover:text-forest">
                      <ArrowLeft className="size-3.5 rotate-180 text-brass" /> {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
