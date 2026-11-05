import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export type GameSession = { seed: number; startedAt: number; nonce: string };

const TOKEN_TTL_MS = 30 * 60 * 1000;

function secret(): string {
  const s = process.env.GAME_SECRET;
  if (!s && process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    throw new Error("GAME_SECRET must be set in production");
  }
  return s || "dev-only-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueToken(): { token: string; session: GameSession } {
  const session: GameSession = {
    seed: randomInt(0, 2 ** 31),
    startedAt: Date.now(),
    nonce: randomBytes(12).toString("base64url"),
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, session };
}

export function verifyToken(token: unknown): GameSession | null {
  if (typeof token !== "string") return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as GameSession;
    if (Date.now() - session.startedAt > TOKEN_TTL_MS) return null;
    return session;
  } catch {
    return null;
  }
}
