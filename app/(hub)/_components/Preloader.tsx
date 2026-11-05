"use client";

import { useEffect, useRef, useState } from "react";

const MIN_MS = 900;
const MAX_MS = 1800;

/**
 * An ink curtain with the monogram and a count that follows the hero photographs as they load, then
 * lifts. It never waits longer than MAX_MS, and it is skipped entirely for reduced motion.
 */
export default function Preloader() {
  const [state, setState] = useState<"loading" | "leaving" | "gone">("loading");
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("gone");
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".hero img[fetchpriority='high']"));
    const start = performance.now();
    let raf = 0;
    let shown = 0;

    const tick = () => {
      const elapsed = performance.now() - start;
      const loaded = imgs.length ? imgs.filter((i) => i.complete).length / imgs.length : 1;
      // The count eases toward whichever is further along: real loading or the minimum show time.
      const target = Math.min(1, Math.max(Math.min(loaded, elapsed / MIN_MS), elapsed / MAX_MS)) * 100;
      shown += (target - shown) * 0.18;
      if (count.current) count.current.textContent = String(Math.round(shown)).padStart(3, "0");
      if (shown > 99.4 && elapsed >= MIN_MS) {
        if (count.current) count.current.textContent = "100";
        setState("leaving");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (state === "leaving") {
      document.documentElement.style.overflow = "";
      const t = setTimeout(() => setState("gone"), 1100);
      return () => clearTimeout(t);
    }
    if (state === "gone") document.documentElement.style.overflow = "";
  }, [state]);

  if (state === "gone") return null;
  return (
    <div className={`loader${state === "leaving" ? " is-leaving" : ""}`} aria-hidden>
      <div className="loader-mark">
        <span>I</span>
        <span>F</span>
      </div>
      <p className="loader-name">Irvan Fahlepi</p>
      <span className="loader-count" ref={count}>
        000
      </span>
      <p className="loader-tag">Interactive work · 2026</p>
    </div>
  );
}
