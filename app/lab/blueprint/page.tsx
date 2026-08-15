"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Blueprint, six takes. 1 is the brief (unroll, then the grid draws on);
 * 2-6 are alternatives.
 *
 * THIS MARK IS STROKED, NOT FILLED, and that changes what is available. `bird`,
 * `heart` and `star` are filled compound paths, so `pathLength` is useless on
 * them — there is no stroke to run a dash along, and drawing them means faking it
 * with clips. Here every element is already `fill="none" stroke="currentColor"
 * stroke-width="16"`, so `pathLength` is native and free. Variants 1 and 2 spend
 * that budget; it is the reason a "draws itself" gesture is honest on this icon
 * and dishonest on the other three.
 *
 * THE GEOMETRY, READ OFF THE PATH:
 *   `M24,176 V64 A24,24,0,0,1,48,40 H64 V152 H48 a24,24,0,0,0,0,48 H232 V64 H64`
 *   - the ROLL is the left spiral: (24,176) up to (24,64), round the top arc to
 *     (48,40), across to (64,40), down to (64,152), back to (48,152), and round
 *     the lower arc to (48,200). It occupies x24..64.
 *   - the SHEET is the rest: (48,200) -> (232,200) -> (232,64) -> (64,64). It
 *     occupies x64..232, y64..200.
 *   - the GRID is four separate `line` elements — verticals at x128 and x168
 *     (y96..160), horizontals at y112 and y144 (x104..192). Grid bbox centre is
 *     (148,128).
 *   - the roll's spine, for anything that turns the sheet like a page, is x56.
 *
 * THE SHEET AND THE ROLL ARE ONE CONTINUOUS SUBPATH, so they cannot be split
 * without introducing round caps at the cut. At (48,200) the stroke simply
 * carries on; cut there and both halves grow an 8-radius cap that did not exist,
 * which shows. Variant 1 therefore reveals the sheet with a CLIP rather than by
 * splitting the path — the roll stays painted throughout because it sits inside
 * the clip's starting box.
 */
const MARK = "M24,176V64A24,24,0,0,1,48,40H64V152H48a24,24,0,0,0,0,48H232V64H64";

type Line = { x1: number; y1: number; x2: number; y2: number };
const GRID: Line[] = [
  { x1: 128, y1: 96, x2: 128, y2: 160 }, // vertical, left
  { x1: 168, y1: 96, x2: 168, y2: 160 }, // vertical, right
  { x1: 104, y1: 112, x2: 192, y2: 112 }, // horizontal, top
  { x1: 104, y1: 144, x2: 192, y2: 144 }, // horizontal, bottom
];

const GRID_CX = 148;
const GRID_CY = 128;
const SPINE_X = 56; // the roll's axis — the hinge a page turns about
const SHEET_CY = 132;

/** Every variant paints into this: the mark is stroke-only, never filled. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ══ 1. ROLL OUT — the brief ═════════════════════════════════════════════════
   The sheet unrolls to the right off its roll, and once it has settled the grid
   draws onto it.

   THE REVEAL IS A TRANSLATED CLIP, NOT AN ANIMATED WIDTH. A rect whose `width`
   interpolates is an attribute tween; a full-bleed rect that slides is a
   transform, which is cheaper and exact at both ends. The box is 300 wide parked
   at x-236, so its right edge starts on x64 — precisely the seam where the roll
   ends and the sheet begins. Sliding it +176 puts that edge at x240, clear of the
   mark. The roll (x24..64) is inside the box from the first frame to the last, so
   it stays painted while the sheet appears to come off it.

   NOTHING IS SPLIT. See the header: the roll and sheet are one subpath, and
   cutting them apart grows two round caps at (48,200) that are not in the source.
   The clip leaves the path whole.

   THE GRID WAITS, AND THAT IS THE WHOLE POINT OF THE BRIEF. The sheet finishes
   unrolling at 0.42 and the first line starts at 0.46 — a 4% beat of stillness.
   Overlap them and it reads as one busy event; separate them and it reads as
   paper first, drawing second.

   THE LINES DRAW IN DRAWING ORDER — both verticals, then both horizontals, each
   0.10 apart. Drawing all four at once reads as a stamp rather than a hand. */
const rollSheet: Variants = {
  normal: { x: 176, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 176],
    transition: { duration: 1.9, times: [0, 0.42], ease: [0.22, 0.9, 0.28, 1] },
  },
};
/**
 * A draw that idles until `start`, then runs over ~0.18 of the pass.
 *
 * THE OPACITY RAMP IS LOAD-BEARING, NOT DECORATION. These lines are round-capped,
 * and a round-capped stroke parked at `pathLength: 0` renders a full 16-wide DOT
 * at its start point — so four dots sit on the sheet through the entire hold,
 * before anything has been drawn. (`bell-simple-slash` documents the same trap.)
 * Ramping opacity 0 -> 1 across the draw suppresses the parked dot while keeping
 * the round caps the source has. Butt caps would also kill it, at the cost of
 * flat-ending every grid line.
 */
function drawAt(start: number, duration: number): Variants {
  return {
    normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
    animate: {
      pathLength: [0, 0, 1, 1],
      opacity: [0, 0, 1, 1],
      transition: {
        duration,
        times: [0, start, Math.min(start + 0.18, 1), 1],
        ease: ["linear", "easeOut", "linear"],
      },
    },
  };
}
const ROLL_DRAWS = [drawAt(0.46, 1.9), drawAt(0.56, 1.9), drawAt(0.66, 1.9), drawAt(0.76, 1.9)];

/* ══ 2. DRAW ═════════════════════════════════════════════════════════════════
   The entire mark draws itself: the roll and sheet outline first as one
   continuous line, then the grid.

   THIS IS THE VARIANT THE STROKED GLYPH IS FOR. One `pathLength` on `MARK` runs
   the pen from (24,176) all the way round to (64,64) in the authored direction,
   which happens to start at the roll and end on the sheet's top edge — i.e. the
   path was drawn in an order that already reads as someone drawing it.

   THE GRID FOLLOWS RATHER THAN OVERLAPS, for the same reason as variant 1: the
   sheet must exist before anything is drawn on it. */
/**
 * The outline has the same round-cap problem as the grid lines (see `drawAt`),
 * but it must NOT fade across the whole draw — that would hold the finished part
 * of the line semi-transparent for a second. So opacity is a separate, much
 * faster tween: up over the first 0.05, which kills the parked start dot and
 * leaves the rest of the stroke at full weight while the pen travels.
 */
const drawMark: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 1.8, times: [0, 0.55], ease: "easeInOut" },
      opacity: { duration: 1.8, times: [0, 0.05], ease: "linear" },
    },
  },
};
const DRAW_GRID = [drawAt(0.58, 1.8), drawAt(0.66, 1.8), drawAt(0.74, 1.8), drawAt(0.82, 1.8)];

/* ══ 3. SNAP ═════════════════════════════════════════════════════════════════
   The sheet holds still and the four grid lines fly in from outside it, each
   overshooting its mark and settling.

   EACH LINE ENTERS ALONG ITS OWN AXIS — verticals drop in from above and below,
   horizontals slide in from left and right. A line entering across its own
   length reads as a wipe; entering along it reads as a part being placed.

   THE OVERSHOOT IS SMALL AND THE SETTLE IS FAST (-14 -> +5 -> 0). Blueprint lines
   are supposed to land on a measurement; a big springy bounce reads as jelly. */
function snapFrom(dx: number, dy: number, delay: number, duration: number): Variants {
  return {
    normal: { x: 0, y: 0, opacity: 1, transition: RETURN_TRANSITION },
    animate: {
      x: [dx, dx, -dx * 0.06, 0, 0],
      y: [dy, dy, -dy * 0.06, 0, 0],
      opacity: [0, 0, 1, 1, 1],
      transition: {
        duration,
        times: [0, delay, Math.min(delay + 0.22, 0.94), Math.min(delay + 0.32, 0.98), 1],
        ease: ["linear", [0.2, 0.9, 0.3, 1], "easeOut", "linear"],
      },
    },
  };
}
const SNAPS = [
  snapFrom(0, -70, 0.04, 1.3),
  snapFrom(0, 70, 0.14, 1.3),
  snapFrom(-80, 0, 0.24, 1.3),
  snapFrom(80, 0, 0.34, 1.3),
];

/* ══ 4. TURN ═════════════════════════════════════════════════════════════════
   The sheet swings shut about the roll and opens again, like a page being turned
   back to look at it.

   SCALE-X ABOUT x56, NOT rotateY. A real page turn is a 3D rotation, and
   `rotateY` on an SVG child is unreliable — it needs a perspective ancestor and
   browsers disagree about how it composes with `transform-box: view-box`. A
   horizontal squash about the hinge is the flat-art convention for the same
   gesture and it composes predictably. x56 is the roll's axis, so the sheet
   collapses onto the roll rather than onto empty space.

   IT DOES NOT REACH 0. At scale-X 0 the sheet's two horizontal edges collapse
   into their own round caps and flash as a pair of dots. 0.08 keeps a sliver.

   THE GRID FADES ON THE WAY DOWN and is back by the time the sheet is open,
   because a grid squashed to a sliver is four overlapping caps and reads as
   dirt on the hinge. */
const turnSheet: Variants = {
  normal: { scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleX: [1, 0.08, 0.08, 1],
    transition: {
      duration: 1.4,
      times: [0, 0.34, 0.46, 1],
      ease: ["easeIn", "linear", [0.22, 1, 0.32, 1]],
    },
  },
};
const turnGrid: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 0, 0, 1],
    transition: { duration: 1.4, times: [0, 0.22, 0.62, 0.9], ease: "linear" },
  },
};

/* ══ 5. PULSE ════════════════════════════════════════════════════════════════
   The grid breathes outward from its own centre while the sheet holds — the
   drawing being read rather than made.

   THE PULSE IS ON THE GRID GROUP, ABOUT (148,128), which is the grid's bbox
   centre and NOT the sheet's (148,132). Four units matters here: pulsed about the
   sheet centre the grid visibly drifts downward as it grows, because the scale
   amplifies the offset.

   1.14 IS THE CEILING. The grid spans x104..192 inside a sheet whose inner wall
   is at x232/x64; at 1.2 the horizontals touch the sheet's edge stroke and the
   drawing reads as overflowing its paper. */
const pulseGrid: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.97, 1.14, 1, 1.06, 1],
    transition: {
      duration: 1.5,
      times: [0, 0.14, 0.36, 0.58, 0.74, 1],
      ease: ["easeIn", "easeOut", "easeInOut", "easeOut", "easeInOut"],
    },
  },
};
const pulseSheet: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.02, 1, 1.01, 1],
    transition: { duration: 1.5, times: [0, 0.36, 0.58, 0.74, 1], ease: "easeInOut" },
  },
};

/* ══ 6. BLUEPRINT — 2 + 3 ════════════════════════════════════════════════════
   The paper draws itself, and the moment it is finished the grid flies in and
   snaps onto it. `2 · Draw`'s pen for the sheet, `3 · Snap`'s placement for the
   grid.

   COMPOSING THEM CHANGES WHAT THE GRID MEANS. In 2 the grid is drawn by the same
   pen as the sheet, so the whole icon reads as one continuous act of drawing. In
   3 the sheet is a given and only the grid is placed. Put 2's sheet under 3's
   grid and you get the thing neither has on its own: paper is DRAWN, marks are
   PLACED. Two different tools, in the right order.

   THE HANDOFF IS THE ONLY REAL DECISION HERE. The sheet's pen lands at 0.50 and
   the first line begins its approach at 0.54 — the same 4% beat `1 · Roll Out`
   uses, and for the same reason: the paper has to visibly exist before anything
   lands on it. Start the snap earlier and the lines fly toward a sheet that is
   still being drawn, which reads as two animations colliding rather than one
   handing off to the other.

   THE SNAP IS TIGHTER THAN IN 3 (0.08 between lines, against 0.10) because it
   now has only the back half of the pass to finish in. The overshoot and the
   entry axes are untouched — those are what make it read as placement, and
   compressing them would turn it into a wipe. */
const comboDraw: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 1.9, times: [0, 0.5], ease: "easeInOut" },
      opacity: { duration: 1.9, times: [0, 0.05], ease: "linear" },
    },
  },
};
const COMBO_SNAPS = [
  snapFrom(0, -70, 0.54, 1.9),
  snapFrom(0, 70, 0.62, 1.9),
  snapFrom(-80, 0, 0.7, 1.9),
  snapFrom(80, 0, 0.78, 1.9),
];

/* ══ 7. STAMP ════════════════════════════════════════════════════════════════
   The whole mark presses down and springs back, and the grid flashes on impact —
   the drawing being approved.

   THE DIP IS ANTICIPATION, THE SQUASH IS THE HIT. Scale rises to 1.05 first
   (winding up), then drops through 0.9 on the strike, then rings out 1.04, 0.99,
   1. Without the wind-up the mark just shrinks.

   THE FLASH IS ON THE GRID ONLY and lasts ~70ms, landing exactly on the 0.9
   trough. A flash that outlives the impact reads as a separate blink; one that
   lands with it reads as the consequence of the hit.

   SCALE ABOUT THE SHEET CENTRE (148,132), not the artboard centre — the mark is
   left-heavy because of the roll, and pressing about (128,128) visibly slides it. */
const stampBody: Variants = {
  normal: { scale: 1, y: 0, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1.05, 0.9, 1.04, 0.99, 1],
    y: [0, -6, 4, -2, 1, 0],
    transition: {
      duration: 1.15,
      times: [0, 0.22, 0.4, 0.58, 0.78, 1],
      ease: ["easeOut", "easeIn", "easeOut", "easeInOut", "easeOut"],
    },
  },
};
const stampFlash: Variants = {
  normal: { opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    opacity: [1, 1, 0.25, 1, 1],
    transition: { duration: 1.15, times: [0, 0.36, 0.4, 0.46, 1], ease: "linear" },
  },
};

/* ── variants ────────────────────────────────────────────────────────────── */

function Static({
  size,
  style,
  bind,
  ...props
}: IconProps & { bind: ReturnType<typeof useHover>["bind"] }) {
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256">
        <g {...STROKE}>
          <path d={MARK} />
          {GRID.map((l, i) => (
            <line key={i} {...l} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/** The stroked 256-grid wrapper. The shared harness `Svg` fills, so this doesn't use it. */
function Frame({
  size,
  controls,
  children,
}: {
  size: number;
  controls: ReturnType<typeof useHover>["controls"];
  children: React.ReactNode;
}) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      initial="normal"
      animate={controls}
      style={{ overflow: "visible" }}
    >
      <g {...STROKE}>{children}</g>
    </motion.svg>
  );
}

const RollOutIcon = forwardRef<IconHandle, IconProps>(function RollOutIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  // Own clip id per instance, or the first icon on the page captures them all.
  const clipId = `bp-roll-${useId()}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Frame size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            {/* Right edge parked on x64 — the roll/sheet seam. Slides +176 to x240. */}
            <motion.rect x={-236} y={-20} width={300} height={300} variants={rollSheet} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path d={MARK} />
        </g>
        {GRID.map((l, i) => (
          <motion.line key={i} {...l} variants={ROLL_DRAWS[i]} />
        ))}
      </Frame>
    </div>
  );
});

const DrawIcon = forwardRef<IconHandle, IconProps>(function DrawIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Frame size={size} controls={controls}>
        <motion.path d={MARK} variants={drawMark} />
        {GRID.map((l, i) => (
          <motion.line key={i} {...l} variants={DRAW_GRID[i]} />
        ))}
      </Frame>
    </div>
  );
});

const SnapIcon = forwardRef<IconHandle, IconProps>(function SnapIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Frame size={size} controls={controls}>
        <path d={MARK} />
        {GRID.map((l, i) => (
          <motion.line key={i} {...l} variants={SNAPS[i]} />
        ))}
      </Frame>
    </div>
  );
});

const TurnIcon = forwardRef<IconHandle, IconProps>(function TurnIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Frame size={size} controls={controls}>
        {/* Hinge at the roll's axis, so the sheet folds onto the roll. */}
        <motion.g variants={turnSheet} style={AT(SPINE_X, SHEET_CY)}>
          <path d={MARK} />
          <motion.g variants={turnGrid}>
            {GRID.map((l, i) => (
              <line key={i} {...l} />
            ))}
          </motion.g>
        </motion.g>
      </Frame>
    </div>
  );
});

const PulseIcon = forwardRef<IconHandle, IconProps>(function PulseIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Frame size={size} controls={controls}>
        <motion.path d={MARK} variants={pulseSheet} style={AT(GRID_CX, SHEET_CY)} />
        <motion.g variants={pulseGrid} style={AT(GRID_CX, GRID_CY)}>
          {GRID.map((l, i) => (
            <line key={i} {...l} />
          ))}
        </motion.g>
      </Frame>
    </div>
  );
});

const BlueprintIcon = forwardRef<IconHandle, IconProps>(function BlueprintIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Frame size={size} controls={controls}>
        {/* 2's pen draws the sheet; 3's placement brings the grid in after it. */}
        <motion.path d={MARK} variants={comboDraw} />
        {GRID.map((l, i) => (
          <motion.line key={i} {...l} variants={COMBO_SNAPS[i]} />
        ))}
      </Frame>
    </div>
  );
});

const StampIcon = forwardRef<IconHandle, IconProps>(function StampIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Frame size={size} controls={controls}>
        <motion.g variants={stampBody} style={AT(GRID_CX, SHEET_CY)}>
          <path d={MARK} />
          <motion.g variants={stampFlash}>
            {GRID.map((l, i) => (
              <line key={i} {...l} />
            ))}
          </motion.g>
        </motion.g>
      </Frame>
    </div>
  );
});

/* ── assembly ────────────────────────────────────────────────────────────── */

const VARIANTS: LabVariant[] = [
  { name: "1 · Roll Out", blurb: "Unrolls like a carpet, then the grid draws on", Component: RollOutIcon },
  { name: "2 · Draw", blurb: "Outline draws itself, then the grid follows", Component: DrawIcon },
  { name: "3 · Snap", blurb: "Grid lines fly in along their own axes and settle", Component: SnapIcon },
  { name: "4 · Turn", blurb: "Sheet folds onto the roll and opens again", Component: TurnIcon },
  { name: "5 · Pulse", blurb: "Grid breathes outward, sheet holds", Component: PulseIcon },
  {
    name: "6 · Blueprint",
    blurb: "2 + 3 — paper draws itself, then the grid snaps on",
    Component: BlueprintIcon,
  },
  { name: "7 · Stamp", blurb: "Presses down and springs — grid flashes on impact", Component: StampIcon },
];

export default function BlueprintLabPage() {
  // playMs must outlast the LONGEST variant — 1 · Roll Out runs 1.9s, so anything
  // under 1900 cuts the last grid line off mid-draw.
  return <VariantGrid title="Blueprint" variants={VARIANTS} cycleMs={3600} playMs={2200} />;
}
