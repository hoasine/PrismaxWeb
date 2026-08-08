import { BlobReadable } from "@mcap/browser";
import { McapIndexedReader } from "@mcap/core";

export type CheckSeverity = "pass" | "warn" | "fail";

export type ValidationCheck = {
  id: string;
  label: string;
  severity: CheckSeverity;
  detail: string;
};

export type VideoRole = "env" | "left" | "right" | "extra";

export type VideoMeta = {
  name: string;
  sizeBytes: number;
  role: VideoRole;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  error?: string;
};

export type ChannelInfo = {
  id: number;
  topic: string;
  messageEncoding: string;
  schemaName: string;
  messageCount: number;
  hz: number | null;
};

export type McapReport = {
  fileName: string;
  sizeBytes: number;
  profile: string;
  library: string;
  indexed: boolean;
  durationSec: number | null;
  messageCount: number;
  channelCount: number;
  schemaCount: number;
  chunkCount: number;
  compressions: string[];
  channels: ChannelInfo[];
};

export type EpisodeAnalysis = {
  checks: ValidationCheck[];
  mcap: McapReport | null;
  videos: VideoMeta[];
  primaries: { env?: VideoMeta; left?: VideoMeta; right?: VideoMeta };
  score: { pass: number; warn: number; fail: number };
};

const NS = 1e9;
const SYNC_TOLERANCE_SEC = 0.35;
const SYNC_TOLERANCE_RATIO = 0.03;

function nsToSec(ns: bigint): number {
  return Number(ns) / NS;
}

function basename(name: string): string {
  return name.split(/[/\\]/).pop() ?? name;
}

export function classifyVideoRole(fileName: string): VideoRole {
  const n = basename(fileName).toLowerCase();
  if (n.includes("left")) return "left";
  if (n.includes("right")) return "right";
  if (
    n.includes("high") ||
    n.includes("env") ||
    n.includes("overhead") ||
    n.includes("top") ||
    n.includes("ego")
  ) {
    return "env";
  }
  return "extra";
}

function preferPrimary(candidates: VideoMeta[], exact: string): VideoMeta | undefined {
  const exactHit = candidates.find((v) => basename(v.name).toLowerCase() === exact);
  return exactHit ?? candidates[0];
}

export function pickPrimaries(videos: VideoMeta[]) {
  const lefts = videos.filter((v) => v.role === "left");
  const rights = videos.filter((v) => v.role === "right");
  const envs = videos.filter((v) => v.role === "env");
  // Fallback: extras that aren't left/right can serve as env
  const envPool = envs.length
    ? envs
    : videos.filter((v) => v.role === "extra");

  return {
    left: preferPrimary(lefts, "left.mp4"),
    right: preferPrimary(rights, "right.mp4"),
    env: preferPrimary(envPool, "high.mp4") ?? preferPrimary(envPool, "env.mp4"),
  };
}

export function readVideoMeta(file: File): Promise<VideoMeta> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadedmetadata = () => {
      resolve({
        name: file.name,
        sizeBytes: file.size,
        role: classifyVideoRole(file.name),
        durationSec: Number.isFinite(video.duration) ? video.duration : null,
        width: video.videoWidth || null,
        height: video.videoHeight || null,
      });
      cleanup();
    };

    video.onerror = () => {
      resolve({
        name: file.name,
        sizeBytes: file.size,
        role: classifyVideoRole(file.name),
        durationSec: null,
        width: null,
        height: null,
        error: "Could not read video metadata in browser",
      });
      cleanup();
    };

    video.src = url;
  });
}

export async function analyzeMcapFile(file: File): Promise<McapReport> {
  // Summary / Statistics / Channel metadata live in the index section and do not
  // require WASM decompress handlers (those are only needed to read chunk payloads).
  const reader = await McapIndexedReader.Initialize({
    readable: new BlobReadable(file),
  });

  const stats = reader.statistics;
  let durationSec: number | null = null;
  let messageCount = 0;

  if (stats && stats.messageEndTime >= stats.messageStartTime) {
    durationSec = nsToSec(stats.messageEndTime - stats.messageStartTime);
    messageCount = Number(stats.messageCount);
  }

  const channels: ChannelInfo[] = [];
  for (const [id, channel] of reader.channelsById) {
    const schema = reader.schemasById.get(channel.schemaId);
    const count = stats?.channelMessageCounts.get(id);
    const msgCount = count != null ? Number(count) : 0;
    const hz =
      durationSec && durationSec > 0 && msgCount > 1
        ? msgCount / durationSec
        : null;
    channels.push({
      id,
      topic: channel.topic,
      messageEncoding: channel.messageEncoding,
      schemaName: schema?.name ?? "(none)",
      messageCount: msgCount,
      hz,
    });
  }

  channels.sort((a, b) => b.messageCount - a.messageCount);

  const compressionSet = new Set<string>();
  for (const chunk of reader.chunkIndexes) {
    compressionSet.add(chunk.compression || "(none)");
  }

  return {
    fileName: file.name,
    sizeBytes: file.size,
    profile: reader.header.profile || "(empty)",
    library: reader.header.library || "(unknown)",
    indexed: true,
    durationSec,
    messageCount,
    channelCount: reader.channelsById.size,
    schemaCount: reader.schemasById.size,
    chunkCount: stats?.chunkCount ?? reader.chunkIndexes.length,
    compressions: [...compressionSet],
    channels,
  };
}

function push(
  checks: ValidationCheck[],
  id: string,
  label: string,
  severity: CheckSeverity,
  detail: string,
) {
  checks.push({ id, label, severity, detail });
}

export async function analyzeEpisode(files: File[]): Promise<EpisodeAnalysis> {
  const checks: ValidationCheck[] = [];
  const mcapFiles = files.filter((f) => f.name.toLowerCase().endsWith(".mcap"));
  const videoFiles = files.filter((f) => /\.mp4$/i.test(f.name));

  if (mcapFiles.length === 1) {
    push(checks, "mcap-count", "MCAP file present", "pass", `Found ${mcapFiles[0]!.name}`);
  } else if (mcapFiles.length === 0) {
    push(checks, "mcap-count", "MCAP file present", "fail", "Need exactly one .mcap file");
  } else {
    push(
      checks,
      "mcap-count",
      "MCAP file present",
      "fail",
      `Found ${mcapFiles.length} MCAP files — episode should have exactly one`,
    );
  }

  if (videoFiles.length >= 3) {
    push(
      checks,
      "video-count",
      "Primary camera videos",
      "pass",
      `${videoFiles.length} MP4 files (≥ 3 required by PrismaX SDK)`,
    );
  } else {
    push(
      checks,
      "video-count",
      "Primary camera videos",
      "fail",
      `Only ${videoFiles.length} MP4 — need ≥ 3 (env/high + left + right)`,
    );
  }

  const upperMp4 = videoFiles.filter((f) => f.name.endsWith(".MP4") || f.name.endsWith(".Mp4"));
  if (upperMp4.length) {
    push(
      checks,
      "mp4-case",
      "Lowercase .mp4 extension",
      "fail",
      `SDK rejects uppercase extensions: ${upperMp4.map((f) => f.name).join(", ")}`,
    );
  } else if (videoFiles.length) {
    push(checks, "mp4-case", "Lowercase .mp4 extension", "pass", "All videos use .mp4");
  }

  const videos = await Promise.all(videoFiles.map((f) => readVideoMeta(f)));
  const primaries = pickPrimaries(videos);

  if (primaries.left) {
    push(checks, "primary-left", "Left wrist camera", "pass", primaries.left.name);
  } else {
    push(
      checks,
      "primary-left",
      "Left wrist camera",
      "fail",
      'No filename containing "left" (e.g. left.mp4)',
    );
  }

  if (primaries.right) {
    push(checks, "primary-right", "Right wrist camera", "pass", primaries.right.name);
  } else {
    push(
      checks,
      "primary-right",
      "Right wrist camera",
      "fail",
      'No filename containing "right" (e.g. right.mp4)',
    );
  }

  if (primaries.env) {
    push(
      checks,
      "primary-env",
      "Environment / high camera",
      "pass",
      primaries.env.name,
    );
  } else {
    push(
      checks,
      "primary-env",
      "Environment / high camera",
      "fail",
      'No env/high/overhead video (filename should contain high/env/top, not left/right)',
    );
  }

  let mcap: McapReport | null = null;
  if (mcapFiles[0]) {
    try {
      mcap = await analyzeMcapFile(mcapFiles[0]);
      push(
        checks,
        "mcap-parse",
        "MCAP readable (indexed)",
        "pass",
        `${mcap.channelCount} channels · ${mcap.messageCount.toLocaleString()} messages · ${mcap.chunkCount} chunks · compression ${mcap.compressions.join(", ") || "(none)"}`,
      );

      if (mcap.durationSec != null && mcap.durationSec > 0.2) {
        push(
          checks,
          "mcap-duration",
          "MCAP duration",
          "pass",
          `${mcap.durationSec.toFixed(2)}s`,
        );
      } else {
        push(
          checks,
          "mcap-duration",
          "MCAP duration",
          "fail",
          "Duration missing or too short — file may be empty/corrupt",
        );
      }

      if (mcap.channelCount === 0 || mcap.messageCount === 0) {
        push(
          checks,
          "mcap-content",
          "Sensor messages present",
          "fail",
          "No channels/messages found in summary",
        );
      } else {
        push(
          checks,
          "mcap-content",
          "Sensor messages present",
          "pass",
          `${mcap.schemaCount} schemas recorded`,
        );
      }

      const lowHz = mcap.channels.filter(
        (c) => c.hz != null && c.hz > 0 && c.hz < 5 && c.messageCount > 20,
      );
      if (lowHz.length) {
        push(
          checks,
          "mcap-hz",
          "Channel sample rates",
          "warn",
          `Low rate (<5 Hz): ${lowHz
            .slice(0, 3)
            .map((c) => `${c.topic} ~${c.hz!.toFixed(1)}Hz`)
            .join("; ")}`,
        );
      } else if (mcap.channels.some((c) => c.hz != null)) {
        push(
          checks,
          "mcap-hz",
          "Channel sample rates",
          "pass",
          "No suspiciously low sustained rates on busy channels",
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown parse error";
      push(
        checks,
        "mcap-parse",
        "MCAP readable (indexed)",
        "fail",
        `Parse failed — file may be unindexed/corrupt/unsupported compression. ${message}`,
      );
    }
  }

  // Video quality / sync
  const readableVideos = videos.filter((v) => v.durationSec != null && !v.error);
  for (const v of videos) {
    if (v.error) {
      push(checks, `video-meta-${v.name}`, `Video metadata · ${v.name}`, "warn", v.error);
    } else if (v.width && v.height && (v.width < 320 || v.height < 240)) {
      push(
        checks,
        `video-res-${v.name}`,
        `Resolution · ${v.name}`,
        "warn",
        `${v.width}×${v.height} looks low for training`,
      );
    }
  }

  const primaryList = [primaries.env, primaries.left, primaries.right].filter(
    (v): v is VideoMeta => Boolean(v && v.durationSec != null),
  );

  if (primaryList.length >= 2) {
    const durations = primaryList.map((v) => v.durationSec!);
    const minD = Math.min(...durations);
    const maxD = Math.max(...durations);
    const drift = maxD - minD;
    const tol = Math.max(SYNC_TOLERANCE_SEC, minD * SYNC_TOLERANCE_RATIO);
    if (drift <= tol) {
      push(
        checks,
        "video-sync",
        "Camera duration sync",
        "pass",
        `Primary cameras within ${drift.toFixed(3)}s (tol ${tol.toFixed(2)}s)`,
      );
    } else {
      push(
        checks,
        "video-sync",
        "Camera duration sync",
        "fail",
        `Primary cameras drift ${drift.toFixed(2)}s — Verify Quality rejects out-of-sync feeds`,
      );
    }
  }

  if (mcap?.durationSec != null && primaryList.length) {
    const mismatches = primaryList.filter((v) => {
      const d = Math.abs(v.durationSec! - mcap!.durationSec!);
      const tol = Math.max(SYNC_TOLERANCE_SEC, mcap!.durationSec! * SYNC_TOLERANCE_RATIO);
      return d > tol;
    });
    if (mismatches.length === 0) {
      push(
        checks,
        "av-sync",
        "Video ↔ MCAP duration",
        "pass",
        `Videos align with MCAP (${mcap.durationSec.toFixed(2)}s)`,
      );
    } else {
      push(
        checks,
        "av-sync",
        "Video ↔ MCAP duration",
        "fail",
        `Mismatch vs MCAP: ${mismatches
          .map((v) => `${basename(v.name)}=${v.durationSec!.toFixed(2)}s`)
          .join(", ")}`,
      );
    }
  }

  if (readableVideos.length && primaryList.length === 3) {
    const blackSuspect = primaryList.filter(
      (v) => v.width && v.height && v.width * v.height > 0 && (v.durationSec ?? 0) < 0.5,
    );
    if (blackSuspect.length) {
      push(
        checks,
        "tiny-clips",
        "Clip length sanity",
        "warn",
        `Very short primary clips: ${blackSuspect.map((v) => basename(v.name)).join(", ")}`,
      );
    }
  }

  const score = checks.reduce(
    (acc, c) => {
      acc[c.severity] += 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0 },
  );

  return { checks, mcap, videos, primaries, score };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}
