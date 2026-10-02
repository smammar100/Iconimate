"use client";

import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, type ComponentType, type ReactNode } from "react";
import { animate, cubicBezier, easeInOut, interpolate, motion, useMotionValue, type AnimationPlaybackControls, type EasingFunction, type MotionValue, type Transition, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN, RETURN_TRANSITION, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { AT, VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Bluetooth Slash, five takes. Five different verbs for "off", each built
 * on what the slash actually did to this rune.
 *
 * ── MEASURED, not assumed (rasterised at 512x512, counting only pixels that
 *    flip ink/no-ink; distances are signed, + toward the upper fragment) ─────
 *
 *   ink bbox    x48..224, y24..232. Lanes: 48 left, 32 right, 24 top, 24 bottom.
 *
 *   THE SLASH IS THE RUNE'S OWN DIAGONAL, TURNED. Bluetooth's diagonal runs
 *   (64,80) -> (192,176) at 36.87°. The slash runs (56,40) -> (216,216) at
 *   47.73°, 237.9 long. The two lines cross at (153.14,146.86) — which is exactly
 *   where Phosphor ends this glyph's lower-loop stroke. So the slash is that
 *   diagonal rotated 10.86° about that point and lengthened. It is why the upper
 *   arm is gone (its tip would sit 21.0 from the slash and merge into it) and why
 *   the hub is 5.9 off the slash rather than on it. 4 · Snap is built on this.
 *
 *   THE CUTS. The upper fragment's two cut ends — the spine at (128,71.63), the
 *   loop at (158.47,105.15) — both sit EXACTLY 32.00 from the slash: Phosphor's
 *   clearance. The lower loop's two ends sit exactly ON it (0.00), capped under
 *   its ink. Anything moving PARALLEL to the slash keeps those numbers; that is
 *   what 1 · Slice spends.
 *
 *   A RING THAT IS ALREADY THERE. About the slash's midpoint (136,128), the
 *   spine's top and bottom ends sit at radius 96.3. A circle of r96 through them
 *   spans y32..224 — the rune's own height — and the slash is its diameter.
 *   5 · Prohibit is built on this.
 *
 *   RESTATEMENTS: the lower wire as one pen-order path (arm tip -> hub -> spine
 *   foot -> loop end), with the hidden inner stub kept as its own line: 7 / 41,454
 *   = 0.017%. Every other take writes Phosphor's own elements.
 *
 * ── REJECTED ─────────────────────────────────────────────────────────────────
 *
 *   · A DEADBOLT — the slash sliding in its channel and clacking home. Clean and
 *     honest (motion along the slash never touches the rune), but it says
 *     "locked", and it is the least of what this geometry offers.
 *   · A WIPER — the slash sweeping about one end. There is no lane: every angle
 *     but its own runs it through the rune, and pivoting at either end drives the
 *     far end off the artboard.
 *   · TV SWITCH-OFF, GLITCH, FLICKER. Effects that fit any icon (§15), and two of
 *     them are opacity standing in for motion (§1).
 *   · SPARKS AT THE CUT ENDS. Geometry the mark does not contain.
 */

type Pt = [number, number];
const DEG = Math.PI / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const distance = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Phosphor's source, element for element. */
const ARM = { x1: 64, y1: 176, x2: 128, y2: 128 };
const SLASH = { x1: 56, y1: 40, x2: 216, y2: 216 };
const UPPER: Pt[] = [[128, 71.63], [128, 32], [192, 80], [158.47, 105.15]];
const LOWER: Pt[] = [[184.65, 181.51], [128, 224], [128, 128], [153.14, 146.86]];
const pointsOf = (p: Pt[]) => p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

const SLASH_A: Pt = [56, 40];
const SLASH_B: Pt = [216, 216];
const SLASH_LEN = distance(SLASH_A, SLASH_B);
/** Unit vector along the slash (top-left -> bottom-right), and across it toward the upper fragment. */
const ALONG: Pt = [160 / SLASH_LEN, 176 / SLASH_LEN];
const ACROSS: Pt = [ALONG[1], -ALONG[0]];
const SLASH_DEG = Math.atan2(176, 160) / DEG;

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const HUB = AT(128, 128);

function Mark() {
  return (
    <>
      <line {...ARM} />
      <line {...SLASH} />
      <polyline points={pointsOf(UPPER)} />
      <polyline points={pointsOf(LOWER)} />
    </>
  );
}

/** A translation along a unit vector, keyed as distances. */
function shift(dir: Pt, ks: number[], transition: Transition): Variants {
  return {
    normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
    animate: { x: ks.map((k) => k * dir[0]), y: ks.map((k) => k * dir[1]), transition },
  };
}

/* ══ 1. SLICE ════════════════════════════════════════════════════════════════
   The slash went clean through, and this is the moment after. The blade draws
   back and strokes through its cut; the top half, cut free, slips down along the
   blade; the bottom half gives a little the other way. Then both slide back into
   register, and the cut is a line again.

   PARALLEL TO THE CUT IS THE ONLY SAFE DIRECTION, AND THE RIGHT ONE. A cut body
   slides along its cut plane — that is the whole visual idea of a clean slice —
   and it is also the one direction that cannot collide: moving along the slash
   leaves every signed distance to it unchanged, so the upper cut ends stay 32
   away and the lower loop ends stay capped under the slash for the whole pass.
   Any other direction would drive a fragment into the blade.

   THE HALVES DO NOT MATCH. The top half is free and slides 26; the bottom half
   is the heavier piece and gives 10 (§10: two parts on equal keyframes read as
   one). The top half's slip waits for the blade stroke to finish (§11: separate
   when one hands off to the other).

   LANES: +26 along the slash puts the upper loop's tip at x215, inside the 32-unit
   right lane; −10 puts the arm's tip at x57.

   MATERIAL: two halves of a rigid thing. Friction, so the slip eases in and out;
   the return lands on ARRIVE. No squash, no overshoot at register. */
const SLICE = 1.3;
const sliceBlade = shift(ALONG, [0, -10, 14, 0, 0], {
  duration: SLICE,
  times: [0, 0.1, 0.2, 0.32, 1],
  ease: ["easeOut", "easeIn", "easeOut", "linear"],
});
const sliceTop = shift(ALONG, [0, 0, 26, 26, 0], {
  duration: SLICE,
  times: [0, 0.2, 0.48, 0.62, 1],
  ease: ["linear", "easeInOut", "linear", ARRIVE],
});
const sliceBottom = shift(ALONG, [0, 0, -10, -10, 0], {
  duration: SLICE,
  times: [0, 0.2, 0.48, 0.62, 1],
  ease: ["linear", "easeInOut", "linear", ARRIVE],
});

/* ══ 2. BLOCKED ══════════════════════════════════════════════════════════════
   `bluetooth`'s packet, on the wire that is left. It enters at the arm's tip,
   runs through the hub, down the spine and round the loop — and meets the slash
   where the loop was cut. It cannot pass. It rebounds all the way back and out,
   and the slash is knocked back where it was hit.

   THE WIRE ENDS ON THE SLASH, WHICH IS WHAT MAKES THE WALL SOLID. The lower loop
   stops at (184.65,181.51), exactly on the slash's centre line. So when the gap
   reaches the end of the wire, the sliver of ink it squeezes into a round-cap dot
   is under the slash's ink: the packet simply meets the wall. (On `bluetooth`
   the same dot shows for a frame at the free arm tip.)

   THE PACKET MEASURES THE WIRE, NOT THE RUNE. 247 units — arm, spine, loop — is
   all the signal can reach. Nothing ever happens in the upper fragment; that is
   the picture of "disconnected".

   IMPACT, THEN REBOUND. Ease-in into the wall (it arrives at full speed),
   ease-out away from it. The rebound overshoots the start by 50 units so its slow
   tail happens off the wire, not as a gap parked on the arm tip.

   THE SLASH TAKES THE HIT: 5 units across, away from the wire, and back. Under
   the floor on purpose — texture on the packet's impact (§2's exception) — and
   enough to open a hairline between the loop's end and the blade for a few
   frames, which is the hit made visible.

   DASH 8, NOT 1: the offset swings from −0.2 to 1.0 of the wire, and a dash of 1
   would bring the pattern's next gap onto it (`bluetooth` 6 records the same). */
const BLOCKED = 1.2;
const WIRE = "M64,176L128,128L128,224L184.65,181.51";
const WIRE_LEN = 80 + 96 + Math.hypot(56.65, 42.49);
const PACKET = 50;
const OVERSCAN = 50;
const DASH = 8;
const blockedWire: Variants = {
  normal: { pathLength: DASH, pathSpacing: PACKET / WIRE_LEN, pathOffset: 0, transition: RETURN_TRANSITION },
  animate: {
    pathLength: DASH,
    pathSpacing: PACKET / WIRE_LEN,
    pathOffset: [0, 1, -OVERSCAN / WIRE_LEN],
    transition: { pathOffset: { duration: BLOCKED, times: [0, 0.45, 1], ease: ["easeIn", "easeOut"] } },
  },
};
const blockedSlash = shift(ACROSS, [0, 0, 5, 0, 0], {
  duration: BLOCKED,
  times: [0, 0.45, 0.5, 0.66, 1],
  ease: ["linear", "easeOut", "easeInOut", "linear"],
});

/* ══ 3. DENY ═════════════════════════════════════════════════════════════════
   The arm reaches for its partner. It dips, then swings up 65° — to within 9° of
   where the upper arm used to be — and the slash is there instead. The slash
   parries: it jolts toward the arm, and the arm is knocked back down onto its
   stop, bounces once, and lies still.

   THE MISSING ARM IS THE STORY. Phosphor removed the upper arm because the slash
   occupies its place (21 units off it). So the lower arm swinging up is looking
   for something the glyph genuinely no longer has, in the exact place it would
   be.

   THE REACH STOPS SHORT OF THE BLADE. At 65° the arm's tip is 32.9 from the
   slash — clear of it by 16.9 — and the parry's 10-unit jolt closes that to 6.9.
   At 24px that reads as contact without the two strokes ever merging into one.

   THE BOUNCE IS OFF THE STOP, NOT PAST IT. Knocked down, the arm lands on rest at
   full speed (ease-in) and recoils 6° back up — never below rest — the way a
   hinged part hits its stop. §9: mechanical, zero overshoot past the detent.

   Amplitude (§2): 65° at r88 is 100 units. The dip (6°, 9 units) is anticipation
   (§10) and the parry (10) is an accent on the swing. */
const DENY = 1.3;
const denyArm: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -6, 65, 63, 0, 6, 0, 0],
    transition: {
      duration: DENY,
      times: [0, 0.1, 0.42, 0.52, 0.66, 0.74, 0.86, 1],
      ease: ["easeOut", "easeOut", "linear", "easeIn", "easeOut", "easeInOut", "linear"],
    },
  },
};
const denySlash = shift(ACROSS, [0, 0, -10, 0, 0], {
  duration: DENY,
  times: [0, 0.52, 0.56, 0.72, 1],
  ease: ["linear", "easeOut", "easeInOut", "linear"],
});

/* ══ 4. SNAP ═════════════════════════════════════════════════════════════════
   The slash swings back into the diagonal it was cut from. The spine grows back
   down to the hub, the upper loop closes, the lower loop's tip returns — and for
   a beat the icon is whole: Bluetooth. Then the wire snaps. The slash whips back
   out past its angle, the cut ends recoil past their clearance, and both settle.

   THIS IS THE GLYPH'S OWN HISTORY, PLAYED BACKWARDS AND FORWARDS. The slash
   rotates about (153.14,146.86), the one point it shares with the rune's
   diagonal, and shortens 237.9 -> 160 until it IS that diagonal — which also
   restores the missing upper arm, because the diagonal runs through it. Every
   other part only extends along its own line: the spine cut down to the hub, the
   upper loop's cut along its inner edge to the hub, the lower loop's end along
   its outer edge to (192,176). The whole heal is one number, h, from 0 (slashed)
   to 1 (whole), and every point is linear in it.

   THE SNAP IS h GOING NEGATIVE. −0.2 turns the slash 2.2° past rest and pulls the
   cut ends 11 units back past their clearance — a cable whipping as it parts —
   then +0.06, then rest. That is the one overshoot here, and it is the right
   material: a wire under tension, not a mechanism.

   TIMING. The heal eases in and out (an attempt, not an impact); the whole icon
   holds 320ms; the snap is ease-in into 90ms — it breaks, it does not decide to.

   THE TENSION, stated: for ~0.3s the still frame is plain Bluetooth, which is the
   opposite of this icon (§0 gate 2). That is the take's argument — you cannot
   show a connection failing without showing the connection. Leaving mid-pass
   scales h back to 0, so an interrupted heal simply lets go. */
const SNAP_MS = 1300;
const CROSSING: Pt = [153.14, 146.86];
const DIAG_A: Pt = [64, 80];
const DIAG_B: Pt = [192, 176];
const HUB_PT: Pt = [128, 128];
const TH_SLASH = Math.atan2(176, 160);
const TH_DIAG = Math.atan2(96, 128);
const [LA0, LA1, LB0, LB1] = [distance(SLASH_A, CROSSING), distance(DIAG_A, CROSSING), distance(SLASH_B, CROSSING), distance(DIAG_B, CROSSING)];
function rawSlash(h: number): [Pt, Pt] {
  const th = lerp(TH_SLASH, TH_DIAG, h);
  const [c, s] = [Math.cos(th), Math.sin(th)];
  const la = lerp(LA0, LA1, h);
  const lb = lerp(LB0, LB1, h);
  return [
    [CROSSING[0] - la * c, CROSSING[1] - la * s],
    [CROSSING[0] + lb * c, CROSSING[1] + lb * s],
  ];
}
const RAW_REST = rawSlash(0);
/** Corrected so h=0 lands on Phosphor's exact endpoints (the crossing is rounded to 2dp). */
function slashAt(h: number): [Pt, Pt] {
  const [a, b] = rawSlash(h);
  return [
    [a[0] - RAW_REST[0][0] + SLASH_A[0], a[1] - RAW_REST[0][1] + SLASH_A[1]],
    [b[0] - RAW_REST[1][0] + SLASH_B[0], b[1] - RAW_REST[1][1] + SLASH_B[1]],
  ];
}

const LINEAR = (t: number) => t;
function track(totalMs: number, ...keys: [number, number, EasingFunction?][]) {
  return interpolate(
    keys.map(([ms]) => ms / totalMs),
    keys.map(([, v]) => v),
    { ease: keys.slice(1).map(([, , c]) => c ?? LINEAR) },
  );
}
const easeInCurve = cubicBezier(0.42, 0, 1, 1);
const easeOutCurve = cubicBezier(0, 0, 0.58, 1);
const HEAL = track(
  SNAP_MS,
  [0, 0],
  [420, 1, easeInOut], // reconnect
  [740, 1], // whole
  [830, -0.2, easeInCurve], // snap
  [960, 0.06, easeOutCurve],
  [1100, 0, easeInOut],
  [SNAP_MS, 0],
);

const SnapArt = memo(function SnapArt({ clock, home }: { clock: MotionValue<number>; home: MotionValue<number> }) {
  const slash = useRef<SVGLineElement>(null);
  const upper = useRef<SVGPolylineElement>(null);
  const lower = useRef<SVGPolylineElement>(null);
  useEffect(() => {
    const apply = () => {
      const h = HEAL(clock.get()) * (1 - home.get());
      const [a, b] = slashAt(h);
      slash.current?.setAttribute("x1", a[0].toFixed(2));
      slash.current?.setAttribute("y1", a[1].toFixed(2));
      slash.current?.setAttribute("x2", b[0].toFixed(2));
      slash.current?.setAttribute("y2", b[1].toFixed(2));
      upper.current?.setAttribute(
        "points",
        pointsOf([lerpPt(UPPER[0], HUB_PT, h), UPPER[1], UPPER[2], lerpPt(UPPER[3], HUB_PT, h)]),
      );
      lower.current?.setAttribute("points", pointsOf([lerpPt(LOWER[0], DIAG_B, h), LOWER[1], LOWER[2], LOWER[3]]));
    };
    apply();
    const a = clock.on("change", apply);
    const b = home.on("change", apply);
    return () => {
      a();
      b();
    };
  }, [clock, home]);
  return (
    <>
      <line {...ARM} />
      <polyline ref={upper} points={pointsOf(UPPER)} />
      <polyline ref={lower} points={pointsOf(LOWER)} />
      <line ref={slash} {...SLASH} />
    </>
  );
});

/* ══ 5. PROHIBIT ═════════════════════════════════════════════════════════════
   The pieces of the broken rune bend into a ring around the slash, and the slash
   draws in to meet it: ⊘. Held, then the ring lets go and the rune comes back.

   THE RING WAS MEASURED, NOT PICKED. About the slash's midpoint (136,128) the
   spine's top and bottom ends already sit at r96.3, so the ring is r96: the
   rune's own height, with the slash as its diameter. The slash shortens from
   237.9 to 192 so its ends land on the ring, the way the sign is drawn.

   EACH PIECE KEEPS ITS SIDE OF THE CUT. The slash splits the ring into two
   semicircles at 47.73° and 227.73°, and the rune is already split the same way:
   the upper fragment becomes the whole upper-right half; the lower loop and the
   arm become the lower-left half, end to end. Nothing crosses the slash.

   AND EACH PIECE GOES WHERE IT ALREADY POINTS. The pieces are laid round the ring
   in their own pen order, by arc length, and anchored where they already are: the
   lower loop starts on the slash at 47.73° (its end at (184.65,181.51) is already
   there), passes the spine foot near 90°, and hands over to the arm at 146.31° —
   the angle the arm's tip already has from the centre. So the parts that travel
   are the ones that were cut, not the ones that were fine.

   SAMPLED AT ≤6 UNITS, vertices kept, so the rest pose is the same polylines
   with collinear points added, and 96-unit arcs are smooth.

   ARRIVE IN, SWEEP OUT: the sign lands; the rune is let go. */
const PROHIBIT_MS = 1500;
const RING_C: Pt = [136, 128];
const RING_R = 96;
const ARM_TIP_DEG = Math.atan2(176 - 128, 64 - 136) / DEG; // 146.31

type RingSample = { rest: Pt; ring: Pt };
function ringSamples(vertices: Pt[], fromDeg: number, toDeg: number): RingSample[] {
  const lengths = vertices.slice(1).map((v, i) => distance(vertices[i], v));
  const total = lengths.reduce((a, b) => a + b, 0);
  const out: RingSample[] = [];
  let run = 0;
  vertices.slice(1).forEach((v, i) => {
    const a = vertices[i];
    const n = Math.max(1, Math.ceil(lengths[i] / 6));
    for (let j = i === 0 ? 0 : 1; j <= n; j++) {
      const t = j / n;
      const ang = lerp(fromDeg, toDeg, (run + lengths[i] * t) / total) * DEG;
      out.push({ rest: lerpPt(a, v, t), ring: [RING_C[0] + RING_R * Math.cos(ang), RING_C[1] + RING_R * Math.sin(ang)] });
    }
    run += lengths[i];
  });
  return out;
}
const RING_UPPER = ringSamples(UPPER, SLASH_DEG - 180, SLASH_DEG);
const RING_LOWER = ringSamples(LOWER, SLASH_DEG, ARM_TIP_DEG);
const RING_ARM = ringSamples([[64, 176], [128, 128]], ARM_TIP_DEG, SLASH_DEG + 180);
const RING_SLASH_A: Pt = [RING_C[0] - RING_R * ALONG[0], RING_C[1] - RING_R * ALONG[1]];
const RING_SLASH_B: Pt = [RING_C[0] + RING_R * ALONG[0], RING_C[1] + RING_R * ALONG[1]];
const pathAt = (samples: RingSample[], m: number) =>
  samples.map(({ rest, ring }, i) => {
    const [x, y] = lerpPt(rest, ring, m);
    return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join("");

const arriveCurve = cubicBezier(...ARRIVE);
const sweepCurve = cubicBezier(...SWEEP);
const RING = track(PROHIBIT_MS, [0, 0], [520, 1, arriveCurve], [1000, 1], [PROHIBIT_MS, 0, sweepCurve]);

const ProhibitArt = memo(function ProhibitArt({ clock, home }: { clock: MotionValue<number>; home: MotionValue<number> }) {
  const upper = useRef<SVGPathElement>(null);
  const lower = useRef<SVGPathElement>(null);
  const arm = useRef<SVGPathElement>(null);
  const slash = useRef<SVGLineElement>(null);
  useEffect(() => {
    const apply = () => {
      const m = RING(clock.get()) * (1 - home.get());
      upper.current?.setAttribute("d", pathAt(RING_UPPER, m));
      lower.current?.setAttribute("d", pathAt(RING_LOWER, m));
      arm.current?.setAttribute("d", pathAt(RING_ARM, m));
      const a = lerpPt(SLASH_A, RING_SLASH_A, m);
      const b = lerpPt(SLASH_B, RING_SLASH_B, m);
      slash.current?.setAttribute("x1", a[0].toFixed(2));
      slash.current?.setAttribute("y1", a[1].toFixed(2));
      slash.current?.setAttribute("x2", b[0].toFixed(2));
      slash.current?.setAttribute("y2", b[1].toFixed(2));
    };
    apply();
    const a = clock.on("change", apply);
    const b = home.on("change", apply);
    return () => {
      a();
      b();
    };
  }, [clock, home]);
  return (
    <>
      <path ref={arm} d={pathAt(RING_ARM, 0)} />
      <path ref={upper} d={pathAt(RING_UPPER, 0)} />
      <path ref={lower} d={pathAt(RING_LOWER, 0)} />
      <line ref={slash} {...SLASH} />
    </>
  );
});

/* ── rendering ───────────────────────────────────────────────────────────── */

function Static({
  size,
  style,
  bind,
  ...props
}: IconProps & { bind: Pick<ReturnType<typeof useHover>["bind"], "onMouseEnter" | "onMouseLeave" | "onFocus" | "onBlur"> }) {
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256">
        <g {...STROKE}>
          <Mark />
        </g>
      </svg>
    </div>
  );
}

/** Variant-driven takes: the shared hover wiring around a stroked 256 grid. */
function makeIcon(name: string, Art: () => ReactNode) {
  const Icon = forwardRef<IconHandle, IconProps>(function LabIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
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
            <Art />
          </g>
        </motion.svg>
      </div>
    );
  });
  Icon.displayName = name;
  return Icon;
}

/**
 * Clock-driven takes (4, 5): one 0..1 clock over the pass, and a `home` value
 * that scales the pose's single parameter back to 0 on hover-out — both poses
 * are linear in that parameter, so scaling it IS the glide home.
 */
function makeClockIcon(
  name: string,
  durationMs: number,
  Art: ComponentType<{ clock: MotionValue<number>; home: MotionValue<number> }>,
) {
  const Icon = forwardRef<IconHandle, IconProps>(function ClockIcon({ size = 28, style, ...props }, ref) {
    const { reduced } = useHover();
    const clock = useMotionValue(0);
    const home = useMotionValue(0);
    const running = useRef<AnimationPlaybackControls | null>(null);
    const start = useCallback(() => {
      running.current?.stop();
      home.set(0);
      clock.set(0);
      running.current = animate(clock, 1, { duration: durationMs / 1000, ease: "linear" });
    }, [clock, home]);
    const stop = useCallback(() => {
      running.current?.stop();
      running.current = animate(home, 1, {
        duration: DUR.base,
        ease: RETURN,
        onComplete: () => {
          clock.set(0);
          home.set(0);
        },
      });
    }, [clock, home]);
    useEffect(() => () => running.current?.stop(), []);
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const bind = { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop };
    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" style={{ overflow: "visible" }}>
          <g {...STROKE}>
            <Art clock={clock} home={home} />
          </g>
        </svg>
      </div>
    );
  });
  Icon.displayName = name;
  return Icon;
}

const SliceIcon = makeIcon("SliceIcon", () => (
  <>
    <motion.g variants={sliceBottom}>
      <line {...ARM} />
      <polyline points={pointsOf(LOWER)} />
    </motion.g>
    <motion.g variants={sliceTop}>
      <polyline points={pointsOf(UPPER)} />
    </motion.g>
    <motion.line {...SLASH} variants={sliceBlade} />
  </>
));

const BlockedIcon = makeIcon("BlockedIcon", () => (
  <>
    <motion.path d={WIRE} variants={blockedWire} />
    {/* The lower loop's inner stub runs along the slash's centre line, under its ink. */}
    <line x1={128} y1={128} x2={153.14} y2={146.86} />
    <polyline points={pointsOf(UPPER)} />
    <motion.line {...SLASH} variants={blockedSlash} />
  </>
));

const DenyIcon = makeIcon("DenyIcon", () => (
  <>
    <polyline points={pointsOf(UPPER)} />
    <polyline points={pointsOf(LOWER)} />
    <motion.line {...ARM} variants={denyArm} style={HUB} />
    <motion.line {...SLASH} variants={denySlash} />
  </>
));

const SnapIcon = makeClockIcon("SnapIcon", SNAP_MS, SnapArt);
const ProhibitIcon = makeClockIcon("ProhibitIcon", PROHIBIT_MS, ProhibitArt);

const VARIANTS: LabVariant[] = [
  { name: "1 · Slice", blurb: "Cut clean through — the halves slip along the blade", Component: SliceIcon },
  { name: "2 · Blocked", blurb: "A packet runs the wire, hits the slash, rebounds", Component: BlockedIcon },
  { name: "3 · Deny", blurb: "The arm reaches for its missing partner; the slash parries", Component: DenyIcon },
  { name: "4 · Snap", blurb: "Heals back into Bluetooth for a beat — then the wire snaps", Component: SnapIcon },
  { name: "5 · Prohibit", blurb: "The broken rune bends into a ring round the slash: ⊘", Component: ProhibitIcon },
];

export default function BluetoothSlashLabPage() {
  // playMs must outlast the LONGEST variant — 5 · Prohibit runs 1.5s.
  return <VariantGrid title="Bluetooth Slash" variants={VARIANTS} cycleMs={3400} playMs={1700} />;
}
