/** A hand-picked slice of the live PingPlay feed (pingplay-studio.vercel.app/api/v1/feed). */
export type Game = { id: string; title: string; category: string; dim: "3D" | "2D"; plays: number; url: string };

export const GAMES: Game[] = [
  { id: "glow-haul-seoul", title: "Glow Haul Seoul", category: "Beauty runner", dim: "3D", plays: 309, url: "https://pingplay-play.vercel.app/g/glow-haul-seoul/1/index.html" },
  { id: "pulau-moli", title: "Pulau Moli", category: "Open-world pet", dim: "3D", plays: 1407, url: "https://pingplay-play.vercel.app/g/pulau-moli/2/index.html" },
  { id: "tokyo-detours", title: "Tokyo Detours", category: "Cozy travel", dim: "3D", plays: 827, url: "https://pingplay-play.vercel.app/g/tokyo-detours/1/index.html" },
  { id: "postcard-skies", title: "Postcard Skies", category: "One-thumb flight", dim: "3D", plays: 339, url: "https://pingplay-play.vercel.app/g/postcard-skies/1/index.html" },
  { id: "little-oven-lane", title: "Little Oven Lane", category: "Bakery tycoon", dim: "2D", plays: 1164, url: "https://pingplay-play.vercel.app/g/little-oven-lane/1/index.html" },
  { id: "purl-pull", title: "Purl Pull", category: "Yarn puzzle", dim: "2D", plays: 1319, url: "https://pingplay-play.vercel.app/g/purl-pull/2/index.html" },
  { id: "flask-flow", title: "Flask Flow", category: "Colour sort", dim: "2D", plays: 1173, url: "https://pingplay-play.vercel.app/g/flask-flow/2/index.html" },
  { id: "sky-roller", title: "Sky Roller", category: "Neon runner", dim: "3D", plays: 546, url: "https://pingplay-play.vercel.app/g/sky-roller/2/index.html" },
];

export const FEED_URL = "https://getpingplay.com/play/feed";
export const FORGE_URL = "https://getpingplay.com/creators#forge-waitlist";

/** The real run behind the Forge screenshot: Pulau Moli, a 3D open-world game. */
export const PIPELINE = [
  { step: "Research", time: "3.8 min" },
  { step: "Build", time: "43.6 min" },
  { step: "Change", time: "2 h 3 min" },
  { step: "Review", time: "29.2 min" },
  { step: "QA gate", time: "23 / 23 pass" },
  { step: "Package", time: "< 0.1 min" },
];
