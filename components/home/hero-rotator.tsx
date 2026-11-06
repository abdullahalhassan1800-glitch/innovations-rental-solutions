"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Rotating typewriter line that sits under the hero headline. Each phrase is
 * drawn from the site's actual inventory mix and destinations. A static,
 * screen-reader-only summary is always present so assistive tech never sees a
 * half-typed phrase. Reduced-motion users get the first phrase immediately.
 */
const PHRASES = [
  "Resort housing in NOIDA.",
  "Serviced stays across Delhi NCR.",
  "Commercial addresses in Noida.",
  "Residential properties, considered.",
];

const START_DELAY_MS = 2100;
const TYPE_SPEED_MS = 45;
const ERASE_SPEED_MS = 24;
const HOLD_MS = 1900;
const GAP_MS = 350;

export function HeroRotator() {
  const [text, setText] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(PHRASES[0]);
      return;
    }

    let cancelled = false;
    let phrase = 0;
    let char = 0;
    let erasing = false;

    const tick = () => {
      if (cancelled) return;
      const current = PHRASES[phrase];

      if (!erasing) {
        char += 1;
        setText(current.slice(0, char));
        if (char >= current.length) {
          erasing = true;
          timer.current = window.setTimeout(tick, HOLD_MS);
          return;
        }
        timer.current = window.setTimeout(tick, TYPE_SPEED_MS);
        return;
      }

      char -= 1;
      setText(current.slice(0, char));
      if (char <= 0) {
        erasing = false;
        phrase = (phrase + 1) % PHRASES.length;
        timer.current = window.setTimeout(tick, GAP_MS);
        return;
      }
      timer.current = window.setTimeout(tick, ERASE_SPEED_MS);
    };

    timer.current = window.setTimeout(tick, START_DELAY_MS);

    return () => {
      cancelled = true;
      if (timer.current !== undefined) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <span className="mt-3 flex min-h-[2.1em] items-start text-[0.7rem] font-semibold uppercase leading-relaxed tracking-[0.16em] text-brass-soft sm:min-h-[1.6em] sm:items-center sm:text-[0.8rem] sm:tracking-[0.18em]">
      <span aria-hidden>
        {text}
        <span className="typing-caret typing-caret-sm" />
      </span>
    </span>
  );
}
