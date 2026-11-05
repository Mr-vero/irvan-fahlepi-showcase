import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import LiveStats from "./LiveStats";
import "./lab.css";

export const metadata: Metadata = {
  title: "The Lab · Analytics, QA and deploy",
  description: "Live funnels from the demos, the device test matrix, performance budgets and the delivery pipeline.",
};

const DEVICES = ["Desktop Chrome", "Android · Pixel 7", "iOS Safari · iPhone 14"];

const SUITES: { name: string; what: string; devices: boolean[] }[] = [
  { name: "Survey flow", what: "Answers lead to the right fragrance, ties resolve, live distribution renders", devices: [true, true, true] },
  { name: "Consent", what: "No event or Google script before opt-in; choice persists across reloads", devices: [true, true, true] },
  { name: "Share card", what: "Canvas renders and downloads a 1080×1350 PNG", devices: [true, true, false] },
  { name: "Shade Match", what: "Full game with real taps, misses freeze, score reaches the leaderboard", devices: [true, true, true] },
  { name: "Scroll story", what: "Page renders end to end and fires start and complete events", devices: [true, true, true] },
  { name: "API & anti-cheat", what: "Early, forged, replayed and impossible submissions are rejected", devices: [true, false, false] },
];

const PIPELINE = [
  { step: "Push", detail: "Every branch" },
  { step: "CI", detail: "Typecheck · build · Playwright × 3 devices" },
  { step: "Preview", detail: "Unique Vercel URL for client review" },
  { step: "Merge", detail: "Only when checks pass" },
  { step: "Production", detail: "Instant rollback to any build" },
];

export default function Lab() {
  return (
    <main className="lab">
      <header className="hub-top">
        <Link href="/" className="hub-mark" aria-label={`${SITE.name}, home`}>
          <span className="hub-mark-glyph" aria-hidden>
            IF
          </span>
          {SITE.name}
        </Link>
        <nav className="hub-nav">
          <Link href="/">← Index</Link>
        </nav>
      </header>
      <a href={`mailto:${SITE.email}`} className="hub-pill hub-talk">
        Let’s talk
      </a>

      <section className="lab-hero">
        <p className="hub-label lab-kicker">04 — Behind the build</p>
        <h1>
          The <em>Lab</em>
        </h1>
        <p className="lab-lede">
          The part of campaign work clients don’t see until something breaks: what gets measured, what gets tested and
          how it ships. The numbers below are live from the three demos.
        </p>
      </section>

      <LiveStats />

      <section className="lab-section" aria-labelledby="qa">
        <div className="lab-head">
          <h2 id="qa">Quality assurance</h2>
          <p>Playwright runs every suite on three device profiles for every push. A red cell blocks the merge.</p>
        </div>
        <div className="lab-table-wrap">
          <table className="lab-table">
            <thead>
              <tr>
                <th scope="col">Suite</th>
                {DEVICES.map((d) => (
                  <th scope="col" key={d}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUITES.map((s) => (
                <tr key={s.name}>
                  <th scope="row">
                    <span>{s.name}</span>
                    <small>{s.what}</small>
                  </th>
                  {s.devices.map((on, i) => (
                    <td key={i}>
                      {on ? <span className="lab-pass">✓ Runs</span> : <span className="lab-na">Not applicable</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lab-section" aria-labelledby="perf">
        <div className="lab-head">
          <h2 id="perf">Lightweight by design</h2>
          <p>Each demo ships only what it needs. Fonts load per page, and motion uses CSS wherever CSS can do it.</p>
        </div>
        <ul className="lab-perf">
          <li>
            <b>0 kB</b>
            <span>Animation library on the scroll story. It runs on CSS scroll timelines.</span>
          </li>
          <li>
            <b>AVIF</b>
            <span>Every photo is resized and re-encoded by the CDN to the exact size it is shown at, and lazy-loaded below the fold.</span>
          </li>
          <li>
            <b>145 kB</b>
            <span>Total compressed JavaScript for Shade Match, React and the WebGL swatch included.</span>
          </li>
          <li>
            <b>0 cookies</b>
            <span>Until a visitor accepts. Google’s script isn’t even requested before then.</span>
          </li>
        </ul>
      </section>

      <section className="lab-section" aria-labelledby="ship">
        <div className="lab-head">
          <h2 id="ship">How it ships</h2>
          <p>GitHub Actions for checks, Vercel for previews and production, Upstash Redis for leaderboards and counts.</p>
        </div>
        <ol className="lab-pipe">
          {PIPELINE.map((p, i) => (
            <li key={p.step}>
              <span className="lab-pipe-n">{String(i + 1).padStart(2, "0")}</span>
              <b>{p.step}</b>
              <span>{p.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="lab-section" aria-labelledby="trust">
        <div className="lab-head">
          <h2 id="trust">Scores you can trust</h2>
          <p>Campaign leaderboards attract cheaters within hours. Shade Match defends itself on the server.</p>
        </div>
        <ul className="lab-list">
          <li>Rounds are generated from a seed inside a signed token, so the server can rebuild the exact game it dealt.</li>
          <li>The score is recomputed from the raw picks. The client never sends a score.</li>
          <li>The server’s clock decides whether the game lasted long enough. Each token can be used once.</li>
          <li>Pick counts beyond human reaction time are rejected, and every endpoint is rate-limited per address.</li>
        </ul>
      </section>

      <footer className="hub-foot lab-foot">
        <div className="hub-foot-links">
          <Link href="/">Back to the index</Link>
          <a href={SITE.links.source}>Source code on GitHub</a>
          <span>© {new Date().getFullYear()} {SITE.name}</span>
        </div>
      </footer>
    </main>
  );
}
