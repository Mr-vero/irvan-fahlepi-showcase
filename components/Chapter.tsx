"use client";

import { useRef } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

type Props = {
  className?: string;
  label: string;
  theme: "light" | "dark";
  /** Slide in over the chapter before it. */
  over?: boolean;
  children: React.ReactNode;
};

/**
 * A pinned chapter: its content holds still for a screen while you read it, then sinks back and dims as
 * the next chapter slides up over it. The sink is driven by --out from useScrollProgress.
 */
export default function Chapter({ className = "", label, theme, over, children }: Props) {
  const root = useRef<HTMLElement>(null);
  useScrollProgress(root, () => {}, { tail: true });
  return (
    <section
      ref={root}
      className={`chapter chapter-pinned${over ? " chapter-over" : ""} ${className}`}
      data-chapter={label}
      data-theme={theme}
    >
      <div className="chapter-sticky">
        {children}
        <span className="chapter-shade" aria-hidden />
      </div>
    </section>
  );
}
