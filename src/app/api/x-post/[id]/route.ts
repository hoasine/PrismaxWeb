import { NextResponse } from "next/server";
import { excerptText } from "@/lib/x";

type FxMedia = {
  type?: string;
  url?: string;
  thumbnail_url?: string;
};

type FxTweet = {
  tweet?: {
    text?: string;
    likes?: number;
    views?: number;
    created_at?: string;
    media?: {
      all?: FxMedia[];
      photos?: FxMedia[];
      videos?: FxMedia[];
    };
  };
};

function mediaThumb(tweet: NonNullable<FxTweet["tweet"]>): string | null {
  const all = tweet.media?.all ?? tweet.media?.photos ?? tweet.media?.videos ?? [];
  const first = all[0];
  if (!first) return null;
  if (first.type === "video" || first.type === "gif") {
    return first.thumbnail_url ?? null;
  }
  return first.url ?? first.thumbnail_url ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: raw } = await params;
  const id = raw.trim();

  if (!/^\d{5,25}$/.test(id)) {
    return NextResponse.json({ error: "Invalid status id" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.fxtwitter.com/status/${id}`, {
      headers: { Accept: "application/json", "User-Agent": "PrismaxHallOfHonor/1.0" },
      next: { revalidate: 86_400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const data = (await res.json()) as FxTweet;
    const tweet = data.tweet;
    if (!tweet?.text) {
      return NextResponse.json({ error: "Empty post" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id,
        text: excerptText(tweet.text, 180),
        media: mediaThumb(tweet),
        likes: tweet.likes ?? 0,
        views: tweet.views ?? 0,
        createdAt: tweet.created_at ?? null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
