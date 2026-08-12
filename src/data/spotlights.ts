export type SpotlightEntry = {
  author: string;
  handle: string;
  url: string;
};

export type RoleCount = {
  role: string;
  count: number;
};

export type HonorCycle = {
  id: string;
  dateLabel: string;
  /** Sort key YYYY-MM-DD */
  dateKey: string;
  blurb?: string;
  entries?: SpotlightEntry[];
  /** Progression-specific */
  monthsSinceLaunch?: number;
  groundbreakers?: string[];
  vanguards?: string[];
  navigational?: string[];
  roleCounts?: RoleCount[];
};

export type HonorSection = {
  id: string;
  title: string;
  navLabel: string;
  kind: "progression" | "validation" | "outstanding" | "teleop";
  description: string;
  cycles: HonorCycle[];
};

export const siteCopy = {
  name: "Hall of Honor",
  tagline: "Honoring the people behind the spotlights",
  disclaimer:
    "Unofficial community hall of honor. Not affiliated with PrismaX. Spotlights are curated from public Discord / X announcements. Avatars via public X profile images.",
  heroSupport: "Community spotlights, kept visible — face, name, and the post behind them.",
  contact: {
    xUrl: "https://x.com/HoaTranRom",
    xHandle: "@HoaTranRom",
    discord: "tranduchoa2407",
  },
};

export const rewardRules = [
  "Each month, up to 10 outstanding Teleoperation and Data Validation contributions may be selected.",
  "Selected contributors can receive +1 Role Level Promotion in the PrismaX Progression System.",
  "Role upgrades are typically processed during the mid-month promotion review.",
  "Ambassador recommendations help surface high-quality community content.",
];

/** Public X profiles for the PrismaX team (hero wall). */
export const teamProfiles = [
  {
    name: "PrismaX",
    handle: "@PrismaXai",
    role: "Official",
    url: "https://x.com/PrismaXai",
  },
  {
    name: "Bayley",
    handle: "@castorhat",
    role: "Cofounder / CEO",
    url: "https://x.com/castorhat",
  },
  {
    name: "Vivian",
    handle: "@vivianrobotics",
    role: "Marketing Ops Lead",
    url: "https://x.com/vivianrobotics",
  },
  {
    name: "Shaye",
    handle: "@shayebackus",
    role: "Head of Growth",
    url: "https://x.com/shayebackus",
  },
  {
    name: "Max CC",
    handle: "@MaxC16134",
    role: "Team",
    url: "https://x.com/MaxC16134",
  },
] as const;

export const honorSections: HonorSection[] = [
  {
    id: "validation",
    title: "Data Validation Day Highlights",
    navLabel: "Validation",
    kind: "validation",
    description:
      "Creators recognized for educational and creative content around Verify Quality and data standards.",
    cycles: [
      {
        id: "val-2026-08-11",
        dateLabel: "11/08/2026",
        dateKey: "2026-08-11",
        blurb: "Data Validation Day highlights from the latest recognition cycle.",
        entries: [
          {
            author: "kabuda",
            handle: "@kabuda112821",
            url: "https://x.com/kabuda112821/status/2085207283689308367",
          },
          {
            author: "Zephy",
            handle: "@__Zephhy",
            url: "https://x.com/__Zephhy/status/2085638287138685097",
          },
          {
            author: "0x_Elfawzan",
            handle: "@ox_elfawzan",
            url: "https://x.com/ox_elfawzan/status/2084391732314325004",
          },
          {
            author: "jajalabsu Gooner #6 PrismaX",
            handle: "@dapretty_taurus",
            url: "https://x.com/dapretty_taurus/status/2086047749389320229",
          },
          {
            author: "RomRom",
            handle: "@HoaTranRom",
            url: "https://x.com/HoaTranRom/status/2085313452609061040",
          },
        ],
      },
      {
        id: "val-2026-08-04",
        dateLabel: "04/08/2026",
        dateKey: "2026-08-04",
        blurb: "Data Validation Day highlights from the previous recognition cycle.",
        entries: [
          {
            author: "Aysho-M",
            handle: "@aysho_M",
            url: "https://x.com/aysho_M/status/2082941622703296747",
          },
          {
            author: "Dungenmaster",
            handle: "@Dungenmaster8",
            url: "https://x.com/Dungenmaster8/status/2082532481274691717",
          },
          {
            author: "Big legend",
            handle: "@Biglegend008",
            url: "https://x.com/Biglegend008/status/2082000694760849433",
          },
          {
            author: "Betta",
            handle: "@zeynabdamilola",
            url: "https://x.com/zeynabdamilola/status/2082376008292810879",
          },
          {
            author: "Dibbyte",
            handle: "@dibbyte",
            url: "https://x.com/dibbyte/status/2081642004220440868",
          },
        ],
      },
      {
        id: "val-2026-07-27",
        dateLabel: "27/07/2026",
        dateKey: "2026-07-27",
        blurb: "Earlier Data Validation Day recognition cycle.",
        entries: [
          {
            author: "Borsch",
            handle: "@borsch737",
            url: "https://x.com/borsch737/status/2074806011592839633",
          },
          {
            author: "Füga",
            handle: "@Fuugaa01",
            url: "https://x.com/Fuugaa01/status/2079124122676646275",
          },
          {
            author: "kabuda",
            handle: "@kabuda112821",
            url: "https://x.com/kabuda112821/status/2079567463117676823",
          },
          {
            author: "Skylar",
            handle: "@skylarx999",
            url: "https://x.com/skylarx999/status/2079793298353643976",
          },
          {
            author: "AureliaX",
            handle: "@0xAurix",
            url: "https://x.com/0xAurix/status/2079914565501100346",
          },
        ],
      },
    ],
  },
  {
    id: "progression",
    title: "Progression Highlights",
    navLabel: "Progression",
    kind: "progression",
    description:
      "Monthly shoutouts for Groundbreakers, Vanguards, and the growing Progression System.",
    cycles: [
      {
        id: "prog-2026-07-31",
        dateLabel: "31/07/2026",
        dateKey: "2026-07-31",
        monthsSinceLaunch: 12,
        blurb:
          "It's been 12 months since we launched the Progression System. Special shoutout to those consistently leading the community forward.",
        groundbreakers: [
          "umpia",
          "DON",
          "CHRIS",
          "DumbDegen",
          "Nickhil",
          "DUMS GOONER #9 | PH Vanguard",
          "Ayush",
          "Bili Dz 24/7",
          "Tamara901",
          "KimoOnchain",
          "MiLion || GOONER #2",
          "l0nw0lf",
          "Catto_18",
          "Retinz",
          "I'm Himu",
          "MOSTFA",
          "CryBaby",
          "Skylar",
          "Monk Tanvir",
          "GTA",
          "EZYYYY.S101M",
          "FAHD | EG Vanguard",
          "Jason",
          "Who Am i | PrismaX",
          "tunct",
          "KingOPw3",
          "Lion7240",
          "Castro",
          "Dibbyte",
          "Julz",
          "Phazy",
          "Musty",
          "MEHEDI",
          "ASHIQ",
          "DZ",
          "Ed the X",
          "Gerie",
          "Nem",
          "DismaD",
          "MarniHihaho | UA Vanguard",
          "AltmaX | IN Vanguard",
          "_bugdog",
          "Yukihiro || GOONER #12",
          "Rizal",
        ],
        roleCounts: [
          { role: "Navigational", count: 164 },
          { role: "Stabilized", count: 68 },
          { role: "Exploratory", count: 71 },
          { role: "Proactive", count: 150 },
          { role: "Assistive", count: 221 },
          { role: "Reactive", count: 295 },
        ],
      },
      {
        id: "prog-2026-06-30",
        dateLabel: "30/06/2026",
        dateKey: "2026-06-30",
        monthsSinceLaunch: 11,
        blurb:
          "It's been 11 months since we launched the Progression System. Special shoutout to PrismaX Vanguards and Groundbreakers.",
        vanguards: [
          "Shirini | IR Vanguard",
          "0x处长Jason | CN Vanguard",
          "DUMS GOONER #9 | PH Vanguard",
          "Idara | NG Vanguard",
          "FAHD | EG Vanguard",
          "Ryzzu | ID Vanguard",
          "VERSUS/RU VANGUARD",
          "SHIFU | BD Vanguard",
          "Sarcastic | PK Vanguard",
          "MarniHihaho | UA Vanguard",
          "Johnny | VN Vanguard",
          "Flippedface | TH Vanguard",
          "AltmaX | IN Vanguard",
          "Biggbossforeig | TR Vanguard",
        ],
        groundbreakers: [
          "umpia",
          "Nickhil",
          "DUMS GOONER #9 | PH Vanguard",
          "Ayush",
          "Bili Dz 24/7",
          "Tamara901",
          "Catto_18",
          "Retinz",
          "I'm Himu",
          "CryBaby",
          "Skylar",
          "EZYYYY.S101M",
          "FAHD | EG Vanguard",
          "KingOPw3",
          "Castro",
          "Julz",
          "Phazy",
          "Musty",
          "MEHEDI",
          "ASHIQ",
          "Ed the X",
          "Gerie",
          "Nem",
          "C-rizzmaX",
          "DismaD",
          "MarniHihaho | UA Vanguard",
          "AltmaX | IN Vanguard",
          "_bugdog",
        ],
        roleCounts: [
          { role: "Navigational", count: 118 },
          { role: "Stabilized", count: 91 },
          { role: "Exploratory", count: 64 },
          { role: "Proactive", count: 107 },
          { role: "Assistive", count: 175 },
          { role: "Reactive", count: 322 },
        ],
      },
      {
        id: "prog-2026-05-30",
        dateLabel: "30/05/2026",
        dateKey: "2026-05-30",
        monthsSinceLaunch: 10,
        blurb:
          "It's been 10 months since we launched the Progression System. Special shoutout to Groundbreakers and Navigational leaders.",
        groundbreakers: [
          "FAHD | EG Vanguard",
          "Ed the X",
          "Gerie",
          "Nem",
          "C-rizzmaX",
          "DismaD",
          "MarniHihaho | UA Vanguard",
          "_bugdog",
          "AltmaX | IN Vanguard",
        ],
        navigational: [
          "LILCRUISE",
          "umpia",
          "SAM_WOLF",
          "Creed",
          "ZaMarti",
          "DON",
          "Heyve",
          "Ekko",
          "Azittt90",
          "CHRIS",
          "Sun",
          "YongkiargaX",
          "Habibios",
          "kastew",
          "DumbDegen",
          "mrflmnlNFT",
          "CRX_ROLLINS",
          "Nickhil",
          "Nusrat sathi",
          "KIKY",
          "Yatin",
          "MD RIFAT",
          "axaxaxixii",
          "DUMS GOONER #9 | PH Vanguard",
          "Byakuya",
          "Ayush",
          "Betta",
          "Bili Dz 24/7",
          "Tamara901",
          "KimoOnchain",
          "MiLion || GOONER #2",
          "Fenrir",
          "Steve",
          "Rana",
          "Shuaib Isiaq",
          "l0nw0lf",
          "Catto_18",
          "NDU",
          "Retinz",
          "Vocalcrypt",
          "katty_22",
          "Syntax",
          "Idara | NG Vanguard",
          "abozmahhh",
          "SMILY",
          "Sakib001",
          "ELMONTA",
          "I'm Himu",
          "MOSTFA",
          "Hedgy",
          "Jahid",
          "TOFI",
          "ADELKHATER",
          "CryBaby",
          "Skylar",
          "Monk Tanvir",
          "EZYYYY.S101M",
          "KitesuuX",
          "Mubarak Ali",
          "Ryzzu | ID Vanguard",
          "Aysho-M",
          "Who Am i | PrismaX",
          "tunct",
          "KingOPw3",
          "Boypriest",
          "Crypto PIDGIN",
          "Lion7240",
          "Big legend",
          "Castro",
          "Lip | Innovator",
          "Dibbyte",
          "Julz",
          "Phazy",
          "Just_wadde",
          "gabi",
          "Borsch",
          "Musty",
          "mary",
          "VERSUS/RU VANGUARD",
          "Mitsu",
          "Frankky",
          "pusel",
          "MEHEDI",
          "nantii",
          "kinndao",
          "SeaFullOfStars",
          "Crypto Father",
          "ASHIQ",
          "SHIFU | BD Vanguard",
          "Sarcastic | PK Vanguard",
          "Ferran",
          "DZ",
          "Fayrel",
          "Malinois",
          "nongwaan",
          "kency",
          "anf1m",
          "Helium X",
          "Dat lee",
          "Johnny | VN Vanguard",
          "zhamin",
          "Flippedface | TH Vanguard",
          "Yukihiro || GOONER #12",
          "Biggbossforeig | TR Vanguard",
          "Rizal",
        ],
        roleCounts: [
          { role: "Stabilized", count: 78 },
          { role: "Exploratory", count: 78 },
          { role: "Proactive", count: 86 },
          { role: "Assistive", count: 122 },
          { role: "Reactive", count: 259 },
        ],
      },
    ],
  },
  {
    id: "outstanding",
    title: "Outstanding Contributors",
    navLabel: "Outstanding",
    kind: "outstanding",
    description:
      "Top contributors from the Verify Quality Launch Content Competition and related awards.",
    cycles: [
      {
        id: "out-2026-07-28",
        dateLabel: "28/07/2026",
        dateKey: "2026-07-28",
        blurb:
          "Verify Quality Launch Content Spotlight — outstanding contributors recognized with +1 Role Upgrade.",
        entries: [
          {
            author: "Steve",
            handle: "@Steve",
            url: "https://x.com/i/status/2077933378322547131",
          },
          {
            author: "Shuaib Isiaq",
            handle: "@agakious2",
            url: "https://x.com/agakious2/status/2077712564272685225",
          },
          {
            author: "Shoupe",
            handle: "@eam__sha",
            url: "https://x.com/eam__sha/status/2077524822393753609",
          },
          {
            author: "Mubarak Ali",
            handle: "@Mubarak97100",
            url: "https://x.com/Mubarak97100/status/2078086459190563093",
          },
          {
            author: "Rira",
            handle: "@rira20233",
            url: "https://x.com/rira20233/status/2077676402816536614",
          },
        ],
      },
    ],
  },
  {
    id: "teleop",
    title: "Teleoperation Day Highlights",
    navLabel: "Teleoperation",
    kind: "teleop",
    description:
      "Operators and creators highlighted for strong Teleoperation Day content.",
    cycles: [
      {
        id: "tele-2026-08-11",
        dateLabel: "11/08/2026",
        dateKey: "2026-08-11",
        blurb: "Latest Teleoperation Day highlights.",
        entries: [
          {
            author: "Cao Thần Quang",
            handle: "@caothanquang369",
            url: "https://x.com/caothanquang369/status/2085738336870887921",
          },
          {
            author: "GTA",
            handle: "@PawanKumar67103",
            url: "https://x.com/PawanKumar67103/status/2084507459688047038",
          },
          {
            author: "Bili Dz 24/7",
            handle: "@Bili_6_",
            url: "https://x.com/Bili_6_/status/2085668706391064693",
          },
          {
            author: "KingOPw3",
            handle: "@kingop0007",
            url: "https://x.com/kingop0007/status/2084536639813034203",
          },
          {
            author: "Alishka",
            handle: "@alishka_kr",
            url: "https://x.com/alishka_kr/status/2085417477102518456",
          },
        ],
      },
      {
        id: "tele-2026-08-04",
        dateLabel: "04/08/2026",
        dateKey: "2026-08-04",
        blurb: "Teleoperation Day highlights from the previous cycle.",
        entries: [
          {
            author: "Ravondir",
            handle: "@Ravondir",
            url: "https://x.com/Ravondir/status/2082488513237254362",
          },
          {
            author: "Dukesznn",
            handle: "@Rufus_szn",
            url: "https://x.com/Rufus_szn/status/2083439268634980401",
          },
          {
            author: "JohnNguyen",
            handle: "@ThuyTrang108",
            url: "https://x.com/ThuyTrang108/status/2084098175431061541",
          },
          {
            author: "ADITYA",
            handle: "@AdiS566",
            url: "https://x.com/AdiS566/status/2081384934158250133",
          },
          {
            author: "Kippo.G",
            handle: "@0x_kippo",
            url: "https://x.com/0x_kippo/status/2083583666886971551",
          },
        ],
      },
      {
        id: "tele-2026-07-27",
        dateLabel: "27/07/2026",
        dateKey: "2026-07-27",
        blurb: "Teleoperation Day highlights from an earlier cycle.",
        entries: [
          {
            author: "JohnNguyen",
            handle: "@ThuyTrang108",
            url: "https://x.com/ThuyTrang108/status/2081547115734704609",
          },
          {
            author: "KingOPw3",
            handle: "@kingop0007",
            url: "https://x.com/kingop0007/status/2079424874595098950",
          },
          {
            author: "Skylar",
            handle: "@skylarx999",
            url: "https://x.com/skylarx999/status/2080524655052591537",
          },
          {
            author: "Who Am i | PrismaX",
            handle: "@whoami5172",
            url: "https://x.com/whoami5172/status/2080962119118291334",
          },
          {
            author: "Borsch",
            handle: "@borsch737",
            url: "https://x.com/borsch737/status/2079908755643224526",
          },
        ],
      },
    ],
  }
];

/** Flat list of all X-linked honorees for hero wall / counts */
export function allXEntries() {
  return honorSections.flatMap((section) =>
    section.cycles.flatMap((cycle) =>
      (cycle.entries ?? []).map((entry) => ({
        ...entry,
        sectionId: section.id,
        sectionTitle: section.title,
        kind: section.kind,
        dateLabel: cycle.dateLabel,
        dateKey: cycle.dateKey,
      })),
    ),
  );
}

export const monthlyLeaderboard = allXEntries()
  .filter((e) => e.dateKey >= "2026-08-01")
  .slice(0, 10);
