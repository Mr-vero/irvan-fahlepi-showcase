"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import Photo from "@/components/Photo";
import type { PhotoKey } from "@/lib/photos";
import { SITE } from "@/lib/site";

type Shot = { id: string; label: string; n: string; title: string; word: string; photo?: PhotoKey; image?: string };

const SHOTS: Shot[] = [
  { id: "play", label: "Play", n: "Nº 01", title: "Shade Match", word: "Play", photo: "redDress" },
  { id: "ask", label: "Ask", n: "Nº 02", title: "Maison Lumière", word: "Ask", photo: "peony" },
  { id: "tell", label: "Tell", n: "Nº 03", title: "Atelier Nº 7", word: "Tell", photo: "workshop" },
  { id: "forge", label: "Forge", n: "Nº 04", title: "PingPlay Forge", word: "Ship", image: "/work/forge.webp" },
];
const SCENES = [{ id: "intro", label: "Title" }, ...SHOTS, { id: "end", label: "End" }];

const HOLD = 3.2;
const FADE = 1.1;

function timecode(t: number) {
  const frames = Math.floor((t % 1) * 24);
  const s = Math.floor(t);
  return `00:00:${String(s).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

/**
 * A short film in code: a title card, four shots and an end card. Each shot is a slow push-in on a still,
 * long crossfades between them, credit lines whose tracking settles as they appear, and one word per
 * shot that pulls into focus. Everything is transform, opacity and filter on a few layers.
 */
export default function Reel() {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      const scene = (id: string) => q(`[data-scene="${id}"]`)[0];
      gsap.set(q(".reel-scene"), { autoAlpha: 0 });

      const t = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });

      // Title card.
      t.addLabel("intro")
        .set(scene("intro"), { autoAlpha: 1 })
        .fromTo(q(".reel-card-pre"), { opacity: 0, letterSpacing: "0.9em" }, { opacity: 1, letterSpacing: "0.5em", duration: 1.6, ease: "power3.out" }, "intro+=0.2")
        .fromTo(q(".reel-card-name"), { opacity: 0, letterSpacing: "0.6em", filter: "blur(10px)" }, { opacity: 1, letterSpacing: "0.32em", filter: "blur(0px)", duration: 2, ease: "power3.out" }, "intro+=0.5")
        .fromTo(q(".reel-card-rule"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power3.inOut" }, "intro+=1.1")
        .to(scene("intro"), { autoAlpha: 0, duration: FADE, ease: "power1.inOut" }, "intro+=3.4");

      SHOTS.forEach((s, i) => {
        const at = `intro+=${3.4 + i * (HOLD + 0.2)}`;
        t.addLabel(s.id, at)
          .fromTo(scene(s.id), { autoAlpha: 0 }, { autoAlpha: 1, duration: FADE, ease: "power1.inOut" }, s.id)
          .fromTo(q(`[data-scene="${s.id}"] .reel-shot`), { scale: 1.14, xPercent: i % 2 ? -2 : 2 }, { scale: 1, xPercent: 0, duration: HOLD + FADE * 2, ease: "none" }, s.id)
          .fromTo(q(`[data-scene="${s.id}"] .reel-credit`), { opacity: 0, letterSpacing: "0.7em" }, { opacity: 1, letterSpacing: "0.38em", duration: 1.4 }, `${s.id}+=0.5`)
          .fromTo(
            q(`[data-scene="${s.id}"] .reel-word`),
            { opacity: 0, filter: "blur(18px)", yPercent: 12 },
            { opacity: 1, filter: "blur(0px)", yPercent: 0, duration: 1.3, ease: "power3.out" },
            `${s.id}+=0.75`,
          )
          .to(q(`[data-scene="${s.id}"] .reel-word, [data-scene="${s.id}"] .reel-credit`), { opacity: 0, duration: 0.6, ease: "power1.in" }, `${s.id}+=${HOLD - 0.3}`)
          .to(scene(s.id), { autoAlpha: 0, duration: FADE, ease: "power1.inOut" }, `${s.id}+=${HOLD}`);
      });

      // End card.
      const endAt = `intro+=${3.4 + SHOTS.length * (HOLD + 0.2)}`;
      t.addLabel("end", endAt)
        .set(scene("end"), { autoAlpha: 1 }, "end")
        .fromTo(q(".reel-end > *"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.18, ease: "power3.out" }, "end+=0.4")
        .to(scene("end"), { autoAlpha: 0, duration: 0.9 }, "end+=4.2")
        .addLabel("loop", "end+=5.1");

      const starts = SCENES.map((s) => t.labels[s.id]);
      const ends = [...starts.slice(1), t.labels.loop];
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
        t.seek(t.labels.play + 2).pause();
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
    const t = tl.current;
    if (!t) return;
    // Land just after the crossfade so the shot is fully in.
    t.seek(t.labels[id] + (id === "intro" || id === "end" ? 0.01 : FADE));
    if (!paused) t.play();
  };

  return (
    <section className="reel-wrap" aria-labelledby="reel-title">
      <div className="reel-head">
        <h2 id="reel-title" className="hub-label">
          Showreel
        </h2>
        <p className="hub-label hub-label-dim">Directed in code · 25 seconds</p>
      </div>

      <div className="reel" ref={root}>
        <div className="reel-scene reel-black" data-scene="intro">
          <div className="reel-card">
            <p className="reel-card-pre">A reel by</p>
            <p className="reel-card-name">{SITE.name}</p>
            <span className="reel-card-rule" />
          </div>
        </div>

        {SHOTS.map((s) => (
          <div key={s.id} className="reel-scene" data-scene={s.id} aria-hidden>
            {s.photo ? (
              <Photo name={s.photo} alt="" className="reel-shot" sizes="(max-width: 900px) 100vw, 1400px" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt="" className="reel-shot reel-shot-ui" loading="lazy" />
            )}
            <p className="reel-credit">
              {s.n} — {s.title}
            </p>
            <p className="reel-word">{s.word}</p>
          </div>
        ))}

        <div className="reel-scene reel-black" data-scene="end" aria-hidden>
          <div className="reel-end">
            <p className="reel-card-pre">Senior full-stack · Interactive</p>
            <p className="reel-card-name">{SITE.name}</p>
            <p className="reel-end-mail">{SITE.email}</p>
          </div>
        </div>

        <div className="reel-grain" aria-hidden />

        <div className="reel-hud reel-hud-top" aria-hidden>
          <span>
            <i className="reel-rec" /> Rec · 2026
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
