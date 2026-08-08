"use client";

import { XAvatar } from "@/components/XAvatar";
import { initials } from "@/lib/x";

type Props = {
  name: string;
  handle?: string | null;
  size?: number;
};

export function PersonBadge({ name, handle, size = 28 }: Props) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-[var(--radius-pill)] border border-[rgba(180,140,255,0.18)] bg-[rgba(255,255,255,0.04)] py-1 pr-3 pl-1 text-sm text-fg">
      {handle ? (
        <XAvatar handle={handle} name={name} size={size} ring={false} />
      ) : (
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold text-white"
          style={{
            width: size,
            height: size,
            background: "linear-gradient(135deg, var(--purple-deep), var(--pink))",
            fontFamily: "var(--font-display), sans-serif",
          }}
          aria-hidden
        >
          {initials(name)}
        </span>
      )}
      <span className="truncate">{name}</span>
    </span>
  );
}
