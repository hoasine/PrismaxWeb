import type { HonorCycle, HonorSection } from "@/data/spotlights";
import honorExtra from "@/data/honor-cycles.json";

export type HonorTrackKey = "validation" | "teleop" | "outstanding" | "progression";

export type HonorExtraFile = {
  validation: HonorCycle[];
  teleop: HonorCycle[];
  outstanding: HonorCycle[];
  progression: HonorCycle[];
  /** Cycle ids hidden from the public Hall of Honor (base or extra). */
  hiddenIds: string[];
};

export function normalizeHonorExtra(raw: Partial<HonorExtraFile> | null | undefined): HonorExtraFile {
  return {
    validation: raw?.validation ?? [],
    teleop: raw?.teleop ?? [],
    outstanding: raw?.outstanding ?? [],
    progression: raw?.progression ?? [],
    hiddenIds: raw?.hiddenIds ?? [],
  };
}

export function getHonorExtra(): HonorExtraFile {
  return normalizeHonorExtra(honorExtra as Partial<HonorExtraFile>);
}

export function mergeCycles(
  base: HonorCycle[],
  extra: HonorCycle[],
  hiddenIds: string[] = [],
): HonorCycle[] {
  const hidden = new Set(hiddenIds);
  const map = new Map<string, HonorCycle>();
  for (const cycle of base) map.set(cycle.id, cycle);
  for (const cycle of extra) map.set(cycle.id, cycle);
  return [...map.values()]
    .filter((c) => !hidden.has(c.id))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function withHonorExtra(sections: HonorSection[]): HonorSection[] {
  const extra = getHonorExtra();
  return sections.map((section) => {
    const key = section.id as HonorTrackKey;
    const extraCycles = extra[key] ?? [];
    return {
      ...section,
      cycles: mergeCycles(section.cycles, extraCycles, extra.hiddenIds),
    };
  });
}

export type ManagedCycleRow = {
  id: string;
  track: HonorTrackKey;
  trackLabel: string;
  dateLabel: string;
  dateKey: string;
  entryCount: number;
  source: "base" | "extra";
  hidden: boolean;
};

const TRACK_LABEL: Record<HonorTrackKey, string> = {
  validation: "Validation",
  teleop: "Teleoperation",
  outstanding: "Outstanding",
  progression: "Progression",
};

export function buildManagedCatalog(
  sections: HonorSection[],
  extra: HonorExtraFile,
): ManagedCycleRow[] {
  const hidden = new Set(extra.hiddenIds);
  const rows: ManagedCycleRow[] = [];

  for (const section of sections) {
    const track = section.id as HonorTrackKey;

    for (const cycle of section.cycles) {
      rows.push({
        id: cycle.id,
        track,
        trackLabel: TRACK_LABEL[track],
        dateLabel: cycle.dateLabel,
        dateKey: cycle.dateKey,
        entryCount:
          cycle.entries?.length ??
          (cycle.groundbreakers?.length ?? 0) +
            (cycle.vanguards?.length ?? 0) +
            (cycle.navigational?.length ?? 0),
        source: "base",
        hidden: hidden.has(cycle.id),
      });
    }

    for (const cycle of extra[track] ?? []) {
      if (section.cycles.some((c) => c.id === cycle.id)) continue;
      rows.push({
        id: cycle.id,
        track,
        trackLabel: TRACK_LABEL[track],
        dateLabel: cycle.dateLabel,
        dateKey: cycle.dateKey,
        entryCount:
          cycle.entries?.length ??
          (cycle.groundbreakers?.length ?? 0) +
            (cycle.vanguards?.length ?? 0) +
            (cycle.navigational?.length ?? 0),
        source: "extra",
        hidden: hidden.has(cycle.id),
      });
    }
  }

  return rows.sort((a, b) => {
    const d = b.dateKey.localeCompare(a.dateKey);
    if (d !== 0) return d;
    return a.track.localeCompare(b.track);
  });
}
