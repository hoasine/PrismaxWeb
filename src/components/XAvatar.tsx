"use client";

import { useEffect, useState } from "react";
import { initials, xAvatarUrl, xUsername } from "@/lib/x";

type Props = {
  handle: string;
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
};

export function XAvatar({ handle, name, size = 64, className = "", ring = true }: Props) {
  const [failed, setFailed] = useState(false);
  const user = xUsername(handle);
  const src = xAvatarUrl(handle);
  const dim = `${size}px`;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ${ring ? "avatar-ring" : ""} ${className}`}
      style={{ width: dim, height: dim }}
      title={`@${user}`}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center text-[0.7em] font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, var(--purple-deep), var(--pink))",
            fontFamily: "var(--font-display), sans-serif",
          }}
          aria-hidden
        >
          {initials(name || user)}
        </span>
      )}
    </span>
  );
}
