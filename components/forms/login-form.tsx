"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { safeNextPath } from "@/lib/utils";

export function LoginForm({ next, prefill }: { next?: string; prefill?: { email?: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in");
      toast(`Welcome back, ${result.user.name.split(" ")[0]}`, "success");
      const destination = safeNextPath(next, result.user.role === "ADMIN" ? "/admin" : "/dashboard");
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="login-email" className="field-label">Email address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={prefill?.email}
          className="field"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="field-label">Password</label>
          <Link href="/contact" className="mb-1.5 text-[0.68rem] font-medium text-forest hover:text-brass">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="field pr-10"
            placeholder="Your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>
      )}

      <Button type="submit" className="w-full" loading={loading}>
        {loading ? "Signing in" : "Sign in"} {!loading && <ArrowRight className="size-4" />}
      </Button>

      <p className="flex items-center justify-center gap-1.5 pt-1 text-[0.68rem] text-ink-muted">
        <LockKeyhole className="size-3.5" /> Sessions are secured with httpOnly cookies.
      </p>
      <p className="text-center text-sm text-ink-muted">
        New to Innovations?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-semibold text-forest hover:text-brass">
          Create an account
        </Link>
      </p>
    </form>
  );
}
