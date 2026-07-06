"use client";

import { useRef } from "react";
import type { IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";
import { metaFor, v0Url } from "./icon-meta";

/** The copy/open actions a card (or palette row) can request. */
export type IconAction = "copy-cli" | "copy-code";

/**
 * A Dark Command grid cell. The whole card is the trigger — pointer, keyboard focus
 * and tap drive the icon through its imperative handle. Click copies the install
 * line; a hover action row offers Copy .tsx / Copy CLI / Open in v0 (lucide-animated
 * style). The card is a div[role=button] because the actions are real <button>s and
 * buttons can't nest.
 */
export function DarkIconCard({
  entry,
  onAction,
}: {
  entry: IconEntry;
  onAction: (kind: IconAction, slug: string, name: string) => void;
}) {
  const ref = useRef<IconHandle>(null);
  const { Component, name, slug } = entry;
  const { motion } = metaFor(slug);

  const play = () => ref.current?.startAnimation();
  const rest = () => ref.current?.stopAnimation();

  return (
    <div
      role="button"
      tabIndex={0}
      className="dc-card"
      aria-label={`${name} — copy install command`}
      onMouseEnter={play}
      onMouseLeave={rest}
      onFocus={(e) => {
        // Only the card itself playing — action-button focus shouldn't re-trigger.
        if (e.target === e.currentTarget) play();
      }}
      onBlur={(e) => {
        if (e.target === e.currentTarget) rest();
      }}
      onClick={() => {
        play();
        onAction("copy-cli", slug, name);
      }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          play();
          onAction("copy-cli", slug, name);
        }
      }}
    >
      <span className="dc-card__top">
        <span className="dc-card__icon">
          <Component ref={ref} size={30} style={{ pointerEvents: "none" }} />
        </span>
        <span className="dc-card__actions">
          <button
            type="button"
            className="dc-card__action"
            aria-label={`Copy ${name} .tsx code`}
            title="Copy .tsx code"
            onClick={(e) => {
              e.stopPropagation();
              onAction("copy-code", slug, name);
            }}
          >
            <CodeGlyph />
          </button>
          <button
            type="button"
            className="dc-card__action"
            aria-label={`Copy ${name} shadcn CLI command`}
            title="Copy shadcn CLI command"
            onClick={(e) => {
              e.stopPropagation();
              onAction("copy-cli", slug, name);
            }}
          >
            <TerminalGlyph />
          </button>
          <a
            className="dc-card__action"
            href={v0Url(slug)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${name} in v0`}
            title="Open in v0"
            onClick={(e) => e.stopPropagation()}
          >
            <V0Glyph />
          </a>
        </span>
      </span>
      <span>
        <span className="dc-card__name">{name}</span>
        <span className="dc-card__motion dc-mono">{motion}</span>
      </span>
    </div>
  );
}

function CodeGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  );
}
function TerminalGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m4 17 6-6-6-6M12 19h8" />
    </svg>
  );
}
function V0Glyph() {
  // "v0" wordmark simplified to strokes so it inherits currentColor at 14px.
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8l4 8 4-8" />
      <ellipse cx="17" cy="12" rx="4" ry="5" />
    </svg>
  );
}
