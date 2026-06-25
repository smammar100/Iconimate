"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, springPop, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Arrow Square In, 5 takes on a "minimize / pull-in" motion.
 *
 * The glyph splits into two exact Phosphor sub-paths — the window frame (top-right)
 * and the arrow that tucks into the bottom-left corner. The arrow's bbox is
 * x=32..128, y=128..224 (tip in the corner), the frame's is x=64..224, y=32..192,
 * so the arrow moves diagonally toward/away from the corner while the window reacts.
 */
const FRAME =
  "M208,32H80A16,16,0,0,0,64,48V96a8,8,0,0,0,16,0V48H208V176H160a8,8,0,0,0,0,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Z";
const ARROW =
  "M128,136v64a8,8,0,0,1-16,0V155.32L45.66,221.66a8,8,0,0,1-11.32-11.32L100.68,144H56a8,8,0,0,1,0-16h64A8,8,0,0,1,128,136Z";

// Anchor at the arrowhead tip (bottom-left corner) so a scale shrinks *into* the corner.
const TIP = { transformBox: "view-box" as const, originX: 38 / 256, originY: 218 / 256 };
// Anchor at the tail (near the window) so a scale telescopes the shaft toward the corner.
const TAIL = { transformBox: "view-box" as const, originX: 124 / 256, originY: 140 / 256 };
// Centroid anchor for translate-only motions (origin is irrelevant to translate).
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
// The window frame scales about its own centre.
const FRAME_CENTER = { transformBox: "view-box" as const, originX: 144 / 256, originY: 112 / 256 };

type Opts = { arrowStyle?: typeof CENTER; frame?: Variants; frameStyle?: typeof CENTER };

function makeIcon(arrowVariants: Variants, opts: Opts = {}) {
  const { arrowStyle = CENTER, frame, frameStyle } = opts;
  return forwardRef<IconHandle, IconProps>(function SquareInIcon({ size = 28, style, ...props }, ref) {
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
          <motion.path d={FRAME} variants={reduced ? undefined : frame} style={frameStyle} />
          <motion.path d={ARROW} variants={reduced ? undefined : arrowVariants} style={arrowStyle} />
        </motion.svg>
      </div>
    );
  });
}

/* ── 1. PULL-IN — anticipation up-right, then the arrow shoots into the corner and
   settles. Anticipation + exaggeration (overshoot) + follow-through. ─────────────── */
const pullIn: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 7, -13, 3, 0],
    y: [0, -7, 13, -3, 0],
    transition: { duration: 0.8, ease: ARRIVE, times: [0, 0.2, 0.55, 0.78, 1] },
  },
};
const PullInIcon = makeIcon(pullIn);

/* ── 2. MINIMIZE — the arrow shrinks into the corner and fades, then restores; loops
   like a "minimizing" hint. Anchored at the tip so it collapses toward the corner. ── */
const minimize: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.45, 1],
    opacity: [1, 0.3, 1],
    transition: { duration: 1.6, ease: "easeInOut", times: [0, 0.5, 1], repeat: Infinity, repeatDelay: 0.2 },
  },
};
const MinimizeIcon = makeIcon(minimize, { arrowStyle: TIP });

/* ── 3. SNAP — the arrow springs into the corner and holds; the window pulses a beat
   later (secondary action + staging). ──────────────────────────────────────────── */
const snap: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: { x: -12, y: 12, transition: springPop },
};
const snapFrame: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 1.05, 1], transition: { duration: 0.45, ease: ARRIVE, delay: staged(1, 0.05) } },
};
const SnapIcon = makeIcon(snap, { frame: snapFrame, frameStyle: FRAME_CENTER });

/* ── 4. TELESCOPE — anchored at the tail by the window: the shaft retracts toward the
   window, then extends back to the corner. Squash/stretch along the diagonal. ────── */
const telescope: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.72, 1.06, 1],
    transition: { duration: 0.7, ease: ARRIVE, times: [0, 0.4, 0.7, 1] },
  },
};
const TelescopeIcon = makeIcon(telescope, { arrowStyle: TAIL });

/* ── 5. TUCK — the arrow tucks down into the corner (shrink + slide), pops back, while
   the window flashes a highlight a beat later (secondary action). ────────────────── */
const tuck: Variants = {
  normal: { scale: 1, x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.92, 0.5, 1.05, 1],
    x: [0, 2, -6, 1, 0],
    y: [0, -2, 6, -1, 0],
    transition: { duration: 0.8, ease: ARRIVE, times: [0, 0.18, 0.5, 0.78, 1] },
  },
};
const tuckFrame: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: { opacity: [1, 0.5, 1], transition: { duration: 0.5, ease: "easeInOut", delay: staged(1, 0.06) } },
};
const TuckIcon = makeIcon(tuck, { arrowStyle: TIP, frame: tuckFrame });

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; blurb: string; Component: typeof PullInIcon }[] = [
  { name: "Pull-in", blurb: "Winds up, shoots into the corner, overshoots, settles", Component: PullInIcon },
  { name: "Minimize", blurb: "Shrinks into the corner and fades, then restores (loop)", Component: MinimizeIcon },
  { name: "Snap", blurb: "Springs into the corner; the window pulses a beat later", Component: SnapIcon },
  { name: "Telescope", blurb: "Shaft retracts toward the window, then extends to the corner", Component: TelescopeIcon },
  { name: "Tuck", blurb: "Shipped — tucks down into the corner while the window flashes", Component: TuckIcon },
];

export default function ArrowSquareInLabPage() {
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Arrow Square In — minimize motion</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 640 }}>
        Five takes on the pull-into-corner arrow — a winding pull-in, a looping minimize, a corner snap, a telescoping
        shaft, and a tuck with a window flash. The arrow animates toward the bottom-left corner; hover, focus, or watch
        them auto-cycle. Pick one to promote.
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
