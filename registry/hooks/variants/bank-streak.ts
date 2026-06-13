import type { Variants } from "motion/react";
import { SWEEP, DUR } from "@/lib/motion-tokens";

/**
 * Atmospheric speed-lines. Render 2–3 short strokes on a separate accent color
 * *behind* the subject, each with `custom={i}` for a staggered, looping streak
 * that flickers past as the subject moves. The empty `repeatDelay` gives the
 * motion an event-like cadence instead of a constant churn.
 *
 * @example
 * {[0, 1, 2].map((i) => (
 *   <motion.line key={i} custom={i} variants={bankStreak} stroke="var(--accent)" ... />
 * ))}
 */
export const bankStreak: Variants = {
  normal: { opacity: 0, x: -6, transition: { duration: DUR.fast, ease: SWEEP } },
  animate: (i: number) => ({
    opacity: [0, 0.9, 0],
    x: [-6, 10],
    transition: { duration: DUR.base, ease: SWEEP, delay: i * 0.06, repeat: Infinity, repeatDelay: 0.4 },
  }),
};
