"use client";

import { useEffect, useRef } from "react";
import { LIVE_WORK, PRIVATE_WORK, type LiveWork } from "@/lib/work";
import { useScrollProgress } from "@/lib/useScrollProgress";
import "./tour.css";

/**
 * The live work as a deck of full-screen cards, one project per card and no device frames. Each change
 * of card is its own move: stacked, slid, opened like an envelope, dealt, irised, swung open like doors.
 *
 * Scroll sets a target and a critically damped follower glides to it, so cards ease into place rather
 * than stepping with the wheel. Every frame writes only transforms and opacities, and only to the cards
 * taking part in the current move; the rest are hidden.
 */

const PHONE_IDS = ["PingPlay", "Glow Haul Seoul", "The Last Ember"];
const WEB_IDS = ["White Label", "Jak-Japan Matsuri 2026", "KCRMPI", "Ivan Solén", "CostLabs"];

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
const WEB = WEB_IDS.map(byTitle);
const ITEMS = [...PHONE, ...WEB];
// Card colours where a brand's own accent is too dark or too grey to carry a whole screen.
const TONES: Record<string, string> = { CostLabs: "#3a5fc8", "White Label": "#b8a990", "Ivan Solén": "#7d8fa6", KCRMPI: "#4f7a40" };

/** How each card hands over to the next: MOVES[k] takes card k to card k + 1. */
type Move = "stack" | "slide" | "envelope" | "deal" | "iris" | "rise" | "doors";
const MOVES: Move[] = ["stack", "slide", "envelope", "deal", "iris", "rise", "doors"];
// The cards that split open (envelope, doors) also render as two halves.
const SPLIT = MOVES.map((m, k) => (m === "envelope" || m === "doors" ? k : -1)).filter((k) => k >= 0);

// Timeline in card units: card 0 arrives over [0, ENTER], move k runs over [START + k, START + k + LEN].
const ENTER = 0.6;
const START = 0.9;
const LEN = 0.6;
const UNITS = ITEMS.length;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out = (t: number) => 1 - Math.pow(1 - t, 3);

type Pose = { transform: string; shade: number; on: boolean; moving: boolean };
const REST: Pose = { transform: "none", shade: 0, on: true, moving: false };
const HIDDEN: Pose = { transform: "none", shade: 0, on: false, moving: false };

/** Where the outgoing card, the incoming card and any halves are, t (0 → 1) into a move. */
function pose(move: Move, t: number): { from: Pose; to: Pose; a?: Pose; b?: Pose } {
  const e = ease(t);
  const r = 1 - e;
  const m = (transform: string, shade = 0): Pose => ({ transform, shade, on: true, moving: true });
  switch (move) {
    case "stack":
      return { from: m(`translate3d(0, ${(-3 * e).toFixed(2)}%, 0) scale(${(1 - 0.1 * e).toFixed(4)})`, 0.65 * e), to: m(`translate3d(0, ${(100 * r).toFixed(2)}%, 0)`) };
    case "slide":
      return { from: m(`translate3d(${(-32 * e).toFixed(2)}%, 0, 0)`, 0.7 * e), to: m(`translate3d(${(100 * r).toFixed(2)}%, 0, 0)`) };
    case "envelope":
      return {
        from: HIDDEN,
        to: m(`scale(${(1.14 - 0.14 * out(t)).toFixed(4)})`),
        a: m(`translate3d(0, ${(-100 * e).toFixed(2)}%, 0)`),
        b: m(`translate3d(0, ${(100 * e).toFixed(2)}%, 0)`),
      };
    case "deal":
      return {
        from: m(`scale(${(1 - 0.08 * e).toFixed(4)}) rotate(${(-2.5 * e).toFixed(3)}deg)`, 0.6 * e),
        to: m(`translate3d(${(55 * r).toFixed(2)}%, ${(115 * r).toFixed(2)}%, 0) rotate(${(14 * r).toFixed(3)}deg)`),
      };
    case "iris":
      return { from: m(`scale(${(1 + 0.12 * e).toFixed(4)})`, 0.75 * e), to: m(`scale(${(0.2 + 0.8 * out(t)).toFixed(4)})`) };
    case "rise":
      return {
        from: m(`translate3d(0, ${(-18 * e).toFixed(2)}%, 0)`, 0.7 * e),
        to: m(`translate3d(0, ${(100 * r).toFixed(2)}%, 0) rotate(${(-5 * r).toFixed(3)}deg)`),
      };
    case "doors":
      return {
        from: HIDDEN,
        to: m(`scale(${(1.12 - 0.12 * out(t)).toFixed(4)})`),
        a: m(`translate3d(${(-100 * e).toFixed(2)}%, 0, 0)`),
        b: m(`translate3d(${(100 * e).toFixed(2)}%, 0, 0)`),
      };
  }
}

/** Every card's pose at u card units into the timeline, plus the halves of any card splitting open. */
function frame(u: number) {
  const cards: Pose[] = ITEMS.map(() => HIDDEN);
  const halves: Record<number, [Pose, Pose]> = {};
  if (u < START) {
    // Card 0 arrives as a small card from below and grows to fill the screen.
    const t = out(clamp(u / ENTER));
    cards[0] = t >= 1 ? REST : { transform: `translate3d(0, ${(40 * (1 - t)).toFixed(2)}%, 0) scale(${(0.42 + 0.58 * t).toFixed(4)})`, shade: 0, on: u > 0.02, moving: true };
    return { cards, halves, step: 0 };
  }
  const k = Math.min(MOVES.length - 1, Math.floor(u - START));
  const t = clamp((u - START - k) / LEN);
  if (t <= 0) cards[k] = REST;
  else if (t >= 1) cards[k + 1] = REST;
  else {
    const p = pose(MOVES[k], t);
    cards[k] = p.from;
    cards[k + 1] = p.to;
    if (p.a && p.b) halves[k] = [p.a, p.b];
  }
  return { cards, halves, step: t > 0.5 ? k + 1 : k };
}

const last = new WeakMap<HTMLElement, string>();
function apply(node: HTMLElement | null, p: Pose) {
  if (!node) return;
  const key = `${p.on}|${p.moving}|${p.transform}|${p.shade}`;
  if (last.get(node) === key) return;
  last.set(node, key);
  node.toggleAttribute("data-on", p.on);
  node.toggleAttribute("data-moving", p.moving);
  node.style.transform = p.transform;
  node.style.setProperty("--shade", p.shade.toFixed(3));
}

function Card({ w, i, half }: { w: LiveWork; i: number; half?: "a" | "b" }) {
  const phone = i < PHONE.length;
  return (
    <div
      className={`tc ${phone ? "tc-phone" : "tc-web"}`}
      data-card={half ? undefined : i}
      data-half={half}
      style={{ "--tone": TONES[w.title] ?? w.accent } as React.CSSProperties}
    >
      <div className="tc-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="tc-shot" src={w.image} alt="" loading="lazy" decoding="async" />
        {phone && (
          <p className="tc-display" aria-hidden>
            {w.title}
          </p>
        )}
        <div className="tour-cap" data-i={half ? undefined : i}>
          <span className="tour-n">
            {String(i + 1).padStart(2, "0")} <i>/ 08</i>
          </span>
          <span className="tour-kind">{w.kind}</span>
          <b className="tour-name">{w.title}</b>
          <span className="tour-line">{w.line}</span>
          <a href={w.url} target="_blank" rel="noopener noreferrer" className="hub-pill hub-pill-light tour-visit" tabIndex={-1}>
            Open {w.host} ↗
          </a>
        </div>
      </div>
      <span className="tc-shade" />
    </div>
  );
}

export default function Tour() {
  const root = useRef<HTMLElement>(null);
  const target = useRef(0);
  const kick = useRef<() => void>(() => {});

  useScrollProgress(
    root,
    (p) => {
      target.current = p;
      kick.current();
    },
    { tail: true },
  );

  useEffect(() => {
    const el = root.current!;
    const cards = ITEMS.map((_, i) => el.querySelector<HTMLElement>(`[data-card="${i}"]`));
    const halves = new Map(
      SPLIT.map((k) => [k, [el.querySelector<HTMLElement>(`[data-split="${k}"] [data-half="a"]`), el.querySelector<HTMLElement>(`[data-split="${k}"] [data-half="b"]`)]] as const),
    );
    let current = target.current;
    let raf = 0;
    let prev = performance.now();

    const render = (p: number) => {
      const f = frame(p * UNITS);
      f.cards.forEach((pose, i) => apply(cards[i], pose));
      halves.forEach(([a, b], k) => {
        const h = f.halves[k];
        apply(a, h ? h[0] : HIDDEN);
        apply(b, h ? h[1] : HIDDEN);
      });
      const step = String(f.step);
      if (el.dataset.step !== step) el.dataset.step = step;
      const phase = p * UNITS < ENTER * 0.5 ? "intro" : "cards";
      if (el.dataset.phase !== phase) el.dataset.phase = phase;
    };

    const loop = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      current += (target.current - current) * (1 - Math.exp(-dt * 8));
      if (Math.abs(target.current - current) < 0.00005) current = target.current;
      render(current);
      if (current !== target.current) raf = requestAnimationFrame(loop);
    };
    kick.current = () => {
      if (raf) return;
      prev = performance.now();
      raf = requestAnimationFrame(loop);
    };
    render(current);
    return () => {
      cancelAnimationFrame(raf);
      kick.current = () => {};
    };
  }, []);

  return (
    <>
      <section className="tour chapter" ref={root} data-step="0" data-phase="intro" data-theme="dark" data-chapter="Live work" aria-labelledby="tour-title">
        <div className="tour-sticky chapter-sticky">
          <div className="tour-intro">
            <p className="hub-label tour-kicker">06 — Shipped &amp; live</p>
            <h2 id="tour-title" className="tour-title">
              Eight projects.
              <br />
              <mark>All live.</mark>
            </h2>
            <p className="tour-sub">Not mock-ups. Scroll, and open any of them.</p>
          </div>

          <div className="tour-deck">
            {ITEMS.map((w, i) => (
              <Card key={w.title} w={w} i={i} />
            ))}
            {SPLIT.map((k) => (
              <div key={k} className="tc-split" data-split={k} data-move={MOVES[k]} aria-hidden>
                <Card w={ITEMS[k]} i={k} half="a" />
                <Card w={ITEMS[k]} i={k} half="b" />
              </div>
            ))}
          </div>

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
