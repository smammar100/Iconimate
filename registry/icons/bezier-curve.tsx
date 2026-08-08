"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SWING — the control point is lifted, carried right, swept across to the left
// and let home, and the tangent handle turns as it goes. It is the gesture you
// actually perform on a Bezier handle rather than a property being animated.
//
// ONE PATH. NO MASKS, NO CLIPS, NO LAYERS. The whole compound glyph is
// re-emitted per pose and only a handful of numbers move. That is not a
// stylistic preference — it is the only arrangement that survived. Lifting the
// bar onto its own layer (the obvious way to rotate it) puts a clip boundary
// through the drawing, and where a layer is lifted out of a glyph the hole left
// behind and the layer that refills it are two antialiased edges that do not
// sum to 1. Three arrangements were built and measured against the plain glyph
// at 4x before this one:
//
//   rigid bottom rings under a stretching band .... visible EDGE at each foot
//   counter-scaling the peak node ................. white HALO round it
//   punching exactly on the bar's own edges ....... full-width HAIRLINE ghost
//
// Changing the path data has no such failure mode: there is no second edge to
// misalign, so rest is exact BY CONSTRUCTION rather than by tolerance.
//
// ANATOMY, measured off the rendered fill with isPointInFill:
//
//   nodes    three rings, outer r32 / inner r16, at (40,176) (128,80) (216,176)
//   handle   the tangent bar, y72..88 (16 thick), x8..248, rounded caps,
//            running through the middle node
//   curve    two strands from the end nodes up to the middle node's outer
//            circle, which they meet tangentially at (99,93.44) / (157.06,93.44)
//
// WHAT MOVES AND WHAT DOES NOT is decided by the drawing, not by taste:
//   · the four strand-edge arcs get new radii, sagitta-preserving, so at rest
//     the formula returns the source's own 96.68 / 80.6 exactly;
//   · the bar's corners and caps carry AND spin — they are the handle;
//   · the rim points where the bar meets the node (97,72) (159,72) spin, and
//     land back on the node's own r32 circle, because a circle turned about its
//     centre is itself. The node's outline therefore never moves; the junction
//     just slides round its rim;
//   · the inner tangency points (99,93.44) (157.06,93.44) never spin. That is
//     where the CURVE meets the node, and turning the node cannot move it;
//   · the r16 hole sits ON the centre of rotation, so it is invariant;
//   · every bottom-ring coordinate is absent from the list. The two lower nodes
//     are not held still by a counter-transform; they are simply never written.
//
// THE STROKE MUST NOT DEFORM WHEN THE HANDLE TURNS. Feeding the SPUN junctions
// into the sagitta formula re-aims both outer strands, and tilting the tangent
// then visibly bends the curve — which is wrong: a tangent turning changes
// where the bar covers the strand, not the strand. So both outer radii are
// measured off the carried-but-unspun junctions, and the bar's feet are found
// by INTERSECTING each strand's own circle with the spun underside (`trim`).
// The strand keeps its exact centre and radius through the whole tilt; only the
// point at which the bar cuts it moves. Only the drag flexes the curve, which
// is the one thing that should. Measured across a full cycle: the tilt sweeps
// the full +/-12.23 deg while the outer radius holds constant to 4 decimals.
//
// Rest re-emits byte-equivalent geometry — 0 differing pixels and 0 ink flips
// at 4x against the untouched Phosphor mark — and every pose shares one command
// skeleton, which is the condition for `d` to interpolate at all. The straights
// are written as L rather than H for exactly that reason: rest is the geometry
// the source draws, by a different spelling of it.
const BEZIER =
  "M221.07,144.41A96.68,96.68,0,0,0,181,88h59a8,8,0,0,0,0-16H159a32,32,0,0,0-62,0H16a8,8,0,0,0,0,16H75a96.68,96.68,0,0,0-40.07,56.41A32,32,0,1,0,51.08,146,80.6,80.6,0,0,1,99,93.44a32,32,0,0,0,58.06,0A80.6,80.6,0,0,1,204.92,146a32,32,0,1,0,16.15-1.57ZM56,176a16,16,0,1,1-16-16A16,16,0,0,1,56,176Zm72-80a16,16,0,1,1,16-16A16,16,0,0,1,128,96Zm88,96a16,16,0,1,1,16-16A16,16,0,0,1,216,192Z";

const D2 = (a: number[], b: number[]) => Math.hypot(b[0] - a[0], b[1] - a[1]);
/** Radius that keeps sagitta proportional to chord; identity at rest. */
const radius = (p0: number[], q0: number[], r0: number, p: number[], q: number[]) => {
  const c0 = D2(p0, q0);
  const s0 = r0 - Math.sqrt(r0 * r0 - (c0 * c0) / 4);
  const c = D2(p, q);
  const s = (s0 * c) / c0;
  return (c * c) / 4 / s / 2 + s / 2;
};
const n3 = (n: number) => Number(n.toFixed(3));
const RAD = Math.PI / 180;
/** Spin p about c by `deg`, y-down so positive reads clockwise, as CSS does. */
const spin = (p: number[], c: number[], deg: number) => {
  const t = deg * RAD;
  const cs = Math.cos(t);
  const sn = Math.sin(t);
  const x = p[0] - c[0];
  const y = p[1] - c[1];
  return [c[0] + x * cs - y * sn, c[1] + x * sn + y * cs];
};
/** Endpoint -> centre for an arc with rx=ry=r and no x-rotation (spec F.6.5). */
const arcCentre = (p0: number[], p1: number[], r: number, large: number, sweep: number) => {
  const x1 = (p0[0] - p1[0]) / 2;
  const y1 = (p0[1] - p1[1]) / 2;
  const q = x1 * x1 + y1 * y1;
  const f = Math.sqrt(Math.max(0, (r * r - q) / q));
  const s = large !== sweep ? 1 : -1;
  return [s * f * y1 + (p0[0] + p1[0]) / 2, -s * f * x1 + (p0[1] + p1[1]) / 2];
};
/**
 * Where the strand meets the spun bar. The strand keeps its own circle — same
 * centre, same radius — and we only ask where the bar's underside now crosses
 * it, so the tilt slides the junction ALONG the curve instead of bending it.
 * The root nearest the untilted junction is the right one; a tilt small enough
 * to keep the arc under 180 deg cannot jump to the far crossing.
 */
const trim = (O: number[], r: number, A: number[], u: number[], near: number[]) => {
  const fx = A[0] - O[0];
  const fy = A[1] - O[1];
  const b = fx * u[0] + fy * u[1];
  const disc = b * b - (fx * fx + fy * fy - r * r);
  if (disc < 0) return near; // no crossing — leave the junction where it was
  const sd = Math.sqrt(disc);
  const hit = [-b + sd, -b - sd].map((t) => [A[0] + t * u[0], A[1] + t * u[1]]);
  return D2(hit[0], near) <= D2(hit[1], near) ? hit[0] : hit[1];
};

/** 6.57 up, 6.57 across — a modest 45 deg throw, carried both ways. */
const THROW = 6.57;
/**
 * THE TILT IS THE DRAWING'S, NOT A TASTE VALUE. The bar's half-length is 120
 * (x128 out to its cap at x248), and it turns until its tip is level with the
 * top of its own control node (y=48) — a rise of 32. The lift has already spent
 * THROW of that 32, so the spin supplies only what is left:
 * asin((32 - THROW)/120) = 12.24 deg. The tip finishes on its own node's
 * ceiling; it just gets there by two means instead of one.
 */
const TILT = (Math.asin((32 - THROW) / 120) * 180) / Math.PI;

/** The glyph re-emitted with the control point displaced AND its handle spun. */
const pose = (dx: number, dy: number, deg: number) => {
  const C = [128 + dx, 80 + dy];
  const R = (x: number, y: number) => spin([x + dx, y + dy], C, deg);
  const b2 = R(240, 88);
  const b3 = R(240, 72);
  const b4 = R(159, 72); // on the node's rim
  const b5 = R(97, 72); // on the node's rim
  const b6 = R(16, 72);
  const b7 = R(16, 88);
  const tL = [99 + dx, 93.44 + dy]; // carried, never spun
  const tR = [157.06 + dx, 93.44 + dy];

  // The junctions the CURVE owns: carried by the drag, untouched by the spin.
  const j1 = [181 + dx, 88 + dy];
  const j8 = [75 + dx, 88 + dy];
  const rRO = radius([221.07, 144.41], [181, 88], 96.68, [221.07, 144.41], j1);
  const rLO = radius([75, 88], [34.93, 144.41], 96.68, j8, [34.93, 144.41]);
  const rLI = radius([51.08, 146], [99, 93.44], 80.6, [51.08, 146], tL);
  const rRI = radius([157.06, 93.44], [204.92, 146], 80.6, tR, [204.92, 146]);

  // The bar's underside after the spin — one line, so both feet sit on it and
  // the bar stays rigid between them.
  const t = deg * RAD;
  const u = [Math.cos(t), Math.sin(t)];
  const A = spin([16 + dx, 88 + dy], C, deg);
  const b1 = trim(arcCentre([221.07, 144.41], j1, rRO, 0, 0), rRO, A, u, j1);
  const b8 = trim(arcCentre(j8, [34.93, 144.41], rLO, 0, 0), rLO, A, u, j8);

  const P = (p: number[]) => `${n3(p[0])},${n3(p[1])}`;
  const D = (a: number[], b: number[]) => `${n3(b[0] - a[0])},${n3(b[1] - a[1])}`;
  return (
    `M221.07,144.41A${n3(rRO)},${n3(rRO)},0,0,0,${P(b1)}` +
    `L${P(b2)}a8,8,0,0,0,${D(b2, b3)}L${P(b4)}a32,32,0,0,0,${D(b4, b5)}` +
    `L${P(b6)}a8,8,0,0,0,${D(b6, b7)}L${P(b8)}` +
    `A${n3(rLO)},${n3(rLO)},0,0,0,34.93,144.41` +
    `A32,32,0,1,0,51.08,146A${n3(rLI)},${n3(rLI)},0,0,1,${P(tL)}` +
    `A32,32,0,0,0,${P(tR)}A${n3(rRI)},${n3(rRI)},0,0,1,204.92,146a32,32,0,1,0,16.15-1.57Z` +
    `M56,176a16,16,0,1,1-16-16A16,16,0,0,1,56,176Z` +
    `m${n3(72 + dx)},${n3(-80 + dy)}a16,16,0,1,1,16-16A16,16,0,0,1,${n3(128 + dx)},${n3(96 + dy)}Z` +
    `m${n3(88 - dx)},${n3(96 - dy)}a16,16,0,1,1,16-16A16,16,0,0,1,216,192Z`
  );
};

/**
 * THE SMOOTHNESS IS IN THE SAMPLING, NOT IN THE EASING. Hand-placed keyframes
 * with a per-segment ease stutter: motion eases BETWEEN keyframes, so an
 * `easeOut` arriving at a keyframe drops the velocity to nothing and the next
 * segment's ease starts it again — a visible catch at every junction, and a
 * jerk out of rest wherever the opening segment leaves at full speed.
 *
 * So the gesture is written as three continuous functions of one clock and
 * SAMPLED densely instead. Every ramp is a smootherstep, which is C2 — zero
 * velocity AND zero acceleration at both ends — so two ramps lie end to end
 * without a corner at the join, and a hold between them costs nothing. The
 * keyframes are then uniform and the easing is `linear`: with the shape already
 * in the samples, any easing on top would only re-introduce the stutter.
 */
const smoother = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * c * (c * (6 * c - 15) + 10);
};
const ramp = (s: number, s0: number, s1: number, a: number, b: number) =>
  a + (b - a) * smoother((s - s0) / (s1 - s0));

/** Carry: still, out to the right, across to the left, home. */
const gx = (s: number) =>
  s < 0.18 ? 0
  : s < 0.4 ? ramp(s, 0.18, 0.4, 0, 1)
  : s < 0.46 ? 1
  : s < 0.72 ? ramp(s, 0.46, 0.72, 1, -1)
  : s < 0.8 ? -1
  : ramp(s, 0.8, 1, -1, 0);
/** Lift: up first, held through the whole carry, released on the way home. */
const gy = (s: number) => (s < 0.18 ? ramp(s, 0, 0.18, 0, 1) : s < 0.8 ? 1 : ramp(s, 0.8, 1, 1, 0));
/**
 * THE HANDLE TRAILS THE HAND — by running the same shape on a schedule shifted
 * ~0.07 later, rather than by lagging the clock. A lagged clock cannot land on
 * zero at s=1 and would leave the icon resting tilted; this ends where it
 * started, so coming home needs no separate unwind.
 */
const gr = (s: number) =>
  s < 0.25 ? 0
  : s < 0.47 ? ramp(s, 0.25, 0.47, 0, 1)
  : s < 0.53 ? 1
  : s < 0.79 ? ramp(s, 0.53, 0.79, 1, -1)
  : s < 0.85 ? -1
  : ramp(s, 0.85, 1, -1, 0);

const FRAMES = 21;
const clock = Array.from({ length: FRAMES }, (_, i) => i / (FRAMES - 1));
const swing: Variants = {
  normal: { d: pose(0, 0, 0), transition: RETURN_TRANSITION },
  animate: {
    d: clock.map((s) => pose(THROW * gx(s), -THROW * gy(s), -TILT * gr(s))),
    transition: { duration: 2.0, times: clock, ease: "linear" },
  },
};

export const BezierCurveIcon = forwardRef<IconHandle, IconProps>(function BezierCurveIcon(
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
          fill="currentColor"
        >
          <path d={BEZIER} />
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
        fill="currentColor"
        initial="normal"
        animate={controls}
        style={{ overflow: "visible" }}
      >
        <motion.path d={pose(0, 0, 0)} variants={swing} />
      </motion.svg>
    </div>
  );
});
