"use client";

import { useEffect, useRef } from "react";
import { LIVE_WORK, PRIVATE_WORK, type LiveWork } from "@/lib/work";
import { useScrollProgress } from "@/lib/useScrollProgress";
import type { TourFrame, TourHandle } from "@/lib/tour3d";
import "./tour.css";

/**
 * The live work, shown the way a product launch would: a modelled phone and laptop rendered in real time
 * with three.js, framed close so each project's screen is the subject. One unbroken camera move driven by
 * scroll: the phone rises and turns through its three projects, then the camera pushes on past it as the
 * laptop rises and opens ahead, and holds close through the five desktop projects.
 *
 * three.js is only fetched when the section comes near, and the scene renders only while it is moving.
 */

const PHONE_IDS = ["PingPlay", "Glow Haul Seoul", "The Last Ember"];
const LAPTOP_IDS = ["White Label", "Jak-Japan Matsuri 2026", "KCRMPI", "Ivan Solén", "CostLabs"];

const GLOW: LiveWork = {
  title: "Glow Haul Seoul",
  kind: "Beauty runner · made with Forge",
  line: "A 3D shopping-spree runner through a Seoul beauty store, built and shipped through my Forge pipeline.",
  stack: ["3D", "Forge", "Mobile web"],
  url: "https://getpingplay.com/play/feed",
  host: "getpingplay.com",
  image: "/work/game-glow-haul-seoul.webp",
  frame: "phone",
  accent: "#ff6ad5",
};

const byTitle = (t: string) => (t === GLOW.title ? GLOW : LIVE_WORK.find((w) => w.title === t)!);
const PHONE = PHONE_IDS.map(byTitle).map((w) => (w.title === "PingPlay" ? { ...w, image: "/work/pingplay-m.webp" } : w));
const LAPTOP = LAPTOP_IDS.map(byTitle);
const ITEMS = [...PHONE, ...LAPTOP];
// Backdrop colours where a brand's own accent is too dark or too grey to light a room with.
const TONES: Record<string, string> = { CostLabs: "#3a5fc8", "White Label": "#b8a990", "Ivan Solén": "#7d8fa6" };

export default function Tour() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tour = useRef<TourHandle | null>(null);
  const progress = useRef(0);

  useScrollProgress(
    root,
    (p) => {
      progress.current = p;
      tour.current?.setProgress(p);
    },
    { tail: true },
  );

  useEffect(() => {
    const el = root.current!;
    let cancelled = false;
    // Start fetching three.js a couple of screens before the section arrives.
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        try {
          const { createTour } = await import("@/lib/tour3d");
          if (cancelled) return;
          const onFrame = (f: TourFrame) => {
            const step = String(f.step);
            if (el.dataset.step !== step) el.dataset.step = step;
            // Captions rest while the camera is travelling between the phone and the laptop.
            const phase = f.p < 0.11 ? "intro" : f.p < 0.45 ? "phone" : f.p < 0.57 ? "move" : "laptop";
            if (el.dataset.phase !== phase) el.dataset.phase = phase;
          };
          tour.current = createTour(canvas.current!, { phone: PHONE.map((w) => w.image), laptop: LAPTOP.map((w) => w.image) }, onFrame);
          tour.current.setProgress(progress.current);
          el.dataset.gl = "on";
        } catch {
          // No WebGL: the plain index below still lists every project.
          el.dataset.gl = "off";
        }
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      tour.current?.dispose();
      tour.current = null;
    };
  }, []);

  return (
    <>
      <section className="tour chapter" ref={root} data-step="0" data-phase="intro" data-theme="dark" data-chapter="Live work" aria-labelledby="tour-title">
        <div className="tour-sticky chapter-sticky">
          {/* A studio backdrop per project, lit in that brand's colour; they crossfade as the screens change. */}
          <div className="tour-tones" aria-hidden>
            {ITEMS.map((w, i) => (
              <span key={w.title} data-i={i} style={{ "--tone": TONES[w.title] ?? w.accent } as React.CSSProperties} />
            ))}
          </div>
          <canvas ref={canvas} className="tour-canvas" aria-hidden />

          <div className="tour-intro">
            <p className="hub-label tour-kicker">06 — Shipped &amp; live</p>
            <h2 id="tour-title" className="tour-title">
              Eight projects.
              <br />
              <mark>All live.</mark>
            </h2>
            <p className="tour-sub">Not mock-ups. Scroll, and open any of them.</p>
          </div>

          <ol className="tour-caps">
            {ITEMS.map((w, i) => (
              <li key={w.title} className="tour-cap" data-i={i}>
                <span className="tour-n">
                  {String(i + 1).padStart(2, "0")} <i>/ 08</i>
                </span>
                <span className="tour-kind">{w.kind}</span>
                <b className="tour-name">{w.title}</b>
                <span className="tour-line">{w.line}</span>
                <span className="tour-stack">{w.stack.join(" · ")}</span>
                <a href={w.url} target="_blank" rel="noopener noreferrer" className="hub-pill hub-pill-light tour-visit" tabIndex={-1}>
                  Open {w.host} ↗
                </a>
              </li>
            ))}
          </ol>

          <span className="chapter-shade" aria-hidden />
        </div>
      </section>

      {/* Everything above in plain links, for keyboards, screen readers and anyone in a hurry */}
      <section className="tour-index chapter chapter-over" data-theme="dark" data-chapter="Index of work" aria-labelledby="tour-index-title">
        <div className="tour-index-inner">
          <h2 id="tour-index-title" className="hub-label">
            All live work
          </h2>
          <ul className="tour-links">
            {ITEMS.map((w) => (
              <li key={w.title}>
                <a href={w.url} target="_blank" rel="noopener noreferrer">
                  <b>{w.title}</b>
                  <span>{w.kind}</span>
                  <i aria-hidden>↗</i>
                </a>
              </li>
            ))}
          </ul>
          <div className="live-private">
            <p className="hub-label">From private repositories</p>
            <h3>Walkthrough on request</h3>
            <ul>
              {PRIVATE_WORK.map((p) => (
                <li key={p.title}>
                  <b>{p.title}</b>
                  <span className="live-kind">{p.kind}</span>
                  <span className="live-line">{p.line}</span>
                  <span className="live-stack">{p.stack.join(" · ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
