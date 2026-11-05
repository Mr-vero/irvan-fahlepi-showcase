"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Two small pieces of page chrome that follow the story:
 * - the header takes a light or dark theme from whatever section is under it, and
 * - a chapter marker shows where you are in the page.
 * Both are read once per frame from the element under a fixed point, so they also follow sections
 * whose theme changes mid-scroll (the hero sets its own data-theme as it moves through its beats).
 */
export default function StoryChrome() {
  const [chapter, setChapter] = useState<{ n: number; total: number; label: string } | null>(null);
  const last = useRef("");

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".hub-top");
    const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    let raf = 0;

    const themeAt = (x: number, y: number) => {
      for (const el of document.elementsFromPoint(x, y)) {
        if (el.closest(".hub-top, .hub-talk, .loader, .if-consent, .story-chapter")) continue;
        const t = el.closest<HTMLElement>("[data-theme]");
        if (t) return t.dataset.theme;
      }
      return "light";
    };

    const update = () => {
      raf = 0;
      const theme = themeAt(window.innerWidth / 2, 34);
      if (header && header.dataset.theme !== theme) header.dataset.theme = theme;

      const mid = window.innerHeight * 0.5;
      let current = -1;
      chapters.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) current = i;
      });
      const key = current < 0 ? "" : `${current}`;
      if (key !== last.current) {
        last.current = key;
        setChapter(current < 0 ? null : { n: current + 1, total: chapters.length, label: chapters[current].dataset.chapter! });
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
  }, []);

  return (
    <p className={`story-chapter${chapter && chapter.n > 1 ? " is-on" : ""}`} aria-hidden>
      {chapter && (
        <>
          <b>{String(chapter.n).padStart(2, "0")}</b>
          <span>/ {String(chapter.total).padStart(2, "0")}</span>
          <i key={chapter.label}>{chapter.label}</i>
        </>
      )}
    </p>
  );
}
