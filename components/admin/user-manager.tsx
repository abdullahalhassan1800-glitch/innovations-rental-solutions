"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Search, ShieldCheck, UserCheck, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { inquiries: number; savedProjects: number; siteVisits: number };
};

const roleTone: Record<string, "forest" | "brass" | "neutral"> = {
  ADMIN: "forest",
  AGENT: "brass",
  USER: "neutral",
};

export function UserManager({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetFor, setResetFor] = useState<UserRow | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter && user.role !== roleFilter) return false;
      if (!search) return true;
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.phone ?? "").toLowerCase().includes(search)
      );
    });
  }, [users, query, roleFilter]);

  async function patch(user: UserRow, payload: Record<string, unknown>, label: string) {
    setBusyId(user.id);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update this user");
      toast(label, "success");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Something went wrong", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function submitReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resetFor) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    setResetError("");
    if (password !== confirm) {
      setResetError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setResetError("Use at least 8 characters");
      return;
    }
    setResetting(true);
    try {
      const response = await fetch(`/api/admin/users/${resetFor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not reset the password");
      toast(`Password reset for ${resetFor.name}`, "success");
      setResetFor(null);
      router.refresh();
    } catch (error) {
      setResetError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email or phone"
            aria-label="Search users"
            className="field pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          aria-label="Filter by role"
          className="field w-auto"
        >
          <option value="">All roles</option>
          <option value="ADMIN">Admins</option>
          <option value="AGENT">Agents</option>
          <option value="USER">Buyers</option>
        </select>
        <span className="text-[0.7rem] text-ink-muted">{filtered.length} shown</span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
        <table className="table-clean w-full min-w-[820px]">
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Role</th>
              <th scope="col">Activity</th>
              <th scope="col">Joined</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className="transition hover:bg-cream/40">
                  <td>
                    <p className="font-semibold text-ink">
                      {user.name}
                      {isSelf && <span className="ml-2 text-[0.6rem] font-medium uppercase tracking-wide text-brass">You</span>}
                    </p>
                    <p className="text-[0.68rem] text-ink-muted">{user.email}</p>
                    <p className="text-[0.66rem] text-ink-muted">{user.phone || "No phone"}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Badge tone={roleTone[user.role] ?? "neutral"}>{user.role}</Badge>
                      <select
                        value={user.role}
                        disabled={isSelf || busyId === user.id}
                        onChange={(event) =>
                          patch(user, { role: event.target.value }, `${user.name} is now ${event.target.value}`)
                        }
                        aria-label={`Change role for ${user.name}`}
                        className="field h-8 w-auto py-1 text-[0.7rem]"
                      >
                        <option value="USER">Buyer</option>
                        <option value="AGENT">Agent</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-[0.7rem]">
                    <p>{user._count.inquiries} leads assigned</p>
                    <p className="text-ink-muted">{user._count.savedProjects} saved · {user._count.siteVisits} visits</p>
                  </td>
                  <td className="whitespace-nowrap text-[0.72rem]">
                    {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(user.createdAt))}
                  </td>
                  <td>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide",
                        user.isActive
                          ? "border-forest/20 bg-forest-soft text-night"
                          : "border-line bg-cream text-ink-muted",
                      )}
                    >
                      {user.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setResetFor(user);
                          setResetError("");
                        }}
                        className="inline-flex h-8 items-center gap-1 rounded border border-line bg-surface px-2 text-[0.68rem] font-semibold text-ink-muted transition hover:border-forest/40 hover:text-forest"
                        title="Reset password"
                      >
                        <KeyRound className="size-3" /> Reset
                      </button>
                      <button
                        type="button"
                        disabled={isSelf || busyId === user.id}
                        onClick={() =>
                          patch(
                            user,
                            { isActive: !user.isActive },
                            user.isActive ? `${user.name} disabled` : `${user.name} re-activated`,
                          )
                        }
                        className={cn(
                          "inline-flex h-8 items-center gap-1 rounded border border-line bg-surface px-2 text-[0.68rem] font-semibold transition disabled:opacity-40",
                          user.isActive ? "text-ink-muted hover:border-rust/40 hover:text-rust" : "text-forest hover:border-forest/40",
                        )}
                        title={user.isActive ? "Deactivate user" : "Activate user"}
                      >
                        {user.isActive ? <UserX className="size-3" /> : <UserCheck className="size-3" />}
                        {user.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-ink-muted">
                  No users match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[0.68rem] leading-relaxed text-ink-muted">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-forest" />
        You cannot change your own role or deactivate your own account. The system always keeps at least one
        active administrator.
      </p>

      {resetFor && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-night/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reset-password-title">
          <div className="w-full max-w-sm rounded-md border border-line bg-surface p-5 shadow-float">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow-plain">Administrative action</p>
                <h2 id="reset-password-title" className="mt-1 font-display text-xl">Reset password</h2>
                <p className="mt-1 text-[0.72rem] text-ink-muted">
                  Set a new password for {resetFor.name}. Share it through a secure channel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetFor(null)}
                className="inline-flex size-8 items-center justify-center rounded border border-line text-ink-muted hover:text-ink"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={submitReset} className="mt-4 space-y-3">
              <div>
                <label htmlFor="admin-new-password" className="field-label">New password</label>
                <input id="admin-new-password" name="password" type="password" required minLength={8} autoComplete="new-password" className="field" />
              </div>
              <div>
                <label htmlFor="admin-confirm-password" className="field-label">Confirm password</label>
                <input id="admin-confirm-password" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="field" />
              </div>
              {resetError && <p role="alert" className="rounded border border-rust/25 bg-rust/10 px-3 py-2 text-[0.78rem] text-rust">{resetError}</p>}
              <Button type="submit" loading={resetting} className="w-full">
                <KeyRound className="size-4" /> Set new password
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
