"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SILENCED — the same gesture as bell-simple-slash, on the bell that has a clapper. It rings
// freely, then the slash sweeps across and the swing dies as it lands: the two swings after
// the slash completes are a fraction of the two before it. The mute is something that HAPPENS
// rather than a starting state, which is the only reading that earns an animation at all.
//
// THE SLASH CANNOT BE LIFTED OUT OF THE SOURCE, so this rebuilds rather than decomposes, and
// the trade is the same one bell-simple-slash accepts. Phosphor does not overlay a slash on a
// whole bell — it REDRAWS the bell with the dome's upper-left and the collar's right omitted
// where the slash crosses, leaving white clearance on both sides of it, and it truncates the
// arcs to suit (r=79.59 and r=63.65 here, against a true 80 and 64). That geometry cannot be
// animated: the slash has no separate path to draw, and the gaps sit in the bell as a ghost
// outline before any ink arrives.
//
// So the bell is drawn whole and the slash is stroked over it, running continuously beneath
// rather than stopping against it. MEASURED, THE COST IS 12,447 PIXELS — 5.9% of the glyph's
// ink — counting only pixels that flip ink/no-ink so antialiasing cannot inflate it. Almost
// all of it is the clearance: where Phosphor leaves white margins either side of the slash,
// this has the bell's outline touching it. The figure is identical to the shipped
// bell-simple-slash's, to the pixel (12,447 extra and 10 missing on both), because the omitted
// region is the same in both and neither the clapper nor the bar goes near it. Two masking
// approaches were tried on the simple one and abandoned; see its header before re-trying them.
//
// THE CLAPPER IS THE TRAP bell-simple-slash did not have. The collar's dip (r=40) and the
// tongue (r=24) are concentric about (128,192), leaving a wall of exactly 16 — the stroke
// weight — and under nonzero they cancel. So the dip comes out of the collar and the clapper
// is rebuilt as its own annular outline, its white middle being its own hollowness. No mask.
//
// EVERY NUMBER IS MEASURED OFF THE PATH.
//   · the slash is a 16-wide round-capped stroke whose caps centre on (48,40) and (208,216),
//     read off the two cap arcs in the source, and is 237.9 units long;
//   · rotating shell, clapper and slash together about the crown (128,24), the largest angle
//     keeping every sampled point on the artboard is 12.12°;
//   · THE CLAPPER'S TRAVEL IS ASYMMETRIC, and that is forced rather than stylistic. Swinging
//     right it closes on the slash: the family's 16 would put it 0.26 units INSIDE the slash
//     band, and the most it can take is 15.64. So it goes 12 to the right, keeping a 2.7-unit
//     gap — about a sixth of the stroke weight, enough that the two never fuse into one blob —
//     and the full family 16 to the left, where nothing constrains it.
const SHELL =
  "M221.84,192A15.8,15.8,0,0,1,208,200H48a16,16,0,0,1-13.8-24.06C39.75,166.38,48,139.34,48,104a80,80,0,1,1,160,0c0,35.33,8.26,62.38,13.81,71.94A15.89,15.89,0,0,1,221.84,192Z" +
  "M208,184c-7.73-13.27-16-43.95-16-80a64,64,0,1,0-128,0c0,36.06-8.28,66.74-16,80Z";
const CLAPPER = "M167.19,200a40,40,0,0,1-78.38,0L105.38,200a24,24,0,0,0,45.24,0Z";
const SLASH = "M48,40L208,216";
// Full original glyph, for the reduced-motion static render — the exact Phosphor mark.
const BELL_SLASH =
  "M53.92,34.62A8,8,0,1,0,42.08,45.38L58.82,63.8A79.59,79.59,0,0,0,48,104c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.8a40,40,0,0,0,78.4,0h15.44l19.44,21.38a8,8,0,1,0,11.84-10.76ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a63.65,63.65,0,0,1,6.26-27.62L168.09,184Zm166-4.73a8.13,8.13,0,0,1-2.93.55,8,8,0,0,1-7.44-5.08C196.35,156.19,192,129.75,192,104A64,64,0,0,0,96.43,48.31a8,8,0,0,1-7.9-13.91A80,80,0,0,1,208,104c0,35.35,8.05,58.59,10.52,64.88A8,8,0,0,1,214,179.25Z";

const CROWN = { transformBox: "view-box" as const, originX: 0.5, originY: 24 / 256 };

const shell: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    // rings, then the amplitude collapses as the slash lands — 11 and 10, then 3.2 and 1.1
    rotate: [0, -11, 10, -3.2, 1.1, 0],
    transition: { duration: 0.95, times: [0, 0.16, 0.36, 0.62, 0.82, 1], ease: "easeOut" },
  },
};

const clapper: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    // 16 left, 12 right — see the header; the slash is what caps the right-hand swing
    x: [0, -16, 12, -3.4, 1.1, 0],
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
      // The fade must finish AFTER the stroke has outgrown its own cap, not merely after it
      // starts. The cap is 8 units in radius, so the mark stops reading as a dot past ~0.033
      // of the length, which this eased ramp reaches at 0.445. Ending the fade at 0.48 — as
      // an earlier revision did — leaves a ~10ms window at 20% opacity showing a 2.4-unit
      // stub: measured at 6 frames. Ending at 0.50 removes it.
      opacity: { duration: 0.95, times: [0, 0.45, 0.5, 1], ease: "linear" },
    },
  },
};

export const BellSlashIcon = forwardRef<IconHandle, IconProps>(function BellSlashIcon(
  { size = 28, style, ...props },
  ref,
) {
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
          <path d={BELL_SLASH} />
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
          <motion.path d={CLAPPER} variants={clapper} />
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
});
