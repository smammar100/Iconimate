"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// COLLAPSE — the list folds shut and springs back open: the outer two rows travel
// a full row-pitch onto the middle one, hold there closed for a beat, then open
// past home and settle.
//
// VERB: it FOLDS. A list is a stack of rows with space between them, and the one
// thing that space can do is close. Not "pulse" — three parallel bars are the
// easiest mark in the set to throb pointlessly, and a staggered scale pulse was
// the first idea here and was thrown away as exactly the §0 failure: amplitude
// standing in for a verb.
//
// MATERIAL: paper / rows (§9) — ARRIVE, 3-5% overshoot, 1.0x base. These are lines
// of content, not metal and not rubber. Nothing here squashes, and the reopen
// overshoots by 5 units and settles rather than springing.
//
// THE GLYPH ALREADY CONTAINS THE MOVING PARTS (§0 gate 1): three separate `line`
// elements, already drawn. So the rows move and nothing else does. No geometry is
// added anywhere in this file.
//
// Promoted from `app/lab/list/page.tsx` (variant 3 of 5 — Cascade, Tick, Collapse,
// Scroll, Sort); the four rejected takes and the full measurements live there.
//
// ── MEASURED (512x512, counting only pixels that flip ink/no-ink) ──────────
//
//   ink bbox   x32..223.5, y56..199.5 — round caps add 8 to each end of a 40..216
//              line. LANE: 32 left, 32.5 right, 56 top, 56.5 bottom. Nothing
//              touches a wall, and this gesture is purely vertical within the
//              existing stack, so nothing can leave the box (§4).
//   row pitch  64 units — the travel distance here, and the largest clear lane in
//              this mark. At 24px that is 6px per row.
//
//   rotate 180deg about (128,128) -> 0.0000%     mirror about y=128 -> 0.0000%
//
//   Three identical bars at equal pitch are invariant under permutation and under
//   reflection. That symmetry is why the OUTER rows are the ones that move: the
//   gesture is mirror-symmetric about the middle row, so it cannot introduce a
//   visual bias toward the top or bottom of the stack.
//
// ── THE MIDDLE ROW NEVER MOVES ─────────────────────────────────────────────
//
// It is the hinge. Giving it motion of its own leaves the other two nothing to
// collapse ONTO — one part held still is what makes the other two read as
// travelling rather than as the whole mark scaling down. Its variant is a static
// `y: 0` rather than an omitted variant, so it is explicit at the call site.
//
// ── TIMING ─────────────────────────────────────────────────────────────────
//
//   0.00-0.34  CLOSE. 64 units each, easeInOut — moving while on screen (§8).
//   0.34-0.48  HOLD CLOSED. ~109ms of stillness. Without it the gesture is a
//              bounce off the centre; with it the list is briefly, deliberately
//              SHUT, which is the whole content of the motion.
//   0.48-0.62  OPEN, past home by 5 units.
//   0.62-1.00  SETTLE onto rest under ARRIVE.
//
// Amplitude (§2): 64 units of primary travel, 3.5x the 18-unit floor. The 5-unit
// reopen overshoot is deliberately under the floor — §2's exception for secondary
// detail riding a primary that clears it comfortably.
//
// ── REJECTED (§17) ─────────────────────────────────────────────────────────
//
//   · A STAGGERED SCALE PULSE on the three rows. The obvious first idea for
//     parallel bars and precisely what makes a set read as machine-generated.
//   · THE HAMBURGER -> X MORPH. Best-known gesture for this shape, wrong for THIS
//     icon: the mark is `list`, and a still frame 60% through the morph reads as a
//     close button, not a list (§0 gate 2). It belongs on a menu-toggle icon that
//     owns both states.
//   · MOVING ALL THREE ROWS toward a common centre. With the middle row also
//     moving there is no hinge, and the result reads as the icon scaling on Y
//     rather than as rows folding.
//
// ── THE STANDING TEST — the failure I was most worried about ───────────────
//
// AT THE CLOSED POSE ALL THREE ROWS OVERLAP ON y128, so for ~109ms the icon is a
// SINGLE BAR — a list that briefly is not a list. That is the one thing here that
// could read as a glitch at 20px rather than as a fold.
//
// Resolved, and checked against §0 gate 2 rather than by eye: a still frame 60%
// through the pass has the outer rows already back within 5 units of home
// (interpolating the 0.48->0.62 leg puts them at y+4.9), so the frame reads as the
// list. The single-bar pose occupies 34-48% of the pass and is bounded on both
// sides by poses that are exactly rest. It is a state the gesture passes THROUGH
// at speed, not one it holds long enough to be mistaken for the resting mark.
//
// Second worry, the FIFTIETH HOVER: at 0.78s this is Expressive tier (§8) and
// `list` is a nav icon that may fire all day. It survives that room because the
// motion is one closed round trip with no repeat, no accent and no ambient layer —
// nothing moves unless the user is pointing at it, so it cannot compete for
// peripheral attention (standing test 5). The hit area is fixed: the rows travel
// only inward, so the mark's silhouette never grows and never moves out from under
// the cursor. Every exit lands on y0 — the authored mark — because `normal` is
// plain `y: 0` and RETURN_TRANSITION carries any interrupt straight back to it.

const X1 = 40;
const X2 = 216;
/** Authored row positions. Pitch 64; the middle one is the hinge. */
const ROWS = [64, 128, 192] as const;

const line = (y: number) => ({ x1: X1, y1: y, x2: X2, y2: y });

const DUR = 0.78;

/** `dir` is the direction a row travels to reach the middle: +1 top, -1 bottom,
 *  0 for the hinge, which holds still explicitly. */
const collapse = (dir: -1 | 0 | 1): Variants =>
  dir === 0
    ? { normal: { y: 0, transition: RETURN_TRANSITION }, animate: { y: 0 } }
    : {
        normal: { y: 0, transition: RETURN_TRANSITION },
        animate: {
          // close · HOLD closed · open past home · settle
          y: [0, dir * 64, dir * 64, dir * -5, 0],
          transition: {
            duration: DUR,
            times: [0, 0.34, 0.48, 0.62, 1],
            ease: ["easeInOut", "linear", "easeOut", ARRIVE],
          },
        },
      };

const DIRS = [1, 0, -1] as const;

export const ListIcon = forwardRef<IconHandle, IconProps>(function ListIcon(
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
          fill="none"
          stroke="currentColor"
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ROWS.map((y) => (
            <line key={y} {...line(y)} />
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
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial="normal"
        animate={controls}
      >
        {/* Transforms sit directly on each `line`. A shared `motion.g` carrying the
            travel was tried in the lab and silently did not animate while its
            children's variants did — every transform here owns its own element. */}
        {ROWS.map((y, i) => (
          <motion.line key={y} {...line(y)} variants={collapse(DIRS[i])} />
        ))}
      </motion.svg>
    </div>
  );
});
