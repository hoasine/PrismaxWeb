import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { HonorExtraFile } from "@/lib/honorMerge";
import { normalizeHonorExtra } from "@/lib/honorMerge";

const FILE_REL = "src/data/honor-cycles.json";

export function assertAdminSecret(secret: string | undefined): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || !secret || secret !== expected) return false;
  return true;
}

export async function readHonorExtraFile(): Promise<HonorExtraFile> {
  const filePath = path.join(process.cwd(), FILE_REL);
  const raw = await readFile(filePath, "utf8");
  return normalizeHonorExtra(JSON.parse(raw) as Partial<HonorExtraFile>);
}

export async function writeHonorExtraLocal(data: HonorExtraFile) {
  const filePath = path.join(process.cwd(), FILE_REL);
  await writeFile(filePath, `${JSON.stringify(normalizeHonorExtra(data), null, 2)}\n`, "utf8");
}

export async function githubCommitHonorExtra(data: HonorExtraFile, message: string) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO ?? "hoasine/PrismaxWeb";
  const branch = process.env.GITHUB_BRANCH ?? "master";
  const filePath = process.env.GITHUB_FILE_PATH ?? FILE_REL;

  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const content = Buffer.from(
    `${JSON.stringify(normalizeHonorExtra(data), null, 2)}\n`,
  ).toString("base64");
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

export async function persistHonorExtra(data: HonorExtraFile, message: string) {
  if (process.env.VERCEL || process.env.GITHUB_TOKEN) {
    const gh = await githubCommitHonorExtra(data, message);
    if (!process.env.VERCEL) {
      try {
        await writeHonorExtraLocal(data);
      } catch {
        /* ignore */
      }
    }
    return {
      mode: "github" as const,
      ...gh,
      note: "Vercel will redeploy from the GitHub commit shortly.",
    };
  }

  await writeHonorExtraLocal(data);
  return {
    mode: "local" as const,
    note: "Saved locally to src/data/honor-cycles.json. Commit & deploy when ready.",
  };
}
