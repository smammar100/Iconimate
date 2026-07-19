"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Beach Ball icon (Phosphor "beach-ball"), candidates.
 *
 * The glyph is a single compound path — the ball outline plus its curved panel
 * seams, all one shape — so every candidate animates it as a rigid body, which
 * is exactly how a ball moves. Nothing is added and nothing is filled; the whole
 * glyph is the actor.
 *
 * Geometry (256 grid): a circle of radius 104 centred at (128,128), filling most
 * of the box. Rotation about the centre maps the circle onto itself (no clip);
 * the harness svg is overflow-visible and renders at 56px in a padded tile, so
 * modest bob/roll/pop past the edge reads fine. Escalating: spin → bounce → roll
 * → float → toss-in.
 */
const BALL =
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm81.7,71.3a199.77,199.77,0,0,0-40.94-8.06A199.77,199.77,0,0,0,160.7,46.3,88.57,88.57,0,0,1,209.7,95.3ZM216,128a87.83,87.83,0,0,1-4.28,27.12,200.28,200.28,0,0,0-29.16-49.93,183.12,183.12,0,0,1,32.31,8.75A88.14,88.14,0,0,1,216,128ZM142.06,41.13a183.12,183.12,0,0,1,8.75,32.31,200.28,200.28,0,0,0-49.93-29.16,88.05,88.05,0,0,1,41.18-3.15ZM80.44,54a183.88,183.88,0,0,1,61.25,32.64A200.21,200.21,0,0,0,40.41,119.5,88.11,88.11,0,0,1,80.44,54ZM40.67,138.86a184.08,184.08,0,0,1,112.88-36.41,184.08,184.08,0,0,1-36.41,112.88A88.18,88.18,0,0,1,40.67,138.86Zm95.83,76.73a200.21,200.21,0,0,0,32.87-101.28A183.88,183.88,0,0,1,202,175.56,88.11,88.11,0,0,1,136.5,215.59Z";

const CENTER = AT(128, 128);
const BOTTOM = AT(128, 226); // contact point — for the bounce squash
const BOTTOM_TRUE = AT(128, 232); // the ball's true bottom edge — for the in-bounds squash

/* ── 1. SPIN — the panels turn ───────────────────────────────────────────────
   The simplest true read of a beach ball: one smooth, continuous rotation about
   the centre. A single [0,360] segment (never a multi-stop keyframe) so it never
   stalls mid-turn; linear, so it reads as steady momentum. */
const spin: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 360],
    transition: { duration: 1.4, ease: "linear", repeat: Infinity },
  },
};

const BeachSpinIcon = forwardRef<IconHandle, IconProps>(
  function BeachSpinIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BALL} variants={reduced ? undefined : spin} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. BOUNCE — squash and stretch ──────────────────────────────────────────
   The ball drops, lands with a squash against the floor, and rebounds a little
   lower each time. Scale pivots at the contact point (128,226), so the squash
   flattens onto the ground rather than through its middle — the read that makes
   a bounce feel weighted. */
const bounce: Variants = {
  normal: { y: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -34, 0, -12, 0],
    scaleX: [1, 0.96, 1.18, 0.99, 1.06, 1],
    scaleY: [1, 1.05, 0.82, 1.02, 0.93, 1],
    transition: { duration: 1.15, ease: "easeOut", times: [0, 0.28, 0.5, 0.66, 0.82, 1] },
  },
};

const BeachBounceIcon = forwardRef<IconHandle, IconProps>(
  function BeachBounceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BALL} variants={reduced ? undefined : bounce} style={BOTTOM} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. ROLL — spin coupled to travel ────────────────────────────────────────
   Now the rotation means something: the ball rolls right, then back, and the
   spin is locked to the direction of travel (moving right → turning clockwise),
   so the panels track the ground. That coupling is what separates a roll from a
   ball that just slides while spinning. */
const roll: Variants = {
  normal: { x: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 34, 0, -34, 0],
    rotate: [0, 30, 0, -30, 0],
    transition: { duration: 1.4, ease: "easeInOut", times: [0, 0.3, 0.5, 0.8, 1] },
  },
};

const BeachRollIcon = forwardRef<IconHandle, IconProps>(
  function BeachRollIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BALL} variants={reduced ? undefined : roll} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. FLOAT — spins while it drifts ────────────────────────────────────────
   The summer read: the ball turns steadily while bobbing and breathing, as if
   floating on water. Two layers — an outer group carries the lazy bob + tilt +
   breath, an inner group carries the continuous spin — so the drift and the
   rotation compose instead of fighting. Dreamier and richer than a plain spin. */
const floatDrift: Variants = {
  normal: { y: 0, rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -9, 0, -9, 0],
    rotate: [0, 3.5, 0, -3.5, 0],
    scale: [1, 1.03, 1, 1.03, 1],
    transition: { duration: 2.6, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
};
const floatSpin: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 360],
    transition: { duration: 2.6, ease: "linear", repeat: Infinity },
  },
};

const BeachFloatIcon = forwardRef<IconHandle, IconProps>(
  function BeachFloatIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : floatDrift} style={CENTER}>
            <motion.g variants={reduced ? undefined : floatSpin} style={CENTER}>
              <path d={BALL} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. TOSS-IN — pops in spinning, on an arc ────────────────────────────────
   The showpiece: the ball flies in from nothing — scaling up past full with a
   springy overshoot, spinning a third of a turn into place, and settling down a
   short arc as if tossed onto the sand. Entrance + spin + overshoot + arc in one
   beat. Everything the earlier four do, arriving at once. */
const tossIn: Variants = {
  normal: { scale: 1, rotate: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1.12, 0.96, 1],
    rotate: [-140, 12, -4, 0],
    y: [-20, 5, -1, 0],
    transition: { duration: 0.9, ease: OVERSHOOT, times: [0, 0.55, 0.8, 1] },
  },
};

const BeachTossIcon = forwardRef<IconHandle, IconProps>(
  function BeachTossIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BALL} variants={reduced ? undefined : tossIn} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 6. SPIN-BOUNCE (Spin + Bounce) — v1 × v2, in-bounds ──────────────────────
   The ball spins continuously while it bounces — but everything is capped to the
   256 viewBox so nothing clips at icon sizes. The ball spans y24..232 (a 24px
   margin), so: apex is y=-20 (top lands at y=4), the impact is squash-ONLY
   (scaleY≤1 — no vertical stretch that would push the top out), and scaleX peaks
   at 1.12 (half-width 116 < 128). Rotation maps the circle onto itself, so it is
   free. Two layers: outer bounces (squash pivoted at the floor, 232), inner
   spins about the centre — so the ball spins even as it flattens on landing. */
const spinBounceDrop: Variants = {
  normal: { y: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -20, 0, -9, 0, 0],
    scaleY: [1, 1, 0.85, 1, 0.92, 1],
    scaleX: [1, 1, 1.12, 1, 1.06, 1],
    transition: { duration: 1.3, ease: "easeOut", times: [0, 0.26, 0.48, 0.66, 0.84, 1] },
  },
};
const spinBounceSpin: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 360],
    transition: { duration: 1.3, ease: "linear", repeat: Infinity },
  },
};

const BeachSpinBounceIcon = forwardRef<IconHandle, IconProps>(
  function BeachSpinBounceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : spinBounceDrop} style={BOTTOM_TRUE}>
            <motion.g variants={reduced ? undefined : spinBounceSpin} style={CENTER}>
              <path d={BALL} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 7. BOUNCE-THEN-ROLL (Bounce → Roll) — v2 × v3, sequential, in-bounds ──────
   Two phases, in order. FIRST it bounces in place: two hops (x stays 0), each
   landing with a big, sharp squash. THEN it rolls right and back, the spin
   locked to travel. Everything is capped to the 256 box: hop apex is y=-22
   (top = 128-22-104 = 2), the squash fires at the centre (x=0) so scaleX 1.22
   (edge 128+127 = 255) never clips, and the roll apex is x=22 (edge 254).
   Rotation maps the circle onto itself, so the roll is free. Two layers: outer
   carries the bounce (translate + squash, pivot at the floor 232), inner carries
   the roll spin about the centre — and the two never overlap in time. */
const rollBounceTravel: Variants = {
  normal: { x: 0, y: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // Phase 1 (0..0.55): bounce in place — two hops, x stays 0.
    // Phase 2 (0.55..1): roll right (x→22) and back to centre.
    x: [0, 0, 0, 0, 0, 22, 0, 0],
    y: [0, -22, 0, -11, 0, 0, 0, 0],
    // Big squash at each landing (t0.3, t0.55) with its OWN sharp timing so it
    // snaps flat and springs back instead of easing through. scaleX capped at
    // 1.22 (edge 255), and it only fires while x=0, so the widen never clips.
    scaleX: [1, 1, 1.22, 1, 1.12, 1, 1],
    scaleY: [1, 1, 0.7, 1, 0.86, 1, 1],
    transition: {
      duration: 2.0,
      ease: "easeInOut",
      times: [0, 0.16, 0.3, 0.42, 0.55, 0.72, 0.88, 1],
      scaleX: { duration: 2.0, ease: "easeOut", times: [0, 0.24, 0.3, 0.4, 0.55, 0.63, 1] },
      scaleY: { duration: 2.0, ease: "easeOut", times: [0, 0.24, 0.3, 0.4, 0.55, 0.63, 1] },
    },
  },
};
const rollBounceSpin: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Still through the bounce (0..0.55), then rolls coupled to travel: right →
    // clockwise, then anticlockwise back to rest.
    rotate: [0, 0, 0, 0, 0, 30, 0, 0],
    transition: { duration: 2.0, ease: "easeInOut", times: [0, 0.16, 0.3, 0.42, 0.55, 0.72, 0.88, 1] },
  },
};

const BeachRollBounceIcon = forwardRef<IconHandle, IconProps>(
  function BeachRollBounceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : rollBounceTravel} style={BOTTOM_TRUE}>
            <motion.g variants={reduced ? undefined : rollBounceSpin} style={CENTER}>
              <path d={BALL} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BeachSpinIcon }[] = [
  { name: "Spin", blurb: "One smooth continuous turn — steady panel momentum", Component: BeachSpinIcon },
  { name: "Bounce", blurb: "Drops and lands with a weighted squash at the contact point", Component: BeachBounceIcon },
  { name: "Roll", blurb: "Rolls there and back with the spin locked to its travel", Component: BeachRollIcon },
  { name: "Float", blurb: "Turns steadily while it bobs, tilts and breathes — floating", Component: BeachFloatIcon },
  { name: "Toss-in", blurb: "Flies in from nothing, spinning, and settles on a short arc", Component: BeachTossIcon },
  { name: "Spin-bounce", blurb: "v1 × v2 — spins while it bounces, capped to stay in the box", Component: BeachSpinBounceIcon },
  { name: "Bounce-then-roll", blurb: "v2 × v3 — bounces in place with a big squash, then rolls", Component: BeachRollBounceIcon },
];

export default function BeachBallLabPage() {
  return <VariantGrid title="Beach Ball" variants={VARIANTS} cycleMs={3600} playMs={2400} />;
}
