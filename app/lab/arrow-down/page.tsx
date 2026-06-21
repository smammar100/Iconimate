"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Arrow Down, 5 animation candidates.
 *
 * A single filled down-arrow (tail at the top y=40, tip at the bottom). "Spring"
 * reproduces the video: a vertical squash-and-stretch with the TAIL anchored.
 */
const ARROW =
  "M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z";
// Vertical spine through the arrow, for the draw variant (clipped to ARROW).
const ARROW_SPINE = "M128,36L128,224";
// The tail (top of the shaft, y=40) — the anchor for the squash.
const TAIL = { x: 0.5, y: 40 / 256 };
const CENTER = { x: 0.5, y: 0.5 };
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

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

/* ── 1. SPRING  (from the video) ──────────────────────────────────────────────
   Vertical squash with the tail anchored — the arrowhead retracts toward the
   tail, then springs back out (down) past rest and settles. Width never changes. */
const squash: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    // rest → squash → stretch past rest (overshoot) → bounce → small overshoot → rest
    scaleY: [1, 0.5, 1.12, 0.93, 1.04, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.26, 0.5, 0.68, 0.85, 1] },
  },
};
const SpringIcon = forwardRef<IconHandle, IconProps>(function SpringIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path
          d={ARROW}
          variants={reduced ? undefined : squash}
          style={{ transformBox: "view-box", originX: TAIL.x, originY: TAIL.y }}
        />
      </Svg>
    </div>
  );
});

/* ── 2. DROP ──────────────────────────────────────────────────────────────────
   The whole arrow lunges down and springs back — a "download" nudge. */
const drop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, 20, 0], transition: { duration: 0.6, ease: OVERSHOOT, times: [0, 0.4, 1] } },
};
const DropIcon = forwardRef<IconHandle, IconProps>(function DropIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ARROW} variants={reduced ? undefined : drop} />
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
  const clipId = `ad-draw-${useId()}`;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <path d={ARROW} />
          </clipPath>
        </defs>
        <motion.path
          d={ARROW_SPINE}
          fill="none"
          stroke="currentColor"
          strokeWidth={170}
          strokeLinecap="butt"
          clipPath={`url(#${clipId})`}
          variants={reduced ? undefined : draw}
        />
      </Svg>
    </div>
  );
});

/* ── 4. BOB ───────────────────────────────────────────────────────────────────
   A calm down-and-back loop — a gentle "scroll down" idle. */
const bob: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 9, 0],
    transition: { duration: 1, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.15 },
  },
};
const BobIcon = forwardRef<IconHandle, IconProps>(function BobIcon({ size = 28, style, ...props }, ref) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.path d={ARROW} variants={reduced ? undefined : bob} />
      </Svg>
    </div>
  );
});

/* ── 5. PULSE ─────────────────────────────────────────────────────────────────
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
        <motion.path
          d={ARROW}
          variants={reduced ? undefined : pulse}
          style={{ transformBox: "view-box", originX: CENTER.x, originY: CENTER.y }}
        />
      </Svg>
    </div>
  );
});

/* ── Preview grid ──────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; blurb: string; Component: typeof SpringIcon }[] = [
  { name: "Spring", blurb: "From the video — vertical squash from the tail, springs back out", Component: SpringIcon },
  { name: "Drop", blurb: "Whole arrow lunges down and springs back", Component: DropIcon },
  { name: "Draw", blurb: "Arrow pens itself in, top to tip", Component: DrawIcon },
  { name: "Bob", blurb: "Gentle down-and-back loop — idle", Component: BobIcon },
  { name: "Pulse", blurb: "Uniform squash-and-pop tap response", Component: PulseIcon },
];

export default function ArrowDownLabPage() {
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Arrow Down — animation candidates</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 600 }}>
        &ldquo;Spring&rdquo; reproduces the video. Hover, focus, or watch them auto-cycle. Pick one to promote.
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
