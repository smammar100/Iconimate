"use client";

import { forwardRef, useImperativeHandle, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Bluetooth, five takes, each built on what the one before it got wrong.
 *
 * VERB: the rune CONNECTS. Not "pulses", not "radiates" — there are no signal
 * arcs in this mark, and drawing some on would be a detached accent doing the
 * work the mark should do (MOTION.md §15). Phosphor's `bluetooth-connected`
 * already owns the dots-either-side picture, so borrowing it here would also
 * blur two icons into one.
 *
 * MATERIAL: mechanical — a switch (§9). `linear`/ease-in into a hard stop, ZERO
 * overshoot past rest, 1.0x base. A contact that springs past closed reads as
 * a loose wire, not a connection.
 *
 * ── MEASURED, not assumed (rasterised at 512x512, counting only pixels that
 *    flip ink/no-ink so antialiasing cannot inflate the figure) ──────────────
 *
 *   ink bbox    x56..200, y24..232. Lanes: 56 left, 56 right, 24 top, 24
 *               bottom. Everything below stays inside; nothing needs overflow.
 *
 *   ONE PEN STROKE. Every cap and join is round, so the stroked mark is exactly
 *   the union of its straight segments, and the two diagonals run straight
 *   through the hub: (64,80)->(192,176) and (64,176)->(192,80). Redrawn as a
 *   single polyline — M64,80 L192,176 L128,224 V32 L192,80 L64,176 — it is the
 *   rune written in one unbroken stroke, arm tip to arm tip, 672 units long
 *   (160 + 80 + 192 + 80 + 160). 1 and 2 are built on that path.
 *
 *     one-stroke restatement   53 / 40,319 = 0.13%   edge AA along the arms
 *     arms split from loops    16 / 40,319 = 0.04%   ship
 *
 *   The 0.13% is not a redraw — the flips sit 1–4 per 8-unit cell along the
 *   diagonal edges — but it is over the 0.1% gate, and re-adding Phosphor's
 *   collinear break points at the hub does not move it (still 53). Only the
 *   split used by 3–5 passes.
 *
 *   THE ARMS ARE ALREADY SEPARATE. Phosphor draws the two left arms as their own
 *   `line`s, each ending ON the hub (128,128) with a round cap. A round cap
 *   rotated about its own centre is the same disc, so an arm swinging about the
 *   hub never opens a seam at any angle: the cap is a pin joint. That is the
 *   moving part the glyph already contains (§0), and it is the only one — each
 *   loop is a rigid triangle (sides 96/80/80) and cannot flex without changing
 *   length.
 *
 *   AMPLITUDE (§2). Arm ink reaches r=88 from the hub (80 + the 8 cap), so
 *   rotate θ travels 88 × θ × 0.01745 units: 13° -> 20.0, 16° -> 24.6,
 *   24° -> 36.9. All clear the 18-unit floor.
 *
 *   BUT THE CEILING IS SET AT 24px, NOT HERE. Rendered at a true 24px and blown
 *   up pixel for pixel, an arm swung 16° toward the spine still reads as its own
 *   stroke (32 units, 3px, clear at the tip). At 24° the lab tile looks fine and
 *   the 24px render does not: arm and spine merge into one dark bar from the hub
 *   most of the way out, and the rune reads as a thick-backed B. 3 ships the 24°
 *   on purpose so the difference can be seen; 4 and 5 stop at 16°/13°.
 *
 * ── REJECTED ─────────────────────────────────────────────────────────────────
 *
 *   · SIGNAL ARCS off the right-hand loops. Geometry the mark does not contain,
 *     carrying the whole idea while the rune sits still — §15's generic failure.
 *   · SLIDING THE TWO HALVES APART and clacking them together (the rune is mirror
 *     symmetric about y128, so the halves read as two devices). Clearing the 18-
 *     unit floor needs ±18 each, a 36-unit split through the hub: the still frame
 *     is two chevrons, not a Bluetooth mark (§0 gate 2).
 *   · STRETCHING the loop tips outward. Moving (192,80) bends the diagonal it
 *     shares with the lower arm, so the crossing drifts off the spine mid-gesture.
 *   · SWINGING THE ARMS TOWARD EACH OTHER instead of toward the spine. The wedge
 *     between them is the wider one (73.7° against 53.1°), so it looked like the
 *     roomier lane — but at a true 24px both arms fuse into one horizontal bar by
 *     18°, and by 22° the X is gone. The spine side stays legible further.
 */

/** Phosphor's source, element for element: two closed loops and two free arms. */
const LOOPS = ["128 32 192 80 128 128 128 32", "128 128 192 176 128 224 128 128"];
const ARM_UP = { x1: 64, y1: 80, x2: 128, y2: 128 };
const ARM_DOWN = { x1: 64, y1: 176, x2: 128, y2: 128 };

/** The same mark as one pen stroke, upper arm tip to lower arm tip — 672 units. */
const RUNE = "M64,80L192,176L128,224V32L192,80L64,176";

/** The pin both arms hinge on: their shared round cap, dead centre on the spine. */
const HUB = AT(128, 128);

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ══ 1. INSCRIBE ═════════════════════════════════════════════════════════════
   The rune writes itself in its one stroke — down the first diagonal, round the
   lower loop, up the spine, round the upper loop, out along the second arm.

   HONEST ON THIS MARK, and that is why it is the first idea: the glyph is
   stroked, so `pathLength` is native, and the path order is the order a hand
   writes the rune.

   WHAT IT GETS WRONG: frame 0 is an empty tile. Hovering deletes the icon and
   makes the user wait 1.1s for it back — §1's first defect, and the fiftieth
   hover will not forgive it. The restatement is also the 0.13% path. */
const inscribe: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    pathLength: [0, 1],
    // Long stroke, so opacity gets its own fast tween to kill the parked
    // round-cap dot at (64,80) without holding the drawn line translucent (§5).
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 1.1, ease: SWEEP },
      opacity: { duration: 1.1, times: [0, 0.05], ease: "linear" },
    },
  },
};

/* ══ 2. RELAY ════════════════════════════════════════════════════════════════
   The ink never leaves. A packet — a gap in the stroke — enters at the upper
   arm, runs the whole wire and leaves by the lower arm.

   FIXES 1: the pass opens and closes on the full mark, and every still frame in
   between is the rune with a short break in it.

   HOW: pathLength 1 with spacing GAP is dash [0,1] + gap [1,1+GAP], so at offset
   0 the gap sits just off either end and the mark is whole. Offsetting by 1+GAP
   carries the gap from before the start to past the end. Visible gap is
   GAP × 672 − 16 (a round cap eats 8 from each side) = 44 units, 4px at 24px.

   WHAT IT GETS WRONG: the mark itself never moves — the motion is a hole. A
   marching gap is the loading-spinner idiom, so it reads as "connecting…", a
   busy state, not as a response to the pointer. And the packet crosses the hub
   three times where other ink covers it, so at 24px it blinks out and back. */
const GAP = 0.09;
const relay: Variants = {
  normal: { pathLength: 1, pathSpacing: GAP, pathOffset: 0, transition: RETURN_TRANSITION },
  animate: {
    pathLength: 1,
    pathSpacing: GAP,
    pathOffset: [0, 1 + GAP],
    transition: { duration: 0.9, ease: SWEEP },
  },
};

/* ══ 3. SWITCH ═══════════════════════════════════════════════════════════════
   The arms are knife switches pinned at the hub. Both swing open 24° and fall
   back into line with the diagonals they continue — straight again is closed.

   FIXES 2: the mark moves, and it is the part Phosphor already drew separately.
   Split geometry measures 0.04%.

   WHAT IT GETS WRONG: two arms on mirrored identical keyframes are one gesture
   reflected, and that reads as a beak or a jaw chomping. The symmetric ease
   closes as lazily as it opened, so there is no moment the contact is made. And
   24° is past the 24px ceiling (header): at ship size the open pose fuses the
   arms into the spine. */
function swing(to: number): Variants {
  return {
    normal: { rotate: 0, transition: RETURN_TRANSITION },
    animate: {
      rotate: [0, to, 0],
      transition: { duration: 0.7, times: [0, 0.5, 1], ease: "easeInOut" },
    },
  };
}
const SWITCH_UP = swing(24);
const SWITCH_DOWN = swing(-24);

/* ══ 4. HANDSHAKE ════════════════════════════════════════════════════════════
   The arms take turns. The upper arm reaches (the ping), and the lower answers
   as it comes back (the ack) — 20% shallower, like any reply.

   FIXES 3: call and response instead of a chomp. The ack leaves as the ping
   peaks, so it reads as caused by it (§11 — overlap when one phase causes the
   next). And 16°/13° stays legible at 24px, where 3's 24° fused.

   WHAT IT GETS WRONG: each arm eases back into line on its own, at its own time,
   so the circuit never visibly closes. The story has a question and an answer
   and no ending, and at 1.0s it is also the slowest of the moving takes. */
const pingUp: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 16, 0, 0],
    transition: { duration: 1, times: [0, 0.26, 0.6, 1], ease: [ARRIVE, "easeInOut", "linear"] },
  },
};
const ackDown: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -13, 0],
    transition: { duration: 1, times: [0, 0.26, 0.56, 1], ease: ["linear", ARRIVE, "easeInOut"] },
  },
};

/* ══ 5. PAIR ═════════════════════════════════════════════════════════════════
   Ping, ack — then both blades slam into line on the same frame, knock back off
   the stop and seat. Three beats: one side asks, the other answers, they lock.

   FIXES 4: the ending. The upper arm HOLDS open while the lower answers, so the
   two can close together, and the close is an ease-in into a hard stop — the
   contact is made at full speed, which is what makes it read as a click rather
   than a drift. 0.8s, down from 1.0.

   THE RECOIL IS NOT OVERSHOOT. Each arm arrives from its own side of the line
   and knocks back 3° the way it came — never across 0, so it never passes the
   detent (§9: mechanical overshoot is zero). 3° is 4.6 units, under the floor
   on purpose: texture on a primary that already clears it (§2's exception). At
   24px it is under half a pixel; what reads as the click there is the speed
   change, full tilt to stopped, not the knock.

   THE HOLD DRIFTS 1°. Parked dead still for 240ms the open arm looks frozen,
   not waiting; a small sag keeps it alive without reading as a second motion. */
const pairUp: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 16, 15, 0, 3, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.25, 0.55, 0.7, 0.8, 1],
      ease: [ARRIVE, "linear", "easeIn", "easeOut", "easeInOut"],
    },
  },
};
const pairDown: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, 0, -13, -12, 0, -3, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.2, 0.45, 0.55, 0.7, 0.8, 1],
      ease: ["linear", ARRIVE, "linear", "easeIn", "easeOut", "easeInOut"],
    },
  },
};

/* ── rendering ───────────────────────────────────────────────────────────── */

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

/** The stroked 256-grid wrapper. The shared harness `Svg` fills, so this doesn't use it. */
function Frame({
  size,
  controls,
  children,
}: {
  size: number;
  controls: ReturnType<typeof useHover>["controls"];
  children: ReactNode;
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

/** 1 and 2: the whole rune as one animated pen stroke. */
function makeStroke(name: string, variants: Variants) {
  const Icon = forwardRef<IconHandle, IconProps>(function StrokeIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Frame size={size} controls={controls}>
          <motion.path d={RUNE} variants={variants} />
        </Frame>
      </div>
    );
  });
  Icon.displayName = name;
  return Icon;
}

/** 3–5: the loops hold still; the two arms swing about the hub. */
function makeArms(name: string, up: Variants, down: Variants) {
  const Icon = forwardRef<IconHandle, IconProps>(function ArmsIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <Frame size={size} controls={controls}>
          {LOOPS.map((points) => (
            <polygon key={points} points={points} />
          ))}
          <motion.line {...ARM_UP} variants={up} style={HUB} />
          <motion.line {...ARM_DOWN} variants={down} style={HUB} />
        </Frame>
      </div>
    );
  });
  Icon.displayName = name;
  return Icon;
}

const VARIANTS: LabVariant[] = [
  {
    name: "1 · Inscribe",
    blurb: "Writes itself in its one stroke — but hover empties the tile",
    Component: makeStroke("InscribeIcon", inscribe),
  },
  {
    name: "2 · Relay",
    blurb: "A packet runs the wire; ink stays — but nothing moves",
    Component: makeStroke("RelayIcon", relay),
  },
  {
    name: "3 · Switch",
    blurb: "Arms swing open on the hub pin — but mirrored, it chomps, and 24° fuses at 24px",
    Component: makeArms("SwitchIcon", SWITCH_UP, SWITCH_DOWN),
  },
  {
    name: "4 · Handshake",
    blurb: "Ping, then ack — but the circuit never closes",
    Component: makeArms("HandshakeIcon", pingUp, ackDown),
  },
  {
    name: "5 · Pair",
    blurb: "Ping, ack, both blades lock with a click",
    Component: makeArms("PairIcon", pairUp, pairDown),
  },
];

export default function BluetoothLabPage() {
  // playMs must outlast the LONGEST variant — 1 · Inscribe runs 1.1s.
  return <VariantGrid title="Bluetooth" variants={VARIANTS} cycleMs={3000} playMs={1500} />;
}
