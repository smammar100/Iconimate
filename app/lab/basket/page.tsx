"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Basket icon (Phosphor "shopping-basket"), 5 animation candidates.
 *
 * Reference videos studied first:
 *   shopping-basket.mp4      — the top rim/handle rocks side to side and settles.
 *   shopping-basket (2).mp4  — items drop into the basket from above and sink in
 *                              while it gives a gentle rock.
 *
 * The glyph splits into its own untouched subpaths, so SHELL + GRIPS is
 * byte-identical to the original:
 *   SHELL — the basket body, the ^ carry handle, and the top rim (the outer
 *           shell, its inner rim outline, and the handle triangle).
 *   GRIPS — the three rounded content lines inside the basket.
 */
const SHELL =
  "M239.93,89.06,224.86,202.12A16.06,16.06,0,0,1,209,216H47a16.06,16.06,0,0,1-15.86-13.88L16.07,89.06A8,8,0,0,1,24,80H68.37L122,18.73a8,8,0,0,1,12,0L187.63,80H232a8,8,0,0,1,7.93,9.06ZM89.63,80h76.74L128,36.15ZM222.86,96H33.14L47,200H209Z";
const GRIPS =
  "M136,120v56a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm36.84-.8-5.6,56A8,8,0,0,0,174.4,184a7.32,7.32,0,0,0,.81,0,8,8,0,0,0,7.95-7.2l5.6-56a8,8,0,0,0-15.92-1.6Zm-89.68,0a8,8,0,0,0-15.92,1.6l5.6,56a8,8,0,0,0,8,7.2,7.32,7.32,0,0,0,.81,0,8,8,0,0,0,7.16-8.76Z";

const BASE = AT(128, 208); // basket floor — pivot for rocks & hops
const APEX = AT(128, 36); //  top of the carry handle — pivot for the carry swing
const GRIP_FOOT = AT(128, 176); // where the content lines sit — pivot for their settle

/* ── 1. ROCK (from shopping-basket.mp4) ──────────────────────────────────────
   The basket tips side to side on its base, so the rim and handle swing widest
   — a decaying seesaw that settles level. */
const rock: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -7, 6, -3.5, 1.5, 0],
    transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.22, 0.46, 0.68, 0.86, 1] },
  },
};

const BasketRockIcon = forwardRef<IconHandle, IconProps>(
  function BasketRockIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : rock} style={BASE}>
            <path d={SHELL} />
            <path d={GRIPS} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. FILL (from shopping-basket (2).mp4) ──────────────────────────────────
   Two items drop into the mouth from above and sink in; the basket gives a
   little squash as each one lands. */
const fillBasket: Variants = {
  normal: { scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1, 0.94, 1.02, 1, 0.95, 1.01, 1],
    scaleX: [1, 1, 1.04, 0.99, 1, 1.03, 0.99, 1],
    transition: { duration: 1.2, ease: "easeInOut", times: [0, 0.24, 0.34, 0.48, 0.6, 0.72, 0.84, 1] },
  },
};
// An item: waits, then falls from above into the mouth and fades as it sinks in.
const item = (delay: number): Variants => ({
  normal: { y: -52, opacity: 0, transition: { duration: 0.15 } },
  animate: {
    y: [-52, -52, 6, 12],
    opacity: [0, 1, 1, 0],
    transition: { duration: 0.9, ease: "easeIn", times: [0, 0.12, 0.8, 1], delay },
  },
});

const BasketFillIcon = forwardRef<IconHandle, IconProps>(
  function BasketFillIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* Items fall behind the shell, which is drawn on top. Hidden at rest. */}
          {!reduced && (
            <>
              <motion.circle cx={104} cy={104} r={13} variants={item(0)} />
              <motion.circle cx={150} cy={104} r={11} variants={item(0.38)} />
            </>
          )}
          <motion.g variants={reduced ? undefined : fillBasket} style={BASE}>
            <path d={SHELL} />
            <path d={GRIPS} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. SWING ────────────────────────────────────────────────────────────────
   Carried by the handle: the whole basket swings as a decaying pendulum about
   the top of the carry handle. */
const swing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -10, 7.5, -4, 2, 0],
    transition: { duration: 1.05, ease: "easeInOut", times: [0, 0.2, 0.45, 0.68, 0.86, 1] },
  },
};

const BasketSwingIcon = forwardRef<IconHandle, IconProps>(
  function BasketSwingIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : swing} style={APEX}>
            <path d={SHELL} />
            <path d={GRIPS} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 4. SETTLE ───────────────────────────────────────────────────────────────
   The contents settle: the three content lines drop and jiggle a touch, staged
   left-to-right, while the basket itself holds still. */
const settle = (delay: number): Variants => ({
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -4, 2, -1, 0],
    scaleY: [1, 0.9, 1.05, 0.98, 1],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.25, 0.5, 0.75, 1], delay },
  },
});

const BasketSettleIcon = forwardRef<IconHandle, IconProps>(
  function BasketSettleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={SHELL} />
          {/* The three content lines settle together, jostling about their feet. */}
          <motion.path d={GRIPS} variants={reduced ? undefined : settle(0)} style={GRIP_FOOT} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. HOP ──────────────────────────────────────────────────────────────────
   A happy little jump: stretch on the way up, squash on the landing, settle —
   pleased with what it's carrying.
   Bounds: glyph top ≈ y16.7; stretch about the base then lift must keep it ≥0
   or the wrapper's overflow:hidden clips the handle at the hop's peak.
   scaleY 1.02 about y208 puts the top at 12.9; −11 lift lands it at 1.9 — the
   extra unit absorbs the OVERSHOOT bezier's ~4% mid-segment overshoot. */
const hop: Variants = {
  normal: { y: 0, scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -11, 0, 0],
    scaleY: [1, 1.02, 0.9, 1],
    scaleX: [1, 0.98, 1.07, 1],
    transition: { duration: 0.62, ease: OVERSHOOT, times: [0, 0.35, 0.7, 1] },
  },
};

const BasketHopIcon = forwardRef<IconHandle, IconProps>(
  function BasketHopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : hop} style={BASE}>
            <path d={SHELL} />
            <path d={GRIPS} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 6. SWING + HOP ──────────────────────────────────────────────────────────
   The two gestures as one continuous move: the basket springs up with a
   stretch, swings like a pendulum while airborne, then lands with the squash
   and settles. Two nested groups so each motion keeps its own pivot — the hop
   about the base, the swing about the handle apex. */
const SH_DUR = 1.3;
const shHop: Variants = {
  normal: { y: 0, scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    // Up fast, hang airborne through the middle (while the swing plays), then
    // land with the squash and recover. Same bounds budget as HOP: stretch
    // about the base then lift must keep the glyph top (y16.7) ≥ 0, or the
    // wrapper's overflow:hidden clips the handle at the peak.
    y: [0, -12, -11, -11, 0, 0],
    scaleY: [1, 1.02, 1, 1, 0.9, 1],
    scaleX: [1, 0.98, 1, 1, 1.07, 1],
    transition: { duration: SH_DUR, ease: "easeInOut", times: [0, 0.16, 0.24, 0.6, 0.78, 1] },
  },
};
const shSwing: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // Swings only while airborne (the middle of the timeline), level by landing.
    rotate: [0, 0, -9, 7, -3.5, 0, 0],
    transition: { duration: SH_DUR, ease: "easeInOut", times: [0, 0.14, 0.3, 0.46, 0.6, 0.74, 1] },
  },
};

const BasketSwingHopIcon = forwardRef<IconHandle, IconProps>(
  function BasketSwingHopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : shHop} style={BASE}>
            <motion.g variants={reduced ? undefined : shSwing} style={APEX}>
              <path d={SHELL} />
              <path d={GRIPS} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 7. SWING + HOP + SETTLE ─────────────────────────────────────────────────
   v6 with consequences: the basket springs up, swings while airborne, lands —
   and the impact jostles the contents, which drop and jiggle to rest a beat
   after touchdown. The grips ride inside both gesture groups (so they travel
   with the basket) and play the settle about their own feet on landing.
   Landing is at SH_DUR × 0.78 ≈ 1.0s, so the settle delays until just then. */
const shsSettle: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -4, 2, -1, 0],
    scaleY: [1, 0.9, 1.05, 0.98, 1],
    transition: { duration: 0.55, ease: "easeOut", times: [0, 0.25, 0.5, 0.75, 1], delay: SH_DUR * 0.74 },
  },
};

const BasketSwingHopSettleIcon = forwardRef<IconHandle, IconProps>(
  function BasketSwingHopSettleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : shHop} style={BASE}>
            <motion.g variants={reduced ? undefined : shSwing} style={APEX}>
              <path d={SHELL} />
              <motion.path d={GRIPS} variants={reduced ? undefined : shsSettle} style={GRIP_FOOT} />
            </motion.g>
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BasketRockIcon }[] = [
  { name: "Rock", blurb: "Tips side to side, rim swings widest (shopping-basket.mp4)", Component: BasketRockIcon },
  { name: "Fill", blurb: "Items drop into the mouth, basket squashes (shopping-basket (2).mp4)", Component: BasketFillIcon },
  { name: "Swing", blurb: "Carried by the handle — decaying pendulum", Component: BasketSwingIcon },
  { name: "Settle", blurb: "The contents drop and jiggle, basket holds still", Component: BasketSettleIcon },
  { name: "Hop", blurb: "Happy jump — stretch up, squash on landing", Component: BasketHopIcon },
  { name: "Swing + Hop", blurb: "Springs up, swings while airborne, lands & settles", Component: BasketSwingHopIcon },
  { name: "Swing + Hop + Settle", blurb: "The full trip — and the landing jostles the contents", Component: BasketSwingHopSettleIcon },
];

export default function BasketLabPage() {
  return <VariantGrid title="Basket" variants={VARIANTS} cycleMs={2800} playMs={1600} />;
}
