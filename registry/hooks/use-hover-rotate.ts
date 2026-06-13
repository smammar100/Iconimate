import type { Transition, Variants } from "motion/react";
import { ARRIVE, springSettle, RETURN_TRANSITION } from "@/lib/motion-tokens";

export interface UseHoverRotateOptions {
  /** Peak rotation in degrees. */
  angle?: number;
  /** Damped there-and-back (settles to 0) vs a single move that settles at `angle`. */
  damped?: boolean;
  transition?: Transition;
}

/**
 * 2D rotation with a diminishing-amplitude settle — wobbles, ticks, gentle turns.
 * The damped form is a multi-keyframe tween; the single-move form can spring (two keyframes).
 */
export function useHoverRotate(options: UseHoverRotateOptions = {}): Variants {
  const { angle = 12, damped = true, transition } = options;
  const peak = damped ? [0, angle, -angle * 0.5, angle * 0.2, 0] : angle;
  const tx: Transition = transition ?? (damped ? { duration: 0.7, ease: ARRIVE } : springSettle);
  return {
    normal: { rotate: 0, transition: RETURN_TRANSITION },
    animate: { rotate: peak, transition: tx },
  };
}
