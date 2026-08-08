export type RobotSpec = {
  id: string;
  name: string;
  maker: string;
  tagline: string;
  image: string;
  tags: string[];
  /** PrismaX fleet package price (USD) from app.prismax.ai/data/fleet */
  priceUsd: number;
  priceNote: string;
  /** Est. operator earnings shown on fleet cards */
  earningsNote: string;
  dofLabel: string;
  dofValue: number;
  payloadKg: number;
  payloadNote: string;
  reachMm: number;
  weightKg: number;
  formFactor: string;
  /** Estimated productive teleop episodes / hour (community planning figure) */
  episodesPerHour: number;
  /**
   * Relative PrismaX reward throughput vs a single-arm tabletop baseline (1.0).
   * Used only for payback estimates — not an official PrismaX rate.
   */
  rewardThroughput: number;
  setup: "Low" | "Medium" | "High";
  bestFor: string;
  sources: { label: string; url: string }[];
};

/**
 * Validated PrismaX Robot Fleet — prices & copy from https://app.prismax.ai/data/fleet
 * Spec detail still cross-checked with maker pages where available.
 */
export const robotSpecs: RobotSpec[] = [
  {
    id: "piper",
    name: "PiPER",
    maker: "Agilex Robotics",
    tagline: "Lightweight single-arm platform — validated for PrismaX collection runs.",
    image: "/media/robots/piper.png",
    tags: ["Lightweight and Stable Payload", "Precision Control", "Open Source Support"],
    priceUsd: 22000,
    priceNote: "PrismaX fleet package — includes setup & onboarding (app.prismax.ai/data/fleet).",
    earningsNote: "~$1,200/wk est. operator earnings",
    dofLabel: "6 DOF",
    dofValue: 6,
    payloadKg: 1.5,
    payloadNote: "Rated payload; PiPER-H variant offers 2 kg.",
    reachMm: 626,
    weightKg: 4.2,
    formFactor: "Single arm · desktop",
    episodesPerHour: 16,
    rewardThroughput: 1,
    setup: "Low",
    bestFor: "New operators / labs wanting an entry validated fleet kit.",
    sources: [
      { label: "PrismaX Robot Fleet", url: "https://app.prismax.ai/data/fleet" },
      { label: "Agilex PiPER", url: "https://global.agilex.ai/products/piper" },
    ],
  },
  {
    id: "tok2",
    name: "TOK2",
    maker: "Airbot",
    tagline: "Highly integrated multi-arm kit — ultra lightweight validated platform.",
    image: "/media/robots/tok2.png",
    tags: ["Ultra Affordable", "Ultra Lightweight", "Highly Integrated Platform"],
    priceUsd: 23000,
    priceNote: "PrismaX fleet package — includes setup & onboarding (app.prismax.ai/data/fleet).",
    earningsNote: "~$1,200/wk est. operator earnings",
    dofLabel: "Multi-arm",
    dofValue: 12,
    payloadKg: 1.5,
    payloadNote: "Per AIRBOT Play arm (rated 1.5 kg; max up to 3.5 kg).",
    reachMm: 647,
    weightKg: 3.78,
    formFactor: "Multi-arm · integrated kit",
    episodesPerHour: 24,
    rewardThroughput: 1.55,
    setup: "High",
    bestFor: "Guilds / labs that need multi-arm data richness.",
    sources: [
      { label: "PrismaX Robot Fleet", url: "https://app.prismax.ai/data/fleet" },
      {
        label: "AIRBOT Play specs",
        url: "https://docs.airbots.online/en/airbot-play/quick-start/overview.html",
      },
    ],
  },
  {
    id: "yam",
    name: "YAM",
    maker: "I2RT Robotics",
    tagline: "Precision meets power in a compact CNC-machined form.",
    image: "/media/robots/yam.png",
    tags: [
      "Precision Meets Power in a Compact Form",
      "Engineered for Longevity",
      "CNC-Machined for Performance",
    ],
    priceUsd: 25000,
    priceNote: "PrismaX fleet package — includes setup & onboarding (app.prismax.ai/data/fleet).",
    earningsNote: "~$1,200/wk est. operator earnings",
    dofLabel: "6 DOF+",
    dofValue: 6,
    payloadKg: 2,
    payloadNote: "Nominal payload; Pro/Ultra go to 3–4 kg.",
    reachMm: 750,
    weightKg: 4.68,
    formFactor: "Multi-arm · wheeled rig",
    episodesPerHour: 15,
    rewardThroughput: 1.1,
    setup: "Medium",
    bestFor: "Setups that need higher durability and precision.",
    sources: [
      { label: "PrismaX Robot Fleet", url: "https://app.prismax.ai/data/fleet" },
      { label: "I2RT YAM", url: "https://i2rt.com/products/yam-6-dof-arm" },
    ],
  },
];

/** Planning defaults aligned to fleet ~$1,200/wk (~$171/day at 7d, or ~$240/day at 5d). */
export const roiDefaults = {
  hoursPerDay: 4,
  /** USD-equivalent value of an hour of accepted collection (proxy for reward points). */
  rewardUsdPerHour: 60,
  daysPerWeek: 5,
};

export function estimatePaybackDays(
  robot: RobotSpec,
  hoursPerDay: number,
  rewardUsdPerHour: number,
  daysPerWeek = 5,
): number {
  const daily = hoursPerDay * rewardUsdPerHour * robot.rewardThroughput;
  if (daily <= 0) return Infinity;
  const calendarDays = robot.priceUsd / daily;
  // Spread across operating days/week for a more realistic calendar estimate
  return calendarDays * (7 / Math.max(1, daysPerWeek));
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDays(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n < 14) return `${n.toFixed(1)} days`;
  if (n < 90) return `${(n / 7).toFixed(1)} weeks`;
  return `${(n / 30).toFixed(1)} months`;
}
