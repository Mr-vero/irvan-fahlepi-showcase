"use client";

import { useEffect, useState } from "react";
import { FAMILIES, FRAGRANCES, type Family } from "@/lib/data";
import type { EventName } from "@/lib/events";
import type { ScoreEntry } from "@/lib/store";

type Stats = {
  survey: { counts: Record<Family, number>; total: number };
  events: Record<EventName, number>;
  leaderboard: ScoreEntry[];
  persistent: boolean;
};

const FUNNELS: { title: string; steps: [EventName, string][] }[] = [
  {
    title: "Maison Lumière survey",
    steps: [
      ["survey_start", "Started"],
      ["survey_complete", "Completed"],
      ["share_click", "Shared"],
    ],
  },
  {
    title: "Shade Match game",
    steps: [
      ["game_start", "Played"],
      ["game_complete", "Finished"],
      ["leaderboard_submit", "Submitted score"],
    ],
  },
  {
    title: "Atelier Nº 7 story",
    steps: [
      ["story_start", "Started scrolling"],
      ["story_complete", "Reached the end"],
    ],
  },
];

const REFRESH_MS = 15_000;

function Bar({ label, value, max, note }: { label: string; value: number; max: number; note?: string }) {
  const tip = `${label}: ${value.toLocaleString("en")}${note ? ` (${note})` : ""}`;
  return (
    <div className="lab-bar" title={tip}>
      <span className="lab-bar-label">{label}</span>
      <span className="lab-bar-track">
        <span className="lab-bar-fill" style={{ transform: `scaleX(${max ? value / max : 0})` }} />
      </span>
      <span className="lab-bar-value">
        {value.toLocaleString("en")}
        {note && <small>{note}</small>}
      </span>
    </div>
  );
}

export default function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/stats", { cache: "no-store" })
        .then((r) => r.json())
        .then((s: Stats) => {
          if (!alive) return;
          setStats(s);
          setUpdated(new Date());
        })
        .catch(() => {});
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const e = stats?.events;
  const completion = e && e.story_start ? Math.round((e.story_complete / e.story_start) * 100) : null;
  const kpis = [
    { label: "Survey answers", value: stats?.survey.total },
    { label: "Games played", value: e?.game_start },
    { label: "Scores submitted", value: e?.leaderboard_submit },
    { label: "Story completion", value: completion, suffix: "%" },
  ];
  const surveyMax = stats ? Math.max(1, ...FAMILIES.map((f) => stats.survey.counts[f])) : 1;

  return (
    <section className="lab-section" aria-labelledby="live">
      <div className="lab-head">
        <h2 id="live">
          Live analytics <span className="lab-dot" aria-hidden />
        </h2>
        <p>
          First-party, cookieless counters, recorded only for visitors who accepted analytics. GA4 receives the same
          events when it’s configured. Refreshes every 15 seconds
          {updated && <> · updated {updated.toLocaleTimeString("en-GB")}</>}.
        </p>
      </div>

      <div className="lab-kpis">
        {kpis.map((k) => (
          <div key={k.label} className="lab-kpi">
            <span className="lab-kpi-value">
              {k.value == null ? "—" : `${k.value.toLocaleString("en")}${k.suffix ?? ""}`}
            </span>
            <span className="lab-kpi-label">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="lab-grid">
        {FUNNELS.map((f) => {
          const first = e?.[f.steps[0][0]] ?? 0;
          return (
            <figure key={f.title} className="lab-card">
              <figcaption>{f.title}</figcaption>
              {f.steps.map(([key, label], i) => {
                const v = e?.[key] ?? 0;
                const note = i > 0 && first ? `${Math.round((v / first) * 100)}%` : undefined;
                return <Bar key={key} label={label} value={v} max={first} note={note} />;
              })}
            </figure>
          );
        })}

        <figure className="lab-card">
          <figcaption>Survey results by fragrance family</figcaption>
          {FAMILIES.map((f) => (
            <Bar
              key={f}
              label={FRAGRANCES[f].family[0].toUpperCase() + FRAGRANCES[f].family.slice(1)}
              value={stats?.survey.counts[f] ?? 0}
              max={surveyMax}
              note={stats?.survey.total ? `${Math.round((stats.survey.counts[f] / stats.survey.total) * 100)}%` : undefined}
            />
          ))}
        </figure>

        <figure className="lab-card">
          <figcaption>Shade Match leaderboard</figcaption>
          {stats && stats.leaderboard.length === 0 && <p className="lab-empty">No scores yet.</p>}
          <ol className="lab-board">
            {stats?.leaderboard.map((s, i) => (
              <li key={s.id}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{s.name}</span>
                <b>{s.score.toLocaleString("en")}</b>
              </li>
            ))}
          </ol>
        </figure>
      </div>

      {stats && !stats.persistent && (
        <p className="lab-warn">
          Running on the in-memory store: numbers reset on restart. Connect Upstash Redis on Vercel to persist them.
        </p>
      )}
    </section>
  );
}
