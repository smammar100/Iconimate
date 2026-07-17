"use client";

import { Suspense, useRef } from "react";
import type { IconView } from "@/lib/sanity/icons";
import { LAZY_ICONS } from "@/registry/lazy-icons.gen";
import type { IconHandle } from "@/lib/icon";

/** The copy actions a card (or palette row) can request. */
export type IconAction = "copy-cli" | "copy-code" | "copy-prompt";

/**
 * A Dark Command grid cell. The whole card is the trigger — pointer, keyboard focus
 * and tap drive the icon through its imperative handle. Click copies the install
 * line; a hover action row offers Copy .tsx / Copy CLI / Copy AI prompt. The card is
 * a div[role=button] because the actions are real <button>s and buttons can't nest.
 */
export function DarkIconCard({
  entry,
  onAction,
}: {
  entry: IconView;
  onAction: (kind: IconAction, slug: string, name: string) => void;
}) {
  const ref = useRef<IconHandle>(null);
  // name and motion come from the resolved entry (Sanity, or the repo when
  // Sanity is unreachable) rather than being looked up here — otherwise a label
  // edited in the Studio would never reach the card.
  const { name, slug, motion } = entry;
  // Each icon is its own lazy chunk — hydrates progressively instead of one
  // blocking registry bundle. Refs forward through React.lazy to IconHandle.
  const Component = LAZY_ICONS[slug];

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
          {/* Fixed-size fallback so the lazy chunk landing never shifts layout. */}
          <Suspense fallback={<span style={{ width: 30, height: 30, display: "inline-block" }} />}>
            <Component ref={ref} size={30} style={{ pointerEvents: "none" }} />
          </Suspense>
        </span>
      </span>
      <span>
        <span className="dc-card__name">{name}</span>
        <span className="dc-card__motion dc-mono">{motion}</span>
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
        <button
          type="button"
          className="dc-card__action"
          aria-label={`Copy ${name} AI prompt`}
          title="Copy AI prompt"
          onClick={(e) => {
            e.stopPropagation();
            onAction("copy-prompt", slug, name);
          }}
        >
          <SparkleGlyph />
        </button>
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
function SparkleGlyph() {
  // Matches the stroke weight/round joins of the two glyphs beside it.
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
      <path d="M18 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </svg>
  );
}
