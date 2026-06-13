import type { Transition, Variants } from "motion/react";
import { SWEEP, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";

export interface UseHoverTranslateOptions {
  /** Travel distance on X, in viewBox / user units. */
  x?: number;
  /** Travel distance on Y, in viewBox / user units. */
  y?: number;
  /** Small recoil opposite the travel before moving — anticipation. */
  anticipate?: boolean;
  transition?: Transition;
}

/** Directional travel with optional anticipation recoil. Pairs well with bankStreak speed-lines. */
export function useHoverTranslate(options: UseHoverTranslateOptions = {}): Variants {
  const { x = 0, y = 0, anticipate = true, transition = { duration: DUR.base, ease: SWEEP } } = options;
  const xs = anticipate ? [0, x * -0.18, x] : [0, x];
  const ys = anticipate ? [0, y * -0.18, y] : [0, y];
  return {
    normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
    animate: { x: xs, y: ys, transition },
  };
}
