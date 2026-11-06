import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/forms/login-form";
import { safeNextPath } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Innovations account to view saved projects, inquiries and site visits.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  if (user) redirect(safeNextPath(params.next, user.role === "ADMIN" ? "/admin" : "/dashboard"));

  return (
    <section className="shell py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[20px] border border-line bg-surface shadow-card lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[560px] lg:block">
          <Image
            src="/images/lobby-1.jpg"
            alt="Demonstration interior at an Innovations sample address"
            fill
            priority
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/25 to-night/10" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-paper">
            <p className="eyebrow text-brass-soft">Your private shortlist</p>
            <p className="mt-3 max-w-sm font-display text-3xl leading-tight">
              Every saved address, inquiry and visit in one calm place.
            </p>
            <p className="mt-4 max-w-sm text-[0.8rem] leading-relaxed text-paper/55">
              Sample account data only. Sessions are signed, HTTP-only and expire after seven days.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-ink-muted transition hover:text-forest">
            <ArrowLeft className="size-3.5" /> Back to Innovations
          </Link>

          <div className="mt-8">
            <p className="eyebrow">Welcome back</p>
            <h1 className="mt-3 font-display text-3xl">Sign in to continue.</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Use your sample account or create a new one in seconds.
            </p>
          </div>

          {params.error === "session" && (
            <p role="status" className="mt-5 rounded border border-brass/30 bg-brass-pale/60 px-3 py-2 text-sm text-brass-soft">
              Your session expired. Please sign in again.
            </p>
          )}

          <div className="mt-7">
            <LoginForm next={params.next} prefill={{ email: "sample@innovations.sample" }} />
          </div>

          <div className="mt-7 grid gap-2 border-t border-line pt-5">
            <p className="flex items-center gap-2 text-[0.7rem] text-ink-muted">
              <KeyRound className="size-3.5 text-brass" /> Sample buyer: <code className="text-ink">sample@innovations.sample</code> / <code className="text-ink">Sample@12345</code>
            </p>
            <p className="flex items-center gap-2 text-[0.7rem] text-ink-muted">
              <Sparkles className="size-3.5 text-brass" /> Admin: <code className="text-ink">admin@innovations.sample</code> / <code className="text-ink">Admin@12345</code>
            </p>
            <p className="flex items-center gap-2 text-[0.7rem] text-ink-muted">
              <ShieldCheck className="size-3.5 text-forest" /> {SITE.demoDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

