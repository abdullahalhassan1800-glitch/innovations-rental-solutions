"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ProfileForm({ user }: { user: { name: string; email: string; phone: string | null } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: String(data.get("name") ?? ""), phone: String(data.get("phone") ?? "") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update profile");
      toast("Profile updated", "success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="profile-name" className="field-label">Full name</label>
        <input id="profile-name" name="name" required defaultValue={user.name} className="field" />
      </div>
      <div>
        <label htmlFor="profile-email" className="field-label">Email</label>
        <input id="profile-email" value={user.email} readOnly disabled className="field" />
        <p className="mt-1 text-[0.68rem] text-ink-muted">Email changes are disabled in this sample.</p>
      </div>
      <div>
        <label htmlFor="profile-phone" className="field-label">Mobile</label>
        <input id="profile-phone" name="phone" type="tel" defaultValue={user.phone ?? ""} className="field" />
      </div>
      {error && <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>}
      <Button type="submit" loading={loading}>{loading ? "Saving" : "Save profile"}</Button>
    </form>
  );
}

export function PasswordForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: String(data.get("currentPassword") ?? ""),
          newPassword: String(data.get("newPassword") ?? ""),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update password");
      form.reset();
      setMessage("Password updated successfully.");
      toast("Password updated", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="current-password" className="field-label">Current password</label>
        <input id="current-password" name="currentPassword" type="password" required autoComplete="current-password" className="field" />
      </div>
      <div>
        <label htmlFor="new-password" className="field-label">New password</label>
        <input id="new-password" name="newPassword" type="password" required minLength={8} autoComplete="new-password" className="field" />
      </div>
      {error && <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>}
      {message && <p role="status" className="rounded border border-forest/20 bg-forest-soft px-3 py-2 text-sm text-night">{message}</p>}
      <Button type="submit" variant="outline" loading={loading}>{loading ? "Updating" : "Update password"}</Button>
    </form>
  );
}

