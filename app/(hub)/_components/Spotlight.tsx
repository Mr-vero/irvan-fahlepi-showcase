"use client";

import Link from "next/link";
import { useRef } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

const LINES = ["Thirty seconds.", "One trained eye.", "Every score verified."];
const STEPS = [0.34, 0.5, 0.66, 0.82];

/**
 * Shade Match, Apple-keynote style: the phone starts so close its screen fills the view, then pulls back
 * into the hand while the game plays on it. The scale is scrubbed by scroll; each line of copy is a
 * class toggle with a short eased transition, so text never jitters with the scroll wheel.
 */
export default function Spotlight() {
  const root = useRef<HTMLElement>(null);

  useScrollProgress(root, (p) => {
    const el = root.current!;
    // Start scaled so the phone's screen covers the whole viewport.
    const phone = el.querySelector<HTMLElement>(".spot-phone")!;
    const cover = Math.max(window.innerWidth / phone.offsetWidth, window.innerHeight / phone.offsetHeight) * 1.15;
    el.style.setProperty("--s0", cover.toFixed(3));
    el.style.setProperty("--sp", p.toFixed(4));
    const step = STEPS.filter((s) => p >= s).length;
    if (el.dataset.step !== String(step)) el.dataset.step = String(step);
  }, { tail: true });

  return (
    <section className="spot chapter" ref={root} data-step="0" data-theme="dark" data-chapter="Play" aria-labelledby="spot-title">
      <div className="spot-sticky chapter-sticky">
        <div className="spot-glow" aria-hidden />

        <div className="spot-lines" aria-hidden>
          {LINES.map((l, i) => (
            <p key={l} className="spot-line" data-i={i + 1}>
              {l}
            </p>
          ))}
        </div>

        <div className="spot-phone" aria-hidden>
          <div className="spot-screen">
            <p className="spot-brand">Shade Match</p>
            <div className="spot-hud">
              <span>
                Score <b className="spot-score" />
              </span>
              <span>
                Streak <b>×1.4</b>
              </span>
            </div>
            <span className="spot-target" />
            <p className="spot-name">
              <span>Rosé Satin 214</span>
              <span>Cerise Velours 508</span>
              <span>Nude Soie 731</span>
            </p>
            <span className="spot-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <i key={i} />
              ))}
            </span>
            <span className="spot-tap" />
            <span className="spot-time" />
          </div>
        </div>

        <div className="spot-final">
          <p className="hub-label">01 — Beauty · Play</p>
          <h2 id="spot-title" className="spot-title">
            Shade Match
          </h2>
          <p className="spot-sub">An unofficial L’Oréal Paris concept. A 30-second colour game with a leaderboard you can’t fake.</p>
          <p className="spot-tags">OKLCH colour · WebGL gloss · Seeded rounds · Server-side replay</p>
          <Link href="/loreal-shade-match" className="hub-pill hub-pill-light">
            Play the game <span aria-hidden>↗</span>
          </Link>
        </div>
        <span className="chapter-shade" aria-hidden />
      </div>
    </section>
  );
}
