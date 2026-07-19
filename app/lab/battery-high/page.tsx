"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, OVERSHOOT, Svg, VariantGrid } from "@/app/lab/_shared/harness";

/**
 * LAB — Battery High icon (Phosphor "battery-high"), the "Level Up" motion.
 *
 * Same motion as battery-full, adapted to THREE bars instead of four — the
 * glyph is a nearly-full cell (bars at x-centers 56/96/136; no rightmost bar).
 * The meter charges from empty: all bars reset to nothing, then each pops up
 * from the base in turn, left → right, with an overshoot as it lands. Bars are
 * the glyph's own ink; nothing added, nothing filled. Base-anchored.
 */
const CASE =
  "M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Z";
const NUB = "M256,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z";
const BARS = [
  { d: "M64,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z", cx: 56 },
  { d: "M104,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z", cx: 96 },
  { d: "M144,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z", cx: 136 },
];

const levelUp = (i: number): Variants => ({
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [0, 0, 1.18, 1, 1],
    transition: {
      duration: 1.6,
      ease: OVERSHOOT,
      times: [0, 0.1 + i * 0.18, 0.22 + i * 0.18, 0.32 + i * 0.18, 1],
    },
  },
});

const BatteryHighLevelUpIcon = forwardRef<IconHandle, IconProps>(
  function BatteryHighLevelUpIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={CASE} />
          <path d={NUB} />
          {BARS.map((b, i) => (
            <motion.path
              key={i}
              d={b.d}
              variants={reduced ? undefined : levelUp(i)}
              style={AT(b.cx, 160)}
            />
          ))}
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof BatteryHighLevelUpIcon }[] = [
  { name: "Level Up", blurb: "Same level-up motion — three bars pop in one by one, left → right", Component: BatteryHighLevelUpIcon },
];

export default function BatteryHighLabPage() {
  return <VariantGrid title="Battery High" variants={VARIANTS} cycleMs={2800} playMs={1700} />;
}
