import { expect, test, type APIRequestContext } from "@playwright/test";
import { matchIndex, type Round } from "./helpers";

// API behaviour doesn't depend on the device, so run it once.
test.skip(({ browserName, isMobile }) => browserName !== "chromium" || !!isMobile, "API checks run once");

// Each test gets its own client address so the per-IP rate limits don't couple tests together.
test.use({ extraHTTPHeaders: { "x-forwarded-for": `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` } });

// Matches SHADE_DURATION_MS in playwright.config.ts, minus the server's early grace.
const PLAYABLE_AFTER_MS = 2600;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function startGame(request: APIRequestContext) {
  const res = await request.post("/api/shade/start");
  expect(res.ok()).toBeTruthy();
  return (await res.json()) as { token: string; durationMs: number; rounds: Round[] };
}

const perfect = (rounds: Round[], n: number) => rounds.slice(0, n).map(matchIndex);

test("start deals rounds that each contain exactly one match", async ({ request }) => {
  const { rounds, token } = await startGame(request);
  expect(rounds.length).toBeGreaterThan(40);
  for (const r of rounds) expect(r.options.filter((_, i) => i === matchIndex(r))).toHaveLength(1);
  expect(rounds[0].options).toHaveLength(4);
  expect(rounds[20].options).toHaveLength(9);
  expect(token).toMatch(/^[\w-]+\.[\w-]+$/);
});

test("rejects a score sent before the game could have ended", async ({ request }) => {
  const { token, rounds } = await startGame(request);
  const res = await request.post("/api/shade/scores", { data: { token, picks: perfect(rounds, 5), name: "Early" } });
  expect(res.status()).toBe(422);
  expect((await res.json()).error).toBe("too_early");
});

test("rejects more picks than human reaction time allows", async ({ request }) => {
  const { token, rounds } = await startGame(request);
  await wait(PLAYABLE_AFTER_MS);
  const res = await request.post("/api/shade/scores", { data: { token, picks: perfect(rounds, 30), name: "Bot" } });
  expect((await res.json()).error).toBe("too_fast");
});

test("rejects out-of-range picks and forged tokens", async ({ request }) => {
  const { token, rounds } = await startGame(request);
  await wait(PLAYABLE_AFTER_MS);
  const bad = await request.post("/api/shade/scores", { data: { token, picks: [99], name: "Glitch" } });
  expect((await bad.json()).error).toBe("invalid_picks");

  const [payload] = token.split(".");
  const forged = await request.post("/api/shade/scores", { data: { token: `${payload}.forged`, picks: perfect(rounds, 3), name: "Forger" } });
  expect(forged.status()).toBe(401);
});

test("scores a real game from its picks, once", async ({ request }) => {
  const { token, rounds } = await startGame(request);
  await wait(PLAYABLE_AFTER_MS);
  const wrong = rounds[0].options.findIndex((_, i) => i !== matchIndex(rounds[0]));
  // A miss on round one, then five straight matches.
  const picks = [wrong, ...perfect(rounds, 5)];

  const first = await request.post("/api/shade/scores", { data: { token, picks, name: "Camille" } });
  expect(first.status()).toBe(200);
  const { entry } = await first.json();
  expect(entry.correct).toBe(5);
  expect(entry.bestStreak).toBe(5);
  // 100, 120×1.1, 140×1.2, 160×1.3, 180×1.4
  expect(entry.score).toBe(100 + 132 + 168 + 208 + 252);

  const again = await request.post("/api/shade/scores", { data: { token, picks, name: "Camille" } });
  expect(again.status()).toBe(409);
});

test("survey entries and events only accept known names", async ({ request }) => {
  expect((await request.post("/api/entries", { data: { family: "musk" } })).status()).toBe(422);
  const good = await request.post("/api/entries", { data: { family: "amber" } });
  expect((await good.json()).counts.amber).toBeGreaterThan(0);

  expect((await request.post("/api/events", { data: JSON.stringify({ name: "drop_table" }) })).status()).toBe(422);
  expect((await request.post("/api/events", { data: JSON.stringify({ name: "game_start" }) })).status()).toBe(204);
});
