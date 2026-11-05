"use client";

import { useEffect, type RefObject } from "react";

/**
 * Reports how far a tall, pinned section has scrolled, 0 → 1, at most once per frame. Callers write the
 * value to a CSS variable or a transform, so the work per frame stays tiny.
 *
 * With `tail`, the last viewport of the section is reserved for the next chapter sliding over it: progress
 * completes one viewport early, and `--out` (0 → 1) is written to the section for the sink effect.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  { tail = false }: { tail?: boolean } = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onProgress(1);
      return;
    }
    let raf = 0;
    let lastOut = -1;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      const reserved = tail ? vh : 0;
      const travel = Math.max(1, rect.height - vh - reserved);
      const scrolled = -rect.top;
      onProgress(Math.min(1, Math.max(0, scrolled / travel)));
      if (tail) {
        const out = Math.round(Math.min(1, Math.max(0, (scrolled - travel) / vh)) * 1000) / 1000;
        if (out !== lastOut) {
          lastOut = out;
          el.style.setProperty("--out", String(out));
        }
      }
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
  }, [ref, tail]);
}
