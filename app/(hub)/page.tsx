import Link from "next/link";
import { DEMOS, SITE } from "@/lib/site";
import Reel from "./_components/Reel";

const PROCESS = [
  { n: "01", title: "Prototype", text: "A clickable build within days, so the client reacts to the real thing, not to a deck." },
  { n: "02", title: "Backend", text: "Leaderboards, entries and aggregates, with server-side validation that holds up under a campaign spike." },
  { n: "03", title: "QA", text: "Playwright on desktop Chrome, Android and iOS Safari on every push. A failing check blocks the release." },
  { n: "04", title: "Deploy", text: "Preview URL per branch for client review, production on merge. Rollback is one click." },
  { n: "05", title: "Analytics", text: "A consent-gated GA4 and first-party funnel, defined before launch so the wrap report writes itself." },
];

export default function Home() {
  return (
    <main>
      <header className="hub-top">
        <Link href="/" className="hub-mark">
          {SITE.name}
        </Link>
        <span className="hub-top-mid">Interactive developer — prototype to live</span>
        <a href={`mailto:${SITE.email}`} className="hub-top-link">
          Contact
        </a>
      </header>

      <Reel />

      <section className="hub-intro">
        <p className="hub-kicker">About this page</p>
        <p className="hub-statement">
          Four pieces built for the kind of work luxury and beauty houses commission: a <em>game</em>, a{" "}
          <em>survey</em>, a <em>scroll story</em>, and the <em>build</em> behind them. Each one is live, tested and
          measured.
        </p>
      </section>

      <section className="hub-index" aria-labelledby="work">
        <h2 id="work" className="hub-kicker">
          Selected demos
        </h2>
        <ol>
          {DEMOS.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/${d.slug}`}
                className="hub-row"
                style={{ "--a": d.palette[0], "--b": d.palette[1], "--c": d.palette[2] } as React.CSSProperties}
              >
                <span className="hub-row-n">{d.index}</span>
                <span className="hub-row-main">
                  <span className="hub-row-title">{d.title}</span>
                  <span className="hub-row-client">{d.client}</span>
                </span>
                <span className="hub-row-kind">{d.kind}</span>
                <span className="hub-row-summary">{d.summary}</span>
                <span className="hub-row-stack">
                  {d.stack.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </span>
                <span className="hub-row-swatch" aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
                <span className="hub-row-arrow" aria-hidden>
                  ↗
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="hub-process" aria-labelledby="process">
        <div className="hub-process-head">
          <h2 id="process" className="hub-kicker">
            From prototype to live
          </h2>
          <Link href="/lab" className="hub-text-link">
            See it in the Lab →
          </Link>
        </div>
        <ol className="hub-process-grid">
          {PROCESS.map((p) => (
            <li key={p.n}>
              <span className="hub-process-n">{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ol>
        <p className="hub-ai">
          Built with Claude Code as a pair programmer: scaffolding, test writing and refactors go faster, and every line
          still gets reviewed by me.
        </p>
      </section>

      <footer className="hub-foot">
        <p className="hub-kicker">Available for full-time remote work</p>
        <a href={`mailto:${SITE.email}`} className="hub-cta">
          Let’s make something
          <br />
          people <em>play</em>.
        </a>
        <div className="hub-foot-links">
          <a href={SITE.links.portfolio}>Full portfolio</a>
          <a href={SITE.links.linkedin}>LinkedIn</a>
          <a href={SITE.links.github}>GitHub</a>
          <a href={SITE.links.source}>Source code</a>
          <span>© {new Date().getFullYear()} {SITE.name}</span>
        </div>
        <p className="hub-legal">
          L’Oréal Paris is a trademark of L’Oréal. Shade Match is an unofficial concept, not affiliated with or endorsed
          by L’Oréal. Maison Lumière and Atelier Nº 7 are fictional.
        </p>
      </footer>
    </main>
  );
}
