"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { FAMILIES, FRAGRANCES, type Family } from "@/lib/data";
import { leave, useReveal } from "@/lib/motion";
import { renderShareCard } from "@/lib/shareCard";

type Props = { family: Family; onRetake: () => void };
type Distribution = { counts: Record<Family, number>; total: number };

export default function Result({ family, onRetake }: Props) {
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

  return (
    <div className="screen result" ref={ref}>
      <p className="eyebrow" data-reveal>
        Your signature
      </p>
      <h2 className="display result-name" data-reveal data-testid="result-name">
        <em>{f.name}</em>
      </h2>
      <p className="tagline" data-reveal>
        {f.tagline}
      </p>
      <p className="lede" data-reveal>
        {f.description}
      </p>

      <dl className="pyramid" data-reveal>
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

      <div className="actions" data-reveal>
        <button className="btn btn-primary" onClick={onShare} disabled={sharing}>
          {sharing ? "Composing…" : "Share my scent"}
        </button>
        <button className="btn btn-ghost" onClick={() => leave(ref.current, onRetake)}>
          Retake the survey
        </button>
      </div>

      {dist && (
        <section className="dist" aria-label="How everyone answered" data-testid="distribution">
          <div className="dist-head">
            <span>Everyone so far</span>
            <span>{dist.total.toLocaleString("en")} answers</span>
          </div>
          {FAMILIES.map((k) => (
            <div key={k} className={`dist-row${k === family ? " is-you" : ""}`}>
              <span>{FRAGRANCES[k].family[0].toUpperCase() + FRAGRANCES[k].family.slice(1)}</span>
              <span className="dist-track">
                <span className="dist-fill" style={{ transform: `scaleX(${grown ? dist.counts[k] / max : 0})` }} />
              </span>
              <span className="dist-pct">{pct(dist.counts[k])}%</span>
            </div>
          ))}
        </section>
      )}

      <Link className="link" href="/" prefetch={false}>
        See the other demos
      </Link>
    </div>
  );
}
