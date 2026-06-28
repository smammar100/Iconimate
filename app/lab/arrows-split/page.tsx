"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Arrows Split (a stem branching into two downward arrows), 5 candidates.
 *
 * A single connected glyph, animated whole. The theme is the split / diverge: spread
 * the branches, or send them down. Each candidate is grounded in a Disney principle.
 * Spread scales about the centre; Plunge is anchored at the top of the stem.
 */
const GLYPH =
  "M229.66,189.66l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L184,196.69V139.31l-56-56-56,56v57.38l18.34-18.35a8,8,0,0,1,11.32,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L56,196.69V136a8,8,0,0,1,2.34-5.66L120,68.69V24a8,8,0,0,1,16,0V68.69l61.66,61.65A8,8,0,0,1,200,136v60.69l18.34-18.35a8,8,0,0,1,11.32,11.32Z";
const TOP = { transformBox: "view-box" as const, originX: 0.5, originY: 24 / 256 };
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

function makeIcon(v: Variants, origin?: typeof CENTER) {
  return forwardRef<IconHandle, IconProps>(function ArrowsSplitIcon({ size = 28, style, ...props }, ref) {
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
          <motion.path d={GLYPH} variants={reduced ? undefined : v} style={origin} />
        </motion.svg>
      </div>
    );
  });
}

/* ── 1. SPREAD  (shipped) — the branches stretch apart along X, then snap back through a
   couple of wobbles — the split made physical. Squash & stretch. ──────────────────── */
const spread: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: { scaleX: [1, 1.22, 0.94, 1.06, 1], transition: { duration: 0.8, ease: "easeOut", times: [0, 0.3, 0.55, 0.78, 1] } },
};
const SpreadIcon = makeIcon(spread, CENTER);

/* ── 2. DROP — a small wind-up, then the whole glyph drops down past rest and glides
   home. Anticipation + Follow-through. ───────────────────────────────────────────── */
const drop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, -10, 22, 0], transition: { duration: 0.8, times: [0, 0.22, 0.52, 1], ease: ["easeOut", "easeIn", ARRIVE] } },
};
const DropIcon = makeIcon(drop);

/* ── 3. PLUNGE — anchored at the top of the stem, the glyph stretches down the branches
   and recoils. Slow in & out. ────────────────────────────────────────────────────── */
const plunge: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: { scaleY: [1, 0.92, 1.1, 0.97, 1], transition: { duration: 0.75, ease: "easeInOut", times: [0, 0.25, 0.5, 0.74, 1] } },
};
const PlungeIcon = makeIcon(plunge, TOP);

/* ── 4. SPRING — drops down, overshoots back a touch, then settles. Follow-through. ── */
const spring: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: { y: [0, 24, -5, 0], transition: { duration: 0.7, ease: "easeOut", times: [0, 0.45, 0.7, 1] } },
};
const SpringIcon = makeIcon(spring);

/* ── 5. PULSE — a uniform squash-and-pop about the centre — a tap. Appeal. ─────────── */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.9, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
};
const PulseIcon = makeIcon(pulse, CENTER);

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; principle: string; blurb: string; Component: typeof SpreadIcon }[] = [
  {
    name: "Spread",
    principle: "Squash & stretch",
    blurb: "Shipped — the branches stretch apart, then snap back",
    Component: SpreadIcon,
  },
  { name: "Drop", principle: "Anticipation", blurb: "Winds up, drops down past rest, glides home", Component: DropIcon },
  { name: "Plunge", principle: "Slow in & out", blurb: "Stretches down the branches from the top, recoils", Component: PlungeIcon },
  { name: "Spring", principle: "Follow-through", blurb: "Drops down, overshoots back a touch, then settles", Component: SpringIcon },
  { name: "Pulse", principle: "Appeal", blurb: "Uniform squash-and-pop about the centre — a tap", Component: PulseIcon },
];

export default function ArrowsSplitLabPage() {
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Arrows Split — animation candidates</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 640 }}>
        Five takes on the split/diverge glyph, each built on a Disney motion principle. &ldquo;Spread&rdquo; is the
        shipped motion. Hover, focus, or watch them auto-cycle. Pick one to promote.
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
