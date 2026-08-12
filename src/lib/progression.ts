import { allXEntries } from "@/data/spotlights";
import { xUsername } from "@/lib/x";

/** Lowest → highest PrismaX progression tiers (Lv.1 → Lv.N) */
export const ROLE_LEVEL_ORDER = [
  "Reactive",
  "Assistive",
  "Proactive",
  "Exploratory",
  "Stabilized",
  "Navigational",
  "Groundbreaker",
  "PrismaX Vanguard",
] as const;

export type RoleLevel = (typeof ROLE_LEVEL_ORDER)[number];

export function roleLevelNumber(role: RoleLevel): number {
  return ROLE_LEVEL_ORDER.indexOf(role) + 1;
}

export function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/** Map Discord display names → known X handles from curated posts */
export function buildHandleLookup(): Map<string, string> {
  const map = new Map<string, string>();

  const put = (key: string, handle: string) => {
    const n = normalizeName(key);
    if (n) map.set(n, handle);
  };

  for (const entry of allXEntries()) {
    put(entry.author, entry.handle);
    put(entry.handle, entry.handle);
    put(xUsername(entry.handle), entry.handle);
  }

  // Extra aliases seen in Progression shoutouts
  const aliases: [string, string][] = [
    ["Skylar", "@skylarx999"],
    ["Dibbyte", "@dibbyte"],
    ["KingOPw3", "@kingop0007"],
    ["Who Ami PrismaX", "@whoami5172"],
    ["Who Am i PrismaX", "@whoami5172"],
    ["Betta", "@zeynabdamilola"],
    ["AyshoM", "@aysho_M"],
    ["Aysho-M", "@aysho_M"],
    ["Big legend", "@Biglegend008"],
    ["Borsch", "@borsch737"],
    ["Steve", "@Steve"],
    ["Shuaib Isiaq", "@agakious2"],
    ["Mubarak Ali", "@Mubarak97100"],
    ["JohnNguyen", "@ThuyTrang108"],
  ];

  for (const [name, handle] of aliases) put(name, handle);
  return map;
}

export function resolveHandle(
  name: string,
  lookup: Map<string, string>,
): string | null {
  return lookup.get(normalizeName(name)) ?? null;
}
