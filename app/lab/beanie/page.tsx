"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Beanie icon (Phosphor "beanie"), candidates.
 *
 * The glyph is one compound path: pom-pom (28-circle at 128,36 with a 12-hole),
 * knit dome, and the ribbed brim (four window holes cut into the band y162..224).
 * The pom bulge is spliced into the outer silhouette, so splitting it out would
 * leave a notch — every candidate therefore moves the beanie as one knitted
 * body, and gets the pom/brim to lead through WHERE it pivots and HOW it
 * stretches instead of through separate parts.
 *
 * Geometry (256 grid): x24..232, pom top y=8, brim bottom y=224. The brim edge
 * (y224) is the natural floor pivot — squash pivoted there keeps the brim
 * planted like it's on a head, and stretch pivoted there makes the pom lead.
 * Escalating: tilt → shiver → pom boing → pull-on → snug fit.
 */
const BEANIE =
  "M224,162.16V144a96.18,96.18,0,0,0-72.34-93,28,28,0,1,0-47.32,0A96.18,96.18,0,0,0,32,144v18.16A16,16,0,0,0,24,176v32a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V176A16,16,0,0,0,224,162.16ZM116,36a12,12,0,1,1,12,12A12,12,0,0,1,116,36Zm12,28a80.09,80.09,0,0,1,80,80v16H48V144A80.09,80.09,0,0,1,128,64Zm-8,112v32H80V176Zm16,0h40v32H136Zm-96,0H64v32H40Zm176,32H192V176h24v32Z";

const BRIM = AT(128, 224); // brim's bottom edge — the "on a head" floor pivot

/* ── 1. TILT — a friendly head-nudge ─────────────────────────────────────────
   The simplest read: the beanie cocks to one side and rocks back, pivoted at
   the brim so it stays seated. One decaying swing — the small return overshoot
   is what makes it feel worn, not floated. */
const tilt: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 6, -2.5, 0],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.3, 0.6, 0.82, 1] },
  },
};

const BeanieTiltIcon = forwardRef<IconHandle, IconProps>(
  function BeanieTiltIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BEANIE} variants={reduced ? undefined : tilt} style={BRIM} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. SHIVER — brr ─────────────────────────────────────────────────────────
   The winter read: a quick cold shiver. Fast, small alternating rocks that
   decay to still — high frequency and LOW amplitude is what separates a shiver
   from a wobble. A whisper of x keeps it from being a pure hinge. */
const shiver: Variants = {
  normal: { rotate: 0, x: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -3, 3, -3, 3, -1.8, 1.8, 0],
    x: [0, -1.5, 1.5, -1.5, 1.5, -1, 1, 0],
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const BeanieShiverIcon = forwardRef<IconHandle, IconProps>(
  function BeanieShiverIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BEANIE} variants={reduced ? undefined : shiver} style={BRIM} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. POM BOING — the knit springs ─────────────────────────────────────────
   Now the material shows up: the beanie compresses like knit fabric, then the
   pom whips up past rest and rings down. Everything pivots at the brim, so the
   brim stays planted and the pom is the free end doing all the travel —
   squash-first sells the wind-up, the inverse scaleX keeps the volume honest. */
const boing: Variants = {
  normal: { scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.85, 1.08, 0.95, 1.03, 1],
    scaleX: [1, 1.09, 0.96, 1.03, 0.99, 1],
    transition: { duration: 1.0, ease: "easeOut", times: [0, 0.22, 0.45, 0.65, 0.83, 1] },
  },
};

const BeanieBoingIcon = forwardRef<IconHandle, IconProps>(
  function BeanieBoingIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BEANIE} variants={reduced ? undefined : boing} style={BRIM} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. PULL-ON — the signature gesture ──────────────────────────────────────
   What a beanie is FOR: it lifts off with a slight carefree tilt, hangs a
   beat, then gets tugged down snug — landing with a knit squash at the brim.
   The mid-air hold is the storytelling beat; the squash on landing is the tug. */
const pullOn: Variants = {
  normal: { y: 0, rotate: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -26, -24, 0, 0, 0],
    rotate: [0, -7, -5, 0, 0, 0],
    scaleX: [1, 1, 1, 1.1, 0.98, 1],
    scaleY: [1, 1.04, 1.04, 0.84, 1.03, 1],
    transition: { duration: 1.2, ease: "easeInOut", times: [0, 0.26, 0.42, 0.66, 0.85, 1] },
  },
};

const BeaniePullOnIcon = forwardRef<IconHandle, IconProps>(
  function BeaniePullOnIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BEANIE} variants={reduced ? undefined : pullOn} style={BRIM} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. SNUG FIT — the showpiece ─────────────────────────────────────────────
   Everything at once, in story order: the beanie drops in from above, lands
   with a knit squash at the brim, the pom boings from the impact, and it
   finishes with a little settling wiggle — snugging itself onto the head.
   Two layers so the physics compose: the outer group carries the drop + squash
   (pivot at the brim), the inner group carries the after-landing wiggle, offset
   in time so the wiggle reads as a CONSEQUENCE of the landing, not noise. */
const snugDrop: Variants = {
  normal: { y: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-32, 0, -5, 0, 0, 0],
    scaleX: [1, 1.11, 0.98, 1.05, 1, 1],
    scaleY: [1, 0.84, 1.05, 0.94, 1.02, 1],
    transition: { duration: 1.25, ease: "easeOut", times: [0, 0.28, 0.46, 0.62, 0.8, 1] },
  },
};
const snugWiggle: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -5, 4, -1.8, 0],
    transition: { duration: 1.25, ease: "easeInOut", times: [0, 0.46, 0.62, 0.78, 0.9, 1] },
  },
};

const BeanieSnugIcon = forwardRef<IconHandle, IconProps>(
  function BeanieSnugIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : snugDrop} style={BRIM}>
            <motion.g variants={reduced ? undefined : snugWiggle} style={BRIM}>
              <path d={BEANIE} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 6. DROP-IN TILT (Tilt + Snug fit) — v1 × v5, in-bounds ──────────────────
   The v5 arrival with the v1 personality — capped to the 256 viewBox so
   nothing ever clips. The glyph spans y8..224, so there is only 8px of
   headroom: a real drop from above would leave the box. Instead the beanie
   POPS on — arriving small (scale 0.75, top at y≈52) and slightly raised,
   growing into place — then lands with a squash-ONLY impact (scaleY ≤ 1 keeps
   the pom low; scaleX 1.11 → bottom edge 243 < 256), rebounds to at most 1.02
   (top y≈4), and finishes with the full v1 tilt. At ±9° about the brim centre
   the far bottom corner swings ~16px below rest — inside the 32px bottom
   margin. Same two-layer split: outer arrival + squash, inner rock, both
   pivoted at the brim, tilt delayed past impact so it lands jaunty, not noisy. */
const dropTiltDrop: Variants = {
  normal: { y: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-10, 0, 0, 0, 0, 0],
    scaleX: [0.75, 1, 1.11, 0.98, 1.02, 1],
    scaleY: [0.75, 1, 0.84, 1.02, 0.98, 1],
    transition: { duration: 1.6, ease: "easeOut", times: [0, 0.22, 0.32, 0.46, 0.58, 1] },
  },
};
const dropTiltRock: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -9, 6, -2.5, 0],
    transition: { duration: 1.6, ease: "easeInOut", times: [0, 0.36, 0.56, 0.74, 0.88, 1] },
  },
};

const BeanieDropTiltIcon = forwardRef<IconHandle, IconProps>(
  function BeanieDropTiltIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : dropTiltDrop} style={BRIM}>
            <motion.g variants={reduced ? undefined : dropTiltRock} style={BRIM}>
              <path d={BEANIE} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BeanieTiltIcon }[] = [
  { name: "Tilt", blurb: "Cocks to one side and rocks back — seated at the brim", Component: BeanieTiltIcon },
  { name: "Shiver", blurb: "A quick cold brr — fast, small rocks that decay to still", Component: BeanieShiverIcon },
  { name: "Pom boing", blurb: "Knit squash, then the pom whips up past rest and rings down", Component: BeanieBoingIcon },
  { name: "Pull-on", blurb: "Lifts off with a tilt, hangs a beat, tugged down snug", Component: BeaniePullOnIcon },
  { name: "Snug fit", blurb: "Drops in, lands with a squash, pom boings, settles with a wiggle", Component: BeanieSnugIcon },
  { name: "Drop-in tilt", blurb: "v1 × v5 — drops in with the knit squash, then rocks the full tilt", Component: BeanieDropTiltIcon },
];

export default function BeanieLabPage() {
  return <VariantGrid title="Beanie" variants={VARIANTS} cycleMs={3400} playMs={2200} />;
}
