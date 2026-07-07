"use client";

import { useReducedMotion } from "motion/react";
import PrismaticBurst from "./PrismaticBurst";

/**
 * The closing slab — a simple CTA merged into the footer, over an animated
 * PrismaticBurst (React Bits, WebGL via ogl). The burst supplies all the visual
 * energy, so the content stays minimal: headline, one line, and two links —
 * Star on GitHub and Support us. Footer meta docks at the bottom of the panel.
 *
 * The slab uses fixed near-black values (not theme tokens) so it reads as a
 * deliberate dark CTA in both light and dark modes; a radial scrim keeps the
 * text legible over the burst.
 */

const REPO_URL = "https://github.com/smammar100/Iconimate";
const SPONSOR_URL = "https://github.com/sponsors/smammar100";

// On-brand palette for the burst (Iconimate purple → indigo → white).
const BURST_COLORS = ["#6e56f7", "#4d3dff", "#ff5f9e", "#ffffff"];

export function CtaFooter({ count }: { count: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="cta" aria-labelledby="cta-heading">
      <div className="cta__burst" aria-hidden>
        <PrismaticBurst
          animationType="rotate3d"
          intensity={1.7}
          speed={0.35}
          distort={1.1}
          rayCount={0}
          paused={reduceMotion ?? false}
          mixBlendMode="lighten"
          colors={BURST_COLORS}
        />
      </div>
      <div className="cta__scrim" aria-hidden />

      <div className="cta__top">
        <span className="cta__eyebrow">
          <span className="cta__eyebrow-dot" />
          Open source · MIT · {count} icons
        </span>
        <h2 id="cta-heading" className="cta__title">
          Icons that earn their motion.
        </h2>
        <p className="cta__sub">
          Free and open source. Star the repo to follow along, or chip in to keep the set growing.
        </p>
        <div className="cta__actions">
          <a className="cta__btn cta__btn--primary" href={REPO_URL} target="_blank" rel="noreferrer">
            <StarGlyph />
            Star on GitHub
          </a>
          <a className="cta__btn cta__btn--ghost" href={SPONSOR_URL} target="_blank" rel="noreferrer">
            <HeartGlyph />
            Support us
          </a>
        </div>
      </div>

      <div className="cta__foot">
        <span>iconimate · v0.1.0 · {count} icons</span>
        <span className="cta__foot-meta">
          <a href={REPO_URL} target="_blank" rel="noreferrer">
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

function StarGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m12 2 2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2Z" />
    </svg>
  );
}
function HeartGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
