import { NextResponse } from "next/server";
import { isEventName } from "@/lib/events";
import { clientKey, getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/** First-party, cookieless event counter. It only stores a running total per event name. */
export async function POST(req: Request) {
  let name: unknown;
  try {
    // sendBeacon posts text/plain, so parse the body by hand.
    ({ name } = JSON.parse(await req.text()));
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!isEventName(name)) return new NextResponse(null, { status: 422 });
  const store = getStore();
  if (await store.rateLimit(`ev:${clientKey(req)}`, 120, 60)) await store.countEvent(name);
  return new NextResponse(null, { status: 204 });
}
