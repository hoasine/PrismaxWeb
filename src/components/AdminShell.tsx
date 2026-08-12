"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { HonorTrackKey, ManagedCycleRow } from "@/lib/honorMerge";

const SECRET_KEY = "prismax-admin-secret";

const TRACK_FILTERS: { id: "all" | HonorTrackKey; label: string }[] = [
  { id: "all", label: "All tracks" },
  { id: "validation", label: "Validation" },
  { id: "teleop", label: "Teleoperation" },
  { id: "outstanding", label: "Outstanding" },
  { id: "progression", label: "Progression" },
];

export function readStoredSecret() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(SECRET_KEY) ?? "";
}

export function storeSecret(secret: string) {
  sessionStorage.setItem(SECRET_KEY, secret);
}

export function clearStoredSecret() {
  sessionStorage.removeItem(SECRET_KEY);
}

export function AdminGate({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: (secret: string) => ReactNode;
}) {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = readStoredSecret();
    if (!stored) {
      setChecking(false);
      return;
    }
    void (async () => {
      try {
        const res = await fetch(`/api/admin/spotlights?secret=${encodeURIComponent(stored)}`);
        if (res.ok) {
          setSecret(stored);
          setUnlocked(true);
        } else {
          clearStoredSecret();
        }
      } catch {
        clearStoredSecret();
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const unlock = async () => {
    setError(null);
    if (!secret.trim()) {
      setError("Enter admin secret.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/spotlights?secret=${encodeURIComponent(secret)}`);
      if (!res.ok) {
        setError("Wrong admin secret.");
        return;
      }
      storeSecret(secret);
      setUnlocked(true);
    } catch {
      setError("Could not verify secret.");
    }
  };

  if (checking) {
    return (
      <section className="px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.75rem,6vw,4.5rem)]">
        <p className="text-sm text-muted">Checking admin session…</p>
      </section>
    );
  }

  if (!unlocked) {
    return (
      <section className="px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.75rem,6vw,4.5rem)]">
        <div className="mx-auto max-w-lg">
          <p className="m-0 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-purple">
            Admin
          </p>
          <h1
            className="mt-2.5 text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {title}
          </h1>
          <p className="mt-3 text-muted">{description}</p>
          <label className="mt-6 block text-sm text-muted">
            Admin secret
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void unlock();
              }}
              className="mt-2 w-full rounded-[var(--radius-pill)] border border-[rgba(180,140,255,0.18)] bg-[rgba(0,0,0,0.35)] px-4 py-2.5 text-sm text-fg outline-none focus:border-[rgba(180,140,255,0.45)]"
              placeholder="ADMIN_SECRET"
            />
          </label>
          {error && <p className="mt-3 text-sm text-[#ffb4b4]">{error}</p>}
          <button type="button" className="btn btn-brand mt-5" onClick={() => void unlock()}>
            Unlock
          </button>
        </div>
      </section>
    );
  }

  return <>{children(secret)}</>;
}

export function AdminLayout({
  active,
  children,
}: {
  active: "intake" | "manage";
  children: ReactNode;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="admin-sidebar-brand">
          <span className="admin-sidebar-mark" aria-hidden>
            PX
          </span>
          <span>
            <strong>Admin</strong>
            <small>Hall of Honor</small>
          </span>
        </a>

        <p className="admin-sidebar-label">Workspace</p>
        <nav className="admin-sidebar-nav" aria-label="Admin">
          <a
            href="/admin"
            className={`admin-sidebar-link ${active === "intake" ? "is-active" : ""}`}
          >
            <span className="admin-sidebar-ico" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </span>
            Spotlight intake
          </a>
          <a
            href="/admin/manage"
            className={`admin-sidebar-link ${active === "manage" ? "is-active" : ""}`}
          >
            <span className="admin-sidebar-ico" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h10" />
              </svg>
            </span>
            Manage dates
          </a>
        </nav>

        <div className="admin-sidebar-foot">
          <a href="/" className="admin-sidebar-back">
            ← Back to site
          </a>
        </div>
      </aside>

      <div className="admin-main">{children}</div>
    </div>
  );
}

export function SpotlightManage({ secret }: { secret: string }) {
  const [rows, setRows] = useState<ManagedCycleRow[]>([]);
  const [trackFilter, setTrackFilter] = useState<"all" | HonorTrackKey>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const filteredRows = useMemo(() => {
    if (trackFilter === "all") return rows;
    return rows.filter((r) => r.track === trackFilter);
  }, [rows, trackFilter]);

  const trackCounts = useMemo(() => {
    const counts: Record<string, number> = { all: rows.length };
    for (const row of rows) {
      counts[row.track] = (counts[row.track] ?? 0) + 1;
    }
    return counts;
  }, [rows]);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/admin/cycles?secret=${encodeURIComponent(secret)}`);
    const data = (await res.json()) as { cycles?: ManagedCycleRow[]; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Failed to load cycles");
    setRows(data.cycles ?? []);
  }, [secret]);

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const runAction = async (
    row: ManagedCycleRow,
    action: "hide" | "restore" | "delete",
  ) => {
    const confirmMsg =
      action === "delete"
        ? `Delete ${row.dateLabel} (${row.trackLabel})? Intake-added dates are removed; built-in dates are hidden from the site.`
        : action === "hide"
          ? `Hide ${row.dateLabel} from Hall of Honor?`
          : `Restore ${row.dateLabel} to Hall of Honor?`;
    if (!window.confirm(confirmMsg)) return;

    setBusyId(row.id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          action,
          id: row.id,
          track: row.track,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        note?: string;
        commitUrl?: string;
        cycles?: ManagedCycleRow[];
      };
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      if (data.cycles) setRows(data.cycles);
      setMessage(
        [data.note, data.commitUrl ? `Commit: ${data.commitUrl}` : null].filter(Boolean).join(" "),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.75rem,6vw,4.5rem)]">
      <div className="mx-auto max-w-[78rem]">
        <div className="max-w-3xl">
          <p className="m-0 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-purple">
            Admin · Hall of Honor
          </p>
          <h1
            className="mt-2.5 text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Manage dates
          </h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
            Remove a recognition date you published by mistake. Intake dates can be deleted;
            original site dates can be hidden or restored.
          </p>
        </div>

        {loading && <p className="mt-8 text-sm text-muted">Loading dates…</p>}
        {message && <p className="mt-6 text-sm text-[#b8f0c8]">{message}</p>}
        {error && <p className="mt-6 text-sm text-[#ffb4b4]">{error}</p>}

        {!loading && (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <p className="mr-1 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-muted">
                Filter
              </p>
              {TRACK_FILTERS.map((f) => {
                const count = trackCounts[f.id] ?? 0;
                const selected = trackFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTrackFilter(f.id)}
                    className={`cycle-pill ${selected ? "is-active" : ""}`}
                  >
                    {f.label}
                    <span className="ml-1.5 opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 overflow-x-auto rounded-[var(--radius)] border border-[rgba(180,140,255,0.14)]">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="bg-[rgba(0,0,0,0.35)] text-[0.72rem] uppercase tracking-[0.08em] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Track</th>
                    <th className="px-4 py-3 font-medium">Posts</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const busy = busyId === row.id;
                    return (
                      <tr
                        key={`${row.track}-${row.id}`}
                        className="border-t border-[rgba(180,140,255,0.1)]"
                      >
                        <td className="px-4 py-3 text-fg">
                          <div className="font-medium">{row.dateLabel}</div>
                          <div className="font-mono text-[0.68rem] text-muted">{row.id}</div>
                        </td>
                        <td className="px-4 py-3 text-muted">{row.trackLabel}</td>
                        <td className="px-4 py-3 tabular-nums text-muted">{row.entryCount}</td>
                        <td className="px-4 py-3 text-muted">
                          {row.source === "extra" ? "Intake" : "Built-in"}
                        </td>
                        <td className="px-4 py-3">
                          {row.hidden ? (
                            <span className="text-[#ffb4b4]">Hidden</span>
                          ) : (
                            <span className="text-[#b8f0c8]">Visible</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {row.hidden ? (
                              <button
                                type="button"
                                className="btn btn-secondary !py-1.5 !text-xs"
                                disabled={busy}
                                onClick={() => void runAction(row, "restore")}
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-secondary !py-1.5 !text-xs"
                                disabled={busy}
                                onClick={() => void runAction(row, "hide")}
                              >
                                Hide
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-secondary !border-[rgba(255,120,120,0.35)] !py-1.5 !text-xs !text-[#ffb4b4]"
                              disabled={busy}
                              onClick={() => void runAction(row, "delete")}
                            >
                              {busy ? "…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredRows.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted">
                        No recognition dates for this track.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
