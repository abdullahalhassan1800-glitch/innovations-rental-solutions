"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarClock,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/saved", label: "Saved projects", icon: Heart },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/dashboard/visits", label: "Site visits", icon: CalendarClock },
  { href: "/dashboard/profile", label: "Profile & security", icon: UserRound },
];

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="space-y-1">
      {links.map((link) => {
        const active = link.href === "/dashboard" ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded border px-3 py-2.5 text-[0.8rem] font-medium transition",
              active
                ? "border-forest/20 bg-forest-soft text-night"
                : "border-transparent text-ink-soft hover:border-line hover:bg-surface",
            )}
            aria-current={active ? "page" : undefined}
          >
            <link.icon className={cn("size-4", active ? "text-forest" : "text-ink-muted")} />
            {link.label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-2.5 rounded border border-brass/30 bg-brass-pale/50 px-3 py-2.5 text-[0.8rem] font-semibold text-brass-soft transition hover:bg-brass-pale"
        >
          <ShieldCheck className="size-4" /> Admin workspace
        </Link>
      )}
    </nav>
  );
}

export function LogoutButton({ className, variant = "ghost" }: { className?: string; variant?: "ghost" | "outline" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast("Signed out", "success");
      router.push("/");
      router.refresh();
    } catch {
      toast("Could not sign out. Please try again.", "error");
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant={variant} size="sm" onClick={logout} loading={loading} className={className}>
      {!loading && <LogOut className="size-3.5" />} Sign out
    </Button>
  );
}
