import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { dealRounds, gameDurationMs, MIN_PICK_MS, tally } from "@/lib/shade";
import { clientKey, getStore } from "@/lib/store";
import { verifyToken } from "@/lib/token";

export const dynamic = "force-dynamic";

const NAME_PATTERN = /^[\p{L}\p{N} ._'-]{2,16}$/u;
/** Network latency and the end-of-game screen mean a real submission lands a little after the timer. */
const EARLY_GRACE_MS = 1500;

export async function GET() {
  return NextResponse.json({ scores: await getStore().topScores(10) });
}

export async function POST(req: Request) {
  const store = getStore();
  if (!(await store.rateLimit(`score:${clientKey(req)}`, 10, 60))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { token?: unknown; picks?: unknown; name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  if (!NAME_PATTERN.test(name)) return NextResponse.json({ error: "invalid_name" }, { status: 422 });

  const session = verifyToken(body.token);
  if (!session) return NextResponse.json({ error: "invalid_token" }, { status: 401 });

  // The clock is the server's: the client never reports its own time.
  const elapsed = Date.now() - session.startedAt;
  if (elapsed < gameDurationMs() - EARLY_GRACE_MS) {
    return NextResponse.json({ error: "too_early" }, { status: 422 });
  }

  const result = tally(dealRounds(session.seed), body.picks);
  if (!result) return NextResponse.json({ error: "invalid_picks" }, { status: 422 });
  if ((result.correct + result.wrong) * MIN_PICK_MS > gameDurationMs()) {
    return NextResponse.json({ error: "too_fast" }, { status: 422 });
  }

  if (!(await store.claimNonce(session.nonce))) {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }

  const entry = { id: randomUUID(), name, score: result.score, correct: result.correct, bestStreak: result.bestStreak, at: Date.now() };
  await store.addScore(entry);
  const scores = await store.topScores(10);
  const rank = scores.findIndex((s) => s.id === entry.id) + 1 || null;
  return NextResponse.json({ entry, rank, scores });
}
