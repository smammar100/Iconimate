"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery Low icon (Phosphor "battery-low"), Level Up + Blink combined.
 *
 * One bar (the low charge). Two coordinated phases tell the story: the single
 * bar LEVELS UP from empty (pops in from the base with overshoot), then the
 * WHOLE CELL BLINKS twice — the low-battery warning. Two layers: an outer group
 * carries the blink (opacity, held at 1 through the fill), the inner bar carries
 * the level-up (scaleY). Bar is the glyph's own ink; nothing added, nothing
 * filled. No transforms on the whole glyph, so no bounds concern.
 */
const CASE =
  "M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Z";
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
const BAR = "M64,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";

// Phase 1: the bar fills from empty (0..~0.36 of the timeline).
const barLevelUp: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 1.2, 1, 1],
    transition: { duration: 1.7, ease: OVERSHOOT, times: [0, 0.24, 0.36, 1] },
  },
};
// Phase 2: the whole cell blinks the low-battery warning (holds bright through
// the fill, then two dips, settling bright).
const cellBlink: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 1, 0.28, 1, 0.28, 1],
    transition: { duration: 1.7, ease: "easeInOut", times: [0, 0.46, 0.58, 0.72, 0.84, 1] },
  },
};

const BatteryLowIcon = forwardRef<IconHandle, IconProps>(
  function BatteryLowIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : cellBlink}>
            <path d={CASE} />
            <path d={NUB} />
            <motion.path d={BAR} variants={reduced ? undefined : barLevelUp} style={AT(56, 160)} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryLowIcon }[] = [
  { name: "Level Up + Blink", blurb: "The bar fills, then the cell flashes a low-battery warning", Component: BatteryLowIcon },
];

export default function BatteryLowLabPage() {
  return <VariantGrid title="Battery Low" variants={VARIANTS} cycleMs={2900} playMs={1900} />;
}
