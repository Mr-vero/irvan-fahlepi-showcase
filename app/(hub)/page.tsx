import Link from "next/link";
import Chapter from "@/components/Chapter";
import Photo from "@/components/Photo";
import StoryChrome from "@/components/StoryChrome";
import { CLIENTS, DEMOS, SITE } from "@/lib/site";
import Forge from "./_components/Forge";
import Hero from "./_components/Hero";
import Tour from "./_components/Tour";
import Reel from "./_components/Reel";
import Spotlight from "./_components/Spotlight";

const PROCESS = [
  { n: "01", title: "Prototype", text: "A clickable build within days, so the client reacts to the real thing, not a deck." },
  { n: "02", title: "Backend", text: "Leaderboards, entries and live aggregates, validated on the server and ready for a campaign spike." },
  { n: "03", title: "QA", text: "Playwright on desktop Chrome, Android and iOS Safari on every push. A failing check blocks the release." },
  { n: "04", title: "Deploy", text: "A preview link per change for client review, production on merge, and one-click rollback." },
  { n: "05", title: "Measure", text: "Consent-first GA4 plus a first-party funnel, agreed before launch so the wrap report writes itself." },
];

export default function Home() {
  return (
    <main>
      <header className="hub-top">
        <Link href="/" className="hub-mark" aria-label={`${SITE.name}, home`}>
          <span className="hub-mark-glyph" aria-hidden>
            IF
          </span>
          {SITE.name}
        </Link>
        <nav className="hub-nav">
          <a href="#work">Work</a>
          <Link href="/lab">Lab</Link>
        </nav>
      </header>
      <a href={`mailto:${SITE.email}`} className="hub-pill hub-talk">
        Let’s talk
      </a>

      <StoryChrome />

      <Hero />

      <section className="chapter chapter-over brief" data-theme="light" data-chapter="Brief">
      <div className="hub-marquee" aria-label="Brands and institutions I’ve built for">
        <div className="hub-marquee-track">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1}>
              {CLIENTS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section className="hub-intro">
        <p className="hub-label">The brief</p>
        <p className="hub-statement">
          Four pieces built for the work luxury and beauty houses commission: a <mark>game</mark>, a <mark>survey</mark>,
          a <mark>scroll story</mark>, and the <mark>build</mark> behind them. Each is live, tested on real devices, and
          measured.
        </p>
      </section>
      </section>

      <div id="work" />
      <Spotlight />

      {DEMOS.filter((d) => d.slug !== "loreal-shade-match").map((d) => (
        <Chapter key={d.slug} label={d.sector.split(" · ")[1]} theme="dark" over className="world-chapter">
          <article className={`world world-${d.slug}`}>
            <div className="world-media" aria-hidden>
              <Photo name={d.photo} alt="" sizes="100vw" />
            </div>
            <div className="world-stickers" aria-hidden>
              <Photo name={d.stickers[0]} alt="" ratio={1.25} sizes="(max-width: 900px) 40vw, 280px" />
              <Photo name={d.stickers[1]} alt="" ratio={1} sizes="(max-width: 900px) 34vw, 240px" />
            </div>
            <div className="world-copy">
              <p className="world-index">
                {d.index} <span>— {d.sector}</span>
              </p>
              <h2 className="world-title">{d.title}</h2>
              <p className="world-client">{d.client}</p>
              <p className="world-summary">{d.summary}</p>
              <p className="world-tags">{d.stack.join(" · ")}</p>
              <Link href={`/${d.slug}`} className="hub-pill hub-pill-light">
                {d.cta} <span aria-hidden>↗</span>
              </Link>
            </div>
          </article>
        </Chapter>
      ))}

      <Forge />

      <Tour />

      <div className="chapter" data-theme="dark" data-chapter="Showreel">
        <Reel />
      </div>

      <section className="hub-process chapter" data-theme="light" data-chapter="Process" aria-labelledby="process">
        <div className="hub-process-head">
          <h2 id="process" className="hub-h2">
            From prototype
            <br />
            to <mark>live.</mark>
          </h2>
          <Link href="/lab" className="hub-pill">
            See it in the Lab ↗
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
          Built with Claude Code as a pair programmer. Scaffolding, tests and refactors move faster, and I review every
          line.
        </p>
      </section>

      <footer className="hub-foot chapter" data-theme="light" data-chapter="Contact">
        <p className="hub-label">Available for full-time remote work</p>
        <a href={`mailto:${SITE.email}`} className="hub-cta">
          Let’s make
          <br />
          something people <em>play.</em>
        </a>
        <div className="hub-foot-links">
          <a href={SITE.links.github}>GitHub</a>
          <a href={SITE.links.source}>Source code</a>
          <span>© {new Date().getFullYear()} {SITE.name}</span>
        </div>
        <p className="hub-legal">
          Photography via Unsplash. L’Oréal Paris is a trademark of L’Oréal. Shade Match is an unofficial concept, not
          affiliated with or endorsed by L’Oréal. Maison Lumière and Atelier Nº 7 are fictional.
        </p>
      </footer>
    </main>
  );
}
