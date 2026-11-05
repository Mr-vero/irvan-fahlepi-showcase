"use client";

import { useEffect, useRef } from "react";
import { LIVE_WORK, PRIVATE_WORK } from "@/lib/work";

/**
 * A pinned, horizontally scrolling gallery of live projects. Vertical scroll is mapped to a single
 * translateX on the track (one composited layer), so it glides at frame rate however hard you scroll.
 */
export default function LiveWork() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const tr = track.current!;
    let raf = 0;
    let distance = 0;

    const measure = () => {
      distance = Math.max(0, tr.scrollWidth - window.innerWidth);
      // The section is as tall as the horizontal distance, so one pixel of scroll moves one pixel, plus
      // one more screen at the end while the next chapter slides over it.
      el.style.height = `${distance + window.innerHeight * 2}px`;
      update();
    };
    const update = () => {
      raf = 0;
      const top = el.getBoundingClientRect().top;
      const x = Math.min(distance, Math.max(0, -top));
      tr.style.transform = `translate3d(${-x}px, 0, 0)`;
      el.style.setProperty("--wp", distance ? (x / distance).toFixed(4) : "0");
      el.style.setProperty("--out", Math.min(1, Math.max(0, (-top - distance) / window.innerHeight)).toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(tr);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="live chapter" ref={root} data-theme="dark" data-chapter="Live work" aria-labelledby="live-title">
      <div className="live-sticky chapter-sticky">
        <div className="live-track" ref={track}>
          <header className="live-intro">
            <p className="hub-label">Shipped &amp; live</p>
            <h2 id="live-title" className="live-title">
              Not mock-ups.
              <br />
              <mark>Live work</mark> you can open right now.
            </h2>
            <p className="live-sub">
              {LIVE_WORK.length} projects in production: games, brand and festival sites, a live product customizer,
              and tools I build for myself. Scroll →
            </p>
          </header>

          {LIVE_WORK.map((w, i) => (
            <a
              key={w.title}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`live-card live-${w.frame}`}
              style={{ "--accent": w.accent } as React.CSSProperties}
            >
              <span className="live-device">
                {w.frame === "browser" ? (
                  <span className="live-chrome" aria-hidden>
                    <i />
                    <i />
                    <i />
                    <span>{w.host}</span>
                  </span>
                ) : (
                  <span className="live-notch" aria-hidden />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.image} alt={`${w.title} homepage`} loading="lazy" decoding="async" />
              </span>
              <span className="live-meta">
                <span className="live-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="live-kind">{w.kind}</span>
                <span className="live-name">
                  {w.title} <em aria-hidden>↗</em>
                </span>
                <span className="live-line">{w.line}</span>
                <span className="live-stack">{w.stack.join(" · ")}</span>
              </span>
            </a>
          ))}

          <aside className="live-private" aria-labelledby="private-title">
            <p className="hub-label">From private repositories</p>
            <h3 id="private-title">Walkthrough on request</h3>
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
          </aside>
        </div>
        <span className="live-progress" aria-hidden />
        <span className="chapter-shade" aria-hidden />
      </div>
    </section>
  );
}
