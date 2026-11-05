"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-16 text-ink">
      <div className="w-full max-w-lg rounded-lg border border-line bg-surface p-8 text-center shadow-[0_30px_80px_-60px_rgba(18,33,27,0.55)]">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-rust/10 text-rust">
          <AlertTriangle className="size-5" />
        </span>
        <p className="eyebrow mt-5">Something went wrong</p>
        <h1 className="mt-3 font-display text-3xl">We couldn&apos;t load this page.</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          An unexpected error interrupted the request. Try again, or return to the homepage.
          If the problem continues, contact the Innovations team.
        </p>
        {error.digest && (
          <p className="mt-4 font-mono text-[0.68rem] text-ink-muted">Reference: {error.digest}</p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-forest bg-forest px-5 text-[0.82rem] font-semibold text-night transition hover:bg-forest-deep"
          >
            <RotateCcw className="size-4" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-ink/20 px-5 text-[0.82rem] font-semibold transition hover:border-brass/60 hover:bg-brass-pale/40"
          >
            <Home className="size-4" /> Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
