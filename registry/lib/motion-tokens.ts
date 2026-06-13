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
