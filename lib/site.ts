import type { PhotoKey } from "./photos";

export const SITE = {
  name: "Irvan Fahlepi",
  role: "Senior Full-Stack Developer · Interactive",
  email: "mr.vero@usa.com",
  links: {
    portfolio: "https://irvan-works.vercel.app/",
    linkedin: "https://www.linkedin.com/in/mrvero/",
    github: "https://github.com/Mr-vero",
    source: "https://github.com/Mr-vero/irvan-fahlepi-showcase",
  },
};

export type Demo = {
  slug: string;
  sector: string;
  cta: string;
  photo: PhotoKey;
  stickers: [PhotoKey, PhotoKey];
  index: string;
  kind: string;
  title: string;
  client: string;
  summary: string;
  stack: string[];
  palette: [string, string, string];
};

export const CLIENTS = ["Logitech", "Udemy", "Edifier", "WHO", "Batik Air", "PGN", "Embassy of Japan", "Universitas Terbuka", "Sierad", "Gunung Sewu", "Karena Kopi", "Asian Games 2018"];

export const DEMOS: Demo[] = [
  {
    slug: "loreal-shade-match",
    sector: "Beauty · Play",
    cta: "Play the game",
    photo: "redDress",
    stickers: ["swatches", "lips"],
    index: "01",
    kind: "Mini game",
    title: "Shade Match",
    client: "L'Oréal Paris · unofficial concept",
    summary: "Thirty seconds, one trained eye. The shades get closer every round, and every score is verified on the server.",
    stack: ["OKLCH colour", "Seeded rounds", "Server-side replay", "Leaderboard"],
    palette: ["#0b0b0b", "#b8325a", "#d9b58c"],
  },
  {
    slug: "maison-lumiere",
    sector: "Fragrance · Ask",
    cta: "Take the survey",
    photo: "peony",
    stickers: ["orangeSlice", "goldenBottles"],
    index: "02",
    kind: "Survey",
    title: "Maison Lumière",
    client: "Fictional fragrance house",
    summary: "Five questions build a moodboard, and the moodboard picks your signature scent. Live answers from everyone who took it.",
    stack: ["GSAP", "Canvas share card", "Live aggregates", "Consent-gated GA4"],
    palette: ["#0e0c0a", "#8c6a3f", "#e8d6b4"],
  },
  {
    slug: "atelier",
    sector: "Leather goods · Tell",
    cta: "Read the story",
    photo: "workshop",
    stickers: ["stitching", "walletTools"],
    index: "03",
    kind: "Scroll story",
    title: "Atelier Nº 7",
    client: "Fictional leather house",
    summary: "The making of a bag in seven gestures. Cinematic, scroll-driven, and built without an animation library.",
    stack: ["CSS scroll timelines", "Clip-path reveals", "Zero JS libraries"],
    palette: ["#f1ebe1", "#6e3b22", "#1c1a17"],
  },
  {
    slug: "lab",
    sector: "Behind the build · Ship",
    cta: "Open the Lab",
    photo: "hideDark",
    stickers: ["thread", "quilted"],
    index: "04",
    kind: "Behind the build",
    title: "The Lab",
    client: "Analytics · QA · Deploy",
    summary: "Live funnels from the three demos, the device test matrix, and the pipeline that ships every change.",
    stack: ["First-party events", "Playwright", "GitHub Actions", "Vercel"],
    palette: ["#0f1012", "#3a3d44", "#c8f560"],
  },
];
