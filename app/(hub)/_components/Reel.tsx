"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import Photo from "@/components/Photo";
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

function timecode(t: number) {
  const frames = Math.floor((t % 1) * 24);
  const s = Math.floor(t);
  return `00:00:${String(s).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

export default function Reel() {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      const scenes = SCENES.map((s) => q(`[data-scene="${s.id}"]`)[0]);
      gsap.set(scenes, { autoAlpha: 0 });
      const bg = (id: string) => q(`[data-scene="${id}"] .reel-bg`);
      const word = (id: string) => q(`[data-scene="${id}"] .reel-word-char`);
      const caption = (id: string) => q(`[data-scene="${id}"] .reel-caption`);

      const t = gsap.timeline({ repeat: -1, defaults: { ease: "expo.out" } });

      // Intro: the name slams up out of a mask on vermilion.
      t.addLabel("intro")
        .set(scenes[0], { autoAlpha: 1 })
        .from(q(".reel-char"), { yPercent: 120, duration: 1, stagger: 0.03 }, "intro+=0.1")
        .from(q(".reel-sub > *"), { y: 14, opacity: 0, duration: 0.7, stagger: 0.08 }, "-=0.6")
        .to(q(".reel-char"), { yPercent: -120, duration: 0.55, stagger: 0.012, ease: "expo.in" }, "+=1.1")
        .to(q(".reel-sub > *"), { opacity: 0, duration: 0.3 }, "<")
        .set(scenes[0], { autoAlpha: 0 });

      // Each photo scene: a hard cut in, a slow push on the photo, the word typed up letter by letter.
      const photoScene = (id: string, i: number, hold: number, build: (at: string) => void) => {
        t.addLabel(id)
          .set(scenes[i], { autoAlpha: 1 })
          .fromTo(bg(id), { scale: 1.18 }, { scale: 1, duration: hold + 1.4, ease: "none" }, id)
          .fromTo(q(`[data-scene="${id}"] .reel-wipe`), { scaleY: 1 }, { scaleY: 0, duration: 0.7, ease: "expo.inOut" }, id)
          .from(word(id), { yPercent: 110, duration: 0.8, stagger: 0.04 }, `${id}+=0.35`)
          .from(caption(id), { opacity: 0, y: 10, duration: 0.6 }, `${id}+=0.6`);
        build(id);
        t.to(scenes[i], { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, `${id}+=${hold + 1}`);
      };

      photoScene("play", 1, 2.6, (at) => {
        const sw = q(".reel-swatch");
        t.from(sw, { scale: 0, duration: 0.7, stagger: { each: 0.05, from: "center" }, ease: "back.out(2.2)" }, `${at}+=0.5`)
          .to(sw.filter((_, i) => i !== TARGET), { scale: 0.78, opacity: 0.3, duration: 0.5, stagger: 0.02, ease: "power3.inOut" }, `${at}+=1.6`)
          .fromTo(q(".reel-ring"), { scale: 1.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 }, `${at}+=1.7`);
      });

      photoScene("ask", 2, 2.6, (at) => {
        t.from(q(".reel-bar-fill"), { scaleX: 0, duration: 1.2, stagger: 0.1 }, `${at}+=0.5`)
          .from(q(".reel-bar-num"), { textContent: 0, snap: { textContent: 1 }, duration: 1.2, stagger: 0.1, ease: "power2.out" }, "<")
          .from(q(".reel-bar-label"), { opacity: 0, x: -8, duration: 0.5, stagger: 0.1 }, "<");
      });

      photoScene("tell", 3, 2.4, (at) => {
        t.fromTo(q(".reel-draw"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, stagger: 0.2, ease: "power2.inOut" }, `${at}+=0.4`);
      });

      photoScene("ship", 4, 2.8, (at) => {
        t.from(q(".reel-node"), { scale: 0, opacity: 0, duration: 0.45, stagger: 0.18, ease: "back.out(2)" }, `${at}+=0.5`)
          .from(q(".reel-link"), { scaleX: 0, duration: 0.25, stagger: 0.18, ease: "power2.out" }, `${at}+=0.7`)
          .from(q(".reel-node-label"), { opacity: 0, y: 6, duration: 0.35, stagger: 0.18 }, `${at}+=0.55`)
          .to(q(".reel-node"), { backgroundColor: "#ff3d1f", borderColor: "#ff3d1f", duration: 0.2, stagger: 0.07 }, `${at}+=1.9`);
      });
      t.addLabel("end");

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
        t.seek(t.labels.play + 2.5).pause();
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

  const letters = (w: string) =>
    w.split("").map((c, i) => (
      <span className="reel-word-mask" key={i}>
        <span className="reel-word-char">{c}</span>
      </span>
    ));

  return (
    <section className="reel-wrap" aria-labelledby="reel-title">
      <div className="reel-head">
        <h2 id="reel-title" className="hub-label">
          Showreel
        </h2>
        <p className="hub-label hub-label-dim">17 seconds · built in code, not edited video</p>
      </div>

      <div className="reel" ref={root}>
        <div className="reel-scene reel-scene-intro" data-scene="intro">
          <p className="reel-name" aria-label={SITE.name}>
            {SITE.name.split("").map((c, i) => (
              <span className="reel-char-mask" key={i} aria-hidden>
                <span className="reel-char">{c === " " ? " " : c}</span>
              </span>
            ))}
          </p>
          <p className="reel-sub">
            <span>Play</span>
            <span>Ask</span>
            <span>Tell</span>
            <span>Ship</span>
          </p>
        </div>

        <div className="reel-scene" data-scene="play" aria-hidden>
          <Photo name="redDress" alt="" className="reel-bg" sizes="(max-width: 900px) 100vw, 1200px" />
          <span className="reel-wipe" />
          <p className="reel-word">{letters("Play.")}</p>
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
          <Photo name="peony" alt="" className="reel-bg" sizes="(max-width: 900px) 100vw, 1200px" />
          <span className="reel-wipe" />
          <p className="reel-word">{letters("Ask.")}</p>
          <div className="reel-graphic reel-bars">
            {BARS.map((b) => (
              <div className="reel-bar" key={b.label}>
                <span className="reel-bar-label">{b.label}</span>
                <span className="reel-bar-track">
                  <span className="reel-bar-fill" style={{ width: `${b.value * 2.6}%` }} />
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
          <Photo name="workshop" alt="" className="reel-bg" sizes="(max-width: 900px) 100vw, 1200px" />
          <span className="reel-wipe" />
          <p className="reel-word">{letters("Tell.")}</p>
          <svg className="reel-graphic reel-bag" viewBox="0 0 400 320" fill="none">
            <path className="reel-draw" pathLength={1} d="M150 120 C150 60 250 60 250 120" />
            <path className="reel-draw" pathLength={1} d="M70 120 H330 L300 300 H100 Z" />
            <path className="reel-draw" pathLength={1} d="M70 120 L200 190 L330 120" />
            <path className="reel-draw reel-stitch" pathLength={1} d="M88 140 L200 202 L312 140" />
            <circle className="reel-draw" pathLength={1} cx="200" cy="196" r="9" />
          </svg>
          <p className="reel-caption">03 — Atelier Nº 7 · scroll story</p>
        </div>

        <div className="reel-scene" data-scene="ship" aria-hidden>
          <Photo name="hideDark" alt="" className="reel-bg" sizes="(max-width: 900px) 100vw, 1200px" />
          <span className="reel-wipe" />
          <p className="reel-word">{letters("Ship.")}</p>
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

        <div className="reel-hud reel-hud-top" aria-hidden>
          <span>
            <i className="reel-rec" /> Reel / 2026
          </span>
          <span className="reel-tc">00:00:00:00</span>
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
        </div>
      </div>
    </section>
  );
}
