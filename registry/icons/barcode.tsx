"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// BEEP — the full checkout moment. A scanner beam sweeps the code, every bar
// pulses as it's read, and on the "beep" the four brackets pop outward and
// snap back. Scanned.
//
// The Phosphor "barcode" glyph splits into its own parts:
//   CORNERS — the four L-brackets, the glyph's untouched subpaths.
//   BARS    — the four bars as 16-wide round-capped strokes (x80/112/144/176,
//             y88–168), identical to the filled originals.
// The scan beam is an extra actor, hidden at rest so the glyph stays exact.
const CORNERS = [
  "M32,96a8,8,0,0,0,8-8V56H72a8,8,0,0,0,0-16H32a8,8,0,0,0-8,8V88A8,8,0,0,0,32,96Z",
  "M232,48V88a8,8,0,0,1-16,0V56H184a8,8,0,0,1,0-16h40A8,8,0,0,1,232,48Z",
  "M72,200H40V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16Z",
  "M224,160a8,8,0,0,0-8,8v32H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,224,160Z",
];
const BAR_X = [80, 112, 144, 176];
const bar = (x: number) => `M${x},88V168`;
const SCANLINE = "M64,78V178";

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});

const DUR = 1.15;
const beam: Variants = {
  normal: { opacity: 0, x: 0, transition: { duration: 0.1 } },
  animate: {
    opacity: [0, 1, 1, 0, 0],
    x: [0, 0, 128, 128, 128],
    transition: { duration: DUR, ease: "easeInOut", times: [0, 0.08, 0.55, 0.62, 1] },
  },
};
const barPulse = (i: number): Variants => ({
  normal: { scaleY: 1, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 1.12, 1, 1.08, 1],
    scaleX: [1, 1.25, 1, 1.2, 1],
    transition: {
      duration: DUR,
      ease: "easeOut",
      times: [0, 0.12, 0.2, 0.68, 0.8],
      delay: 0.1 + i * 0.1,
    },
  },
});
const cornerPop = (i: number): Variants => {
  const dx = i % 2 === 0 ? -5 : 5;
  const dy = i < 2 ? -5 : 5;
  return {
    normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
    animate: {
      x: [0, 0, dx, 0],
      y: [0, 0, dy, 0],
      transition: { duration: DUR, ease: "easeOut", times: [0, 0.6, 0.72, 0.9] },
    },
  };
};

export const BarcodeIcon = forwardRef<IconHandle, IconProps>(function BarcodeIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          {CORNERS.map((d) => (
            <path key={d} d={d} />
          ))}
          {BAR_X.map((x) => (
            <path key={x} d={bar(x)} fill="none" stroke="currentColor" strokeWidth={16} strokeLinecap="round" />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="currentColor"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        {CORNERS.map((d, i) => (
          <motion.path key={d} d={d} variants={cornerPop(i)} />
        ))}
        {BAR_X.map((x, i) => (
          <motion.path
            key={x}
            d={bar(x)}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            variants={barPulse(i)}
            style={AT(x, 128)}
          />
        ))}
        <motion.path
          d={SCANLINE}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          strokeLinecap="round"
          variants={beam}
        />
      </motion.svg>
    </div>
  );
});
