"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Bed icon (Phosphor "bed"), candidates.
 *
 * Side-view bed: left headboard post (x16..32, y40..216), right post reaching
 * the viewBox edge (x240..256, y104..216), pillow window (x32..104, y88..160),
 * mattress window (x120..240). One compound path, so the bed itself moves as a
 * rigid frame. The right post TOUCHES x=256 — zero horizontal margin — so every
 * squash/stretch here is vertical-only, pivoted at the floor (y216).
 *
 * The Zs are extra paths that rest at opacity 0, so the rest state stays
 * pixel-identical to the Phosphor glyph. Escalating: flop → bounce → breathe →
 * zzz (the reference video) → sleep-tight.
 */
const BED =
  "M216,72H32V48a8,8,0,0,0-16,0V208a8,8,0,0,0,16,0V176H240v32a8,8,0,0,0,16,0V112A40,40,0,0,0,216,72ZM32,88h72v72H32Zm88,72V88h96a24,24,0,0,1,24,24v48Z";

/** Block "Z" glyph, 36×36 at its own origin — positioned per-use via transform. */
const Z = "M0,0H36V10L15,26H36V36H0V26L21,10H0Z";

const FLOOR = AT(128, 216); // the legs' floor line — squash pivots here

/* ── 1. FLOP — someone just landed on it ─────────────────────────────────────
   The mattress take: a single soft vertical squash and recover, pivoted at the
   floor so the legs stay planted. Vertical-only (the frame touches x=256, so
   any widen would clip) — which conveniently reads as pure mattress give. */
const flop: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.93, 1.03, 0.98, 1],
    transition: { duration: 0.9, ease: "easeOut", times: [0, 0.25, 0.55, 0.8, 1] },
  },
};

const BedFlopIcon = forwardRef<IconHandle, IconProps>(
  function BedFlopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BED} variants={reduced ? undefined : flop} style={FLOOR} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. BOUNCE — testing the springs ─────────────────────────────────────────
   Two hops of the whole frame, each landing with a small floor-pivoted squash
   a beat after touchdown. More playful than the flop: the bed itself has the
   bounce, like a kid checking the mattress. Apex −12 keeps the headboard at
   y28, well inside the box. */
const bounce: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, 0, -5, 0, 0],
    scaleY: [1, 1, 0.95, 1, 0.98, 1],
    transition: { duration: 1.1, ease: "easeOut", times: [0, 0.24, 0.45, 0.64, 0.82, 1] },
  },
};

const BedBounceIcon = forwardRef<IconHandle, IconProps>(
  function BedBounceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BED} variants={reduced ? undefined : bounce} style={FLOOR} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. BREATHE — deep-sleep rhythm ──────────────────────────────────────────
   The quietest candidate: a slow vertical swell and release, twice, like the
   slow breathing of whoever is under the covers. scaleY-only about the floor
   (top of frame moves 216→36.5 at peak — inside the box; and no scaleX means
   the x=256 edge never moves). */
const breathe: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1.02, 1, 1.02, 1],
    transition: { duration: 2.4, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
};

const BedBreatheIcon = forwardRef<IconHandle, IconProps>(
  function BedBreatheIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BED} variants={reduced ? undefined : breathe} style={FLOOR} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. ZZZ — the reference video ────────────────────────────────────────────
   The bed sleeps: the frame holds still while Zs rise from above the pillow,
   drifting up and to the right as they fade — then loop. Mirrors the video's
   read (Z born near the pillow, floats up, dissolves, repeats) with two
   staggered Zs for the classic "zzz" trail. Both rest at opacity 0, so the
   rest state is exactly the plain glyph. The big Z lives at (66,22)+36 and
   rises 14 — never above y8 — and the small Z tops out at y4; both inside. */
const zBig: Variants = {
  normal: { opacity: 0, y: 0, scale: 0.7, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [10, 2, -8, -14],
    scale: [0.7, 1, 1, 0.95],
    transition: { duration: 1.6, ease: "easeOut", times: [0, 0.25, 0.7, 1], repeat: Infinity, repeatDelay: 0.25 },
  },
};
const zSmall: Variants = {
  normal: { opacity: 0, y: 0, scale: 0.7, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 0.9, 0.9, 0],
    y: [12, 4, -5, -10],
    scale: [0.5, 0.7, 0.7, 0.65],
    transition: { duration: 1.6, ease: "easeOut", times: [0, 0.25, 0.7, 1], repeat: Infinity, repeatDelay: 0.25, delay: 0.55 },
  },
};

const BedZzzIcon = forwardRef<IconHandle, IconProps>(
  function BedZzzIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={BED} />
          {!reduced && (
            <>
              <motion.g variants={zBig}>
                <path d={Z} transform="translate(66,22)" />
              </motion.g>
              <motion.g variants={zSmall}>
                <path d={Z} transform="translate(112,14)" />
              </motion.g>
            </>
          )}
        </Svg>
      </div>
    );
  },
);

/* ── 5. SLEEP TIGHT — the showpiece ──────────────────────────────────────────
   The whole story: someone flops onto the bed (the v1 squash), the mattress
   settles, and THEN the Zs start rising in the endless zzz loop — falling
   asleep, in order. The flop plays once on the frame; the Zs are delayed past
   the settle so the sleep reads as a consequence of lying down. */
const tightFlop: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.93, 1.03, 0.98, 1],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.25, 0.55, 0.8, 1] },
  },
};
const tightZBig: Variants = {
  normal: { opacity: 0, y: 0, scale: 0.7, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [10, 2, -8, -14],
    scale: [0.7, 1, 1, 0.95],
    transition: { duration: 1.6, ease: "easeOut", times: [0, 0.25, 0.7, 1], repeat: Infinity, repeatDelay: 0.3, delay: 0.7 },
  },
};
const tightZSmall: Variants = {
  normal: { opacity: 0, y: 0, scale: 0.7, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 0.9, 0.9, 0],
    y: [12, 4, -5, -10],
    scale: [0.5, 0.7, 0.7, 0.65],
    transition: { duration: 1.6, ease: "easeOut", times: [0, 0.25, 0.7, 1], repeat: Infinity, repeatDelay: 0.3, delay: 1.25 },
  },
};

const BedSleepTightIcon = forwardRef<IconHandle, IconProps>(
  function BedSleepTightIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={BED} variants={reduced ? undefined : tightFlop} style={FLOOR} />
          {!reduced && (
            <>
              <motion.g variants={tightZBig}>
                <path d={Z} transform="translate(66,22)" />
              </motion.g>
              <motion.g variants={tightZSmall}>
                <path d={Z} transform="translate(112,14)" />
              </motion.g>
            </>
          )}
        </Svg>
      </div>
    );
  },
);

/* ── 6. DEEP SLEEP (Breathe + Sleep tight) — v3 × v5 ─────────────────────────
   The v5 story with the v3 rhythm underneath: flop onto the bed, settle — and
   then, while the Zs rise in their loop, the bed itself keeps BREATHING the
   slow v3 swell, like the sleeper under the covers. Two nested groups on the
   frame because a one-shot and an endless loop can't share one keyframe set:
   the outer plays the flop once, the inner starts the infinite breathe after
   the settle. Both scaleY-only about the floor (the frame touches x=256), and
   the Zs are delayed to be born on the first exhale. */
const deepFlop: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.93, 1.03, 0.98, 1],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.25, 0.55, 0.8, 1] },
  },
};
const deepBreathe: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1.02, 1],
    transition: { duration: 2.4, ease: "easeInOut", times: [0, 0.5, 1], repeat: Infinity, delay: 0.8 },
  },
};
const deepZBig: Variants = {
  normal: { opacity: 0, y: 0, scale: 0.7, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [10, 2, -8, -14],
    scale: [0.7, 1, 1, 0.95],
    transition: { duration: 1.6, ease: "easeOut", times: [0, 0.25, 0.7, 1], repeat: Infinity, repeatDelay: 0.3, delay: 0.9 },
  },
};
const deepZSmall: Variants = {
  normal: { opacity: 0, y: 0, scale: 0.7, transition: { duration: 0.2 } },
  animate: {
    opacity: [0, 0.9, 0.9, 0],
    y: [12, 4, -5, -10],
    scale: [0.5, 0.7, 0.7, 0.65],
    transition: { duration: 1.6, ease: "easeOut", times: [0, 0.25, 0.7, 1], repeat: Infinity, repeatDelay: 0.3, delay: 1.45 },
  },
};

const BedDeepSleepIcon = forwardRef<IconHandle, IconProps>(
  function BedDeepSleepIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : deepFlop} style={FLOOR}>
            <motion.g variants={reduced ? undefined : deepBreathe} style={FLOOR}>
              <path d={BED} />
            </motion.g>
          </motion.g>
          {!reduced && (
            <>
              <motion.g variants={deepZBig}>
                <path d={Z} transform="translate(66,22)" />
              </motion.g>
              <motion.g variants={deepZSmall}>
                <path d={Z} transform="translate(112,14)" />
              </motion.g>
            </>
          )}
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BedFlopIcon }[] = [
  { name: "Flop", blurb: "A soft mattress squash and recover — someone just landed", Component: BedFlopIcon },
  { name: "Bounce", blurb: "Two hops with a floor squash — testing the springs", Component: BedBounceIcon },
  { name: "Breathe", blurb: "A slow vertical swell, twice — deep-sleep rhythm", Component: BedBreatheIcon },
  { name: "Zzz", blurb: "The reference video — Zs rise from the pillow, fade, loop", Component: BedZzzIcon },
  { name: "Sleep tight", blurb: "Flops, settles, then the zzz loop starts — falling asleep in order", Component: BedSleepTightIcon },
  { name: "Deep sleep", blurb: "v3 × v5 — flops, then breathes the slow swell while the Zs rise", Component: BedDeepSleepIcon },
];

export default function BedLabPage() {
  return <VariantGrid title="Bed" variants={VARIANTS} cycleMs={4000} playMs={2800} />;
}
