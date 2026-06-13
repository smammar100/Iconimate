"use client";

import { useCallback } from "react";
import type { DOMAttributes } from "react";
import { useAnimation, useReducedMotion } from "motion/react";

/** The controls object returned by `useAnimation()` — derived to stay resilient to motion's type renames. */
type AnimationControls = ReturnType<typeof useAnimation>;

export interface HoverController {
  /** The single controls instance every animated element in the icon is gated through. */
  controls: AnimationControls;
  /** True when the user prefers reduced motion — icons swap to a static/opacity fallback. */
  reduced: boolean;
  /** Play the "animate" variant. */
  start: () => void;
  /** Glide back to the "normal" variant. */
  stop: () => void;
  /** Spread onto the icon's wrapper. Keyboard focus triggers it too, not just pointer. */
  bind: Pick<DOMAttributes<Element>, "onMouseEnter" | "onMouseLeave" | "onFocus" | "onBlur">;
}

/**
 * The common-case hover controller. Owns one `useAnimation` instance and the
 * enter / leave / focus / blur wiring, so motion across every element of an icon
 * is gated through a single source of truth.
 *
 * Per-icon files layer `forwardRef` + `useImperativeHandle` on top of this to
 * expose `startAnimation` / `stopAnimation`, since `:hover` never fires on touch.
 */
export function useHover(): HoverController {
  const controls = useAnimation();
  const reduced = useReducedMotion() ?? false;

  const start = useCallback(() => {
    void controls.start("animate");
  }, [controls]);

  const stop = useCallback(() => {
    void controls.start("normal");
  }, [controls]);

  return {
    controls,
    reduced,
    start,
    stop,
    bind: { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop },
  };
}
