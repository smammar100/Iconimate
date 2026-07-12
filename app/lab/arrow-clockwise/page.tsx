"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Arrow Clockwise, 5 animation candidates.
 *
 * One filled glyph (an open ring + arrowhead at the top-right). Everything turns
 * about the ring's center (128,128). "Spin" reproduces the video's continuous
 * clockwise loading-spinner.
 */
const GLYPH =
  "M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z";
// Centerline ring (between the glyph's r80 and r96) for the draw variant.
const RING_SPINE = "M128,40A88,88,0,1,1,127.9,40Z";
const CENTER = { x: 0.5, y: 0.5 };

/* ── 1. SPIN  (from the video) ─────────────────────────────────────────────────
   Continuous clockwise rotation — a loading / busy spinner that never rests. */
const spin: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: 360, transition: { duration: 1.1, ease: "linear", repeat: Infinity } },
};
const SpinIcon = forwardRef<IconHandle, IconProps>(function SpinIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={GLYPH}
          variants={reduced ? undefined : spin}
          style={{ transformBox: "view-box", originX: CENTER.x, originY: CENTER.y }}
        />
      </Svg>
    </div>
  );
});

/* ── 2. REFRESH ───────────────────────────────────────────────────────────────
   A single brisk 360° clockwise turn and stop — the classic "tap to refresh". */
const refresh: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, 360], transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] } },
};
const RefreshIcon = forwardRef<IconHandle, IconProps>(function RefreshIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={GLYPH}
          variants={reduced ? undefined : refresh}
          style={{ transformBox: "view-box", originX: CENTER.x, originY: CENTER.y }}
        />
      </Svg>
    </div>
  );
});

/* ── 3. WIND ──────────────────────────────────────────────────────────────────
   Winds back a few degrees, then whips a full turn clockwise and settles. */
const wind: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -28, 360],
    transition: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1], times: [0, 0.22, 1] },
  },
};
const WindIcon = forwardRef<IconHandle, IconProps>(function WindIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={GLYPH}
          variants={reduced ? undefined : wind}
          style={{ transformBox: "view-box", originX: CENTER.x, originY: CENTER.y }}
        />
      </Svg>
    </div>
  );
});

/* ── 4. DRAW ──────────────────────────────────────────────────────────────────
   The ring pens itself around clockwise; a fat spine clipped to the glyph reveals
   the exact filled arrow, arrowhead last. */
const draw: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: [0, 1], opacity: 1, transition: { duration: 0.9, ease: "easeInOut" } },
};
const DrawIcon = forwardRef<IconHandle, IconProps>(function DrawIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = `clw-draw-${useId()}`;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <path d={GLYPH} />
          </clipPath>
        </defs>
        <motion.path
          d={RING_SPINE}
          fill="none"
          stroke="currentColor"
          strokeWidth={48}
          strokeLinecap="round"
          clipPath={`url(#${clipId})`}
          variants={reduced ? undefined : draw}
        />
      </Svg>
    </div>
  );
});

/* ── 5. PULSE ─────────────────────────────────────────────────────────────────
   A tactile squash-and-pop about the center — a tap acknowledgement. */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.85, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
};
const PulseIcon = forwardRef<IconHandle, IconProps>(function PulseIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={GLYPH}
          variants={reduced ? undefined : pulse}
          style={{ transformBox: "view-box", originX: CENTER.x, originY: CENTER.y }}
        />
      </Svg>
    </div>
  );
});

/* ── Preview grid ──────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; blurb: string; Component: typeof SpinIcon }[] = [
  { name: "Spin", blurb: "From the video — continuous clockwise loading spin (loops)", Component: SpinIcon },
  { name: "Refresh", blurb: "A single brisk 360° turn — tap to refresh", Component: RefreshIcon },
  { name: "Wind", blurb: "Winds back, then whips a full turn and settles", Component: WindIcon },
  { name: "Draw", blurb: "The ring pens itself around, arrowhead last", Component: DrawIcon },
  { name: "Pulse", blurb: "Squash-and-pop tap response", Component: PulseIcon },
];

export default function ArrowClockwiseLabPage() {
  return <VariantGrid title="Arrow Clockwise" variants={VARIANTS} cycleMs={3000} playMs={1700} />;
}
