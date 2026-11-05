"use client";

import { useEffect, useRef } from "react";
import Photo from "@/components/Photo";

/**
 * One pinned scene in four beats, all driven by a single scroll value, --p (0 → 1):
 *   1. an "IF" sheet zooms open onto three photographs,
 *   2. the photos dissolve into a sketchbook whose pencil lines draw with the scroll,
 *   3. a collage pops in over the sketch, piece by piece,
 *   4. the headline rises.
 *
 * Smoothness comes from doing as little as possible per frame: scroll is read once per animation frame
 * and written to one CSS variable; the sheet zoom and line drawing are calc()s on that variable; and
 * collage pieces only toggle a class when their threshold is crossed, so each pop is a short,
 * time-based spring on transform and opacity that the compositor runs on its own.
 */
const MAX_SCALE = 9;

const POPS: { cls: string; at: number }[] = [
  { cls: "pop-portrait", at: 0.44 },
  { cls: "pop-phone", at: 0.49 },
  { cls: "pop-badge", at: 0.53 },
  { cls: "pop-swatch", at: 0.56 },
  { cls: "pop-perfume", at: 0.59 },
  { cls: "pop-survey", at: 0.62 },
  { cls: "pop-leather", at: 0.65 },
  { cls: "pop-score", at: 0.68 },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const pops = POPS.map((p) => ({ ...p, node: el.querySelector<HTMLElement>(`.${p.cls}`)! }));

    const render = (p: number) => {
      el.style.setProperty("--p", p.toFixed(4));
      el.dataset.sheet = p < 0.3 ? "on" : "off";
      for (const pop of pops) pop.node.classList.toggle("is-in", p >= pop.at);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(1);
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      render(Math.min(1, Math.max(0, -rect.top / Math.max(1, travel))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="hero" ref={root} aria-label="Irvan Fahlepi" style={{ "--max": MAX_SCALE } as React.CSSProperties}>
      <div className="hero-sticky">
        {/* Beat 2–3: the sketchbook and its collage */}
        <div className="hero-book" aria-hidden>
          <svg className="hero-sketch" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" fill="none">
            <g className="sk sk-a">
              {/* Paris skyline */}
              <path pathLength={1} d="M40 760 H1560" />
              <path pathLength={1} d="M120 760 V610 H220 V570 L250 540 L280 570 V610 H360 V760" />
              <path pathLength={1} d="M420 760 V660 Q470 590 520 660 V760" />
              <path pathLength={1} d="M1150 760 L1190 420 L1230 760 M1164 640 H1216 M1176 540 H1204 M1190 420 V380" />
              <path pathLength={1} d="M1300 760 V640 H1380 V600 H1440 V760" />
            </g>
            <g className="sk sk-b">
              {/* croquis */}
              <circle pathLength={1} cx="900" cy="250" r="34" />
              <path pathLength={1} d="M900 284 V312 M838 330 Q900 310 962 330 M860 336 L816 640 Q900 676 984 640 L940 336" />
              <path pathLength={1} d="M838 330 L800 470 M962 330 L1004 462 M876 660 L866 790 M924 660 L940 790" />
              <path pathLength={1} d="M842 420 Q900 440 958 420" opacity="0.5" />
            </g>
            <g className="sk sk-c">
              {/* lipstick, bottle, bag */}
              <path pathLength={1} d="M300 380 H360 V500 H300 Z M308 380 V318 L352 296 V380" />
              <path pathLength={1} d="M1290 240 H1340 V280 H1290 Z M1270 290 H1360 Q1376 290 1376 306 V426 Q1376 442 1360 442 H1270 Q1254 442 1254 426 V306 Q1254 290 1270 290 Z" />
              <path pathLength={1} d="M520 520 H660 L648 640 H532 Z M550 520 Q590 460 630 520" />
              <path pathLength={1} d="M1040 180 L1050 200 L1072 204 L1056 220 L1060 242 L1040 232 L1020 242 L1024 220 L1008 204 L1030 200 Z" opacity="0.6" />
            </g>
          </svg>

          <div className="hero-collage">
            <figure className="pop pop-portrait">
              <Photo name="redDress" alt="" ratio={1.3} sizes="(max-width: 820px) 46vw, 26vw" />
            </figure>

            <div className="pop pop-phone">
              <div className="phone">
                <span className="phone-notch" />
                <p className="phone-brand">Shade Match</p>
                <span className="phone-target" />
                <p className="phone-name">Rosé Satin 214</p>
                <span className="phone-grid">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <span className="phone-bar" />
              </div>
            </div>

            <div className="pop pop-badge">
              <span className="badge-strap" />
              <div className="badge">
                <span className="badge-hole" />
                <p className="badge-mark">IF</p>
                <p className="badge-name">Irvan Fahlepi</p>
                <p className="badge-role">Interactive · Paris / Remote</p>
              </div>
            </div>

            <figure className="pop pop-swatch">
              <Photo name="swatches" alt="" ratio={1.15} sizes="200px" />
            </figure>
            <figure className="pop pop-perfume">
              <Photo name="goldenBottles" alt="" ratio={1} sizes="180px" />
            </figure>

            <div className="pop pop-survey">
              <p className="survey-k">Your signature</p>
              <p className="survey-n">Rose Nocturne</p>
              <span className="survey-bars">
                <i style={{ width: "86%" }} />
                <i style={{ width: "58%" }} />
                <i style={{ width: "40%" }} />
              </span>
            </div>

            <figure className="pop pop-leather">
              <Photo name="stitching" alt="" ratio={1.2} sizes="170px" />
            </figure>

            <p className="pop pop-score">
              <b>9,240</b> Expert eye ✦
            </p>
          </div>

        </div>

        <div className="hero-copy">
          <p className="hero-kicker">From sketch to live</p>
          <h1 className="hero-title">
            Games, quizzes
            <br />
            &amp; stories people
            <br />
            actually <span>finish.</span>
          </h1>
        </div>

        {/* Beat 1: three photographs seen through the monogram */}
        <div className="hero-photos" aria-hidden>
          <Photo name="redDress" alt="" sizes="44vw" priority />
          <Photo name="orange" alt="" sizes="22vw" priority />
          <Photo name="workshop" alt="" sizes="34vw" priority />
        </div>

        <svg className="hero-sheet" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <defs>
            <mask id="hero-cut" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="6600">
              <rect x="-3000" y="-3000" width="7000" height="6600" fill="#fff" />
              <rect x="318" y="110" width="104" height="380" rx="6" fill="#000" />
              <rect x="458" y="110" width="104" height="380" rx="6" fill="#000" />
              <rect x="458" y="110" width="250" height="96" rx="6" fill="#000" />
              <rect x="458" y="258" width="200" height="88" rx="6" fill="#000" />
            </mask>
          </defs>
          <rect x="-3000" y="-3000" width="7000" height="6600" mask="url(#hero-cut)" className="hero-sheet-fill" />
        </svg>

        <p className="hero-hint" aria-hidden>
          <span>↘</span> Scroll to unlock
        </p>
        <span className="hero-progress" aria-hidden />
      </div>
    </section>
  );
}
