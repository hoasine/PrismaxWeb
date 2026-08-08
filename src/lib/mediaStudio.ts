export type MediaFormatId = "x-landscape" | "square" | "hd";
export type MediaThemeId = "official" | "community";
export type MediaTemplateId = "spotlight" | "teleop" | "validation" | "robot-card";

export type MediaFormat = {
  id: MediaFormatId;
  label: string;
  width: number;
  height: number;
  hint: string;
};

export type MediaTheme = {
  id: MediaThemeId;
  label: string;
  bg: string;
  bg2: string;
  fg: string;
  muted: string;
  accent: string;
  accent2: string;
  panel: string;
  logo: string;
};

export type MediaDraft = {
  template: MediaTemplateId;
  format: MediaFormatId;
  theme: MediaThemeId;
  robotId: string;
  title: string;
  subtitle: string;
  handle: string;
  badge: string;
  /** optional user photo as object URL / data URL */
  photoUrl?: string | null;
};

export const mediaFormats: MediaFormat[] = [
  {
    id: "x-landscape",
    label: "X / post",
    width: 1200,
    height: 675,
    hint: "16:9 · feed & Discord embed",
  },
  {
    id: "square",
    label: "Square",
    width: 1080,
    height: 1080,
    hint: "1:1 · story & avatar crops",
  },
  {
    id: "hd",
    label: "HD cover",
    width: 1920,
    height: 1080,
    hint: "16:9 · banner / YouTube",
  },
];

export const mediaThemes: MediaTheme[] = [
  {
    id: "official",
    label: "Official kit",
    bg: "#202020",
    bg2: "#2a2a2a",
    fg: "#FFFFFF",
    muted: "#DFD8D0",
    accent: "#DFD8D0",
    accent2: "#FFFFFF",
    panel: "rgba(255,255,255,0.06)",
    logo: "#FFFFFF",
  },
  {
    id: "community",
    label: "Hall of Honor",
    bg: "#07070c",
    bg2: "#141022",
    fg: "#F4F2FA",
    muted: "#9A97B0",
    accent: "#B48CFF",
    accent2: "#E9A0F5",
    panel: "rgba(155,106,246,0.14)",
    logo: "#F4F2FA",
  },
];

export const mediaTemplates: {
  id: MediaTemplateId;
  label: string;
  blurb: string;
  defaults: Partial<MediaDraft>;
}[] = [
  {
    id: "spotlight",
    label: "Spotlight",
    blurb: "Portrait + robot · Hall of Honor",
    defaults: {
      badge: "SPOTLIGHT",
      title: "Operator of the week",
      subtitle: "Recognized for consistent teleop quality",
    },
  },
  {
    id: "teleop",
    label: "Teleop",
    blurb: "Cinematic session strip",
    defaults: {
      badge: "TELEOP",
      title: "Live teleop session",
      subtitle: "Human skill → robot data",
    },
  },
  {
    id: "validation",
    label: "Validation",
    blurb: "Score checklist + fleet robot",
    defaults: {
      badge: "VALIDATION",
      title: "Verify Quality run",
      subtitle: "Score the data robots learn from",
    },
  },
  {
    id: "robot-card",
    label: "Robot card",
    blurb: "Fleet product hero",
    defaults: {
      badge: "FLEET",
      title: "My PrismaX setup",
      subtitle: "Validated fleet · ready to collect",
    },
  },
];

export const robotArt: Record<
  string,
  { label: string; maker: string; src: string; line: string; tags: string[] }
> = {
  piper: {
    label: "PiPER",
    maker: "Agilex Robotics",
    src: "/media/robots/piper.png",
    line: "Validated fleet · single arm",
    tags: ["Lightweight payload", "Precision control", "Open source"],
  },
  tok2: {
    label: "TOK2",
    maker: "Airbot",
    src: "/media/robots/tok2.png",
    line: "Validated fleet · multi-arm kit",
    tags: ["Ultra affordable", "Ultra lightweight", "Integrated kit"],
  },
  yam: {
    label: "YAM",
    maker: "I2RT Robotics",
    src: "/media/robots/yam.png",
    line: "Validated fleet · precision rig",
    tags: ["Compact power", "Longevity", "CNC machined"],
  },
};

const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = imageCache.get(src);
  if (hit?.complete) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function themeOf(id: MediaThemeId): MediaTheme {
  return mediaThemes.find((t) => t.id === id) ?? mediaThemes[0]!;
}

function formatOf(id: MediaFormatId): MediaFormat {
  return mediaFormats.find((f) => f.id === id) ?? mediaFormats[0]!;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length;
}

function drawAtmosphere(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: MediaTheme,
) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, theme.bg);
  g.addColorStop(1, theme.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  if (theme.id === "official") {
    // cream fluid wash
    const soft = ctx.createRadialGradient(w * 0.8, h * 0.2, 40, w * 0.8, h * 0.2, w * 0.55);
    soft.addColorStop(0, "rgba(223,216,208,0.14)");
    soft.addColorStop(1, "transparent");
    ctx.fillStyle = soft;
    ctx.fillRect(0, 0, w, h);

    // soft diagonal accent — keep quiet so content stays balanced
    ctx.save();
    ctx.strokeStyle = "rgba(223,216,208,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.58, 0);
    ctx.lineTo(w, h * 0.5);
    ctx.stroke();
    ctx.restore();
  } else {
    const a = ctx.createRadialGradient(w * 0.2, 0, 20, w * 0.2, 0, w * 0.5);
    a.addColorStop(0, "rgba(155,106,246,0.35)");
    a.addColorStop(1, "transparent");
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, w, h);
    const b = ctx.createRadialGradient(w, h, 20, w, h, w * 0.45);
    b.addColorStop(0, "rgba(233,160,245,0.18)");
    b.addColorStop(1, "transparent");
    ctx.fillStyle = b;
    ctx.fillRect(0, 0, w, h);
  }

  // fine grid
  ctx.save();
  ctx.strokeStyle =
    theme.id === "official" ? "rgba(223,216,208,0.06)" : "rgba(180,140,255,0.07)";
  ctx.lineWidth = 1;
  const step = Math.round(Math.min(w, h) / 18);
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

export const PRISMAX_LOGO_SRC = "/media/logo-prismax.png";

/** Official wordmark is dark-on-black — recolor non-black pixels for card contrast. */
function tintLogo(
  img: HTMLImageElement,
  height: number,
  rgb: [number, number, number],
): HTMLCanvasElement {
  const scale = height / img.height;
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(height));
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  const t = tmp.getContext("2d");
  if (!t) return tmp;
  t.drawImage(img, 0, 0, w, h);
  const data = t.getImageData(0, 0, w, h);
  const d = data.data;
  const [tr, tg, tb] = rgb;
  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i]! + d[i + 1]! + d[i + 2]!) / 3;
    if (lum < 12) {
      d[i + 3] = 0;
    } else {
      const a = Math.min(255, Math.round((lum / 70) * 255));
      d[i] = tr;
      d[i + 1] = tg;
      d[i + 2] = tb;
      d[i + 3] = a;
    }
  }
  t.putImageData(data, 0, 0);
  return tmp;
}

function drawWordmark(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  height: number,
  theme: MediaTheme,
) {
  if (logo) {
    const rgb: [number, number, number] =
      theme.id === "official" ? [223, 216, 208] : [244, 242, 250];
    const tinted = tintLogo(logo, height, rgb);
    ctx.drawImage(tinted, x, y);
    return tinted.width;
  }
  // Fallback serif lockup
  ctx.fillStyle = theme.fg;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `500 ${Math.round(height * 0.72)}px Georgia, "Times New Roman", serif`;
  ctx.fillText("Prisma", x, y + height / 2);
  const baseW = ctx.measureText("Prisma").width;
  ctx.font = `400 ${Math.round(height * 0.42)}px Georgia, "Times New Roman", serif`;
  ctx.fillText("(x)", x + baseW + 2, y + height * 0.28);
  return baseW + Math.round(height * 0.55);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawCoverPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, radius);
  ctx.stroke();
  ctx.restore();
}

const cutoutCache = new Map<string, HTMLCanvasElement>();

/** Knock out near-black studio pixels so the robot floats with no background. */
function robotCutout(img: HTMLImageElement, cacheKey: string): HTMLCanvasElement {
  const hit = cutoutCache.get(cacheKey);
  if (hit) return hit;

  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  const t = c.getContext("2d");
  if (!t) return c;
  t.drawImage(img, 0, 0);
  const data = t.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]!;
    const g = d[i + 1]!;
    const b = d[i + 2]!;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // Studio / charcoal plate — keep metal & red accents
    if (max < 42 && max - min < 14) {
      d[i + 3] = 0;
    }
  }
  t.putImageData(data, 0, 0);
  cutoutCache.set(cacheKey, c);
  return c;
}

/** Draw robot (or image) fitted in a box — no plate / no frame fill. */
function drawContainPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  _radius: number,
  pad = 12,
  opts?: { cutout?: boolean; cacheKey?: string },
) {
  const source =
    opts?.cutout && opts.cacheKey ? robotCutout(img, opts.cacheKey) : img;
  const iw = Math.max(1, w - pad * 2);
  const ih = Math.max(1, h - pad * 2);
  const sw = source.width;
  const sh = source.height;
  const scale = Math.min(iw / sw, ih / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(source, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

type RenderAssets = {
  robotImg: HTMLImageElement | null;
  photo: HTMLImageElement | null;
  logoImg: HTMLImageElement | null;
  robot: (typeof robotArt)[string];
};

function titleFont(theme: MediaTheme, size: number) {
  return theme.id === "official"
    ? `500 ${size}px Georgia, "Times New Roman", serif`
    : `600 ${size}px "Space Grotesk", system-ui, sans-serif`;
}

function handleOf(draft: MediaDraft) {
  const raw = draft.handle?.trim();
  if (!raw) return "@prismaxai";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function drawPillBadge(
  ctx: CanvasRenderingContext2D,
  theme: MediaTheme,
  text: string,
  x: number,
  y: number,
  h: number,
) {
  ctx.font = `600 ${Math.round(h * 0.55)}px "IBM Plex Mono", ui-monospace, monospace`;
  const tw = ctx.measureText(text).width + h * 1.1;
  ctx.fillStyle = theme.id === "official" ? "rgba(32,32,32,0.88)" : "rgba(20,16,34,0.9)";
  roundRect(ctx, x, y, tw, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = theme.id === "official" ? "rgba(223,216,208,0.4)" : "rgba(180,140,255,0.45)";
  ctx.lineWidth = 1.2;
  roundRect(ctx, x, y, tw, h, h / 2);
  ctx.stroke();
  ctx.fillStyle = theme.accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + tw / 2, y + h / 2);
  return tw;
}

function drawFramedPhoto(
  ctx: CanvasRenderingContext2D,
  theme: MediaTheme,
  photo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const inset = Math.round(Math.min(w, h) * 0.035);
  ctx.fillStyle = theme.panel;
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle =
    theme.id === "official" ? "rgba(223,216,208,0.22)" : "rgba(180,140,255,0.28)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 16);
  ctx.stroke();
  drawCoverPhoto(ctx, photo, x + inset, y + inset, w - inset * 2, h - inset * 2, 12);
}

/** 1 · Spotlight — magazine: copy + robot left, tall portrait right */
function layoutSpotlight(
  ctx: CanvasRenderingContext2D,
  draft: MediaDraft,
  theme: MediaTheme,
  w: number,
  h: number,
  assets: RenderAssets,
) {
  const { robotImg, photo, logoImg, robot } = assets;
  const pad = Math.round(h * 0.07);
  const gap = Math.round(w * 0.04);
  const logoH = Math.round(h * 0.046);
  const mediaW = Math.round(w * 0.4);
  const mediaH = h - pad * 2;
  const mediaX = w - pad - mediaW;
  const mediaY = pad;
  const leftW = mediaX - pad - gap;
  const leftX = pad;
  const footY = h - pad;

  drawWordmark(ctx, logoImg, leftX, pad, logoH, theme);

  if (photo) {
    drawFramedPhoto(ctx, theme, photo, mediaX, mediaY, mediaW, mediaH);
  } else if (robotImg) {
    drawContainPhoto(
      ctx,
      robotImg,
      mediaX + 20,
      mediaY + 30,
      mediaW - 40,
      mediaH - 60,
      12,
      4,
      { cutout: true, cacheKey: draft.robotId },
    );
  }

  const badge = (draft.badge || "SPOTLIGHT").toUpperCase();
  drawPillBadge(
    ctx,
    theme,
    badge,
    mediaX + mediaW - Math.round(h * 0.22),
    mediaY + 14,
    Math.round(h * 0.048),
  );

  const titleSize = Math.round(h * 0.052);
  const headerY = pad + logoH + Math.round(h * 0.04);
  ctx.fillStyle = theme.fg;
  ctx.font = titleFont(theme, titleSize);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const tLH = Math.round(titleSize * 1.14);
  const tLines = wrapText(ctx, draft.title || "PrismaX", leftX, headerY, leftW, tLH, 3);
  const subY = headerY + tLines * tLH + Math.round(h * 0.02);
  const subSize = Math.round(h * 0.028);
  ctx.fillStyle = theme.muted;
  ctx.font = `400 ${subSize}px Inter, system-ui, sans-serif`;
  const sLH = Math.round(subSize * 1.3);
  const sLines = wrapText(ctx, draft.subtitle || "", leftX, subY, leftW, sLH, 2);

  if (photo && robotImg) {
    const bandTop = subY + sLines * sLH + Math.round(h * 0.045);
    const bandBot = footY - Math.round(h * 0.11);
    const robotH = Math.min(bandBot - bandTop, Math.round(h * 0.36));
    const robotW = Math.min(leftW * 0.75, Math.round(robotH * 1.05));
    const robotY = bandTop + Math.round((bandBot - bandTop - robotH) / 2);
    drawContainPhoto(ctx, robotImg, leftX, robotY, robotW, robotH, 12, 2, {
      cutout: true,
      cacheKey: draft.robotId,
    });
    ctx.fillStyle = theme.muted;
    ctx.font = `500 ${Math.round(h * 0.02)}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";
    ctx.fillText(`${robot.label} · ${robot.maker}`, leftX, robotY + robotH + 8);
  }

  ctx.fillStyle = theme.accent;
  ctx.font = `500 ${Math.round(h * 0.026)}px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(handleOf(draft), leftX, footY - Math.round(h * 0.032));
  ctx.fillStyle = theme.muted;
  ctx.font = `400 ${Math.round(h * 0.02)}px Inter, system-ui, sans-serif`;
  ctx.fillText("Operate robots. Generate data. Train better AI.", leftX, footY);
}

/** 2 · Teleop — cinematic: photo stage on top, control bar + robot below */
function layoutTeleop(
  ctx: CanvasRenderingContext2D,
  draft: MediaDraft,
  theme: MediaTheme,
  w: number,
  h: number,
  assets: RenderAssets,
) {
  const { robotImg, photo, logoImg, robot } = assets;
  const pad = Math.round(h * 0.055);
  const barH = Math.round(h * 0.32);
  const stageH = h - barH;
  const logoH = Math.round(h * 0.042);

  // Stage
  if (photo) {
    drawCoverPhoto(ctx, photo, 0, 0, w, stageH, 0);
    const veil = ctx.createLinearGradient(0, stageH * 0.35, 0, stageH);
    veil.addColorStop(0, "transparent");
    veil.addColorStop(1, theme.bg);
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, w, stageH);
  } else {
    ctx.fillStyle = theme.bg2;
    ctx.fillRect(0, 0, w, stageH);
    if (robotImg) {
      drawContainPhoto(
        ctx,
        robotImg,
        w * 0.55,
        stageH * 0.08,
        w * 0.4,
        stageH * 0.85,
        12,
        8,
        { cutout: true, cacheKey: draft.robotId },
      );
    }
  }

  // Control bar
  ctx.fillStyle = theme.id === "official" ? "#1a1816" : "#0c0a14";
  ctx.fillRect(0, stageH, w, barH);
  ctx.strokeStyle =
    theme.id === "official" ? "rgba(223,216,208,0.15)" : "rgba(180,140,255,0.2)";
  ctx.beginPath();
  ctx.moveTo(0, stageH);
  ctx.lineTo(w, stageH);
  ctx.stroke();

  drawWordmark(ctx, logoImg, pad, stageH + Math.round(barH * 0.14), logoH, theme);
  drawPillBadge(
    ctx,
    theme,
    (draft.badge || "TELEOP").toUpperCase(),
    w - pad - Math.round(h * 0.2),
    stageH + Math.round(barH * 0.14),
    Math.round(h * 0.045),
  );

  const copyX = pad;
  const copyW = robotImg ? w * 0.55 : w - pad * 2;
  const titleSize = Math.round(h * 0.048);
  ctx.fillStyle = theme.fg;
  ctx.font = titleFont(theme, titleSize);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const titleY = stageH + Math.round(barH * 0.38);
  wrapText(ctx, draft.title || "Teleop", copyX, titleY, copyW, Math.round(titleSize * 1.12), 2);
  ctx.fillStyle = theme.muted;
  ctx.font = `400 ${Math.round(h * 0.024)}px Inter, system-ui, sans-serif`;
  ctx.fillText(draft.subtitle || "", copyX, titleY + Math.round(titleSize * 1.25));
  ctx.fillStyle = theme.accent;
  ctx.font = `500 ${Math.round(h * 0.022)}px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.fillText(
    `${handleOf(draft)}  ·  ${robot.label}`,
    copyX,
    h - pad - 4,
  );

  if (robotImg && photo) {
    const rw = Math.round(barH * 1.15);
    const rh = Math.round(barH * 0.85);
    drawContainPhoto(
      ctx,
      robotImg,
      w - pad - rw,
      stageH + Math.round((barH - rh) / 2),
      rw,
      rh,
      12,
      2,
      { cutout: true, cacheKey: draft.robotId },
    );
  }
}

/** 3 · Validation — score checklist left, hero robot right */
function layoutValidation(
  ctx: CanvasRenderingContext2D,
  draft: MediaDraft,
  theme: MediaTheme,
  w: number,
  h: number,
  assets: RenderAssets,
) {
  const { robotImg, logoImg, robot } = assets;
  const pad = Math.round(h * 0.07);
  const logoH = Math.round(h * 0.046);
  const leftW = Math.round(w * 0.48);
  const rightX = pad + leftW + Math.round(w * 0.03);

  drawWordmark(ctx, logoImg, pad, pad, logoH, theme);
  drawPillBadge(
    ctx,
    theme,
    (draft.badge || "VALIDATION").toUpperCase(),
    pad,
    pad + logoH + 14,
    Math.round(h * 0.045),
  );

  const titleY = pad + logoH + Math.round(h * 0.1);
  const titleSize = Math.round(h * 0.05);
  ctx.fillStyle = theme.fg;
  ctx.font = titleFont(theme, titleSize);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const tLH = Math.round(titleSize * 1.14);
  const tLines = wrapText(ctx, draft.title || "Verify Quality", pad, titleY, leftW, tLH, 3);
  ctx.fillStyle = theme.muted;
  ctx.font = `400 ${Math.round(h * 0.026)}px Inter, system-ui, sans-serif`;
  ctx.fillText(
    draft.subtitle || "",
    pad,
    titleY + tLines * tLH + Math.round(h * 0.02),
  );

  const checks = [
    { label: "Camera sync", ok: true },
    { label: "MCAP integrity", ok: true },
    { label: "Primary views", ok: true },
  ];
  const listY = titleY + tLines * tLH + Math.round(h * 0.12);
  const rowH = Math.round(h * 0.08);
  checks.forEach((c, i) => {
    const y = listY + i * (rowH + 10);
    ctx.fillStyle = theme.panel;
    roundRect(ctx, pad, y, leftW * 0.92, rowH, 12);
    ctx.fill();
    ctx.fillStyle = c.ok ? "#8fd9b0" : "#ff8a8a";
    ctx.beginPath();
    ctx.arc(pad + 22, y + rowH / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = theme.fg;
    ctx.font = `500 ${Math.round(h * 0.028)}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(c.label, pad + 42, y + rowH / 2);
    ctx.fillStyle = theme.muted;
    ctx.font = `500 ${Math.round(h * 0.02)}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textAlign = "right";
    ctx.fillText(c.ok ? "PASS" : "FAIL", pad + leftW * 0.92 - 16, y + rowH / 2);
  });

  if (robotImg) {
    const rw = w - rightX - pad;
    const rh = h - pad * 2 - Math.round(h * 0.08);
    drawContainPhoto(ctx, robotImg, rightX, pad + Math.round(h * 0.04), rw, rh, 12, 4, {
      cutout: true,
      cacheKey: draft.robotId,
    });
    ctx.fillStyle = theme.muted;
    ctx.font = `500 ${Math.round(h * 0.02)}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`${robot.label} · ${robot.maker}`, rightX + rw / 2, h - pad);
  }

  ctx.fillStyle = theme.accent;
  ctx.font = `500 ${Math.round(h * 0.022)}px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.textAlign = "left";
  ctx.fillText(handleOf(draft), pad, h - pad);
}

/** 4 · Robot card — fleet product hero */
function layoutRobotCard(
  ctx: CanvasRenderingContext2D,
  draft: MediaDraft,
  theme: MediaTheme,
  w: number,
  h: number,
  assets: RenderAssets,
) {
  const { robotImg, logoImg, robot } = assets;
  const pad = Math.round(h * 0.07);
  const logoH = Math.round(h * 0.046);
  const leftW = Math.round(w * 0.42);

  drawWordmark(ctx, logoImg, pad, pad, logoH, theme);
  drawPillBadge(
    ctx,
    theme,
    (draft.badge || "FLEET").toUpperCase(),
    pad,
    pad + logoH + 16,
    Math.round(h * 0.045),
  );

  // Validated chip
  ctx.fillStyle = "rgba(60,160,90,0.16)";
  roundRect(ctx, pad, pad + logoH + Math.round(h * 0.1), 110, 28, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(120,200,140,0.4)";
  roundRect(ctx, pad, pad + logoH + Math.round(h * 0.1), 110, 28, 14);
  ctx.stroke();
  ctx.fillStyle = "#9ef0b4";
  ctx.font = `600 ${Math.round(h * 0.02)}px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Validated", pad + 55, pad + logoH + Math.round(h * 0.1) + 14);

  const titleY = pad + logoH + Math.round(h * 0.18);
  const titleSize = Math.round(h * 0.055);
  ctx.fillStyle = theme.fg;
  ctx.font = titleFont(theme, titleSize);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const tLH = Math.round(titleSize * 1.12);
  const tLines = wrapText(ctx, robot.label, pad, titleY, leftW, tLH, 2);
  ctx.fillStyle = theme.muted;
  ctx.font = `400 ${Math.round(h * 0.028)}px Inter, system-ui, sans-serif`;
  ctx.fillText(robot.maker, pad, titleY + tLines * tLH + 8);
  ctx.font = `400 ${Math.round(h * 0.024)}px Inter, system-ui, sans-serif`;
  wrapText(
    ctx,
    draft.subtitle || robot.line,
    pad,
    titleY + tLines * tLH + Math.round(h * 0.055),
    leftW,
    Math.round(h * 0.034),
    2,
  );

  let tagX = pad;
  const tagY = h - pad - Math.round(h * 0.14);
  ctx.font = `500 ${Math.round(h * 0.02)}px Inter, system-ui, sans-serif`;
  for (const tag of robot.tags.slice(0, 3)) {
    const tw = ctx.measureText(tag).width + 24;
    if (tagX + tw > pad + leftW) break;
    ctx.strokeStyle =
      theme.id === "official" ? "rgba(223,216,208,0.35)" : "rgba(180,140,255,0.35)";
    ctx.lineWidth = 1.2;
    roundRect(ctx, tagX, tagY, tw, 30, 15);
    ctx.stroke();
    ctx.fillStyle = theme.muted;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(tag, tagX + 12, tagY + 15);
    tagX += tw + 8;
  }

  ctx.fillStyle = theme.accent;
  ctx.font = `500 ${Math.round(h * 0.022)}px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(handleOf(draft), pad, h - pad);

  if (robotImg) {
    const rw = Math.round(w * 0.48);
    const rh = Math.round(h * 0.78);
    drawContainPhoto(
      ctx,
      robotImg,
      w - pad - rw,
      Math.round((h - rh) / 2),
      rw,
      rh,
      12,
      4,
      { cutout: true, cacheKey: draft.robotId },
    );
  }
}

export async function renderMediaCard(
  canvas: HTMLCanvasElement,
  draft: MediaDraft,
): Promise<void> {
  const format = formatOf(draft.format);
  const theme = themeOf(draft.theme);
  const robot = robotArt[draft.robotId] ?? robotArt.piper!;
  const w = format.width;
  const h = format.height;
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = "";
  canvas.style.height = "";
  canvas.style.aspectRatio = `${w} / ${h}`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  await document.fonts.ready;

  const [robotImg, photo, logoImg] = await Promise.all([
    loadImage(robot.src).catch(() => null),
    draft.photoUrl ? loadImage(draft.photoUrl).catch(() => null) : Promise.resolve(null),
    loadImage(PRISMAX_LOGO_SRC).catch(() => null),
  ]);

  drawAtmosphere(ctx, w, h, theme);

  const assets: RenderAssets = { robotImg, photo, logoImg, robot };

  if (draft.template === "teleop") layoutTeleop(ctx, draft, theme, w, h, assets);
  else if (draft.template === "validation") layoutValidation(ctx, draft, theme, w, h, assets);
  else if (draft.template === "robot-card") layoutRobotCard(ctx, draft, theme, w, h, assets);
  else layoutSpotlight(ctx, draft, theme, w, h, assets);
}

export function buildCaption(draft: MediaDraft): string {
  const robot = robotArt[draft.robotId]?.label ?? "robot";
  const handle = draft.handle?.trim()
    ? draft.handle.startsWith("@")
      ? draft.handle
      : `@${draft.handle}`
    : "";
  const who = handle ? ` ${handle}` : "";
  const lines = [
    `${draft.title}${who}`,
    draft.subtitle,
    "",
    `Setup: ${robot} · ${draft.badge || "PrismaX"}`,
    "",
    "Operate robots. Generate data. Train better AI.",
    "#PrismaX #PhysicalAI #Teleop",
  ];
  return lines.filter((l, i) => l !== "" || i === 2).join("\n");
}

export function defaultDraft(): MediaDraft {
  const t = mediaTemplates[0]!;
  return {
    template: t.id,
    format: "x-landscape",
    theme: "official",
    robotId: "piper",
    title: t.defaults.title ?? "PrismaX",
    subtitle: t.defaults.subtitle ?? "",
    handle: "",
    badge: t.defaults.badge ?? "PRISMAX",
    photoUrl: null,
  };
}
