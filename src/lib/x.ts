/** Strip @ and normalize X/Twitter handle. */
export function xUsername(handleOrUrl: string): string {
  const raw = handleOrUrl.trim();
  if (raw.includes("x.com/") || raw.includes("twitter.com/")) {
    try {
      const path = new URL(raw).pathname.split("/").filter(Boolean)[0] ?? "";
      return path.replace(/^@/, "");
    } catch {
      /* fall through */
    }
  }
  return raw.replace(/^@/, "").split("/")[0] ?? "";
}

/** Same-origin avatar proxy (resolves via fxtwitter → pbs.twimg.com). */
export function xAvatarUrl(handleOrUrl: string): string {
  const user = xUsername(handleOrUrl);
  return `/api/x-avatar/${encodeURIComponent(user)}`;
}

/** Extract numeric status id from an X/Twitter post URL. */
export function xStatusId(url: string): string | null {
  const match = url.match(/\/status(?:es)?\/(\d+)/i);
  return match?.[1] ?? null;
}

export function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function excerptText(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}
