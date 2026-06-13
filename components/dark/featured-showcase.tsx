"use client";

import { useEffect, useRef, useState } from "react";
import { icons } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";
import { metaFor } from "./icon-meta";

/**
 * The hero stage. Cycles through the whole set, playing each icon as it lands —
 * a self-running proof that the library moves — with a replay control and
 * position dots. The hue glow behind the glyph shifts to match the current icon.
 */
export function FeaturedShowcase() {
  const [index, setIndex] = useState(0);
  const ref = useRef<IconHandle>(null);
  const entry = icons[index];
  const { motion, glow } = metaFor(entry.slug);
  const Component = entry.Component;

  useEffect(() => {
    const t = setTimeout(() => ref.current?.startAnimation(), 140);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % icons.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="dc-stage">
      <span className="dc-stage__glow" style={{ background: glow }} aria-hidden />
      <button
        type="button"
        className="dc-stage__replay"
        aria-label="Replay animation"
        onClick={() => ref.current?.startAnimation()}
      >
        <ReplayGlyph />
      </button>
      <span className="dc-stage__icon">
        <Component key={entry.slug} ref={ref} size={92} />
      </span>
      <span className="dc-stage__meta">
        <span className="dc-stage__name">{entry.name}</span>
        <span className="dc-mono" style={{ opacity: 0.7 }}>
          {motion} · spring
        </span>
      </span>
      <span className="dc-stage__dots" aria-hidden>
        {icons.map((ic, i) => (
          <span key={ic.slug} className={`dc-stage__dot${i === index ? " is-on" : ""}`} />
        ))}
      </span>
    </div>
  );
}

function ReplayGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
