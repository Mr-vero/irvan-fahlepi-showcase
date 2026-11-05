import Link from "next/link";
import StoryTracker from "./StoryTracker";

const STATEMENT =
  "Seventy-two hours. One artisan. Twelve hundred stitches, each one pulled by hand and set with a bone folder before the next begins.";

const GESTURES = [
  {
    name: "Select",
    text: "One hide in ten is good enough. It is read by hand and by light, looking for scars, veins and the direction the leather wants to move.",
    art: <circle pathLength={1} cx="100" cy="100" r="62" />,
  },
  {
    name: "Cut",
    text: "Pieces are cut with a round knife, following the grain. A straight cut across it would warp within a year.",
    art: <path pathLength={1} d="M30 150 L170 50 M60 160 L180 80" />,
  },
  {
    name: "Skive",
    text: "Every edge that will be folded is thinned to half a millimetre, so the seams lie flat and the bag holds its line.",
    art: <path pathLength={1} d="M20 130 C70 130 90 70 180 70" />,
  },
  {
    name: "Paint",
    text: "Edges get seven coats of paint, each sanded and burnished. Rushing it shows in the first month of use.",
    art: <path pathLength={1} d="M40 60 H160 M40 90 H160 M40 120 H160 M40 150 H160" />,
  },
  {
    name: "Stitch",
    text: "Saddle stitch, two needles through one hole, so that if a thread breaks the seam still holds.",
    art: <path pathLength={1} d="M20 100 L45 75 L70 100 L95 75 L120 100 L145 75 L170 100" />,
  },
  {
    name: "Assemble",
    text: "Body, gussets and handle are joined in one sitting. The leather is still slightly damp, so it takes the shape and keeps it.",
    art: <path pathLength={1} d="M40 80 H160 L150 170 H50 Z M75 80 C75 30 125 30 125 80" />,
  },
  {
    name: "Finish",
    text: "The artisan signs the inside with an atelier number. The bag is theirs until it is yours.",
    art: <path pathLength={1} d="M50 120 C70 60 90 160 110 100 S150 90 160 110" />,
  },
];

const FIGURES = [
  { n: "72", label: "Hours at the bench" },
  { n: "1,200", label: "Hand stitches" },
  { n: "7", label: "Coats on every edge" },
];

export default function Atelier() {
  return (
    <main className="at-page">
      <StoryTracker />
      <div className="at-progress" aria-hidden />

      <header className="at-top">
        <Link href="/" prefetch={false}>← Index</Link>
        <span>Atelier Nº 7 · A fictional house</span>
      </header>

      <section className="at-hero">
        <p className="at-kicker">The making of a bag</p>
        <h1 className="at-hero-title">
          Atelier
          <br />
          <em>Nº 7</em>
        </h1>
        <p className="at-hero-sub">In seven gestures. Scroll slowly.</p>
        <span className="at-cue" aria-hidden />
      </section>

      <section className="at-statement" aria-label="Introduction">
        <p>
          {STATEMENT.split(" ").map((w, i) => (
            <span key={i}>{w} </span>
          ))}
        </p>
      </section>

      <section className="at-gestures" aria-label="Seven gestures">
        {GESTURES.map((g, i) => (
          <article className="at-card" key={g.name} style={{ "--i": i } as React.CSSProperties}>
            <div className="at-card-inner">
              <div className="at-card-copy">
                <p className="at-card-n">Nº {i + 1}</p>
                <h2>{g.name}</h2>
                <p>{g.text}</p>
              </div>
              <svg className="at-art" viewBox="0 0 200 200" fill="none" aria-hidden>
                {g.art}
              </svg>
            </div>
          </article>
        ))}
      </section>

      <section className="at-figures" aria-label="In numbers">
        {FIGURES.map((f) => (
          <div key={f.label}>
            <span className="at-figure-n">{f.n}</span>
            <span className="at-figure-label">{f.label}</span>
          </div>
        ))}
      </section>

      <section className="at-finale" id="at-end">
        <svg className="at-thread" viewBox="0 0 400 120" fill="none" aria-hidden>
          <path pathLength={1} d="M0 60 C80 10 120 110 200 60 S320 10 400 60" />
        </svg>
        <h2>
          Made to be <em>kept.</em>
        </h2>
        <Link href="/" prefetch={false} className="at-back">
          Back to all demos
        </Link>
      </section>

      <footer className="at-foot">
        Atelier Nº 7 is fictional. A scroll-story demo by Irvan Fahlepi, built with CSS scroll-driven animation and no
        JavaScript animation library.
      </footer>
    </main>
  );
}
