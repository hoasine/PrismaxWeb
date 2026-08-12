import type { HonorCycle, SpotlightEntry } from "@/data/spotlights";

export type ParsedHighlightBatch = {
  kind: "validation" | "teleop" | "outstanding";
  title: string;
  entries: SpotlightEntry[];
};

const SECTION_PATTERNS: { kind: ParsedHighlightBatch["kind"]; title: string; re: RegExp }[] = [
  {
    kind: "validation",
    title: "Data Validation Day Highlights",
    re: /data\s*validation|validation\s*day/i,
  },
  {
    kind: "teleop",
    title: "Teleoperation Day Highlights",
    re: /teleoperation|teleop\s*day/i,
  },
  {
    kind: "outstanding",
    title: "Outstanding Contributors",
    re: /outstanding/i,
  },
];

const X_URL_RE =
  /https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]+)\/status\/\d+[^\s)]*/gi;

function cleanAuthor(raw: string): { author: string; handle?: string } {
  let text = raw.replace(/^by\s+/i, "").trim();
  text = text.replace(/\s+/g, " ");
  const handleMatch = text.match(/@([A-Za-z0-9_]+)/);
  const handle = handleMatch ? `@${handleMatch[1]}` : undefined;
  let author = text.replace(/@([A-Za-z0-9_]+)/, "").trim();
  author = author.replace(/^[-–—|:]+/, "").replace(/[-–—|:]+$/, "").trim();
  if (!author && handle) author = handle.replace(/^@/, "");
  return { author: author || "Unknown", handle };
}

function handleFromUrl(url: string): string {
  const m = url.match(/(?:x|twitter)\.com\/([A-Za-z0-9_]+)\//i);
  return m ? `@${m[1]}` : "@unknown";
}

/** Split paste into section blocks using known headers. */
function splitSections(text: string): { header: string; body: string }[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: { header: string; body: string }[] = [];
  let current: { header: string; body: string[] } | null = null;

  for (const line of lines) {
    const isHeader = SECTION_PATTERNS.some((p) => p.re.test(line));
    if (isHeader) {
      if (current) {
        blocks.push({ header: current.header, body: current.body.join("\n") });
      }
      current = { header: line, body: [] };
      continue;
    }
    if (!current) {
      // No header yet — accumulate into a pending bag
      current = { header: "", body: [line] };
      continue;
    }
    current.body.push(line);
  }
  if (current) {
    blocks.push({ header: current.header, body: current.body.join("\n") });
  }
  return blocks;
}

function parseEntriesFromBody(body: string): SpotlightEntry[] {
  const entries: SpotlightEntry[] = [];
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const byMatch = line.match(/^by\s+(.+)$/i);
    if (!byMatch) continue;

    const { author, handle: handleFromBy } = cleanAuthor(byMatch[1]!);
    let url = "";
    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
      const next = lines[j]!;
      X_URL_RE.lastIndex = 0;
      const urlMatch = next.match(X_URL_RE);
      if (urlMatch?.[0]) {
        url = urlMatch[0].replace(/[?&]s=\d+$/i, "").replace(/\?s=\d+$/i, "");
        // strip tracking query but keep path
        try {
          const u = new URL(url);
          url = `${u.origin}${u.pathname}`;
        } catch {
          /* keep raw */
        }
        break;
      }
      if (/^by\s+/i.test(next)) break;
    }
    if (!url) continue;
    const handle = handleFromBy ?? handleFromUrl(url);
    entries.push({ author, handle, url });
  }

  // Fallback: any leftover X URLs not captured
  if (!entries.length) {
    X_URL_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = X_URL_RE.exec(body))) {
      const url = m[0].split("?")[0]!;
      const handle = `@${m[1]}`;
      entries.push({ author: m[1]!, handle, url });
    }
  }

  // Dedupe by url
  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
}

export function parseHighlightPaste(text: string): ParsedHighlightBatch[] {
  const blocks = splitSections(text);
  const batches: ParsedHighlightBatch[] = [];

  for (const block of blocks) {
    const headerSource = block.header || block.body.slice(0, 80);
    const matched = SECTION_PATTERNS.find((p) => p.re.test(headerSource));
    const kind = matched?.kind ?? (batches.length === 0 ? "validation" : "teleop");
    const title = matched?.title ?? (kind === "teleop" ? "Teleoperation Day Highlights" : "Data Validation Day Highlights");
    const entries = parseEntriesFromBody(block.body || block.header);
    if (!entries.length) continue;
    batches.push({ kind, title, entries });
  }

  return batches;
}

export function toHonorCycles(
  batches: ParsedHighlightBatch[],
  dateLabel: string,
  dateKey: string,
): Partial<Record<ParsedHighlightBatch["kind"], HonorCycle>> {
  const out: Partial<Record<ParsedHighlightBatch["kind"], HonorCycle>> = {};
  for (const batch of batches) {
    const prefix =
      batch.kind === "validation" ? "val" : batch.kind === "teleop" ? "tele" : "out";
    out[batch.kind] = {
      id: `${prefix}-${dateKey}`,
      dateLabel,
      dateKey,
      blurb:
        batch.kind === "validation"
          ? "Data Validation Day highlights from the recognition cycle."
          : batch.kind === "teleop"
            ? "Teleoperation Day highlights from the recognition cycle."
            : "Outstanding contributors from the recognition cycle.",
      entries: batch.entries,
    };
  }
  return out;
}

export function dateKeyToLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-");
  if (!y || !m || !d) return dateKey;
  return `${d}/${m}/${y}`;
}
