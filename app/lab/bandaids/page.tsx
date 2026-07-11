"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/** Back-out overshoot — spring-like snap on multi-keyframe tweens. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/**
 * LAB — Band-aids icon, 5 animation candidates.
 *
 * The Phosphor "bandaids" glyph is two crossed plasters with a dot at the
 * overlap. Split for motion:
 *   CROSS — the crossed strips (outline + pad interiors + center diamond),
 *           the glyph's own subpaths untouched.
 *   DOT   — the r12 center dot, the glyph's own subpath untouched.
 * CROSS + DOT is byte-identical to the original path.
 */
const CROSS =
  "M184.57,128l27.71-27.72a40,40,0,1,0-56.56-56.56L128,71.43,100.28,43.72a40,40,0,1,0-56.56,56.56L71.43,128,43.72,155.72a40,40,0,1,0,56.56,56.56L128,184.57l27.72,27.71a40,40,0,1,0,56.56-56.56ZM167,55A24,24,0,1,1,201,89l-27.72,27.72L139.31,82.75Zm-5.09,73L128,161.94,94.06,128,128,94.06ZM55,89h0A24,24,0,1,1,89,55l27.72,27.72L82.75,116.69ZM89,201A24,24,0,1,1,55,167l27.72-27.72,33.94,33.94Zm112,0A24,24,0,0,1,167,201l-27.72-27.72,33.94-33.94L201,167A24,24,0,0,1,201,201Z";
const DOT = "M116,128a12,12,0,1,1,12,12A12,12,0,0,1,116,128Z";

/* Transform origins (view-box fractions of 256). */
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

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

/* ── 1. APPLY ────────────────────────────────────────────────────────────────
   Slapped onto the scrape: the cross arrives from slightly above at 115%,
   presses down past rest, and settles — a fresh plaster going on. */
const apply: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1.18, 0.94, 1.04, 1],
    transition: { duration: 0.5, ease: "easeOut", times: [0, 0.45, 0.75, 1] },
  },
};

const BandaidsApplyIcon = forwardRef<IconHandle, IconProps>(
  function BandaidsApplyIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : apply} style={CENTER}>
            <path d={CROSS} />
            <path d={DOT} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. WIGGLE ───────────────────────────────────────────────────────────────
   Freshly stuck and checked: the cross twists side to side about its center
   in a tight decaying wobble — is it on right? */
const wiggle: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -11, 9, -6, 3, 0],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.2, 0.42, 0.64, 0.84, 1] },
  },
};

const BandaidsWiggleIcon = forwardRef<IconHandle, IconProps>(
  function BandaidsWiggleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : wiggle} style={CENTER}>
            <path d={CROSS} />
            <path d={DOT} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. PULSE ────────────────────────────────────────────────────────────────
   Healing heartbeat: the center dot beats twice — lub-dub — while the cross
   holds still. */
const pulse: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.7, 1, 1.5, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.2, 0.45, 0.65, 1] },
  },
};

const BandaidsPulseIcon = forwardRef<IconHandle, IconProps>(
  function BandaidsPulseIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={CROSS} />
          <motion.path d={DOT} variants={reduced ? undefined : pulse} style={CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. FLEX ─────────────────────────────────────────────────────────────────
   Stretchy fabric: the cross squashes and stretches on alternating axes — a
   plaster flexing with the skin. */
const flex: Variants = {
  normal: { scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 1.09, 0.94, 1.04, 1],
    scaleY: [1, 0.94, 1.09, 0.97, 1],
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
};

const BandaidsFlexIcon = forwardRef<IconHandle, IconProps>(
  function BandaidsFlexIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : flex} style={CENTER}>
            <path d={CROSS} />
            <path d={DOT} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. SPIN ─────────────────────────────────────────────────────────────────
   The cross has 90° symmetry, so a quarter-turn snap with overshoot lands
   back on itself — a crisp, satisfying twirl. */
const spin: Variants = {
  normal: { rotate: 0, transition: { duration: 0 } },
  animate: {
    rotate: [0, 90],
    transition: { duration: 0.55, ease: OVERSHOOT },
  },
};

const BandaidsSpinIcon = forwardRef<IconHandle, IconProps>(
  function BandaidsSpinIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : spin} style={CENTER}>
            <path d={CROSS} />
            <path d={DOT} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 6. RE-DRESS (from band-aid.mp4) ─────────────────────────────────────────
   Changing the dressing: the cross peels away leaving a single plaster on the
   NE–SW diagonal, the lone strip wiggles, then the fresh cross slaps back on
   and presses to a settle.

   The lone strip is a capsule ring on the glyph's own pad geometry: cap
   centers (72,184) and (184,72), outer r40 / inner r24 — the same radii as
   the cross's pads, so the swap reads as the same plaster. */
const STRIP =
  "M100.28,212.28,212.28,100.28a40,40,0,0,0-56.56-56.56L43.72,155.72a40,40,0,0,0,56.56,56.56Z" +
  "M88.97,200.97a24,24,0,0,1-33.94-33.94l112-112a24,24,0,0,1,33.94,33.94Z";
// Swoosh motion-lines flanking the plaster (as in the reference clip) — two
// arcs hugging the glyph, hidden at rest.
const SWOOSH_L = "M52,56A104,104,0,0,0,28,128";
const SWOOSH_R = "M204,200A104,104,0,0,0,228,128";
const RD_DUR = 1.7;
const rdCross: Variants = {
  normal: { opacity: 1, scale: 1, rotate: 0, skewX: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 0, 0, 1, 1, 1, 1],
    scale: [1, 1.16, 1.16, 1.22, 0.95, 1.02, 1],
    rotate: [0, 6, 6, 6, -3, 1, 0],
    // soft bend as it slaps down, flexing straight through the settle
    skewX: [0, 0, 0, -7, 5, -2, 0],
    transition: { duration: RD_DUR, ease: "easeOut", times: [0, 0.16, 0.5, 0.52, 0.68, 0.84, 1] },
  },
};
const rdStrip: Variants = {
  normal: { opacity: 0, rotate: 0, skewX: 0, transition: { duration: 0.1 } },
  animate: {
    opacity: [0, 1, 1, 0, 0],
    rotate: [0, -5, 3, 0, 0],
    // the lone plaster bends like soft fabric as it wiggles
    skewX: [0, -8, 5, 0, 0],
    transition: { duration: RD_DUR, ease: "easeInOut", times: [0, 0.16, 0.44, 0.52, 1] },
  },
};
const rdSwoosh: Variants = {
  normal: { opacity: 0, pathLength: 1, transition: { duration: 0.1 } },
  animate: {
    // draw in while the strip is alone, flash again on the slap, gone by settle
    opacity: [0, 1, 1, 0.3, 1, 0, 0],
    pathLength: [0.2, 1, 1, 1, 1, 1, 1],
    transition: { duration: RD_DUR, ease: "easeOut", times: [0, 0.2, 0.42, 0.5, 0.6, 0.82, 1] },
  },
};

const BandaidsRedressIcon = forwardRef<IconHandle, IconProps>(
  function BandaidsRedressIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* Swoosh motion-lines — hidden at rest, flanking the action. */}
          <motion.path
            d={SWOOSH_L}
            fill="none"
            stroke="currentColor"
            strokeWidth={10}
            strokeLinecap="round"
            variants={reduced ? undefined : rdSwoosh}
            style={{ opacity: 0 }}
          />
          <motion.path
            d={SWOOSH_R}
            fill="none"
            stroke="currentColor"
            strokeWidth={10}
            strokeLinecap="round"
            variants={reduced ? undefined : rdSwoosh}
            style={{ opacity: 0 }}
          />
          {/* Lone strip — hidden at rest, revealed while the cross is away. */}
          <motion.path
            d={STRIP}
            fillRule="evenodd"
            variants={reduced ? undefined : rdStrip}
            style={{ ...CENTER, opacity: 0 }}
          />
          <motion.g variants={reduced ? undefined : rdCross} style={CENTER}>
            <path d={CROSS} />
            <path d={DOT} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 7. PULSE + FLEX + SPIN ──────────────────────────────────────────────────
   The full check-up in one gesture: the cross quarter-spins onto its own
   symmetry, flexes through a squash-and-stretch as it lands, and the center
   dot answers with a lub-dub heartbeat once everything is still. */
const PFS_DUR = 1.5;
const pfsCross: Variants = {
  normal: { rotate: 0, scaleX: 1, scaleY: 1, transition: { duration: 0 } },
  animate: {
    // spin (0–40%) → flex on landing (40–70%) → hold while the dot beats
    rotate: [0, 90, 90, 90, 90],
    scaleX: [1, 1, 1.09, 0.96, 1],
    scaleY: [1, 1, 0.92, 1.05, 1],
    transition: { duration: PFS_DUR, ease: "easeInOut", times: [0, 0.4, 0.52, 0.64, 0.78] },
  },
};
const pfsDot: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    // still through the spin/flex, then lub-dub
    scale: [1, 1, 1.7, 1, 1.45, 1],
    transition: { duration: PFS_DUR, ease: "easeInOut", times: [0, 0.62, 0.74, 0.84, 0.92, 1] },
  },
};

const BandaidsCheckupIcon = forwardRef<IconHandle, IconProps>(
  function BandaidsCheckupIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : pfsCross} style={CENTER}>
            <path d={CROSS} />
            <motion.path d={DOT} variants={reduced ? undefined : pfsDot} style={CENTER} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BandaidsApplyIcon }[] = [
  { name: "Apply", blurb: "Slapped on from above, presses down, settles", Component: BandaidsApplyIcon },
  { name: "Wiggle", blurb: "Twists side to side — is it on right?", Component: BandaidsWiggleIcon },
  { name: "Pulse", blurb: "Center dot beats lub-dub — healing", Component: BandaidsPulseIcon },
  { name: "Flex", blurb: "Squash & stretch — flexing with the skin", Component: BandaidsFlexIcon },
  { name: "Spin", blurb: "Quarter-turn snap onto its own symmetry", Component: BandaidsSpinIcon },
  { name: "Re-dress", blurb: "Peels to a lone strip, fresh cross slaps back (band-aid.mp4)", Component: BandaidsRedressIcon },
  { name: "Check-up", blurb: "Quarter-spin, flex on landing, dot beats lub-dub", Component: BandaidsCheckupIcon },
];

export default function BandaidsLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  // Each remains fully hover/focus-interactive too.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1400);
    };
    cycle();
    const id = window.setInterval(cycle, 2600);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Band-aids — animation candidates</h1>
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
