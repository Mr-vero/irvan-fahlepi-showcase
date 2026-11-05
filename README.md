# Irvan Fahlepi · Interactive showcase

One site, four demos of the work luxury and beauty houses commission, each taken from prototype to live.

| Route | Demo | What it shows |
|---|---|---|
| `/` | Index | Code-driven motion reel (GSAP timeline), demo index |
| `/loreal-shade-match` | **Shade Match**: unofficial L'Oréal Paris concept | 30-second colour game, OKLCH swatches, server-verified leaderboard |
| `/maison-lumiere` | **Maison Lumière**: fictional fragrance house | 5-question survey, canvas share card, live answer distribution |
| `/atelier` | **Atelier Nº 7**: fictional leather house | Scroll story using CSS scroll timelines, no animation library |
| `/lab` | **The Lab** | Live funnels, QA matrix, performance, delivery pipeline |

Stack: Next.js 16 (App Router), React 19, TypeScript, GSAP (reel and survey only), Upstash Redis, Playwright, GitHub Actions, Vercel.

## Run it

```bash
npm install
npm run dev
```

Without Redis credentials an in-memory store is used, so leaderboards and counts reset on restart.

## Test it

```bash
npx playwright install chromium webkit
npm test
```

Runs every suite on Desktop Chrome, Pixel 7 and iPhone 14 (WebKit). The tests build and start the app themselves, with a 4-second game so the full play-through stays fast.

## Deploy to Vercel

1. Push this folder to a GitHub repository and import it in Vercel. No framework settings are needed.
2. In the Vercel project, open **Storage → Marketplace → Upstash for Redis** and connect a free database. That sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`, which the app reads automatically.
3. Add environment variables:
   - `GAME_SECRET`: a long random string (`openssl rand -hex 32`)
   - `NEXT_PUBLIC_GA_ID`: optional GA4 measurement ID
4. Deploy. Every pull request gets its own preview URL, and CI runs the Playwright suite.

## How the leaderboard stays honest

- `/api/shade/start` returns rounds generated from a random seed, plus an HMAC-signed token holding that seed and the start time.
- `/api/shade/scores` rebuilds the rounds from the seed, replays the raw picks and computes the score itself. The client never sends a score.
- The server's clock must show the full game length has passed. Pick counts faster than human reaction time are rejected, each token is single-use, and every endpoint is rate-limited per IP.

## Analytics and consent

Nothing is tracked, and Google's script isn't requested, until the visitor accepts. After that, events go to GA4 (if configured) and to a first-party counter (`/api/events`) that only stores totals per event name. The Lab dashboard reads those totals.

---

L'Oréal Paris is a trademark of L'Oréal. Shade Match is an unofficial portfolio concept, not affiliated with or endorsed by L'Oréal. Maison Lumière and Atelier Nº 7 are fictional.
