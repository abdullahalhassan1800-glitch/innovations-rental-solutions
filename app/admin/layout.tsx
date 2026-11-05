import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Logo } from "@/components/ui/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/dashboard/dashboard-nav";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Innovations Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-surface">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo invert />
            <span className="hidden rounded border border-brass/30 bg-brass-pale px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-brass-soft sm:inline-flex">
              Admin workspace
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1 text-[0.74rem] font-medium text-ink-muted transition hover:text-forest sm:inline-flex"
            >
              View site <ArrowUpRight className="size-3.5" />
            </Link>
            <div className="hidden text-right md:block">
              <p className="text-[0.76rem] font-semibold">{admin.name}</p>
              <p className="text-[0.64rem] text-ink-muted">{admin.email}</p>
            </div>
            <LogoutButton variant="outline" />
          </div>
        </div>
      </header>

      <div className="shell py-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)] xl:gap-8">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-md border border-line bg-surface p-3">
              <AdminNav />
            </div>
            <div className="mt-3 rounded-md border border-forest/20 bg-forest-soft/50 p-3">
              <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-night">
                <ShieldCheck className="size-3" /> Staff-only area
              </p>
              <p className="mt-1.5 text-[0.68rem] leading-relaxed text-night/70">
                Lead data and private contact details must never be shared publicly.
              </p>
            </div>
          </aside>

          <main id="main" className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.66rem] text-ink-muted">
                Demonstration data — changes apply only to the local database.
              </p>
              <Badge tone="brass">Admin only</Badge>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
