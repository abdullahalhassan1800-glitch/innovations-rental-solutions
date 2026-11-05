"use client";

import { useEffect, useState } from "react";
import { HeroRotator } from "@/components/home/hero-rotator";

/**
 * Hero headline with a typewriter reveal. The full heading (and its supporting
 * line) is always present in the accessibility tree and server-rendered HTML
 * via a sr-only copy, so search engines and screen readers never see partial
 * text. Users who prefer reduced motion get the finished headline immediately.
 */
const LINE_ONE = "Addresses";
const LINE_TWO = "with ";
const LINE_TWO_ACCENT = "ambition.";
const TOTAL = LINE_ONE.length + LINE_TWO.length + LINE_TWO_ACCENT.length;

const TYPE_DELAY_MS = 250;
const TYPE_SPEED_MS = 70;

export function HeroHeading() {
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(TOTAL);
      return;
    }

    let index = 0;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        index += 1;
        setTyped(index);
        if (index >= TOTAL) {
          window.clearInterval(interval);
          interval = undefined;
        }
      }, TYPE_SPEED_MS);
    }, TYPE_DELAY_MS);

    return () => {
      window.clearTimeout(start);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  const afterLineOne = Math.max(0, typed - LINE_ONE.length);
  const lineOne = LINE_ONE.slice(0, Math.min(typed, LINE_ONE.length));
  const lineTwo = LINE_TWO.slice(0, Math.min(afterLineOne, LINE_TWO.length));
  const accent = LINE_TWO_ACCENT.slice(0, Math.max(0, afterLineOne - LINE_TWO.length));

  return (
    <h1 className="hero-display mt-5 text-paper sm:mt-6">
      <span className="sr-only">
        Addresses with ambition. Resort housing, serviced stays, commercial and residential
        addresses across Delhi NCR, Jaipur and Katra.
      </span>
      <span aria-hidden>
        {lineOne}
        {typed < LINE_ONE.length ? <span className="typing-caret" /> : null}
        <br />
        {lineTwo}
        <span className="text-brass-soft">{accent}</span>
        {typed >= LINE_ONE.length && typed < TOTAL ? <span className="typing-caret" /> : null}
      </span>
      <HeroRotator />
    </h1>
  );
}
