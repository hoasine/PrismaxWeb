"use client";

import { useEffect, useState } from "react";
import { XAvatar } from "@/components/XAvatar";
import { formatCompact, xStatusId } from "@/lib/x";
import type { SpotlightEntry } from "@/data/spotlights";

type PostPreview = {
  text: string;
  media: string | null;
  likes: number;
  views: number;
};

type Props = {
  entry: SpotlightEntry;
};

export function XPostCard({ entry }: Props) {
  const statusId = xStatusId(entry.url);
  const [preview, setPreview] = useState<PostPreview | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!statusId) {
      setFailed(true);
      return;
    }

    let cancelled = false;
    setFailed(false);
    setPreview(null);

    fetch(`/api/x-post/${statusId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return (await res.json()) as PostPreview;
      })
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [statusId]);

  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noreferrer"
      className="brand-card flex h-full flex-col !p-4 text-fg no-underline md:!p-5"
    >
      <div className="flex items-center gap-3">
        <XAvatar handle={entry.handle} name={entry.author} size={48} />
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-[1.02rem] font-semibold"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {entry.author}
          </p>
          <p className="truncate font-mono text-[0.78rem] text-[#d2c0ff]">{entry.handle}</p>
        </div>
      </div>

      {preview?.media && (
        <div className="relative mt-3.5 overflow-hidden rounded-[0.85rem] border border-[rgba(180,140,255,0.12)] bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.media}
            alt=""
            className="aspect-[16/10] w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="mt-3.5 min-h-[3.5rem] flex-1">
        {preview ? (
          <p className="text-[0.88rem] leading-relaxed text-muted">{preview.text}</p>
        ) : failed ? (
          <p className="text-[0.88rem] text-muted">Open post on X</p>
        ) : (
          <div className="space-y-2" aria-hidden>
            <div className="h-3 w-full rounded bg-[rgba(255,255,255,0.06)]" />
            <div className="h-3 w-[80%] rounded bg-[rgba(255,255,255,0.06)]" />
            <div className="h-3 w-[60%] rounded bg-[rgba(255,255,255,0.06)]" />
          </div>
        )}
      </div>

      {preview && (
        <p className="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-muted">
          {formatCompact(preview.likes)} likes
          {preview.views > 0 ? ` · ${formatCompact(preview.views)} views` : ""}
        </p>
      )}
    </a>
  );
}
