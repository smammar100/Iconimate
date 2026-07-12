"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — App Window icon, 5 animation candidates.
 *
 * The Phosphor "app-window" glyph = a FRAME (rounded-rect border) plus two title-bar
 * DOTS. Splitting them lets the dots blink / load independently of the frame.
 */
const FRAME =
  "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z";
const DOT1 = "M80,84A12,12,0,1,1,68,72,12,12,0,0,1,80,84Z";
const DOT2 = "M120,84a12,12,0,1,1-12-12A12,12,0,0,1,120,84Z";
const DOTS = [DOT1, DOT2];

const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const CENTER_3D = { ...CENTER, transformPerspective: 620 };
/** Pivot on the dots' own line (y≈84) so they blink in place. */
const DOTS_ORIGIN = { transformBox: "view-box" as const, originX: 0.5, originY: 0.328 };

/* ── 1. BLINK — the two dots blink shut and open, like a pair of eyes. ──────── */
const blink: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.12, 1, 0.12, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.12, 0.3, 0.42, 0.6] },
  },
};

const AppWindowBlinkIcon = forwardRef<IconHandle, IconProps>(
  function AppWindowBlinkIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={FRAME} />
          <motion.g variants={reduced ? undefined : blink} style={DOTS_ORIGIN}>
            {DOTS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. OPEN — the window scales up out of the centre, an app launching. ────── */
const open: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0.3, 1],
    opacity: [0, 1],
    transition: { duration: DUR.slow, ease: ARRIVE },
  },
};

const AppWindowOpenIcon = forwardRef<IconHandle, IconProps>(
  function AppWindowOpenIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : open} style={CENTER}>
            <path d={FRAME} />
            {DOTS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. LOAD — the dots pulse one after another, a loading indicator (loops). ─ */
const loadDot: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: (i: number) => ({
    opacity: [1, 0.2, 1],
    transition: { duration: 0.9, ease: "easeInOut", repeat: Infinity, delay: i * 0.2 },
  }),
};

const AppWindowLoadIcon = forwardRef<IconHandle, IconProps>(
  function AppWindowLoadIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={FRAME} />
          {DOTS.map((d, i) => (
            <motion.path key={i} d={d} custom={i} variants={reduced ? undefined : loadDot} />
          ))}
        </Svg>
      </div>
    );
  },
);

/* ── 4. POP — a tactile squash-and-pop tap of the whole window. ────────────── */
const pop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.92, 1.05, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT, times: [0, 0.3, 0.65, 1] },
  },
};

const AppWindowPopIcon = forwardRef<IconHandle, IconProps>(
  function AppWindowPopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : pop} style={CENTER}>
            <path d={FRAME} />
            {DOTS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. TILT — a playful 3-D parallax tilt that wheels around and settles. ──── */
const tilt: Variants = {
  normal: { rotateX: 0, rotateY: 0, transition: RETURN_TRANSITION },
  animate: {
    rotateX: [0, -16, 10, 0],
    rotateY: [0, 18, -12, 0],
    transition: { duration: 1.1, ease: "easeInOut" },
  },
};

const AppWindowTiltIcon = forwardRef<IconHandle, IconProps>(
  function AppWindowTiltIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : tilt} style={CENTER_3D}>
            <path d={FRAME} />
            {DOTS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof AppWindowBlinkIcon }[] = [
  { name: "Blink", blurb: "The dots blink like eyes", Component: AppWindowBlinkIcon },
  { name: "Open", blurb: "Window scales up, app launching", Component: AppWindowOpenIcon },
  { name: "Load", blurb: "Dots pulse in sequence (loops)", Component: AppWindowLoadIcon },
  { name: "Pop", blurb: "Squash-and-pop tap", Component: AppWindowPopIcon },
  { name: "Tilt", blurb: "3-D parallax tilt & settle", Component: AppWindowTiltIcon },
];

export default function AppWindowLabPage() {
  return <VariantGrid title="App Window" variants={VARIANTS} cycleMs={2800} playMs={1600} />;
}
