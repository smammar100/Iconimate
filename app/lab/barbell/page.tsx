"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/** Back-out overshoot — spring-like snap on multi-keyframe tweens. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/**
 * LAB — Barbell icon, 5 animation candidates. Every variant bends the rod.
 *
 * The Phosphor "barbell" glyph splits into three parts that reproduce it 1:1:
 *   LEFT / RIGHT — each side's plate stack (inner tall plate + outer plate +
 *                  end stub), even-odd from the glyph's own boundaries.
 *   ROD          — the center bar (x104–152, y120–136) as a cubic ribbon whose
 *                  control points morph, so the rod genuinely BENDS under load
 *                  instead of just translating.
 */
const LEFT =
  "M88,48H64A16,16,0,0,0,48,64v8H32A16,16,0,0,0,16,88v32H8a8,8,0,0,0,0,16h8v32a16,16,0,0,0,16,16H48v8a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V64A16,16,0,0,0,88,48ZM32,88H48v80H32ZM64,64H88V192H64Z";
const RIGHT =
  "M168,48h24a16,16,0,0,1,16,16v8h16a16,16,0,0,1,16,16v32h8a8,8,0,0,1,0,16h-8v32a16,16,0,0,1-16,16H208v8a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V64A16,16,0,0,1,168,48ZM224,88H208v80h16ZM192,64H168V192h24Z";

/* The rod as a cubic ribbon: control points at x120/x136 morph vertically to
   bend the bar. All keyframes share the same command structure so Motion can
   interpolate the path. */
const rod = (k: number) =>
  `M104,120C120,${120 + k},136,${120 + k},152,120L152,136C136,${136 + k},120,${136 + k},104,136Z`;
const ROD_STRAIGHT = rod(0);

/* Transform origins (view-box fractions of 256). */
const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const CENTER = AT(128, 128);

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

/* ── 1. CLEAN LIFT ───────────────────────────────────────────────────────────
   The whole bar comes off the floor: the rod rises first and bows UP in the
   middle as the plates drag behind, hangs loaded at the top, then sets down
   with a straightening shudder. */
const LIFT = 1.1;
const liftPlates: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -10, -12, -12, 1.5, 0],
    transition: { duration: LIFT, ease: "easeInOut", times: [0, 0.28, 0.4, 0.62, 0.85, 1] },
  },
};
const liftRod: Variants = {
  normal: { y: 0, d: ROD_STRAIGHT, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, -12, -12, 0, 0],
    d: [ROD_STRAIGHT, rod(7), rod(4), rod(4), rod(-4), ROD_STRAIGHT],
    transition: { duration: LIFT, ease: "easeInOut", times: [0, 0.28, 0.45, 0.62, 0.85, 1] },
  },
};

const BarbellLiftIcon = forwardRef<IconHandle, IconProps>(
  function BarbellLiftIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LEFT} fillRule="evenodd" variants={reduced ? undefined : liftPlates} />
          <motion.path d={RIGHT} fillRule="evenodd" variants={reduced ? undefined : liftPlates} />
          <motion.path d={ROD_STRAIGHT} variants={reduced ? undefined : liftRod} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. DROP ─────────────────────────────────────────────────────────────────
   Dropped from the top: the bar slams down, the rod bows hard downward on
   impact and rings back straight while the plates bounce. */
const dropPlates: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -8, 3, -1.5, 0],
    transition: { duration: 0.7, ease: "easeOut", times: [0, 0.2, 0.45, 0.7, 1] },
  },
};
const dropRod: Variants = {
  normal: { y: 0, d: ROD_STRAIGHT, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -8, 3, -1.5, 0],
    d: [ROD_STRAIGHT, rod(-3), rod(9), rod(-5), ROD_STRAIGHT],
    transition: { duration: 0.7, ease: "easeOut", times: [0, 0.2, 0.45, 0.7, 1] },
  },
};

const BarbellDropIcon = forwardRef<IconHandle, IconProps>(
  function BarbellDropIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LEFT} fillRule="evenodd" variants={reduced ? undefined : dropPlates} />
          <motion.path d={RIGHT} fillRule="evenodd" variants={reduced ? undefined : dropPlates} />
          <motion.path d={ROD_STRAIGHT} variants={reduced ? undefined : dropRod} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. REPS ─────────────────────────────────────────────────────────────────
   Two presses: up-down, up-down — the rod bowing up on every drive and
   flattening at each lockout. */
const REPS = 1.3;
const repsPlates: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -11, -1, -11, 0],
    transition: { duration: REPS, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
};
const repsRod: Variants = {
  normal: { y: 0, d: ROD_STRAIGHT, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, -1, -12, 0],
    d: [ROD_STRAIGHT, rod(6), rod(-2), rod(6), ROD_STRAIGHT],
    transition: { duration: REPS, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
};

const BarbellRepsIcon = forwardRef<IconHandle, IconProps>(
  function BarbellRepsIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LEFT} fillRule="evenodd" variants={reduced ? undefined : repsPlates} />
          <motion.path d={RIGHT} fillRule="evenodd" variants={reduced ? undefined : repsPlates} />
          <motion.path d={ROD_STRAIGHT} variants={reduced ? undefined : repsRod} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. WHIP ─────────────────────────────────────────────────────────────────
   Oly-bar oscillation: the barbell stays put while the rod whips up and down
   in a decaying wave, the plates rocking faintly in counterphase. */
const whipRod: Variants = {
  normal: { d: ROD_STRAIGHT, transition: RETURN_TRANSITION },
  animate: {
    d: [ROD_STRAIGHT, rod(8), rod(-7), rod(5), rod(-3), rod(1.5), ROD_STRAIGHT],
    transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.16, 0.34, 0.52, 0.7, 0.86, 1] },
  },
};
const whipPlate = (dir: number): Variants => ({
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -2 * dir, 1.8 * dir, -1.2 * dir, 0.6 * dir, 0],
    transition: { duration: 1.0, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
  },
});

const BarbellWhipIcon = forwardRef<IconHandle, IconProps>(
  function BarbellWhipIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LEFT} fillRule="evenodd" variants={reduced ? undefined : whipPlate(1)} style={AT(56, 128)} />
          <motion.path d={RIGHT} fillRule="evenodd" variants={reduced ? undefined : whipPlate(-1)} style={AT(200, 128)} />
          <motion.path d={ROD_STRAIGHT} variants={reduced ? undefined : whipRod} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. RACK UP ──────────────────────────────────────────────────────────────
   Loading the bar: both plate stacks slide in from the ends and clamp on —
   the rod dips and bends under the arriving weight, then levels out. */
const RACK = 1.0;
const rackPlate = (dir: number): Variants => ({
  normal: { x: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    x: [30 * dir, 0, 0],
    opacity: [0, 1, 1],
    transition: { duration: RACK, ease: SWEEP, times: [0, 0.35, 1] },
  },
});
const rackRod: Variants = {
  normal: { d: ROD_STRAIGHT, transition: RETURN_TRANSITION },
  animate: {
    d: [ROD_STRAIGHT, ROD_STRAIGHT, rod(7), rod(-2.5), ROD_STRAIGHT],
    transition: { duration: RACK, ease: "easeOut", times: [0, 0.35, 0.55, 0.78, 1] },
  },
};

const BarbellRackIcon = forwardRef<IconHandle, IconProps>(
  function BarbellRackIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LEFT} fillRule="evenodd" variants={reduced ? undefined : rackPlate(-1)} />
          <motion.path d={RIGHT} fillRule="evenodd" variants={reduced ? undefined : rackPlate(1)} />
          <motion.path d={ROD_STRAIGHT} variants={reduced ? undefined : rackRod} />
        </Svg>
      </div>
    );
  },
);

/* Asymmetric rod bend — independent left/right control points, for drops
   where one side hits first. */
const rod2 = (k1: number, k2: number) =>
  `M104,120C120,${120 + k1},136,${120 + k2},152,120L152,136C136,${136 + k2},120,${136 + k1},104,136Z`;

/* ── 6. DEAD DROP ────────────────────────────────────────────────────────────
   From overhead: a long fall, a hard slam that bows the rod deep, then a
   second smaller bounce before it rings itself straight. */
const DEAD = 1.0;
const deadPlates: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -18, 4, -6, 1.5, 0],
    transition: { duration: DEAD, ease: "easeIn", times: [0, 0.18, 0.38, 0.56, 0.76, 1] },
  },
};
const deadRod: Variants = {
  normal: { y: 0, d: ROD_STRAIGHT, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -18, 4, -6, 1.5, 0],
    d: [ROD_STRAIGHT, rod(-4), rod(11), rod(-7), rod(4), ROD_STRAIGHT],
    transition: { duration: DEAD, ease: "easeIn", times: [0, 0.18, 0.38, 0.56, 0.76, 1] },
  },
};

const BarbellDeadDropIcon = forwardRef<IconHandle, IconProps>(
  function BarbellDeadDropIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LEFT} fillRule="evenodd" variants={reduced ? undefined : deadPlates} />
          <motion.path d={RIGHT} fillRule="evenodd" variants={reduced ? undefined : deadPlates} />
          <motion.path d={ROD_STRAIGHT} variants={reduced ? undefined : deadRod} />
        </Svg>
      </div>
    );
  },
);

/* ── 7. SEESAW DROP ──────────────────────────────────────────────────────────
   Dropped unevenly: the right side lands first — the rod bends asymmetrically
   toward it — then the left catches up and the whole bar seesaws level. */
const SEESAW = 1.1;
const seesawLeft: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, -8, 2.5, -1, 0],
    transition: { duration: SEESAW, ease: "easeInOut", times: [0, 0.2, 0.38, 0.56, 0.76, 1] },
  },
};
const seesawRight: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, 2.5, -4, 1, 0],
    transition: { duration: SEESAW, ease: "easeInOut", times: [0, 0.2, 0.38, 0.56, 0.76, 1] },
  },
};
const seesawRod: Variants = {
  normal: { d: ROD_STRAIGHT, transition: RETURN_TRANSITION },
  animate: {
    // right control dips first, then the bend rolls left as that side lands
    d: [ROD_STRAIGHT, rod2(-3, -3), rod2(-4, 8), rod2(7, -3), rod2(-2, 2), ROD_STRAIGHT],
    transition: { duration: SEESAW, ease: "easeInOut", times: [0, 0.2, 0.38, 0.56, 0.76, 1] },
  },
};

const BarbellSeesawIcon = forwardRef<IconHandle, IconProps>(
  function BarbellSeesawIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LEFT} fillRule="evenodd" variants={reduced ? undefined : seesawLeft} />
          <motion.path d={RIGHT} fillRule="evenodd" variants={reduced ? undefined : seesawRight} />
          <motion.path d={ROD_STRAIGHT} variants={reduced ? undefined : seesawRod} />
        </Svg>
      </div>
    );
  },
);

/* ── 8. RUBBER DROP ──────────────────────────────────────────────────────────
   Bumper plates: a cartoonish double bounce — plates squash on every contact,
   the rod flexing down at each landing and springing up between them. */
const RUBBER = 1.2;
const rubberPlates: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -14, 0, -7, 0, -2.5, 0],
    scaleY: [1, 1.04, 0.88, 1.03, 0.94, 1.01, 1],
    transition: { duration: RUBBER, ease: "easeInOut", times: [0, 0.16, 0.34, 0.52, 0.7, 0.86, 1] },
  },
};
const rubberRod: Variants = {
  normal: { y: 0, d: ROD_STRAIGHT, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -14, 0, -7, 0, -2.5, 0],
    d: [ROD_STRAIGHT, rod(-3), rod(8), rod(-5), rod(5), rod(-2), ROD_STRAIGHT],
    transition: { duration: RUBBER, ease: "easeInOut", times: [0, 0.16, 0.34, 0.52, 0.7, 0.86, 1] },
  },
};

const BarbellRubberIcon = forwardRef<IconHandle, IconProps>(
  function BarbellRubberIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={LEFT} fillRule="evenodd" variants={reduced ? undefined : rubberPlates} style={AT(56, 208)} />
          <motion.path d={RIGHT} fillRule="evenodd" variants={reduced ? undefined : rubberPlates} style={AT(200, 208)} />
          <motion.path d={ROD_STRAIGHT} variants={reduced ? undefined : rubberRod} />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BarbellLiftIcon }[] = [
  { name: "Clean Lift", blurb: "Off the floor — rod bows up as plates drag", Component: BarbellLiftIcon },
  { name: "Drop", blurb: "Slams down, rod bows hard and rings straight", Component: BarbellDropIcon },
  { name: "Reps", blurb: "Two presses, rod bending on every drive", Component: BarbellRepsIcon },
  { name: "Whip", blurb: "Oly-bar oscillation — decaying wave through the rod", Component: BarbellWhipIcon },
  { name: "Rack Up", blurb: "Plates slide on, rod dips under the new weight", Component: BarbellRackIcon },
  { name: "Dead Drop", blurb: "Long fall, deep bow, second bounce, rings straight", Component: BarbellDeadDropIcon },
  { name: "Seesaw Drop", blurb: "Right side lands first — asymmetric bend, seesaws level", Component: BarbellSeesawIcon },
  { name: "Rubber Drop", blurb: "Bumper-plate double bounce, squash on every contact", Component: BarbellRubberIcon },
];

export default function BarbellLabPage() {
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Barbell — animation candidates</h1>
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
