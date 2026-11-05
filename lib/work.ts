export type LiveWork = {
  title: string;
  kind: string;
  line: string;
  stack: string[];
  url: string;
  host: string;
  image: string;
  frame: "browser" | "phone";
  accent: string;
};

/** Shipped projects that are live right now, in the order that best answers the brief. */
export const LIVE_WORK: LiveWork[] = [
  {
    title: "PingPlay",
    kind: "Mini-game platform",
    line: "A swipeable feed of instantly playable HTML5 games, plus the studio where creators upload, test and track them.",
    stack: ["HTML5 games", "Three.js", "Kotlin app", "Postgres", "Vercel"],
    url: "https://getpingplay.com",
    host: "getpingplay.com",
    image: "/work/pingplay.webp",
    frame: "browser",
    accent: "#e14fd8",
  },
  {
    title: "The Last Ember",
    kind: "Browser game",
    line: "A story-driven adventure through six realms, drawn live on canvas with synthesised sound. Touch-first, zero dependencies.",
    stack: ["Canvas", "Web Audio", "Touch input", "Vanilla JS"],
    url: "https://mr-vero.github.io/the-last-ember/",
    host: "mr-vero.github.io/the-last-ember",
    image: "/work/ember.webp",
    frame: "phone",
    accent: "#ffb45e",
  },
  {
    title: "Jak-Japan Matsuri 2026",
    kind: "Festival site · Embassy of Japan",
    line: "The trilingual site for Indonesia’s largest Japan–Indonesia cultural festival, now in its 16th edition.",
    stack: ["Next.js", "i18n ID / EN / JP", "Motion", "CMS"],
    url: "https://jakjapanmatsuri.id",
    host: "jakjapanmatsuri.id",
    image: "/work/jakjapan.webp",
    frame: "browser",
    accent: "#e2382f",
  },
  {
    title: "White Label",
    kind: "Live product customizer",
    line: "Brands design their own apparel: every garment renders live in up to 18 colourways, with artwork and labels placed in real time.",
    stack: ["Next.js", "Canvas / SVG", "Node.js", "PostgreSQL"],
    url: "https://www.whitelabelapparel.com",
    host: "whitelabelapparel.com",
    image: "/work/whitelabel.webp",
    frame: "browser",
    accent: "#9c9a92",
  },
  {
    title: "KCRMPI",
    kind: "Conservation storytelling",
    line: "An extinct volcano, four indigenous peoples, 168,000 hectares. A narrative site for a conservation programme in Papua New Guinea.",
    stack: ["Next.js", "Scroll narrative", "Data storytelling"],
    url: "https://kcrmpi.vercel.app",
    host: "kcrmpi.vercel.app",
    image: "/work/kcrmpi.webp",
    frame: "browser",
    accent: "#5f8f4e",
  },
  {
    title: "Ivan Solén",
    kind: "Album launch",
    line: "An editorial, cinematic home for an artist’s album release, with pre-save, tour and the story behind the record.",
    stack: ["Astro", "GSAP", "Editorial layout"],
    url: "https://www.ivansolen.com",
    host: "ivansolen.com",
    image: "/work/ivansolen.webp",
    frame: "browser",
    accent: "#b9a98c",
  },
  {
    title: "Begadang",
    kind: "World Cup companion · PWA",
    line: "Live scores, a prediction game with a leaderboard, and watch parties for fans staying up for late-night matches.",
    stack: ["PWA", "Live data", "Predictions", "Liquid-glass UI"],
    url: "https://begadang.vercel.app",
    host: "begadang.vercel.app",
    image: "/work/begadang.webp",
    frame: "phone",
    accent: "#f5c542",
  },
  {
    title: "newCode",
    kind: "Desktop IDE for Claude Code",
    line: "Every project floats in one 3D space, and you watch Claude Code agents work on each one. Built by someone who codes with AI every day.",
    stack: ["Desktop app", "3D UI", "Claude Code", "Agents"],
    url: "https://mr-vero.github.io/newcode-site/",
    host: "newcode-site",
    image: "/work/newcode.webp",
    frame: "browser",
    accent: "#5b6cff",
  },
  {
    title: "CostLabs",
    kind: "AI SaaS",
    line: "Construction cost estimation that turns a bill of quantities into a budget and schedule in minutes instead of days.",
    stack: ["Next.js", "Python", "Three.js", "AI estimation"],
    url: "https://costlabs.vercel.app",
    host: "costlabs.vercel.app",
    image: "/work/costlabs.webp",
    frame: "browser",
    accent: "#1f2937",
  },
];

export type PrivateWork = { title: string; kind: string; line: string; stack: string[] };

/** Private repositories: described here, walked through on a call. */
export const PRIVATE_WORK: PrivateWork[] = [
  {
    title: "Ava Engine",
    kind: "Screen-aware voice agent",
    line: "Joins a customer on a call, sees the tab they share and talks them through onboarding, then hands off to a human. WCAG 2.1 AA audited, CI-gated.",
    stack: ["Real-time voice", "Screen understanding", "Node 22"],
  },
  {
    title: "LWD Studio",
    kind: "Motion-graphics video studio",
    line: "Turns a topic or product page into a fact-checked motion-graphics video with a timeline editor, a unique art direction per video and QA gates before render.",
    stack: ["Remotion", "Claude Code", "Desktop app", "TTS"],
  },
  {
    title: "PingPlay Studio",
    kind: "Creator platform for games",
    line: "Upload, test, review and track HTML5 games against a published game contract, served from an isolated play origin.",
    stack: ["React", "Express", "Postgres", "Blob storage"],
  },
  {
    title: "inKey",
    kind: "Camera hand-tracking keyboard",
    line: "Type on an empty table with your phone’s camera: MediaPipe hand tracking, pinch-and-glide gestures and statistical word decoding.",
    stack: ["MediaPipe", "Kotlin", "Computer vision"],
  },
  {
    title: "MEXT Scholarship",
    kind: "Registration platform · Embassy of Japan",
    line: "Multi-track application platform that moved 6,118+ applicants through one registration cycle, with an admin console for the review team.",
    stack: ["Next.js", "PostgreSQL", "Multi-step forms", "i18n ID / JP"],
  },
];
