import { NextResponse } from "next/server";
import { honorSections } from "@/data/spotlights";
import {
  buildManagedCatalog,
  type HonorTrackKey,
} from "@/lib/honorMerge";
import {
  assertAdminSecret,
  persistHonorExtra,
  readHonorExtraFile,
} from "@/lib/honorPersist";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret") ?? undefined;
  if (!assertAdminSecret(secret)) return unauthorized();

  const extra = await readHonorExtraFile();
  const cycles = buildManagedCatalog(honorSections, extra);
  return NextResponse.json({ cycles, hiddenIds: extra.hiddenIds });
}

type Body = {
  secret?: string;
  action?: "hide" | "restore" | "delete";
  id?: string;
  track?: HonorTrackKey;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!assertAdminSecret(body.secret)) return unauthorized();

  const id = body.id?.trim();
  const action = body.action;
  if (!id || !action) {
    return NextResponse.json({ error: "id and action are required" }, { status: 400 });
  }

  const extra = await readHonorExtraFile();
  let message = "";

  if (action === "hide") {
    if (!extra.hiddenIds.includes(id)) extra.hiddenIds.push(id);
    message = `Hide Hall of Honor cycle ${id}.`;
  } else if (action === "restore") {
    extra.hiddenIds = extra.hiddenIds.filter((x) => x !== id);
    message = `Restore Hall of Honor cycle ${id}.`;
  } else if (action === "delete") {
    const track = body.track;
    if (!track) {
      return NextResponse.json({ error: "track is required to delete" }, { status: 400 });
    }
    const before = extra[track]?.length ?? 0;
    extra[track] = (extra[track] ?? []).filter((c) => c.id !== id);
    extra.hiddenIds = extra.hiddenIds.filter((x) => x !== id);
    if ((extra[track]?.length ?? 0) === before) {
      // Not in extra file — hide base cycle instead
      if (!extra.hiddenIds.includes(id)) extra.hiddenIds.push(id);
      message = `Hide base Hall of Honor cycle ${id}.`;
    } else {
      message = `Delete Hall of Honor cycle ${id}.`;
    }
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  try {
    const persist = await persistHonorExtra(extra, message);
    const cycles = buildManagedCatalog(honorSections, extra);
    return NextResponse.json({ ok: true, cycles, hiddenIds: extra.hiddenIds, ...persist });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 },
    );
  }
}
