"use client";

import Link from "next/link";
import { useRef } from "react";
import { track } from "@/lib/analytics";
import { leave, useReveal } from "@/lib/motion";

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
    <div className="screen intro" ref={ref}>
      <p className="eyebrow" data-reveal>
        La Collection Lumière
      </p>
      <h1 className="display" data-reveal>
        Find your
        <br />
        <em>signature</em> scent
      </h1>
      <p className="lede" data-reveal>
        Five questions about how you live. One fragrance composed for it.
      </p>
      <div className="actions" data-reveal>
        <button className="btn btn-primary" onClick={start}>
          Begin the ritual
        </button>
        <Link className="btn btn-ghost btn-link" href="/" prefetch={false}>
          All demos
        </Link>
      </div>
      <p className="fineprint" data-reveal>
        About 60 seconds
      </p>
    </div>
  );
}
