import type { Transition, Variants } from "motion/react";
import { ARRIVE, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";

export interface UseHoverPathTraceOptions {
  /** Continuous marching trace vs a single draw-on. */
  loop?: boolean;
  transition?: Transition;
}

/**
 * pathLength / pathOffset draw-on. The resting "normal" state is fully drawn
 * (pathLength 1); hovering re-traces the stroke. Apply to a `motion.path` (the
 * path needs a stroke for the trace to be visible).
 */
export function useHoverPathTrace(options: UseHoverPathTraceOptions = {}): Variants {
  const { loop = false, transition } = options;
  const base: Transition = transition ?? { duration: DUR.slow, ease: ARRIVE };
  return {
    normal: { pathLength: 1, pathOffset: 0, transition: RETURN_TRANSITION },
    animate: loop
      ? {
          pathLength: [0, 1],
          pathOffset: [0, 1],
          transition: { ...base, repeat: Infinity, repeatType: "loop", repeatDelay: 0.3 },
        }
      : { pathLength: [0, 1], pathOffset: [1, 0], transition: base },
  };
}
