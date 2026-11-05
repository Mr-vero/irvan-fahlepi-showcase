"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef, type DependencyList } from "react";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Staggers every `[data-reveal]` element inside the returned ref in, whenever `deps` change. */
export function useReveal<T extends HTMLElement>(deps: DependencyList = []) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        targets,
        { opacity: 0, y: 22, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", stagger: 0.07 },
      );
    }, ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** Fades the current content out before calling `then`, so screen changes never cut abruptly. */
export function leave(el: HTMLElement | null, then: () => void) {
  if (!el || prefersReducedMotion()) return then();
  gsap.to(el.querySelectorAll("[data-reveal]"), {
    opacity: 0,
    y: -14,
    duration: 0.35,
    ease: "power2.in",
    stagger: 0.03,
    onComplete: then,
  });
}
