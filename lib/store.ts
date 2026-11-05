import { FAMILIES, type Family } from "./data";
import { EVENT_NAMES, type EventName } from "./events";

export type ScoreEntry = { id: string; name: string; score: number; correct: number; bestStreak: number; at: number };

export interface Store {
  addScore(entry: ScoreEntry): Promise<void>;
  topScores(limit: number): Promise<ScoreEntry[]>;
  countResult(family: Family): Promise<void>;
  resultCounts(): Promise<Record<Family, number>>;
  countEvent(name: EventName): Promise<void>;
  eventCounts(): Promise<Record<EventName, number>>;
  /** Returns false if the nonce was already used (token replay). */
  claimNonce(nonce: string): Promise<boolean>;
  /** Returns false once `key` has been hit more than `limit` times in the window. */
  rateLimit(key: string, limit: number, windowSec: number): Promise<boolean>;
}

const LB_KEY = "sm:leaderboard";
const RESULTS_KEY = "ml:results";
const EVENTS_KEY = "ev:counts";

function zeroed<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
}

/** Local development and tests. Data is lost on restart and is not shared between serverless instances. */
class MemoryStore implements Store {
  private scores: ScoreEntry[] = [];
  private results = zeroed(FAMILIES);
  private events = zeroed(EVENT_NAMES);
  private nonces = new Set<string>();
  private hits = new Map<string, { count: number; resetAt: number }>();

  async addScore(entry: ScoreEntry) {
    this.scores.push(entry);
    this.scores.sort((a, b) => b.score - a.score);
    this.scores.length = Math.min(this.scores.length, 100);
  }
  async topScores(limit: number) {
    return this.scores.slice(0, limit);
  }
  async countResult(family: Family) {
    this.results[family]++;
  }
  async resultCounts() {
    return { ...this.results };
  }
  async countEvent(name: EventName) {
    this.events[name]++;
  }
  async eventCounts() {
    return { ...this.events };
  }
  async claimNonce(nonce: string) {
    if (this.nonces.has(nonce)) return false;
    this.nonces.add(nonce);
    return true;
  }
  async rateLimit(key: string, limit: number, windowSec: number) {
    const now = Date.now();
    const hit = this.hits.get(key);
    if (!hit || hit.resetAt < now) {
      this.hits.set(key, { count: 1, resetAt: now + windowSec * 1000 });
      return true;
    }
    hit.count++;
    return hit.count <= limit;
  }
}

/** Upstash Redis over its REST API, so no client library or open connection is needed on serverless. */
class UpstashStore implements Store {
  constructor(private url: string, private token: string) {}

  private async cmd<T>(...args: (string | number)[]): Promise<T> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash ${args[0]} failed: ${res.status}`);
    return ((await res.json()) as { result: T }).result;
  }

  private async hashCounts<K extends string>(key: string, keys: readonly K[]) {
    const flat = await this.cmd<string[]>("HGETALL", key);
    const counts = zeroed(keys);
    for (let i = 0; i < flat.length; i += 2) {
      if (flat[i] in counts) counts[flat[i] as K] = Number(flat[i + 1]);
    }
    return counts;
  }

  async addScore(entry: ScoreEntry) {
    await this.cmd("ZADD", LB_KEY, entry.score, JSON.stringify(entry));
    await this.cmd("ZREMRANGEBYRANK", LB_KEY, 0, -101);
  }
  async topScores(limit: number) {
    const rows = await this.cmd<string[]>("ZRANGE", LB_KEY, 0, limit - 1, "REV");
    return rows.map((r) => JSON.parse(r) as ScoreEntry);
  }
  async countResult(family: Family) {
    await this.cmd("HINCRBY", RESULTS_KEY, family, 1);
  }
  async resultCounts() {
    return this.hashCounts(RESULTS_KEY, FAMILIES);
  }
  async countEvent(name: EventName) {
    await this.cmd("HINCRBY", EVENTS_KEY, name, 1);
  }
  async eventCounts() {
    return this.hashCounts(EVENTS_KEY, EVENT_NAMES);
  }
  async claimNonce(nonce: string) {
    return (await this.cmd<string | null>("SET", `nonce:${nonce}`, 1, "NX", "EX", 3600)) === "OK";
  }
  async rateLimit(key: string, limit: number, windowSec: number) {
    const k = `rl:${key}`;
    const count = await this.cmd<number>("INCR", k);
    if (count === 1) await this.cmd("EXPIRE", k, windowSec);
    return count <= limit;
  }
}

const globalStore = globalThis as unknown as { __store?: Store };

export function getStore(): Store {
  if (!globalStore.__store) {
    // Vercel's Upstash integration sets KV_REST_API_*; a manual Upstash setup uses UPSTASH_REDIS_REST_*.
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    globalStore.__store = url && token ? new UpstashStore(url, token) : new MemoryStore();
  }
  return globalStore.__store;
}

/** On Vercel, x-forwarded-for is set by the platform, so it can't be spoofed by the client. */
export function clientKey(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}
