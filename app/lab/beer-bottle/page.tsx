"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Beer Bottle icon (Phosphor "beer-bottle"), candidates.
 *
 * The bottle lies on the 45° diagonal: mouth at the top-right (~240,16), body
 * and base at the bottom-left (~23..104, 150..233). One compound path (outline,
 * label window, base band, neck shading), so it animates as rigid glass.
 *
 * The glyph nearly fills the box on its diagonal — the mouth is ~157 units
 * from centre — so every rotation here is bounds-checked: about the CENTER
 * pivot the mouth stays inside for −10°..+8°; about the BASE pivot (80,180)
 * for −6°..+5°. Translations move along the EMPTY perpendicular diagonal
 * (up-left / down-right), never along the bottle's own axis toward the
 * occupied corners. Escalating: wobble → clink → pop → swig → cheers.
 */
const BOTTLE =
  "M245.66,42.34l-32-32a8,8,0,0,0-11.32,11.32l1.48,1.47L148.65,64.51l-38.22,7.65a8.05,8.05,0,0,0-4.09,2.18L23,157.66a24,24,0,0,0,0,33.94L64.4,233a24,24,0,0,0,33.94,0l83.32-83.31a8,8,0,0,0,2.18-4.09l7.65-38.22,41.38-55.17,1.47,1.48a8,8,0,0,0,11.32-11.32ZM96,107.31,148.69,160,104,204.69,51.31,152ZM81.37,224a7.94,7.94,0,0,1-5.65-2.34L34.34,180.28a8,8,0,0,1,0-11.31L40,163.31,92.69,216,87,221.66A8,8,0,0,1,81.37,224ZM177.6,99.2a7.92,7.92,0,0,0-1.44,3.23l-7.53,37.63L160,148.69,107.31,96l8.63-8.63,37.63-7.53a7.92,7.92,0,0,0,3.23-1.44l58.45-43.84,6.19,6.19Z";

const CENTER = AT(128, 128);
const BASE = AT(80, 180); // the bottle's bottom-left body — the set-down pivot

/* ── 1. WOBBLE — just set down ───────────────────────────────────────────────
   The simplest read: the bottle rocks about its base and settles, like it was
   just planted on the bar. A decaying swing, capped at −6°/+4.5° (the mouth
   is 229 units from this pivot — more and it leaves the box). */
const wobble: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -6, 4.5, -2.5, 1, 0],
    transition: { duration: 1.2, ease: "easeInOut", times: [0, 0.22, 0.45, 0.65, 0.83, 1] },
  },
};

const BeerWobbleIcon = forwardRef<IconHandle, IconProps>(
  function BeerWobbleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BOTTLE} variants={reduced ? undefined : wobble} style={BASE} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. CLINK — a toast tap ──────────────────────────────────────────────────
   Now there's intent: the bottle lunges up along its neck to tap an invisible
   glass — a quick +7° flick with a small nudge toward the mouth — and recoils
   back through a tiny counter-swing. Sharp out, soft home: the asymmetry is
   what makes it a tap and not a wave. */
const clink: Variants = {
  normal: { rotate: 0, x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 7, -3, 0],
    x: [0, 4, -1, 0],
    y: [0, -4, 1, 0],
    transition: { duration: 0.7, ease: "easeOut", times: [0, 0.3, 0.65, 1] },
  },
};

const BeerClinkIcon = forwardRef<IconHandle, IconProps>(
  function BeerClinkIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BOTTLE} variants={reduced ? undefined : clink} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. POP — the cap comes off ──────────────────────────────────────────────
   Physics joins in: the bottle recoils DOWN its own axis (toward the empty
   bottom-left corner) as if the cap just popped off the mouth, then springs
   back past rest with a small shake. The recoil direction being exactly
   opposite the mouth is what sells cause-and-effect. */
const pop: Variants = {
  normal: { x: 0, y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -8, 2, -1, 0],
    y: [0, 8, -2, 1, 0],
    rotate: [0, -2.5, 1.5, -0.5, 0],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.2, 0.55, 0.8, 1] },
  },
};

const BeerPopIcon = forwardRef<IconHandle, IconProps>(
  function BeerPopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BOTTLE} variants={reduced ? undefined : pop} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. SWIG — taking a drink ────────────────────────────────────────────────
   The narrative one: the bottle tips back toward vertical (−10° about centre —
   the exact cap before the mouth exits the top of the box) and GLUGS: two
   small rotation pulses at the raised angle, the rhythm of actual drinking,
   then comes back down to rest. */
const swig: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -10, -7.5, -10, -8, -10, 0],
    transition: { duration: 1.5, ease: "easeInOut", times: [0, 0.24, 0.38, 0.52, 0.66, 0.8, 1] },
  },
};

const BeerSwigIcon = forwardRef<IconHandle, IconProps>(
  function BeerSwigIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BOTTLE} variants={reduced ? undefined : swig} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. CHEERS — the showpiece ───────────────────────────────────────────────
   The whole toast in one beat: the bottle rises along the EMPTY up-left
   diagonal, clinks TWICE at the top (the double-tap is the "cheers!"), drops
   back to the bar, and settles with the v1 wobble. Raise → toast → land →
   settle: every earlier candidate, in story order. One layer does it all —
   the lift and the taps never push the mouth past the corner (+6° while
   shifted (−5,−5) keeps every extreme inside the box). */
const cheers: Variants = {
  normal: { rotate: 0, x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -5, -5, -5, -5, 0, 0, 0, 0],
    y: [0, -5, -5, -5, -5, 0, 0, 0, 0],
    rotate: [0, 0, 6, 1.5, 6, 0, -4, 2, 0],
    transition: { duration: 1.6, ease: "easeInOut", times: [0, 0.14, 0.26, 0.36, 0.48, 0.62, 0.75, 0.88, 1] },
  },
};

const BeerCheersIcon = forwardRef<IconHandle, IconProps>(
  function BeerCheersIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BOTTLE} variants={reduced ? undefined : cheers} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 6. POP & FIZZ — the cap comes off and the beer fizzes ───────────────────
   The v3 recoil with its consequences made visible: a cap flies off the mouth,
   spinning, while the bottle kicks back down its axis — then bubbles stream
   out of the open mouth in a loop. The cap and bubbles rest at opacity 0, so
   the rest state stays exactly the plain glyph.

   Bounds: the mouth is at the top-right CORNER (~240,16), so nothing can fly
   up-right. The cap pops up a touch (top y≈10), then arcs down into the EMPTY
   bottom-right region, spinning and fading (right edge peaks at 254). The
   bubbles spawn just off the mouth and rise only ~12 units with a fast fade —
   the smallest stays above y2 at its highest. */
const fizzRecoil: Variants = {
  normal: { x: 0, y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -8, 2, -1, 0],
    y: [0, 8, -2, 1, 0],
    rotate: [0, -2.5, 1.5, -0.5, 0],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.2, 0.55, 0.8, 1] },
  },
};
// Crown-cap side profile (30×14, local origin at its centre): flat top, and a
// crimped zigzag skirt on the +y side — the side that faces the bottle mouth
// once the group is rotated 45° onto the neck.
const CAP =
  "M-15,-7H15V3L10,7L5,3.5L0,7L-5,3.5L-10,7L-15,3Z";
const cap: Variants = {
  normal: { opacity: 0, x: 0, y: 0, rotate: 0, transition: { duration: 0.2 } },
  animate: {
    opacity: [1, 1, 0.9, 0],
    x: [0, 6, 9, 10],
    y: [0, -8, 8, 38],
    rotate: [0, 60, 130, 200],
    transition: { duration: 0.9, ease: "easeOut", times: [0, 0.25, 0.55, 1] },
  },
};
// Bubbles: born small right at the lip (invisible against the glyph), they
// clear it growing to full size as they drift into the empty up-left triangle.
const bubble = (delay: number): Variants => ({
  normal: { opacity: 0, x: 0, y: 0, scale: 0.3, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 1, 0.85, 0],
    x: [0, -10, -22, -32],
    y: [0, -1, -2, -4],
    scale: [0.3, 0.85, 1, 0.9],
    transition: { duration: 1.1, ease: "easeOut", times: [0, 0.3, 0.65, 1], repeat: Infinity, repeatDelay: 0.3, delay },
  },
});
const bubbleFar = (delay: number): Variants => ({
  normal: { opacity: 0, x: 0, y: 0, scale: 0.3, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 1, 0.85, 0],
    x: [0, -9, -20, -30],
    y: [0, -2, -5, -8],
    scale: [0.3, 0.8, 1, 0.9],
    transition: { duration: 1.1, ease: "easeOut", times: [0, 0.3, 0.65, 1], repeat: Infinity, repeatDelay: 0.3, delay },
  },
});
const bubble1 = bubble(0.35);
const bubble2 = bubbleFar(0.7);
const bubble3 = bubbleFar(1.05);

const BeerPopFizzIcon = forwardRef<IconHandle, IconProps>(
  function BeerPopFizzIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BOTTLE} variants={reduced ? undefined : fizzRecoil} style={CENTER} />
          {!reduced && (
            <>
              {/* Cap: a crown cap seated on the mouth at 45°, crimps facing the bottle. */}
              <motion.g variants={cap} style={AT(232, 22)}>
                <path d={CAP} transform="translate(232,22) rotate(45)" />
              </motion.g>
              {/* Bubbles: staggered, streaming from the lip into the open up-left space. */}
              <motion.g variants={bubble1}>
                <circle cx={233} cy={16} r={11} />
              </motion.g>
              <motion.g variants={bubble2}>
                <circle cx={238} cy={20} r={8} />
              </motion.g>
              <motion.g variants={bubble3}>
                <circle cx={226} cy={24} r={6} />
              </motion.g>
            </>
          )}
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BeerWobbleIcon }[] = [
  { name: "Wobble", blurb: "Rocks about its base and settles — just set down on the bar", Component: BeerWobbleIcon },
  { name: "Clink", blurb: "A quick toast tap toward the mouth — sharp out, soft home", Component: BeerClinkIcon },
  { name: "Pop", blurb: "Recoils down its own axis as the cap pops off, springs back", Component: BeerPopIcon },
  { name: "Swig", blurb: "Tips back toward vertical and glugs twice — taking a drink", Component: BeerSwigIcon },
  { name: "Cheers", blurb: "Rises, clinks twice at the top, lands, and settles — the full toast", Component: BeerCheersIcon },
  { name: "Pop & fizz", blurb: "The cap flies off spinning while the bottle kicks, then bubbles stream out", Component: BeerPopFizzIcon },
];

export default function BeerBottleLabPage() {
  return <VariantGrid title="Beer Bottle" variants={VARIANTS} cycleMs={3600} playMs={2400} />;
}
