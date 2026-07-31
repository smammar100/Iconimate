"use client";

import { useCallback, useEffect, useRef } from "react";
import type { DOMAttributes } from "react";
import { useAnimation, useReducedMotion } from "motion/react";

/** The controls object returned by `useAnimation()` — derived to stay resilient to motion's type renames. */
type AnimationControls = ReturnType<typeof useAnimation>;

export interface HoverController {
  /** The single controls instance every animated element in the icon is gated through. */
  controls: AnimationControls;
  /**
   * True when the icon should render its static fallback instead of animating.
   *
   * Deliberately **not** the OS `prefers-reduced-motion` value. Taking the static
   * path leaves a reduced-motion visitor unable to preview an icon at all, which
   * defeats a gallery whose entire content is motion. The preference is honoured
   * on `ambient` instead: an explicit hover/tap still performs the gesture once,
   * but nothing repeats unattended. Kept as a field so the per-icon static
   * fallbacks stay wired and a product decision can switch them on in one place.
   */
  reduced: boolean;
  /**
   * True when motion may repeat on its own — the replay loop below, and any
   * icon transition carrying `repeat: Infinity`.
   *
   * False when the user prefers reduced motion. Icons with ambient/looping
   * tracks must gate `repeat` on this; one-shot gestures ignore it, because a
   * gesture the user asked for by hovering is not unattended motion.
   */
  ambient: boolean;
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
  // Icons still animate for everyone — see `reduced` on HoverController for why
  // the static fallback is not wired to the OS preference.
  const reduced = false;
  // `useReducedMotion()` reads the media query directly and does NOT consult
  // <MotionConfig>, so app/providers.tsx's `reducedMotion="never"` cannot mask
  // this. That is intentional: this is the one place the real preference is read.
  const ambient = !(useReducedMotion() ?? false);

  // True while the pointer (or focus) is on the icon — the loop below keys off
  // it so the "animate" variant replays end-to-end until the user leaves.
  const looping = useRef(false);
  // The pending replay timer, tracked so stop()/unmount can clear it outright
  // rather than relying on a late fire noticing `looping` went false.
  const replayTimer = useRef<number | undefined>(undefined);

  const start = useCallback(() => {
    if (looping.current) return; // already looping — don't stack replays
    looping.current = true;
    const run = () => {
      if (!looping.current) return;
      const t0 = performance.now();
      void controls.start("animate").then(() => {
        if (!looping.current) return;
        // Snap back to "normal" (keyframes end where they start, so this is
        // invisible) so the next start("animate") actually replays — starting
        // a variant the elements are already at resolves immediately.
        controls.set("normal");
        // Reduced motion: the hover gets its one full pass — an explicit
        // preview the visitor asked for — and then stops. Nothing replays
        // unattended.
        if (!ambient) {
          looping.current = false;
          return;
        }
        // If the cycle resolved instantly (no animatable elements mounted),
        // pause before retrying instead of spinning a tight loop. Otherwise
        // breathe for 30% of the cycle before replaying, so the loop reads
        // as a rhythm rather than a frantic back-to-back repeat.
        const elapsed = performance.now() - t0;
        replayTimer.current = window.setTimeout(run, elapsed < 100 ? 300 : elapsed * 0.3);
      });
    };
    run();
  }, [controls, ambient]);

  const stop = useCallback(() => {
    looping.current = false;
    window.clearTimeout(replayTimer.current);
    void controls.start("normal");
  }, [controls]);

  // Never leave a loop or a pending replay running after unmount.
  useEffect(
    () => () => {
      looping.current = false;
      window.clearTimeout(replayTimer.current);
    },
    [],
  );

  return {
    controls,
    reduced,
    ambient,
    start,
    stop,
    bind: { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop },
  };
}
