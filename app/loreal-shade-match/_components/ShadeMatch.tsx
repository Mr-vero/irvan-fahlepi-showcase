"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Photo from "@/components/Photo";
import { track } from "@/lib/analytics";
import { oklchToSrgb } from "@/lib/color";
import { css, pointsFor, rankFor, same, type Round } from "@/lib/shade";
import type { ScoreEntry } from "@/lib/store";
import LiquidSwatch from "./LiquidSwatch";

type Phase = "intro" | "loading" | "countdown" | "play" | "over" | "board";
type Feedback = { kind: "hit" | "miss"; key: number; index: number; points?: number };

const FREEZE_MS = 650;
const HERO_SHADE = { l: 0.5, c: 0.17, h: 18 };

const ERRORS: Record<string, string> = {
  invalid_name: "Use 2–16 letters, numbers or spaces.",
  already_submitted: "This game is already on the board.",
  invalid_token: "This game expired. Play a new one.",
  too_fast: "Those picks were faster than humanly possible.",
  rate_limited: "Too many attempts. Wait a minute and try again.",
};

export default function ShadeMatch() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [frozen, setFrozen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [count, setCount] = useState(3);
  const [board, setBoard] = useState<ScoreEntry[]>([]);
  const [you, setYou] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startError, setStartError] = useState(false);

  const token = useRef("");
  const duration = useRef(30_000);
  const picks = useRef<number[]>([]);
  const endAt = useRef(0);
  const timeBar = useRef<HTMLSpanElement>(null);
  const timeText = useRef<HTMLSpanElement>(null);

  const loadBoard = useCallback(() => {
    fetch("/api/shade/scores", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { scores: ScoreEntry[] }) => setBoard(d.scores))
      .catch(() => {});
  }, []);

  useEffect(loadBoard, [loadBoard]);

  const start = async () => {
    setPhase("loading");
    setStartError(false);
    try {
      const res = await fetch("/api/shade/start", { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { token: string; durationMs: number; rounds: Round[] };
      token.current = data.token;
      duration.current = data.durationMs;
      picks.current = [];
      setRounds(data.rounds);
      setRound(0);
      setScore(0);
      setStreak(0);
      setBest(0);
      setCorrect(0);
      setFeedback(null);
      setYou(null);
      setError(null);
      setCount(3);
      setPhase("countdown");
    } catch {
      setStartError(true);
      setPhase("intro");
    }
  };

  // 3, 2, 1, then the clock starts.
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count === 0) {
      endAt.current = performance.now() + duration.current;
      setPhase("play");
      track("game_start");
      return;
    }
    const id = setTimeout(() => setCount((c) => c - 1), 650);
    return () => clearTimeout(id);
  }, [phase, count]);

  // The clock is drawn straight to the DOM so the board doesn't re-render 60 times a second.
  useEffect(() => {
    if (phase !== "play") return;
    let raf = 0;
    const tick = () => {
      const left = Math.max(0, endAt.current - performance.now());
      if (timeBar.current) timeBar.current.style.transform = `scaleX(${left / duration.current})`;
      if (timeText.current) timeText.current.textContent = (left / 1000).toFixed(1);
      if (left <= 0) {
        setPhase("over");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase === "over") track("game_complete", { score, correct, best_streak: best });
    // Only on the transition into "over".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const pick = (i: number) => {
    const r = rounds[round];
    if (phase !== "play" || frozen || !r) return;
    picks.current.push(i);
    if (same(r.options[i], r.target)) {
      const pts = pointsFor(round, streak);
      setScore((s) => s + pts);
      setStreak(streak + 1);
      setBest((b) => Math.max(b, streak + 1));
      setCorrect((c) => c + 1);
      setFeedback({ kind: "hit", key: Date.now(), index: i, points: pts });
      if (round + 1 >= rounds.length) setPhase("over");
      else setRound(round + 1);
    } else {
      setStreak(0);
      setFrozen(true);
      setFeedback({ kind: "miss", key: Date.now(), index: i });
      setTimeout(() => setFrozen(false), FREEZE_MS);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/shade/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.current, picks: picks.current, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(ERRORS[data.error] ?? "Something went wrong. Try again.");
        return;
      }
      track("leaderboard_submit", { score: data.entry.score, rank: data.rank ?? 0 });
      setBoard(data.scores);
      setYou(data.entry.id);
      setPhase("board");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const r = rounds[round];
  const multiplier = (1 + Math.min(streak, 10) * 0.1).toFixed(1);
  const playing = phase === "countdown" || phase === "play";

  return (
    <main className={`sm-page sm-${playing ? "playing" : "editorial"}`}>
      <header className="sm-top">
        <Link href="/" prefetch={false} className="sm-top-link">
          ← Irvan Fahlepi
        </Link>
        <span className="sm-top-tag">Unofficial concept · L’Oréal Paris</span>
      </header>

      {(phase === "intro" || phase === "loading") && (
        <section className="sm-split">
          <div className="sm-visual" aria-hidden>
            <Photo name="portrait" alt="" sizes="(max-width: 900px) 100vw, 50vw" priority className="sm-visual-photo" />
            <div className="sm-collage">
              <Photo name="swatches" alt="" ratio={1.2} sizes="220px" className="sm-sticker sm-sticker-a" />
              <Photo name="lipsticks" alt="" ratio={1} sizes="180px" className="sm-sticker sm-sticker-b" />
              <div className="sm-sticker sm-sticker-c" style={{ background: css(HERO_SHADE) }}>
                <LiquidSwatch rgb={oklchToSrgb(HERO_SHADE)} className="sm-liquid" />
              </div>
            </div>
            <p className="sm-visual-caption">Nº 01 — Le regard</p>
          </div>

          <div className="sm-panel sm-enter">
            <p className="sm-eyebrow">A colour game in thirty seconds</p>
            <h1 className="sm-title">
              Shade <em>Match</em>
            </h1>
            <p className="sm-lede">Every round, the shades sit a little closer together. How trained is your eye?</p>
            <ol className="sm-rules">
              <li>
                <b>Tap</b> the exact shade
              </li>
              <li>
                <b>Streaks</b> multiply points
              </li>
              <li>
                <b>Misses</b> freeze you briefly
              </li>
            </ol>
            <button className="sm-btn" onClick={start} disabled={phase === "loading"}>
              {phase === "loading" ? "Preparing…" : "Start"}
            </button>
            {startError && <p className="sm-error">Couldn’t start a game. Try again.</p>}
            {board.length > 0 && (
              <div className="sm-podium">
                <p className="sm-eyebrow">Today’s best eyes</p>
                <ol>
                  {board.slice(0, 3).map((s, i) => (
                    <li key={s.id}>
                      <span>
                        <i>{i + 1}</i> {s.name}
                      </span>
                      <b>{s.score.toLocaleString("en")}</b>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {phase === "countdown" && (
        <section className="sm-count" aria-live="assertive">
          <span key={count} className="sm-count-n">
            {count || ""}
          </span>
        </section>
      )}

      {phase === "play" && r && (
        <section className="sm-play" aria-label="Game">
          <div className="sm-hud">
            <div>
              <span className="sm-hud-label">Score</span>
              <span className="sm-hud-value" data-testid="score">
                {score.toLocaleString("en")}
              </span>
            </div>
            <div className="sm-hud-center">
              <span className="sm-hud-label">Time</span>
              <span className="sm-hud-value" ref={timeText}>
                {(duration.current / 1000).toFixed(1)}
              </span>
            </div>
            <div className="sm-hud-right">
              <span className="sm-hud-label">Streak</span>
              <span className={`sm-hud-value${streak >= 3 ? " is-hot" : ""}`}>×{multiplier}</span>
            </div>
            <span className="sm-time">
              <span ref={timeBar} />
            </span>
          </div>

          <div className="sm-target-wrap">
            <div
              className={`sm-target${feedback?.kind === "miss" && frozen ? " is-miss" : ""}`}
              style={{ background: css(r.target) }}
              data-testid="target"
              data-shade={css(r.target)}
            >
              <LiquidSwatch rgb={oklchToSrgb(r.target)} className="sm-liquid" />
            </div>
            <p className="sm-shade-name" key={`n-${round}`}>
              {r.name}
            </p>
            {feedback?.kind === "hit" && (
              <span key={feedback.key} className="sm-float">
                +{feedback.points}
              </span>
            )}
          </div>

          <div className={`sm-grid sm-grid-${r.options.length}${frozen ? " is-frozen" : ""}`} key={`g-${round}`}>
            {r.options.map((o, i) => (
              <button
                key={i}
                className={`sm-opt${feedback?.kind === "miss" && feedback.index === i && frozen ? " is-wrong" : ""}`}
                style={{ background: css(o), "--i": i } as React.CSSProperties}
                onClick={() => pick(i)}
                aria-label={`Shade option ${i + 1}`}
                data-shade={css(o)}
              />
            ))}
          </div>
          <p className="sm-round">Round {round + 1}</p>
        </section>
      )}

      {phase === "over" && (
        <section className="sm-split sm-split-over">
          <div className="sm-visual sm-visual-dark" aria-hidden>
            <Photo name="lips" alt="" sizes="(max-width: 900px) 100vw, 50vw" priority className="sm-visual-photo" />
            <div className="sm-verdict">
              <p className="sm-eyebrow">Time’s up</p>
              <p className="sm-rank">{rankFor(correct)}</p>
            </div>
          </div>
          <div className="sm-panel sm-enter">
            <p className="sm-eyebrow">Your score</p>
            <p className="sm-final" data-testid="final-score">
              {score.toLocaleString("en")}
            </p>
            <dl className="sm-stats">
              <div>
                <dt>Shades matched</dt>
                <dd>{correct}</dd>
              </div>
              <div>
                <dt>Best streak</dt>
                <dd>{best}</dd>
              </div>
            </dl>
            <form className="sm-form" onSubmit={submit}>
              <label htmlFor="sm-name">Name for the leaderboard</label>
              <div className="sm-form-row">
                <input
                  id="sm-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={16}
                  minLength={2}
                  required
                  autoComplete="nickname"
                  placeholder="Camille"
                />
                <button className="sm-btn" disabled={submitting}>
                  {submitting ? "Saving…" : "Submit"}
                </button>
              </div>
              {error && (
                <p className="sm-error" role="alert">
                  {error}
                </p>
              )}
            </form>
            <button className="sm-link" onClick={start}>
              Play again
            </button>
          </div>
        </section>
      )}

      {phase === "board" && (
        <section className="sm-split">
          <div className="sm-visual" aria-hidden>
            <Photo name="lipsticks" alt="" sizes="(max-width: 900px) 100vw, 50vw" priority className="sm-visual-photo" />
          </div>
          <div className="sm-panel sm-enter">
            <p className="sm-eyebrow">Leaderboard</p>
            <h2 className="sm-title sm-title-sm">
              Best <em>eyes</em>
            </h2>
            <ol className="sm-board" data-testid="leaderboard">
              {board.map((s, i) => (
                <li key={s.id} className={s.id === you ? "is-you" : undefined}>
                  <span className="sm-board-rank">{String(i + 1).padStart(2, "0")}</span>
                  <span className="sm-board-name">
                    {s.name}
                    {s.id === you && <em> — you</em>}
                  </span>
                  <span className="sm-board-meta">{s.correct} matched</span>
                  <b>{s.score.toLocaleString("en")}</b>
                </li>
              ))}
            </ol>
            <div className="sm-board-actions">
              <button className="sm-btn" onClick={start}>
                Play again
              </button>
              <Link href="/" prefetch={false} className="sm-link">
                See the other demos
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="sm-legal">
        An unofficial concept by Irvan Fahlepi for portfolio purposes. Not affiliated with, sponsored or endorsed by
        L’Oréal. L’Oréal Paris is a trademark of L’Oréal. Photography via Unsplash.
      </footer>
    </main>
  );
}
