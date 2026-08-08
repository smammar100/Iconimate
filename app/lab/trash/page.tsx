"use client";

import { forwardRef, useId, useImperativeHandle, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, Svg, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Trash, five takes.
 *
 * NOTHING HERE IS REBUILT FROM SUB-PATHS. The glyph is one compound path, so
 * every moving part is the WHOLE original path drawn again and clipped to a box.
 * The boxes TILE THE PLANE, so the layers composite back to the untouched mark —
 * rest is exact by construction rather than by tolerance. Splitting a `d` string
 * into pieces is how rest states drift; the clip route has no such failure mode.
 *
 * y=64 IS A REAL HINGE LINE, and that is measured, not assumed. Scanning the
 * rendered fill row by row:
 *
 *   y63 -> one run  x36.5..219.3          the lid bar, full width
 *   y65 -> two runs x48..63.8, x192..207.8  the can's two walls only
 *
 * So the lid ends and the can begins exactly there, and a clip at y=64 separates
 * them without cutting through any ink that belongs to both. The cut edge that
 * appears under the lid when it opens is a flat bottom, which is what a lid has.
 *
 * ANATOMY, measured off the rendered fill at 4x:
 *   mark     x32..223.75, y16..223.75
 *   handle   two uprights at y32: x81.3..102.3 and x153.5..174.5
 *   lid bar  y48..64, widest x32..223.75 at y56 (the round caps)
 *   can      walls x48..63.8 and x192..207.8; floor to y223.75
 *   bars     two, x96..111.8 and x144..159.8, y96..176
 *
 * HEADROOM IS THE BINDING CONSTRAINT ON THE LID. The handle already reaches y16,
 * leaving 16 units above it, so a lid hinged at one END swings its far corner
 * straight off the artboard — at -22deg about the left end the right corner
 * lands at y-11. Every open below therefore rotates about the LID'S OWN CENTRE
 * (128,44) and adds a small lift, which spends the headroom evenly instead of
 * all at one end.
 */
const TRASH =
  "M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z";

const rect = (x: number, y: number, w: number, h: number) =>
  `M${x},${y}H${x + w}V${y + h}H${x}Z`;
const FULL_BOX = rect(-16, -16, 288, 288);
/** The two halves meet exactly on the measured hinge line and tile the plane. */
const LID_BOX = rect(-16, -16, 288, 80); // y -16..64
const CAN_BOX = rect(-16, 64, 288, 208); // y  64..272
/** Just the two inner bars — at y120 the runs are wall, bar, bar, wall, so this
 *  window catches both bars and neither wall. */
const BARS_BOX = rect(94, 94, 68, 86);

const LID_PIVOT = { x: 128, y: 44 };

/* ══ 1. LIFT ═════════════════════════════════════════════════════════════════
   The lid comes up, hangs a moment, and drops back on. The DROP IS FASTER THAN
   THE LIFT and lands with a small bounce — a lid that returns at the same speed
   it left reads as being placed, not as falling shut. */
const lift: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -7, -7, 1, 0],
    rotate: [0, -14, -14, 2, 0],
    transition: {
      duration: 0.92,
      times: [0, 0.3, 0.62, 0.86, 1],
      ease: ["easeOut", "linear", "easeIn", "easeOut"],
    },
  },
};

/* ══ 2. SHAKE ════════════════════════════════════════════════════════════════
   A quick refusal — the whole can rocks and settles, each swing about half the
   last so it actually resolves instead of buzzing. Nothing is split here, so
   this one is exact at rest by definition. */
const shake: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -8, 6.5, -3.5, 1.5, 0],
    transition: { duration: 0.72, times: [0, 0.14, 0.34, 0.54, 0.76, 1], ease: "easeInOut" },
  },
};

/* ══ 3. EMPTY ════════════════════════════════════════════════════════════════
   The lid opens and the CONTENTS FALL OUT — the two inner bars drop through the
   floor and fade, then everything comes back. Three regions here rather than
   two, and they still tile: lid above y64, the bars' window, and the can with
   that window punched out of it.

   The bars accelerate as they go (easeIn) because they are falling, and they
   fade only in the last third — a bar that fades while it is still inside the
   can reads as vanishing rather than as leaving. */
const emptyLid: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -8, -8, 0],
    rotate: [0, -16, -16, 0],
    transition: { duration: 1.1, times: [0, 0.22, 0.72, 1], ease: ["easeOut", "linear", "easeIn"] },
  },
};
const emptyBars: Variants = {
  normal: { y: 0, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 0, 96, 96, 0],
    opacity: [1, 1, 0, 0, 1],
    transition: {
      duration: 1.1,
      times: [0, 0.24, 0.6, 0.86, 1],
      ease: ["linear", "easeIn", "linear", "easeOut"],
    },
  },
};

/* ══ 4. CRUSH ════════════════════════════════════════════════════════════════
   The can compresses and springs back, the lid riding down on top of it and
   overshooting as it releases. Scaling about the FLOOR (y=224) rather than the
   centre is what makes it read as being pressed down onto something solid; about
   the centre it would look like the whole object shrinking. */
const crushCan: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.74, 1.08, 0.96, 1],
    transition: { duration: 0.82, times: [0, 0.3, 0.6, 0.8, 1], ease: ["easeIn", "easeOut", "easeInOut", "easeOut"] },
  },
};
const crushLid: Variants = {
  normal: { y: 0, scaleX: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 42, -6, 2, 0],
    scaleX: [1, 1.06, 0.98, 1.01, 1],
    transition: { duration: 0.82, times: [0, 0.3, 0.6, 0.8, 1], ease: ["easeIn", "easeOut", "easeInOut", "easeOut"] },
  },
};

/* ══ 5. TOSS ═════════════════════════════════════════════════════════════════
   Something lands in it: the lid flips up out of the way, the can takes the
   weight with a dip, and the lid claps shut after. The lid LEADS and the dip
   FOLLOWS — the can cannot absorb an impact before the thing has got in. */
const tossLid: Variants = {
  normal: { y: 0, rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -9, -9, 0, 0],
    rotate: [0, -20, -14, 3, 0],
    transition: {
      duration: 0.95,
      times: [0, 0.2, 0.42, 0.7, 1],
      ease: ["easeOut", "linear", "easeIn", "easeOut"],
    },
  },
};
const tossCan: Variants = {
  normal: { y: 0, scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    y: [0, 0, 5, -2, 0],
    scaleY: [1, 1, 0.93, 1.03, 1],
    transition: {
      duration: 0.95,
      times: [0, 0.4, 0.58, 0.78, 1],
      ease: ["linear", "easeIn", "easeOut", "easeOut"],
    },
  },
};

/* ── the tip-in gesture, shared by 6 and 7 ────────────────────────────────────
   The lid stands up beside the bin and five pieces of rubbish tumble in one
   after another.

   NO OPACITY ANYWHERE. Each piece is parked above the mouth where a chute clip
   hides it, falls through the visible band, and is clipped again the instant it
   passes the rim. Real motion and clipping only, so there is never a
   half-present frame — a fading piece of rubbish reads as a rendering fault.

   The source of these numbers was a CSS-keyframe build; porting it, an
   `animation-timing-function` set at a keyframe is per-SEGMENT, so each becomes
   one entry in motion's `ease` array. */
/** Five recognisable pieces, each authored centred on its own local origin so a
 *  wrapper places it and the animated transform rides the child. */
const TIP_PIECES = [
  { at: [88, 4], stroke: false, d: "M-12,-4 C-9,7 9,7 12,-4 C11,-2.5 10,-1.5 8.6,-0.6 C5,-2.5 -5,-2.5 -8.6,-0.6 C-10,-1.5 -11,-2.5 -12,-4 Z" },
  { at: [99, 4], stroke: false, d: "M-10,-4 L-5,-10 L1,-9 L7,-11 L11,-4 L8,1 L10,8 L3,10 L-4,11 L-9,6 L-11,1 Z" },
  { at: [90, 4], stroke: false, d: "M-7,-8 C-2,-10 2,-10 7,-8 C5,-4.5 2.5,-2.5 1.2,-1 C1.2,-0.3 1.2,0.3 1.2,1 C2.5,2.5 5,4.5 7,8 C2,10 -2,10 -7,8 C-5,4.5 -2.5,2.5 -1.2,1 C-1.2,0.3 -1.2,-0.3 -1.2,-1 C-2.5,-2.5 -5,-4.5 -7,-8 Z M-1.6,-8 L-1.6,-12 C-1.6,-13.3 1.6,-13.3 1.6,-12 L1.6,-8 Z" },
  { at: [101, 4], stroke: false, d: "M-4,-11 L4,-11 L4,-8 C4,-6 6,-5 6,-2 L6,9 C6,11 5,12 3,12 L-3,12 C-5,12 -6,11 -6,9 L-6,-2 C-6,-5 -4,-6 -4,-8 Z M-3,-14 L3,-14 L3,-11 L-3,-11 Z" },
  { at: [85, 4], stroke: true, d: "M-8,0 A2.2,2.2 0 1 0 -12.4,0 A2.2,2.2 0 1 0 -8,0 M-8,0 L7,0 M7,0 L12,-4 M7,0 L12,4 M-5,-4 L-5,4 M-1,-5 L-1,5 M3,-4 L3,4" },
];
/** [start%, land%, spin] — one beat each, so they arrive one after another. */
const TIP_BEATS: [number, number, number][] = [
  [0.08, 0.38, -35],
  [0.2, 0.5, 150],
  [0.32, 0.62, -55],
  [0.44, 0.74, 42],
  [0.56, 0.86, 95],
];
const TIP_DUR = 1.4;
const TIP_FALL = 70;

/**
 * THE RETURN TO REST MUST BE INSTANT, AND THIS IS NOT A DETAIL. A piece STARTS
 * parked above the mouth (y 0, clipped) and ENDS inside the can (y TIP_FALL,
 * clipped) — two different hidden states. Give the return any duration at all
 * and motion tweens between them, which walks every piece back UP through the
 * visible chute once the gesture finishes: five bits of rubbish flying out of a
 * closed bin. Both endpoints are hidden, so a zero-duration jump between them
 * can never render a visible frame; anything longer renders nothing but.
 */
const PARK: { duration: number } = { duration: 0 };
const tipPiece = (i: number): Variants => {
  const [start, land, spin] = TIP_BEATS[i];
  return {
    normal: { y: 0, rotate: 0, transition: PARK },
    animate: {
      y: [0, 0, TIP_FALL, TIP_FALL],
      rotate: [0, 0, spin, spin],
      transition: {
        duration: TIP_DUR,
        times: [0, start, land, 1],
        // gravity: the fall itself accelerates, the parked and swallowed spans
        // are holds and must not ease or the piece drifts while "still"
        ease: ["linear", [0.5, 0, 0.9, 0.4], "linear"],
      },
    },
  };
};


/* ══ 6. TIP IN ══════════════════════════════
   v6's choreography carried onto the filled Phosphor mark that 1-5 use, so the
   two can actually be compared. Same rules: the lid stands up beside the bin,
   five pieces tumble in one at a time, and NOTHING FADES — a chute clip is what
   hides them, above the mouth and again below it.

   THE PIVOT IS RE-SOLVED, NOT COPIED. It is a property of the bar's geometry, so
   a different bar needs a different point. This bar runs (32,56)-(223.75,56).
   Rotating +90deg about (px,py) sends it to a vertical bar at

     x = px + py - 56,  spanning  y = py - px + 32  ..  py - px + 223.75

   Two conditions fix the pair: stand it clear of the can's right wall (x232) and
   keep its foot near the floor. px+py = 288 and py-px = -48 give (168,120), and
   the bar lands vertical at x232 spanning y-16..175.75 — clear of the mouth, so
   the rubbish has an unobstructed drop.

   THE PROPORTIONS CARRY OVER EXACTLY, which is why the timing needed no
   retuning: the source bar is 72 long in a 96 box (0.750) and this one is 191.75
   in 256 (0.749). The pieces are reused verbatim and placed by a wrapper scaled
   256/96, so their fall of 70 local units is the same fraction of the bin here
   as there, and the fish bone's 3.4 stroke lands at 9.07 — the same ratio to
   this mark's 16 weight as 3.4 was to the source's 6.

   It overflows while playing: 16 above the artboard and 8 past its right edge,
   the scaled equivalent of the source's 14 and 7. Nothing paints outside at rest. */
const TIP7_K = 256 / 96;
const TIP7_PIVOT = { x: 168, y: 120 };
/** Visible band: just above the bin down to the mouth at y64. */
const TIP7_CHUTE = rect(-8, -32, 272, 96);
const TIP7_AT = TIP_PIECES.map((p) => [(p.at[0] - 46) * TIP7_K, (p.at[1] - 32) * TIP7_K]);

const tip7Lid: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 90, 90, -3, 1.2, 0],
    transition: {
      duration: TIP_DUR,
      times: [0, 0.1, 0.84, 0.93, 0.97, 1],
      ease: [[0.3, 0.8, 0.4, 1], "linear", [0.5, 0, 0.8, 0.3], [0.3, 0, 0.4, 1], "easeOut"],
    },
  },
};

const TipIn7Icon = forwardRef<IconHandle, IconProps>(function TrashIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const lid = `t7-lid-${uid}`;
  const can = `t7-can-${uid}`;
  const chute = `t7-chute-${uid}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={lid} clipPathUnits="userSpaceOnUse">
            <path d={LID_BOX} />
          </clipPath>
          <clipPath id={can} clipPathUnits="userSpaceOnUse">
            <path d={CAN_BOX} />
          </clipPath>
          <clipPath id={chute} clipPathUnits="userSpaceOnUse">
            <path d={TIP7_CHUTE} />
          </clipPath>
        </defs>

        {/* rubbish first, so the rim reads in front of it */}
        <g clipPath={`url(#${chute})`} fill="currentColor" stroke="none">
          {TIP_PIECES.map((p, i) => (
            <g key={i} transform={`translate(${TIP7_AT[i][0]},${TIP7_AT[i][1]}) scale(${TIP7_K})`}>
              <motion.path
                d={p.d}
                variants={tipPiece(i)}
                // fill-box + motion's own 50%/50% default IS the piece's centre;
                // setting transformOrigin here would be overwritten anyway.
                style={{ transformBox: "fill-box" }}
                {...(p.stroke ?
                  {
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 3.4,
                    strokeLinecap: "round" as const,
                    strokeLinejoin: "round" as const,
                  }
                : {})}
              />
            </g>
          ))}
        </g>

        <g clipPath={`url(#${can})`}>
          <path d={TRASH} />
        </g>
        <motion.g
          variants={tip7Lid}
          style={{
            transformBox: "view-box",
            originX: TIP7_PIVOT.x / 256,
            originY: TIP7_PIVOT.y / 256,
          }}
        >
          <g clipPath={`url(#${lid})`}>
            <path d={TRASH} />
          </g>
        </motion.g>
      </Svg>
    </div>
  );
});

/* ══ 7. TIP IN + SETTLE — 6 x 2 ══════════════════════════════════════════════
   6's gesture, and then v2's rock once the lid is back down: the rubbish goes
   in, the bin closes, and shakes its contents down.

   THE SHAKE COMES AFTER, NOT DURING, and that ordering is the whole point of
   combining these two. Rocking the bin while five pieces are dropping straight
   into it would move the target out from under them — the pieces fall in a
   straight line down the middle, so anything that swings the mouth sideways
   mid-drop makes them miss it. The shake therefore waits for the lid: last piece
   lands at 0.573, lid is shut by 0.714, rock starts at 0.72.

   EVERYTHING SHARES ONE CLOCK, so nothing can drift. The beats are v7's, simply
   re-expressed against the longer timeline — the extra 0.7s is all at the end
   and buys the rock its own space rather than compressing the tip-in.

   THE ROCK IS ON THE WHOLE ICON, about the bin's base (128,200). By the time it
   runs the pieces are already below the mouth and clipped, so shaking the lot
   costs nothing and keeps lid and can rigid together — a lid that rocked
   independently of its own bin would read as loose. */
const TIP8_DUR = 2.1;
/** the beats, re-expressed against 2.1s: (old x 1.4) / 2.1. */
const TIP8_BEATS: [number, number, number][] = [
  [0.053, 0.253, -35],
  [0.133, 0.333, 150],
  [0.213, 0.413, -55],
  [0.293, 0.493, 42],
  [0.373, 0.573, 95],
];
const tip8Piece = (i: number): Variants => {
  const [start, land, spin] = TIP8_BEATS[i];
  return {
    // instant, for the reason given on PARK — and it bites hardest here, because
    // this variant is the one long enough to be interrupted mid-flight
    normal: { y: 0, rotate: 0, transition: PARK },
    animate: {
      y: [0, 0, TIP_FALL, TIP_FALL],
      rotate: [0, 0, spin, spin],
      transition: {
        duration: TIP8_DUR,
        times: [0, start, land, 1],
        ease: ["linear", [0.5, 0, 0.9, 0.4], "linear"],
      },
    },
  };
};
const tip8Lid: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 90, 90, -3, 1.2, 0, 0],
    transition: {
      duration: TIP8_DUR,
      times: [0, 0.067, 0.6, 0.664, 0.693, 0.714, 1],
      ease: [[0.3, 0.8, 0.4, 1], "linear", [0.5, 0, 0.8, 0.3], [0.3, 0, 0.4, 1], "easeOut", "linear"],
    },
  },
};
/** v2's damped rock, held at zero until the lid is shut. */
const tip8Shake: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -8, 6.5, -3.5, 1.5, 0],
    transition: {
      duration: TIP8_DUR,
      times: [0, 0.72, 0.757, 0.808, 0.859, 0.916, 1],
      ease: ["linear", "easeInOut", "easeInOut", "easeInOut", "easeInOut", "easeInOut"],
    },
  },
};

const TipSettleIcon = forwardRef<IconHandle, IconProps>(function TrashIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const lid = `t8-lid-${uid}`;
  const can = `t8-can-${uid}`;
  const chute = `t8-chute-${uid}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={lid} clipPathUnits="userSpaceOnUse">
            <path d={LID_BOX} />
          </clipPath>
          <clipPath id={can} clipPathUnits="userSpaceOnUse">
            <path d={CAN_BOX} />
          </clipPath>
          <clipPath id={chute} clipPathUnits="userSpaceOnUse">
            <path d={TIP7_CHUTE} />
          </clipPath>
        </defs>

        {/* the rock wraps everything, so lid and can stay rigid together */}
        <motion.g variants={tip8Shake} style={AT(128, 200)}>
          <g clipPath={`url(#${chute})`} fill="currentColor" stroke="none">
            {TIP_PIECES.map((p, i) => (
              <g key={i} transform={`translate(${TIP7_AT[i][0]},${TIP7_AT[i][1]}) scale(${TIP7_K})`}>
                <motion.path
                  d={p.d}
                  variants={tip8Piece(i)}
                  style={{ transformBox: "fill-box" }}
                  {...(p.stroke ?
                    {
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: 3.4,
                      strokeLinecap: "round" as const,
                      strokeLinejoin: "round" as const,
                    }
                  : {})}
                />
              </g>
            ))}
          </g>

          <g clipPath={`url(#${can})`}>
            <path d={TRASH} />
          </g>
          <motion.g
            variants={tip8Lid}
            style={{
              transformBox: "view-box",
              originX: TIP7_PIVOT.x / 256,
              originY: TIP7_PIVOT.y / 256,
            }}
          >
            <g clipPath={`url(#${lid})`}>
              <path d={TRASH} />
            </g>
          </motion.g>
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
        <path d={TRASH} />
      </svg>
    </div>
  );
}

/** Whole-mark transform — nothing split, so rest is the identity. */
function makeWhole(v: Variants, origin = { x: 128, y: 200 }) {
  return forwardRef<IconHandle, IconProps>(function TrashIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={v} style={AT(origin.x, origin.y)}>
            <path d={TRASH} />
          </motion.g>
        </Svg>
      </div>
    );
  });
}

/** Lid above the hinge line, can below it — two clips that tile the plane. */
function makeLidCan(lidV: Variants, canV?: Variants, canOrigin = { x: 128, y: 224 }) {
  return forwardRef<IconHandle, IconProps>(function TrashIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const uid = useId().replace(/:/g, "");
    const lid = `tr-lid-${uid}`;
    const can = `tr-can-${uid}`;
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    const canLayer: ReactNode = (
      <g clipPath={`url(#${can})`}>
        <path d={TRASH} />
      </g>
    );
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Svg size={size} controls={controls}>
          <defs>
            <clipPath id={lid} clipPathUnits="userSpaceOnUse">
              <path d={LID_BOX} />
            </clipPath>
            <clipPath id={can} clipPathUnits="userSpaceOnUse">
              <path d={CAN_BOX} />
            </clipPath>
          </defs>
          {canV ? (
            <motion.g variants={canV} style={AT(canOrigin.x, canOrigin.y)}>
              {canLayer}
            </motion.g>
          ) : (
            canLayer
          )}
          <motion.g variants={lidV} style={AT(LID_PIVOT.x, LID_PIVOT.y)}>
            <g clipPath={`url(#${lid})`}>
              <path d={TRASH} />
            </g>
          </motion.g>
        </Svg>
      </div>
    );
  });
}

const EmptyIcon = forwardRef<IconHandle, IconProps>(function TrashIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId().replace(/:/g, "");
  const lid = `tre-lid-${uid}`;
  const shell = `tre-shell-${uid}`;
  const bars = `tre-bars-${uid}`;
  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={lid} clipPathUnits="userSpaceOnUse">
            <path d={LID_BOX} />
          </clipPath>
          {/* the can with the bars' window punched out — evenodd, so the two
              boxes subtract rather than union */}
          <clipPath id={shell} clipPathUnits="userSpaceOnUse">
            <path clipRule="evenodd" d={`${CAN_BOX} ${BARS_BOX}`} />
          </clipPath>
          <clipPath id={bars} clipPathUnits="userSpaceOnUse">
            <path d={BARS_BOX} />
          </clipPath>
        </defs>
        <motion.g variants={emptyBars}>
          <g clipPath={`url(#${bars})`}>
            <path d={TRASH} />
          </g>
        </motion.g>
        <g clipPath={`url(#${shell})`}>
          <path d={TRASH} />
        </g>
        <motion.g variants={emptyLid} style={AT(LID_PIVOT.x, LID_PIVOT.y)}>
          <g clipPath={`url(#${lid})`}>
            <path d={TRASH} />
          </g>
        </motion.g>
      </Svg>
    </div>
  );
});

const VARIANTS: LabVariant[] = [
  {
    name: "1 · Lift",
    blurb: "The lid comes up, hangs, and drops back on faster than it left, with a small bounce.",
    Component: makeLidCan(lift),
  },
  {
    name: "2 · Shake",
    blurb: "A quick refusal — the whole can rocks and settles, each swing about half the last.",
    Component: makeWhole(shake),
  },
  {
    name: "3 · Empty",
    blurb: "Lid opens and the two bars fall through the floor, fading only once they are out.",
    Component: EmptyIcon,
  },
  {
    name: "4 · Crush",
    blurb: "Compressed onto its floor and springing back, the lid riding down and overshooting.",
    Component: makeLidCan(crushLid, crushCan),
  },
  {
    name: "5 · Toss",
    blurb: "The lid flips out of the way, then the can takes the weight — impact after entry.",
    Component: makeLidCan(tossLid, tossCan),
  },
  {
    name: "6 · Tip in",
    blurb: "The lid stands up beside the bin and five pieces tumble in. Pivot solved at (168,120).",
    Component: TipIn7Icon,
  },
  {
    name: "7 · Tip in + settle",
    blurb: "6 × 2 — rubbish goes in, the lid shuts, then the bin rocks its contents down.",
    Component: TipSettleIcon,
  },
];

/**
 * playMs MUST OUTLAST THE LONGEST VARIANT. The grid calls stopAnimation() after
 * playMs no matter what a tile's own duration is, so anything longer is cut
 * mid-gesture and snapped back to rest. v8 runs 2.1s against the old 1400, which
 * meant its shake never played at all in the auto-cycle — the tile was severed
 * right after the rubbish landed, and the return-to-rest was the only thing
 * anyone saw of the ending.
 */
export default function TrashLab() {
  return <VariantGrid title="Trash" variants={VARIANTS} cycleMs={3600} playMs={2250} />;
}
