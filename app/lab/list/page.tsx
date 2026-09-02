"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE, SWEEP, staged } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — List, five takes, each expressing a different thing a LIST does.
 *
 * VERB: not one verb but five, and that is the point of this page. A list
 * populates, is read down, folds, scrolls, and reorders. What it does NOT do is
 * "pulse" or "wiggle" — three parallel bars are the easiest mark in the set to
 * throb pointlessly, and every candidate here had to name a list behaviour before
 * it got a keyframe (§0).
 *
 * MATERIAL: paper / rows (§9) — ARRIVE, 3-5% overshoot, 1.0x base duration. These
 * are lines of content, not metal and not rubber: they settle onto a position the
 * way a row snaps to a grid. Nothing here squashes.
 *
 * THE GLYPH ALREADY CONTAINS THE MOVING PARTS (§0 gate 1). Three separate `line`
 * elements, already drawn. So the rows move and nothing else does — no added
 * geometry anywhere except 4 · Scroll's wrap row, which is discussed there.
 *
 * ── MEASURED, not assumed (512x512, counting only pixels that flip ink/no-ink) ─
 *
 *   ink bbox   x32..223.5, y56..199.5 (round caps add 8 to each end of a
 *              40..216 line). LANE: 32 left, 32.5 right, 56 top, 56.5 bottom.
 *              Nothing touches a wall, so a 20-unit lateral nudge is free —
 *              223.5 + 20 = 243.5, still 12 units inside the box.
 *   row pitch  64 units. At 24px that is 6px between rows: the largest clear
 *              travel lane in this mark by a wide margin.
 *
 *   THE MARK IS INVARIANT UNDER PERMUTING ITS ROWS, and that is the finding 5 ·
 *   Sort is built on:
 *
 *        rotate 180deg about (128,128)  ->  0.0000%
 *        mirror about y=128             ->  0.0000%
 *
 *   Three identical bars at equal pitch: swap any two and the picture is
 *   pixel-for-pixel the same. So a gesture may END with every row somewhere
 *   different and still land exactly on rest — which is what lets 5 · Sort be a
 *   true reorder rather than a there-and-back-again.
 *
 *   A ONE-ROW SCROLL IS 16.6667% OFF REST if you just translate. Measured, not
 *   guessed: shift four rows up by one pitch and the exiting row parks at y=0,
 *   where its lower half (round cap, y-8..+8) is still inside the box. 16.67% is
 *   exactly one half-row out of three. That number is why 4 · Scroll's boundary
 *   fades are load-bearing and not decoration — see the note there.
 *
 * ── AMPLITUDE (§2) ─────────────────────────────────────────────────────────
 *
 * Floor is 18 units. Primary travels here: Cascade draws 176, Tick nudges 20,
 * Collapse and Scroll move a full 64 pitch, Sort moves 128. All clear it. The
 * small return overshoots (4-6 units) are deliberately under it — §2's exception
 * for secondary detail riding a primary that already clears the floor threefold
 * or better.
 *
 * ── REJECTED (§17) ─────────────────────────────────────────────────────────
 *
 *   · A STAGGERED SCALE PULSE on the three rows — the obvious first idea for
 *     parallel bars, and precisely the §0 failure: amplitude standing in for a
 *     verb. Three bars throbbing is what makes a set read as machine-generated.
 *   · THE HAMBURGER -> X MORPH. It is the best-known gesture for this shape and
 *     it is wrong for THIS icon: the mark is `list`, and a still frame 60% through
 *     the morph does not read as a list (§0 gate 2) — it reads as a close button.
 *     It belongs on a menu-toggle icon that owns both states, not here.
 *   · CLIPPING THE SCROLL TO THE INK BAND (y56..200) instead of fading. It cuts
 *     the round caps flat mid-travel, which is §4's "stub with a flat cut-off
 *     end" — the most obvious tell that nobody looked at the output.
 *
 * ── THE STANDING TEST — the failure I was most worried about ───────────────
 *
 * **5 · Sort's travelling row crosses the other two.** All three bars are the same
 * colour, so at the crossings they merge and the icon momentarily reads as two
 * rows instead of three. At 56px it is legible; at 20px it is the one thing here
 * that could read as a glitch. Mitigated by holding the traveller 20 units to the
 * RIGHT for the whole crossing, so its right end always protrudes past the others
 * and the silhouette never collapses to a clean single bar — and by separating the
 * lift from the travel (§11) so the eye has already been told which row is moving.
 * It is still the candidate to judge at 20px before promoting; 2 and 3 are the
 * safe productive-tier picks.
 *
 * Second worry: **1 · Cascade opens on `pathLength: 0`**, which §1 flatly forbids
 * as a rest-parity break — frame 0 is not the icon. It is licensed here on
 * exactly the `blueprint` precedent: the mark is `fill="none" stroke`, so
 * `pathLength` is native rather than faked with clips (§5), and DRAWING IS THE
 * VERB — a list populating is the one gesture where starting empty is the
 * content. It closes on rest, and it is the only candidate that opens off it.
 */

const X1 = 40;
const X2 = 216;
/** Authored row positions. Pitch 64. */
const ROWS = [64, 128, 192] as const;

/** Every variant draws its rows through this, so rest is one definition. */
function Rows({ children }: { children?: React.ReactNode }) {
  return (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={16}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </g>
  );
}

const line = (y: number) => ({ x1: X1, y1: y, x2: X2, y2: y });

/* == 1. CASCADE =============================================================
   The list populates: each row draws left to right, one after the other.

   THE OPACITY TWEEN IS NOT DECORATION (§5). Every row is round-capped, and a
   round-capped stroke at `pathLength: 0` renders a full 16-wide DOT parked at its
   start point — without this, three blobs sit at x40 through the whole stagger.
   These are LONG strokes (176 units, ~16.5px at ship size), so they take the long-
   stroke remedy: opacity gets its own much faster tween, up over the first 0.05 of
   the row's own pass. Fading across the whole draw instead would hold the finished
   part of each row semi-transparent for most of a second — the exact mistake §5
   warns against merging the two cases into.

   `staged(i)` at its 0.09 default: 0, 0.09, 0.18 — a 180ms cascade, comfortably
   inside the 500ms stagger budget (§11). Past that the last row reads as a
   straggler rather than as part of the same act. */
const cascade = (i: number): Variants => ({
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 0.42, delay: staged(i), ease: ARRIVE },
      opacity: { duration: 0.05, delay: staged(i), ease: "linear" },
    },
  },
});

/* == 2. TICK ================================================================
   Better than 1 because 1 has to start from nothing to say anything. This says it
   from the resting mark: a cursor runs DOWN the list, each row stepping aside as
   it is passed and settling back.

   THE STAGGER IS THE WHOLE GESTURE, so it is wider than the default — 0.12 rather
   than staged()'s 0.09. At 0.09 the three rows read as one block twitching; at
   0.12 the eye follows a single thing travelling downward. Total 240ms, still
   inside budget.

   20 UNITS, NOT MORE. The right lane is 32.5, so 20 keeps the caps 12 units clear
   of the wall (§4) and still clears the 18-unit floor. A row that leaves the box
   to make a point is a row that clips in someone else's toolbar. */
const tick = (i: number): Variants => ({
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 20, 0],
    transition: {
      duration: 0.46,
      delay: 0.12 * i,
      times: [0, 0.42, 1],
      ease: [ARRIVE, "easeInOut"],
    },
  },
});

/* == 3. COLLAPSE ============================================================
   Better than 2 because 2 moves the rows without changing what the list IS. Here
   the outer rows fold onto the middle — the list closes — hold for a beat, and
   spring back open.

   THE MIDDLE ROW NEVER MOVES. It is the hinge, and giving it motion of its own
   would leave nothing for the other two to collapse onto. One part still is what
   makes the other two read as travelling.

   64 units each, a full pitch, so at the closed pose all three rows land on y128
   and the mark reads as a single bar. That is the collapsed state, and it is the
   one moment in this page where the icon deliberately stops looking like itself —
   for 0.14 of the pass, between two poses that are exactly rest.

   THE RETURN OVERSHOOTS BY 5 UNITS AND SETTLES. Paper, not metal (§9): 3-5%
   overshoot, no spring past that. 5 units is under the amplitude floor on its own
   and correct as §2's exception — it rides a 64-unit primary. */
const COLLAPSE_DUR = 0.78;
const collapse = (dir: -1 | 0 | 1): Variants =>
  dir === 0
    ? { normal: { y: 0, transition: RETURN_TRANSITION }, animate: { y: 0 } }
    : {
        normal: { y: 0, transition: RETURN_TRANSITION },
        animate: {
          // 0.34 close · 0.14 HOLD closed · 0.14 open past home · settle
          y: [0, dir * 64, dir * 64, dir * -5, 0],
          transition: {
            duration: COLLAPSE_DUR,
            times: [0, 0.34, 0.48, 0.62, 1],
            ease: ["easeInOut", "linear", "easeOut", ARRIVE],
          },
        },
      };

/* == 4. SCROLL ==============================================================
   Better than 3 because 3 animates the container and this animates the CONTENT.
   The stack travels up exactly one row pitch; the top row leaves and a fourth row
   arrives from below to take the vacated slot.

   THE FOURTH ROW IS THE ONLY GEOMETRY ADDED ANYWHERE ON THIS PAGE, and it is a
   wrap row, not a new part of the mark: at rest it sits at y256 — outside the box
   AND at opacity 0 — so the resting picture is the three authored rows exactly.

   THE BOUNDARY FADES ARE LOAD-BEARING, AND THE NUMBER PROVES IT. Translate four
   rows up one pitch with no fades and the final pose is 16.6667% OFF REST —
   measured, and it is exactly one half-row out of three: the exiting row parks at
   y0, where its round cap still paints from y0 to y8 inside the box. So the top
   row fades as it crosses out and the wrap row fades as it crosses in, and the
   final pose is rest. This is opacity SOFTENING something that is already
   travelling, which §1 permits — it is not opacity standing in for motion, and it
   is not hiding a clip: the alternative (clipping to the ink band) cuts the caps
   flat mid-travel, which §4 rejects outright.

   SWEEP, because this is travel across the artboard, and one continuous move
   rather than a stagger — rows in a scrolling list do not move independently. */
const SCROLL_ROWS = [64, 128, 192, 256] as const;
const SCROLL_DUR = 0.62;

/**
 * TRANSLATION AND FADE RIDE ON THE SAME ELEMENT, and that is not a style choice —
 * it is a bug fix. The first build put the shared `y` on a `motion.g` wrapping the
 * four rows and the per-row opacity on the `motion.line`s inside it. The opacities
 * animated; THE GROUP NEVER MOVED. Verified in the DOM rather than by eye: the
 * group's transform stayed empty for the whole pass while its children's opacity
 * tweened normally, so the "scroll" was four rows fading in place — a §1 failure
 * (opacity standing in for the motion) that looked plausible in a 56px tile.
 * Every transform on this page now sits directly on the element that owns it.
 */
const scrollRow = (i: number): Variants => ({
  normal: { y: 0, opacity: i === 3 ? 0 : 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -64],
    // Row 0 leaves at the top; row 3 arrives from below. The middle two just ride.
    opacity: i === 0 ? [1, 1, 0] : i === 3 ? [0, 1, 1] : [1, 1, 1],
    transition: {
      y: { duration: SCROLL_DUR, ease: SWEEP },
      opacity: { duration: SCROLL_DUR, times: [0, 0.55, 1], ease: "linear" },
    },
  },
});

/* == 5. SORT ================================================================
   Better than all four because they all keep the rows in the order they found
   them. This is the one gesture that is about a list's ORDER: the top row lifts
   out of the stack, travels down past the other two, and inserts at the bottom
   while they slide up to close the gap.

   THIS IS WHY THE 0.0000% MEASUREMENT MATTERS. Row A ends 128 units lower, B and C
   each end 64 higher — every row finishes somewhere it did not start, and the
   final picture is nonetheless pixel-identical to rest, because three identical
   bars at equal pitch are invariant under permutation. A reorder that genuinely
   reorders and still lands on the authored mark is only possible on a glyph with
   this symmetry; do not port this gesture to rows of differing length.

   SO `normal` PARKS ON THE FINAL OFFSETS, NOT ON ZERO (A: +128, B and C: -64).
   Two things fall out, both better than the alternative:
     · Hover-out after the gesture completes is a no-op, instead of dragging every
       row back through the others in reverse — a list visibly un-sorting.
     · A mid-gesture interrupt COMPLETES the sort forward. The rows finish where
       they were going.
   The animate array opens at 0 while the rows sit at their final offsets, which is
   an instantaneous jump between two poses that are THE SAME PICTURE. Invisible,
   and only legitimate because of the 0.0000%.

   THE LIFT IS SEPARATED FROM THE TRAVEL (§11). A moves right over 0->0.18 and does
   not begin descending until 0.24 — a 6% beat that says WHICH row is moving before
   it starts moving through the others. Overlap them and it reads as a row falling
   rather than being taken out and placed.

   B AND C LAG A BY 0.06 (§10, follow-through). They are closing a gap that has to
   visibly exist first; started together, the gap never opens and the sort reads as
   all three rows sliding at once. */
const SORT_DUR = 1.15;
/** The traveller: right, down past the others, back into line. */
const sortLead: Variants = {
  normal: { x: 0, y: 128, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 20, 20, 20, 0],
    y: [0, 0, 0, 128, 128],
    transition: {
      duration: SORT_DUR,
      times: [0, 0.18, 0.24, 0.72, 0.88],
      ease: [ARRIVE, "linear", SWEEP, ARRIVE],
    },
  },
};
/** The two that close up, lagging the lead out of the gap it leaves. */
const sortFollow: Variants = {
  normal: { y: -64, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 0, -64, -64],
    transition: {
      duration: SORT_DUR,
      times: [0, 0.3, 0.74, 1],
      ease: ["linear", ARRIVE, "linear"],
    },
  },
};

/* -- assembly ------------------------------------------------------------- */

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
        fill="none"
      >
        <Rows>
          {ROWS.map((y) => (
            <line key={y} {...line(y)} />
          ))}
        </Rows>
      </svg>
    </div>
  );
}

/** 1-3 give every row its own variant, indexed. */
function makePerRow(name: string, make: (i: number) => Variants) {
  const C = forwardRef<IconHandle, IconProps>(function ListIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <Rows>
            {ROWS.map((y, i) => (
              <motion.line key={y} {...line(y)} variants={make(i)} />
            ))}
          </Rows>
        </Svg>
      </div>
    );
  });
  C.displayName = name;
  return C;
}

const CascadeIcon = makePerRow("CascadeIcon", cascade);
const TickIcon = makePerRow("TickIcon", tick);
const CollapseIcon = makePerRow("CollapseIcon", (i) =>
  collapse(i === 0 ? 1 : i === 2 ? -1 : 0),
);

const ScrollIcon = forwardRef<IconHandle, IconProps>(function ScrollIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  // Own clip id per instance, or the first tile on the page captures them all.
  const clipId = `list-scroll-${useId()}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="256" height="256" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <Rows>
            {SCROLL_ROWS.map((y, i) => (
              <motion.line key={y} {...line(y)} variants={scrollRow(i)} />
            ))}
          </Rows>
        </g>
      </Svg>
    </div>
  );
});

const SortIcon = forwardRef<IconHandle, IconProps>(function SortIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <Rows>
          <motion.line {...line(ROWS[0])} variants={sortLead} />
          <motion.line {...line(ROWS[1])} variants={sortFollow} />
          <motion.line {...line(ROWS[2])} variants={sortFollow} />
        </Rows>
      </Svg>
    </div>
  );
});

const VARIANTS: LabVariant[] = [
  { name: "1 · Cascade", blurb: "Rows draw in left→right, staggered", Component: CascadeIcon },
  { name: "2 · Tick", blurb: "A cursor runs down, each row steps aside", Component: TickIcon },
  { name: "3 · Collapse", blurb: "Outer rows fold onto the middle and reopen", Component: CollapseIcon },
  { name: "4 · Scroll", blurb: "Stack travels one pitch, a row wraps in", Component: ScrollIcon },
  { name: "5 · Sort", blurb: "Top row lifts, drops to last, others close up", Component: SortIcon },
];

export default function ListLabPage() {
  // playMs must outlast the LONGEST variant or the auto-cycle truncates it —
  // 5 · Sort runs 1.15s, so anything under 1400 cuts its final insertion off.
  return <VariantGrid title="List" variants={VARIANTS} cycleMs={3200} playMs={1800} />;
}
