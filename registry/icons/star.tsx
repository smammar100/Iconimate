"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// FAVOURITE — the whole "like" gesture in one: the star dips, snaps solid at the
// top of the pop while five rays fly out of the gaps, and rings down to rest.
//
// GLYPH CHANGE — this icon previously used a STROKED five-point star running the
// shared popIn twinkle. It now uses the filled Phosphor outline star, which is a
// compound path: a solid silhouette with a smaller star punched out of it. That
// is the whole reason for the change — an outline star can FILL IN, which is
// what every rating and favourite control in the world does, and a stroked one
// cannot without inventing geometry.
//
// THE FILL IS THE SILHOUETTE, PAINTED OVER THE RING. `SOLID` is the mark's first
// subpath on its own — the same outline with the hole simply absent.
//
// DO NOT "SIMPLIFY" THIS BY DROPPING THE COUNTER BACK INTO ITS HOLE. That is the
// obvious way to fill an outline star and it is wrong: two adjacent shapes
// sharing a boundary put two antialiased edges on that boundary, and they DO NOT
// SUM TO 1 in any renderer. A pale thread shows along the join, right around the
// star. Bleeding the counter outward shrinks the thread but never removes it —
// it only moves the join somewhere a measurement is less likely to catch it.
// Measuring at 4x supersampling dilutes it further, which is how a "0 seam
// pixels" reading and a plainly visible line at ship size can both be true. Both
// were tried here, in that order, and both were visible. A single path has no
// join: SOLID wholly contains the ring, so at full opacity the rendered result
// is one shape with one antialiased edge and there is nothing left to seam.
//
// THE FILL ALSO NEVER GROWS. Scaling it up from the centre is the other obvious
// approach and it fails for a different reason: a partly-grown fill is a smaller
// copy of the star floating inside the ring with white all the way round it. It
// reads as a detached blob, and EVERY intermediate frame has it. Fading a
// full-size fill in gently has the same flaw in milder form, a half-opaque fill
// being grey against the paper. So opacity steps over ~70ms and there is no
// intermediate state to get wrong.
const STAR =
  "M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z";
/** The mark's first subpath: the same outline with the hole absent. */
const SOLID =
  "M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z";

const CX = 128;
const CY = 124;
const at = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});

/**
 * THE RAYS SIT IN THE GAPS BETWEEN THE POINTS, not on the points, and that is
 * measured rather than aesthetic. Walking outward from the centre on the
 * rendered fill, the free span outside a point tip is r109..124 at the top with
 * the artboard edge right behind it; the gaps have r61..153 at the lower two and
 * r73..134 elsewhere. Rays on the tips would have to be stubs or clip. In the
 * gaps a 34-long ray clears the mark at both ends.
 */
const GAP_ANGLES = [-54, 18, 90, 162, 234];
const RAY_IN = 84;
const RAY_OUT = 118;
const DUR = 1.15;

/**
 * ALL THREE PARTS SHARE ONE INSTANT — fill lands at 0.30, rays are moving by
 * 0.30, scale peaks at 0.30. Stagger any of them by more than a frame or two and
 * it stops reading as a single snap and becomes a sequence.
 *
 * The landing is a damped ring-down — 1.18, 0.96, 1.06, 0.99, 1, each overshoot
 * about a third of the last. A pop that returns straight to 1 reads as a glitch;
 * one that rings down reads as something with weight arriving. The dip to 0.92
 * before the snap is anticipation: without it the star merely changes state.
 */
const body: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.92, 1.18, 0.96, 1.06, 0.99, 1, 1],
    transition: {
      duration: DUR,
      times: [0, 0.16, 0.3, 0.4, 0.5, 0.6, 0.7, 1],
      ease: ["easeIn", "easeOut", "easeInOut", "easeInOut", "easeInOut", "easeOut", "linear"],
    },
  },
};
const fill: Variants = {
  normal: { opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1, 1, 0, 0],
    transition: { duration: DUR, times: [0, 0.24, 0.3, 0.78, 0.86, 1], ease: "linear" },
  },
};
const rays: Variants = {
  normal: { scale: 0.72, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [0.72, 0.74, 0.9, 1.2, 1.2],
    opacity: [0, 0, 0.95, 0, 0],
    transition: {
      duration: DUR,
      times: [0, 0.26, 0.4, 0.74, 1],
      ease: ["linear", "easeOut", "easeIn", "linear"],
    },
  },
};

export const StarIcon = forwardRef<IconHandle, IconProps>(function StarIcon(
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
          <path d={STAR} />
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
        <motion.g
          variants={rays}
          style={at(CX, CY)}
          fill="none"
          stroke="currentColor"
          strokeWidth={11}
          strokeLinecap="round"
        >
          {GAP_ANGLES.map((a) => {
            const t = (a * Math.PI) / 180;
            return (
              <line
                key={a}
                x1={CX + RAY_IN * Math.cos(t)}
                y1={CY + RAY_IN * Math.sin(t)}
                x2={CX + RAY_OUT * Math.cos(t)}
                y2={CY + RAY_OUT * Math.sin(t)}
              />
            );
          })}
        </motion.g>
        <motion.g variants={body} style={at(CX, CY)}>
          <path d={STAR} />
          <motion.path d={SOLID} variants={fill} />
        </motion.g>
      </motion.svg>
    </div>
  );
});
