import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, Heart, MessagesSquare } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/forms/register-form";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a free Innovations sample account to save projects, track inquiries and request site visits.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: false },
};

type PageProps = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  if (user) redirect(safeNextPath(params.next, user.role === "ADMIN" ? "/admin" : "/dashboard"));

  return (
    <section className="shell py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[20px] border border-line bg-surface shadow-card lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-ink-muted transition hover:text-forest">
            <ArrowLeft className="size-3.5" /> Back to Innovations
          </Link>

          <div className="mt-8">
            <p className="eyebrow">Create an account</p>
            <h1 className="mt-3 font-display text-3xl">A private shortlist,<br />kept in one place.</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Free, sample-only and takes under a minute. No real sales team is attached.
            </p>
          </div>

          <div className="mt-7">
            <RegisterForm next={params.next} />
          </div>
        </div>

        <div className="relative hidden min-h-[560px] lg:block">
          <Image
            src="/images/interior-2.jpg"
            alt="Demonstration residential interior"
            fill
            priority
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-night/5" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-paper">
            <p className="eyebrow text-brass-soft">What you get</p>
            <ul className="mt-4 space-y-4">
              {[
                { icon: Heart, label: "Save projects", copy: "Keep a shortlist and return to it from any device." },
                { icon: MessagesSquare, label: "Track conversations", copy: "See your inquiries and site visits with live status." },
                { icon: BadgeCheck, label: "Compare honestly", copy: "Prices, possession and amenities straight from the database." },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <item.icon className="mt-0.5 size-4 shrink-0 text-brass-soft" />
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-0.5 text-[0.76rem] leading-relaxed text-paper/55">{item.copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

