"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/** Back-out overshoot — gives spring-like snap on multi-keyframe tweens. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/**
 * LAB — Angle icon, 5 animation candidates.
 *
 * The Phosphor "Angle" glyph is one path with two subpaths: the swept ARC near
 * the top, and the L-shaped AXES (the two rays). We split them so motion can
 * treat the measured angle and its rays independently. The natural pivot for an
 * "opening angle" is the inner corner of the L — the vertex.
 */
const ARC =
  "M96,72a8,8,0,0,1,8-8A104.11,104.11,0,0,1,208,168a8,8,0,0,1-16,0,88.1,88.1,0,0,0-88-88A8,8,0,0,1,96,72Z";
// The two long rays (the L), with the upper-left tick stub removed so it can move on its own.
const RAYS =
  "M240,192H80V32a8,8,0,0,0-16,0V200a8,8,0,0,0,8,8H240a8,8,0,0,0,0-16Z";
// The little upper-left tick stub — reads as part of the angle's measurement, so it
// animates with the ARC rather than sitting static on the rays.
const TICK = "M64,64H32a8,8,0,0,0,0,16H64Z";

// Centerline of the L for the "Draw" variant — traced as a stroke so the rays can be
// drawn directionally: from the far end of the x-axis, into the vertex, up the y-axis.
// Width 16 + round caps reproduce the filled-bar silhouette.
const RAYS_STROKE = "M232,200H72V40";

/** Inner corner of the L (where the two rays meet), as a view-box fraction. */
const VERTEX = { x: 0.281, y: 0.781 };

const ORIGIN = { transformBox: "view-box" as const, originX: VERTEX.x, originY: VERTEX.y };

function Svg({
  size,
  controls,
  children,
}: {
  size: number;
  controls: ReturnType<typeof useHover>["controls"];
  children: React.ReactNode;
}) {
  return (
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
      {children}
    </motion.svg>
  );
}

/* ── 1. MEASURE ──────────────────────────────────────────────────────────────
   The rays hold still while the arc grows out of the vertex — the angle being
   measured / filled in. */
const measureArc: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.slow, ease: ARRIVE },
  },
};

export const AngleMeasureIcon = forwardRef<IconHandle, IconProps>(
  function AngleMeasureIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={RAYS} />
          <motion.path d={ARC} variants={reduced ? undefined : measureArc} style={ORIGIN} />
          <motion.path d={TICK} variants={reduced ? undefined : measureArc} style={ORIGIN} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. HINGE ────────────────────────────────────────────────────────────────
   The whole glyph swings open a few degrees about the vertex and springs back —
   like opening an angle on a carpenter's bevel. */
const hinge: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, -9, 0], transition: { duration: 0.7, ease: OVERSHOOT } },
};

export const AngleHingeIcon = forwardRef<IconHandle, IconProps>(
  function AngleHingeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : hinge} style={ORIGIN}>
            <path d={RAYS} />
            <path d={ARC} />
            <path d={TICK} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. SWEEP ────────────────────────────────────────────────────────────────
   The arc rotates about the vertex, sweeping in toward its resting angle and
   back out — a protractor reading taken over and over. */
const sweep: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [-22, 0],
    transition: { duration: 0.9, ease: SWEEP, repeat: Infinity, repeatType: "reverse" },
  },
};

export const AngleSweepIcon = forwardRef<IconHandle, IconProps>(
  function AngleSweepIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={RAYS} />
          <motion.path d={ARC} variants={reduced ? undefined : sweep} style={ORIGIN} />
          <motion.path d={TICK} variants={reduced ? undefined : sweep} style={ORIGIN} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. POP ──────────────────────────────────────────────────────────────────
   A tactile squash-and-pop of the whole icon about the vertex — a confident
   tap response. */
const pop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.9, 1.06, 1],
    transition: { duration: 0.46, ease: "easeOut", times: [0, 0.3, 0.65, 1] },
  },
};

export const AnglePopIcon = forwardRef<IconHandle, IconProps>(
  function AnglePopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : pop} style={ORIGIN}>
            <path d={RAYS} />
            <path d={ARC} />
            <path d={TICK} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. DRAW ─────────────────────────────────────────────────────────────────
   The two rays extend out of the vertex first, then the arc pops in to close
   the measurement — the icon constructing itself. */
const DRAW_DUR = 0.55;
const drawStroke: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: 1,
    transition: { duration: DRAW_DUR, ease: SWEEP },
  },
};
const drawArc: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0, 1],
    opacity: [0, 1],
    transition: { duration: DUR.base, ease: ARRIVE, delay: DRAW_DUR - 0.05 },
  },
};

export const AngleDrawIcon = forwardRef<IconHandle, IconProps>(
  function AngleDrawIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path
            d={RAYS_STROKE}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={reduced ? undefined : drawStroke}
          />
          <motion.path d={ARC} variants={reduced ? undefined : drawArc} style={ORIGIN} />
          <motion.path d={TICK} variants={reduced ? undefined : drawArc} style={ORIGIN} />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof AngleMeasureIcon }[] = [
  { name: "Measure", blurb: "Arc grows from the vertex", Component: AngleMeasureIcon },
  { name: "Hinge", blurb: "Whole angle swings open & springs back", Component: AngleHingeIcon },
  { name: "Sweep", blurb: "Arc sweeps in like a protractor read (loops)", Component: AngleSweepIcon },
  { name: "Pop", blurb: "Squash-and-pop tap response", Component: AnglePopIcon },
  { name: "Draw", blurb: "Rays extend, then the arc pops in", Component: AngleDrawIcon },
];

export default function AngleLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  // Each remains fully hover/focus-interactive too.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1400);
    };
    cycle();
    const id = window.setInterval(cycle, 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0c",
        color: "#ededed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Angle — animation candidates</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40 }}>
        Hover or focus any tile. They also auto-cycle. Pick one to promote into the registry.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 900,
        }}
      >
        {VARIANTS.map(({ name, blurb, Component }, i) => (
          <div
            key={name}
            tabIndex={0}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              padding: "32px 16px 22px",
              borderRadius: 16,
              background: "#161618",
              border: "1px solid #232326",
              outline: "none",
            }}
          >
            <Component
              ref={(el) => {
                refs.current[i] = el;
              }}
              size={56}
              style={{ color: "#fafafa" }}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{blurb}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
