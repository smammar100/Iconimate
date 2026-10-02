"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// BLOCKED — `bluetooth`'s packet, on the wire that is left. It enters at the
// arm's tip, runs through the hub, down the spine and round the loop — and meets
// the slash where the loop was cut. It cannot pass. It rebounds all the way back
// and out, and the slash is knocked back where it was hit.
//
// VERB: the signal is BLOCKED. The family speaks one language: `bluetooth` runs
// a packet through the whole rune once its arms lock; `bluetooth-connected` is
// proven by a shot that lands; here the same packet finds a wall.
//
// MATERIAL: a signal and a rigid barrier. The packet arrives at full speed and
// leaves decelerating; the slash does not squash, it is shoved and returns.
//
// Promoted from `app/lab/bluetooth-slash/page.tsx` (variant 2 of 5); the other
// four takes and the measurements below are documented there at length.
//
// ── MEASURED (rasterised at 512x512, counting only pixels that flip ink/no-ink)
//
//   ink bbox    x48..224, y24..232.
//   THE SLASH IS THE RUNE'S DIAGONAL, TURNED. Bluetooth's diagonal (64,80) ->
//               (192,176) and this slash (56,40) -> (216,216) cross at
//               (153.14,146.86) — exactly where Phosphor ends the lower loop's
//               inner stroke. The slash is that diagonal rotated 10.86° and
//               lengthened, which is why the upper arm is gone.
//   THE WIRE    arm tip -> hub -> spine foot -> loop end: 80 + 96 + 70.8 = 246.8.
//               Its far end, (184.65,181.51), sits EXACTLY on the slash's centre
//               line (0.00), as does the loop's hidden inner stub.
//   REST        the wire restated as one pen-order path, the stub as its own
//               line: 7 / 41,454 = 0.017%.
//
// ── WHY IT MOVES LIKE THIS ─────────────────────────────────────────────────
//
// THE WIRE ENDS ON THE SLASH, AND THAT IS WHAT MAKES THE WALL SOLID. When the
// gap reaches the end of the wire, the last sliver of ink it squeezes into a
// round-cap dot lies under the slash's own ink — so the packet simply meets the
// wall, with no stray dot. Nothing ever happens in the upper fragment beyond the
// slash: that is the picture of "disconnected".
//
// IMPACT, THEN REBOUND. Ease-in into the wall at 0.45 of the pass (it arrives at
// speed), ease-out away. The rebound overshoots the start by 50 units so most of
// its slow tail happens off the wire rather than as a gap parked on the arm.
//
// THE SLASH TAKES THE HIT: 5 units across, away from the wire, peaking 60ms after
// impact and back by 0.66. Under the 18-unit floor on purpose — texture on the
// impact (§2's exception) — and just enough to open a hairline between the loop's
// end and the blade, which is the hit made visible.
//
// DASH 8, NOT 1. motion normalises the path to length 1 and repeats the dash
// pattern every dash + gap. The offset swings from −0.2 to 1.0 of the wire; with
// a dash of 1 the pattern's next gap would slide onto it mid-run.
//
// ── REJECTED (§17) ─────────────────────────────────────────────────────────
//
//   · SLICE — the cut halves slipping along the blade. Moving parallel to the
//     slash keeps every clearance exact, and it is the most cinematic take; it
//     says "cut", not "no signal".
//   · DENY — the lone arm reaching for its missing partner and being parried.
//     A story about the glyph more than about Bluetooth being off.
//   · SNAP — healing back into Bluetooth, then breaking. For ~0.3s the still frame
//     is plain Bluetooth, the opposite of this icon.
//   · PROHIBIT — the fragments bending into ⊘. A different sign replacing the
//     mark mid-gesture.
//   · A DEADBOLT, A WIPER, TV SWITCH-OFF, SPARKS. See the lab page.
//
// ── THE STANDING TEST — the failure I was most worried about ───────────────
//
// THE MOTION IS A HOLE. A gap running along a still stroke is absence, which §1
// warns against, and in `bluetooth` it is carried by arms that visibly move. Here
// the answer is the wall: the one solid part of the mark physically reacts at the
// instant of impact, so the gap reads as something that HIT something. Second
// worry, a stray dot: as the rebound leaves the free arm tip, the last few units
// of the arm shrink to a round cap — seen in the 820ms scrub frame, gone by 900,
// ~40ms at the packet's speed there — and left in, because the fix is a rebound
// that dawdles at the wall, and a bounce does not. At 1.2s it is Expressive tier; nothing repeats by itself, the hit
// area never moves (the slash's 5-unit shove stays inside x48..229), and every
// exit lands on the resting glyph.

/** Phosphor's source, element for element — the static / reduced-motion render. */
const ARM = { x1: 64, y1: 176, x2: 128, y2: 128 };
const SLASH = { x1: 56, y1: 40, x2: 216, y2: 216 };
const UPPER = "128,71.63 128,32 192,80 158.47,105.15";
const LOWER = "184.65,181.51 128,224 128,128 153.14,146.86";

/** The wire the packet runs, in pen order: arm tip, hub, spine foot, the loop's end on the slash. */
const WIRE = "M64,176L128,128L128,224L184.65,181.51";
const WIRE_LEN = 80 + 96 + Math.hypot(56.65, 42.49);
/** The loop's inner stub, lying along the slash's centre line under its ink. */
const STUB = { x1: 128, y1: 128, x2: 153.14, y2: 146.86 };

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DURATION = 1.2;
const PACKET = 50;
const OVERSCAN = 50;
const DASH = 8;

const packet: Variants = {
  normal: { pathLength: DASH, pathSpacing: PACKET / WIRE_LEN, pathOffset: 0, transition: RETURN_TRANSITION },
  animate: {
    pathLength: DASH,
    pathSpacing: PACKET / WIRE_LEN,
    pathOffset: [0, 1, -OVERSCAN / WIRE_LEN],
    transition: { pathOffset: { duration: DURATION, times: [0, 0.45, 1], ease: ["easeIn", "easeOut"] } },
  },
};

/** Across the slash, away from the wire (toward the upper fragment). */
const SLASH_LEN = Math.hypot(160, 176);
const ACROSS = [176 / SLASH_LEN, -160 / SLASH_LEN];
const KNOCK = [0, 0, 5, 0, 0];
const knockTransition: Transition = {
  duration: DURATION,
  times: [0, 0.45, 0.5, 0.66, 1],
  ease: ["linear", "easeOut", "easeInOut", "linear"],
};
const knock: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: {
    x: KNOCK.map((k) => k * ACROSS[0]),
    y: KNOCK.map((k) => k * ACROSS[1]),
    transition: knockTransition,
  },
};

export const BluetoothSlashIcon = forwardRef<IconHandle, IconProps>(function BluetoothSlashIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256">
          <g {...STROKE}>
            <line {...ARM} />
            <line {...SLASH} />
            <polyline points={UPPER} />
            <polyline points={LOWER} />
          </g>
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
        initial="normal"
        animate={controls}
      >
        <g {...STROKE}>
          <motion.path d={WIRE} variants={packet} />
          <line {...STUB} />
          <polyline points={UPPER} />
          {/* Painted last: the wall the packet meets, and the part that is hit. */}
          <motion.line {...SLASH} variants={knock} />
        </g>
      </motion.svg>
    </div>
  );
});
