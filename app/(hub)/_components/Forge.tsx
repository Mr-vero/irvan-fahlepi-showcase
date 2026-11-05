"use client";

import { useRef, useState } from "react";
import { FEED_URL, FORGE_URL, GAMES, PIPELINE } from "@/lib/pingplay";
import { useScrollProgress } from "@/lib/useScrollProgress";

const STEP_AT = [0.3, 0.38, 0.46, 0.54, 0.62, 0.7];

/**
 * PingPlay Forge, the tool behind the games. A pinned reveal: the Forge window rises out of perspective
 * while its real pipeline lights up step by step. Then a wall of live games and one you can play here.
 */
export default function Forge() {
  const root = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);

  useScrollProgress(
    root,
    (p) => {
      const el = root.current!;
      el.style.setProperty("--fp", p.toFixed(4));
      const lit = STEP_AT.filter((s) => p >= s).length;
      if (el.dataset.lit !== String(lit)) el.dataset.lit = String(lit);
    },
    { tail: true },
  );

  const featured = GAMES[0];

  return (
    <>
      <section className="forge chapter chapter-over" ref={root} data-lit="0" data-theme="dark" data-chapter="Forge" aria-labelledby="forge-title">
        <div className="forge-sticky chapter-sticky">
          <div className="forge-aurora" aria-hidden />
          <div className="forge-head">
            <p className="hub-label forge-kicker">05 — The tool behind the games</p>
            <h2 id="forge-title" className="forge-title">
              PingPlay <em>Forge</em>
            </h2>
            <p className="forge-lede">
              The studio I built to turn a brief and a brand kit into a finished, tested game. A 3D game with your
              assets in a few hours; 2D titles in a fraction of that.
            </p>
          </div>

          <div className="forge-stage" aria-hidden>
            <div className="forge-window">
              <div className="forge-chrome">
                <i />
                <i />
                <i />
                <span>PingPlay Forge</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/work/forge.webp" alt="" />
            </div>
            <ol className="forge-pipe">
              {PIPELINE.map((s, i) => (
                <li key={s.step} data-i={i + 1}>
                  <span className="forge-dot">✓</span>
                  <b>{s.step}</b>
                  <span>{s.time}</span>
                </li>
              ))}
            </ol>
            <p className="forge-total">
              <b>3 h 20 min</b> pipeline time · Pulau Moli, 3D open world
            </p>
          </div>
          <span className="chapter-shade" aria-hidden />
        </div>
      </section>

      <section className="arcade chapter chapter-over" data-theme="dark" data-chapter="Arcade" aria-labelledby="arcade-title">
        <div className="arcade-inner">
          <div className="arcade-copy">
            <p className="hub-label forge-kicker">Made with Forge · live on PingPlay</p>
            <h2 id="arcade-title" className="arcade-title">
              70 games.
              <br />
              <em>Playable now.</em>
            </h2>
            <p className="forge-lede">
              Every one built and shipped through the Forge pipeline, from cozy 3D open worlds to two-minute puzzles. Swap
              the art direction for a brand kit and it becomes a campaign.
            </p>
            <div className="arcade-ctas">
              <a href={FEED_URL} target="_blank" rel="noopener noreferrer" className="hub-pill hub-pill-light">
                Play the feed ↗
              </a>
              <a href={FORGE_URL} target="_blank" rel="noopener noreferrer" className="hub-pill forge-pill">
                Join the Forge waitlist ↗
              </a>
            </div>
          </div>

          <div className="arcade-player">
            <div className="arcade-phone">
              {playing ? (
                <iframe
                  src={featured.url}
                  title={`${featured.title}, a PingPlay game`}
                  allow="autoplay; fullscreen; gamepad"
                  sandbox="allow-scripts allow-same-origin allow-pointer-lock"
                />
              ) : (
                <button className="arcade-start" onClick={() => setPlaying(true)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/work/game-${featured.id}.webp`} alt="" />
                  <span className="arcade-play">
                    <b>▶</b> Tap to play {featured.title}
                  </span>
                </button>
              )}
            </div>
            <p className="arcade-caption">
              {featured.title} · {featured.dim} {featured.category.toLowerCase()} · runs right here
            </p>
          </div>
        </div>

        <ul className="arcade-wall" aria-label="Games made with Forge">
          {GAMES.slice(1).map((g, i) => (
            <li key={g.id} style={{ "--i": i } as React.CSSProperties}>
              <a href={FEED_URL} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/work/game-${g.id}.webp`} alt="" loading="lazy" decoding="async" />
                <span className="arcade-tag">{g.dim}</span>
                <span className="arcade-name">
                  {g.title}
                  <small>
                    {g.category} · {g.plays.toLocaleString("en")} plays
                  </small>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
