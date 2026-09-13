"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// CONNECT — one arm reaches, the other answers, both blades slam into line, and
// the click that closes the circuit sends a packet down the wire.
//
// VERB: the rune CONNECTS — pair, then transmit. Not "pulses", not "radiates":
// there are no signal arcs in this mark, and Phosphor's `bluetooth-connected`
// already owns the dots-either-side picture.
//
// MATERIAL: mechanical — the arms are knife switches (§9). Ease-in into a hard
// stop, ZERO overshoot past rest. A contact that springs past closed reads as a
// loose wire.
//
// Promoted from `app/lab/bluetooth/page.tsx` (variant 6, which composes that
// page's `2 · Relay` with its `5 · Pair`); the other five takes, and why each was
// passed over, are documented there.
//
// ── MEASURED (rasterised at 512x512, counting only pixels that flip ink/no-ink
//    so antialiasing cannot inflate the figure) ──────────────────────────────
//
//   ink bbox    x56..200, y24..232. Nothing below leaves it.
//
//   THE ARMS ARE ALREADY SEPARATE. Phosphor draws the two left arms as their own
//   `line`s, each ending ON the hub (128,128) with a round cap. A round cap
//   rotated about its own centre is the same disc, so an arm swinging about the
//   hub never opens a seam at any angle: the cap is a pin joint. They are the only
//   parts that can move — each loop is a rigid triangle.
//
//   ONE PEN STROKE. Every cap and join is round, so the mark is exactly the union
//   of its straight segments, and it reads as a single wire from the upper arm tip
//   to the lower one, 672 units long. That is the path the packet runs.
//
//     upper arm + body (one path) + lower arm    16 / 40,319 = 0.04%   ship
//     the whole wire as one path                 53 / 40,319 = 0.13%   fails
//     body cut into its five straight segments   64 / 40,319 = 0.16%   fails
//
//   AMPLITUDE (§2). Arm ink reaches r=88 from the hub, so 16° travels 24.6 units
//   and 13° travels 20.0 — both over the floor. THE CEILING IS SET AT 24px: at a
//   true 24px an arm swung 16° toward the spine is still its own stroke, and at
//   24° arm and spine fuse into one dark bar.
//
// ── WHY THE KEYFRAMES LOOK LIKE THIS ───────────────────────────────────────
//
// THREE BEATS, THEN THE PACKET. The upper arm opens (the ping) and HOLDS while the
// lower one answers (the ack), so the two can close on the same frame. The close
// is ease-in into the line, so the contact is made at full speed — that speed
// change is what reads as a click at 24px. Each arm then knocks back 3° the way it
// came, never across 0, so it never passes the detent; 3° is 4.6 units, texture on
// a primary that clears the floor (§2's exception). The hold sags 1° so the open
// arm looks like it is waiting rather than frozen.
//
// THE PACKET LEAVES ON THE CLICK — overlap, not handoff (§11), because the click
// causes it. A beat of stillness between them would make two unrelated events.
//
// THE PACKET CROSSES PARTS THAT MOVE. The wire is three elements in pen order —
// upper arm (0..80), the body as one path from the hub round both loops and back
// (80..592), and the lower arm drawn hub to tip (592..672) — each with its own
// dash keyed to the same position along the whole wire. Offset is linear in
// position, so one timeline and one easing keep the three gaps moving as one.
//
// THE DASH IS 32 LONG, NOT 1. A dash pattern repeats every dash + gap, and on an
// arm the offset swings almost ten arm-lengths over the run; with a dash of 1 the
// pattern's NEXT gap slides onto the arm mid-run.
//
// EASE-OUT, WITH OVERSCAN. The packet has to leave the click at speed, which a
// curve that starts from rest (SWEEP) cannot do. Ease-out's slow tail would then
// hold the gap on the lower arm tip, so the run overshoots the wire by 48 units
// and most of that tail happens off it. What remains: as the gap leaves, the last
// few units of the lower arm shrink to a round-cap dot for ~21ms, about one frame.
// Left in — it is the packet's trailing edge passing, not a parked dot (§5).
//
// ── WHY `normal` PARKS THE PACKET PAST THE FAR END ──────────────────────────
//
// Before the click and after the exit, the gap sits off the wire — both are the
// rest pose. Parked PAST THE END, hover-out is right in both halves of the pass:
// before the click the packet has nowhere to go and nothing moves, and mid-run
// RETURN_TRANSITION carries it onward and out instead of dragging it backwards
// along the wire. At the click it jumps to the near end on a repeated time
// (LAUNCH, LAUNCH), so no frame can sample a position in between. Same reasoning
// as `gear` parking on 360: machines finish their stroke.
//
// ── REJECTED (§17) ─────────────────────────────────────────────────────────
//
//   · SIGNAL ARCS off the loops — geometry the mark does not contain, carrying the
//     idea while the rune sits still (§15's generic failure).
//   · THE RUNE WRITING ITSELF. Honest on a stroked glyph, but frame 0 is an empty
//     tile, and the one-stroke path fails the pixel gate at 0.13%.
//   · THE PACKET ALONE. A gap marching through a still mark is a loading spinner —
//     it reads as "connecting…", a busy state, not a response.
//   · BOTH ARMS ON MIRRORED KEYFRAMES. One gesture reflected reads as a jaw.
//   · SWINGING THE ARMS TOWARD EACH OTHER. The wider wedge, but at a true 24px the
//     arms fuse into one horizontal bar by 18°.
//   · SLIDING THE TWO HALVES APART and clacking them together — clearing the floor
//     needs a 36-unit split through the hub, and the still frame is two chevrons.
//
// ── THE STANDING TEST — the failure I was most worried about ───────────────
//
// PERIPHERAL VISION, AND THE FIFTIETH HOVER. A travelling gap is exactly the kind
// of motion the eye cannot ignore, and a Bluetooth control sits in status bars all
// day. Resolved by making the packet a consequence, never a state: it runs once
// per pass, only after the click, visible for ~450ms, and nothing in this file
// repeats — the only replay is use-hover's, while the pointer stays. At 1.12s this
// is Expressive tier (§8). The hit area never moves: pure rotation of two arms
// about the centre, all ink inside x56..200, and every exit — before the click,
// mid-run, re-trigger — lands on the resting mark.

/** Phosphor's source, element for element: two closed loops and two free arms. */
const LOOPS = ["128 32 192 80 128 128 128 32", "128 128 192 176 128 224 128 128"];
const ARM_UP = { x1: 64, y1: 80, x2: 128, y2: 128 };
const ARM_DOWN = { x1: 64, y1: 176, x2: 128, y2: 128 };

/** The body in pen order: hub, lower loop, spine, upper loop, hub. */
const BODY = "M128,128L192,176L128,224V32L192,80L128,128";
/** Phosphor's lower arm, drawn from the hub out so its dash runs with the pen. */
const ARM_DOWN_FROM_HUB = { x1: 128, y1: 128, x2: 64, y2: 176 };

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** The pin both arms hinge on: their shared round cap, dead centre on the spine. */
const HUB = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };

const WIRE = 672;
/** The gap, in units; 44 of it shows once the round caps take theirs. */
const PACKET = 60;
const OVERSCAN = 48;
const DASH = 32;
const DUR_MS = 1120;
/** 560ms: the frame the blades hit the line. */
const LAUNCH = 560 / DUR_MS;
const at = (...ms: number[]) => ms.map((m) => m / DUR_MS);

/** An element's dash, given where it starts along the wire and how long it is. */
function packet(start: number, length: number) {
  const local = (p: number) => (p - start) / length;
  const before = local(0);
  const past = local(WIRE + PACKET + OVERSCAN);
  const dash = { pathLength: DASH, pathSpacing: PACKET / length };
  const transition: Transition = {
    duration: DUR_MS / 1000,
    times: [0, LAUNCH, LAUNCH, 1],
    ease: ["linear", "linear", "easeOut"],
  };
  return {
    rest: { ...dash, pathOffset: past },
    run: { ...dash, pathOffset: [past, past, before, past] },
    transition,
  };
}
const PACKET_UP = packet(0, 80);
const PACKET_BODY = packet(80, 512);
const PACKET_DOWN = packet(592, 80);

const armUp: Variants = {
  normal: { rotate: 0, ...PACKET_UP.rest, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 16, 15, 0, 3, 0, 0],
    ...PACKET_UP.run,
    transition: {
      rotate: {
        duration: DUR_MS / 1000,
        times: at(0, 200, 440, 560, 640, 800, 1120),
        ease: [ARRIVE, "linear", "easeIn", "easeOut", "easeInOut", "linear"],
      },
      pathOffset: PACKET_UP.transition,
    },
  },
};
const armDown: Variants = {
  normal: { rotate: 0, ...PACKET_DOWN.rest, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -13, -12, 0, -3, 0, 0],
    ...PACKET_DOWN.run,
    transition: {
      rotate: {
        duration: DUR_MS / 1000,
        times: at(0, 160, 360, 440, 560, 640, 800, 1120),
        ease: ["linear", ARRIVE, "linear", "easeIn", "easeOut", "easeInOut", "linear"],
      },
      pathOffset: PACKET_DOWN.transition,
    },
  },
};
const body: Variants = {
  normal: { ...PACKET_BODY.rest, transition: RETURN_TRANSITION },
  animate: { ...PACKET_BODY.run, transition: { pathOffset: PACKET_BODY.transition } },
};

export const BluetoothIcon = forwardRef<IconHandle, IconProps>(function BluetoothIcon(
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
            {LOOPS.map((points) => (
              <polygon key={points} points={points} />
            ))}
            <line {...ARM_UP} />
            <line {...ARM_DOWN} />
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
        style={{ overflow: "visible" }}
      >
        <g {...STROKE}>
          {/* The loops hold; the arms swing on the hub; the packet runs all three. */}
          <motion.path d={BODY} variants={body} />
          <motion.line {...ARM_UP} variants={armUp} style={HUB} />
          <motion.line {...ARM_DOWN_FROM_HUB} variants={armDown} style={HUB} />
        </g>
      </motion.svg>
    </div>
  );
});
