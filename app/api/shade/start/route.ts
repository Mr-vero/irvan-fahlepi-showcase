import { NextResponse } from "next/server";
import { dealRounds, gameDurationMs } from "@/lib/shade";
import { clientKey, getStore } from "@/lib/store";
import { issueToken } from "@/lib/token";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await getStore().rateLimit(`start:${clientKey(req)}`, 30, 60))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const { token, session } = issueToken();
  return NextResponse.json({ token, durationMs: gameDurationMs(), rounds: dealRounds(session.seed) });
}
