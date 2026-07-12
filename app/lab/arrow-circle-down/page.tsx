"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Arrow Circle Down, 6 animation candidates.
 *
 * Two filled subpaths: the ring (a donut) and the down ARROW. Most variants move
 * the arrow while the ring holds; a couple animate the ring itself.
 */
const RING =
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z";
const ARROW =
  "M165.66,130.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,148.69V88a8,8,0,0,1,16,0v60.69l18.34-18.35A8,8,0,0,1,165.66,130.34Z";
// Centerline circle (between the donut's inner r88 and outer r104) for the ring trace.
const RING_STROKE = "M128,32A96,96,0,1,1,127.9,32Z";
// Vertical spine through the arrow, for the draw variant (clipped to ARROW).
const ARROW_SPINE = "M128,78L128,176";

// Arrow bbox center, as a view-box fraction — the scale/rotate pivot.
const ARROW_ORIGIN = { x: 0.5, y: 0.51 };
const CENTER = { x: 0.5, y: 0.5 };

/* ── 1. SCROLL  (from the video) ───────────────────────────────────────────────
   The arrow rides a vertical wheel through the static ring: it fades in small at
   the top, grows to full at the center, then shrinks and fades out at the bottom
   — and the next one is already entering from the top. A continuous "comes, then
   disappears" loop. (Down icon → travels down; the source clip's up-caret rose.) */
const scroll: Variants = {
  normal: { y: 0, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-46, 0, 46],
    scale: [0.4, 1, 0.4],
    opacity: [0, 1, 0],
    transition: {
      duration: 1.15,
      ease: "easeInOut",
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatDelay: 0.05,
    },
  },
};
const ScrollIcon = forwardRef<IconHandle, IconProps>(function ScrollIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <path d={RING} />
        <motion.path
          d={ARROW}
          variants={reduced ? undefined : scroll}
          style={{ transformBox: "view-box", originX: ARROW_ORIGIN.x, originY: ARROW_ORIGIN.y }}
        />
      </Svg>
    </div>
  );
});

/* ── 2. DROP ──────────────────────────────────────────────────────────────────
   The arrow falls in from the top and settles with a spring — leans into the
   "down" meaning. */
const drop: Variants = {
  normal: { y: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-34, 0],
    opacity: [0, 1],
    transition: { type: "spring", stiffness: 320, damping: 14, mass: 1 },
  },
};
const DropIcon = forwardRef<IconHandle, IconProps>(function DropIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = `acd-drop-${useId()}`;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <circle cx={128} cy={128} r={88} />
          </clipPath>
        </defs>
        <path d={RING} />
        <g clipPath={`url(#${clipId})`}>
          <motion.path d={ARROW} variants={reduced ? undefined : drop} />
        </g>
      </Svg>
    </div>
  );
});

/* ── 3. DRAW ──────────────────────────────────────────────────────────────────
   The arrow pens itself in top-to-tip; a fat spine clipped to the glyph reveals
   the exact filled arrow via pathLength. */
const draw: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: [0, 1], opacity: 1, transition: { duration: 0.6, ease: "easeInOut" } },
};
const DrawIcon = forwardRef<IconHandle, IconProps>(function DrawIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = `acd-draw-${useId()}`;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <path d={ARROW} />
          </clipPath>
        </defs>
        <path d={RING} />
        <motion.path
          d={ARROW_SPINE}
          fill="none"
          stroke="currentColor"
          strokeWidth={96}
          strokeLinecap="round"
          clipPath={`url(#${clipId})`}
          variants={reduced ? undefined : draw}
        />
      </Svg>
    </div>
  );
});

/* ── 4. TRACE ─────────────────────────────────────────────────────────────────
   The ring draws itself around the arrow like a progress sweep; the arrow holds. */
const trace: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: [0, 1], opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } },
};
const TraceIcon = forwardRef<IconHandle, IconProps>(function TraceIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={RING_STROKE}
          fill="none"
          stroke="currentColor"
          strokeWidth={16}
          strokeLinecap="round"
          variants={reduced ? undefined : trace}
        />
        <path d={ARROW} />
      </Svg>
    </div>
  );
});

/* ── 5. SPIN ──────────────────────────────────────────────────────────────────
   The whole mark does a single confident 360° about its center. */
const spin: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, 360], transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } },
};
const SpinIcon = forwardRef<IconHandle, IconProps>(function SpinIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g
          variants={reduced ? undefined : spin}
          style={{ transformBox: "view-box", originX: CENTER.x, originY: CENTER.y }}
        >
          <path d={RING} />
          <path d={ARROW} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 6. BOB ───────────────────────────────────────────────────────────────────
   The arrow bobs gently down and back — a calm, looping "scroll down" idle. */
const bob: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 7, 0],
    transition: { duration: 1, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.15 },
  },
};
const BobIcon = forwardRef<IconHandle, IconProps>(function BobIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <path d={RING} />
        <motion.path d={ARROW} variants={reduced ? undefined : bob} />
      </Svg>
    </div>
  );
});

/* ── Preview grid ──────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; blurb: string; Component: typeof ScrollIcon }[] = [
  { name: "Scroll", blurb: "From the video — arrow rides a wheel: fades in at top, full at center, fades out at bottom (loops)", Component: ScrollIcon },
  { name: "Drop", blurb: "Arrow falls in from the top and settles", Component: DropIcon },
  { name: "Draw", blurb: "Arrow pens itself in, top to tip", Component: DrawIcon },
  { name: "Trace", blurb: "Ring sweeps around the held arrow", Component: TraceIcon },
  { name: "Spin", blurb: "Whole mark turns a single 360°", Component: SpinIcon },
  { name: "Bob", blurb: "Arrow bobs down & back — looping idle", Component: BobIcon },
];

export default function ArrowCircleDownLabPage() {
  return <VariantGrid title="Arrow Circle Down" variants={VARIANTS} cycleMs={2800} playMs={1600} />;
}
