import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getStore();
  const [survey, events, top] = await Promise.all([store.resultCounts(), store.eventCounts(), store.topScores(5)]);
  return NextResponse.json(
    {
      survey: { counts: survey, total: Object.values(survey).reduce((a, b) => a + b, 0) },
      events,
      leaderboard: top,
      persistent: Boolean(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
