"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Family } from "@/lib/data";
import type { PhotoKey } from "@/lib/photos";
import Intro from "./Intro";
import Quiz from "./Quiz";
import Result from "./Result";

type Screen = { name: "intro" } | { name: "quiz" } | { name: "result"; family: Family };
export type Pick = { photo: PhotoKey; label: string };

export default function Experience() {
  const [screen, setScreen] = useState<Screen>({ name: "intro" });
  const [picks, setPicks] = useState<Pick[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen.name]);

  const restart = () => {
    setPicks([]);
    setScreen({ name: "quiz" });
  };

  return (
    <main className="ml-page">
      <div className="ml-paper" aria-hidden />
      <header className="ml-top">
        <button className="ml-brand" onClick={() => setScreen({ name: "intro" })} aria-label="Maison Lumière, back to start">
          Maison <em>Lumière</em>
        </button>
        <Link href="/" prefetch={false} className="ml-index">
          ← Irvan Fahlepi
        </Link>
      </header>

      <section className="ml-content" aria-live="polite">
        {screen.name === "intro" && <Intro onStart={restart} />}
        {screen.name === "quiz" && (
          <Quiz
            picks={picks}
            onPick={(p) => setPicks((all) => [...all, p])}
            onDone={(family) => setScreen({ name: "result", family })}
          />
        )}
        {screen.name === "result" && <Result family={screen.family} picks={picks} onRetake={restart} />}
      </section>

      <footer className="ml-foot">
        Maison Lumière is a fictional house · Photography via Unsplash ·{" "}
        <Link href="/" prefetch={false}>
          A demo by Irvan Fahlepi
        </Link>
      </footer>
    </main>
  );
}
