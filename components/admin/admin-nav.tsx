"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarClock,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  MessageSquareQuote,
  MessagesSquare,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups: { label: string; links: { href: string; label: string; icon: LucideIcon }[] }[] = [
  {
    label: "Workspace",
    links: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/leads", label: "Leads", icon: MessagesSquare },
      { href: "/admin/site-visits", label: "Site visits", icon: CalendarClock },
    ],
  },
  {
    label: "Directory",
    links: [
      { href: "/admin/developers", label: "Developers", icon: Building2 },
      { href: "/admin/locations", label: "Locations", icon: MapPin },
      { href: "/admin/amenities", label: "Amenities", icon: Sparkles },
    ],
  },
  {
    label: "Content & access",
    links: [
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {group.label}
          </p>
          <div className="mt-1.5 space-y-0.5">
            {group.links.map((link) => {
              const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded px-2.5 py-2 text-[0.78rem] font-medium transition",
                    active
                      ? "bg-forest-soft text-night"
                      : "text-ink-soft hover:bg-cream hover:text-ink",
                  )}
                >
                  <link.icon className={cn("size-3.5", active ? "text-forest" : "text-ink-muted")} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
