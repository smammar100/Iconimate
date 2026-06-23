"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Arrow Line Down, 5 takes on the skip-back "fold" motion.
 *
 * The reference GIF is a skip-back ⏮: the bar holds still while the triangle springs
 * out of it (overshooting), settles, then collapses back into the bar — looping. Here
 * the LINE is the fixed bar and the ARROW is the triangle: it collapses into / springs
 * out of the line along the vertical axis. Each variant flavors that same motion.
 */
const ARROW =
  "M50.34,117.66a8,8,0,0,1,11.32-11.32L120,164.69V32a8,8,0,0,1,16,0V164.69l58.34-58.35a8,8,0,0,1,11.32,11.32l-72,72a8,8,0,0,1-11.32,0Z";
// The baseline as a stroked line (identical to the filled bar at rest) so its middle
// can flex and recoil when the arrow lands.
const LINE_FLAT = "M40,216Q128,216,216,216";
const bow = (y: number) => `M40,216Q128,${y},216,216`;
// Anchor on the baseline so the arrow folds into / springs out of the line.
const ON_LINE = { transformBox: "view-box" as const, originX: 0.5, originY: 216 / 256 };
// Anchor at the arrowhead tip (~y=196) so the shaft telescopes toward the head.
const ON_TIP = { transformBox: "view-box" as const, originX: 0.5, originY: 196 / 256 };

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

// The line stays flat until the arrow lands, then bows down and wobbles back to flat.
const lineWobble: Variants = {
  normal: { d: LINE_FLAT, transition: RETURN_TRANSITION },
  animate: {
    d: [bow(216), bow(216), bow(250), bow(198), bow(226), bow(216)],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.18, 0.34, 0.54, 0.76, 1] },
  },
};
// Looping wobble for the continuous variant — the line dips each time the arrow folds.
const lineWobbleLoop: Variants = {
  normal: { d: LINE_FLAT, transition: RETURN_TRANSITION },
  animate: {
    d: [bow(250), bow(212), bow(216), bow(216), bow(216), bow(238), bow(250)],
    transition: { duration: 2, ease: "easeInOut", times: [0, 0.12, 0.24, 0.4, 0.74, 0.92, 1], repeat: Infinity },
  },
};

function makeFoldIcon(variants: Variants, anchor: typeof ON_LINE, line: Variants = lineWobble) {
  return forwardRef<IconHandle, IconProps>(function FoldIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={ARROW} variants={reduced ? undefined : variants} style={anchor} />
          <motion.path
            d={LINE_FLAT}
            variants={reduced ? undefined : line}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
          />
        </Svg>
      </div>
    );
  });
}

/* ── 1. FOLD  (shipped) — collapse into the line, spring out tall, settle. ───────── */
const fold: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.04, 1.32, 0.92, 1.05, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.2, 0.52, 0.7, 0.86, 1] },
  },
};
const FoldIcon = makeFoldIcon(fold, ON_LINE);

/* ── 2. WHIP — exaggerated overshoot + elastic multi-bounce (closest to the GIF). ── */
const whip: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.02, 1.5, 0.82, 1.16, 0.95, 1.03, 1],
    transition: { duration: 1, ease: "easeInOut", times: [0, 0.16, 0.42, 0.58, 0.72, 0.84, 0.93, 1] },
  },
};
const WhipIcon = makeFoldIcon(whip, ON_LINE);

/* ── 3. SQUASH — collapses to a point on the line, then pops back uniformly. ──────── */
const squash: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.06, 1.28, 0.94, 1.04, 1],
    transition: { duration: 0.85, ease: "easeInOut", times: [0, 0.22, 0.52, 0.7, 0.86, 1] },
  },
};
const SquashIcon = makeFoldIcon(squash, ON_LINE);

/* ── 4. TELESCOPE — anchored at the arrowhead: the shaft retracts into the head near
   the line, then extends back up. The head stays low; only the length changes. ───── */
const telescope: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.18, 1.28, 0.95, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.26, 0.56, 0.78, 1] },
  },
};
const TelescopeIcon = makeFoldIcon(telescope, ON_TIP);

/* ── 5. LOOP — the continuous gif: spring out, hold, collapse, hold, repeat. ──────── */
const loop: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0.04, 1.34, 0.95, 1, 1, 0.04, 0.04],
    transition: {
      duration: 2,
      ease: "easeInOut",
      times: [0, 0.18, 0.3, 0.4, 0.74, 0.92, 1],
      repeat: Infinity,
    },
  },
};
const LoopIcon = makeFoldIcon(loop, ON_LINE, lineWobbleLoop);

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; blurb: string; Component: typeof FoldIcon }[] = [
  { name: "Fold", blurb: "Shipped — collapse into the line, spring out tall, settle", Component: FoldIcon },
  { name: "Whip", blurb: "Exaggerated overshoot + elastic bounce (closest to the GIF)", Component: WhipIcon },
  { name: "Squash", blurb: "Collapses to a point on the line, pops back uniformly", Component: SquashIcon },
  { name: "Telescope", blurb: "Shaft retracts into the head by the line, then extends", Component: TelescopeIcon },
  { name: "Loop", blurb: "Continuous gif loop — spring out, hold, collapse, repeat", Component: LoopIcon },
];

export default function ArrowLineDownLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1900);
    };
    cycle();
    const id = window.setInterval(cycle, 3000);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Arrow Line Down — fold motion</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 620 }}>
        The skip-back motion mapped onto the line: the arrow collapses into / springs out of the fixed baseline. Hover,
        focus, or watch them auto-cycle. Pick one to promote.
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
