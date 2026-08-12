import type { HonorCycle, HonorSection } from "@/data/spotlights";
import honorExtra from "@/data/honor-cycles.json";

export type HonorExtraFile = {
  validation: HonorCycle[];
  teleop: HonorCycle[];
  outstanding: HonorCycle[];
  progression: HonorCycle[];
};

export function getHonorExtra(): HonorExtraFile {
  return honorExtra as HonorExtraFile;
}

export function mergeCycles(base: HonorCycle[], extra: HonorCycle[]): HonorCycle[] {
  const map = new Map<string, HonorCycle>();
  for (const cycle of base) map.set(cycle.id, cycle);
  for (const cycle of extra) map.set(cycle.id, cycle);
  return [...map.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function withHonorExtra(sections: HonorSection[]): HonorSection[] {
  const extra = getHonorExtra();
  return sections.map((section) => {
    const key = section.id as keyof HonorExtraFile;
    const extraCycles = extra[key] ?? [];
    if (!extraCycles.length) {
      return {
        ...section,
        cycles: [...section.cycles].sort((a, b) => b.dateKey.localeCompare(a.dateKey)),
      };
    }
    return {
      ...section,
      cycles: mergeCycles(section.cycles, extraCycles),
    };
  });
}
