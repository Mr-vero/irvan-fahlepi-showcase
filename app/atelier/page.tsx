import Link from "next/link";
import Photo from "@/components/Photo";
import type { PhotoKey } from "@/lib/photos";
import StoryTracker from "./StoryTracker";

const STATEMENT =
  "Seventy-two hours. One artisan. Twelve hundred stitches, each one pulled by hand and set with a bone folder before the next begins.";

const GESTURES: { name: string; text: string; photo: PhotoKey }[] = [
  {
    name: "Select",
    photo: "hide",
    text: "One hide in ten is good enough. It is read by hand and by light, looking for scars, veins and the direction the leather wants to move.",
  },
  {
    name: "Cut",
    photo: "thread",
    text: "Pieces are cut with a round knife, following the grain. A straight cut across it would warp within a year.",
  },
  {
    name: "Skive",
    photo: "edge",
    text: "Every edge that will be folded is thinned to half a millimetre, so the seams lie flat and the bag holds its line.",
  },
  {
    name: "Paint",
    photo: "hideWarm",
    text: "Edges get seven coats of paint, each sanded and burnished. Rushing it shows in the first month of use.",
  },
  {
    name: "Stitch",
    photo: "stitching",
    text: "Saddle stitch, two needles through one hole, so that if a thread breaks the seam still holds.",
  },
  {
    name: "Assemble",
    photo: "walletTools",
    text: "Body, gussets and handle are joined in one sitting, while the leather is slightly damp, so it takes the shape and keeps it.",
  },
  {
    name: "Finish",
    photo: "quilted",
    text: "The artisan signs the inside with an atelier number. The bag is theirs until it is yours.",
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
        <Link href="/" prefetch={false}>
          ← Irvan Fahlepi
        </Link>
        <span>Atelier Nº 7 · A fictional house</span>
      </header>

      <section className="at-hero">
        <div className="at-hero-sticky">
          <div className="at-hero-frame">
            <Photo name="workshop" alt="An artisan at a workbench in a dim leather workshop" priority className="at-hero-photo" />
          </div>
          <div className="at-hero-copy">
            <p className="at-kicker">The making of a bag · in seven gestures</p>
            <h1 className="at-hero-title">
              Atelier <em>Nº 7</em>
            </h1>
          </div>
          <span className="at-cue" aria-hidden>
            Scroll slowly
          </span>
        </div>
      </section>

      <section className="at-statement" aria-label="Introduction">
        <p>
          {STATEMENT.split(" ").map((w, i) => (
            <span key={i}>{w} </span>
          ))}
        </p>
        <figure className="at-statement-photo">
          <Photo name="craftsman" alt="A leatherworker at his shop door" ratio={1.3} sizes="(max-width: 760px) 70vw, 360px" />
          <figcaption>Forty years at the same bench.</figcaption>
        </figure>
      </section>

      <section className="at-gestures" aria-label="Seven gestures">
        {GESTURES.map((g, i) => (
          <article className="at-card" key={g.name}>
            <div className="at-card-media">
              <Photo name={g.photo} alt="" sizes="100vw" className="at-card-photo" />
            </div>
            <div className="at-card-copy">
              <p className="at-card-n">
                <span>0{i + 1}</span> / 07
              </p>
              <h2>{g.name}</h2>
              <p>{g.text}</p>
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
        <Photo name="laces" alt="" sizes="100vw" className="at-finale-photo" />
        <div className="at-finale-copy">
          <h2>
            Made to be <em>kept.</em>
          </h2>
          <Link href="/" prefetch={false} className="at-back">
            Back to all demos
          </Link>
        </div>
      </section>

      <footer className="at-foot">
        Atelier Nº 7 is fictional · Photography via Unsplash · A scroll story by Irvan Fahlepi, built with CSS scroll-driven
        animation and no JavaScript animation library.
      </footer>
    </main>
  );
}
