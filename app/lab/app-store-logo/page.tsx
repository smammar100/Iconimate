"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — App Store logo (the stylised "A"), 5 animation candidates.
 *
 * The Phosphor "app-store-logo" glyph is one path of stroke-like capsules. We keep
 * it whole and animate transforms; v1 also traces its outline to "draw" it on.
 */
const LOGO =
  "M64.34,196.07l-9.45,16a8,8,0,1,1-13.78-8.14l9.46-16a8,8,0,1,1,13.77,8.14ZM232,152H184.2l-30.73-52a8,8,0,1,0-13.77,8.14l61.41,103.93a8,8,0,0,0,13.78-8.14L193.66,168H232a8,8,0,0,0,0-16Zm-89.53,0H90.38L158.89,36.07a8,8,0,0,0-13.78-8.14L128,56.89l-17.11-29a8,8,0,1,0-13.78,8.14l21.6,36.55L71.8,152H24a8,8,0,0,0,0,16H142.47a8,8,0,1,0,0-16Z";

const ORIGIN_CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
/** Pivot at the feet so squashes land on the "ground". */
const ORIGIN_BOTTOM = { transformBox: "view-box" as const, originX: 0.5, originY: 0.86 };

/* ── 1. DRAW + STOMP ─────────────────────────────────────────────────────────
   The outline traces itself on while the fill rises in behind it; once drawn, the
   whole logo stomps — a squash-and-recover impact anchored at the feet. */
const DRAW_DUR = 0.875;

const trace: Variants = {
  // Hidden at rest (the fill carries the look); only visible while drawing.
  normal: { pathLength: 1, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [1, 1, 0],
    transition: { duration: DRAW_DUR, ease: SWEEP, times: [0, 0.85, 1] },
  },
};

const fillReveal: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1],
    transition: { duration: DRAW_DUR, ease: "easeIn", times: [0, 0.5, 1] },
  },
};

const drawStomp: Variants = {
  normal: { scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 1.16, 0.98, 1],
    scaleY: [1, 0.8, 1.04, 1],
    transition: { delay: DRAW_DUR, duration: 0.42, ease: OVERSHOOT, times: [0, 0.45, 0.75, 1] },
  },
};

const AppStoreDrawStompIcon = forwardRef<IconHandle, IconProps>(
  function AppStoreDrawStompIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : drawStomp} style={ORIGIN_BOTTOM}>
            <motion.path d={LOGO} variants={reduced ? undefined : fillReveal} />
            <motion.path
              d={LOGO}
              fill="none"
              stroke="currentColor"
              strokeWidth={6}
              strokeLinejoin="round"
              strokeLinecap="round"
              variants={reduced ? undefined : trace}
            />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. STOMP — drops in from above and squashes on impact. ────────────────── */
const stomp: Variants = {
  normal: { y: 0, scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-52, 0, 0, 0],
    scaleX: [0.9, 0.9, 1.18, 1],
    scaleY: [1.1, 1.1, 0.8, 1],
    transition: { duration: 0.62, ease: "easeInOut", times: [0, 0.42, 0.56, 1] },
  },
};

const AppStoreStompIcon = forwardRef<IconHandle, IconProps>(
  function AppStoreStompIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LOGO} variants={reduced ? undefined : stomp} style={ORIGIN_BOTTOM} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. BOUNCE — a light, even vertical bounce (loops). ────────────────────── */
const bounce: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -16, 0],
    transition: { duration: 0.85, ease: "easeInOut", repeat: Infinity },
  },
};

const AppStoreBounceIcon = forwardRef<IconHandle, IconProps>(
  function AppStoreBounceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LOGO} variants={reduced ? undefined : bounce} style={ORIGIN_BOTTOM} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. POP — a tactile squash-and-pop tap. ────────────────────────────────── */
const pop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.9, 1.06, 1],
    transition: { duration: DUR.base, ease: "easeOut", times: [0, 0.3, 0.65, 1] },
  },
};

const AppStorePopIcon = forwardRef<IconHandle, IconProps>(
  function AppStorePopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LOGO} variants={reduced ? undefined : pop} style={ORIGIN_CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. WOBBLE — a quick rotational shake that settles. ────────────────────── */
const wobble: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -8, 6, -4, 0],
    transition: { duration: 0.7, ease: "easeInOut" },
  },
};

const AppStoreWobbleIcon = forwardRef<IconHandle, IconProps>(
  function AppStoreWobbleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LOGO} variants={reduced ? undefined : wobble} style={ORIGIN_CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 6. DRAW — the outline traces itself on and fills, no stomp. ───────────── */
const AppStoreDrawIcon = forwardRef<IconHandle, IconProps>(
  function AppStoreDrawIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LOGO} variants={reduced ? undefined : fillReveal} />
          <motion.path
            d={LOGO}
            fill="none"
            stroke="currentColor"
            strokeWidth={6}
            strokeLinejoin="round"
            strokeLinecap="round"
            variants={reduced ? undefined : trace}
          />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof AppStoreStompIcon }[] = [
  { name: "Draw + Stomp", blurb: "Traces itself on, then stomps", Component: AppStoreDrawStompIcon },
  { name: "Stomp", blurb: "Drops in & squashes on impact", Component: AppStoreStompIcon },
  { name: "Bounce", blurb: "Light vertical bounce (loops)", Component: AppStoreBounceIcon },
  { name: "Pop", blurb: "Squash-and-pop tap", Component: AppStorePopIcon },
  { name: "Wobble", blurb: "Quick rotational shake", Component: AppStoreWobbleIcon },
  { name: "Draw", blurb: "Traces itself on, no stomp", Component: AppStoreDrawIcon },
];

export default function AppStoreLabPage() {
  return <VariantGrid title="App Store" variants={VARIANTS} cycleMs={2800} playMs={1600} />;
}
