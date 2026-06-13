import type { Transition, Variants } from "motion/react";
import { ARRIVE, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";

export interface UseSquashStretchOptions {
  /** Peak deformation, 0–1. ~0.18 reads well at the 24px ship size. */
  amount?: number;
  transition?: Transition;
}

/**
 * Organic squash-and-stretch with volume conservation: when scaleX grows to
 * `1 + a`, scaleY shrinks to `1 / (1 + a)` so the shape appears to keep its mass.
 * The rebound inverts the deformation before settling back to rest. The four-keyframe
 * deformation is a tween — springs only support two keyframes.
 */
export function useSquashStretch(options: UseSquashStretchOptions = {}): Variants {
  const { amount = 0.18, transition = { duration: DUR.base, ease: ARRIVE } } = options;
  const a = amount;
  return {
    normal: { scaleX: 1, scaleY: 1, transition: RETURN_TRANSITION },
    animate: {
      scaleX: [1, 1 + a, 1 - a * 0.6, 1],
      scaleY: [1, 1 / (1 + a), 1 / (1 - a * 0.6), 1],
      transition,
    },
  };
}
