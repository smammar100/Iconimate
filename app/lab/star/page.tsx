"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Star (the outlined mark), five takes.
 *
 * NOTE: the registry already ships a `star`, and it is a DIFFERENT GLYPH — a
 * stroked five-point star running the shared `popIn` twinkle. This lab is built
 * against the filled outline star, so promoting anything here means replacing
 * that icon rather than adding beside it.
 *
 * THE GLYPH IS A RING, AND THAT IS THE WHOLE OPPORTUNITY. It is one compound
 * path: a solid star silhouette with a smaller star punched out of it. A star
 * that FILLS IN is the single most useful thing this mark can do — it is what
 * every rating and favourite control in the world does — and the silhouette is
 * already sitting there as the path's first subpath, needing no reconstruction.
 *
 * THE FILL IS THAT SILHOUETTE, PAINTED OVER THE RING (see `SOLID`). The ring is
 * never touched, so rest is the authored mark; and because the fill is ONE path
 * that wholly contains the ring, the filled state has a single antialiased edge
 * and no internal join. Filling by dropping the counter back into its hole is
 * the obvious alternative and it is what produced the hairline this went through
 * twice — see the note on `SOLID`.
 *
 * Geometry, measured off the rendered fill at 4x:
 *   ring      x16..239.75, y16..231.75, centre (128, 124)
 *   free space in the five GAPS between points (this is where rays fit):
 *     -54deg r61..153   18deg r73..134   90deg r75..131
 *     162deg r74..134   234deg r61..153
 *   the five POINT directions have almost nothing outside them — 109..124 at
 *   the top — so nothing radiates from the tips.
 */
const STAR =
  "M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z";
/**
 * THE SOLID STAR — the mark's FIRST SUBPATH, on its own. This is what fills the
 * star, and using it instead of the counter is the whole answer to the hairline.
 *
 * Filling by laying the counter back into its hole means two adjacent shapes
 * sharing a boundary, and two antialiased edges on one boundary DO NOT SUM TO 1
 * in any renderer — a pale thread shows along the join. Bleeding the counter
 * outward shrinks the thread but never truly removes it; it just moves the join
 * somewhere the measurement is less likely to catch it. (Measuring at 4x
 * supersampling dilutes it further, which is how a "0 seam pixels" reading and a
 * visible line at 30px can both be true. That happened here.)
 *
 * A single path has no join. `SOLID` covers the ring completely — it is the same
 * outline with the hole simply absent — so at full opacity the rendered result
 * is one shape with one antialiased edge, and there is nothing left to seam.
 */
const SOLID =
  "M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z";

const CX = 128;
const CY = 124;


/* ══ 1. FILL ═════════════════════════════════════════════════════════════════
   Outline becomes solid. The ring pops, and the fill SNAPS ON at the top of that
   pop — the energy of the toggle is carried by the ring, not by the fill.

   THE FILL NEVER GROWS, AND THAT IS THE FIX. Scaling it up from the centre was
   the obvious way to do this and it looks wrong for a reason that cannot be
   tuned out: a partly-grown fill is a SMALLER COPY OF THE STAR floating inside
   the ring with a white gap all the way round it. It reads as a detached blob,
   not as a star filling, and every intermediate frame has it. Fading a
   full-size fill in has the same flaw in a milder form — a half-opaque fill is
   grey against the paper, which is not what a filled star looks like either.
   So the fill is always full size and its opacity steps over ~80ms: there is no
   intermediate state to get wrong.

   The pop peaks at 0.42 and the fill lands at 0.36, just before it, so the ring
   is still expanding as the fill arrives and the two read as one event. */
const fill: Variants = {
  normal: { opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1, 1, 0, 0],
    transition: {
      duration: 1.05,
      times: [0, 0.28, 0.36, 0.74, 0.84, 1],
      ease: "linear",
    },
  },
};
const fillRing: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.96, 1.05, 1, 1],
    transition: {
      duration: 1.05,
      times: [0, 0.22, 0.42, 0.6, 1],
      ease: ["easeIn", "easeOut", "easeInOut", "linear"],
    },
  },
};

/* ══ 2. SPIN ═════════════════════════════════════════════════════════════════
   One confident turn. The dip before it is the point: a star that simply starts
   rotating reads as a value changing, and a star that winds up first reads as
   something being awarded. Rotation and scale run on separate tweens so the
   wind-up can be short while the turn stays long. */
const spin: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -18, 360],
    scale: [1, 0.9, 1.16, 1],
    transition: {
      rotate: { duration: 0.86, times: [0, 0.18, 1], ease: ["easeOut", [0.2, 0.8, 0.25, 1]] },
      scale: { duration: 0.86, times: [0, 0.2, 0.6, 1], ease: ["easeOut", "easeOut", "easeInOut"] },
    },
  },
};

/* ══ 3. BURST ════════════════════════════════════════════════════════════════
   The star pops and five rays fly outward. THE RAYS SIT IN THE GAPS BETWEEN THE
   POINTS, not on the points, and that is measured rather than aesthetic: outside
   a tip there are 15 free units at the top and the artboard edge right behind
   it, while the gaps have 56 to 92. Rays on the tips would have to be stubs or
   clip; in the gaps they can be 34 long and still clear the mark at both ends.
   They fly by scaling the whole group about the star's centre, so all five move
   radially outward together with one transform. */
const GAP_ANGLES = [-54, 18, 90, 162, 234];
const RAY_IN = 84;
const RAY_OUT = 118;
const burst: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.92, 1.14, 1],
    transition: { duration: 0.78, times: [0, 0.16, 0.5, 1], ease: ["easeOut", "easeOut", "easeInOut"] },
  },
};
const rays: Variants = {
  normal: { scale: 0.72, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [0.72, 0.86, 1.16],
    opacity: [0, 0.95, 0],
    transition: { duration: 0.78, times: [0, 0.34, 1], ease: ["easeOut", "easeIn"] },
  },
};

/* ══ 4. WOBBLE ═══════════════════════════════════════════════════════════════
   Tapped, and rocking to a stop. The amplitude decays 9 -> 5.4 -> 2.7 -> 1 -> 0,
   each swing roughly 0.55 of the last, because a rock whose swings are all the
   same size reads as a shake and never resolves. The period shortens slightly as
   it dies, which is what a real damped thing does. */
const wobble: Variants = {
  normal: { rotate: 0, scale: 1, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -9, 5.4, -2.7, 1, 0],
    scale: [1, 1.07, 1, 1, 1, 1],
    transition: {
      duration: 0.92,
      times: [0, 0.16, 0.38, 0.58, 0.76, 1],
      ease: "easeInOut",
    },
  },
};

/* ══ 5. RATE ═════════════════════════════════════════════════════════════════
   The fill sweeps in from the left the way a rating fills, holds, and sweeps
   back out. Distinct from `fill`, which grows from the centre: this one has a
   direction, and direction is what makes it read as a VALUE rather than as a
   state toggling.

   The clip is a full-bleed rect TRANSLATED rather than a rect whose width is
   animated — width would have to interpolate an attribute, and translating a box
   that already covers the artboard is both cheaper and exact at the ends. The
   counter underneath is never touched, so there is no seam to get wrong. */
const wipe: Variants = {
  normal: { x: -272, transition: RETURN_TRANSITION },
  animate: {
    x: [-272, 0, 0, -272],
    transition: { duration: 1.15, times: [0, 0.42, 0.68, 1], ease: ["easeOut", "linear", "easeIn"] },
  },
};
const ratePop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, 1.12, 1, 1],
    transition: { duration: 1.15, times: [0, 0.4, 0.52, 0.66, 1], ease: ["linear", "easeOut", "easeInOut", "linear"] },
  },
};

/* ══ 6. FAVOURITE — 1 x 3 + 5's bounce ═══════════════════════════════════════
   The whole "like" gesture in one: the star dips, snaps solid at the top of the
   pop while five rays fly out of the gaps, and then BOUNCES to a stop.

   THE THREE PARTS SHARE ONE INSTANT, which is what makes it one event rather
   than three animations queued up. The fill lands at 0.30, the rays are already
   moving by 0.30, and the scale peaks at 0.30. Stagger any of them by more than
   a frame or two and it stops reading as a single snap and starts reading as a
   sequence — which is the exact failure of putting `fill` and `burst` back to
   back instead of overlapping them.

   THE BOUNCE IS 5's POP, GIVEN SOMEWHERE TO GO. In `rate` the pop is a single
   1.12 blip because it only has to acknowledge a wipe that has already finished.
   Here it is the landing of the whole gesture, so it is a real damped sequence —
   1.18, 0.96, 1.06, 0.99, 1 — each overshoot about a third of the last. A pop
   that returns straight to 1 reads as a glitch; one that rings down reads as
   something with weight arriving.

   ANTICIPATION FIRST: the dip to 0.92 before the snap is what makes the fill
   read as CAUSED. Without it the star simply changes state. */
const favBody: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.92, 1.18, 0.96, 1.06, 0.99, 1, 1],
    transition: {
      duration: 1.15,
      times: [0, 0.16, 0.3, 0.4, 0.5, 0.6, 0.7, 1],
      ease: ["easeIn", "easeOut", "easeInOut", "easeInOut", "easeInOut", "easeOut", "linear"],
    },
  },
};
/** Same single-path fill as `1 · Fill` — steps on, never grows, never seams. */
const favFill: Variants = {
  normal: { opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    opacity: [0, 0, 1, 1, 0, 0],
    transition: { duration: 1.15, times: [0, 0.24, 0.3, 0.78, 0.86, 1], ease: "linear" },
  },
};
/** Same gap-seated rays as `3 · Burst`, timed onto the snap rather than a pop. */
const favRays: Variants = {
  normal: { scale: 0.72, opacity: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [0.72, 0.74, 0.9, 1.2, 1.2],
    opacity: [0, 0, 0.95, 0, 0],
    transition: {
      duration: 1.15,
      times: [0, 0.26, 0.4, 0.74, 1],
      ease: ["linear", "easeOut", "easeIn", "linear"],
    },
  },
};

const FavouriteIcon = forwardRef<IconHandle, IconProps>(function StarIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g
          variants={favRays}
          style={AT(CX, CY)}
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
        <motion.g variants={favBody} style={AT(CX, CY)}>
          <path d={STAR} />
          <motion.path d={SOLID} variants={favFill} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── assembly ────────────────────────────────────────────────────────────── */

function Static({
  size,
  style,
  bind,
  ...props
}: IconProps & { bind: ReturnType<typeof useHover>["bind"] }) {
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
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

/** Whole-mark transforms — the ring is never split, so rest is exact by
 *  construction: there is no second edge anywhere to misalign. */
function makeBody(v: Variants) {
  return forwardRef<IconHandle, IconProps>(function StarIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={v} style={AT(CX, CY)}>
            <path d={STAR} />
          </motion.g>
        </Svg>
      </div>
    );
  });
}

const FillIcon = forwardRef<IconHandle, IconProps>(function StarIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={fillRing} style={AT(CX, CY)}>
          <path d={STAR} />
          {/* ONE path, covering the ring entirely — no shared boundary, so no
              hairline is possible. Only opacity moves. */}
          <motion.path d={SOLID} variants={fill} />
        </motion.g>
      </Svg>
    </div>
  );
});

const BurstIcon = forwardRef<IconHandle, IconProps>(function StarIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g
          variants={rays}
          style={AT(CX, CY)}
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
        <motion.g variants={burst} style={AT(CX, CY)}>
          <path d={STAR} />
        </motion.g>
      </Svg>
    </div>
  );
});

const RateIcon = forwardRef<IconHandle, IconProps>(function StarIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId().replace(/:/g, "");
  const clip = `star-wipe-${uid}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clip} clipPathUnits="userSpaceOnUse">
            <motion.rect x={-8} y={-8} width={272} height={272} variants={wipe} />
          </clipPath>
        </defs>
        <motion.g variants={ratePop} style={AT(CX, CY)}>
          <path d={STAR} />
          {/* Same single solid path as `fill`; the wipe only changes how much of
              it has arrived, never whether it has an edge to reconcile. */}
          <g clipPath={`url(#${clip})`}>
            <path d={SOLID} />
          </g>
        </motion.g>
      </Svg>
    </div>
  );
});

const VARIANTS: LabVariant[] = [
  {
    name: "1 · Fill",
    blurb: "Outline becomes solid — the ring pops and the fill snaps on at the top of it.",
    Component: FillIcon,
  },
  {
    name: "2 · Spin",
    blurb: "Winds up, then one confident turn — awarded rather than merely rotated.",
    Component: makeBody(spin),
  },
  {
    name: "3 · Burst",
    blurb: "Pops while five rays fly out through the gaps between the points, where the room is.",
    Component: BurstIcon,
  },
  {
    name: "4 · Wobble",
    blurb: "Tapped and rocking to a stop, each swing about half the last so it actually resolves.",
    Component: makeBody(wobble),
  },
  {
    name: "5 · Rate",
    blurb: "The fill sweeps in from the left like a rating filling, holds, then sweeps back out.",
    Component: RateIcon,
  },
  {
    name: "6 · Favourite",
    blurb: "1 × 3 + 5's bounce — dips, snaps solid as five rays fly out, then rings down to rest.",
    Component: FavouriteIcon,
  },
];

export default function StarLab() {
  return <VariantGrid title="Star" variants={VARIANTS} cycleMs={2800} playMs={1400} />;
}
