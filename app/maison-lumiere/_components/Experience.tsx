"use client";

import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FRAGRANCES, type Family } from "@/lib/data";
import { prefersReducedMotion } from "@/lib/motion";
import Intro from "./Intro";
import Quiz from "./Quiz";
import Result from "./Result";

type Screen = { name: "intro" } | { name: "quiz" } | { name: "result"; family: Family };

export default function Experience() {
  const [screen, setScreen] = useState<Screen>({ name: "intro" });
  const glowA = useRef<HTMLDivElement>(null);
  const glowB = useRef<HTMLDivElement>(null);

  // The ambient light takes on the colours of the visitor's fragrance once they have one.
  const [dark, light] = screen.name === "result" ? FRAGRANCES[screen.family].colors : ["#2a2017", "#8c6a3f"];

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const tweens = [
      gsap.to(glowA.current, { x: "18vw", y: "10vh", duration: 14, repeat: -1, yoyo: true, ease: "sine.inOut" }),
      gsap.to(glowB.current, { x: "-14vw", y: "-12vh", duration: 17, repeat: -1, yoyo: true, ease: "sine.inOut" }),
    ];
    return () => tweens.forEach((t) => t.kill());
  }, []);

  useEffect(() => {
    gsap.to(glowA.current, { backgroundColor: light, duration: 1.6, ease: "power2.out" });
    gsap.to(glowB.current, { backgroundColor: dark, duration: 1.6, ease: "power2.out" });
  }, [dark, light]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen.name]);

  return (
    <main className="stage">
      <div className="glow glow-a" ref={glowA} aria-hidden />
      <div className="glow glow-b" ref={glowB} aria-hidden />
      <div className="grain" aria-hidden />

      <header className="brand">
        <button className="brand-mark" onClick={() => setScreen({ name: "intro" })} aria-label="Maison Lumière, back to start">
          Maison Lumière
        </button>
        <Link href="/" prefetch={false} className="ml-index">
          Index
        </Link>
      </header>

      <section className="content" aria-live="polite">
        {screen.name === "intro" && <Intro onStart={() => setScreen({ name: "quiz" })} />}
        {screen.name === "quiz" && <Quiz onDone={(family) => setScreen({ name: "result", family })} />}
        {screen.name === "result" && <Result family={screen.family} onRetake={() => setScreen({ name: "quiz" })} />}
      </section>

      <footer className="foot">
        A fictional house · <Link href="/" prefetch={false}>Demo by Irvan Fahlepi</Link>
      </footer>
    </main>
  );
}
