"use client";

import { useRef } from "react";
import type { IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";
import { metaFor } from "./icon-meta";

/**
 * A Dark Command grid cell. The whole card is the trigger — pointer, keyboard focus
 * and tap drive the icon through its imperative handle. Click copies the install line.
 * The icon stroke stays light so its motion pops; the icon's old hue is a faint glow only.
 */
export function DarkIconCard({
  entry,
  onCopy,
}: {
  entry: IconEntry;
  onCopy: (slug: string, name: string) => void;
}) {
  const ref = useRef<IconHandle>(null);
  const { Component, name, slug } = entry;
  const { motion } = metaFor(slug);

  const play = () => ref.current?.startAnimation();
  const rest = () => ref.current?.stopAnimation();

  return (
    <button
      type="button"
      className="dc-card"
      aria-label={`${name} — copy install command`}
      onMouseEnter={play}
      onMouseLeave={rest}
      onFocus={play}
      onBlur={rest}
      onClick={() => {
        play();
        onCopy(slug, name);
      }}
    >
      <span className="dc-card__top">
        <span className="dc-card__icon">
          <Component ref={ref} size={30} style={{ pointerEvents: "none" }} />
        </span>
        <span className="dc-card__copy" aria-hidden>
          <CopyGlyph />
        </span>
      </span>
      <span>
        <span className="dc-card__name">{name}</span>
        <span className="dc-card__motion dc-mono">{motion}</span>
      </span>
    </button>
  );
}

function CopyGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
    </svg>
  );
}
