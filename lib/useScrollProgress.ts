"use client";

import { useEffect, type RefObject } from "react";

/**
 * Reports how far a tall section has scrolled past its pinned viewport, 0 → 1, at most once per frame.
 * Callers write the value to a CSS variable or a transform, so the work per frame stays tiny.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, onProgress: (p: number) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onProgress(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      onProgress(Math.min(1, Math.max(0, -rect.top / Math.max(1, travel))));
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
    // The callback is expected to be stable for the life of the section.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
