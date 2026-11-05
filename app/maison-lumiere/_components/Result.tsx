"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Photo from "@/components/Photo";
import { track } from "@/lib/analytics";
import { FAMILIES, FRAGRANCES, type Family } from "@/lib/data";
import { useReveal } from "@/lib/motion";
import { renderShareCard } from "@/lib/shareCard";
import BottleSketch from "./BottleSketch";
import type { Pick } from "./Experience";

type Props = { family: Family; picks: Pick[]; onRetake: () => void };
type Distribution = { counts: Record<Family, number>; total: number };

export default function Result({ family, picks, onRetake }: Props) {
  const f = FRAGRANCES[family];
  const ref = useReveal<HTMLDivElement>([family]);
  const [dist, setDist] = useState<Distribution | null>(null);
  const [grown, setGrown] = useState(false);
  const [sharing, setSharing] = useState(false);
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ family }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Distribution | null) => {
        if (!d || d.total === 0) return;
        setDist(d);
        // Let the bars render at zero first so they grow in.
        requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
      })
      .catch(() => {});
  }, [family]);

  const onShare = async () => {
    setSharing(true);
    track("share_click", { family });
    try {
      const blob = await renderShareCard(f);
      const file = new File([blob], `maison-lumiere-${family}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `My signature scent: ${f.name}` });
        track("share_complete", { family, method: "native" });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(a.href);
        track("share_complete", { family, method: "download" });
      }
    } catch {
      // The visitor closed the share sheet; nothing to do.
    } finally {
      setSharing(false);
    }
  };

  const pct = (n: number) => (dist ? Math.round((n / dist.total) * 100) : 0);
  const max = dist ? Math.max(...FAMILIES.map((k) => dist.counts[k])) : 1;
  const label = (k: Family) => k[0].toUpperCase() + k.slice(1);

  return (
    <div className="ml-result" ref={ref} style={{ "--fam": f.colors[1], "--fam-dark": f.colors[0] } as React.CSSProperties}>
      <div className="ml-collage" aria-hidden>
        <BottleSketch colors={f.colors} className="ml-bottle ml-bottle-painted" />
        {picks.map((p, i) => (
          <figure key={i} className={`ml-pin ml-pin-${i}`}>
            <Photo name={p.photo} alt="" ratio={i % 2 ? 1 : 1.2} sizes="180px" />
            <figcaption>{p.label}</figcaption>
          </figure>
        ))}
      </div>

      <div className="ml-result-copy">
        <p className="ml-eyebrow" data-reveal>
          Your signature · {label(family)}
        </p>
        <h2 className="ml-display ml-result-name" data-reveal data-testid="result-name">
          {f.name}
        </h2>
        <p className="ml-tagline" data-reveal>
          {f.tagline}
        </p>
        <p className="ml-lede" data-reveal>
          {f.description}
        </p>

        <dl className="ml-pyramid" data-reveal>
          <div>
            <dt>Top</dt>
            <dd>{f.notes.top}</dd>
          </div>
          <div>
            <dt>Heart</dt>
            <dd>{f.notes.heart}</dd>
          </div>
          <div>
            <dt>Base</dt>
            <dd>{f.notes.base}</dd>
          </div>
        </dl>

        <div className="ml-actions" data-reveal>
          <button className="ml-btn" onClick={onShare} disabled={sharing}>
            {sharing ? "Composing…" : "Share my scent"}
          </button>
          <button className="ml-link" onClick={onRetake}>
            Retake the survey
          </button>
        </div>

        {dist && (
          <section className="ml-dist" aria-label="How everyone answered" data-testid="distribution">
            <div className="ml-dist-head">
              <span>Everyone so far</span>
              <span>
                {dist.total.toLocaleString("en")} {dist.total === 1 ? "answer" : "answers"}
              </span>
            </div>
            {FAMILIES.map((k) => (
              <div key={k} className={`dist-row${k === family ? " is-you" : ""}`}>
                <span>{label(k)}</span>
                <span className="dist-track">
                  <span className="dist-fill" style={{ transform: `scaleX(${grown ? dist.counts[k] / max : 0})` }} />
                </span>
                <span className="dist-pct">{pct(dist.counts[k])}%</span>
              </div>
            ))}
          </section>
        )}

        <Link className="ml-link ml-other" href="/" prefetch={false}>
          See the other demos →
        </Link>
      </div>
    </div>
  );
}
