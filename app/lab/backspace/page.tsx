"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/** Back-out overshoot — spring-like snap on multi-keyframe tweens. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/**
 * LAB — Backspace icon, 5 animation candidates.
 *
 * The Phosphor "backspace" glyph is a left-pointing key outline with an X
 * inside. Split for motion:
 *   BODY — the key outline, exactly the glyph's own outer + inner subpaths
 *          rendered even-odd (the original also carries a degenerate sliver
 *          subpath, dropped here).
 *   X    — the glyph's own filled cross, for variants that move it whole.
 *   X as strokes — the two arms redrawn as 16-wide round-capped lines
 *          ((112,104)→(160,152) and (160,104)→(112,152)) for variants that
 *          draw or move the arms independently.
 */
const BODY =
  "M216,40H68.53a16.08,16.08,0,0,0-13.72,7.77L9.14,123.88a8,8,0,0,0,0,8.24l45.67,76.11A16.08,16.08,0,0,0,68.53,216H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM216,200H68.53l-43.2-72,43.2-72H216Z";
const X =
  "M106.34,146.34,124.69,128l-18.35-18.34a8,8,0,0,1,11.32-11.32L136,116.69l18.34-18.35a8,8,0,0,1,11.32,11.32L147.31,128l18.35,18.34a8,8,0,0,1-11.32,11.32L136,139.31l-18.34,18.35a8,8,0,0,1-11.32-11.32Z";
const ARM_A = "M112,104L160,152";
const ARM_B = "M160,104L112,152";

/* Transform origins (view-box fractions of 256). */
const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const X_CENTER = AT(136, 128);
const KEY_CENTER = AT(120.5, 128);

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

const Arm = motion.path;

/* ── 1. PRESS ────────────────────────────────────────────────────────────────
   The key gets hit: a quick squash toward its center with a leftward shove —
   the direction backspace moves the caret — then springs back. */
const press: Variants = {
  normal: { scale: 1, x: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.88, 1.05, 1],
    x: [0, -8, 1, 0],
    transition: { duration: 0.5, ease: OVERSHOOT, times: [0, 0.35, 0.7, 1] },
  },
};

const BackspacePressIcon = forwardRef<IconHandle, IconProps>(
  function BackspacePressIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : press} style={KEY_CENTER}>
            <path d={BODY} fillRule="evenodd" />
            <path d={X} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. NUDGE ────────────────────────────────────────────────────────────────
   The whole key lunges left and glides back — the caret being walked backward
   — while the X lags a beat behind inside the body (soft contents). */
const nudgeBody: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -14, 2, 0],
    transition: { duration: 0.6, ease: SWEEP, times: [0, 0.4, 0.8, 1] },
  },
};
const nudgeX: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 7, -2, 0],
    transition: { duration: 0.6, ease: "easeOut", times: [0, 0.45, 0.8, 1] },
  },
};

const BackspaceNudgeIcon = forwardRef<IconHandle, IconProps>(
  function BackspaceNudgeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : nudgeBody}>
            <path d={BODY} fillRule="evenodd" />
            <motion.path d={X} variants={reduced ? undefined : nudgeX} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. POOF ─────────────────────────────────────────────────────────────────
   A character gets deleted: the X shrinks to nothing with a twist, beat, then
   pops back in ready for the next one. */
const poof: Variants = {
  normal: { scale: 1, rotate: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0, 0, 1.18, 1],
    rotate: [0, -90, -90, 8, 0],
    opacity: [1, 0, 0, 1, 1],
    transition: { duration: 0.8, ease: ARRIVE, times: [0, 0.3, 0.45, 0.75, 1] },
  },
};

const BackspacePoofIcon = forwardRef<IconHandle, IconProps>(
  function BackspacePoofIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={BODY} fillRule="evenodd" />
          <motion.path d={X} variants={reduced ? undefined : poof} style={X_CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 4. STRIKE ───────────────────────────────────────────────────────────────
   The X strikes itself out: both arms wipe away, then redraw as two quick
   slashes — first one diagonal, then the other. */
const STRIKE_DUR = 0.28;
const strikeArmA: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: STRIKE_DUR, ease: SWEEP, delay: 0.12 },
  },
};
const strikeArmB: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: STRIKE_DUR, ease: SWEEP, delay: 0.12 + STRIKE_DUR },
  },
};

const BackspaceStrikeIcon = forwardRef<IconHandle, IconProps>(
  function BackspaceStrikeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={BODY} fillRule="evenodd" />
          <Arm
            d={ARM_A}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            variants={reduced ? undefined : strikeArmA}
          />
          <Arm
            d={ARM_B}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            variants={reduced ? undefined : strikeArmB}
          />
        </Svg>
      </div>
    );
  },
);

/* ── 5. SHAKE ────────────────────────────────────────────────────────────────
   "Nope." — the X shakes its head at what you typed, a tight decaying wobble
   while the key holds still. */
const shake: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -16, 13, -9, 5, -2, 0],
    transition: { duration: 0.7, ease: "easeOut", times: [0, 0.15, 0.32, 0.5, 0.68, 0.85, 1] },
  },
};

const BackspaceShakeIcon = forwardRef<IconHandle, IconProps>(
  function BackspaceShakeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={BODY} fillRule="evenodd" />
          <motion.path d={X} variants={reduced ? undefined : shake} style={X_CENTER} />
        </Svg>
      </div>
    );
  },
);

/* ── 6. PRESS + STRIKE ───────────────────────────────────────────────────────
   The full keystroke: the key squashes with its leftward shove, and as it
   rebounds the X re-carves itself — two quick slashes landing right as the
   key settles. */
const comboKey: Variants = {
  normal: { scale: 1, x: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.88, 1.05, 1],
    x: [0, -8, 1, 0],
    transition: { duration: 0.5, ease: OVERSHOOT, times: [0, 0.35, 0.7, 1] },
  },
};
// Arms start wiped and redraw while the key rebounds from the squash.
const COMBO_ARM_DUR = 0.24;
const comboArmA: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: COMBO_ARM_DUR, ease: SWEEP, delay: 0.2 },
  },
};
const comboArmB: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: { duration: COMBO_ARM_DUR, ease: SWEEP, delay: 0.2 + COMBO_ARM_DUR },
  },
};

const BackspacePressStrikeIcon = forwardRef<IconHandle, IconProps>(
  function BackspacePressStrikeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : comboKey} style={KEY_CENTER}>
            <path d={BODY} fillRule="evenodd" />
            <Arm
              d={ARM_A}
              fill="none"
              stroke="currentColor"
              strokeWidth={16}
              strokeLinecap="round"
              variants={reduced ? undefined : comboArmA}
            />
            <Arm
              d={ARM_B}
              fill="none"
              stroke="currentColor"
              strokeWidth={16}
              strokeLinecap="round"
              variants={reduced ? undefined : comboArmB}
            />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 7. NUDGE + STRIKE ───────────────────────────────────────────────────────
   Delete-and-erase: the key lunges left as if swallowing a character, the X
   wipes out during the lunge, then re-slashes itself in as the key glides
   back to rest. */
const nsKey: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -14, 2, 0],
    transition: { duration: 0.6, ease: SWEEP, times: [0, 0.4, 0.8, 1] },
  },
};
// Arms vanish instantly at the start of the lunge, then redraw one after the
// other while the key returns.
const NS_ARM_DUR = 0.22;
const nsArmA: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1],
    opacity: [0, 0, 1],
    transition: { duration: 0.24 + NS_ARM_DUR, ease: SWEEP, times: [0, 0.24 / (0.24 + NS_ARM_DUR), 1] },
  },
};
const nsArmB: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 0, 1],
    opacity: [0, 0, 1],
    transition: {
      duration: 0.24 + NS_ARM_DUR * 2,
      ease: SWEEP,
      times: [0, (0.24 + NS_ARM_DUR) / (0.24 + NS_ARM_DUR * 2), 1],
    },
  },
};

const BackspaceNudgeStrikeIcon = forwardRef<IconHandle, IconProps>(
  function BackspaceNudgeStrikeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : nsKey}>
            <path d={BODY} fillRule="evenodd" />
            <Arm
              d={ARM_A}
              fill="none"
              stroke="currentColor"
              strokeWidth={16}
              strokeLinecap="round"
              variants={reduced ? undefined : nsArmA}
            />
            <Arm
              d={ARM_B}
              fill="none"
              stroke="currentColor"
              strokeWidth={16}
              strokeLinecap="round"
              variants={reduced ? undefined : nsArmB}
            />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BackspacePressIcon }[] = [
  { name: "Press", blurb: "Key squashes with a leftward shove", Component: BackspacePressIcon },
  { name: "Nudge", blurb: "Key lunges left, X lags inside", Component: BackspaceNudgeIcon },
  { name: "Poof", blurb: "X twists out — deleted — then pops back", Component: BackspacePoofIcon },
  { name: "Strike", blurb: "X redraws as two quick slashes", Component: BackspaceStrikeIcon },
  { name: "Shake", blurb: "X shakes its head — nope", Component: BackspaceShakeIcon },
  { name: "Press + Strike", blurb: "Key squashes, X re-carves on the rebound", Component: BackspacePressStrikeIcon },
  { name: "Nudge + Strike", blurb: "Key lunges left, X wipes & re-slashes on the way back", Component: BackspaceNudgeStrikeIcon },
];

export default function BackspaceLabPage() {
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Backspace — animation candidates</h1>
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
