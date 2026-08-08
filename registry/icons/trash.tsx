"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import type { IconHandle, IconProps } from "@/lib/icon";

// TIP IN — the lid swings up and STANDS BESIDE the bin, five pieces of rubbish
// tumble in one after another, and the lid drops back on.
//
// NOTHING IS REBUILT FROM SUB-PATHS. The glyph is one compound path, so each
// moving part is the WHOLE original path drawn again and clipped to a box. The
// boxes TILE THE PLANE, so the layers composite back to the untouched mark —
// rest is exact by construction rather than by tolerance. Splitting a `d` string
// into pieces is how rest states drift; the clip route has no such failure mode.
//
// y=64 IS A REAL HINGE LINE, measured rather than assumed. Scanning the rendered
// fill row by row: y63 is one run, x36.5..219.3 — the lid bar at full width; y65
// is two runs, x48..63.8 and x192..207.8 — the can's walls only. The lid ends and
// the can begins exactly there, so a clip at y=64 separates them without cutting
// ink that belongs to both. The flat edge revealed under the lid as it opens is
// the bottom of a lid, which is what a lid has.
//
// THE PIVOT IS SOLVED, NOT CHOSEN. A lid still lying across the mouth is
// something the rubbish would fall through, so it has to end where the mouth's
// x-range is clear. The bar runs (32,56)-(223.75,56); a +90deg turn about (px,py)
// sends it to a vertical bar at
//
//   x = px + py - 56,  spanning  y = py - px + 32 .. py - px + 223.75
//
// Standing it clear of the can's right wall (x232) and keeping its foot near the
// floor fixes px+py = 288 and py-px = -48, so (168,120) — and only that. Both bar
// ends then land at x232, spanning y-16..175.75, completely clear of the mouth.
// Rotating about it needs no translate, which is what keeps the arc tight.
//
// NO OPACITY ANYWHERE. Each piece is parked above the mouth where the chute clip
// (y -32..64) hides it, falls through the visible band, and is clipped again the
// instant it passes the rim. Real motion and clipping only, so there is never a
// half-present frame — a fading piece of rubbish reads as a rendering fault.
//
// THE RETURN TO REST MUST BE INSTANT, and this is not a detail. A piece STARTS
// parked above the mouth (y 0, clipped) and ENDS inside the can (y FALL, clipped)
// — two different hidden states. Give the return any duration and motion tweens
// between them, walking every piece back UP through the visible chute once the
// gesture finishes: five bits of rubbish flying out of a closed bin. Both
// endpoints are hidden, so a zero-duration jump can never render a visible frame;
// anything longer renders nothing but. This is also why the pieces do not use
// RETURN_TRANSITION while everything else does.
//
// It overflows the artboard while playing — 16 above and 8 past the right edge —
// and nothing paints outside at rest. Same trade as `airplane-taxiing`.
const TRASH =
  "M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z";

const rect = (x: number, y: number, w: number, h: number) =>
  `M${x},${y}H${x + w}V${y + h}H${x}Z`;
/** The two halves meet on the measured hinge line and tile the plane. */
const LID_BOX = rect(-16, -16, 288, 80); // y -16..64
const CAN_BOX = rect(-16, 64, 288, 208); // y  64..272
/** Visible band: just above the bin down to the mouth. */
const CHUTE = rect(-8, -32, 272, 96); // y -32..64

const PIVOT = { x: 168, y: 120 };
const DUR = 1.4;
const FALL = 70;
/** The pieces were authored against a 96-unit box; a wrapper scales them here. */
const K = 256 / 96;

/**
 * Five recognisable pieces, each authored centred on its own local origin so a
 * wrapper places it and the animated transform rides the child. Abstract blobs
 * were tried first and read as dirt; material things read as rubbish.
 */
const PIECES = [
  {
    at: [(88 - 46) * K, (4 - 32) * K],
    stroke: false,
    d: "M-12,-4 C-9,7 9,7 12,-4 C11,-2.5 10,-1.5 8.6,-0.6 C5,-2.5 -5,-2.5 -8.6,-0.6 C-10,-1.5 -11,-2.5 -12,-4 Z",
  },
  {
    at: [(99 - 46) * K, (4 - 32) * K],
    stroke: false,
    d: "M-10,-4 L-5,-10 L1,-9 L7,-11 L11,-4 L8,1 L10,8 L3,10 L-4,11 L-9,6 L-11,1 Z",
  },
  {
    at: [(90 - 46) * K, (4 - 32) * K],
    stroke: false,
    d: "M-7,-8 C-2,-10 2,-10 7,-8 C5,-4.5 2.5,-2.5 1.2,-1 C1.2,-0.3 1.2,0.3 1.2,1 C2.5,2.5 5,4.5 7,8 C2,10 -2,10 -7,8 C-5,4.5 -2.5,2.5 -1.2,1 C-1.2,0.3 -1.2,-0.3 -1.2,-1 C-2.5,-2.5 -5,-4.5 -7,-8 Z M-1.6,-8 L-1.6,-12 C-1.6,-13.3 1.6,-13.3 1.6,-12 L1.6,-8 Z",
  },
  {
    at: [(101 - 46) * K, (4 - 32) * K],
    stroke: false,
    d: "M-4,-11 L4,-11 L4,-8 C4,-6 6,-5 6,-2 L6,9 C6,11 5,12 3,12 L-3,12 C-5,12 -6,11 -6,9 L-6,-2 C-6,-5 -4,-6 -4,-8 Z M-3,-14 L3,-14 L3,-11 L-3,-11 Z",
  },
  {
    at: [(85 - 46) * K, (4 - 32) * K],
    stroke: true,
    d: "M-8,0 A2.2,2.2 0 1 0 -12.4,0 A2.2,2.2 0 1 0 -8,0 M-8,0 L7,0 M7,0 L12,-4 M7,0 L12,4 M-5,-4 L-5,4 M-1,-5 L-1,5 M3,-4 L3,4",
  },
];
/** [start, land, spin] — one beat each, so they arrive one after another. */
const BEATS: [number, number, number][] = [
  [0.08, 0.38, -35],
  [0.2, 0.5, 150],
  [0.32, 0.62, -55],
  [0.44, 0.74, 42],
  [0.56, 0.86, 95],
];

/** Zero duration: both hidden states, so the jump between them cannot be seen. */
const PARK = { duration: 0 };

const lid: Variants = {
  normal: { rotate: 0, transition: { duration: 0.28, ease: "easeOut" } },
  animate: {
    rotate: [0, 90, 90, -3, 1.2, 0],
    transition: {
      duration: DUR,
      times: [0, 0.1, 0.84, 0.93, 0.97, 1],
      // an `animation-timing-function` set at a keyframe is per-SEGMENT, so each
      // becomes one entry here: five for six keyframes
      ease: [[0.3, 0.8, 0.4, 1], "linear", [0.5, 0, 0.8, 0.3], [0.3, 0, 0.4, 1], "easeOut"],
    },
  },
};
const piece = (i: number): Variants => {
  const [start, land, spin] = BEATS[i];
  return {
    normal: { y: 0, rotate: 0, transition: PARK },
    animate: {
      y: [0, 0, FALL, FALL],
      rotate: [0, 0, spin, spin],
      transition: {
        duration: DUR,
        times: [0, start, land, 1],
        // gravity on the fall; the parked and swallowed spans are holds and must
        // stay linear or the piece drifts while it is meant to be still
        ease: ["linear", [0.5, 0, 0.9, 0.4], "linear"],
      },
    },
  };
};

export const TrashIcon = forwardRef<IconHandle, IconProps>(function TrashIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const lidClip = `tr-lid-${uid}`;
  const canClip = `tr-can-${uid}`;
  const chuteClip = `tr-chute-${uid}`;

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
          <path d={TRASH} />
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "visible", ...style }}>
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
        <defs>
          <clipPath id={lidClip} clipPathUnits="userSpaceOnUse">
            <path d={LID_BOX} />
          </clipPath>
          <clipPath id={canClip} clipPathUnits="userSpaceOnUse">
            <path d={CAN_BOX} />
          </clipPath>
          <clipPath id={chuteClip} clipPathUnits="userSpaceOnUse">
            <path d={CHUTE} />
          </clipPath>
        </defs>

        {/* rubbish first, so the rim reads in front of it */}
        <g clipPath={`url(#${chuteClip})`} fill="currentColor" stroke="none">
          {PIECES.map((p, i) => (
            <g key={i} transform={`translate(${p.at[0]},${p.at[1]}) scale(${K})`}>
              <motion.path
                d={p.d}
                variants={piece(i)}
                // fill-box plus motion's own 50%/50% default IS the piece's
                // centre; a `transformOrigin` set here would be overwritten,
                // because motion owns that property whenever it animates transforms
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

        <g clipPath={`url(#${canClip})`}>
          <path d={TRASH} />
        </g>
        {/* THE ORIGIN MUST GO THROUGH originX/originY. motion writes its own
            `transform-origin` default of 50% 50% whenever they are absent, which
            silently clobbers a CSS string set beside it — the lid then pivots
            about the middle of the box and the solved point is lost. */}
        <motion.g
          variants={lid}
          style={{ transformBox: "view-box", originX: PIVOT.x / 256, originY: PIVOT.y / 256 }}
        >
          <g clipPath={`url(#${lidClip})`}>
            <path d={TRASH} />
          </g>
        </motion.g>
      </motion.svg>
    </div>
  );
});
