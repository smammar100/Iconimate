"use client";

import { Suspense, useRef } from "react";
import type { IconMetaEntry } from "@/registry/icon-meta.gen";
import { LAZY_ICONS } from "@/registry/lazy-icons.gen";
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
  entry: IconMetaEntry;
  onAction: (kind: IconAction, slug: string, name: string) => void;
}) {
  const ref = useRef<IconHandle>(null);
  const { name, slug } = entry;
  // Each icon is its own lazy chunk — hydrates progressively instead of one
  // blocking registry bundle. Refs forward through React.lazy to IconHandle.
  const Component = LAZY_ICONS[slug];
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
  // Official v0 wordmark (fill inherits currentColor).
  return (
    <svg width="18" height="9" viewBox="0 0 40 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M23.3919 0H32.9188C36.7819 0 39.9136 3.13165 39.9136 6.99475V16.0805H36.0006V6.99475C36.0006 6.90167 35.9969 6.80925 35.9898 6.71766L26.4628 16.079C26.4949 16.08 26.5272 16.0805 26.5595 16.0805H36.0006V19.7762H26.5595C22.6964 19.7762 19.4788 16.6139 19.4788 12.7508V3.68923H23.3919V12.7508C23.3919 12.9253 23.4054 13.0977 23.4316 13.2668L33.1682 3.6995C33.0861 3.6927 33.003 3.68923 32.9188 3.68923H23.3919V0Z" />
      <path d="M13.7688 19.0956L0 3.68759H5.53933L13.6231 12.7337V3.68759H17.7535V17.5746C17.7535 19.6705 15.1654 20.6584 13.7688 19.0956Z" />
    </svg>
  );
}
