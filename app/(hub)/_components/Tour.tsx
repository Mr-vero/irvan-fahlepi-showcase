"use client";

import { useRef } from "react";
import { LIVE_WORK, PRIVATE_WORK, type LiveWork } from "@/lib/work";
import { useScrollProgress } from "@/lib/useScrollProgress";
import "./tour.css";

/**
 * The live work, shown the way a product launch would: one pinned shot with a phone and a laptop built
 * in CSS 3D. The phone turns to face you and the camera pushes into its screen, three phone projects play
 * on it, then it steps aside while a laptop rises and opens for five desktop projects.
 *
 * Scroll is read once per frame and turned into a handful of numbers (position, scale, rotation, lid
 * angle) written as CSS variables. Everything that moves is a transform on a composited layer.
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

// Where each project takes over the screen, as scroll progress.
const STEP_AT = [0, 0.27, 0.36, 0.63, 0.7, 0.77, 0.84, 0.91];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const last = new WeakMap<HTMLElement, string>();
function write(root: HTMLElement, sel: string, prop: "transform" | "opacity", value: string) {
  const node = root.querySelector<HTMLElement>(sel);
  if (!node) return;
  const key = `${prop}:${value}`;
  if (last.get(node) === key) return;
  last.set(node, key);
  node.style[prop] = value;
}

export default function Tour() {
  const root = useRef<HTMLElement>(null);

  useScrollProgress(
    root,
    (p) => {
      const el = root.current!;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const narrow = vw < 820;
      // The phone is laid out at the size where its screen covers the viewport (--F times its resting
      // size) and scaled down from there, so its screenshots stay sharp when the camera pushes in.
      const pw = narrow ? 230 : 300;
      const fill = Math.max(vw / pw, vh / (pw * 19.5 / 9)) * 1.08;
      // The screenshots are 640px wide, so laying the phone out bigger than ~660px adds cost, not detail.
      const F = Math.min(fill, 660 / pw);

      // Phone: arrive → turn and push in → hold full screen → step aside.
      const a = ease(seg(p, 0, 0.09));
      const z = ease(seg(p, 0.1, 0.2));
      const out = ease(seg(p, 0.44, 0.54));
      let s = mix(mix(0.72, 1, a), fill, z);
      let rx = mix(mix(52, 12, a), 0, z);
      let ry = mix(mix(-42, -26, a), 0, z);
      let tx = mix(narrow ? 0 : vw * 0.18, 0, z);
      let ty = mix(vh * 0.7, 0, a);
      s = mix(s, 0.6, out);
      rx = mix(rx, 8, out);
      ry = mix(ry, 32, out);
      tx = mix(tx, narrow ? 0 : -vw * 0.5, out);
      ty = mix(ty, narrow ? -vh * 0.6 : vh * 0.04, out);

      // Laptop: rise → open the lid → turn to face.
      const up = ease(seg(p, 0.46, 0.56));
      const lid = ease(seg(p, 0.52, 0.62));
      const face = ease(seg(p, 0.6, 0.68));
      const ls = narrow ? 0.42 : 0.8;
      const lx = mix(narrow ? 0 : vw * 0.16, narrow ? 0 : vw * 0.14, face);
      const ly = mix(vh * 0.8, narrow ? -vh * 0.16 : -vh * 0.07, up);

      // Write each device's transform straight onto that element, and only when it changed. Inherited
      // custom properties on the section would restyle every node inside it on every frame.
      const lpS = mix(ls * 0.9, ls * 1.04, face);
      write(el, ".tp-phone", "transform", `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${(s / F).toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`);
      write(el, ".tp-fade", "opacity", (1 - seg(p, 0.48, 0.56)).toFixed(3));
      write(el, ".tl-laptop", "transform", `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0) scale(${lpS.toFixed(4)}) rotateX(${mix(-30, -18, face).toFixed(2)}deg) rotateY(${mix(-26, -8, face).toFixed(2)}deg)`);
      write(el, ".tl-lid", "transform", `rotateX(${mix(-88, 0, lid).toFixed(2)}deg)`);
      write(el, ".tl-fade", "opacity", up.toFixed(3));
      if (el.style.getPropertyValue("--F") !== F.toFixed(3)) el.style.setProperty("--F", F.toFixed(3));

      // Square-on and filling the screen, the phone has no visible depth: drop its 3D body for that stretch
      // so the compositor draws one flat layer instead of a sorted 3D stack.
      const flat = z > 0.55 && out < 0.3 ? "1" : "0";
      if (el.dataset.flat !== flat) el.dataset.flat = flat;

      // A fully faded device is hidden outright, so the compositor stops drawing its layers.
      const ph = p < 0.56 ? "on" : "off";
      const lp = p > 0.46 ? "on" : "off";
      if (el.dataset.ph !== ph) el.dataset.ph = ph;
      if (el.dataset.lp !== lp) el.dataset.lp = lp;

      const step = Math.max(0, STEP_AT.filter((t) => p >= t).length - 1);
      if (el.dataset.step !== String(step)) el.dataset.step = String(step);
      const phase = p < 0.11 ? "intro" : p < 0.2 ? "zoom" : p < 0.46 ? "phone" : "laptop";
      if (el.dataset.phase !== phase) el.dataset.phase = phase;
    },
    { tail: true },
  );

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

          <div className="tour-stage" aria-hidden>
            {/* Phone: a front face, a back, and stacked slices for the body's thickness. The fade lives on
                a wrapper, because opacity on the 3D element itself would flatten it. */}
            <div className="tp-fade">
            <div className="tp-phone">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className="tp-slice" style={{ "--d": i } as React.CSSProperties} />
              ))}
              <span className="tp-back" />
              <div className="tp-front">
                <div className="tp-screen">
                  {PHONE.map((w, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={w.title} src={w.image} alt="" data-i={i} loading="lazy" decoding="async" />
                  ))}
                  <span className="tp-island" />
                </div>
              </div>
            </div>
            </div>

            {/* Laptop: a base lying flat and a lid hinged on its back edge */}
            <div className="tl-fade">
            <div className="tl-laptop">
              <div className="tl-base">
                <span className="tl-deck" />
                {Array.from({ length: 2 }, (_, i) => (
                  <span key={i} className="tl-slice" style={{ "--d": i } as React.CSSProperties} />
                ))}
              </div>
              <div className="tl-lid">
                <span className="tl-lid-back" />
                <div className="tl-screen">
                  {LAPTOP.map((w, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={w.title} src={w.image} alt="" data-i={i + PHONE.length} loading="lazy" decoding="async" />
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>

          <ol className="tour-caps">
            {ITEMS.map((w, i) => (
              <li key={w.title} className={`tour-cap ${i < PHONE.length ? "on-phone" : "on-laptop"}`} data-i={i}>
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

          <ol className="tour-dots" aria-hidden>
            {ITEMS.map((w, i) => (
              <li key={w.title} data-i={i} />
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
