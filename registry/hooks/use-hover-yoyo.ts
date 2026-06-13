import type { Transition, Variants } from "motion/react";
import { SWEEP, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";

type YoyoProp = "rotate" | "x" | "y" | "scale";

export interface UseHoverYoyoOptions {
  /** Which property to loop. */
  prop?: YoyoProp;
  /** Peak value. For "rotate" this is a continuous spin target (e.g. 360). */
  to?: number;
  /** Held-empty beat between cycles, in seconds — makes looped motion read as event-like. */
  repeatDelay?: number;
  transition?: Transition;
}

/**
 * Looping primitive for STATE icons (spinners, pulses, continuous nudges).
 * Rotation loops forward continuously; translate / scale yoyo back and forth.
 * The held `repeatDelay` beat keeps a loop from reading as a relentless churn.
 */
export function useHoverYoyo(options: UseHoverYoyoOptions = {}): Variants {
  const { prop = "rotate", to = 360, repeatDelay = 0, transition } = options;
  const base: Transition = transition ?? { duration: DUR.slow, ease: SWEEP };
  const repeatType: "loop" | "reverse" = prop === "rotate" ? "loop" : "reverse";
  const loop: Transition = { ...base, repeat: Infinity, repeatType, repeatDelay };

  switch (prop) {
    case "x":
      return { normal: { x: 0, transition: RETURN_TRANSITION }, animate: { x: to, transition: loop } };
    case "y":
      return { normal: { y: 0, transition: RETURN_TRANSITION }, animate: { y: to, transition: loop } };
    case "scale":
      return { normal: { scale: 1, transition: RETURN_TRANSITION }, animate: { scale: to, transition: loop } };
    case "rotate":
    default:
      return { normal: { rotate: 0, transition: RETURN_TRANSITION }, animate: { rotate: to, transition: loop } };
  }
}
