"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { XPostCard } from "@/components/XPostCard";
import {
  honorSections,
  type HonorCycle,
  type HonorSection,
} from "@/data/spotlights";
import {
  ROLE_LEVEL_ORDER,
  roleLevelNumber,
  type RoleLevel,
} from "@/lib/progression";

const programMeta: Record<HonorSection["kind"], { className: string; icon: ReactNode }> = {
  progression: {
    className: "program-progression",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 17V11" />
        <path d="M12 17V8" />
        <path d="M16 17V5" />
      </svg>
    ),
  },
  validation: {
    className: "program-validation",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  outstanding: {
    className: "program-outstanding",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l2.2 6.6H21l-5.4 3.9 2.1 6.5L12 16.8 6.3 20l2.1-6.5L3 9.6h6.8L12 3z" />
      </svg>
    ),
  },
  teleop: {
    className: "program-teleop",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <circle cx="12" cy="12" r="3" />
        <path d="M4.9 4.9l2.8 2.8" />
        <path d="M16.3 16.3l2.8 2.8" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="M4.9 19.1l2.8-2.8" />
        <path d="M16.3 7.7l2.8-2.8" />
      </svg>
    ),
  },
};

function matchesQuery(text: string, q: string) {
  return text.toLowerCase().includes(q.toLowerCase());
}

function filterCycle(cycle: HonorCycle, query: string): HonorCycle | null {
  const q = query.trim();
  if (!q) return cycle;

  if (cycle.entries?.length) {
    const entries = cycle.entries.filter(
      (e) =>
        matchesQuery(e.author, q) ||
        matchesQuery(e.handle, q) ||
        matchesQuery(e.url, q),
    );
    if (!entries.length) return null;
    return { ...cycle, entries };
  }

  const filterNames = (names?: string[]) => names?.filter((n) => matchesQuery(n, q));
  const groundbreakers = filterNames(cycle.groundbreakers);
  const vanguards = filterNames(cycle.vanguards);
  const navigational = filterNames(cycle.navigational);
  const blurbHit = cycle.blurb ? matchesQuery(cycle.blurb, q) : false;
  const dateHit = matchesQuery(cycle.dateLabel, q);
  const hasPeople =
    (groundbreakers && groundbreakers.length > 0) ||
    (vanguards && vanguards.length > 0) ||
    (navigational && navigational.length > 0);

  if (!hasPeople && !blurbHit && !dateHit) return null;

  return {
    ...cycle,
    groundbreakers: groundbreakers?.length ? groundbreakers : undefined,
    vanguards: vanguards?.length ? vanguards : undefined,
    navigational: navigational?.length ? navigational : undefined,
    // Hide census-only tiers while searching named members
    roleCounts: undefined,
  };
}

function latestCycleId(section: HonorSection): string {
  const sorted = [...section.cycles].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  return sorted[0]?.id ?? "all";
}

function EntryGrid({ entries }: { entries: NonNullable<HonorCycle["entries"]> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry, i) => (
        <li key={`${entry.url}-${i}`}>
          <XPostCard entry={entry} />
        </li>
      ))}
    </ul>
  );
}

type RoleBucket = {
  role: RoleLevel;
  names?: string[];
  count?: number;
};

function buildRoleBuckets(cycle: HonorCycle): RoleBucket[] {
  const countMap = new Map((cycle.roleCounts ?? []).map((r) => [r.role, r.count]));

  // Build ascending by level, then reverse so highest roles appear first
  return [...ROLE_LEVEL_ORDER]
    .reverse()
    .map((role) => {
      if (role === "Groundbreaker") {
        return { role, names: cycle.groundbreakers, count: cycle.groundbreakers?.length };
      }
      if (role === "PrismaX Vanguard") {
        return { role, names: cycle.vanguards, count: cycle.vanguards?.length };
      }
      if (role === "Navigational") {
        return {
          role,
          names: cycle.navigational,
          count: cycle.navigational?.length ?? countMap.get("Navigational"),
        };
      }
      return { role, count: countMap.get(role) };
    })
    .filter((bucket) => {
      if (bucket.names && bucket.names.length > 0) return true;
      if (typeof bucket.count === "number" && bucket.count > 0) return true;
      return false;
    });
}

function sortNames(names: string[]): string[] {
  return [...names].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }),
  );
}

function ProgressionCycle({ cycle }: { cycle: HonorCycle }) {
  const buckets = buildRoleBuckets(cycle);

  return (
    <article className="space-y-5">
      {buckets.map((bucket) => {
        const names = bucket.names?.length ? sortNames(bucket.names) : null;
        const level = roleLevelNumber(bucket.role);

        return (
          <div key={bucket.role} className="brand-card !px-5 !py-5 md:!px-6">
            <div className="flex items-baseline justify-between gap-3">
              <p
                className="text-[1.05rem] font-semibold text-fg"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                <span className="text-gradient tabular-nums">Lv.{level}</span>
                <span className="mx-2 text-muted">·</span>
                {bucket.role}
              </p>
              <span className="shrink-0 font-mono text-[0.72rem] text-muted">
                {names ? names.length : (bucket.count ?? 0)}
              </span>
            </div>

            {names ? (
              <ul className="mt-4 columns-1 gap-x-8 text-[0.92rem] leading-[1.7] text-fg/90 sm:columns-2 lg:columns-3">
                {names.map((name) => (
                  <li
                    key={`${bucket.role}-${name}`}
                    className="mb-1.5 break-inside-avoid truncate py-0.5"
                    title={name}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">{bucket.count ?? 0} members</p>
            )}
          </div>
        );
      })}
    </article>
  );
}

const DEFAULT_TRACK_ID = honorSections[0]?.id ?? "validation";

export function HonorExplorer() {
  const [activeId, setActiveId] = useState<string>(DEFAULT_TRACK_ID);
  const [cycleId, setCycleId] = useState<string>("all");
  const [query, setQuery] = useState("");

  const activeSection =
    honorSections.find((s) => s.id === activeId) ?? honorSections[0] ?? null;
  const isProgression = activeSection?.kind === "progression";
  const activeMeta = activeSection ? programMeta[activeSection.kind] : null;

  const sortedCycles = useMemo(() => {
    if (!activeSection) return [];
    return [...activeSection.cycles].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [activeSection]);

  const selectSection = (id: string, opts?: { scroll?: boolean }) => {
    const section = honorSections.find((s) => s.id === id);
    if (!section) return;
    setActiveId(id);
    setQuery("");
    // Progression: always open latest month only
    setCycleId(section.kind === "progression" ? latestCycleId(section) : "all");
    window.history.replaceState(null, "", `#${id}`);
    if (opts?.scroll) {
      requestAnimationFrame(() => {
        const el = document.getElementById("workspace");
        if (!el) return;
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo(0, Math.max(0, top));
        root.style.scrollBehavior = prev;
      });
    }
  };

  useEffect(() => {
    // Only react to honor-track hashes — top nav hashes are owned by AppShell
    const applyHash = (scroll: boolean) => {
      const hash = window.location.hash.replace("#", "");
      if (honorSections.some((s) => s.id === hash)) {
        selectSection(hash, { scroll });
      }
    };
    applyHash(false);
    const onHash = () => applyHash(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure progression never stays on "all"
  useEffect(() => {
    if (!activeSection || activeSection.kind !== "progression") return;
    if (cycleId === "all" || !sortedCycles.some((c) => c.id === cycleId)) {
      setCycleId(sortedCycles[0]?.id ?? "all");
    }
  }, [activeSection, cycleId, sortedCycles]);

  const filteredCycles = useMemo(() => {
    let cycles = sortedCycles;
    if (isProgression || cycleId !== "all") {
      cycles = cycles.filter((c) => c.id === cycleId);
    }
    return cycles
      .map((c) => filterCycle(c, query))
      .filter((c): c is HonorCycle => c != null);
  }, [sortedCycles, cycleId, query, isProgression]);

  const resultCount = filteredCycles.reduce((n, c) => {
    if (c.entries) return n + c.entries.length;
    return (
      n +
      (c.groundbreakers?.length ?? 0) +
      (c.vanguards?.length ?? 0) +
      (c.navigational?.length ?? 0)
    );
  }, 0);

  const filtersActive = Boolean(query.trim()) || (!isProgression && cycleId !== "all");

  if (!activeSection || !activeMeta) return null;

  return (
    <section className="px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.5rem,6vw,4.5rem)]">
      <div className="mx-auto max-w-[78rem]">
        <div className="mb-8">
          <p className="m-0 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-purple">
            Hall of Honor
          </p>
          <h2
            className="mt-2.5 text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Hall of Honor
          </h2>
        </div>

        <div
          className="track-tab-strip"
          role="tablist"
          aria-label="Recognition tracks"
        >
          {honorSections.map((section) => {
            const selected = activeId === section.id;
            const meta = programMeta[section.kind];
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                id={`track-tab-${section.id}`}
                aria-selected={selected}
                aria-controls="track-stage"
                onClick={() => selectSection(section.id, { scroll: false })}
                className={`track-tab ${meta.className} ${selected ? "is-active" : ""}`}
              >
                <span className="track-tab-icon" aria-hidden>
                  {meta.icon}
                </span>
                <span className="track-tab-name">{section.navLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="track-intro" aria-live="polite">
          <h3
            className="text-[clamp(1.35rem,2.6vw,1.85rem)] font-semibold tracking-[-0.02em] text-fg"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {activeSection.title}
          </h3>
          <p className="mt-2 max-w-2xl text-[1rem] leading-relaxed text-muted">
            {activeSection.description}
          </p>
        </div>

        <div
          id="track-stage"
          role="tabpanel"
          aria-labelledby={`track-tab-${activeSection.id}`}
          className={`track-stage rise ${activeMeta.className}`}
        >
          <div className="track-stage-toolbar">
            <p className="mb-2.5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-muted">
              {isProgression ? "Select month" : "Select date"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {!isProgression && (
                <button
                  type="button"
                  onClick={() => setCycleId("all")}
                  className={`cycle-pill ${cycleId === "all" ? "is-active" : ""}`}
                >
                  All
                </button>
              )}
              {sortedCycles.map((c, i) => {
                const selected = c.id === cycleId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCycleId(c.id)}
                    className={`cycle-pill ${selected ? "is-active" : ""}`}
                  >
                    {c.dateLabel}
                    {i === 0 ? " · latest" : ""}
                    {isProgression && c.monthsSinceLaunch != null
                      ? ` · ${c.monthsSinceLaunch}mo`
                      : ""}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isProgression ? "Search name…" : "Search name or @handle…"
                }
                aria-label="Search"
                className="min-w-[12rem] flex-1 rounded-[var(--radius-pill)] border border-[rgba(180,140,255,0.18)] bg-[rgba(0,0,0,0.35)] px-4 py-2 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-[rgba(180,140,255,0.45)] sm:max-w-sm"
              />
              {filtersActive && (
                <button
                  type="button"
                  className="btn btn-secondary !py-2"
                  onClick={() => {
                    setCycleId(isProgression ? (sortedCycles[0]?.id ?? "all") : "all");
                    setQuery("");
                  }}
                >
                  Clear
                </button>
              )}
              {query.trim() && (
                <span className="font-mono text-[0.72rem] text-muted">
                  {resultCount} result{resultCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>

          <div className="track-stage-body">
            {filteredCycles.length === 0 && (
              <div className="py-10 text-center text-muted">
                No results. Try another filter.
              </div>
            )}

            {filteredCycles.map((cycle) => (
              <div key={cycle.id} className="track-cycle">
                {isProgression ? (
                  <ProgressionCycle cycle={cycle} />
                ) : (
                  <article>
                    {cycleId === "all" && (
                      <p
                        className="mb-4 text-[1.05rem] font-semibold text-fg"
                        style={{ fontFamily: "var(--font-display), sans-serif" }}
                      >
                        {cycle.dateLabel}
                      </p>
                    )}
                    {cycle.entries && <EntryGrid entries={cycle.entries} />}
                  </article>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
