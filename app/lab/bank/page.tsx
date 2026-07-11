"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/** Back-out overshoot — spring-like snap on multi-keyframe tweens. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/**
 * LAB — Bank icon, 5 animation candidates.
 *
 * The Phosphor "bank" glyph is a Greek temple: pediment, four columns, the
 * entablature beam, and a ground slab. Rebuilt from primitives that match
 * the original 1:1 so every architectural piece can move on its own:
 *   PEDIMENT — roof band with its inner triangle punched even-odd.
 *   COLUMNS  — four plain 16×64 rects (x48/96/144/192, y104–168).
 *   BEAM     — the rounded entablature bar (y168–184).
 *   GROUND   — the glyph's own rounded ground slab subpath (y200–216).
 */
const PEDIMENT =
  "M232,104H24a8,8,0,0,1-4.19-14.81l104-64a8,8,0,0,1,8.38,0l104,64A8,8,0,0,1,232,104ZM52.26,88H203.74L128,41.39Z";
const COLUMNS = ["M48,104h16v64H48Z", "M96,104h16v64H96Z", "M144,104h16v64H144Z", "M192,104h16v64H192Z"];
const BEAM = "M32,168H224a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16Z";
const GROUND = "M248,208a8,8,0,0,1-8,8H16a8,8,0,0,1,0-16H240A8,8,0,0,1,248,208Z";

/* Transform origins (view-box fractions of 256). */
const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const FOUNDATION = AT(128, 208); // the ground slab
const ROOFLINE = AT(128, 104); // base of the pediment
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

/** Static full glyph from parts. */
function Parts() {
  return (
    <>
      <path d={PEDIMENT} fillRule="evenodd" />
      {COLUMNS.map((d) => (
        <path key={d} d={d} />
      ))}
      <path d={BEAM} />
      <path d={GROUND} />
    </>
  );
}

/* ── 1. CONSTRUCT ────────────────────────────────────────────────────────────
   The bank builds itself: the ground slab lays down, the four columns rise
   from it left to right, the beam settles across them, and the pediment
   lands last with a soft overshoot. */
const CON = 1.6;
const conGround: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: { scaleX: [0, 1], transition: { duration: 0.28, ease: SWEEP } },
};
const conColumn = (i: number): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 1],
    transition: { duration: 0.3, ease: SWEEP, delay: 0.24 + i * 0.09 },
  },
});
const conBeam: Variants = {
  normal: { opacity: 1, y: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 1],
    y: [-14, 0],
    transition: { duration: 0.3, ease: ARRIVE, delay: 0.72 },
  },
};
const conPediment: Variants = {
  normal: { opacity: 1, y: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 1, 1],
    y: [-20, 2, 0],
    scale: [0.92, 1.02, 1],
    transition: { duration: 0.45, ease: ARRIVE, times: [0, 0.7, 1], delay: 1.0 },
  },
};

const BankConstructIcon = forwardRef<IconHandle, IconProps>(
  function BankConstructIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={GROUND} variants={reduced ? undefined : conGround} style={FOUNDATION} />
          {COLUMNS.map((d, i) => (
            <motion.path key={d} d={d} variants={reduced ? undefined : conColumn(i)} style={AT(56 + i * 48, 168)} />
          ))}
          <motion.path d={BEAM} variants={reduced ? undefined : conBeam} />
          <motion.path d={PEDIMENT} fillRule="evenodd" variants={reduced ? undefined : conPediment} style={ROOFLINE} />
        </Svg>
      </div>
    );
  },
);

/* ── 2. COLONNADE ────────────────────────────────────────────────────────────
   A wave rolls through the columns: each one dips and rebounds in sequence,
   the beam and pediment riding the swell just slightly. */
const colColumn = (i: number): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.82, 1.06, 1],
    transition: { duration: 0.5, ease: "easeInOut", times: [0, 0.4, 0.75, 1], delay: i * 0.1 },
  },
});
const colTop: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 3, -1, 0],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
  },
};

const BankColonnadeIcon = forwardRef<IconHandle, IconProps>(
  function BankColonnadeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : colTop}>
            <path d={PEDIMENT} fillRule="evenodd" />
          </motion.g>
          {COLUMNS.map((d, i) => (
            <motion.path key={d} d={d} variants={reduced ? undefined : colColumn(i)} style={AT(56 + i * 48, 168)} />
          ))}
          <path d={BEAM} />
          <path d={GROUND} />
        </Svg>
      </div>
    );
  },
);

/* ── 3. DEPOSIT ──────────────────────────────────────────────────────────────
   Weight lands in the vault: the temple presses down into the ground — the
   slab absorbing the load with a squash — then everything rebounds solid. */
const depTemple: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 7, -2, 0],
    scaleY: [1, 0.95, 1.02, 1],
    transition: { duration: 0.55, ease: OVERSHOOT, times: [0, 0.4, 0.75, 1] },
  },
};
const depGround: Variants = {
  normal: { scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.6, 1.15, 1],
    scaleX: [1, 1.04, 0.99, 1],
    transition: { duration: 0.55, ease: "easeOut", times: [0, 0.42, 0.75, 1] },
  },
};

const BankDepositIcon = forwardRef<IconHandle, IconProps>(
  function BankDepositIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : depTemple} style={AT(128, 168)}>
            <path d={PEDIMENT} fillRule="evenodd" />
            {COLUMNS.map((d) => (
              <path key={d} d={d} />
            ))}
            <path d={BEAM} />
          </motion.g>
          <motion.path d={GROUND} variants={reduced ? undefined : depGround} style={FOUNDATION} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. STEADFAST ────────────────────────────────────────────────────────────
   Tested and true: a quick tremor runs through the building — pediment
   lagging the base like a real structure — and it stands rock solid. */
const steadyBase: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -4, 3.5, -2.5, 1.5, 0],
    transition: { duration: 0.6, ease: "easeOut", times: [0, 0.18, 0.38, 0.6, 0.8, 1] },
  },
};
const steadyPediment: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 4, -3.5, 2.5, -1.5, 0],
    transition: { duration: 0.6, ease: "easeOut", times: [0, 0.22, 0.42, 0.64, 0.83, 1] },
  },
};

const BankSteadfastIcon = forwardRef<IconHandle, IconProps>(
  function BankSteadfastIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : steadyBase}>
            {COLUMNS.map((d) => (
              <path key={d} d={d} />
            ))}
            <path d={BEAM} />
            <motion.path d={PEDIMENT} fillRule="evenodd" variants={reduced ? undefined : steadyPediment} />
          </motion.g>
          <path d={GROUND} />
        </Svg>
      </div>
    );
  },
);

/* ── 5. RAISE ────────────────────────────────────────────────────────────────
   Good returns: the pediment lifts off the colonnade, hangs for a beat, and
   sets back down with a confident overshoot — raising the roof. */
const raise: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -12, -10, 1.5, 0],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.28, 0.55, 0.85, 1] },
  },
};
const raiseColumns: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1.03, 1, 0.98, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.3, 0.55, 0.85, 1] },
  },
};

const BankRaiseIcon = forwardRef<IconHandle, IconProps>(
  function BankRaiseIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={PEDIMENT} fillRule="evenodd" variants={reduced ? undefined : raise} />
          {COLUMNS.map((d) => (
            <motion.path key={d} d={d} variants={reduced ? undefined : raiseColumns} style={AT(128, 168)} />
          ))}
          <path d={BEAM} />
          <path d={GROUND} />
        </Svg>
      </div>
    );
  },
);

/* ── 6. CONSTRUCT + DOLLAR ───────────────────────────────────────────────────
   Same self-building sequence — slab, columns, beam, pediment — and once the
   last stone lands, a dollar sign pops into the central bay: open for
   business. Hidden at rest so the glyph stays exact. */
const DOLLAR_S =
  "M138.5,125.5c0-6-4.5-9.5-10.5-9.5s-10.5,3.5-10.5,8.5c0,11,21,8.5,21,19.5c0,5-4.5,8.5-10.5,8.5s-10.5-3.5-10.5-9.5";
const DOLLAR_BAR = "M128,108v52";
const conDollar: Variants = {
  normal: { scale: 0, opacity: 0, transition: { duration: 0.12 } },
  animate: {
    // pop in once the pediment lands, then HOLD — this keyframe is the longest
    // animation in the variant, so the hover-replay loop waits for it and the
    // dollar stays on screen for over a second each cycle.
    scale: [0, 1.25, 1, 1],
    opacity: [0, 1, 1, 1],
    transition: { duration: 1.3, ease: ARRIVE, times: [0, 0.16, 0.27, 1], delay: 1.45 },
  },
};

const BankConstructDollarIcon = forwardRef<IconHandle, IconProps>(
  function BankConstructDollarIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.path d={GROUND} variants={reduced ? undefined : conGround} style={FOUNDATION} />
          {COLUMNS.map((d, i) => (
            <motion.path key={d} d={d} variants={reduced ? undefined : conColumn(i)} style={AT(56 + i * 48, 168)} />
          ))}
          <motion.path d={BEAM} variants={reduced ? undefined : conBeam} />
          <motion.path d={PEDIMENT} fillRule="evenodd" variants={reduced ? undefined : conPediment} style={ROOFLINE} />
          {/* Dollar sign in the central bay — pops once the pediment has landed. */}
          <motion.g variants={reduced ? undefined : conDollar} style={AT(128, 134)}>
            <path d={DOLLAR_S} fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
            <path d={DOLLAR_BAR} fill="none" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BankConstructIcon }[] = [
  { name: "Construct", blurb: "Slab → columns rise in sequence → beam → pediment lands", Component: BankConstructIcon },
  { name: "Colonnade", blurb: "A wave rolls through the columns", Component: BankColonnadeIcon },
  { name: "Deposit", blurb: "Weight lands: temple presses in, ground absorbs", Component: BankDepositIcon },
  { name: "Steadfast", blurb: "A tremor runs through — it stands rock solid", Component: BankSteadfastIcon },
  { name: "Raise", blurb: "Pediment lifts off, hangs, sets back down", Component: BankRaiseIcon },
  { name: "Construct + $", blurb: "Builds itself, then a dollar pops in — open for business", Component: BankConstructDollarIcon },
];

export default function BankLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  // Each remains fully hover/focus-interactive too.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 2200);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Bank — animation candidates</h1>
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
