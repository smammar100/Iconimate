"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Arrows Down-Up (sort / swap / transfer), 5 animation candidates.
 *
 * Two independent arrows: the LEFT points down, the RIGHT points up. Splitting the
 * Phosphor glyph into two sub-paths lets each move on its own. Every candidate plays
 * on the down/up pairing; one is the requested counter-travel (left top→bottom, right
 * bottom→top). Each is grounded in a Disney principle.
 */
const LEFT =
  "M117.66,170.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L72,188.69V48a8,8,0,0,1,16,0V188.69l18.34-18.35A8,8,0,0,1,117.66,170.34Z";
const RIGHT =
  "M213.66,74.34l-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L168,67.31V208a8,8,0,0,0,16,0V67.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z";

function makeIcon(leftV: Variants, rightV: Variants) {
  return forwardRef<IconHandle, IconProps>(function ArrowsDownUpIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 256 256"
          fill="currentColor"
          initial="normal"
          animate={controls}
          style={{ overflow: "visible" }}
        >
          <motion.path d={LEFT} variants={reduced ? undefined : leftV} />
          <motion.path d={RIGHT} variants={reduced ? undefined : rightV} />
        </motion.svg>
      </div>
    );
  });
}

// Each arrow travels this far (view-box units) — enough to fully clear the bounding
// box, so it's clipped away (disappears) before re-entering.
const H = 240;

/* ── 1. SWAP  (requested) — the left arrow flies up out of frame and re-enters from the
   top (top→bottom); the right flies down out of frame and re-enters from the bottom
   (bottom→top). They disappear, hold off-frame a beat, then glide home. Follow-through. */
const leftSwap: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, -H, -H, 0], transition: { duration: 1.0, times: [0, 0.35, 0.5, 1], ease: ["easeIn", "linear", ARRIVE] } },
};
const rightSwap: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, H, H, 0], transition: { duration: 1.0, times: [0, 0.35, 0.5, 1], ease: ["easeIn", "linear", ARRIVE] } },
};
const SwapIcon = makeIcon(leftSwap, rightSwap);

/* ── 2. STAGGER — same exit-and-return, but the right arrow leaves a beat after the
   left. Staging / Overlapping action. ────────────────────────────────────────────── */
const rightStagger: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, H, H, 0],
    transition: { duration: 1.0, times: [0, 0.35, 0.5, 1], ease: ["easeIn", "linear", ARRIVE], delay: 0.16 },
  },
};
const StaggerIcon = makeIcon(leftSwap, rightStagger);

/* ── 3. RECOIL — a small anticipation dip against the exit, then each arrow shoots out
   of frame and returns. Anticipation + Follow-through. ───────────────────────────── */
const leftRecoil: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 14, -H, -H, 0],
    transition: { duration: 1.05, times: [0, 0.14, 0.4, 0.52, 1], ease: ["easeOut", "easeIn", "linear", ARRIVE] },
  },
};
const rightRecoil: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -14, H, H, 0],
    transition: { duration: 1.05, times: [0, 0.14, 0.4, 0.52, 1], ease: ["easeOut", "easeIn", "linear", ARRIVE] },
  },
};
const RecoilIcon = makeIcon(leftRecoil, rightRecoil);

/* ── 4. BOUNCE — exits, then re-enters past rest and settles with an overshoot.
   Follow-through / Exaggeration. ─────────────────────────────────────────────────── */
const leftBounce: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -H, -H, 16, 0],
    transition: { duration: 1.0, times: [0, 0.32, 0.46, 0.8, 1], ease: ["easeIn", "linear", "easeOut", "easeInOut"] },
  },
};
const rightBounce: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, H, H, -16, 0],
    transition: { duration: 1.0, times: [0, 0.32, 0.46, 0.8, 1], ease: ["easeIn", "linear", "easeOut", "easeInOut"] },
  },
};
const BounceIcon = makeIcon(leftBounce, rightBounce);

/* ── 5. WHOOSH — a quick snap out of frame and straight back, no hold. Timing. ─────── */
const leftWhoosh: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, -H, 0], transition: { duration: 0.6, times: [0, 0.42, 1], ease: ["easeIn", "easeOut"] } },
};
const rightWhoosh: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, H, 0], transition: { duration: 0.6, times: [0, 0.42, 1], ease: ["easeIn", "easeOut"] } },
};
const WhooshIcon = makeIcon(leftWhoosh, rightWhoosh);

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; principle: string; blurb: string; Component: typeof SwapIcon }[] = [
  {
    name: "Swap",
    principle: "Follow-through",
    blurb: "Requested — both fly out of frame; left re-enters from the top, right from the bottom",
    Component: SwapIcon,
  },
  {
    name: "Stagger",
    principle: "Staging",
    blurb: "Same exit-and-return, but the right arrow leaves a beat later",
    Component: StaggerIcon,
  },
  {
    name: "Recoil",
    principle: "Anticipation",
    blurb: "A small wind-back, then each shoots out of frame and returns",
    Component: RecoilIcon,
  },
  {
    name: "Bounce",
    principle: "Follow-through",
    blurb: "Flies out, then re-enters past rest and settles with an overshoot",
    Component: BounceIcon,
  },
  { name: "Whoosh", principle: "Timing", blurb: "A quick snap out of frame and straight back", Component: WhooshIcon },
];

export default function ArrowsDownUpLabPage() {
  return <VariantGrid title="Arrows Down-Up" variants={VARIANTS} cycleMs={2900} playMs={1700} />;
}
