import { mulberry32, shuffle } from "./random";

/** An OKLCH colour: lightness 0–1, chroma, hue in degrees. */
export type Shade = { l: number; c: number; h: number };
export type Round = { name: string; target: Shade; options: Shade[] };

export const MAX_ROUNDS = 80;
/** Nobody reliably compares a grid of swatches faster than this. */
export const MIN_PICK_MS = 280;

const FINISHES = ["Satin", "Velours", "Mat", "Éclat", "Soie", "Crème"];

export function gameDurationMs(): number {
  const v = Number(process.env.SHADE_DURATION_MS);
  return Number.isFinite(v) && v > 0 ? v : 30_000;
}

export function css(s: Shade): string {
  return `oklch(${(s.l * 100).toFixed(2)}% ${s.c.toFixed(3)} ${s.h.toFixed(1)})`;
}

export function optionCount(round: number): number {
  return round < 4 ? 4 : round < 10 ? 6 : 9;
}

/** How far the wrong swatches sit from the target; it narrows every round. */
function spread(round: number): number {
  return Math.max(0.022, 0.13 * Math.pow(0.86, round));
}

export function dealRounds(seed: number, count = MAX_ROUNDS): Round[] {
  const rand = mulberry32(seed);
  const rounds: Round[] = [];
  for (let r = 0; r < count; r++) {
    // Lip and complexion territory: pinks through reds to warm browns.
    const hue = (350 + rand() * 85) % 360;
    const target: Shade = { l: 0.38 + rand() * 0.42, c: 0.05 + rand() * 0.12, h: hue };
    const d = spread(r);
    const options: Shade[] = [target];
    while (options.length < optionCount(r)) {
      const axis = rand();
      const sign = rand() < 0.5 ? -1 : 1;
      const k = d * (0.7 + rand() * 0.6);
      const s: Shade =
        axis < 0.5
          ? { ...target, l: clamp(target.l + sign * k, 0.25, 0.92) }
          : axis < 0.8
            ? { ...target, c: clamp(target.c + sign * k * 0.6, 0.02, 0.22) }
            : { ...target, h: (target.h + sign * k * 220 + 360) % 360 };
      if (!options.some((o) => same(o, s))) options.push(s);
    }
    const name = `${toneName(target, rand)} ${FINISHES[Math.floor(rand() * FINISHES.length)]} ${String(
      100 + Math.floor(rand() * 900),
    )}`;
    rounds.push({ name, target, options: shuffle(options, rand) });
  }
  return rounds;
}

/** Names follow the colour, so a soft pink is never called "Cacao". */
function toneName(s: Shade, rand: () => number): string {
  const pick = (names: string[]) => names[Math.floor(rand() * names.length)];
  const warm = s.h >= 30 && s.h < 80;
  if (s.l < 0.5) return pick(warm ? ["Cacao", "Moka", "Bois"] : ["Grenat", "Prune", "Bordeaux"]);
  if (s.l > 0.7) return pick(warm ? ["Nude", "Pêche", "Miel"] : ["Rosé", "Pétale", "Dragée"]);
  if (s.c > 0.12) return pick(warm ? ["Corail", "Terracotta"] : ["Cerise", "Framboise", "Rouge"]);
  return pick(warm ? ["Sable", "Caramel"] : ["Bois de rose", "Mauve"]);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function same(a: Shade, b: Shade): boolean {
  return Math.abs(a.l - b.l) < 1e-6 && Math.abs(a.c - b.c) < 1e-6 && Math.abs(a.h - b.h) < 1e-6;
}

export function pointsFor(round: number, streak: number): number {
  return Math.round((100 + round * 20) * (1 + Math.min(streak, 10) * 0.1));
}

export type Tally = { score: number; correct: number; wrong: number; bestStreak: number };

/**
 * Replays a list of option picks against the dealt rounds. A wrong pick keeps the player on the same
 * round, so the result depends only on the picks, never on anything the client says about itself.
 */
export function tally(rounds: Round[], picks: unknown): Tally | null {
  if (!Array.isArray(picks) || picks.length > rounds.length * 3) return null;
  const t: Tally = { score: 0, correct: 0, wrong: 0, bestStreak: 0 };
  let round = 0;
  let streak = 0;
  for (const p of picks) {
    const r = rounds[round];
    if (!r || !Number.isInteger(p) || p < 0 || p >= r.options.length) return null;
    if (same(r.options[p as number], r.target)) {
      t.score += pointsFor(round, streak);
      streak++;
      t.correct++;
      t.bestStreak = Math.max(t.bestStreak, streak);
      round++;
    } else {
      streak = 0;
      t.wrong++;
    }
  }
  return t;
}

export function rankFor(correct: number): string {
  if (correct >= 24) return "Master colourist";
  if (correct >= 16) return "Expert eye";
  if (correct >= 9) return "Trained eye";
  return "Rising talent";
}
