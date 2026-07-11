"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

// The burst is a WebGL effect (ogl) — heavy and purely decorative, and it lives
// at the very bottom of the page. Load it client-side only and keep `ogl` out of
// the initial bundle so it never blocks first paint / interactivity.
const PrismaticBurst = dynamic(() => import("./PrismaticBurst"), { ssr: false });

/**
 * The closing slab — a simple CTA merged into the footer, over an animated
 * PrismaticBurst (React Bits, WebGL via ogl). The burst supplies all the visual
 * energy, so the content stays minimal: headline, one line, and a single
 * Star on GitHub link. Footer meta docks at the bottom of the panel.
 *
 * The slab uses fixed near-black values (not theme tokens) so it reads as a
 * deliberate dark CTA in both light and dark modes; a radial scrim keeps the
 * text legible over the burst.
 */

const REPO_URL = "https://github.com/smammar100/Iconimate";

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
          Free and open source. Star the repo to follow along as the set grows.
        </p>
        <div className="cta__actions">
          <a className="cta__btn cta__btn--primary" href={REPO_URL} target="_blank" rel="noreferrer">
            <StarGlyph />
            Star on GitHub
          </a>
        </div>
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
