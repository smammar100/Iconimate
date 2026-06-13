import type { Transition, Variants } from "motion/react";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";

export interface UseHoverScalePopOptions {
  /** Peak scale. */
  scale?: number;
  /** Anticipation dip before the pop. */
  dip?: number;
  transition?: Transition;
}

/** Pop with an anticipation dip, then a settle back to rest. Three keyframes ⇒ tween, not spring. */
export function useHoverScalePop(options: UseHoverScalePopOptions = {}): Variants {
  const { scale = 1.18, dip = 0.92, transition = { duration: 0.5, ease: ARRIVE } } = options;
  return {
    normal: { scale: 1, transition: RETURN_TRANSITION },
    animate: { scale: [1, dip, scale, 1], transition },
  };
}
