import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Innovations" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <SiteHeader user={{ name: user.name, role: user.role }} />
      <main id="main" className="shell py-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] xl:gap-10">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-line bg-surface p-4">
              <p className="px-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Signed in as
              </p>
              <p className="mt-1 truncate px-2 font-display text-lg">{user.name}</p>
              <p className="mb-3 truncate px-2 text-[0.7rem] text-ink-muted">{user.email}</p>
              <div className="hairline mb-3" />
              <DashboardNav isAdmin={isAdmin} />
            </div>
            <div className="mt-3 rounded-md border border-line bg-cream/60 p-4">
              <p className="text-[0.68rem] leading-relaxed text-ink-muted">
                This is a demonstration dashboard. Data is stored locally and is not shared with a real
                sales team.
              </p>
            </div>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
