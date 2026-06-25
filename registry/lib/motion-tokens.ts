import type { Transition } from "motion/react";

/**
 * The shared motion dialect for Iconimate. Every icon and primitive imports from
 * here so the whole set speaks one language: the same curves, the same springs,
 * the same glide-home. This module is pure (no "use client"), so it's importable
 * from both server and client components.
 */

/** A cubic-bezier easing curve. */
export type Bezier = [number, number, number, number];

/** Confident in/out for travels — slides and sweeps across the artboard. */
export const SWEEP: Bezier = [0.65, 0, 0.35, 1];
/** Decelerate-to-rest with an expo-out tail — things landing / arriving. */
export const ARRIVE: Bezier = [0.16, 1, 0.3, 1];
/** Gentle standard glide — used by every "normal" variant for hover-out. */
export const RETURN: Bezier = [0.4, 0, 0.2, 1];

/** Quick pop with a little overshoot — squash, scale-in, taps. */
export const springPop: Transition = { type: "spring", stiffness: 520, damping: 17, mass: 0.7 };
/** Pendulum swing — bells, hanging things, flips. */
export const springSwing: Transition = { type: "spring", stiffness: 260, damping: 13, mass: 0.9 };
/** Settles with visible mass — the body of a heavier object coming to rest. */
export const springSettle: Transition = { type: "spring", stiffness: 180, damping: 20, mass: 1 };
/** Soft, low-energy ease into place — subtle nudges. */
export const springSoft: Transition = { type: "spring", stiffness: 140, damping: 18, mass: 1 };

/** Duration scale in seconds, calibrated for legibility at the 24px ship size. */
export const DUR = { instant: 0.12, fast: 0.2, base: 0.32, slow: 0.5 } as const;

/**
 * The canonical hover-out transition. Spread into every "normal" variant so that
 * interrupting a hover glides the icon home instead of snapping.
 */
export const RETURN_TRANSITION: Transition = { duration: DUR.base, ease: RETURN };

/* ─────────────────────────────────────────────────────────────────────────────
 * Principle helpers — shared vocabulary for Disney's 12 principles. See MOTION.md.
 * Additive only; pure data/factories (server-safe). Reach for these instead of
 * inlining magic numbers so the whole set speaks one language.
 * ───────────────────────────────────────────────────────────────────────────── */

/** Exaggeration — an ease that overshoots its target then eases back. For a single
 *  pop/snap with character (anticipation lives in the leading keyframe, not here). */
export const OVERSHOOT_BACK: Bezier = [0.34, 1.56, 0.64, 1];

/** Anticipation — the canonical "wind-up" scale dip taken just before a pop. A glyph
 *  that scales to 1 dips to this first, so the action reads as deliberate, not abrupt. */
export const ANTICIPATE_DIP = 0.92;

/** Squash & stretch (Timing) — shared keyframe schedule for a squash→stretch→settle
 *  arc. Pair with `squashStretch()` on a single anchored scale axis. */
export const SQUASH_TIMES = [0, 0.18, 0.46, 0.66, 0.84, 1] as const;

/**
 * Squash & stretch — keyframes for one anchored scale axis (scaleX or scaleY):
 * rest → squash → stretch (overshoot) → recoil → small overshoot → settle. Keep the
 * artwork's volume believable by anchoring the opposite edge via `transformOrigin`.
 * Use with `SQUASH_TIMES`.
 */
export function squashStretch({ squash = 0.86, stretch = 1.12 } = {}): number[] {
  return [1, squash, stretch, 0.96, 1.02, 1];
}

/**
 * Appeal + Anticipation — a ready "pop in" with a wind-up dip and an overshoot peak.
 * Returns a variant `animate` body; spread it and add your own `normal` rest state.
 * The dip (`ANTICIPATE_DIP`) is the anticipation; the peak past 1 is the exaggeration.
 */
export function popIn({ dip = ANTICIPATE_DIP, peak = 1.18, duration = DUR.slow }: {
  dip?: number;
  peak?: number;
  duration?: number;
} = {}): { scale: number[]; transition: Transition } {
  return {
    scale: [1, dip, peak, 1],
    transition: { duration, ease: ARRIVE, times: [0, 0.25, 0.6, 1] },
  };
}

/** Staging / Overlapping action — the per-element delay for a staggered cascade.
 *  Give sibling parts `transition: { delay: staged(i) }` so they lead/trail in turn. */
export function staged(index: number, step = 0.09): number {
  return index * step;
}

/**
 * Arcs + Secondary action (Timing) — the shared cadence for the **scroll** family
 * (arrow-circle/square-*). The inner arrow rides a wheel: it enters small/faint
 * behind, peaks full at centre, then shrinks/fades ahead — scale & opacity track
 * travel as secondary action. The ease is deliberately a symmetric `easeInOut`
 * (NOT SWEEP/ARRIVE): the glyph slows into frame and out of frame equally, so no
 * single edge of the loop is favoured. `times: [0, 0.5, 1]` keeps centre the peak;
 * the short `repeatDelay` gives a measured "tick" between cycles rather than a blur.
 */
export const SCROLL_LOOP: Transition = {
  duration: 1.15,
  ease: "easeInOut",
  times: [0, 0.5, 1],
  repeat: Infinity,
  repeatDelay: 0.05,
};

/**
 * Plunge (arrow-fat-*) — Squash & stretch + Anticipation + Follow-through on one
 * anchored axis (scaleX or scaleY against the tail edge). rest → coil (anticipation
 * wind-up, 0.86) → plunge (peak 1.07 — capped so the leading tip lands right at the
 * frame edge, never past it) → recoil → small overshoot → settle. The slow 0.9s
 * timing lets the elongation read as deliberate mass. Pair with a tail-edge anchor.
 * Do not change the numbers — the 1.07 peak is the in-frame cap.
 */
export const PLUNGE_KEYS = [1, 0.86, 1.07, 0.97, 1.02, 1] as const;
export const PLUNGE_TRANSITION: Transition = {
  duration: 0.9,
  ease: "easeInOut",
  times: [0, 0.18, 0.48, 0.68, 0.84, 1],
};

/**
 * Snap (arrow-bend-*) — the underdamped self-draw spring. Anticipation lives in the
 * from-zero start, Exaggeration in the head's overshoot past the tip, Follow-through
 * in the settle. Low damping (7) gives the bouncy single overshoot; the head shoots
 * past by a fraction of the raw overshoot (OVERSHOOT_SCALE, per icon) to stay in frame.
 * Do not change stiffness/damping — they keep the head inside the viewBox.
 */
export const SNAP_DRAW_SPRING: Transition = { type: "spring", stiffness: 70, damping: 7, mass: 1 };
/** Snap hover-out — retrace home to the fully-drawn rest pose (Slow in & out). */
export const SNAP_RETURN: Transition = { duration: 0.3, ease: "easeOut" };
