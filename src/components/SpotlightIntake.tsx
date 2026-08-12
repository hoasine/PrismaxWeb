"use client";

import { useMemo, useState } from "react";
import type { HonorCycle, SpotlightEntry } from "@/data/spotlights";
import {
  dateKeyToLabel,
  parseHighlightPaste,
  toHonorCycles,
  type ParsedHighlightBatch,
} from "@/lib/parseHighlights";

const SAMPLE = `🤖 Data Validation Day Highlights
By @kabuda 
https://x.com/kabuda112821/status/2085207283689308367
By @Zephy 
https://x.com/__Zephhy/status/2085638287138685097

🦾 Teleoperation Day Highlights
By @Cao Thần Quang 
https://x.com/caothanquang369/status/2085738336870887921
By @GTA 
https://x.com/PawanKumar67103/status/2084507459688047038`;

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function EntryEditor({
  entry,
  onChange,
  onRemove,
}: {
  entry: SpotlightEntry;
  onChange: (e: SpotlightEntry) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-[var(--radius-sm)] border border-[rgba(180,140,255,0.14)] bg-[rgba(0,0,0,0.25)] p-3 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
      <label className="block text-[0.7rem] text-muted">
        Author
        <input
          className="mt-1 w-full rounded-lg border border-[rgba(180,140,255,0.18)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-sm text-fg outline-none focus:border-[rgba(180,140,255,0.45)]"
          value={entry.author}
          onChange={(e) => onChange({ ...entry, author: e.target.value })}
        />
      </label>
      <label className="block text-[0.7rem] text-muted">
        Handle
        <input
          className="mt-1 w-full rounded-lg border border-[rgba(180,140,255,0.18)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-sm text-fg outline-none focus:border-[rgba(180,140,255,0.45)]"
          value={entry.handle}
          onChange={(e) => onChange({ ...entry, handle: e.target.value })}
        />
      </label>
      <label className="block text-[0.7rem] text-muted">
        Post URL
        <input
          className="mt-1 w-full rounded-lg border border-[rgba(180,140,255,0.18)] bg-[rgba(0,0,0,0.35)] px-3 py-2 text-sm text-fg outline-none focus:border-[rgba(180,140,255,0.45)]"
          value={entry.url}
          onChange={(e) => onChange({ ...entry, url: e.target.value })}
        />
      </label>
      <button type="button" className="btn btn-secondary !self-end !py-2" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

export function SpotlightIntake() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [dateKey, setDateKey] = useState(todayKey);
  const [paste, setPaste] = useState("");
  const [batches, setBatches] = useState<ParsedHighlightBatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cycles = useMemo(() => {
    if (!batches.length) return null;
    return toHonorCycles(batches, dateKeyToLabel(dateKey), dateKey);
  }, [batches, dateKey]);

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
      setUnlocked(true);
    } catch {
      setError("Could not verify secret.");
    }
  };

  const runParse = () => {
    setError(null);
    setMessage(null);
    const parsed = parseHighlightPaste(paste);
    if (!parsed.length) {
      setBatches([]);
      setError("No highlights found. Paste blocks with “By …” + X post URL.");
      return;
    }
    setBatches(parsed);
    setMessage(
      `Parsed ${parsed.reduce((n, b) => n + b.entries.length, 0)} posts across ${parsed.length} track(s). Review, then publish.`,
    );
  };

  const updateEntry = (
    kind: ParsedHighlightBatch["kind"],
    index: number,
    entry: SpotlightEntry,
  ) => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.kind !== kind) return b;
        const entries = [...b.entries];
        entries[index] = entry;
        return { ...b, entries };
      }),
    );
  };

  const removeEntry = (kind: ParsedHighlightBatch["kind"], index: number) => {
    setBatches((prev) =>
      prev
        .map((b) => {
          if (b.kind !== kind) return b;
          return { ...b, entries: b.entries.filter((_, i) => i !== index) };
        })
        .filter((b) => b.entries.length > 0),
    );
  };

  const publish = async () => {
    if (!cycles) {
      setError("Parse paste first.");
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/spotlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, dateKey, cycles }),
      });
      const data = (await res.json()) as {
        error?: string;
        note?: string;
        commitUrl?: string;
        mode?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Publish failed");
      setMessage(
        [
          data.note ?? "Saved.",
          data.commitUrl ? `Commit: ${data.commitUrl}` : null,
          data.mode === "github" ? "Live site updates after Vercel redeploy (~1 min)." : null,
        ]
          .filter(Boolean)
          .join(" "),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setBusy(false);
    }
  };

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
            Spotlight intake
          </h1>
          <p className="mt-3 text-muted">
            Paste Discord / X highlight lists here instead of sending them to Cursor. Protected by
            admin secret.
          </p>
          <label className="mt-6 block text-sm text-muted">
            Admin secret
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") unlock();
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
            Spotlight intake
          </h1>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
            Paste the full Validation / Teleop highlight list. The form auto-detects tracks, names,
            handles, and post links — edit anything, then publish to update the live site.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="brand-card !p-5 md:!p-6">
            <label className="block text-sm text-muted">
              Recognition date
              <input
                type="date"
                value={dateKey}
                onChange={(e) => setDateKey(e.target.value)}
                className="mt-2 w-full max-w-xs rounded-[var(--radius-pill)] border border-[rgba(180,140,255,0.18)] bg-[rgba(0,0,0,0.35)] px-4 py-2 text-sm text-fg outline-none focus:border-[rgba(180,140,255,0.45)]"
              />
            </label>
            <p className="mt-2 font-mono text-[0.72rem] text-muted">
              Shown as {dateKeyToLabel(dateKey)}
            </p>

            <label className="mt-5 block text-sm text-muted">
              Paste highlights
              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                rows={16}
                placeholder={SAMPLE}
                className="mt-2 w-full rounded-[var(--radius)] border border-[rgba(180,140,255,0.18)] bg-[rgba(0,0,0,0.35)] px-4 py-3 font-mono text-[0.82rem] leading-relaxed text-fg outline-none focus:border-[rgba(180,140,255,0.45)]"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-brand" onClick={runParse}>
                Parse with AI form
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPaste(SAMPLE);
                  setBatches([]);
                  setMessage(null);
                  setError(null);
                }}
              >
                Load sample
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy || !cycles}
                onClick={publish}
              >
                {busy ? "Publishing…" : "Publish to site"}
              </button>
            </div>

            {message && <p className="mt-4 text-sm text-[#b8f0c8]">{message}</p>}
            {error && <p className="mt-4 text-sm text-[#ffb4b4]">{error}</p>}
          </div>

          <div className="space-y-4">
            {!batches.length && (
              <div className="brand-card !p-5 text-sm text-muted">
                Preview appears here after parse. Expected format: section header, then{" "}
                <code className="text-[#d2c0ff]">By @name</code> + X status URL pairs.
              </div>
            )}

            {batches.map((batch) => (
              <div key={batch.kind} className="brand-card !p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2
                    className="text-[1.1rem] font-semibold text-fg"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {batch.title}
                  </h2>
                  <span className="font-mono text-[0.72rem] text-muted">
                    {batch.entries.length} posts
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {batch.entries.map((entry, i) => (
                    <EntryEditor
                      key={`${batch.kind}-${i}-${entry.url}`}
                      entry={entry}
                      onChange={(e) => updateEntry(batch.kind, i, e)}
                      onRemove={() => removeEntry(batch.kind, i)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {cycles && (
              <details className="brand-card !p-4 text-xs text-muted">
                <summary className="cursor-pointer text-fg">JSON preview</summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-[0.72rem]">
                  {JSON.stringify(cycles as Record<string, HonorCycle>, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
