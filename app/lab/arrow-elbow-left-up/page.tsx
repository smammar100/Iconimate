"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Arrow Elbow Left-Up, 6 animation candidates.
 *
 * The tail runs off to the right, elbows, and the head points straight up. "Shoot"
 * is the shipped motion: load down, then fire up and glide home. The glyph is the
 * arrow-elbow-down-left path reoriented with a rigid transform, so every motion is
 * animated on the OUTER group to keep its travel locked to world axes.
 */
const ARROW =
  "M200,32V176a8,8,0,0,1-8,8H67.31l34.35,34.34a8,8,0,0,1-11.32,11.32l-48-48a8,8,0,0,1,0-11.32l48-48a8,8,0,0,1,11.32,11.32L67.31,168H184V32a8,8,0,0,1,16,0Z";
// Rotate/reflect the down-left glyph into left-up: (x,y) -> (256 - y, x).
const ORIENT = "matrix(0,1,-1,0,256,0)";
// The tail (free end of the horizontal shaft) and the center, in world view-box space.
const TAIL = { x: 224 / 256, y: 200 / 256 };
const CENTER = { x: 0.5, y: 0.5 };

function Glyph() {
  return (
    <g transform={ORIENT}>
      <path d={ARROW} />
    </g>
  );
}

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

/* ── 1. SHOOT  (shipped) ───────────────────────────────────────────────────────
   Loads down, then fires straight up past rest and glides home — a single shot. */
const shoot: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 11, -46, 0],
    transition: { duration: 0.7, times: [0, 0.22, 0.46, 1], ease: ["easeInOut", "easeOut", ARRIVE] },
  },
};
const ShootIcon = forwardRef<IconHandle, IconProps>(function ShootIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : shoot}>
          <Glyph />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 2. GLIDE ──────────────────────────────────────────────────────────────────
   A calm one-way slide up and back — a gentle directional nudge. */
const glide: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, -28, 0], transition: { duration: 0.7, ease: SWEEP, times: [0, 0.45, 1] } },
};
const GlideIcon = forwardRef<IconHandle, IconProps>(function GlideIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : glide}>
          <Glyph />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 3. RECOIL ─────────────────────────────────────────────────────────────────
   Heavy anticipation: a big wind down, then a snappy release up. */
const recoil: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 30, -36, 0],
    transition: { duration: 0.8, times: [0, 0.4, 0.62, 1], ease: ["easeOut", "easeIn", ARRIVE] },
  },
};
const RecoilIcon = forwardRef<IconHandle, IconProps>(function RecoilIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : recoil}>
          <Glyph />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 4. STRETCH ────────────────────────────────────────────────────────────────
   The glyph stretches toward its tip and snaps back — a launch felt as elongation,
   anchored at the tail (bottom-right). */
const stretch: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.86, 1.18, 0.96, 1],
    transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.25, 0.5, 0.74, 1] },
  },
};
const StretchIcon = forwardRef<IconHandle, IconProps>(function StretchIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g
          variants={reduced ? undefined : stretch}
          style={{ transformBox: "view-box", originX: TAIL.x, originY: TAIL.y }}
        >
          <Glyph />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 5. NUDGE ──────────────────────────────────────────────────────────────────
   A quick repeating up tap — a subtle "go this way" idle. */
const nudge: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -11, 0],
    transition: { duration: 0.9, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.2 },
  },
};
const NudgeIcon = forwardRef<IconHandle, IconProps>(function NudgeIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : nudge}>
          <Glyph />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 6. PULSE ──────────────────────────────────────────────────────────────────
   A tactile uniform squash-and-pop about the center — a tap acknowledgement. */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.86, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
};
const PulseIcon = forwardRef<IconHandle, IconProps>(function PulseIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g
          variants={reduced ? undefined : pulse}
          style={{ transformBox: "view-box", originX: CENTER.x, originY: CENTER.y }}
        >
          <Glyph />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── 7. SNAP  (the bend-arrow draw, made angular) ──────────────────────────────
   The arrow draws itself in a single fast, bouncy stroke. The angular centerline
   (tail → corner → up) is traced while a separate arrowhead rides the growing tip,
   rotated to the path tangent — so at the sharp corner the head snaps a hard 90°
   instead of banking around a curve. An underdamped spring overshoots past the tip,
   then settles. */
const SNAP_SPINE = "M216,192L80,192L80,48";
// Chevron head, pointing +x at rotation 0 — reused from the bend-arrow family.
const SNAP_HEAD =
  "M24.97,5.66l-48,48a8,8,0,0,1-11.32-11.32L0,8L0,-8L-34.35,-42.34a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,24.97,5.66Z";
const SNAP_STROKE_W = 16;
// Fraction of the spring's raw overshoot applied past the tip — small enough to stay in frame.
const SNAP_OVERSHOOT = 0.16;
const SnapIcon = forwardRef<IconHandle, IconProps>(function SnapIcon({ size = 28, style, ...props }, ref) {
  const reduced = useReducedMotion() ?? false;
  const pathRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const totalRef = useRef(0);
  const progress = useMotionValue(1);
  const anim = useRef<ReturnType<typeof animate> | null>(null);

  const render = useCallback(() => {
    const path = pathRef.current;
    const head = headRef.current;
    if (!path || !head) return;
    const total = totalRef.current || (totalRef.current = path.getTotalLength());
    if (!total) return;

    const p = progress.get();
    const Lraw = p * total;
    const L = Math.max(0, Math.min(total, Lraw));

    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total - L}`;

    let px: number;
    let py: number;
    let ang: number;
    if (Lraw > total) {
      const end = path.getPointAtLength(total);
      const before = path.getPointAtLength(total - 1);
      let dx = end.x - before.x;
      let dy = end.y - before.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const ext = (Lraw - total) * SNAP_OVERSHOOT;
      px = end.x + dx * ext;
      py = end.y + dy * ext;
      ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    } else {
      const tip = path.getPointAtLength(L);
      const a = path.getPointAtLength(Math.max(0, L - 1));
      const b = path.getPointAtLength(Math.min(total, L + 1));
      px = tip.x;
      py = tip.y;
      ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    }
    head.setAttribute("transform", `translate(${px} ${py}) rotate(${ang})`);
    head.style.opacity = p > 0.015 ? "1" : "0";
  }, [progress]);

  useMotionValueEvent(progress, "change", render);
  useEffect(() => {
    progress.set(1);
    render();
  }, [progress, render]);

  const start = useCallback(() => {
    if (reduced) return;
    anim.current?.stop();
    progress.set(0);
    anim.current = animate(progress, 1, { type: "spring", stiffness: 70, damping: 7, mass: 1 });
  }, [reduced, progress]);
  const stop = useCallback(() => {
    anim.current?.stop();
    animate(progress, 1, { duration: 0.3, ease: "easeOut" });
  }, [progress]);
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  return (
    <div
      {...props}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      style={{ display: "inline-flex", overflow: "hidden", ...style }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        stroke="currentColor"
        strokeWidth={SNAP_STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: "visible" }}
      >
        <path ref={pathRef} d={SNAP_SPINE} />
        <g ref={headRef}>
          <path d={SNAP_HEAD} fill="currentColor" stroke="none" />
        </g>
      </svg>
    </div>
  );
});

/* ── 8–12. SNAP FAMILY  (more draw variations) ─────────────────────────────────
   All share one tip-riding draw engine: the angular centerline is traced while a
   chevron head rides the growing tip, rotated to the path tangent — so it snaps a
   hard 90° at the corner. Variants differ only in how `progress` is driven and how
   far the head shoots past the tip. */
type Play = (progress: ReturnType<typeof useMotionValue<number>>) => ReturnType<typeof animate>;
type TipDrawProps = IconProps & { spine: string; overshoot: number; play: Play };
const TipDrawArrow = forwardRef<IconHandle, TipDrawProps>(function TipDrawArrow(
  { size = 28, style, spine, overshoot, play, ...props },
  ref,
) {
  const reduced = useReducedMotion() ?? false;
  const pathRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const totalRef = useRef(0);
  const progress = useMotionValue(1);
  const anim = useRef<ReturnType<typeof animate> | null>(null);

  const render = useCallback(() => {
    const path = pathRef.current;
    const head = headRef.current;
    if (!path || !head) return;
    const total = totalRef.current || (totalRef.current = path.getTotalLength());
    if (!total) return;

    const p = progress.get();
    const Lraw = p * total;
    const L = Math.max(0, Math.min(total, Lraw));
    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total - L}`;

    let px: number;
    let py: number;
    let ang: number;
    if (Lraw > total) {
      const end = path.getPointAtLength(total);
      const before = path.getPointAtLength(total - 1);
      let dx = end.x - before.x;
      let dy = end.y - before.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const ext = (Lraw - total) * overshoot;
      px = end.x + dx * ext;
      py = end.y + dy * ext;
      ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    } else {
      const tip = path.getPointAtLength(L);
      const a = path.getPointAtLength(Math.max(0, L - 1));
      const b = path.getPointAtLength(Math.min(total, L + 1));
      px = tip.x;
      py = tip.y;
      ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    }
    head.setAttribute("transform", `translate(${px} ${py}) rotate(${ang})`);
    head.style.opacity = p > 0.015 ? "1" : "0";
  }, [progress, overshoot]);

  useMotionValueEvent(progress, "change", render);
  useEffect(() => {
    progress.set(1);
    render();
  }, [progress, render]);

  const start = useCallback(() => {
    if (reduced) return;
    anim.current?.stop();
    progress.set(0);
    anim.current = play(progress);
  }, [reduced, progress, play]);
  const stop = useCallback(() => {
    anim.current?.stop();
    animate(progress, 1, { duration: 0.3, ease: "easeOut" });
  }, [progress]);
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  return (
    <div
      {...props}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      style={{ display: "inline-flex", overflow: "hidden", ...style }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        stroke="currentColor"
        strokeWidth={SNAP_STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: "visible" }}
      >
        <path ref={pathRef} d={spine} />
        <g ref={headRef}>
          <path d={SNAP_HEAD} fill="currentColor" stroke="none" />
        </g>
      </svg>
    </div>
  );
});

// Corner fraction along the centerline (horizontal run / total) — where the snap happens.
const SNAP_CORNER = 136 / 280;

/* 8. WHIP — extra-elastic spring, big shoot-past the tip: a wild, loose snap. */
const WhipIcon = forwardRef<IconHandle, IconProps>(function WhipIcon(props, ref) {
  return (
    <TipDrawArrow
      ref={ref}
      {...props}
      spine={SNAP_SPINE}
      overshoot={0.32}
      play={(p) => animate(p, 1, { type: "spring", stiffness: 55, damping: 4.5, mass: 1 })}
    />
  );
});

/* 9. DRAW — a crisp, precise self-draw with no bounce: clean and mechanical. */
const DrawIcon = forwardRef<IconHandle, IconProps>(function DrawIcon(props, ref) {
  return (
    <TipDrawArrow
      ref={ref}
      {...props}
      spine={SNAP_SPINE}
      overshoot={0}
      play={(p) => animate(p, 1, { duration: 0.62, ease: "easeInOut" })}
    />
  );
});

/* 10. STUTTER — races the horizontal run, holds a beat at the elbow, then snaps up
   the vertical: the angular corner gets its own emphatic pause. */
const StutterIcon = forwardRef<IconHandle, IconProps>(function StutterIcon(props, ref) {
  return (
    <TipDrawArrow
      ref={ref}
      {...props}
      spine={SNAP_SPINE}
      overshoot={0.14}
      play={(p) =>
        animate(p, [0, SNAP_CORNER, SNAP_CORNER, 1], {
          duration: 0.95,
          times: [0, 0.3, 0.5, 1],
          ease: ["easeOut", "linear", "easeOut"],
        })
      }
    />
  );
});

/* 11. LOOP — draws, then un-draws back to the tail, forever: a calm tracing idle. */
const LoopIcon = forwardRef<IconHandle, IconProps>(function LoopIcon(props, ref) {
  return (
    <TipDrawArrow
      ref={ref}
      {...props}
      spine={SNAP_SPINE}
      overshoot={0}
      play={(p) =>
        animate(p, [0, 1, 1, 0], {
          duration: 2,
          times: [0, 0.42, 0.58, 1],
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.15,
        })
      }
    />
  );
});

/* 12. PLANT — the arrowhead lands at the top first, then the shaft grows back out
   to the tail. Reversed reveal with a fixed head (no tip-riding). */
const PLANT_SPINE = "M80,48L80,192L216,192";
const PlantIcon = forwardRef<IconHandle, IconProps>(function PlantIcon({ size = 28, style, ...props }, ref) {
  const reduced = useReducedMotion() ?? false;
  const pathRef = useRef<SVGPathElement>(null);
  const totalRef = useRef(0);
  const progress = useMotionValue(1);
  const anim = useRef<ReturnType<typeof animate> | null>(null);

  const render = useCallback(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = totalRef.current || (totalRef.current = path.getTotalLength());
    if (!total) return;
    const L = Math.max(0, Math.min(total, progress.get() * total));
    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total - L}`;
  }, [progress]);

  useMotionValueEvent(progress, "change", render);
  useEffect(() => {
    progress.set(1);
    render();
  }, [progress, render]);

  const start = useCallback(() => {
    if (reduced) return;
    anim.current?.stop();
    progress.set(0);
    anim.current = animate(progress, 1, { type: "spring", stiffness: 120, damping: 16, mass: 1 });
  }, [reduced, progress]);
  const stop = useCallback(() => {
    anim.current?.stop();
    animate(progress, 1, { duration: 0.3, ease: "easeOut" });
  }, [progress]);
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  return (
    <div
      {...props}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      style={{ display: "inline-flex", overflow: "hidden", ...style }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        stroke="currentColor"
        strokeWidth={SNAP_STROKE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: "visible" }}
      >
        <path ref={pathRef} d={PLANT_SPINE} />
        {/* Fixed head, planted at the tip (80,48) pointing up. */}
        <g transform="translate(80 48) rotate(-90)">
          <path d={SNAP_HEAD} fill="currentColor" stroke="none" />
        </g>
      </svg>
    </div>
  );
});

/* ── Preview grid ──────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; blurb: string; Component: typeof ShootIcon }[] = [
  { name: "Shoot", blurb: "Shipped — loads down, then fires up and glides home", Component: ShootIcon },
  { name: "Snap", blurb: "Draws itself in; head snaps a hard 90° at the corner", Component: SnapIcon },
  { name: "Whip", blurb: "Loose elastic draw, head shoots well past the tip", Component: WhipIcon },
  { name: "Draw", blurb: "Crisp, precise self-draw — no bounce", Component: DrawIcon },
  { name: "Stutter", blurb: "Holds a beat at the elbow, then snaps up", Component: StutterIcon },
  { name: "Loop", blurb: "Draws and un-draws forever — tracing idle", Component: LoopIcon },
  { name: "Plant", blurb: "Head lands first, then the shaft grows back out", Component: PlantIcon },
  { name: "Glide", blurb: "Calm one-way slide up and back", Component: GlideIcon },
  { name: "Recoil", blurb: "Heavy wind-down, snappy release", Component: RecoilIcon },
  { name: "Stretch", blurb: "Elongates toward the tip from the tail", Component: StretchIcon },
  { name: "Nudge", blurb: "Quick repeating up tap — idle", Component: NudgeIcon },
  { name: "Pulse", blurb: "Uniform squash-and-pop tap response", Component: PulseIcon },
];

export default function ArrowElbowLeftUpLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1600);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Arrow Elbow Left-Up — animation candidates</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 600 }}>
        &ldquo;Shoot&rdquo; is the shipped motion. Hover, focus, or watch them auto-cycle. Pick one to promote.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 800,
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
