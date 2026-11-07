import Link from "next/link";
import { ArrowUpRight, Instagram, Linkedin, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { LeadModal } from "@/components/forms/lead-modal";
import { FOOTER_LINKS, SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t border-paper/10 bg-night text-paper">
      <div className="border-b border-paper/10">
        <div className="shell grid gap-9 py-14 md:grid-cols-[1fr_auto] md:items-end md:py-20">
          <div>
            <p className="eyebrow">Start a conversation</p>
            <h2 className="display-lg mt-5 max-w-2xl balance">
              Your next address deserves a <span className="text-brass-soft">better shortlist.</span>
            </h2>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center md:flex-col md:items-end">
            <LeadModal label="Talk to the team" size="md" source="footer" />
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 text-[0.78rem] font-medium text-paper/55 transition hover:text-paper"
            >
              <Phone className="size-3.5 text-brass-soft" /> {SITE.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="shell">
        <div className="grid gap-12 py-14 lg:grid-cols-[1.2fr_1.6fr] lg:gap-20">
          <div>
            <Logo invert />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/55">
              Own premium property with zero investment — verified residential projects
              across Mangalore, Bangalore, Bengaluru and Greater Noida West.
            </p>
            <div className="mt-7 space-y-3 text-sm text-paper/70">
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 transition hover:text-paper">
                <Phone className="size-4 text-brass-soft" /> {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 transition hover:text-paper">
                <Mail className="size-4 text-brass-soft" /> {SITE.email}
              </a>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brass-soft" /> {SITE.address}
              </p>
            </div>
            <div className="mt-7 flex gap-2">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  title={`${label} — sample link`}
                  className="flex size-9 items-center justify-center rounded-full border border-paper/15 text-paper/60 transition hover:border-brass/40 hover:text-brass-soft"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterColumn title="Explore" links={FOOTER_LINKS.explore} />
            <FooterColumn title="Company" links={FOOTER_LINKS.company} />
            <FooterColumn title="Account" links={FOOTER_LINKS.account} />
          </div>
        </div>

        <div className="rounded-2xl border border-brass/25 bg-brass/[0.06] p-5">
          <p className="flex items-start gap-3 text-xs leading-relaxed text-paper/60">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-brass-soft" />
            <span>
              <strong className="font-semibold text-paper/85">A note on this demonstration.</strong>{" "}
              {SITE.demoDisclaimer} No RERA registration, approval, price, availability or developer
              claim shown here is verified. Nothing on this site is a guarantee of returns.
            </span>
          </p>
        </div>

        <div className="pointer-events-none mt-10 select-none overflow-hidden" aria-hidden>
          <p className="-mb-[0.18em] font-display text-[14vw] font-semibold leading-[0.8] tracking-[-0.05em] text-paper/[0.04]">
            Housirentz
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-paper/10 py-6 text-[0.7rem] text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.legalName}. Demonstration project. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy-policy" className="transition hover:text-paper/80">Privacy</Link>
            <Link href="/terms" className="transition hover:text-paper/80">Terms</Link>
            <Link href="/faq" className="transition hover:text-paper/80">FAQs</Link>
            <Link href="/admin" className="transition hover:text-paper/80">Admin</Link>
            <Link href="/contact" className="inline-flex items-center gap-1 transition hover:text-paper/80">
              Contact <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-brass-soft">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-[0.82rem] text-paper/55 transition hover:text-paper">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

