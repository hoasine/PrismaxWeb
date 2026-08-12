import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { HonorCycle } from "@/data/spotlights";
import type { HonorExtraFile } from "@/lib/honorMerge";
import {
  dateKeyToLabel,
  parseHighlightPaste,
  toHonorCycles,
} from "@/lib/parseHighlights";

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

function assertSecret(secret: string | undefined) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || !secret || secret !== expected) return false;
  return true;
}

async function readExtraFile(): Promise<HonorExtraFile> {
  const filePath = path.join(process.cwd(), "src/data/honor-cycles.json");
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as HonorExtraFile;
}

async function writeExtraLocal(data: HonorExtraFile) {
  const filePath = path.join(process.cwd(), "src/data/honor-cycles.json");
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function githubCommit(data: HonorExtraFile, message: string) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO ?? "hoasine/PrismaxWeb";
  const branch = process.env.GITHUB_BRANCH ?? "master";
  const filePath = process.env.GITHUB_FILE_PATH ?? "src/data/honor-cycles.json";

  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const content = Buffer.from(`${JSON.stringify(data, null, 2)}\n`).toString("base64");
  const metaUrl = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;

  const metaRes = await fetch(metaUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  let sha: string | undefined;
  if (metaRes.ok) {
    const meta = (await metaRes.json()) as { sha?: string };
    sha = meta.sha;
  } else if (metaRes.status !== 404) {
    const err = await metaRes.text();
    throw new Error(`GitHub read failed: ${metaRes.status} ${err}`);
  }

  const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content,
      branch,
      sha,
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub write failed: ${putRes.status} ${err}`);
  }

  const result = (await putRes.json()) as {
    commit?: { html_url?: string };
    content?: { html_url?: string };
  };
  return {
    commitUrl: result.commit?.html_url,
    fileUrl: result.content?.html_url,
  };
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
  };

  for (const kind of ["validation", "teleop", "outstanding"] as const) {
    const cycle = incoming[kind];
    if (!cycle) continue;
    const list = next[kind];
    const idx = list.findIndex((c) => c.id === cycle.id);
    if (idx >= 0) list[idx] = cycle;
    else list.unshift(cycle);
    next[kind] = list.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
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

  if (!assertSecret(body.secret)) return unauthorized();

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

  const current = await readExtraFile();
  const merged = upsertCycles(current, incoming);
  const message = `Add Hall of Honor highlights for ${dateKeyToLabel(dateKey)}.`;

  try {
    if (process.env.VERCEL || process.env.GITHUB_TOKEN) {
      const gh = await githubCommit(merged, message);
      // Also keep local in sync during `vercel dev` / local prod tests when possible
      if (!process.env.VERCEL) {
        try {
          await writeExtraLocal(merged);
        } catch {
          /* ignore */
        }
      }
      return NextResponse.json({
        ok: true,
        mode: "github",
        dateKey,
        cycles: incoming,
        ...gh,
        note: "Vercel will redeploy from the GitHub commit shortly.",
      });
    }

    await writeExtraLocal(merged);
    return NextResponse.json({
      ok: true,
      mode: "local",
      dateKey,
      cycles: incoming,
      note: "Saved locally to src/data/honor-cycles.json. Commit & deploy when ready.",
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
  if (!assertSecret(secret)) return unauthorized();
  const data = await readExtraFile();
  return NextResponse.json(data);
}
