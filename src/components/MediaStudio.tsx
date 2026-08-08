"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  PRISMAX_LOGO_SRC,
  buildCaption,
  defaultDraft,
  mediaFormats,
  mediaTemplates,
  mediaThemes,
  renderMediaCard,
  robotArt,
  type MediaDraft,
  type MediaTemplateId,
} from "@/lib/mediaStudio";

export function MediaStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draft, setDraft] = useState<MediaDraft>(() => defaultDraft());
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const patch = (partial: Partial<MediaDraft>) => {
    startTransition(() => {
      setDraft((d) => ({ ...d, ...partial }));
    });
  };

  const applyTemplate = (id: MediaTemplateId) => {
    const t = mediaTemplates.find((x) => x.id === id);
    if (!t) return;
    startTransition(() => {
      setDraft((d) => ({
        ...d,
        template: id,
        badge: t.defaults.badge ?? d.badge,
        title: t.defaults.title ?? d.title,
        subtitle: t.defaults.subtitle ?? d.subtitle,
      }));
    });
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setBusy(true);
      try {
        await renderMediaCard(canvas, draft);
        if (!cancelled) setCaption(buildCaption(draft));
      } catch {
        /* keep last frame */
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [draft]);

  const onPhoto = (file: File | null) => {
    if (draft.photoUrl?.startsWith("blob:")) URL.revokeObjectURL(draft.photoUrl);
    if (!file) {
      patch({ photoUrl: null });
      return;
    }
    patch({ photoUrl: URL.createObjectURL(file) });
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    const robot = robotArt[draft.robotId]?.label ?? "robot";
    a.download = `prismax-${draft.template}-${robot}-${draft.format}.png`.toLowerCase();
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const format = mediaFormats.find((f) => f.id === draft.format)!;

  return (
    <section className="px-[clamp(1.25rem,4vw,3.5rem)] py-[clamp(2.75rem,6vw,4.5rem)]">
      <div className="mx-auto max-w-[78rem]">
        <div className="max-w-3xl">
          <div className="media-brand-logo-wrap">
            <img
              src={PRISMAX_LOGO_SRC}
              alt="Prisma(x)"
              className="media-brand-logo"
              height={32}
            />
          </div>
          <p className="mt-4 m-0 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-purple">
            Community creatives · canvas studio
          </p>
          <h2
            className="mt-2.5 text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Media Studio
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
            Compose PrismaX post cards in-browser — official black/cream kit or Hall of Honor
            look, fleet robots (PiPER / YAM / TOK2), optional photo, export PNG + caption.
            No Canva account, no upload to our server.
          </p>
        </div>

        <div className="media-studio mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
          <div className="media-preview-shell">
            <div className="media-preview-bar">
              <span>
                {format.width}×{format.height}
              </span>
              <span>{busy || pending ? "Rendering…" : "Live preview"}</span>
            </div>
            <div className="media-preview-stage">
              <canvas
                ref={canvasRef}
                className="media-canvas"
                style={{ aspectRatio: `${format.width} / ${format.height}` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" onClick={download}>
                Download PNG
              </button>
              <button type="button" className="btn btn-secondary" onClick={copyCaption}>
                {copied ? "Caption copied" : "Copy caption"}
              </button>
              <a
                href="https://www.prismax.ai/brand-kit"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                Official brand kit
              </a>
            </div>
          </div>

          <aside className="media-controls space-y-5">
            <fieldset className="media-field">
              <legend>Template</legend>
              <div className="media-chip-row">
                {mediaTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`media-chip ${draft.template === t.id ? "is-active" : ""}`}
                    onClick={() => applyTemplate(t.id)}
                    title={t.blurb}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="media-field">
              <legend>Theme</legend>
              <div className="media-chip-row">
                {mediaThemes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`media-chip ${draft.theme === t.id ? "is-active" : ""}`}
                    onClick={() => patch({ theme: t.id })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="media-field">
              <legend>Format</legend>
              <div className="media-chip-row">
                {mediaFormats.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`media-chip ${draft.format === f.id ? "is-active" : ""}`}
                    onClick={() => patch({ format: f.id })}
                    title={f.hint}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="media-field">
              <legend>Robot</legend>
              <div className="media-robot-row">
                {Object.entries(robotArt).map(([id, r]) => (
                  <button
                    key={id}
                    type="button"
                    className={`media-robot ${draft.robotId === id ? "is-active" : ""}`}
                    onClick={() => patch({ robotId: id })}
                  >
                    <img src={r.src} alt="" width={48} height={56} />
                    <span>
                      {r.label}
                      <small>{r.maker}</small>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="media-input">
              <span>Headline</span>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                maxLength={80}
              />
            </label>

            <label className="media-input">
              <span>Supporting line</span>
              <input
                type="text"
                value={draft.subtitle}
                onChange={(e) => patch({ subtitle: e.target.value })}
                maxLength={120}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="media-input">
                <span>Handle</span>
                <input
                  type="text"
                  value={draft.handle}
                  onChange={(e) => patch({ handle: e.target.value })}
                  placeholder="@operator"
                  maxLength={40}
                />
              </label>
              <label className="media-input">
                <span>Badge</span>
                <input
                  type="text"
                  value={draft.badge}
                  onChange={(e) => patch({ badge: e.target.value })}
                  maxLength={18}
                />
              </label>
            </div>

            <label className="media-input">
              <span>Optional photo (screenshot / selfie)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPhoto(e.target.files?.[0] ?? null)}
              />
            </label>

            <div className="media-caption">
              <p className="media-caption-label">Caption draft</p>
              <pre>{caption}</pre>
            </div>

            <p className="text-[0.75rem] leading-relaxed text-muted">
              Robot renders from the{" "}
              <a href="https://app.prismax.ai/data/fleet" target="_blank" rel="noreferrer">
                PrismaX Robot Fleet
              </a>
              . Official logo files:{" "}
              <a href="https://www.prismax.ai/brand-kit" target="_blank" rel="noreferrer">
                brand kit
              </a>
              .
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
