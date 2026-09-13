"use client";

import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { animate, easeIn, easeInOut, easeOut, interpolate, useMotionValue, type AnimationPlaybackControls, type EasingFunction, type MotionValue } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { DUR, RETURN } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// CHOMP — the broken loop is a mouth, and it has been open at the X all along.
// It leans back and gapes, lunges, and bites: the X is sucked in spinning and the
// jaws slam shut — the loop closed, Bluetooth whole. A gulp. Then it gags, and
// spits the X back out, spinning, into its corner, and recoils.
//
// VERB: the connection REJECTS the error. The family: `bluetooth` connects,
// `bluetooth-connected` confirms, `bluetooth-slash` is blocked — and here the rune
// tries to swallow what is wrong with it, and cannot keep it down.
//
// MATERIAL: jaws on hinges, and a hard little X. The bite is ease-in into a stop;
// the thrown X is the one thing allowed an elastic overshoot.
//
// Promoted from `app/lab/bluetooth-x/page.tsx` (round two, variant 2 of 5); the
// other takes, and the first round the owner turned down, are documented there.
//
// ── MEASURED (rasterised at 512x512, counting only pixels that flip ink/no-ink)
//
//   ink bbox    x40..240, y24..232. Lanes: 40 left, 16 right, 24 top and bottom.
//   THE RUNE    `bluetooth` moved 16 left, its upper loop broken open: the edges
//               stop halfway, at (144,56) and (144,104), mouth facing the X.
//   THE X       the loop's missing tip — its strokes start at exactly those
//               heights and run the same diagonals, pushed out and crossed.
//               Closed back up, the loop against `bluetooth` shifted 16: 0.084%.
//               The X is its own quarter turn about (208,80): 0.000%.
//   REST        Phosphor's elements, the lower loop written as a closed path and
//               the upper loop's four points as one polyline: 0.000%.
//
// ── WHY IT MOVES LIKE THIS ─────────────────────────────────────────────────
//
// THE JAWS ARE THE LOOP'S TWO CUT EDGES, pivoting where they already join the
// rune — the upper on the spine's top (112,32), the lower on the hub. Gaping,
// each swings 25° outward (tips travel 17.5). Biting is not a rotation at all:
// each edge grows along its own line from 40 to 80 until both meet at the loop's
// tip. That is exactly how far the loop was broken.
//
// THE LUNGE IS 16 — the glyph's shift, undone — so at the bite the rune stands
// where plain Bluetooth stands. The X is swallowed where the tip closes, at
// (168,80), shrinking to nothing inside the mouth as the jaws meet around it.
//
// GULP, GAG, SPIT. A 2-unit swallow, a 4-unit gag either way, then the jaws snap
// open 30° and back to 40 long while the X is thrown out. It spins 270° (an X's
// quarter turns are invisible, so it lands on rest), popping to 1.1×, and the
// rune recoils 8 past rest from spitting it.
//
// THE SPIT ARCS UP AND OVER, NEVER PAST THE CORNER — and that was a defect caught
// by sampling. The first cut threw the X straight out, 10 past its corner at
// 1.15×, and was written up here as reaching x254.8. Measured frame by frame it
// reached x263: mid-spin the X turns toward a "+", and its horizontal reach grows
// from 24 to 33.9, so the 16-unit right lane clipped it mid-gesture (§4). The top
// lane has 48 to spare, so the X now rises 14, lands from above with a 4-unit
// bounce and approaches its corner from the left. Sampled every 20ms of the pass:
// right ink peaks at x244.0 (the opening lean) and x243.9 (the spit), top at
// y22.5, and the recoiling rune's left edge at x32.
//
// ONE CLOCK, ONE WRITER. The jaws are two segments of one polyline, so they move
// by rewriting its points; variant `d`/`points` keyframes do not interpolate, and
// `useTransform` into an SVG attribute races React (see `bookmark-simple`). Every
// track is a function of one 0..1 clock, and a memo'd component is the only
// writer of every attribute.
//
// LEAVING MID-PASS BLENDS HOME. A second 0..1 value mixes the current pose into
// rest over DUR.base on the RETURN curve — the glide every variant icon's
// `normal` gives. Reversing the clock would un-spit the X.
//
// ── REJECTED (§17) ─────────────────────────────────────────────────────────
//
//   · VERDICT (the X thrown into the hub straightens the rune into a full ✕),
//     WRECK (a pendulum X flings the jaws), GLITCH (stepped band tears), FLIP (a
//     card with ✕ on its back). All built and scrubbed; see the lab page.
//   · THE FIRST ROUND — scissors, eject, a lost packet, a ratchet, a lunge.
//     Turned down: three had the corner X act alone at 4.5px, and the rest were
//     honest and quiet.
//   · THE ERROR SHAKE. An effect that fits every icon (§15).
//
// ── THE STANDING TEST — the failure I was most worried about ───────────────
//
// IN SOMEONE ELSE'S PRODUCT. A mouth that bites and spits is character animation,
// and character is exactly what fails a fintech dashboard (test 4). What keeps it
// from being a cartoon bolted onto a glyph is that nothing is invented: the mouth
// is the literal break in the loop, the bite closes it by exactly the missing
// length, and the lunge is exactly the glyph's own offset. Second, §0 gate 2: for
// ~0.4s the still frame is plain Bluetooth — the connection it cannot hold — and
// it always comes home. At 1.3s it is Expressive tier; it never repeats by
// itself, and nothing paints outside the artboard at any frame.

/* -- geometry ------------------------------------------------------------- */

type Pt = [number, number];
const DEG = Math.PI / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const f2 = (n: number) => n.toFixed(2);

const HUB: Pt = [112, 128];
const TOP: Pt = [112, 32];
/** Phosphor's lower loop, closed. */
const LOOP: Pt[] = [HUB, [176, 176], [112, 224]];
/** Phosphor's broken upper loop: lower jaw tip, hub, spine top, upper jaw tip. */
const UPPER: Pt[] = [[144, 104], HUB, TOP, [144, 56]];
const X_C: Pt = [208, 80];
const JAW_DEG = Math.atan2(24, 32) / DEG;

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 16,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const pathClosed = (p: Pt[]) => p.map(([x, y], i) => `${i ? "L" : "M"}${f2(x)},${f2(y)}`).join("") + "Z";
const pointsOf = (p: Pt[]) => p.map(([x, y]) => `${f2(x)},${f2(y)}`).join(" ");

/** The broken upper loop with its jaws at (angle offset, length), shifted by dx. */
function jaws(dx: number, aU: number, aL: number, len: number): Pt[] {
  const hub: Pt = [HUB[0] + dx, HUB[1]];
  const top: Pt = [TOP[0] + dx, TOP[1]];
  const lower = (-JAW_DEG + aL) * DEG;
  const upper = (JAW_DEG + aU) * DEG;
  return [[hub[0] + len * Math.cos(lower), hub[1] + len * Math.sin(lower)], hub, top, [top[0] + len * Math.cos(upper), top[1] + len * Math.sin(upper)]];
}

/** The X, moved, spun about its own centre and scaled about it. */
const xTransform = (tx: number, ty: number, r: number, s: number) =>
  `translate(${f2(tx)} ${f2(ty)}) rotate(${f2(r)} ${X_C[0]} ${X_C[1]}) translate(${X_C[0]} ${X_C[1]}) scale(${s.toFixed(3)}) translate(${-X_C[0]} ${-X_C[1]})`;
/** An X is its own quarter turn, so any spin equals its remainder in (−45, 45]. */
const quarter = (r: number) => ((((r % 90) + 135) % 90) + 90) % 90 - 45;

/* -- timeline ------------------------------------------------------------- */

const DURATION_MS = 1300;
const LINEAR = (t: number) => t;
/** A keyframe track: [ms, value, the curve arriving at it]. */
function track(...keys: [number, number, EasingFunction?][]) {
  return interpolate(
    keys.map(([ms]) => ms / DURATION_MS),
    keys.map(([, v]) => v),
    { ease: keys.slice(1).map(([, , c]) => c ?? LINEAR) },
  );
}

// lean back, lunge, gulp, gag, spit-recoil, settle
const DX = track([0, 0], [200, -6, easeOut], [340, 16, easeIn], [440, 18, easeOut], [540, 16, easeInOut], [640, 16], [680, 20, easeInOut], [720, 12, easeInOut], [760, 16, easeInOut], [880, -8, easeOut], [1100, 0, easeInOut], [DURATION_MS, 0]);
// gape, bite (angles back to 0 while the jaws grow), spit (snap open), settle
const JAW_UP = track([0, 0], [200, -25, easeOut], [340, 0, easeIn], [760, 0], [840, -30, easeOut], [1100, 0, easeInOut], [DURATION_MS, 0]);
const JAW_DOWN = track([0, 0], [200, 25, easeOut], [340, 0, easeIn], [760, 0], [840, 30, easeOut], [1100, 0, easeInOut], [DURATION_MS, 0]);
const JAW_LEN = track([0, 40], [200, 40], [340, 80, easeIn], [760, 80], [840, 40, easeOut], [DURATION_MS, 40]);
// resists, sucked in and swallowed at (168,80); spat up and over, lands from above
const X_TX = track([0, 0], [200, 4, easeOut], [340, -40, easeIn], [760, -40], [900, -14, easeOut], [1080, 0, easeInOut], [DURATION_MS, 0]);
const X_TY = track([0, 0], [760, 0], [900, -14, easeOut], [1020, 4, easeIn], [1140, 0, easeOut], [DURATION_MS, 0]);
const X_SCALE = track([0, 1], [200, 1], [340, 0, easeIn], [760, 0], [900, 1.1, easeOut], [1080, 1, easeInOut], [DURATION_MS, 1]);
const X_SPIN = track([0, 0], [200, 0], [340, -90, easeIn], [760, -90], [1080, 180, easeOut], [DURATION_MS, 180]);

type Pose = { dx: number; aU: number; aL: number; len: number; tx: number; ty: number; s: number; r: number };
const poseAt = (u: number): Pose => ({
  dx: DX(u),
  aU: JAW_UP(u),
  aL: JAW_DOWN(u),
  len: JAW_LEN(u),
  tx: X_TX(u),
  ty: X_TY(u),
  s: X_SCALE(u),
  r: quarter(X_SPIN(u)),
});
const REST = poseAt(0);
const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  dx: lerp(a.dx, b.dx, t),
  aU: lerp(a.aU, b.aU, t),
  aL: lerp(a.aL, b.aL, t),
  len: lerp(a.len, b.len, t),
  tx: lerp(a.tx, b.tx, t),
  ty: lerp(a.ty, b.ty, t),
  s: lerp(a.s, b.s, t),
  r: lerp(a.r, b.r, t),
});

/* -- the single writer ---------------------------------------------------- */

/** Memo'd on stable props so React never re-renders it or restores a prop over the clock. */
const Chomp = memo(function Chomp({ clock, home }: { clock: MotionValue<number>; home: MotionValue<number> }) {
  const body = useRef<SVGGElement>(null);
  const upper = useRef<SVGPolylineElement>(null);
  const x = useRef<SVGGElement>(null);

  useEffect(() => {
    const apply = () => {
      const p = mixPose(poseAt(clock.get()), REST, home.get());
      body.current?.setAttribute("transform", `translate(${f2(p.dx)} 0)`);
      upper.current?.setAttribute("points", pointsOf(jaws(p.dx, p.aU, p.aL, p.len)));
      x.current?.setAttribute("transform", xTransform(p.tx, p.ty, p.r, p.s));
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
      <g ref={body}>
        <path d={pathClosed(LOOP)} />
        <line x1={48} y1={80} x2={112} y2={128} />
        <line x1={48} y1={176} x2={112} y2={128} />
      </g>
      <polyline ref={upper} points={pointsOf(UPPER)} />
      <g ref={x}>
        <line x1={232} y1={56} x2={184} y2={104} />
        <line x1={232} y1={104} x2={184} y2={56} />
      </g>
    </>
  );
});

export const BluetoothXIcon = forwardRef<IconHandle, IconProps>(function BluetoothXIcon(
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
            <polygon points="112 128 176 176 112 224 112 128" />
            <line x1={48} y1={80} x2={112} y2={128} />
            <line x1={48} y1={176} x2={112} y2={128} />
            <line x1={232} y1={56} x2={184} y2={104} />
            <line x1={232} y1={104} x2={184} y2={56} />
            <polyline points="144 104 112 128 112 32 144 56" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256">
        <g {...STROKE}>
          <Chomp clock={clock} home={home} />
        </g>
      </svg>
    </div>
  );
});
