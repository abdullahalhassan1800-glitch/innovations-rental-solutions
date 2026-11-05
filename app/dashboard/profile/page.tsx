import type { Metadata } from "next";
import { CalendarDays, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { ProfileForm, PasswordForm } from "@/components/forms/account-forms";
import { LogoutButton } from "@/components/dashboard/dashboard-nav";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile & security" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 font-display text-3xl">Profile &amp; security.</h1>
          <p className="mt-2 text-sm text-ink-muted">Keep your contact details current and your account secure.</p>
        </div>
        <LogoutButton variant="outline" />
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-md border border-line bg-surface p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-forest-soft text-night">
              <UserRound className="size-5" />
            </span>
            <div>
              <p className="font-display text-xl">{user.name}</p>
              <p className="text-[0.72rem] text-ink-muted">Member since {formatDate(user.createdAt)}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 border-t border-line pt-4 text-[0.8rem]">
            <p className="flex items-center gap-2.5 text-ink-soft"><Mail className="size-4 text-brass" /> {user.email}</p>
            <p className="flex items-center gap-2.5 text-ink-soft"><Phone className="size-4 text-brass" /> {user.phone || "No mobile added"}</p>
            <p className="flex items-center gap-2.5 text-ink-soft"><CalendarDays className="size-4 text-brass" /> Role: {user.role}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            <Badge tone="forest"><ShieldCheck className="mr-1 size-3" /> HTTP-only session</Badge>
            <Badge>Demo account</Badge>
          </div>
          <p className="mt-4 text-[0.7rem] leading-relaxed text-ink-muted">
            Email changes are disabled in this demonstration. Contact the maintainers if you need your
            demo account removed.
          </p>
        </section>

        <div className="space-y-5">
          <section className="rounded-md border border-line bg-surface p-5 sm:p-6">
            <p className="eyebrow-plain">Profile</p>
            <h2 className="mt-1 font-display text-xl">Your details</h2>
            <div className="mt-5">
              <ProfileForm user={{ name: user.name, email: user.email, phone: user.phone }} />
            </div>
          </section>

          <section className="rounded-md border border-line bg-surface p-5 sm:p-6">
            <p className="eyebrow-plain">Security</p>
            <h2 className="mt-1 font-display text-xl">Change password</h2>
            <p className="mt-1 text-[0.78rem] text-ink-muted">
              Use at least eight characters, including a letter and a number.
            </p>
            <div className="mt-5">
              <PasswordForm />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
