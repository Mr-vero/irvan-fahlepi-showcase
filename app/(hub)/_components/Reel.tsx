"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";

const SCENES = [
  { id: "intro", label: "Intro" },
  { id: "play", label: "Play" },
  { id: "ask", label: "Ask" },
  { id: "tell", label: "Tell" },
  { id: "ship", label: "Ship" },
] as const;

const SWATCHES = [
  "oklch(58% 0.15 12)",
  "oklch(66% 0.11 40)",
  "oklch(48% 0.13 20)",
  "oklch(72% 0.08 55)",
  "oklch(55% 0.16 5)",
  "oklch(62% 0.12 30)",
  "oklch(42% 0.09 35)",
  "oklch(76% 0.07 60)",
  "oklch(52% 0.14 355)",
];
const TARGET = 4;

const BARS = [
  { label: "Floral", value: 34 },
  { label: "Woody", value: 27 },
  { label: "Citrus", value: 22 },
  { label: "Amber", value: 17 },
];

const PIPELINE = ["Prototype", "Build", "QA", "Deploy", "Measure"];
const GLOWS = ["#3a3329", "#6b1f36", "#5a4527", "#4a2c1c", "#3b4a1a"];

function timecode(t: number) {
  const frames = Math.floor((t % 1) * 24);
  const s = Math.floor(t);
  return `00:00:${String(s).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

export default function Reel() {
  const root = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      const scenes = SCENES.map((s) => q(`[data-scene="${s.id}"]`)[0]);
      gsap.set(scenes, { autoAlpha: 0 });

      const t = gsap.timeline({ repeat: -1, defaults: { ease: "expo.out" } });

      // Intro: the name rises out of a mask, letter by letter.
      t.addLabel("intro")
        .set(scenes[0], { autoAlpha: 1 })
        .to(q(".reel-glow"), { backgroundColor: GLOWS[0], duration: 1.2, ease: "sine.inOut" }, "intro")
        .from(q(".reel-char"), { yPercent: 115, duration: 1.1, stagger: 0.035 }, "intro+=0.1")
        .from(q(".reel-sub > *"), { y: 14, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=0.7")
        .to(q(".reel-char"), { yPercent: -115, duration: 0.6, stagger: 0.015, ease: "expo.in" }, "+=1.4")
        .to(q(".reel-sub > *"), { opacity: 0, duration: 0.3 }, "<")
        .set(scenes[0], { autoAlpha: 0 });

      // Play: swatches pop from the centre, the match is ringed, the rest recede.
      const sw = q(".reel-swatch");
      const others = sw.filter((_, i) => i !== TARGET);
      t.addLabel("play")
        .set(scenes[1], { autoAlpha: 1 })
        .to(q(".reel-glow"), { backgroundColor: GLOWS[1], duration: 1.2, ease: "sine.inOut" }, "play")
        .fromTo(q('[data-scene="play"] .reel-word'), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1 }, "play")
        .from(sw, { scale: 0, duration: 0.8, stagger: { each: 0.05, from: "center" }, ease: "back.out(2.2)" }, "play+=0.15")
        .from(q('[data-scene="play"] .reel-caption'), { opacity: 0, y: 10, duration: 0.6 }, "play+=0.5")
        .to(others, { scale: 0.78, opacity: 0.28, duration: 0.6, stagger: 0.025, ease: "power3.inOut" }, "+=0.35")
        .fromTo(q(".reel-ring"), { scale: 1.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7 }, "<0.1")
        .to(scenes[1], { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, "+=0.9");

      // Ask: answers grow into a live distribution.
      t.addLabel("ask")
        .set(scenes[2], { autoAlpha: 1 })
        .to(q(".reel-glow"), { backgroundColor: GLOWS[2], duration: 1.2, ease: "sine.inOut" }, "ask")
        .fromTo(q('[data-scene="ask"] .reel-word'), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1 }, "ask")
        .from(q(".reel-bar-fill"), { scaleX: 0, duration: 1.3, stagger: 0.12 }, "ask+=0.2")
        .from(q(".reel-bar-num"), { textContent: 0, snap: { textContent: 1 }, duration: 1.3, stagger: 0.12, ease: "power2.out" }, "<")
        .from(q(".reel-bar-label"), { opacity: 0, x: -8, duration: 0.6, stagger: 0.12 }, "<")
        .from(q('[data-scene="ask"] .reel-caption'), { opacity: 0, y: 10, duration: 0.6 }, "ask+=0.5")
        .to(scenes[2], { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, "+=1.1");

      // Tell: the bag is drawn in one line, then stitched.
      t.addLabel("tell")
        .set(scenes[3], { autoAlpha: 1 })
        .to(q(".reel-glow"), { backgroundColor: GLOWS[3], duration: 1.2, ease: "sine.inOut" }, "tell")
        .fromTo(q('[data-scene="tell"] .reel-word'), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1 }, "tell")
        .fromTo(q(".reel-draw"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, stagger: 0.25, ease: "power2.inOut" }, "tell+=0.1")
        .fromTo(q(".reel-stitch-mask"), { attr: { width: 0 } }, { attr: { width: 400 }, duration: 1.2, ease: "power1.inOut" }, "-=0.8")
        .from(q('[data-scene="tell"] .reel-caption'), { opacity: 0, y: 10, duration: 0.6 }, "tell+=0.5")
        .to(scenes[3], { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, "+=0.8");

      // Ship: the pipeline connects node by node and turns green.
      t.addLabel("ship")
        .set(scenes[4], { autoAlpha: 1 })
        .to(q(".reel-glow"), { backgroundColor: GLOWS[4], duration: 1.2, ease: "sine.inOut" }, "ship")
        .fromTo(q('[data-scene="ship"] .reel-word'), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1 }, "ship")
        .from(q(".reel-node"), { scale: 0, opacity: 0, duration: 0.5, stagger: 0.22, ease: "back.out(2)" }, "ship+=0.2")
        .from(q(".reel-link"), { scaleX: 0, duration: 0.3, stagger: 0.22, ease: "power2.out" }, "ship+=0.45")
        .from(q(".reel-node-label"), { opacity: 0, y: 6, duration: 0.4, stagger: 0.22 }, "ship+=0.3")
        .to(q(".reel-node"), { backgroundColor: "#c8f560", borderColor: "#c8f560", duration: 0.25, stagger: 0.08 }, "+=0.2")
        .from(q('[data-scene="ship"] .reel-caption'), { opacity: 0, y: 10, duration: 0.6 }, "ship+=0.5")
        .to(scenes[4], { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "+=1.2")
        .addLabel("end");

      // Timecode and the progress segments follow the playhead.
      const starts = SCENES.map((s) => t.labels[s.id]);
      const ends = [...starts.slice(1), t.labels.end];
      const fills = q(".reel-seg-fill");
      const tc = q(".reel-tc")[0];
      t.eventCallback("onUpdate", () => {
        const now = t.time();
        tc.textContent = timecode(now);
        fills.forEach((f, i) => {
          const p = gsap.utils.clamp(0, 1, (now - starts[i]) / (ends[i] - starts[i]));
          (f as HTMLElement).style.transform = `scaleX(${p})`;
        });
      });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        t.seek("intro+=2.2").pause();
        setPaused(true);
      }
      tl.current = t;
    }, el);

    // Don't spend frames on a reel nobody is looking at.
    const io = new IntersectionObserver(([entry]) => {
      const t = tl.current;
      if (!t || t.paused() === !entry.isIntersecting) return;
      if (!entry.isIntersecting) t.pause();
      else if (!el.dataset.userPaused) t.play();
    });
    io.observe(el);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, []);

  const toggle = () => {
    const t = tl.current;
    if (!t) return;
    const next = !t.paused();
    t.paused(next);
    root.current!.dataset.userPaused = next ? "1" : "";
    setPaused(next);
  };

  const jump = (id: string) => {
    tl.current?.seek(id);
    if (!paused) tl.current?.play();
  };

  const nameChars = SITE.name.split("");

  return (
    <section className="reel" ref={root} aria-label="Showreel">
      <div className="reel-glow" aria-hidden />
      <div className="reel-grain" aria-hidden />

      <div className="reel-hud reel-hud-top" aria-hidden>
        <span>Reel / 2026</span>
        <span className="reel-tc">00:00:00:00</span>
      </div>

      <div className="reel-scene reel-scene-intro" data-scene="intro">
        <h1 className="reel-name" aria-label={SITE.name}>
          {nameChars.map((c, i) => (
            <span className="reel-char-mask" key={i} aria-hidden>
              <span className="reel-char">{c === " " ? " " : c}</span>
            </span>
          ))}
        </h1>
        <p className="reel-sub">
          <span>Interactive developer</span>
          <span>Games · Surveys · Stories</span>
          <span>Prototype → Live</span>
        </p>
      </div>

      <div className="reel-scene" data-scene="play" aria-hidden>
        <p className="reel-word">Play.</p>
        <div className="reel-graphic reel-swatches">
          {SWATCHES.map((c, i) => (
            <span key={i} className="reel-swatch" style={{ background: c }}>
              {i === TARGET && <span className="reel-ring" />}
            </span>
          ))}
        </div>
        <p className="reel-caption">01 — Shade Match · L’Oréal Paris concept</p>
      </div>

      <div className="reel-scene" data-scene="ask" aria-hidden>
        <p className="reel-word">Ask.</p>
        <div className="reel-graphic reel-bars">
          {BARS.map((b) => (
            <div className="reel-bar" key={b.label}>
              <span className="reel-bar-label">{b.label}</span>
              <span className="reel-bar-track">
                <span className="reel-bar-fill" style={{ width: `${b.value * 2.4}%` }} />
              </span>
              <span className="reel-bar-value">
                <span className="reel-bar-num">{b.value}</span>%
              </span>
            </div>
          ))}
        </div>
        <p className="reel-caption">02 — Maison Lumière · live survey</p>
      </div>

      <div className="reel-scene" data-scene="tell" aria-hidden>
        <p className="reel-word">Tell.</p>
        <svg className="reel-graphic reel-bag" viewBox="0 0 400 320" fill="none">
          <defs>
            <mask id="stitch-mask">
              <rect className="reel-stitch-mask" x="0" y="0" width="0" height="320" fill="#fff" />
            </mask>
          </defs>
          <path className="reel-draw" pathLength={1} d="M150 120 C150 60 250 60 250 120" />
          <path className="reel-draw" pathLength={1} d="M70 120 H330 L300 300 H100 Z" />
          <path className="reel-draw" pathLength={1} d="M70 120 L200 190 L330 120" />
          <path className="reel-stitch" mask="url(#stitch-mask)" d="M88 138 L200 200 L312 138 M108 284 H292" />
          <circle className="reel-draw" pathLength={1} cx="200" cy="196" r="9" />
        </svg>
        <p className="reel-caption">03 — Atelier Nº 7 · scroll story</p>
      </div>

      <div className="reel-scene" data-scene="ship" aria-hidden>
        <p className="reel-word">Ship.</p>
        <div className="reel-graphic reel-pipeline">
          {PIPELINE.map((p, i) => (
            <div className="reel-step" key={p}>
              {i > 0 && <span className="reel-link" />}
              <span className="reel-node" />
              <span className="reel-node-label">{p}</span>
            </div>
          ))}
        </div>
        <p className="reel-caption">04 — The Lab · QA, deploy, analytics</p>
      </div>

      <div className="reel-hud reel-hud-bottom">
        <button className="reel-toggle" onClick={toggle} aria-label={paused ? "Play reel" : "Pause reel"}>
          {paused ? "▶" : "❚❚"}
        </button>
        <ol className="reel-segs">
          {SCENES.map((s) => (
            <li key={s.id}>
              <button onClick={() => jump(s.id)} aria-label={`Jump to ${s.label}`}>
                <span className="reel-seg-track">
                  <span className="reel-seg-fill" />
                </span>
                <span className="reel-seg-label">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <a href="#work" className="reel-scroll">
          Scroll
        </a>
      </div>
    </section>
  );
}
