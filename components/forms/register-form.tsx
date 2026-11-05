"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn, safeNextPath } from "@/lib/utils";

const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
];

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          password: String(data.get("password") ?? ""),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create your account");
      toast("Account created — welcome to Innovations", "success");
      router.push(safeNextPath(next));
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
        <label htmlFor="register-name" className="field-label">Full name</label>
        <input id="register-name" name="name" required autoComplete="name" className="field" placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="register-email" className="field-label">Email address</label>
        <input id="register-email" name="email" type="email" required autoComplete="email" className="field" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="register-phone" className="field-label">Mobile <span className="normal-case tracking-normal">(optional)</span></label>
        <input id="register-phone" name="phone" type="tel" autoComplete="tel" className="field" placeholder="10-digit mobile" />
      </div>
      <div>
        <label htmlFor="register-password" className="field-label">Password</label>
        <div className="relative">
          <input
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            className="field pr-10"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
        <ul className="mt-2 grid gap-1 sm:grid-cols-3">
          {rules.map((rule) => {
            const passed = rule.test(password);
            return (
              <li key={rule.label} className={cn("flex items-center gap-1 text-[0.66rem]", passed ? "text-forest" : "text-ink-muted")}>
                <CheckCircle2 className={cn("size-3", passed ? "text-forest" : "text-line")} /> {rule.label}
              </li>
            );
          })}
        </ul>
      </div>

      {error && <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>}

      <Button type="submit" className="w-full" loading={loading}>
        {loading ? "Creating account" : "Create account"} {!loading && <ArrowRight className="size-4" />}
      </Button>
      <p className="text-center text-[0.7rem] leading-relaxed text-ink-muted">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-forest">terms</Link> and{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-forest">privacy policy</Link>.
      </p>
      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-forest hover:text-brass">
          Sign in
        </Link>
      </p>
    </form>
  );
}
