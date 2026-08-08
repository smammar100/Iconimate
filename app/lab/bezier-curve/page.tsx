"use client";

import { forwardRef, useId, useImperativeHandle, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";
import { VariantGrid, type LabVariant } from "../_shared/harness";

/**
 * LAB — Bezier Curve, 5 takes, each a rung above the last.
 *
 * ANATOMY, measured off the rendered fill with isPointInFill:
 *
 *   nodes    three rings, outer r32 / inner r16, at (40,176) (128,80) (216,176)
 *   handle   the tangent bar, y72..88 (16 thick), x8..248, rounded caps,
 *            running through the middle node
 *   curve    two strands from the end nodes up to the middle node's outer
 *            circle, which they meet tangentially at (99,93.44) / (157,93.44)
 *
 * THE BASELINE IS y=176 — the chord through the two end-node centres. That is
 * the line a Bezier is measured against, so it is what the arch scales about:
 * the ends stay pinned and the peak rises, which is what raising a control
 * point actually does.
 *
 * SEAMS — THE HARD-WON PART. Where a layer is lifted out of the glyph, the hole
 * left behind and the layer that refills it are two antialiased edges, and they
 * do not sum to 1. Three arrangements were built and measured against the plain
 * glyph at 4x before this one survived:
 *
 *   counter-scaling the end nodes back to circles ... visible NOTCH at both feet
 *     (the curve meets them 30 above the chord, so holding them still while the
 *     band stretches steps it by 30(k−1))
 *   counter-scaling the peak node ................. white HALO round it
 *     (1/k shrinks the layer off the body's fixed r32 boundary)
 *   punching exactly on the bar's own edges ........ full-width HAIRLINE ghost
 *     (punch ~50% over ink that is itself ~50% ⇒ a quarter of the bar survives,
 *      and once the bar tilts away it is left behind)
 *
 * So: NO counter-scaling anywhere — every layer rides the same arch transform,
 * so two clip boundaries can never separate — and the punch is bled 0.5 past
 * the ink it removes while the layer that refills it is bled 0.9, which puts
 * both soft edges in empty space. Rest measures 6 soft pixels and 0 ink flips
 * against the untouched glyph, where one perfectly straight clip seam already
 * costs 19 and painting the glyph over itself costs 2267 with 342 flips.
 */
const BEZIER =
  "M221.07,144.41A96.68,96.68,0,0,0,181,88h59a8,8,0,0,0,0-16H159a32,32,0,0,0-62,0H16a8,8,0,0,0,0,16H75a96.68,96.68,0,0,0-40.07,56.41A32,32,0,1,0,51.08,146,80.6,80.6,0,0,1,99,93.44a32,32,0,0,0,58.06,0A80.6,80.6,0,0,1,204.92,146a32,32,0,1,0,16.15-1.57ZM56,176a16,16,0,1,1-16-16A16,16,0,0,1,56,176Zm72-80a16,16,0,1,1,16-16A16,16,0,0,1,128,96Zm88,96a16,16,0,1,1,16-16A16,16,0,0,1,216,192Z";

/** A disc as a path — two half-arcs, so it composes into clip/mask strings. */
const disc = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;
/** The handle bar's band, grown by `b` so a soft edge lands in empty space. */
const band = (b: number) => `M0,${72 - b}H256V${88 + b}H0Z`;

/** Punch past the ink you remove; refill past the punch. Never equal. */
const PUNCH = 0.5;
const CLIP = 0.9;

const PEAK = { x: 128, y: 80 };
const ENDS = [
  { x: 40, y: 176 },
  { x: 216, y: 176 },
];
const NODE_R = 32;
/**
 * The swelling discs are cut at r36, not the ring's r32: the curve meets each
 * node tangentially, and a cut exactly on the junction is where a seam shows.
 * r36 takes a 4-unit collar of the band, which the disc carries with it.
 */
const SWELL_R = 36;

const AT = (x: number, y: number) => ({
  transformBox: "view-box" as const,
  originX: x / 256,
  originY: y / 256,
});
const ARCH_ORIGIN = AT(PEAK.x, 176); // scale about the chord
const PEAK_ORIGIN = AT(PEAK.x, PEAK.y);

/**
 * NODE SWELL — a ring grows by a quarter of its own 16-unit wall: r32 → r36,
 * scale 1.125. It only ever grows: a disc scaled up about its centre overlaps
 * more of the curve it joins, so the junction cannot open. Shrinking would.
 */
const SWELL = 1.125;
/**
 * TANGENT TILT — the bar's half-length is 120 (x128 out to its cap at x248). It
 * tilts until its tip is level with the top of its own control node (y=48), a
 * rise of 32: asin(32/120) = 15.47°. The handle stops at its own node's
 * ceiling, so the throw is the drawing's and not a taste value.
 */
const TILT = 15.47;
/**
 * THE PULL — k is capped by the rings. Nothing is counter-scaled (see the seam
 * note above), so the rings stretch with the arch, and the cap is that a ring
 * may not grow by more than a quarter of its own 16-unit wall: r32 → r36 tall,
 * k = 9/8. The peak then rises 96(k−1) = 12.
 */
const K = 9 / 8;
/** A seat, not a bounce — an eighth of the pull, past rest and back. */
const SEAT = 1 - (K - 1) / 8;

/* ── layer plumbing ──────────────────────────────────────────────────────── */

const Glyph = () => <path d={BEZIER} />;

function Shell({
  size,
  style,
  bind,
  controls,
  defs,
  children,
  ...props
}: IconProps & {
  bind: ReturnType<typeof useHover>["bind"];
  controls: ReturnType<typeof useHover>["controls"];
  defs?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", ...style }}>
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
        {defs ? <defs>{defs}</defs> : null}
        {children}
      </motion.svg>
    </div>
  );
}

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
        <path d={BEZIER} />
      </svg>
    </div>
  );
}

/* ══ 1. NODES ════════════════════════════════════════════════════════════════
   The smallest honest thing: the three control points light up in the order a
   curve is defined — start, control, end — each swelling a quarter of its wall
   and settling. The arch never moves; the points are read against it. 0.78s. ─ */
const swell = (delay: number): Variants => ({
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 1, SWELL, 1],
    transition: {
      duration: 0.78,
      times: [0, delay, delay + 0.2, Math.min(1, delay + 0.52)],
      ease: ["linear", "easeOut", "easeInOut"],
    },
  },
});
const swells = [swell(0), swell(0.16), swell(0.32)];

/* ══ 2. TRACE ════════════════════════════════════════════════════════════════
   The curve is REWRITTEN. A clip sweeps right, uncovering the glyph from the
   left as it goes — the drawing erases — and while the frame is genuinely empty
   the clip is repositioned to the far side and brought home, so the curve draws
   back on left to right. The jump sits on two keyframes a hundredth of a
   percent apart, at an instant when there is nothing on screen to see it.
   Leaving is ease-in, because a pen does not depart at its slowest; the redraw
   is a decelerate and takes twice as long. 1.15s. ───────────────────────────
   Nothing is lifted out of the glyph here, so there is no seam to get wrong. */
const wipe: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: {
    x: [0, 300, -300, 0],
    transition: { duration: 1.15, times: [0, 0.34, 0.3401, 1], ease: ["easeIn", "linear", "easeOut"] },
  },
};

/* ══ 3. TANGENT ══════════════════════════════════════════════════════════════
   Now it is the icon's OWN mechanism: the handle is the tangent at the control
   point, and tilting it is the whole reason a Bezier handle exists. The bar and
   its node rotate together about the node's centre — and a disc turned about
   its own centre IS itself, so the node cannot drift and only the bar reads as
   moving. It tilts, HOLDS so the new slope registers, then comes back through a
   small counter-tilt and settles. 1.0s. ─────────────────────────────────── */
const tangent: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -TILT, -TILT, TILT * 0.13, 0],
    transition: {
      duration: 1.0,
      times: [0, 0.26, 0.54, 0.82, 1],
      ease: ["easeOut", "linear", "easeInOut", "easeOut"],
    },
  },
};

/* ══ 4. PULL ═════════════════════════════════════════════════════════════════
   The real edit: the control point is dragged and THE CURVE FOLLOWS. The arch
   scales about the chord, so the ends stay pinned and the peak rises.
   NOT A LAYER IN SIGHT — one transform on the whole glyph. Every attempt to
   hold a node circular against that stretch put a notch or a halo on the icon
   (see the seam note), and the rings stretching together is both cleaner and
   more honest: the whole curve is being pulled. Rest measures 0 soft pixels
   against the original, because rest is the identity transform. 1.22s. ───── */
const pull: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, K, K, SEAT, 1],
    transition: {
      duration: 1.22,
      times: [0, 0.26, 0.58, 0.84, 1],
      ease: ["easeOut", "linear", "easeIn", "easeOut"],
    },
  },
};

/* ══ 5. EDIT ═════════════════════════════════════════════════════════════════
   The whole gesture, with the three things the others are missing.
   ANTICIPATION: the arch dips below rest before it is pulled — the curve is
   loaded, so the rise reads as caused rather than as a value changing.
   THE HANDLE LEADS THE CURVE. The tangent tilts FIRST and the arch answers it,
   which is the true causal order in a vector editor: you grab the handle, the
   geometry follows. Two tracks on one clock, the bar starting 0.1 ahead.
   AND IT LANDS DIFFERENTLY FROM HOW IT LEFT: the pull is eased in and out
   against a hold; the release is one slower ease-out with no hold at all, so
   coming home reads as letting go rather than as the gesture reversed. 1.62s.
   The bar rotates INSIDE the arch group, sharing its transform — that is what
   keeps its clip boundary locked to the body's. 1.62s. ───────────────────── */
const editArch: Variants = {
  normal: { scaleY: 1, transition: RETURN_TRANSITION },
  animate: {
    scaleY: [1, 0.965, K, K, SEAT, 1],
    transition: {
      duration: 1.62,
      times: [0, 0.08, 0.34, 0.62, 0.74, 1],
      ease: ["easeIn", "easeOut", "linear", "easeIn", "easeOut"],
    },
  },
};
const editTangent: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -TILT, -TILT, -TILT * 0.5, 0, 0],
    transition: {
      duration: 1.62,
      times: [0, 0.24, 0.52, 0.68, 0.86, 1],
      ease: ["easeOut", "linear", "easeIn", "easeOut", "linear"],
    },
  },
};

/* ══ 6. DRAG ═════════════════════════════════════════════════════════════════
   The control point is taken and moved in BOTH axes, so the arch stretches from
   the top and leans — the thing you actually do to a Bezier handle.
   Y LEADS X by 0.1 of the timeline. You lift a control point before you carry
   it sideways, and splitting the two tracks is what makes this read as a hand
   dragging rather than as two numbers changing together. 1.8s. ──────────── */
/**
 * v6 IS A d-MORPH, NOT A TRANSFORM, and it had to be. Rigid bottom rings and an
 * unbroken stroke cannot both come out of an affine map: holding a ring still
 * while the band around it stretches needs the band lifted onto its own layer,
 * and the boundary of that layer is exactly where the stroke shows a corner.
 * Rendered both ways to be sure — rigid rings gave a visible edge at each foot,
 * and removing the collar cured the edge only by letting the rings go oval.
 *
 * So the PATH DATA changes instead. The whole compound glyph is re-emitted per
 * pose and only a handful of numbers move:
 *   · the four strand-edge arcs get new radii (sagitta-preserving, so at rest
 *     the formula returns the source's own 96.68 / 80.6 exactly);
 *   · the peak-end arc endpoints and the bar's H stops ride (dx,dy), which
 *     translates the bar and the peak node RIGIDLY — the relative commands
 *     between them are untouched, so neither can distort;
 *   · every ring coordinate is absent from the list. The bottom two nodes are
 *     not held still by a counter-transform; they are simply never written to.
 *
 * Rest re-emits byte-equivalent geometry: 0 differing pixels at 4x, and the two
 * poses share an identical command skeleton, which is the condition for `d` to
 * interpolate at all. Extracting the strands as standalone paths was tried
 * first and abandoned — a hand-rebuilt strand missed the source by 1505 pixels
 * at rest, and its cap left the white notch at the peak node.
 */
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
/** The glyph re-emitted with the control point displaced by (dx, dy). */
const pose = (dx: number, dy: number) => {
  const P = (x: number, y: number) => [x + dx, y + dy];
  const rRO = radius([221.07, 144.41], [181, 88], 96.68, [221.07, 144.41], P(181, 88));
  const rLO = radius([75, 88], [34.93, 144.41], 96.68, P(75, 88), [34.93, 144.41]);
  const rLI = radius([51.08, 146], [99, 93.44], 80.6, [51.08, 146], P(99, 93.44));
  const rRI = radius([157.06, 93.44], [204.92, 146], 80.6, P(157.06, 93.44), [204.92, 146]);
  return (
    `M221.07,144.41A${n3(rRO)},${n3(rRO)},0,0,0,${n3(181 + dx)},${n3(88 + dy)}` +
    `h59a8,8,0,0,0,0-16H${n3(159 + dx)}a32,32,0,0,0-62,0H${n3(16 + dx)}a8,8,0,0,0,0,16H${n3(75 + dx)}` +
    `a${n3(rLO)},${n3(rLO)},0,0,0,${n3(34.93 - 75 - dx)},${n3(144.41 - 88 - dy)}` +
    `A32,32,0,1,0,51.08,146A${n3(rLI)},${n3(rLI)},0,0,1,${n3(99 + dx)},${n3(93.44 + dy)}` +
    `a32,32,0,0,0,58.06,0A${n3(rRI)},${n3(rRI)},0,0,1,204.92,146a32,32,0,1,0,16.15-1.57Z` +
    `M56,176a16,16,0,1,1-16-16A16,16,0,0,1,56,176Z` +
    `m${n3(72 + dx)},${n3(-80 + dy)}a16,16,0,1,1,16-16A16,16,0,0,1,${n3(128 + dx)},${n3(96 + dy)}Z` +
    `m${n3(88 - dx)},${n3(96 - dy)}a16,16,0,1,1,16-16A16,16,0,0,1,216,192Z`
  );
};
/** 6.57 up, 6.57 across — the same modest 45° throw, now carried both ways. */
const THROW = 6.57;
const dragMorph: Variants = {
  normal: { d: pose(0, 0), transition: RETURN_TRANSITION },
  animate: {
    //     rest  lift        right             ——— across ———>  left            home
    d: [
      pose(0, 0),
      pose(0, -THROW),
      pose(THROW, -THROW),
      pose(THROW, -THROW),
      pose(-THROW, -THROW),
      pose(-THROW, -THROW),
      pose(0, 0),
    ],
    transition: {
      duration: 1.8,
      times: [0, 0.14, 0.32, 0.46, 0.68, 0.8, 1],
      // the crossing is the long move — one ease-in-out, so it reads as a
      // single carry rather than two nudges
      ease: ["easeOut", "easeOut", "linear", "easeInOut", "linear", "easeOut"],
    },
  },
};

/* ══ 7. SWING ════════════════════════════════════════════════════════════════
   v6's drag with v3's TANGENT TILT folded INTO IT — the point is lifted,
   carried, and the handle swings as it goes, which is the whole gesture rather
   than either half of it.

   THE TILT IS IN THE MORPH, NOT ON A LAYER. v3 rotates the bar as a lifted
   layer, and it can only do that because the punch/clip pair is bled either
   side of the ink (see the seam note). Rotating a layer on top of v6 would put
   a clip boundary back on a glyph that has just been rid of them — and worse, a
   boundary that has to track a body which is itself morphing. So the bar's
   eight outline points are spun about the control point before they are
   written, and the whole thing stays ONE path with no boundary to separate.

   WHAT SPINS AND WHAT DOES NOT is decided by the drawing:
     · the bar's corners and caps spin — they are the handle;
     · the two rim points where the bar meets the node (97,72) (159,72) spin,
       and land back on the node's own r32 circle, because a circle turned
       about its centre is itself. The node's outline therefore never moves;
       the junction just slides round its rim;
     · the inner tangency points (99,93.44) (157.06,93.44) DO NOT spin. That is
       where the CURVE meets the node, and turning the node cannot move it.
       They ride (dx,dy) only;
     · the r16 hole sits ON the centre of rotation, so it is invariant and is
       written exactly as v6 writes it.

   THE STROKE MUST NOT DEFORM WHEN THE HANDLE TURNS — and the first cut of this
   got it wrong. Feeding the SPUN junctions into the sagitta formula re-aimed
   both outer strands, so tilting the tangent visibly bent the curve. Both radii
   are now measured off the carried-but-unspun junctions, and the bar's feet are
   found by INTERSECTING each strand's own circle with the spun underside (see
   `trim`). The strand therefore keeps its exact centre and radius through the
   whole tilt; only the point at which the bar cuts it moves. Tilt deforms
   nothing. Only the drag flexes the curve, which is the one thing that should.

   The straights are emitted as L, not H, so every pose — rest included — carries
   one skeleton and `d` can interpolate. Rest is the geometry the source draws,
   by a different spelling of it. ──────────────────────────────────────────── */
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
/**
 * THE THROW IS STILL THE DRAWING'S. v3 tilts until the bar's tip is level with
 * the top of its own node — a rise of 32 over a half-length of 120. Here the
 * lift has already spent THROW of that 32, so the spin supplies only what is
 * left: asin((32 − THROW)/120) = 12.24°, not 15.47°. The tip finishes on the
 * same ceiling; it just gets there by two means instead of one.
 */
const TILT7 = (Math.asin((32 - THROW) / 120) * 180) / Math.PI;
/** Endpoint → centre for an arc with rx=ry=r and no x-rotation (spec F.6.5). */
const arcCentre = (p0: number[], p1: number[], r: number, large: number, sweep: number) => {
  const x1 = (p0[0] - p1[0]) / 2;
  const y1 = (p0[1] - p1[1]) / 2;
  const q = x1 * x1 + y1 * y1;
  const f = Math.sqrt(Math.max(0, (r * r - q) / q));
  const s = large !== sweep ? 1 : -1;
  return [s * f * y1 + (p0[0] + p1[0]) / 2, -s * f * x1 + (p0[1] + p1[1]) / 2];
};
/**
 * WHERE THE STRAND MEETS THE SPUN BAR. The strand keeps its own circle — same
 * centre, same radius — and we only ask where the bar's underside now crosses
 * it. So tilting the tangent slides the junction ALONG the curve instead of
 * bending it: the drawing is trimmed differently, never redrawn. The root
 * nearest the untilted junction is the right one; a tilt small enough to keep
 * the arc under 180° cannot jump to the far crossing.
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
/** The glyph re-emitted with the control point displaced AND its handle spun. */
const pose7 = (dx: number, dy: number, deg: number) => {
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

  /* The junctions the CURVE owns: carried by the drag, untouched by the spin.
     Both outer radii are measured off these, so the strands flex with the drag
     exactly as v6 flexes them and not one unit more when the handle turns. */
  const j1 = [181 + dx, 88 + dy];
  const j8 = [75 + dx, 88 + dy];
  const rRO = radius([221.07, 144.41], [181, 88], 96.68, [221.07, 144.41], j1);
  const rLO = radius([75, 88], [34.93, 144.41], 96.68, j8, [34.93, 144.41]);
  const rLI = radius([51.08, 146], [99, 93.44], 80.6, [51.08, 146], tL);
  const rRI = radius([157.06, 93.44], [204.92, 146], 80.6, tR, [204.92, 146]);

  /* The bar's underside after the spin — one line, so both feet sit on it and
     the bar stays rigid between them. */
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
 * with a per-segment ease were the first cut and they stuttered: motion eases
 * BETWEEN keyframes, so an `easeOut` arriving at a keyframe drops the velocity
 * to nothing and the next segment's ease starts it again — a visible catch at
 * every junction, five of them, and a jerk out of rest where the opening
 * `easeOut` left at full speed.
 *
 * So the gesture is written as three continuous functions of one clock and
 * SAMPLED densely instead. Every ramp is a smootherstep, which is C² — zero
 * velocity AND zero acceleration at both ends — so two ramps can be laid end to
 * end without a corner at the join, and a hold between them costs nothing. The
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
const swingMorph: Variants = {
  normal: { d: pose7(0, 0, 0), transition: RETURN_TRANSITION },
  animate: {
    d: clock.map((s) => pose7(THROW * gx(s), -THROW * gy(s), -TILT7 * gr(s))),
    transition: { duration: 2.0, times: clock, ease: "linear" },
  },
};

/* ── assembly ────────────────────────────────────────────────────────────── */

const NodesIcon = forwardRef<IconHandle, IconProps>(function BezierIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId().replace(/:/g, "");
  const centres = [ENDS[0], PEAK, ENDS[1]];
  const rest = `bz-rest-${uid}`;
  const ids = centres.map((_, i) => `bz-n${i}-${uid}`);

  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;

  return (
    <Shell
      size={size}
      style={style}
      bind={bind}
      controls={controls}
      {...props}
      defs={
        <>
          <mask id={rest} maskUnits="userSpaceOnUse">
            <rect width={256} height={256} fill="#fff" />
            {centres.map((c, i) => (
              <path key={i} d={disc(c.x, c.y, SWELL_R + PUNCH)} fill="#000" />
            ))}
          </mask>
          {centres.map((c, i) => (
            <clipPath key={i} id={ids[i]} clipPathUnits="userSpaceOnUse">
              <path d={disc(c.x, c.y, SWELL_R + CLIP)} />
            </clipPath>
          ))}
        </>
      }
    >
      <g mask={`url(#${rest})`}>
        <Glyph />
      </g>
      {centres.map((c, i) => (
        <motion.g key={i} variants={swells[i]} style={AT(c.x, c.y)}>
          <g clipPath={`url(#${ids[i]})`}>
            <Glyph />
          </g>
        </motion.g>
      ))}
    </Shell>
  );
});

const TraceIcon = forwardRef<IconHandle, IconProps>(function BezierIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const uid = useId().replace(/:/g, "");
  const clip = `bz-wipe-${uid}`;

  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;

  return (
    <Shell
      size={size}
      style={style}
      bind={bind}
      controls={controls}
      {...props}
      defs={
        <clipPath id={clip} clipPathUnits="userSpaceOnUse">
          {/* the clip travels; the glyph is never touched */}
          <motion.rect x={-4} y={-4} width={264} height={264} variants={wipe} />
        </clipPath>
      }
    >
      <g clipPath={`url(#${clip})`}>
        <Glyph />
      </g>
    </Shell>
  );
});

/** Variants 3 & 5: the bar + its node lift out and rotate. When `arch` is
 *  given they rotate INSIDE it, so both clip boundaries share one transform. */
function makeHandleIcon(handle: Variants, arch?: Variants) {
  return forwardRef<IconHandle, IconProps>(function BezierIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    const uid = useId().replace(/:/g, "");
    const rest = `bz-rest-${uid}`;
    const bar = `bz-bar-${uid}`;

    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;

    const body = (
      <>
        <g mask={`url(#${rest})`}>
          <Glyph />
        </g>
        <motion.g variants={handle} style={PEAK_ORIGIN}>
          <g clipPath={`url(#${bar})`}>
            <Glyph />
          </g>
        </motion.g>
      </>
    );

    return (
      <Shell
        size={size}
        style={style}
        bind={bind}
        controls={controls}
        {...props}
        defs={
          <>
            <mask id={rest} maskUnits="userSpaceOnUse">
              <rect width={256} height={256} fill="#fff" />
              <path d={band(PUNCH)} fill="#000" />
              <path d={disc(PEAK.x, PEAK.y, NODE_R + PUNCH)} fill="#000" />
            </mask>
            {/* two children — a clipPath UNIONS them, which is what the bar and
                its node need; one even-odd path would cancel where they meet */}
            <clipPath id={bar} clipPathUnits="userSpaceOnUse">
              <path d={band(CLIP)} />
              <path d={disc(PEAK.x, PEAK.y, NODE_R + CLIP)} />
            </clipPath>
          </>
        }
      >
        {arch ? (
          <motion.g variants={arch} style={ARCH_ORIGIN}>
            {body}
          </motion.g>
        ) : (
          body
        )}
      </Shell>
    );
  });
}

/** Variant 6: ONE path, morphed. No masks, no clips, no layers — the whole
 *  glyph is re-emitted per pose, so rest is the source verbatim and nothing but
 *  the curve's own arcs can change. */
const DragIcon = forwardRef<IconHandle, IconProps>(function BezierIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;

  return (
    <Shell size={size} style={style} bind={bind} controls={controls} {...props}>
      <motion.path d={pose(0, 0)} variants={dragMorph} />
    </Shell>
  );
});

/** Variant 7: v6's morph carrying v3's tangent tilt. Still one path — the spin
 *  is applied to the bar's points, not to a layer above them. */
const SwingIcon = forwardRef<IconHandle, IconProps>(function BezierIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;

  return (
    <Shell size={size} style={style} bind={bind} controls={controls} {...props}>
      <motion.path d={pose7(0, 0, 0)} variants={swingMorph} />
    </Shell>
  );
});

/** Variant 4: no layers at all — one transform on the whole glyph, about the
 *  chord. Seam-free by construction and exact at rest. */
function makeArchIcon(arch: Variants) {
  return forwardRef<IconHandle, IconProps>(function BezierIcon(
    { size = 28, style, ...props },
    ref,
  ) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

    if (reduced) return <Static size={size} style={style} bind={bind} {...props} />;

    return (
      <Shell size={size} style={style} bind={bind} controls={controls} {...props}>
        <motion.g variants={arch} style={ARCH_ORIGIN}>
          <Glyph />
        </motion.g>
      </Shell>
    );
  });
}

const VARIANTS: LabVariant[] = [
  {
    name: "1 · Nodes",
    blurb: "Start, control, end light up in the order a curve is defined.",
    Component: NodesIcon,
  },
  {
    name: "2 · Trace",
    blurb: "The curve erases to the right and redraws from the left.",
    Component: TraceIcon,
  },
  {
    name: "3 · Tangent",
    blurb: "The handle tilts 15.5° — until its tip meets its own node's ceiling.",
    Component: makeHandleIcon(tangent),
  },
  {
    name: "4 · Pull",
    blurb: "The control point is dragged and the curve follows, ends pinned.",
    Component: makeArchIcon(pull),
  },
  {
    name: "5 · Edit",
    blurb: "Anticipation, the handle leading the curve, and a release that lets go.",
    Component: makeHandleIcon(editTangent, editArch),
  },
  {
    name: "6 · Drag",
    blurb: "Lifted, carried right, swept across left — bottom two never move.",
    Component: DragIcon,
  },
  {
    name: "7 · Swing",
    blurb: "The drag with the tangent tilting as it is carried — and the curve never bends for it.",
    Component: SwingIcon,
  },
];

export default function BezierLab() {
  return <VariantGrid title="Bezier Curve" variants={VARIANTS} cycleMs={3600} playMs={2100} />;
}
