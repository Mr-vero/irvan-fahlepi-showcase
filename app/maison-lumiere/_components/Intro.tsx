"use client";

import Link from "next/link";
import { useRef } from "react";
import Photo from "@/components/Photo";
import { track } from "@/lib/analytics";
import { leave, useReveal } from "@/lib/motion";
import BottleSketch from "./BottleSketch";

export default function Intro({ onStart }: { onStart: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  const busy = useRef(false);

  const start = () => {
    if (busy.current) return;
    busy.current = true;
    track("survey_start");
    leave(ref.current, onStart);
  };

  return (
    <div className="ml-intro" ref={ref}>
      <div className="ml-intro-copy">
        <p className="ml-eyebrow" data-reveal>
          La Collection Lumière · Nº 5 questions
        </p>
        <h1 className="ml-display" data-reveal>
          Find your
          <br />
          <em>signature</em>
          <br />
          scent
        </h1>
        <p className="ml-lede" data-reveal>
          Pick the images that feel like you. Your moodboard becomes a fragrance, composed in about sixty seconds.
        </p>
        <div className="ml-actions" data-reveal>
          <button className="ml-btn" onClick={start}>
            Begin the ritual
          </button>
          <Link className="ml-link" href="/" prefetch={false}>
            All demos
          </Link>
        </div>
      </div>

      <div className="ml-desk" aria-hidden data-reveal>
        <BottleSketch className="ml-bottle ml-bottle-draw" />
        <figure className="ml-pin ml-pin-a">
          <Photo name="peony" alt="" ratio={1.25} sizes="200px" />
          <figcaption>Pivoine</figcaption>
        </figure>
        <figure className="ml-pin ml-pin-b">
          <Photo name="orangeSlice" alt="" ratio={1} sizes="170px" />
          <figcaption>Néroli</figcaption>
        </figure>
        <figure className="ml-pin ml-pin-c">
          <Photo name="goldenBottles" alt="" ratio={1.2} sizes="180px" />
          <figcaption>Ambre</figcaption>
        </figure>
      </div>
    </div>
  );
}
