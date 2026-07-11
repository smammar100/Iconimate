"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/** Back-out overshoot — spring-like snap on multi-keyframe tweens. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/**
 * LAB — Baseball icon, 5 animation candidates (escalating).
 *
 * The Phosphor "baseball" glyph — ball, seams, and stitches — moves as one
 * rigid body, so every variant uses the original path verbatim. The seams
 * have 180° rotational symmetry, so half-turn spins land exactly on the
 * resting glyph.
 */
const BALL =
  "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM72.09,195.91c.82-1,1.64-1.93,2.42-2.91A8,8,0,1,0,62,183l-1.34,1.62a87.82,87.82,0,0,1,0-113.24L62,73A8,8,0,1,0,74.51,63c-.78-1-1.6-2-2.42-2.91a87.84,87.84,0,0,1,111.82,0c-.82,1-1.64,1.92-2.42,2.91A8,8,0,1,0,194,73l1.34-1.62a87.82,87.82,0,0,1,0,113.24L194,183a8,8,0,1,0-12.48,10c.78,1,1.6,1.95,2.42,2.91a87.84,87.84,0,0,1-111.82,0Zm23.8-50.59a104.5,104.5,0,0,1-4.48,17.35,8,8,0,0,1-15.09-5.34,87.1,87.1,0,0,0,3.79-14.65,8,8,0,1,1,15.78,2.64Zm0-34.64a8,8,0,0,1-6.57,9.21A8.52,8.52,0,0,1,88,120a8,8,0,0,1-7.88-6.68,87.1,87.1,0,0,0-3.79-14.65,8,8,0,0,1,15.09-5.34A104.5,104.5,0,0,1,95.89,110.68Zm78.91,56.86a8,8,0,0,1-10.21-4.87,104.5,104.5,0,0,1-4.48-17.35,8,8,0,1,1,15.78-2.64,87.1,87.1,0,0,0,3.79,14.65A8,8,0,0,1,174.8,167.54Zm-14.69-56.86a104.5,104.5,0,0,1,4.48-17.35,8,8,0,0,1,15.09,5.34,87.1,87.1,0,0,0-3.79,14.65A8,8,0,0,1,168,120a8.52,8.52,0,0,1-1.33-.11A8,8,0,0,1,160.11,110.68Z";

const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const FLOOR = { transformBox: "view-box" as const, originX: 0.5, originY: 232 / 256 };

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

function Ball({ variants, origin = CENTER }: { variants?: Variants; origin?: typeof CENTER }) {
  return <motion.path d={BALL} variants={variants} style={origin} />;
}

/* ── 1. SPIN ─────────────────────────────────────────────────────────────────
   A clean half-turn: the seams sweep around and land exactly back on
   themselves with a satisfying decelerating snap. */
const spin: Variants = {
  normal: { rotate: 0, transition: { duration: 0 } },
  animate: {
    rotate: [0, 180],
    transition: { duration: 0.6, ease: OVERSHOOT },
  },
};

const BaseballSpinIcon = forwardRef<IconHandle, IconProps>(
  function BaseballSpinIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Ball variants={reduced ? undefined : spin} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. KNUCKLEBALL ──────────────────────────────────────────────────────────
   The no-spin pitch: the ball floats with an erratic, fluttering wobble —
   tiny rotations and drifts that never commit to a direction. */
const knuckle: Variants = {
  normal: { rotate: 0, x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -7, 5, -9, 4, -2, 0],
    x: [0, 2, -3, 1.5, -2, 1, 0],
    y: [0, -3, 1.5, -4, 2, -1, 0],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.16, 0.33, 0.52, 0.7, 0.86, 1] },
  },
};

const BaseballKnuckleIcon = forwardRef<IconHandle, IconProps>(
  function BaseballKnuckleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Ball variants={reduced ? undefined : knuckle} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. CURVEBALL ────────────────────────────────────────────────────────────
   Breaking pitch: the ball spins through a half-turn while swinging out
   sideways and diving — the late break — then glides back to the pocket. */
const curve: Variants = {
  normal: { rotate: 0, x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 90, 180],
    x: [0, -10, 0],
    y: [0, -4, 8, 0],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.5, 1] },
  },
};

const BaseballCurveIcon = forwardRef<IconHandle, IconProps>(
  function BaseballCurveIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Ball variants={reduced ? undefined : curve} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. HOME RUN ─────────────────────────────────────────────────────────────
   Crack of the bat: a squashing anticipation at contact, the ball rockets up
   spinning, hangs at the top of its arc, and drops back with a bounce. */
const homer: Variants = {
  normal: { y: 0, rotate: 0, scaleX: 1, scaleY: 1, transition: { duration: 0 } },
  animate: {
    scaleX: [1, 0.85, 1, 1, 1, 1],
    scaleY: [1, 1.1, 1, 1, 1, 1],
    y: [0, 0, -20, -22, 3, 0],
    rotate: [0, 0, 120, 180, 180, 180],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.12, 0.4, 0.55, 0.85, 1] },
  },
};

const BaseballHomerIcon = forwardRef<IconHandle, IconProps>(
  function BaseballHomerIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Ball variants={reduced ? undefined : homer} origin={FLOOR} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. STRIKEOUT ────────────────────────────────────────────────────────────
   The full pitch: wind-up (coil back with a squash), the fastball rips
   through a full-speed double half-turn, and it smacks into the mitt with a
   catch squash and a dead stop. */
const strikeout: Variants = {
  normal: { rotate: 0, x: 0, scaleX: 1, scaleY: 1, transition: { duration: 0 } },
  animate: {
    // coil → rip (360° = two seam-symmetric half turns) → mitt impact →
    // recoil wobble that decays into the mitt (no dead stop)
    rotate: [0, -25, 335, 360, 357, 359, 360],
    x: [0, -8, 6, 0, 2.5, -1, 0],
    scaleX: [1, 0.94, 1, 0.85, 1.05, 0.98, 1],
    scaleY: [1, 0.94, 1, 1.1, 0.96, 1.01, 1],
    transition: {
      duration: 1.25,
      ease: "easeInOut",
      times: [0, 0.15, 0.5, 0.6, 0.72, 0.86, 1],
    },
  },
};

const BaseballStrikeoutIcon = forwardRef<IconHandle, IconProps>(
  function BaseballStrikeoutIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Ball variants={reduced ? undefined : strikeout} />
        </Svg>
      </div>
    );
  },
);

/* ── 6. ROTATION (from baseball.mp4) ─────────────────────────────────────────
   The reference's rotating-ball read: the seams travel around the ball
   through two full half-turns, and at every crossover — when the seams pass
   the midline — the ball squashes narrow like it's turning through the
   third dimension, popping round again as they clear. */
const rotation: Variants = {
  normal: { rotate: 0, scaleX: 1, scaleY: 1, transition: { duration: 0 } },
  animate: {
    rotate: [0, 90, 180, 270, 360],
    scaleX: [1, 0.85, 1, 0.85, 1],
    scaleY: [1, 1.04, 1, 1.04, 1],
    transition: { duration: 1.6, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
};

const BaseballRotationIcon = forwardRef<IconHandle, IconProps>(
  function BaseballRotationIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Ball variants={reduced ? undefined : rotation} />
        </Svg>
      </div>
    );
  },
);

/* ── 7. GROUNDER ─────────────────────────────────────────────────────────────
   A ground ball: rolls off to the right — rotation matched to its travel so
   it genuinely rolls, not slides — hops a pebble, then rolls back and eases
   into the pocket with a slow decaying settle. */
const grounder: Variants = {
  normal: { x: 0, y: 0, rotate: 0, transition: { duration: 0 } },
  animate: {
    // roll right (rotation ∝ distance), pebble hop, roll back, gentle settle
    x: [0, 10, 16, 20, 8, -3, 1, 0],
    y: [0, 0, -6, 0, 0, 0, 0, 0],
    rotate: [0, 65, 105, 130, 52, -20, 7, 0],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      times: [0, 0.18, 0.3, 0.42, 0.62, 0.8, 0.92, 1],
    },
  },
};

const BaseballGrounderIcon = forwardRef<IconHandle, IconProps>(
  function BaseballGrounderIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Ball variants={reduced ? undefined : grounder} />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BaseballSpinIcon }[] = [
  { name: "Spin", blurb: "Half-turn snap — seams land back on themselves", Component: BaseballSpinIcon },
  { name: "Knuckleball", blurb: "No-spin flutter, erratic tiny drifts", Component: BaseballKnuckleIcon },
  { name: "Curveball", blurb: "Spins while swinging out and diving — late break", Component: BaseballCurveIcon },
  { name: "Home Run", blurb: "Contact squash, rockets up spinning, drops & bounces", Component: BaseballHomerIcon },
  { name: "Strikeout", blurb: "Wind-up coil, full-speed rip, smack into the mitt", Component: BaseballStrikeoutIcon },
  { name: "Rotation", blurb: "Seams travel around, squash at every crossover (baseball.mp4)", Component: BaseballRotationIcon },
  { name: "Grounder", blurb: "Rolls off, hops a pebble, rolls back and eases to rest", Component: BaseballGrounderIcon },
];

export default function BaseballLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  // Each remains fully hover/focus-interactive too.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1500);
    };
    cycle();
    const id = window.setInterval(cycle, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Baseball — animation candidates</h1>
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
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              outline: "none",
            }}
          >
            <Component
              ref={(el) => {
                refs.current[i] = el;
              }}
              size={56}
              style={{ color: "var(--text-strong)" }}
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
