"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/** Back-out overshoot — spring-like snap on multi-keyframe tweens. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/**
 * LAB — Barricade icon, 5 animation candidates (escalating). In every one the
 * diagonal stripes MARCH across the panel (per the barrier.mp4 reference).
 *
 * The Phosphor "barricade" glyph is rebuilt so the stripes are real strokes:
 *   FRAME   — the panel outline as an even-odd ring (16 thick).
 *   STRIPES — the glyph's black diagonals are 16-wide 45° strokes along
 *             x − y = c for c ∈ {−60, 12, 84} (period 72), clipped to the
 *             panel interior. Translating the group x by one period (72)
 *             loops seamlessly — extra stripes are stacked on each side.
 *   LEGS    — two 16-wide round-capped strokes (x64/x192, y168–208).
 * Rest state reproduces the original glyph 1:1.
 */
const FRAME =
  "M224,64H32A16,16,0,0,0,16,80v72a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V80A16,16,0,0,0,224,64ZM224,152H32V80H224Z";
const STRIPE_CS = [-204, -132, -60, 12, 84]; // two extra periods left for the march
const stripe = (c: number) => `M${c + 40},40L${c + 216},216`;
const LEG_L = "M64,168v32";
const LEG_R = "M192,168v32";
const MARCH_PERIOD = 72;

/* Transform origins (view-box fractions of 256). */
const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const GROUND = AT(128, 208); // where the legs meet the road
const BOARD_BASE = AT(128, 168); // bottom edge of the panel

/* Marching stripes — one full period per cycle, so the loop is seamless. */
const march: Variants = {
  normal: { x: 0, transition: { duration: 0.25 } },
  animate: {
    x: [0, MARCH_PERIOD],
    transition: { duration: 1.1, ease: "linear" },
  },
};

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

/** The striped board: frame + clipped marching stripes. */
function Board({ animateStripes }: { animateStripes: boolean }) {
  const clipId = useId();
  return (
    <>
      <path d={FRAME} fillRule="evenodd" />
      <clipPath id={clipId}>
        <rect x={32} y={80} width={192} height={72} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <motion.g variants={animateStripes ? march : undefined}>
          {STRIPE_CS.map((c) => (
            <path key={c} d={stripe(c)} fill="none" stroke="currentColor" strokeWidth={16} />
          ))}
        </motion.g>
      </g>
    </>
  );
}

function Legs({ variants }: { variants?: Variants }) {
  return (
    <>
      <motion.path
        d={LEG_L}
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        variants={variants}
        style={AT(64, 168)}
      />
      <motion.path
        d={LEG_R}
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        variants={variants}
        style={AT(192, 168)}
      />
    </>
  );
}

/* ── 1. MARCH ────────────────────────────────────────────────────────────────
   The baseline from the reference: the hazard stripes flow steadily across
   the panel — the barricade is live. */
const BarricadeMarchIcon = forwardRef<IconHandle, IconProps>(
  function BarricadeMarchIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <Board animateStripes={!reduced} />
          <Legs />
        </Svg>
      </div>
    );
  },
);

/* ── 2. PLANT ────────────────────────────────────────────────────────────────
   Set down on the road: drops in, lands with a firm grounded squash, and the
   stripes start marching the moment it touches down. */
const plant: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, 0, 0],
    scaleY: [1, 1.02, 0.93, 1],
    transition: { duration: 0.55, ease: OVERSHOOT, times: [0, 0.3, 0.6, 1] },
  },
};

const BarricadePlantIcon = forwardRef<IconHandle, IconProps>(
  function BarricadePlantIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : plant} style={GROUND}>
            <Board animateStripes={!reduced} />
            <Legs />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. GUST ─────────────────────────────────────────────────────────────────
   A truck blows past: the panel rocks on its legs while the stripes stream —
   the wake and the traffic flow in one read. */
const gust: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -4, 3.2, -2, 1, 0],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.2, 0.42, 0.64, 0.84, 1] },
  },
};

const BarricadeGustIcon = forwardRef<IconHandle, IconProps>(
  function BarricadeGustIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : gust} style={GROUND}>
            <Board animateStripes={!reduced} />
          </motion.g>
          <Legs />
        </Svg>
      </div>
    );
  },
);

/* ── 4. DEPLOY ───────────────────────────────────────────────────────────────
   Sets itself up: legs telescope down, the panel unfolds upward with an
   overshoot, and the stripes start streaming as soon as it opens. */
const deployLegs: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 1],
    transition: { duration: 0.25, ease: SWEEP },
  },
};
const deployPanel: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 1.08, 1],
    transition: { duration: 0.45, ease: OVERSHOOT, times: [0, 0.7, 1], delay: 0.22 },
  },
};

const BarricadeDeployIcon = forwardRef<IconHandle, IconProps>(
  function BarricadeDeployIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : deployPanel} style={BOARD_BASE}>
            <Board animateStripes={!reduced} />
          </motion.g>
          <Legs variants={reduced ? undefined : deployLegs} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. ROADBLOCK ────────────────────────────────────────────────────────────
   The full closure: legs telescope down, the panel unfolds, the stripes
   stream, a double caution blink, and a firm settle stamp — road closed. */
const RB = 1.9;
const rbLegs: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 1, 1],
    transition: { duration: RB, ease: SWEEP, times: [0, 0.12, 1] },
  },
};
const rbPanel: Variants = {
  normal: { scaleY: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 1.08, 1, 1, 1, 1, 1, 0.95, 1],
    opacity: [1, 1, 1, 0.3, 1, 0.3, 1, 1, 1],
    transition: {
      duration: RB,
      ease: "easeInOut",
      times: [0, 0.18, 0.25, 0.34, 0.43, 0.52, 0.61, 0.75, 0.88],
    },
  },
};
const rbAll: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 0, 3, 0],
    transition: { duration: RB, ease: "easeOut", times: [0, 0.68, 0.78, 0.9] },
  },
};

const BarricadeRoadblockIcon = forwardRef<IconHandle, IconProps>(
  function BarricadeRoadblockIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : rbAll} style={GROUND}>
            <motion.g variants={reduced ? undefined : rbPanel} style={BOARD_BASE}>
              <Board animateStripes={!reduced} />
            </motion.g>
            <Legs variants={reduced ? undefined : rbLegs} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BarricadeMarchIcon }[] = [
  { name: "March", blurb: "Hazard stripes flow across the panel (barrier.mp4)", Component: BarricadeMarchIcon },
  { name: "Plant", blurb: "Drops in with a grounded squash, stripes start streaming", Component: BarricadePlantIcon },
  { name: "Gust", blurb: "Panel rocks in a truck's wake while stripes stream", Component: BarricadeGustIcon },
  { name: "Deploy", blurb: "Legs telescope down, panel unfolds, stripes flow", Component: BarricadeDeployIcon },
  { name: "Roadblock", blurb: "Deploy + streaming stripes + caution strobe + settle", Component: BarricadeRoadblockIcon },
];

export default function BarricadeLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  // Each remains fully hover/focus-interactive too.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 2100);
    };
    cycle();
    const id = window.setInterval(cycle, 3400);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Barricade — animation candidates</h1>
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
