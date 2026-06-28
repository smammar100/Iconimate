"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Arrows Horizontal (double-headed resize arrow), 5 animation candidates.
 *
 * A single horizontal double-arrow; the natural motion lives on the X axis — stretch,
 * squash, sway. "Rubber Band" is the requested motion: an elastic horizontal stretch
 * that snaps back with a few diminishing wobbles. Each candidate is grounded in a
 * Disney principle and scales about the centre.
 */
const GLYPH =
  "M237.66,133.66l-32,32a8,8,0,0,1-11.32-11.32L212.69,136H43.31l18.35,18.34a8,8,0,0,1-11.32,11.32l-32-32a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,11.32L43.31,120H212.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,133.66Z";
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

function makeIcon(v: Variants) {
  return forwardRef<IconHandle, IconProps>(function ArrowsHorizontalIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
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
          <motion.path d={GLYPH} variants={reduced ? undefined : v} style={CENTER} />
        </motion.svg>
      </div>
    );
  });
}

/* ── 1. RUBBER BAND  (requested) — stretches wide along X, then snaps back through a few
   diminishing wobbles, like a released elastic. Squash & stretch / elasticity. ─────── */
const rubberBand: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 1.32, 0.9, 1.1, 0.97, 1],
    transition: { duration: 0.95, times: [0, 0.25, 0.5, 0.7, 0.86, 1], ease: "easeOut" },
  },
};
const RubberBandIcon = makeIcon(rubberBand);

/* ── 2. STRETCH — a single clean horizontal expand and return. Slow in & out. ──────── */
const stretch: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: { scaleX: [1, 1.25, 1], transition: { duration: 0.7, ease: ARRIVE, times: [0, 0.5, 1] } },
};
const StretchIcon = makeIcon(stretch);

/* ── 3. SWAY — the whole arrow rocks left then right and back. Arcs / overlapping. ──── */
const sway: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: [0, -14, 14, 0], transition: { duration: 0.8, ease: SWEEP, times: [0, 0.33, 0.66, 1] } },
};
const SwayIcon = makeIcon(sway);

/* ── 4. RECOIL — squashes inward first (anticipation), then springs wide and settles.
   Anticipation + Follow-through. ─────────────────────────────────────────────────── */
const recoil: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: { scaleX: [1, 0.78, 1.2, 1], transition: { duration: 0.75, times: [0, 0.3, 0.62, 1], ease: ["easeIn", "easeOut", "easeOut"] } },
};
const RecoilIcon = makeIcon(recoil);

/* ── 5. PULSE — a uniform squash-and-pop about the centre — a tactile tap. Appeal. ──── */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.9, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
};
const PulseIcon = makeIcon(pulse);

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; principle: string; blurb: string; Component: typeof RubberBandIcon }[] = [
  {
    name: "Rubber Band",
    principle: "Squash & stretch",
    blurb: "Requested — stretches wide, then snaps back through diminishing wobbles",
    Component: RubberBandIcon,
  },
  { name: "Stretch", principle: "Slow in & out", blurb: "A single clean horizontal expand and return", Component: StretchIcon },
  { name: "Sway", principle: "Arcs", blurb: "The whole arrow rocks left, then right, and back", Component: SwayIcon },
  {
    name: "Recoil",
    principle: "Anticipation",
    blurb: "Squashes inward first, then springs wide and settles",
    Component: RecoilIcon,
  },
  { name: "Pulse", principle: "Appeal", blurb: "Uniform squash-and-pop about the centre — a tap", Component: PulseIcon },
];

export default function ArrowsHorizontalLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1700);
    };
    cycle();
    const id = window.setInterval(cycle, 2900);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Arrows Horizontal — animation candidates</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 640 }}>
        Five takes on the double-headed resize arrow, each built on a Disney motion principle. &ldquo;Rubber Band&rdquo;
        is the requested elastic stretch. Hover, focus, or watch them auto-cycle. Pick one to promote.
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
        {VARIANTS.map(({ name, principle, blurb, Component }, i) => (
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
              <div style={{ fontSize: 11, opacity: 0.4, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {principle}
              </div>
              <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{blurb}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
