import type { Metadata } from "next";
import { Clock3, LockKeyhole, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Private preview",
  description: "This Innovations Rental Solutions preview is shared through time-limited links.",
  robots: { index: false, follow: false, nocache: true },
};

const PHONE_HREF = `tel:${SITE.phone.replace(/[^\d+]/g, "")}`;
const WHATSAPP_HREF = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
  "Hi, could you send me a fresh Innovations Rental Solutions preview link?",
)}`;

export default async function LockedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; next?: string }>;
}) {
  const { reason } = await searchParams;
  const expired = reason === "expired";

  return (
    <main
      id="main"
      className="relative flex min-h-screen flex-col overflow-hidden bg-cream text-ink"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,rgba(201,162,94,0.16),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/50 to-transparent"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo invert className="[&_img]:h-11" />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/25 bg-brass/10 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-label text-brass-soft">
          <LockKeyhole className="size-3" aria-hidden />
          Private
        </span>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-5 pb-16 pt-6 sm:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">{expired ? "Preview link expired" : "Invitation only"}</p>
            <h1 className="display-xl mt-4 max-w-xl balance">
              {expired ? "This link has expired." : "This address is by invitation."}
            </h1>
            <p className="lede mt-5 max-w-lg pretty">
              {expired
                ? "Preview links stay live for 15 minutes and then close automatically. Ask for a fresh link and the site will open again in one click."
                : "The Innovations Rental Solutions preview is shared through time-limited links. Request one from the desk and it will open instantly."}
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <ButtonLink href={WHATSAPP_HREF} variant="gold" size="md" target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" aria-hidden />
                Request a fresh link
              </ButtonLink>
              <ButtonLink href={PHONE_HREF} variant="outline" size="md">
                <Phone className="size-4" aria-hidden />
                {SITE.phone}
              </ButtonLink>
            </div>

            <p className="mt-6 flex items-center gap-2 text-[0.78rem] text-ink-muted">
              <ShieldCheck className="size-3.5 text-brass" aria-hidden />
              Links are signed and cannot be extended by editing the address.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-panel border border-line bg-surface/90 p-7 shadow-card backdrop-blur">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/60 to-transparent"
            />
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full border border-brass/30 bg-brass/10 text-brass">
                <Clock3 className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-display text-[1.02rem] leading-tight">Time-limited access</p>
                <p className="text-[0.76rem] text-ink-muted">Every share link closes on schedule</p>
              </div>
            </div>

            <dl className="mt-6 space-y-4 border-t border-line pt-5 text-[0.82rem]">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-muted">Link window</dt>
                <dd className="text-right font-medium">15 minutes</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-muted">After expiry</dt>
                <dd className="text-right font-medium">Closes automatically</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-muted">Fresh link</dt>
                <dd className="text-right font-medium">WhatsApp or call</dd>
              </div>
            </dl>

            <a
              href={`mailto:${SITE.email}?subject=${encodeURIComponent("Preview link request")}`}
              className="mt-6 flex items-center gap-2 border-t border-line pt-5 text-[0.82rem] text-ink-soft transition-colors hover:text-brass-soft"
            >
              <Mail className="size-3.5 text-brass" aria-hidden />
              {SITE.email}
            </a>
          </div>
        </div>
      </div>

      <footer className="relative z-10 mx-auto w-full max-w-6xl border-t border-line/70 px-5 py-5 text-[0.72rem] text-ink-muted sm:px-8">
        <p>
          {SITE.name} · {SITE.address}
        </p>
      </footer>
    </main>
  );
}
