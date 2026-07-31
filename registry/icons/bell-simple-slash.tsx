"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SILENCED — the bell rings freely, then the slash sweeps across and the swing dies as it
// lands. The mute is something that HAPPENS rather than a starting state, which is the whole
// reason to animate a slash icon at all: the two swings after the slash completes are a
// fraction of the two before it. The ring itself is the same spine shipping in bell.tsx, so
// the muted bell stays a sibling of the live one.
//
// THE SLASH CANNOT BE LIFTED OUT OF THE SOURCE, so this rebuilds instead of decomposing.
// Phosphor does not overlay a slash on a whole bell — it REDRAWS the bell with the dome's
// upper-left and the collar's right omitted where the slash crosses, so the outline stops
// against the slash rather than passing behind it. Two approaches were tried and abandoned:
//   · overlaying a slash on the whole bell is wrong by 832 pixels, and no clearance band
//     recovers it (sweeping widths 16..44 bottoms out at 849, against 851);
//   · masking the slash band out of the source and redrawing it does round-trip, but a
//     static cut leaves the bell carrying Phosphor's gaps as a ghost outline before the ink
//     arrives, and making the cut follow the stroke is worse still — the source's own slash
//     then stays visible ahead of it, so the slash looks fully drawn from the first frame.
// So the bell is drawn from bell-simple's own whole geometry and the slash is simply stroked
// over it. The trade is explicit: at rest this is 832 pixels (1.3%) different from the source
// glyph, the outline running continuously beneath the slash instead of stopping at it. That
// is visible only on inspection, and it buys a slash that actually draws.
//
// EVERY NUMBER IS MEASURED OFF THE PATH.
//   · the slash is a 16-wide round-capped stroke whose caps centre on (48,40) and (208,216),
//     read off the two cap arcs in the source, and is 237.9 units long;
//   · the bell is bell-simple: dome r=80 about (128,104), so it hangs from its crown
//     (128,24), collar straight across at y=200, bar at x88..168 y216..232;
//   · the bar travels 17 — the shipped bell's 4.99° angular swing at this bar's radius — and
//     at full travel its right edge reaches 185, clear of the slash band's near edge at 200,
//     so the two never collide.
const SHELL =
  "M221.85,192A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192Z" +
  "M208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z";
const BAR = "M168,224a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z";
const SLASH = "M48,40L208,216";
// Full original glyph, for the reduced-motion static render — the exact Phosphor mark.
const BELL_SIMPLE_SLASH =
  "M53.92,34.62A8,8,0,1,0,42.08,45.38L58.82,63.8A79.59,79.59,0,0,0,48,104c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H182.64l19.44,21.38a8,8,0,1,0,11.84-10.76ZM48,184c7.7-13.24,16-43.92,16-80a63.65,63.65,0,0,1,6.26-27.62L168.09,184Zm120,40a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Zm46-44.75a8.13,8.13,0,0,1-2.93.55,8,8,0,0,1-7.44-5.08C196.35,156.19,192,129.75,192,104A64,64,0,0,0,96.43,48.31a8,8,0,0,1-7.9-13.91A80,80,0,0,1,208,104c0,35.35,8.05,58.59,10.52,64.88A8,8,0,0,1,214,179.25Z";

const CROWN = { transformBox: "view-box" as const, originX: 0.5, originY: 24 / 256 };
const TRAVEL = 17;

const shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // rings, then the amplitude collapses as the slash lands — 11 and 10, then 3.2 and 1.1
    rotate: [0, -11, 10, -3.2, 1.1, 0],
    transition: { duration: 0.95, times: [0, 0.16, 0.36, 0.62, 0.82, 1], ease: "easeOut" },
  },
};

const bar: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, -TRAVEL, 15, -4.4, 1.5, 0],
    transition: { duration: 0.95, times: [0, 0.2, 0.4, 0.66, 0.86, 1], ease: "easeOut" },
  },
};

const slash: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    // holds at nothing while the bell rings, then sweeps across from 0.42 to 0.66
    pathLength: [0, 0, 1, 1],
    // Opacity is here for the CAP. A round-capped stroke at zero length draws as a full
    // 16-wide dot parked at the start point, which pops before the line exists. Staying
    // invisible through the hold kills it while keeping the caps round — butt caps would
    // also kill it but leave the finished slash flat-ended, which the source is not.
    opacity: [0, 0, 1, 1],
    transition: {
      pathLength: { duration: 0.95, times: [0, 0.42, 0.66, 1], ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.95, times: [0, 0.43, 0.48, 1], ease: "linear" },
    },
  },
};

export const BellSimpleSlashIcon = forwardRef<IconHandle, IconProps>(
  function BellSimpleSlashIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) {
      return (
        <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 256 256"
            fill="currentColor"
          >
            <path d={BELL_SIMPLE_SLASH} />
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
          {/* The slash sits inside the rotating group so it stays registered with the bell. */}
          <motion.g variants={shell} style={CROWN}>
            <path d={SHELL} />
            <motion.path d={BAR} variants={bar} />
            <motion.path
              d={SLASH}
              pathLength={1}
              fill="none"
              stroke="currentColor"
              strokeWidth={16}
              strokeLinecap="round"
              variants={slash}
            />
          </motion.g>
        </motion.svg>
      </div>
    );
  },
);
