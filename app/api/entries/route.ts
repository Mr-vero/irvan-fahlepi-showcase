import { NextResponse } from "next/server";
import { FAMILIES, type Family } from "@/lib/data";
import { clientKey, getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Records a quiz result and returns the share of all visitors who got each family. */
export async function POST(req: Request) {
  const store = getStore();
  let family: unknown;
  try {
    ({ family } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!FAMILIES.includes(family as Family)) {
    return NextResponse.json({ error: "invalid_family" }, { status: 422 });
  }
  // Over the limit we still answer with the distribution, we just don't count the entry.
  if (await store.rateLimit(`entry:${clientKey(req)}`, 20, 60)) {
    await store.countResult(family as Family);
  }
  const counts = await store.resultCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return NextResponse.json({ counts, total });
}
