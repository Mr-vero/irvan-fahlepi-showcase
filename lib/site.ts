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
  index: string;
  kind: string;
  title: string;
  client: string;
  summary: string;
  stack: string[];
  palette: [string, string, string];
};

export const DEMOS: Demo[] = [
  {
    slug: "loreal-shade-match",
    index: "01",
    kind: "Mini game",
    title: "Shade Match",
    client: "L'Oréal Paris · unofficial concept",
    summary:
      "A 30-second colour-perception game. Shades get closer every round. Scores are replayed and verified on the server before they reach the leaderboard.",
    stack: ["OKLCH colour", "Seeded rounds", "Server-side replay", "Leaderboard"],
    palette: ["#0b0b0b", "#b8325a", "#d9b58c"],
  },
  {
    slug: "maison-lumiere",
    index: "02",
    kind: "Survey",
    title: "Maison Lumière",
    client: "Fictional fragrance house",
    summary:
      "Five questions to a signature scent, a shareable result card, and live answers from everyone who has taken it.",
    stack: ["GSAP", "Canvas share card", "Live aggregates", "Consent-gated GA4"],
    palette: ["#0e0c0a", "#8c6a3f", "#e8d6b4"],
  },
  {
    slug: "atelier",
    index: "03",
    kind: "Scroll story",
    title: "Atelier Nº 7",
    client: "Fictional leather house",
    summary:
      "The making of a bag in seven gestures. Scroll-driven motion with no animation library and no images.",
    stack: ["CSS scroll timelines", "SVG stroke drawing", "Zero JS libraries"],
    palette: ["#f1ebe1", "#6e3b22", "#1c1a17"],
  },
  {
    slug: "lab",
    index: "04",
    kind: "Behind the build",
    title: "The Lab",
    client: "Analytics · QA · Deploy",
    summary:
      "Live numbers from the three demos, the device test matrix, performance budgets and the pipeline that ships them.",
    stack: ["First-party events", "Playwright", "GitHub Actions", "Vercel"],
    palette: ["#0f1012", "#3a3d44", "#c8f560"],
  },
];
