"use client";

import { forwardRef, memo, useCallback, useEffect, useId, useImperativeHandle, useRef, type ComponentType } from "react";
import { animate, cubicBezier, easeIn, easeInOut, easeOut, interpolate, useMotionValue, type AnimationPlaybackControls, type EasingFunction, type MotionValue } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN, SWEEP } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Bluetooth X, round two. Five events, each with a cause you can see and
 * a consequence you can read at 24px.
 *
 * ── MEASURED, not assumed (rasterised at 512x512, counting only pixels that
 *    flip ink/no-ink) ─────────────────────────────────────────────────────────
 *
 *   ink bbox    x40..240, y24..232. Lanes: 40 left, 16 right, 24 top, 24 bottom.
 *               The right lane is the tight one; every take is checked on it.
 *
 *   THE RUNE IS `bluetooth` MOVED 16 LEFT, its upper loop broken open: the loop's
 *   edges stop halfway, at (144,56) and (144,104), and the open mouth faces the X.
 *
 *   THE X IS THE LOOP'S MISSING TIP — its strokes start at exactly those heights
 *   and run the same diagonals, pushed out and crossed. Closed back up, the rune
 *   against `bluetooth` shifted 16 is 0.084%.
 *
 *   THE RUNE HAS AN X INSIDE IT. Bluetooth is a bind rune: Hagall (ᚼ, an X on a
 *   stave) over Bjarkan (ᛒ). Its two diagonals — arm through hub to the far loop
 *   edge, both ways — cross at the hub. Here one of them is broken by the open
 *   loop. 1 · Verdict straightens that hidden X into the error mark.
 *
 *   THE X IS ITS OWN QUARTER TURN: 90° about (208,80) is 0.000%. Any spin that
 *   ends on a multiple of 90 ends on rest, which 1 and 2 spend.
 *
 * ── REJECTED — the first round (snip, eject, lost, retry, repel) ─────────────
 *
 *   Turned down as not strong enough, and the likely reasons are worth keeping.
 *   Three of the five had the corner X act alone, and it is 48 units — 4.5px at
 *   24px — so scissors, a ratchet and a re-traced stroke all read as the small
 *   mark fidgeting. "Eject" repeated the heal-then-break story `bluetooth-slash`
 *   had already told. And a packet gap and a lunge are both honest and both
 *   quiet. Round two gives every take a visible cause, an impact, and a result
 *   big enough to read.
 */

type Pt = [number, number];
const DEG = Math.PI / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const f2 = (n: number) => n.toFixed(2);

/* ── the glyph ─────────────────────────────────────────────────────────── */

const HUB: Pt = [112, 128];
const TOP: Pt = [112, 32];
/** Phosphor's lower loop, closed. */
const LOOP: Pt[] = [HUB, [176, 176], [112, 224]];
/** Phosphor's broken upper loop: lower jaw tip, hub, spine top, upper jaw tip. */
const UPPER: Pt[] = [[144, 104], HUB, TOP, [144, 56]];
const ARM_UP: [Pt, Pt] = [[48, 80], HUB];
const ARM_DOWN: [Pt, Pt] = [[48, 176], HUB];
const X_C: Pt = [208, 80];
const X_DOWN: [Pt, Pt] = [[184, 56], [232, 104]];
const X_UP: [Pt, Pt] = [[184, 104], [232, 56]];
/** The jaws: each is 40 long, at ±36.87° from its pivot. */
const JAW_LEN = 40;
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
const setLine = (el: SVGLineElement | null, a: Pt, b: Pt) => {
  el?.setAttribute("x1", f2(a[0]));
  el?.setAttribute("y1", f2(a[1]));
  el?.setAttribute("x2", f2(b[0]));
  el?.setAttribute("y2", f2(b[1]));
};
/** The corner X, moved, spun about its own centre and scaled about it. */
const xTransform = (tx: number, ty: number, r: number, s: number) =>
  `translate(${f2(tx)} ${f2(ty)}) rotate(${f2(r)} ${X_C[0]} ${X_C[1]}) translate(${X_C[0]} ${X_C[1]}) scale(${s.toFixed(3)}) translate(${-X_C[0]} ${-X_C[1]})`;
/** The X is its own quarter turn, so a spin is equivalent to its remainder in (−45, 45]. */
const quarter = (r: number) => ((((r % 90) + 135) % 90) + 90) % 90 - 45;

function Glyph() {
  return (
    <>
      <path d={pathClosed(LOOP)} />
      <polyline points={pointsOf(UPPER)} />
      <line x1={ARM_UP[0][0]} y1={ARM_UP[0][1]} x2={ARM_UP[1][0]} y2={ARM_UP[1][1]} />
      <line x1={ARM_DOWN[0][0]} y1={ARM_DOWN[0][1]} x2={ARM_DOWN[1][0]} y2={ARM_DOWN[1][1]} />
      <line x1={X_DOWN[0][0]} y1={X_DOWN[0][1]} x2={X_DOWN[1][0]} y2={X_DOWN[1][1]} />
      <line x1={X_UP[0][0]} y1={X_UP[0][1]} x2={X_UP[1][0]} y2={X_UP[1][1]} />
    </>
  );
}

/* ── timing helpers ────────────────────────────────────────────────────── */

const LINEAR = (t: number) => t;
const arrive = cubicBezier(...ARRIVE);
const sweep = cubicBezier(...SWEEP);
/** A keyframe track over `totalMs`: [ms, value, the curve arriving at it]. */
function track(totalMs: number, ...keys: [number, number, EasingFunction?][]) {
  return interpolate(
    keys.map(([ms]) => ms / totalMs),
    keys.map(([, v]) => v),
    { ease: keys.slice(1).map(([, , c]) => c ?? LINEAR) },
  );
}
type Params = Record<string, number>;
const mixParams = (a: Params, b: Params, t: number): Params =>
  Object.fromEntries(Object.keys(a).map((k) => [k, lerp(a[k], b[k], t)]));

/* ══ 1. VERDICT ══════════════════════════════════════════════════════════════
   The X is a throwing star. It winds back, spins three quarter-turns across the
   icon and buries itself in the hub — and the impact straightens the rune into
   the mark it was hiding: a full-size ✕. Held. Then the star pops back out to
   its corner and the rune reassembles around the hole it leaves.

   THE BIG ✕ IS THE RUNE'S OWN HAGALL X, NOT A NEW DRAWING. Each stroke of it is
   parts that already lie on one of the rune's two diagonals:
     · stroke 1 = the upper arm + the lower loop's inner edge, which run straight
       through the hub already. The lower loop's outer edge folds flat onto it,
       and the lower spine shrinks into the crossing.
     · stroke 2 = the lower arm + the upper loop's inner edge — the diagonal the
       broken loop had interrupted — which now reaches the corner and heals. The
       upper jaw folds flat onto it, and the upper spine shrinks into the crossing.
   Every vertex slides to its place in one number, h. The hub moves to the
   artboard centre (128,128), undoing the glyph's 16-unit shift, so the ✕ is
   centred: (56,56)–(200,200) and (56,200)–(200,56), Phosphor's `x` proportions.

   THE STAR DISAPPEARS INTO THE ✕, NOT INTO NOTHING. It lands at 270° — which is
   0°, a quarter turn being invisible on an X — so its strokes lie along the big
   ✕'s own strokes; scaled to 0.3 at the crossing it is entirely inside their
   ink. No fade: it is embedded where it hit.

   CAUSE FIRST (§11 — overlap, because one causes the other): the fold starts on
   the frame of impact and lands on ARRIVE, as if knocked into shape. The unfold
   eases in and out; the star's exit spins 180° more, overshoots its corner by 6
   and settles. Right lane: the wind-up puts the star's tips at x246.

   THE TENSION, stated: for ~0.55s the still frame is a ✕, not Bluetooth (§0
   gate 2). That is the verdict — and it is made only of the rune. */
const VERDICT_MS = 1700;
const V_H = track(VERDICT_MS, [0, 0], [380, 0], [620, 1, arrive], [1180, 1], [1500, 0, sweep], [VERDICT_MS, 0]);
const V_TX = track(VERDICT_MS, [0, 0], [180, 6, easeOut], [380, -96, easeIn], [620, -80, arrive], [1180, -80], [1440, 6, easeOut], [1620, 0, easeInOut], [VERDICT_MS, 0]);
const V_TY = track(VERDICT_MS, [0, 0], [180, -6, easeOut], [380, 48, easeIn], [1180, 48], [1440, -6, easeOut], [1620, 0, easeInOut], [VERDICT_MS, 0]);
const V_R = track(VERDICT_MS, [0, 0], [180, -10, easeOut], [380, 270, easeIn], [1180, 270], [1440, 405, easeOut], [1620, 450, easeInOut], [VERDICT_MS, 450]);
const V_S = track(VERDICT_MS, [0, 1], [380, 1], [470, 0.3, easeOut], [1180, 0.3], [1440, 1.12, easeOut], [1620, 1, easeInOut], [VERDICT_MS, 1]);

const CENTRE: Pt = [128, 128];
const V_LOOP_TO: Pt[] = [CENTRE, [200, 200], CENTRE];
const V_UPPER_TO: Pt[] = [[200, 56], CENTRE, CENTRE, [164, 92]];
const V_ARM_UP_TO: [Pt, Pt] = [[56, 56], CENTRE];
const V_ARM_DOWN_TO: [Pt, Pt] = [[56, 200], CENTRE];

const verdictParams = (u: number): Params => ({ h: V_H(u), tx: V_TX(u), ty: V_TY(u), r: quarter(V_R(u)), s: V_S(u) });
const VERDICT_REST = verdictParams(0);

/* ══ 2. CHOMP ════════════════════════════════════════════════════════════════
   The broken loop is a mouth, and it has been open at the X all along. It
   leans back and gapes, lunges, and bites: the X is sucked in spinning and the
   jaws slam shut — the loop closed, Bluetooth whole. A gulp. Then it gags, and
   spits the X back out, spinning, into its corner, and recoils.

   THE JAWS ARE THE LOOP'S TWO CUT EDGES, pivoting where they already join the
   rune: the upper on the spine's top (112,32), the lower on the hub. Gaping,
   each swings 25° outward (tips travel 17.5). Shut is not a rotation at all —
   each edge simply grows along its own line from 40 to 80 until both meet at
   the loop's tip. That is exactly how far the loop was broken.

   THE LUNGE IS 16 — the glyph's shift, undone — so at the bite the rune stands
   where plain Bluetooth stands. The X is swallowed where the tip closes, at
   (168,80), shrinking to nothing inside the mouth as the jaws meet around it.

   THE SPIT SPINS 270° and arcs up and over into the corner — rising 14, landing
   from above with a 4-unit bounce, popping to 1.1× — the one elastic overshoot,
   on the thing that was thrown. The rune recoils 8 past rest from spitting it.

   IT MUST NOT OVERSHOOT RIGHT. The first cut threw the X 10 past its corner at
   1.15× and this note claimed its tips reached x250. Measured on the promoted
   icon they reached x263: mid-spin an X turns toward a "+" and its horizontal
   reach grows from 24 to 33.9, which the 16-unit right lane cannot hold. The top
   lane has 48 to spare, so the overshoot went there. */
const CHOMP_MS = 1300;
const C_DX = track(CHOMP_MS, [0, 0], [200, -6, easeOut], [340, 16, easeIn], [440, 18, easeOut], [540, 16, easeInOut], [640, 16], [680, 20, easeInOut], [720, 12, easeInOut], [760, 16, easeInOut], [880, -8, easeOut], [1100, 0, easeInOut], [CHOMP_MS, 0]);
const C_AU = track(CHOMP_MS, [0, 0], [200, -25, easeOut], [340, 0, easeIn], [760, 0], [840, -30, easeOut], [1100, 0, easeInOut], [CHOMP_MS, 0]);
const C_AL = track(CHOMP_MS, [0, 0], [200, 25, easeOut], [340, 0, easeIn], [760, 0], [840, 30, easeOut], [1100, 0, easeInOut], [CHOMP_MS, 0]);
const C_LEN = track(CHOMP_MS, [0, 40], [200, 40], [340, 80, easeIn], [760, 80], [840, 40, easeOut], [CHOMP_MS, 40]);
// The spit arcs up and over (see the note in the header of this take).
const C_TX = track(CHOMP_MS, [0, 0], [200, 4, easeOut], [340, -40, easeIn], [760, -40], [900, -14, easeOut], [1080, 0, easeInOut], [CHOMP_MS, 0]);
const C_TY = track(CHOMP_MS, [0, 0], [760, 0], [900, -14, easeOut], [1020, 4, easeIn], [1140, 0, easeOut], [CHOMP_MS, 0]);
const C_S = track(CHOMP_MS, [0, 1], [200, 1], [340, 0, easeIn], [760, 0], [900, 1.1, easeOut], [1080, 1, easeInOut], [CHOMP_MS, 1]);
const C_R = track(CHOMP_MS, [0, 0], [200, 0], [340, -90, easeIn], [760, -90], [1080, 180, easeOut], [CHOMP_MS, 180]);

const chompParams = (u: number): Params => ({
  dx: C_DX(u),
  aU: C_AU(u),
  aL: C_AL(u),
  len: C_LEN(u),
  tx: C_TX(u),
  ty: C_TY(u),
  s: C_S(u),
  r: quarter(C_R(u)),
});
const CHOMP_REST = chompParams(0);
/** The broken upper loop with its jaws at (angle offset, length), shifted by dx. */
function jaws(dx: number, aU: number, aL: number, lenU: number, lenL: number): Pt[] {
  const hub: Pt = [HUB[0] + dx, HUB[1]];
  const top: Pt = [TOP[0] + dx, TOP[1]];
  const lower = (-JAW_DEG + aL) * DEG;
  const upper = (JAW_DEG + aU) * DEG;
  return [
    [hub[0] + lenL * Math.cos(lower), hub[1] + lenL * Math.sin(lower)],
    hub,
    top,
    [top[0] + lenU * Math.cos(upper), top[1] + lenU * Math.sin(upper)],
  ];
}

/* ══ 3. WRECK ════════════════════════════════════════════════════════════════
   The X is a wrecking ball on an unseen chain. It draws back, swings in, and
   smashes into the loop's open mouth: the jaws are flung wide, the rune
   staggers, and the ball swings back, and back again, smaller each time, and
   hangs still. The loop is left the way it was — broken.

   A PENDULUM, MEASURED TO HIT. The chain hangs from (208,−40), 120 long, so at
   rest the ball is exactly at the X's centre. Swung to −11.5° its left tips reach
   the jaw tips (8 units clear — contact at 24px). It pulls back only 4° the other
   way, because 4° already puts its right tips at x248 of the 16-unit lane. The
   ball tilts with its chain.

   THE HIT IS WHERE THE LOOP IS BROKEN. The jaws are flung 40° open on impact
   and swing back past rest by 12°, then 5° — hinges ringing (§10: decaying,
   uneven) — and settle open, as Phosphor drew them. The rune gives 10 units.

   Pendulum timing: the swing eases in toward the hit and each return eases out,
   damped over four passes (`springSwing`'s character, keyed by hand so the hit
   lands on a known frame). */
const WRECK_MS = 1500;
const PIVOT: Pt = [208, -40];
const CHAIN = 120;
const W_PHI = track(WRECK_MS, [0, 0], [260, 4, easeOut], [520, -11.5, easeIn], [700, 4, easeOut], [880, -3, easeInOut], [1060, 1.5, easeInOut], [1220, 0, easeInOut], [WRECK_MS, 0]);
const W_AU = track(WRECK_MS, [0, 0], [520, 0], [600, -40, easeOut], [760, 12, easeInOut], [900, -5, easeInOut], [1050, 0, easeInOut], [WRECK_MS, 0]);
const W_AL = track(WRECK_MS, [0, 0], [520, 0], [600, 40, easeOut], [760, -12, easeInOut], [900, 5, easeInOut], [1050, 0, easeInOut], [WRECK_MS, 0]);
const W_DX = track(WRECK_MS, [0, 0], [520, 0], [600, -10, easeOut], [800, 0, easeInOut], [WRECK_MS, 0]);
const wreckParams = (u: number): Params => ({ phi: W_PHI(u), aU: W_AU(u), aL: W_AL(u), dx: W_DX(u) });
const WRECK_REST = wreckParams(0);

/* ══ 4. GLITCH ═══════════════════════════════════════════════════════════════
   A corrupted signal. The icon tears into four horizontal bands that jump
   sideways in hard steps — three bursts, the last one throwing the X's band 22
   units left off its place — and snaps back to a clean mark in between.

   STEPS, NOT EASING, AND NO OPACITY. A glitch is discrete: every value holds until
   the next frame of the script replaces it. Nothing fades or flickers; the ink
   only moves, which keeps it inside §1.

   THE BANDS ARE CHOSEN FOR WHAT THEY CUT. A: the spine's top. B (y56–104): the
   X and both jaws — the band that carries the error. C: the hub and both arms.
   D: the lower loop. The biggest tear is C against D, which splits the rune at
   its crossing.

   SEAMS ONLY WHILE TORN. Four clipped copies that abut would show a pale thread
   along each band edge at rest — §15's shared-boundary defect. So at rest the
   plain glyph is drawn, and the clipped copies replace it only on frames where a
   band is displaced. B never goes right by more than 14: the lane is 16. */
const GLITCH_MS = 1000;
const BANDS: [number, number][] = [
  [-24, 56],
  [56, 104],
  [104, 152],
  [152, 280],
];
const GLITCH_SCRIPT: [number, number, number, number, number][] = [
  [0, 0, 0, 0, 0],
  [100, 0, 14, 0, 0],
  [140, 0, -8, 10, 0],
  [180, -6, 0, -14, 8],
  [220, 0, 0, 0, 0],
  [300, 0, 0, 20, -10],
  [340, 0, 6, -6, 0],
  [380, 0, 0, 0, 0],
  [520, 4, -22, 0, 0],
  [560, 0, -10, 6, 0],
  [600, 0, 0, 0, 0],
];
function glitchParams(u: number): Params {
  const ms = u * GLITCH_MS;
  let frame = GLITCH_SCRIPT[0];
  for (const f of GLITCH_SCRIPT) if (f[0] <= ms) frame = f;
  return { a: frame[1], b: frame[2], c: frame[3], d: frame[4] };
}
const GLITCH_REST = glitchParams(0);

/* ══ 5. FLIP ═════════════════════════════════════════════════════════════════
   The icon is a card. It lifts, flips over to show a full-size ✕ on its back,
   holds it, and flips home.

   A FLIP, NOT A SQUASH. scaleX alone thins the vertical strokes as the card turns
   edge-on, which reads as squashing. So every stroke is non-scaling at 16 units'
   worth of screen pixels (0.00% at rest, measured on `bluetooth-connected`'s
   Axle): the card foreshortens, the pen does not. The back is only visible while
   the card faces away (scaleX < 0) — which face you can see is occlusion, not a
   fade. The ✕ is mirror-symmetric, so reading it through a mirrored card costs
   nothing.

   THE CARD LIFTS AS IT TURNS: 6% larger and 6 units up at edge-on, down again as
   it lands (§10 arcs). At 1.06 the front's ink spans x35..245.

   NEVER EXACTLY EDGE-ON. A zero scale is a non-invertible transform and the
   browser drops the element (`bluetooth-connected` Axle lost the frame that
   way). The flip curve is slightly lopsided, [0.42, 0, 0.6, 1], so its zero
   crossing lands at a time no real frame hits exactly. */
const FLIP_MS = 1500;
const flipCurve = cubicBezier(0.42, 0, 0.6, 1);
const F_K = track(FLIP_MS, [0, 1], [130, 1], [420, -1, flipCurve], [900, -1], [1200, 1, flipCurve], [FLIP_MS, 1]);
const F_LIFT = track(FLIP_MS, [0, 0], [130, 0], [275, 1, easeOut], [420, 0, easeIn], [900, 0], [1050, 1, easeOut], [1200, 0, easeIn], [FLIP_MS, 0]);
const flipParams = (u: number): Params => ({ k: F_K(u), lift: F_LIFT(u) });
const FLIP_REST = flipParams(0);

/* ── the single writers ────────────────────────────────────────────────── */

type ArtProps = { clock: MotionValue<number>; home: MotionValue<number>; size: number };

/** Subscribe `apply(params)` to the clock and the hover-out blend. */
function useDriver(clock: MotionValue<number>, home: MotionValue<number>, params: (u: number) => Params, rest: Params, apply: (p: Params) => void) {
  useEffect(() => {
    const run = () => apply(mixParams(params(clock.get()), rest, home.get()));
    run();
    const a = clock.on("change", run);
    const b = home.on("change", run);
    return () => {
      a();
      b();
    };
    // The writer and its tables are module-level and stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock, home]);
}

const VerdictArt = memo(function VerdictArt({ clock, home }: ArtProps) {
  const loop = useRef<SVGPathElement>(null);
  const upper = useRef<SVGPolylineElement>(null);
  const armUp = useRef<SVGLineElement>(null);
  const armDown = useRef<SVGLineElement>(null);
  const star = useRef<SVGGElement>(null);
  useDriver(clock, home, verdictParams, VERDICT_REST, ({ h, tx, ty, r, s }) => {
    loop.current?.setAttribute("d", pathClosed(LOOP.map((p, i) => lerpPt(p, V_LOOP_TO[i], h))));
    upper.current?.setAttribute("points", pointsOf(UPPER.map((p, i) => lerpPt(p, V_UPPER_TO[i], h))));
    setLine(armUp.current, lerpPt(ARM_UP[0], V_ARM_UP_TO[0], h), lerpPt(ARM_UP[1], V_ARM_UP_TO[1], h));
    setLine(armDown.current, lerpPt(ARM_DOWN[0], V_ARM_DOWN_TO[0], h), lerpPt(ARM_DOWN[1], V_ARM_DOWN_TO[1], h));
    star.current?.setAttribute("transform", xTransform(tx, ty, r, s));
  });
  return (
    <>
      <path ref={loop} d={pathClosed(LOOP)} />
      <polyline ref={upper} points={pointsOf(UPPER)} />
      <line ref={armUp} x1={48} y1={80} x2={112} y2={128} />
      <line ref={armDown} x1={48} y1={176} x2={112} y2={128} />
      <g ref={star}>
        <line x1={184} y1={56} x2={232} y2={104} />
        <line x1={184} y1={104} x2={232} y2={56} />
      </g>
    </>
  );
});

const ChompArt = memo(function ChompArt({ clock, home }: ArtProps) {
  const body = useRef<SVGGElement>(null);
  const upper = useRef<SVGPolylineElement>(null);
  const x = useRef<SVGGElement>(null);
  useDriver(clock, home, chompParams, CHOMP_REST, ({ dx, aU, aL, len, tx, ty, s, r }) => {
    body.current?.setAttribute("transform", `translate(${f2(dx)} 0)`);
    upper.current?.setAttribute("points", pointsOf(jaws(dx, aU, aL, len, len)));
    x.current?.setAttribute("transform", xTransform(tx, ty, r, s));
  });
  return (
    <>
      <g ref={body}>
        <path d={pathClosed(LOOP)} />
        <line x1={48} y1={80} x2={112} y2={128} />
        <line x1={48} y1={176} x2={112} y2={128} />
      </g>
      <polyline ref={upper} points={pointsOf(UPPER)} />
      <g ref={x}>
        <line x1={184} y1={56} x2={232} y2={104} />
        <line x1={184} y1={104} x2={232} y2={56} />
      </g>
    </>
  );
});

const WreckArt = memo(function WreckArt({ clock, home }: ArtProps) {
  const body = useRef<SVGGElement>(null);
  const upper = useRef<SVGPolylineElement>(null);
  const ball = useRef<SVGGElement>(null);
  useDriver(clock, home, wreckParams, WRECK_REST, ({ phi, aU, aL, dx }) => {
    body.current?.setAttribute("transform", `translate(${f2(dx)} 0)`);
    upper.current?.setAttribute("points", pointsOf(jaws(dx, aU, aL, JAW_LEN, JAW_LEN)));
    // phi < 0 swings the ball left; hanging from its chain it then leans clockwise.
    const cx = PIVOT[0] + CHAIN * Math.sin(phi * DEG);
    const cy = PIVOT[1] + CHAIN * Math.cos(phi * DEG);
    ball.current?.setAttribute("transform", xTransform(cx - X_C[0], cy - X_C[1], -phi, 1));
  });
  return (
    <>
      <g ref={body}>
        <path d={pathClosed(LOOP)} />
        <line x1={48} y1={80} x2={112} y2={128} />
        <line x1={48} y1={176} x2={112} y2={128} />
      </g>
      <polyline ref={upper} points={pointsOf(UPPER)} />
      <g ref={ball}>
        <line x1={184} y1={56} x2={232} y2={104} />
        <line x1={184} y1={104} x2={232} y2={56} />
      </g>
    </>
  );
});

const GlitchArt = memo(function GlitchArt({ clock, home }: ArtProps) {
  const clip = `glitch-${useId()}`;
  const clean = useRef<SVGGElement>(null);
  const torn = useRef<SVGGElement>(null);
  const bands = [useRef<SVGGElement>(null), useRef<SVGGElement>(null), useRef<SVGGElement>(null), useRef<SVGGElement>(null)];
  useDriver(clock, home, glitchParams, GLITCH_REST, ({ a, b, c, d }) => {
    const shifts = [a, b, c, d];
    const tornNow = shifts.some((v) => Math.abs(v) > 0.01);
    clean.current?.setAttribute("visibility", tornNow ? "hidden" : "visible");
    torn.current?.setAttribute("visibility", tornNow ? "visible" : "hidden");
    bands.forEach((ref, i) => ref.current?.setAttribute("transform", `translate(${f2(shifts[i])} 0)`));
  });
  return (
    <>
      <defs>
        {BANDS.map(([y0, y1], i) => (
          <clipPath key={i} id={`${clip}-${i}`}>
            <rect x={-60} y={y0} width={376} height={y1 - y0} />
          </clipPath>
        ))}
      </defs>
      <g ref={clean}>
        <Glyph />
      </g>
      <g ref={torn} visibility="hidden">
        {BANDS.map((_, i) => (
          <g key={i} clipPath={`url(#${clip}-${i})`}>
            <g ref={bands[i]}>
              <Glyph />
            </g>
          </g>
        ))}
      </g>
    </>
  );
});

const FlipArt = memo(function FlipArt({ clock, home, size }: ArtProps) {
  const card = useRef<SVGGElement>(null);
  const front = useRef<SVGGElement>(null);
  const back = useRef<SVGGElement>(null);
  useDriver(clock, home, flipParams, FLIP_REST, ({ k, lift }) => {
    const grow = 1 + 0.06 * lift;
    card.current?.setAttribute(
      "transform",
      `translate(0 ${f2(-6 * lift)}) translate(128 128) scale(${(grow * k).toFixed(4)} ${grow.toFixed(4)}) translate(-128 -128)`,
    );
    front.current?.setAttribute("visibility", k > 0 ? "visible" : "hidden");
    back.current?.setAttribute("visibility", k < 0 ? "visible" : "hidden");
  });
  // 16 units of pen in screen pixels: non-scaling-stroke measures in the viewport.
  const pen = { strokeWidth: (16 * size) / 256, vectorEffect: "non-scaling-stroke" as const };
  return (
    <g ref={card}>
      <g ref={front} {...pen}>
        <path d={pathClosed(LOOP)} vectorEffect="non-scaling-stroke" />
        <polyline points={pointsOf(UPPER)} vectorEffect="non-scaling-stroke" />
        <line x1={48} y1={80} x2={112} y2={128} vectorEffect="non-scaling-stroke" />
        <line x1={48} y1={176} x2={112} y2={128} vectorEffect="non-scaling-stroke" />
        <line x1={184} y1={56} x2={232} y2={104} vectorEffect="non-scaling-stroke" />
        <line x1={184} y1={104} x2={232} y2={56} vectorEffect="non-scaling-stroke" />
      </g>
      <g ref={back} {...pen} visibility="hidden">
        <line x1={56} y1={56} x2={200} y2={200} vectorEffect="non-scaling-stroke" />
        <line x1={200} y1={56} x2={56} y2={200} vectorEffect="non-scaling-stroke" />
      </g>
    </g>
  );
});

/* ── icons ─────────────────────────────────────────────────────────────── */

function Static({ size, style, ...props }: IconProps) {
  return (
    <div {...props} style={{ display: "inline-flex", ...style }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256">
        <g {...STROKE}>
          <Glyph />
        </g>
      </svg>
    </div>
  );
}

/**
 * One clock over the pass; `home` blends whatever pose it reached back to rest
 * over DUR.base on RETURN when the pointer leaves — the glide every variant
 * icon's `normal` gives, without replaying the event backwards.
 */
function makeClockIcon(name: string, durationMs: number, Art: ComponentType<ArtProps>) {
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
    if (reduced) return <Static size={size} style={style} {...bind} {...props} />;
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" style={{ overflow: "visible" }}>
          <g {...STROKE}>
            <Art clock={clock} home={home} size={size} />
          </g>
        </svg>
      </div>
    );
  });
  Icon.displayName = name;
  return Icon;
}

const VARIANTS: LabVariant[] = [
  {
    name: "1 · Verdict",
    blurb: "The X, thrown into the hub, straightens the rune into a full ✕",
    Component: makeClockIcon("VerdictIcon", VERDICT_MS, VerdictArt),
  },
  {
    name: "2 · Chomp",
    blurb: "The broken loop bites the X, gags, and spits it back out",
    Component: makeClockIcon("ChompIcon", CHOMP_MS, ChompArt),
  },
  {
    name: "3 · Wreck",
    blurb: "A wrecking ball swings into the open loop and flings its jaws",
    Component: makeClockIcon("WreckIcon", WRECK_MS, WreckArt),
  },
  {
    name: "4 · Glitch",
    blurb: "The icon tears into bands that jump in hard steps",
    Component: makeClockIcon("GlitchIcon", GLITCH_MS, GlitchArt),
  },
  {
    name: "5 · Flip",
    blurb: "A card that turns over to show the ✕ on its back",
    Component: makeClockIcon("FlipIcon", FLIP_MS, FlipArt),
  },
];

export default function BluetoothXLabPage() {
  // playMs must outlast the LONGEST variant — 1 · Verdict runs 1.7s.
  return <VariantGrid title="Bluetooth X" variants={VARIANTS} cycleMs={3800} playMs={1900} />;
}
