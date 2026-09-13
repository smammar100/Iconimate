"use client";

import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { animate, cubicBezier, easeInOut, easeOut, interpolate, useMotionValue, type AnimationPlaybackControls, type EasingFunction, type MotionValue } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// HANDSHAKE — the left dot is drawn back in the fork of the arms and fired; the
// right dot reaches out to meet it; the instant they touch, the collision throws
// the rune open into a check mark between them. Hold. Unfold.
//
// VERB: the pair CONFIRM each other. Plain `bluetooth` connects (arms lock, a
// packet runs); this mark is already connected, so it shows the proof: one side
// sends, the other is hit, and the result is a tick drawn from dot to dot.
//
// MATERIAL: a sling and two hard beads. The prongs flex and ring; the beads do
// not squash; the check is knocked open (ARRIVE), not eased into being.
//
// Promoted from `app/lab/bluetooth-connected/page.tsx` (variant 7, which
// composes that page's `3 · Slingshot` with its `6 · Confirm`). The other takes,
// and every measurement below, are documented there at length.
//
// ── MEASURED (rasterised at 512x512, counting only pixels that flip ink/no-ink)
//
//   ink bbox    x48..216, y24..232. The dots, r12, sit at (60,128) and (204,128)
//               — on the rune's mirror axis, through the hub.
//   REST        body as one path + arms as lines + dots: 16 / 43,927 = 0.04%.
//   THE CHECK   (60,128) -> (104,172) -> (204,72): legs at 45°, long 2.27× the
//               short (Phosphor's `check` is 2.29×), ink x52..212, y64..180.
//               Its start is the left dot's rest centre, exactly.
//   CONTACT     centres 24 apart. The right dot reaches 8 units out, to x196, so
//               the shot touches it at x172.
//
// ── WHY IT MOVES LIKE THIS ─────────────────────────────────────────────────
//
// THE ARMS ARE A SLING. Two prongs meeting at a crotch, with the left dot
// already in the pouch between their tips. Drawn back 22 units, the prongs bend
// in 6°; released, they ring 3° past rest (§10 follow-through).
//
// CONTACT IS THE TRIGGER. The frame the dots touch is the frame the fold begins.
// An earlier composition played a full catch and throw back first, and the check
// read as an afterthought to a game of catch at 2.2s; the collision version
// makes the check the consequence of the hit, at 1.65s.
//
// THE HIT SENDS EACH DOT TO AN END OF THE CHECK. The shot rebounds straight back
// along y128 to the check's start; the right dot is knocked up to its tip. Each
// rides the part of the fold that ends under it — the shot shares the ARMS'
// window and curve, the right dot the BODY's — and shrinks from r12 to the pen's
// r8 over the last 12% of that fold, becoming the stroke's cap as it lands. No
// dot is created, removed or teleported.
//
// NOTHING IS DRAWN IN. The arms close like a pocket knife into the short stroke
// (the lower swings 82°, the upper 8°); the spine turns 45° about its moving
// centre and shortens 192 -> 141 into the long stroke; both loops fold flat onto
// it. Built in the spine's own frame, so the loops travel with the turn. The
// arms' hub end slides down the spine by the BODY's progress, not their own —
// by their own, it outran the spine and the upper tip overshot the check's start
// by 27 units.
//
// ARRIVE IN, SWEEP OUT. A collision starts the fold, so it leaves at speed and
// settles; nothing hits the unfold, so it eases in and out.
//
// ONE CLOCK, ONE WRITER. Every track — shot, right dot, prong bend, both folds —
// is a plain function of one 0..1 clock, and a memo'd component is the only
// writer of every attribute. Path `d` keyframes in a variant do not interpolate,
// `useTransform` into a motion.path races React (see `bookmark-simple`), and a
// rotate transform on a prong would twist the finished check about the old hub.
// The prong bend is added to the arm's ANGLE before the fold is applied.
//
// LEAVING MID-PASS BLENDS HOME. A second 0..1 value mixes the current pose into
// rest over DUR.base on the RETURN curve — the glide every variant icon's
// `normal` gives. Reversing the clock would replay the collision backwards.
//
// ── REJECTED (§17) ─────────────────────────────────────────────────────────
//
//   · CATCH, THEN THROW BACK, THEN FOLD — the first composition. Correct, and too
//     long: the payoff arrived after 1.1s of preamble.
//   · THE STRUCK DOT KNOCKED AWAY AND RECYCLED INTO THE POUCH. A dot that shrank
//     to nothing and grew back elsewhere — honest about count, dishonest about
//     objects.
//   · SIGNAL ARCS, BLINKING DOTS, SPINNING DOTS. Added geometry (§15), opacity as
//     motion (§1), and a circle rotated about its centre is itself (§3).
//   · A TETHER — both dots sliding sideways in unison. On screen, the icon
//     shaking its head.
//
// ── THE STANDING TEST — the failure I was most worried about ───────────────
//
// §0 GATE 2, BROKEN ON PURPOSE. For ~0.35s the still frame is a check, not a
// Bluetooth mark. That is the point of the icon — "connected" said as a
// confirmation — and the trade that keeps it honest is that nothing is added, the
// check is made of the rune's own parts and its own two dots, and every exit
// lands on the resting glyph. Second worry, the FIFTIETH HOVER: 1.65s with a
// 350ms hold is Expressive tier (§8) and heavy for a status bar. It never loops
// by itself — one pass per hover — and the hit area never moves: all ink stays
// inside x26..216 throughout (the drawn-back shot is the leftmost point).

/* -- geometry ------------------------------------------------------------- */

/** Phosphor's source, element for element — the static / reduced-motion render. */
const LOOPS = ["128 32 192 80 128 128 128 32", "128 128 192 176 128 224 128 128"];
const ARM_UP = { x1: 64, y1: 80, x2: 128, y2: 128 };
const ARM_DOWN = { x1: 64, y1: 176, x2: 128, y2: 128 };
const LEFT = { cx: 60, cy: 128, r: 12 };
const RIGHT = { cx: 204, cy: 128, r: 12 };
const SPACING = 144;

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const INK = { fill: "currentColor", stroke: "none" };

type Pt = [number, number];
const CHECK_TIP: Pt = [204, 72];
const SHORT_LEG = Math.hypot(44, 44);
const LONG_LEG = Math.hypot(100, 100);
/** Midpoint of the long leg: where the spine's centre travels to. */
const LEG_CENTRE: Pt = [154, 122];
const DEG = Math.PI / 180;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** The spine's moving frame at fold m. `at(along, out)` places a point. */
function spineAt(m: number) {
  const cx = lerp(128, LEG_CENTRE[0], m);
  const cy = lerp(128, LEG_CENTRE[1], m);
  const th = lerp(-90, -45, m) * DEG;
  const k = lerp(1, LONG_LEG / 192, m);
  const flat = 1 - m;
  const [ax, ay] = [Math.cos(th), Math.sin(th)];
  const [nx, ny] = [-Math.sin(th), Math.cos(th)];
  return (along: number, out: number): Pt => [
    cx + k * along * ax + flat * out * nx,
    cy + k * along * ay + flat * out * ny,
  ];
}

type Arm = { tip: Pt; base: Pt };
/** An arm: turns and shortens by its own fold; its hub end rides the spine by the body's. */
function armAt(restDeg: number, arms: number, body: number): Arm {
  const base = spineAt(body)(-96 * body, 0);
  const deg = lerp(restDeg, 225, arms);
  const len = lerp(80, SHORT_LEG, arms);
  return { base, tip: [base[0] + len * Math.cos(deg * DEG), base[1] + len * Math.sin(deg * DEG)] };
}
const UPPER_ARM_DEG = Math.atan2(-48, -64) / DEG + 360; // 216.87
const LOWER_ARM_DEG = Math.atan2(48, -64) / DEG; // 143.13

/** The body, hub -> lower loop -> spine -> upper loop -> hub, as (along the spine, out from it). */
const BODY_FRAME: Pt[] = [
  [0, 0],
  [-48, 64],
  [-96, 0],
  [96, 0],
  [48, 64],
  [0, 0],
];
const bodyPoints = (m: number): Pt[] => BODY_FRAME.map(([along, out]) => spineAt(m)(along, out));
const pathOf = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join("");

/* -- timeline ------------------------------------------------------------- */

const DURATION_MS = 1650;
/** The frame the shot touches the right dot. */
const CONTACT_MS = 460;
/** Shot offset at contact: the right dot has reached to x196; touching is 24 short. */
const TOUCH = SPACING - 8 - 24;

const LINEAR = (t: number) => t;
/** The shot's flight: a kick as the band lets go, near-constant speed, still moving on arrival. */
const shotCurve = cubicBezier(0.2, 0.5, 0.7, 0.8);
const arriveCurve = cubicBezier(...ARRIVE);
const sweepCurve = cubicBezier(...SWEEP);

/** A keyframe track as a function of the clock: [ms, value, the curve arriving at it]. */
function track(...keys: [number, number, EasingFunction?][]) {
  return interpolate(
    keys.map(([ms]) => ms / DURATION_MS),
    keys.map(([, value]) => value),
    { ease: keys.slice(1).map(([, , curve]) => curve ?? LINEAR) },
  );
}

/** Each dot lands with the stroke it caps: arms + shot share one window, body + right dot another. */
const FOLD_ARMS_IN = [CONTACT_MS, 860] as const;
const FOLD_BODY_IN = [CONTACT_MS + 20, 900] as const;
const FOLD_BODY_OUT = [1250, 1550] as const;
const FOLD_ARMS_OUT = [1320, 1620] as const;

const SHOT_X = track(
  [0, 0],
  [240, -22, easeInOut], // draw
  [280, -22], // aim
  [CONTACT_MS, TOUCH, shotCurve], // fly — touches the right dot still moving
  [FOLD_ARMS_IN[1], 0, arriveCurve], // rebound home, landing with the short stroke
  [DURATION_MS, 0],
);
const RIGHT_X = track(
  [0, 0],
  [370, 0],
  [CONTACT_MS, -8, easeOut], // reach to meet it
  [FOLD_BODY_IN[0], -8],
  [FOLD_BODY_IN[1], 0, arriveCurve], // knocked back to x204 as it rises to the tip
  [DURATION_MS, 0],
);
/** How far each prong bends IN, in degrees: drawn, released, rings, still. */
const PRONG = track([0, 0], [240, 6, easeInOut], [280, 6], [330, -3, easeOut], [390, 0, easeInOut], [DURATION_MS, 0]);

const windowed = (u: number, [from, to]: readonly [number, number], curve: EasingFunction) =>
  curve(clamp01((u * DURATION_MS - from) / (to - from)));

type Pose = {
  body: Pt[];
  upper: Arm;
  lower: Arm;
  shot: { cx: number; r: number };
  right: { cx: number; cy: number; r: number };
};
function poseAt(u: number): Pose {
  const arms = windowed(u, FOLD_ARMS_IN, arriveCurve) - windowed(u, FOLD_ARMS_OUT, sweepCurve);
  const body = windowed(u, FOLD_BODY_IN, arriveCurve) - windowed(u, FOLD_BODY_OUT, sweepCurve);
  const bend = PRONG(u);
  return {
    body: bodyPoints(body),
    upper: armAt(UPPER_ARM_DEG - bend, arms, body),
    lower: armAt(LOWER_ARM_DEG + bend, arms, body),
    shot: { cx: LEFT.cx + SHOT_X(u), r: 12 - 4 * clamp01((arms - 0.88) / 0.12) },
    right: { cx: RIGHT.cx + RIGHT_X(u), cy: lerp(128, CHECK_TIP[1], body), r: 12 - 4 * clamp01((body - 0.88) / 0.12) },
  };
}
const REST = poseAt(0);
const mixPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const mixArm = (a: Arm, b: Arm, t: number): Arm => ({ tip: mixPt(a.tip, b.tip, t), base: mixPt(a.base, b.base, t) });

/* -- the single writer ---------------------------------------------------- */

/** Memo'd on stable props so React never re-renders it or restores a prop over the clock. */
const Handshake = memo(function Handshake({ clock, home }: { clock: MotionValue<number>; home: MotionValue<number> }) {
  const body = useRef<SVGPathElement>(null);
  const upper = useRef<SVGLineElement>(null);
  const lower = useRef<SVGLineElement>(null);
  const shot = useRef<SVGCircleElement>(null);
  const right = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const line = (el: SVGLineElement | null, { tip, base }: Arm) => {
      el?.setAttribute("x1", tip[0].toFixed(2));
      el?.setAttribute("y1", tip[1].toFixed(2));
      el?.setAttribute("x2", base[0].toFixed(2));
      el?.setAttribute("y2", base[1].toFixed(2));
    };
    const apply = () => {
      const p = poseAt(clock.get());
      const t = home.get();
      body.current?.setAttribute("d", pathOf(p.body.map((pt, i) => mixPt(pt, REST.body[i], t))));
      line(upper.current, mixArm(p.upper, REST.upper, t));
      line(lower.current, mixArm(p.lower, REST.lower, t));
      shot.current?.setAttribute("cx", lerp(p.shot.cx, REST.shot.cx, t).toFixed(2));
      shot.current?.setAttribute("r", lerp(p.shot.r, REST.shot.r, t).toFixed(2));
      right.current?.setAttribute("cx", lerp(p.right.cx, REST.right.cx, t).toFixed(2));
      right.current?.setAttribute("cy", lerp(p.right.cy, REST.right.cy, t).toFixed(2));
      right.current?.setAttribute("r", lerp(p.right.r, REST.right.r, t).toFixed(2));
    };
    apply();
    const offClock = clock.on("change", apply);
    const offHome = home.on("change", apply);
    return () => {
      offClock();
      offHome();
    };
  }, [clock, home]);

  return (
    <>
      <path ref={body} d={pathOf(REST.body)} />
      <line ref={upper} {...ARM_UP} />
      <line ref={lower} {...ARM_DOWN} />
      {/* Both dots over the rune, the shot over the dot it strikes. */}
      <circle ref={right} {...RIGHT} {...INK} />
      <circle ref={shot} {...LEFT} {...INK} />
    </>
  );
});

export const BluetoothConnectedIcon = forwardRef<IconHandle, IconProps>(function BluetoothConnectedIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { reduced } = useHover();
  const clock = useMotionValue(0);
  const home = useMotionValue(0);
  const running = useRef<AnimationPlaybackControls | null>(null);

  const start = useCallback(() => {
    running.current?.stop();
    home.set(0);
    clock.set(0);
    running.current = animate(clock, 1, { duration: DURATION_MS / 1000, ease: "linear" });
  }, [clock, home]);

  const stop = useCallback(() => {
    running.current?.stop();
    running.current = animate(home, 1, {
      duration: DUR.base,
      ease: RETURN,
      // Once home, park both values on rest so the next hover starts clean.
      onComplete: () => {
        clock.set(0);
        home.set(0);
      },
    });
  }, [clock, home]);

  useEffect(() => () => running.current?.stop(), []);
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  const bind = { onMouseEnter: start, onMouseLeave: stop, onFocus: start, onBlur: stop };

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
            <circle {...LEFT} {...INK} />
            <circle {...RIGHT} {...INK} />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256">
        <g {...STROKE}>
          <Handshake clock={clock} home={home} />
        </g>
      </svg>
    </div>
  );
});
