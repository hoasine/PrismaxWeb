export const siteNav = [
  { id: "vinh-danh", label: "Hall of Honor" },
  { id: "spec-roi", label: "Spec & ROI" },
  { id: "mcap-preview", label: "MCAP Preview" },
  { id: "media-studio", label: "Media Studio" },
] as const;

export type SiteNavId = (typeof siteNav)[number]["id"];

export const DEFAULT_SITE_NAV: SiteNavId = "vinh-danh";

/** Honor track hashes still map into the Hall of Honor panel */
export const HONOR_TRACK_IDS = [
  "validation",
  "progression",
  "outstanding",
  "teleop",
] as const;

export function resolveSiteNavId(hash: string): SiteNavId {
  if (siteNav.some((item) => item.id === hash)) {
    return hash as SiteNavId;
  }
  if ((HONOR_TRACK_IDS as readonly string[]).includes(hash)) {
    return "vinh-danh";
  }
  return DEFAULT_SITE_NAV;
}

export const toolSections = [
  {
    id: "spec-roi" as const,
    eyebrow: "Robot decision desk",
    title: "Spec & ROI",
    description:
      "Compare Piper (Agilex), TOK2 (Airbot), and YAM (I2RT) by price, degrees of freedom, payload, data collection rate per hour, and estimated payback based on reward points.",
    bullets: [
      "Side-by-side specs for the three common robots",
      "Payback calculator using reward-point proxies",
      "Useful for newcomers evaluating a robot purchase",
    ],
  },
  {
    id: "mcap-preview" as const,
    eyebrow: "Upload readiness",
    title: "MCAP Preview",
    description:
      "Local in-browser tool to preview MCAP + video before upload — check format, frame rate, and video/sensor sync to reduce Verify Quality rejections.",
    bullets: [
      "Client-side @mcap — files never leave your device",
      "Catch format, naming, and sync issues early",
      "Built for real operator pipelines",
    ],
  },
  {
    id: "media-studio" as const,
    eyebrow: "Community creatives",
    title: "Media Studio",
    description:
      "Auto-compose PrismaX-branded images with default logos and fleet robots — fast Teleop / Validation content with a consistent look.",
    bullets: [
      "Canvas studio · Official kit / Hall theme",
      "PiPER · YAM · TOK2 + PNG export",
      "Caption drafts ready for X / Discord",
    ],
  },
] as const;
