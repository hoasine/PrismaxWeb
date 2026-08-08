import { NextResponse } from "next/server";

type FxUser = {
  user?: {
    avatar_url?: string;
  };
};

function upgradeAvatarSize(url: string): string {
  return url
    .replace("_normal.", "_400x400.")
    .replace("_mini.", "_400x400.")
    .replace("_bigger.", "_400x400.");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ user: string }> },
) {
  const { user: raw } = await params;
  const user = decodeURIComponent(raw).replace(/^@/, "").trim();

  if (!/^[A-Za-z0-9_]{1,15}$/.test(user)) {
    return new NextResponse("Invalid username", { status: 400 });
  }

  try {
    const profileRes = await fetch(`https://api.fxtwitter.com/${user}`, {
      headers: { Accept: "application/json", "User-Agent": "PrismaxHallOfHonor/1.0" },
      next: { revalidate: 86_400 },
    });

    if (!profileRes.ok) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const data = (await profileRes.json()) as FxUser;
    const avatarUrl = data.user?.avatar_url;
    if (!avatarUrl) {
      return new NextResponse("No avatar", { status: 404 });
    }

    const imageRes = await fetch(upgradeAvatarSize(avatarUrl), {
      headers: { "User-Agent": "PrismaxHallOfHonor/1.0" },
      next: { revalidate: 86_400 },
    });

    if (!imageRes.ok) {
      return new NextResponse("Avatar fetch failed", { status: 502 });
    }

    const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";
    const body = await imageRes.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Avatar lookup failed", { status: 502 });
  }
}
