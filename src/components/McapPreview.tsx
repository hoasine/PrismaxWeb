"use client";

import { useCallback, useMemo, useState } from "react";
import {
  analyzeEpisode,
  formatBytes,
  type EpisodeAnalysis,
  type ValidationCheck,
} from "@/lib/mcapAnalyze";

function severityClass(severity: ValidationCheck["severity"]) {
  if (severity === "pass") return "check-pass";
  if (severity === "warn") return "check-warn";
  return "check-fail";
}

function DropZone({
  onFiles,
  busy,
}: {
  onFiles: (files: File[]) => void;
  busy: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  return (
    <div
      className={`mcap-dropzone ${dragOver ? "is-over" : ""} ${busy ? "is-busy" : ""}`}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <p
        className="text-[1.15rem] font-semibold text-fg"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        {busy ? "Scanning episode…" : "Drop episode files here"}
      </p>
      <p className="mt-2 max-w-lg text-sm text-muted">
        One <code className="text-[#d2c0ff]">.mcap</code> + at least three{" "}
        <code className="text-[#d2c0ff]">.mp4</code> (high/env, left, right). Parsed entirely
        in your browser — nothing uploads to our server.
      </p>
      <label className="btn btn-primary mt-5 cursor-pointer">
        {busy ? "Analyzing…" : "Choose files"}
        <input
          type="file"
          className="hidden"
          multiple
          accept=".mcap,.mp4,video/mp4"
          disabled={busy}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function PipelineStage({ busy }: { busy: boolean }) {
  return (
    <div className={`mcap-stage ${busy ? "is-busy" : ""}`} aria-hidden>
      <div className="mcap-stage-grid" />
      <div className="mcap-stage-scan" />
      <div className="mcap-stage-glow" />

      <div className="mcap-wave" aria-hidden>
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>

      <div className="mcap-pipeline">
        <div className="mcap-node">
          <span className="mcap-node-kicker">01</span>
          <strong>.mcap</strong>
          <small>sensors · index</small>
        </div>
        <div className="mcap-pipe" />
        <div className="mcap-node mcap-node-cams">
          <span className="mcap-node-kicker">02</span>
          <strong>3× MP4</strong>
          <small>high · left · right</small>
          <div className="mcap-cam-row">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="mcap-pipe" />
        <div className="mcap-node mcap-node-core">
          <span className="mcap-node-kicker">03</span>
          <strong>Validate</strong>
          <small>sync · format · Hz</small>
          <div className="mcap-radar">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="mcap-pipe" />
        <div className="mcap-node mcap-node-ready">
          <span className="mcap-node-kicker">04</span>
          <strong>Upload</strong>
          <small>Verify Quality</small>
        </div>
      </div>

      <p className="mcap-stage-caption">
        Local preflight for PrismaX episodes — catch rejects before they cost a cycle
      </p>
    </div>
  );
}

export function McapPreview() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<EpisodeAnalysis | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const onFiles = useCallback(async (files: File[]) => {
    setBusy(true);
    setError(null);
    setFileNames(files.map((f) => f.name));
    try {
      const report = await analyzeEpisode(files);
      setAnalysis(report);
    } catch (err) {
      setAnalysis(null);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setBusy(false);
    }
  }, []);

  const readiness = useMemo(() => {
    if (!analysis) return null;
    if (analysis.score.fail > 0) return { label: "Not upload-ready", tone: "fail" as const };
    if (analysis.score.warn > 0) return { label: "Upload with caution", tone: "warn" as const };
    return { label: "Looks upload-ready", tone: "pass" as const };
  }, [analysis]);

  return (
    <section className="px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.75rem,6vw,4.5rem)]">
      <div className="mx-auto max-w-[78rem]">
        <div className="max-w-3xl">
          <p className="m-0 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-purple">
            Upload readiness · client-side
          </p>
          <h2
            className="mt-2.5 text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            MCAP Preview
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
            Validate a PrismaX-style episode before SDK upload: MCAP integrity, primary camera
            naming, frame metadata, and duration sync — so Verify Quality doesn&apos;t reject
            obvious pipeline mistakes.
          </p>
        </div>

        {!analysis && (
          <div className="mcap-hero mt-8">
            <PipelineStage busy={busy} />
            <div className="mcap-hero-drop">
              <DropZone onFiles={onFiles} busy={busy} />
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-8">
            <DropZone onFiles={onFiles} busy={busy} />
          </div>
        )}

        {error && (
          <div className="brand-card mt-6 !border-[rgba(255,120,120,0.35)] !p-4 text-sm text-[#ffb4b4]">
            {error}
          </div>
        )}

        {analysis && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {readiness && (
                <span className={`readiness-pill ${readiness.tone}`}>{readiness.label}</span>
              )}
              <span className="font-mono text-[0.72rem]">
                <span className="text-[#9ef0b4]">{analysis.score.pass} pass</span>
                {" · "}
                <span className="text-[#ffe0a8]">{analysis.score.warn} warn</span>
                {" · "}
                <span
                  className={
                    analysis.score.fail > 0
                      ? "font-semibold text-[#ff8a8a]"
                      : "text-muted"
                  }
                >
                  {analysis.score.fail} fail
                </span>
              </span>
              <span className="font-mono text-[0.72rem] text-muted">
                {fileNames.length} files loaded
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[...analysis.checks]
                .sort((a, b) => {
                  const order = { fail: 0, warn: 1, pass: 2 } as const;
                  return order[a.severity] - order[b.severity];
                })
                .map((check) => (
                  <article
                    key={check.id}
                    className={`brand-card !p-4 ${severityClass(check.severity)}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="check-label text-sm font-semibold text-fg">{check.label}</p>
                      <span className="check-badge">{check.severity}</span>
                    </div>
                    <p className="check-detail mt-2 text-[0.82rem] leading-relaxed text-muted">
                      {check.detail}
                    </p>
                  </article>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="brand-card !p-5 md:!p-6">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-purple">
                  MCAP summary
                </p>
                {analysis.mcap ? (
                  <>
                    <h3
                      className="mt-2 text-[1.2rem] font-semibold text-fg"
                      style={{ fontFamily: "var(--font-display), sans-serif" }}
                    >
                      {analysis.mcap.fileName}
                    </h3>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-muted">Size</dt>
                        <dd className="font-mono text-fg">
                          {formatBytes(analysis.mcap.sizeBytes)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">Duration</dt>
                        <dd className="font-mono text-fg">
                          {analysis.mcap.durationSec != null
                            ? `${analysis.mcap.durationSec.toFixed(2)}s`
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">Messages</dt>
                        <dd className="font-mono text-fg">
                          {analysis.mcap.messageCount.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">Channels</dt>
                        <dd className="font-mono text-fg">{analysis.mcap.channelCount}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Profile</dt>
                        <dd className="font-mono text-fg">{analysis.mcap.profile}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Library</dt>
                        <dd className="truncate font-mono text-fg" title={analysis.mcap.library}>
                          {analysis.mcap.library}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">Chunks</dt>
                        <dd className="font-mono text-fg">{analysis.mcap.chunkCount}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Compression</dt>
                        <dd className="font-mono text-fg">
                          {analysis.mcap.compressions.join(", ") || "(none)"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5 overflow-x-auto">
                      <table className="spec-table w-full min-w-[480px] text-left text-sm">
                        <thead>
                          <tr>
                            <th>Topic</th>
                            <th>Encoding</th>
                            <th>Msgs</th>
                            <th>Hz</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.mcap.channels.slice(0, 12).map((ch) => (
                            <tr key={ch.id}>
                              <td className="!whitespace-normal !text-fg">{ch.topic}</td>
                              <td>{ch.messageEncoding}</td>
                              <td>{ch.messageCount.toLocaleString()}</td>
                              <td>{ch.hz != null ? ch.hz.toFixed(1) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {analysis.mcap.channels.length > 12 && (
                        <p className="mt-2 text-[0.75rem] text-muted">
                          Showing top 12 / {analysis.mcap.channels.length} channels
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-muted">No parsed MCAP report.</p>
                )}
              </div>

              <div className="brand-card !p-5 md:!p-6">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-purple">
                  Camera assignment
                </p>
                <div className="mt-4 space-y-3">
                  {(
                    [
                      ["env", "Environment / high", analysis.primaries.env],
                      ["left", "Left wrist", analysis.primaries.left],
                      ["right", "Right wrist", analysis.primaries.right],
                    ] as const
                  ).map(([key, label, video]) => (
                    <div
                      key={key}
                      className="rounded-[var(--radius-sm)] border border-[rgba(180,140,255,0.12)] bg-black/20 px-3 py-3"
                    >
                      <p className="text-[0.72rem] font-medium uppercase tracking-[0.08em] text-muted">
                        {label}
                      </p>
                      {video ? (
                        <>
                          <p className="mt-1 truncate text-sm font-semibold text-fg">
                            {video.name}
                          </p>
                          <p className="mt-1 font-mono text-[0.75rem] text-muted">
                            {video.durationSec != null
                              ? `${video.durationSec.toFixed(2)}s`
                              : "duration ?"}
                            {video.width && video.height
                              ? ` · ${video.width}×${video.height}`
                              : ""}
                            {` · ${formatBytes(video.sizeBytes)}`}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-[#ffb4b4]">Not detected</p>
                      )}
                    </div>
                  ))}
                </div>

                {analysis.videos.filter((v) => v.role === "extra").length > 0 && (
                  <div className="mt-4">
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.08em] text-muted">
                      Additional videos
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted">
                      {analysis.videos
                        .filter((v) => v.role === "extra")
                        .map((v) => (
                          <li key={v.name} className="truncate font-mono text-[0.78rem]">
                            {v.name}
                            {v.durationSec != null ? ` · ${v.durationSec.toFixed(2)}s` : ""}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="brand-card !p-5 text-[0.82rem] leading-relaxed text-muted">
              <p className="font-semibold text-fg">PrismaX episode checklist (from SDK / docs)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Root <code>{`{episode_key}.mcap`}</code> + folder with ≥3 lowercase{" "}
                  <code>.mp4</code>
                </li>
                <li>
                  Primary views: env/high + left + right (exact <code>high.mp4</code> /{" "}
                  <code>left.mp4</code> / <code>right.mp4</code> preferred)
                </li>
                <li>
                  Verify Quality fails episodes with unclear cameras or out-of-sync feeds —
                  duration drift is caught here client-side
                </li>
                <li>
                  Files never leave this device; analysis uses{" "}
                  <code>@mcap/core</code> + <code>@mcap/browser</code> entirely client-side
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
