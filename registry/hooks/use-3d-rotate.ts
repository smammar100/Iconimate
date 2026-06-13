import type { Transition, Variants } from "motion/react";
import { ARRIVE, DUR, springSwing, RETURN_TRANSITION } from "@/lib/motion-tokens";

export interface Use3DRotateOptions {
  /** Rotation axis. "y" = vertical spin (default), "x" = horizontal flip / fold. */
  axis?: "x" | "y";
  /** Peak rotation in degrees. */
  angle?: number;
  /** Perspective distance in px — mandatory for real 3D; without it the motion reads as a flat squash. */
  perspective?: number;
  /** "rock" = damped there-and-back; "spin" = one-way to `angle`. */
  mode?: "rock" | "spin";
  transition?: Transition;
}

/**
 * 3D tilt / flip primitive. Always pairs the rotation with `transformPerspective`
 * so the motion has depth. Combine with `transformBox: "view-box"` + a
 * `transformOrigin` in viewBox coords on the element to pivot off-center
 * (e.g. a card folding from its spine).
 */
export function use3DRotate(options: Use3DRotateOptions = {}): Variants {
  const { axis = "y", angle = 180, perspective = 600, mode = "rock", transition } = options;
  const peak = mode === "spin" ? [0, angle] : [0, angle, -angle * 0.35, 0];
  // "spin" is two keyframes (spring-safe); "rock" is four keyframes and must tween.
  const tx: Transition = transition ?? (mode === "spin" ? springSwing : { duration: DUR.slow, ease: ARRIVE });

  if (axis === "x") {
    return {
      normal: { rotateX: 0, transformPerspective: perspective, transition: RETURN_TRANSITION },
      animate: { rotateX: peak, transformPerspective: perspective, transition: tx },
    };
  }
  return {
    normal: { rotateY: 0, transformPerspective: perspective, transition: RETURN_TRANSITION },
    animate: { rotateY: peak, transformPerspective: perspective, transition: tx },
  };
}
