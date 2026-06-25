"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Arrow Fat Down, 5 takes on a downward "descend" motion.
 *
 * The glyph is the exact Phosphor arrow-fat-down (single outlined path, animated
 * whole so the artwork stays pixel-identical). It points down, so every variant
 * plays on the idea of falling / dropping / pushing downward: a gravity drop with
 * a landing squash, a continuous bob, a diving plunge, a tap-like nudge, and an
 * attention pulse.
 */
const ARROW =
  "M231.39,132.94A8,8,0,0,0,224,128H184V48a16,16,0,0,0-16-16H88A16,16,0,0,0,72,48v80H32a8,8,0,0,0-5.66,13.66l96,96a8,8,0,0,0,11.32,0l96-96A8,8,0,0,0,231.39,132.94ZM128,220.69,51.31,144H80a8,8,0,0,0,8-8V48h80v88a8,8,0,0,0,8,8h28.69Z";

// Anchor at the arrowhead tip (~y=221) so squashes land on the point.
const ON_TIP = { transformBox: "view-box" as const, originX: 0.5, originY: 221 / 256 };
// Anchor at the top edge (glyph bbox starts ~y=32) so a stretch elongates downward.
const ON_TOP = { transformBox: "view-box" as const, originX: 0.5, originY: 32 / 256 };
// Anchor at the centroid for uniform scale pulses.
const ON_CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

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

function makeIcon(variants: Variants, anchor: typeof ON_TIP) {
  return forwardRef<IconHandle, IconProps>(function FatDownIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={ARROW} variants={reduced ? undefined : variants} style={anchor} />
        </Svg>
      </div>
    );
  });
}

/* ── 1. DROP — falls in from above under gravity, squashes on the tip, settles. ───── */
const drop: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [-52, 0, 0, 0, 0],
    scaleY: [1, 1, 0.8, 1.08, 1],
    transition: { duration: 0.85, ease: ARRIVE, times: [0, 0.46, 0.6, 0.82, 1] },
  },
};
const DropIcon = makeIcon(drop, ON_TIP);

/* ── 2. BOB — continuous gentle float, the "scroll down" hint. ─────────────────────── */
const bob: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 11, 0],
    transition: { duration: 1.4, ease: "easeInOut", repeat: Infinity },
  },
};
const BobIcon = makeIcon(bob, ON_CENTER);

/* ── 3. PLUNGE — anchored at the top: the body elongates downward, the tip leads. ─── */
const plunge: Variants = {
  // Top-anchored so the tip plunges downward; glyph bbox is y=32..240, so peak 1.07
  // lands the tip right at y=256 (the in-bounds ceiling) — a deeper coil keeps it lively.
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.86, 1.07, 0.97, 1.02, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.18, 0.48, 0.68, 0.84, 1] },
  },
};
const PlungeIcon = makeIcon(plunge, ON_TOP);

/* ── 4. NUDGE — a quick tap-like push down with a small overshoot back. ────────────── */
const nudge: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 18, -3, 0],
    transition: { duration: 0.55, ease: ARRIVE, times: [0, 0.42, 0.72, 1] },
  },
};
const NudgeIcon = makeIcon(nudge, ON_CENTER);

/* ── 5. BEAT — uniform attention pulse, scale in/out from the centroid. ────────────── */
const beat: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.18, 0.95, 1.06, 1],
    transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.3, 0.55, 0.8, 1] },
  },
};
const BeatIcon = makeIcon(beat, ON_CENTER);

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; blurb: string; Component: typeof DropIcon }[] = [
  { name: "Drop", blurb: "Falls in from above, squashes on the tip, settles", Component: DropIcon },
  { name: "Bob", blurb: "Continuous gentle float — the scroll-down hint", Component: BobIcon },
  { name: "Plunge", blurb: "Shipped — coils up, then the tip plunges down to the edge and settles", Component: PlungeIcon },
  { name: "Nudge", blurb: "Quick tap-like push down with a small overshoot", Component: NudgeIcon },
  { name: "Beat", blurb: "Uniform attention pulse from the centroid", Component: BeatIcon },
];

export default function ArrowFatDownLabPage() {
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Arrow Fat Down — descend motion</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 620 }}>
        Five takes on the downward fat arrow — a gravity drop, a floating bob, a diving plunge, a tap nudge, and an
        attention beat. Hover, focus, or watch them auto-cycle. Pick one to promote.
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
