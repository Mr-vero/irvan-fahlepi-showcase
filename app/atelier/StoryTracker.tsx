"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** The only script on this page: it reports when the story is started and finished. */
export default function StoryTracker() {
  useEffect(() => {
    let started = false;
    const onScroll = () => {
      if (!started && window.scrollY > window.innerHeight * 0.5) {
        started = true;
        track("story_start");
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const end = document.getElementById("at-end");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track("story_complete");
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    if (end) io.observe(end);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);
  return null;
}
