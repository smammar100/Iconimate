"use client";

import { useRef } from "react";
import { visibleIcons, type IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";

/**
 * The closing slab — a CTA merged seamlessly into the footer inside one dark,
 * rounded panel (à la The Leap / OpenTable). The middle band is an infinite
 * marquee of the real registry icons drifting past: the footer itself is a live
 * demo of the product. Each marquee icon plays its own motion on hover, and the
 * whole strip pauses while hovered. Footer meta docks at the bottom of the slab.
 *
 * The slab uses fixed near-black values (not theme tokens) so it reads as a
 * deliberate dark CTA in light mode and a lifted panel in dark mode alike.
 */

// A generous, de-duplicated slice for the marquee (drawn from the visible set).
const MARQUEE_COUNT = 28;

function MarqueeIcon({ entry }: { entry: IconEntry }) {
  const ref = useRef<IconHandle>(null);
  const { Component, name } = entry;
  return (
    <span
      className="cta-marquee__icon"
      title={name}
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
    >
      <Component ref={ref} size={26} style={{ pointerEvents: "none" }} />
    </span>
  );
}

export function CtaFooter({
  onGetAll,
  onOpenSearch,
  count,
}: {
  onGetAll: () => void;
  onOpenSearch: () => void;
  count: number;
}) {
  const marquee = visibleIcons.slice(0, MARQUEE_COUNT);
  // Two copies back-to-back so the -50% translate loops seamlessly.
  const track = [...marquee, ...marquee];

  return (
    <section className="cta" aria-labelledby="cta-heading">
      <div className="cta__glow" aria-hidden />

      <div className="cta__top">
        <span className="cta__eyebrow">
          <span className="cta__eyebrow-dot" />
          Open source · MIT · {count} icons
        </span>
        <h2 id="cta-heading" className="cta__title">
          Icons that earn their motion.
          <br />
          Now yours to ship.
        </h2>
        <p className="cta__sub">
          Copy one, or install the whole set with a single command. Hand-drawn on the Phosphor 256
          grid, tuned to read at 24px.
        </p>
        <div className="cta__actions">
          <button type="button" className="cta__btn cta__btn--primary" onClick={onGetAll}>
            Get all icons
          </button>
          <button type="button" className="cta__btn cta__btn--ghost" onClick={onOpenSearch}>
            Browse the set <span className="cta__kbd">⌘K</span>
          </button>
        </div>
      </div>

      {/* live product demo: the icon set, drifting */}
      <div className="cta-marquee" aria-hidden>
        <div className="cta-marquee__track">
          {track.map((entry, i) => (
            <MarqueeIcon key={`${entry.slug}-${i}`} entry={entry} />
          ))}
        </div>
        <div className="cta-marquee__fade cta-marquee__fade--l" />
        <div className="cta-marquee__fade cta-marquee__fade--r" />
      </div>

      <div className="cta__foot">
        <span>iconimate · v0.1.0 · {count} icons</span>
        <span className="cta__foot-meta">
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <span aria-hidden>·</span>
          <span>⌘K search</span>
          <span aria-hidden>·</span>
          <span>drawn on the Phosphor 256 grid</span>
        </span>
      </div>
    </section>
  );
}
