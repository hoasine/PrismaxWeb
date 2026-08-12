import { NextResponse } from "next/server";
import type { HonorCycle } from "@/data/spotlights";
import {
  dateKeyToLabel,
  parseHighlightPaste,
  toHonorCycles,
} from "@/lib/parseHighlights";
import type { HonorExtraFile } from "@/lib/honorMerge";
import {
  assertAdminSecret,
  persistHonorExtra,
  readHonorExtraFile,
} from "@/lib/honorPersist";

export const runtime = "nodejs";

type Body = {
  secret?: string;
  dateKey?: string;
  paste?: string;
  cycles?: Partial<Record<"validation" | "teleop" | "outstanding", HonorCycle>>;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function upsertCycles(
  file: HonorExtraFile,
  incoming: Partial<Record<"validation" | "teleop" | "outstanding", HonorCycle>>,
): HonorExtraFile {
  const next: HonorExtraFile = {
    validation: [...(file.validation ?? [])],
    teleop: [...(file.teleop ?? [])],
    outstanding: [...(file.outstanding ?? [])],
    progression: [...(file.progression ?? [])],
    hiddenIds: [...(file.hiddenIds ?? [])],
  };

  for (const kind of ["validation", "teleop", "outstanding"] as const) {
    const cycle = incoming[kind];
    if (!cycle) continue;
    const list = next[kind];
    const idx = list.findIndex((c) => c.id === cycle.id);
    if (idx >= 0) list[idx] = cycle;
    else list.unshift(cycle);
    next[kind] = list.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    // Publishing again un-hides that cycle
    next.hiddenIds = next.hiddenIds.filter((id) => id !== cycle.id);
  }
  return next;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!assertAdminSecret(body.secret)) return unauthorized();

  const dateKey = body.dateKey?.trim();
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return NextResponse.json({ error: "dateKey must be YYYY-MM-DD" }, { status: 400 });
  }

  let incoming = body.cycles;
  if (!incoming && body.paste?.trim()) {
    const batches = parseHighlightPaste(body.paste);
    if (!batches.length) {
      return NextResponse.json(
        { error: "Could not parse any highlights from paste" },
        { status: 400 },
      );
    }
    incoming = toHonorCycles(batches, dateKeyToLabel(dateKey), dateKey);
  }

  if (!incoming || !Object.keys(incoming).length) {
    return NextResponse.json({ error: "No cycles to save" }, { status: 400 });
  }

  try {
    const current = await readHonorExtraFile();
    const merged = upsertCycles(current, incoming);
    const persist = await persistHonorExtra(
      merged,
      `Add Hall of Honor highlights for ${dateKeyToLabel(dateKey)}.`,
    );
    return NextResponse.json({
      ok: true,
      dateKey,
      cycles: incoming,
      ...persist,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret") ?? undefined;
  if (!assertAdminSecret(secret)) return unauthorized();
  const data = await readHonorExtraFile();
  return NextResponse.json(data);
}
