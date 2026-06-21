"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION, ARRIVE } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/** Back-out overshoot — spring-like snap for multi-keyframe tweens. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/**
 * LAB — Arrow Bend Double Up-Left, animation candidates.
 *
 * The Phosphor glyph is two filled subpaths (OUTER chevron + MAIN). For the
 * transform-driven variants we move those filled paths directly. For the
 * line-drawing variants we instead trace the glyph's CENTERLINE as a stroke and
 * let a separate arrowhead group ride the growing tip — see <Tracer/>.
 */
const OUTER_HEAD =
  "M85.66,146.34a8,8,0,0,1-11.32,11.32l-48-48a8,8,0,0,1,0-11.32l48-48A8,8,0,0,1,85.66,61.66L43.31,104Z";
const MAIN =
  "M128,96H99.31l34.35-34.34a8,8,0,0,0-11.32-11.32l-48,48a8,8,0,0,0,0,11.32l48,48a8,8,0,0,0,11.32-11.32L99.31,112H128a88.1,88.1,0,0,1,88,88,8,8,0,0,0,16,0A104.11,104.11,0,0,0,128,96Z";

// Centerline of the glyph: tail end → around the quarter-bend (centered 128,200,
// r≈96) → straight out the shaft to the arrowhead tip at (40,104).
const SPINE = "M224,200A96,96,0,0,0,128,104L40,104";
const SPINE_W = 120;

// Inside corner of the bend — pivot for the transform variants.
const BEND_PIVOT = { x: 128 / 256, y: 200 / 256 };

// A double-chevron arrowhead, tip at the origin, pointing +x (the travel
// direction). Sized to match the real Phosphor heads so the resting trace reads
// as the true glyph; rotating it by the path's tangent makes it follow the curve.
const HEAD = "M0,0 L-48,-46 M0,0 L-48,46 M-26,0 L-74,-46 M-26,0 L-74,46";
const TRACE_W = 16;

function Svg({
  size,
  controls,
  children,
}: {
  size: number;
  controls: ReturnType<typeof useHover>["controls"];
  children: React.ReactNode;
}) {
  return (
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
      {children}
    </motion.svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TRACER — the real line-drawing engine.

   • The line is drawn with stroke-dasharray = pathLength and an animated
     stroke-dashoffset (offset = length - drawn).
   • A `progress` motion value (0→1) drives the drawn length.
   • On every change we read getPointAtLength(L) for the tip, and the tangent
     angle from points just behind/ahead of L (Math.atan2), then translate+rotate
     the arrowhead group onto the moving tip so it points around the curve.
   • If `overshoot`, progress is allowed past 1 (underdamped spring); we then
     extrapolate the tip along the final tangent so the head shoots past the end
     and springs back.
   ════════════════════════════════════════════════════════════════════════════ */
interface TracerOpts {
  /** Centerline path to draw. */
  d: string;
  duration?: number;
  ease?: "easeIn" | "easeOut" | "easeInOut" | "linear";
  spring?: boolean;
  stiffness?: number;
  damping?: number;
  overshoot?: boolean;
  loop?: boolean;
  /** Draw out then retract, forever. */
  pingpong?: boolean;
  /** Start fully drawn and retract first (head leads back, then redraws). */
  retract?: boolean;
  /** Accent comet trailing the tip. */
  accent?: boolean;
}

const Tracer = forwardRef<IconHandle, IconProps & TracerOpts>(function Tracer(
  {
    size = 28,
    style,
    d,
    duration = 1.1,
    ease = "easeInOut",
    spring = false,
    stiffness = 260,
    damping = 14,
    overshoot = false,
    loop = false,
    pingpong = false,
    retract = false,
    accent = false,
    ...props
  },
  ref,
) {
  const reduced = useReducedMotion() ?? false;
  const pathRef = useRef<SVGPathElement>(null);
  const accentRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const progress = useMotionValue(1);
  const anim = useRef<ReturnType<typeof animate> | null>(null);
  const totalRef = useRef(0);

  const render = useCallback(() => {
    const path = pathRef.current;
    const head = headRef.current;
    if (!path || !head) return;
    // getTotalLength forces layout and never changes — measure once, reuse.
    const total = totalRef.current || (totalRef.current = path.getTotalLength());
    if (!total) return;

    const p = progress.get();
    const Lraw = p * total;
    const L = Math.max(0, Math.min(total, Lraw));

    // Draw the line up to L.
    path.style.strokeDasharray = `${total}`;
    path.style.strokeDashoffset = `${total - L}`;

    // Tip position + tangent angle.
    let px: number, py: number, ang: number;
    if (overshoot && Lraw > total) {
      const end = path.getPointAtLength(total);
      const before = path.getPointAtLength(total - 1);
      let dx = end.x - before.x;
      let dy = end.y - before.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      // Cap the shoot-past so the head only nudges beyond the tip and springs back.
      const ext = Math.min(Lraw - total, 12);
      px = end.x + dx * ext;
      py = end.y + dy * ext;
      ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    } else {
      const tip = path.getPointAtLength(L);
      const a = path.getPointAtLength(Math.max(0, L - 1));
      const b = path.getPointAtLength(Math.min(total, L + 1));
      px = tip.x;
      py = tip.y;
      ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    }
    head.setAttribute("transform", `translate(${px} ${py}) rotate(${ang})`);
    head.style.opacity = p > 0.015 ? "1" : "0";

    // Accent comet: a short fixed-length dash whose leading edge sits at L.
    const acc = accentRef.current;
    if (acc) {
      const seg = 46;
      acc.style.strokeDasharray = `${seg} ${total}`;
      acc.style.strokeDashoffset = `${seg - L}`;
      acc.style.opacity = p > 0.015 && p < 0.999 ? "1" : "0";
    }
  }, [overshoot, progress]);

  useMotionValueEvent(progress, "change", render);
  // Paint the resting state (fully drawn) after mount.
  useEffect(() => {
    progress.set(1);
    render();
  }, [progress, render]);

  const start = useCallback(() => {
    if (reduced) return;
    anim.current?.stop();
    progress.set(retract ? 1 : 0);
    anim.current = animate(
      progress,
      retract ? 0 : 1,
      spring
        ? {
            type: "spring",
            stiffness,
            damping,
            mass: 1,
            repeat: loop ? Infinity : 0,
            repeatDelay: loop ? 0.4 : 0,
          }
        : {
            duration,
            ease,
            repeat: loop || pingpong ? Infinity : 0,
            repeatType: pingpong ? "reverse" : "loop",
            repeatDelay: loop && !pingpong ? 0.45 : 0,
          },
    );
  }, [reduced, spring, stiffness, damping, loop, pingpong, retract, duration, ease, progress]);

  const stop = useCallback(() => {
    anim.current?.stop();
    animate(progress, 1, { duration: 0.3, ease: "easeOut" });
  }, [progress]);

  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  return (
    <div
      {...props}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      style={{ display: "inline-flex", overflow: "hidden", ...style }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        stroke="currentColor"
        strokeWidth={TRACE_W}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: "visible" }}
      >
        {accent && (
          <path
            ref={accentRef}
            d={d}
            stroke="var(--icon-accent, #2DD4BF)"
            strokeWidth={TRACE_W + 5}
            style={{ opacity: 0 }}
          />
        )}
        <path ref={pathRef} d={d} />
        <g ref={headRef}>
          <path d={HEAD} />
        </g>
      </svg>
    </div>
  );
});

/* Thin wrappers so each tile is its own stable component (and keeps a ref). */
type TileProps = IconProps;
function makeTracer(opts: TracerOpts) {
  return forwardRef<IconHandle, TileProps>(function TracerVariant(props, ref) {
    return <Tracer ref={ref} {...opts} {...props} />;
  });
}

// 1 — TURN (turn-right.mp4): the line draws around the bend while the arrowhead
//     rides the growing tip, rotating to follow the curve, and settles at the head.
const TurnIcon = makeTracer({ d: SPINE, duration: 1.15, ease: "easeInOut" });
// 6 — SPRING (recording): the tip shoots to the end on an underdamped spring,
//     overshoots past the head, and springs back to rest.
const SpringIcon = makeTracer({ d: SPINE, spring: true, overshoot: true, stiffness: 300, damping: 11 });
// 7 — TRAIL: same trace with an accent comet streaking behind the moving head.
const TrailIcon = makeTracer({ d: SPINE, duration: 1.2, ease: "easeInOut", accent: true });
// 8 — LOOP: continuous redraw, the head endlessly running the turn.
const LoopIcon = makeTracer({ d: SPINE, duration: 1.4, ease: "easeInOut", loop: true });
// 9 — PINGPONG: draws out to the tip, then retracts back to the tail, forever.
const PingpongIcon = makeTracer({ d: SPINE, duration: 1.1, ease: "easeInOut", pingpong: true });
// 10 — RETRACE: starts whole, the head leads the line back to the tail, then
//     redraws — forever. Rests as the proper icon.
const RetraceIcon = makeTracer({ d: SPINE, duration: 1.25, ease: "easeInOut", pingpong: true, retract: true });
// 11 — SNAP: a fast, bouncy single trace with a hard overshoot at arrival.
const SnapIcon = makeTracer({ d: SPINE, spring: true, overshoot: true, stiffness: 110, damping: 15 });

/* ════════════════════════════════════════════════════════════════════════════
   Transform-driven variants (filled glyph) — kept for contrast.
   ════════════════════════════════════════════════════════════════════════════ */

/* ── DRAW — clip-mask reveal of the filled glyph, tail-first, heads last. ───── */
const draw: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: { pathLength: [0, 1], opacity: 1, transition: { duration: 0.9, ease: "easeInOut" } },
};
const DrawIcon = forwardRef<IconHandle, IconProps>(function DrawIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  const clipId = `abdul-draw-${useId()}`;
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <defs>
          <clipPath id={clipId}>
            <path d={MAIN} />
            <path d={OUTER_HEAD} />
          </clipPath>
        </defs>
        <motion.path
          d={SPINE}
          fill="none"
          stroke="currentColor"
          strokeWidth={SPINE_W}
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath={`url(#${clipId})`}
          variants={reduced ? undefined : draw}
        />
      </Svg>
    </div>
  );
});

/* ── PIVOT — swings about the bend & springs back. ─────────────────────────── */
const pivot: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: { rotate: [0, -16, 0], transition: { duration: 0.72, ease: OVERSHOOT } },
};
const PivotIcon = forwardRef<IconHandle, IconProps>(function PivotIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g
          variants={reduced ? undefined : pivot}
          style={{ transformBox: "view-box", originX: BEND_PIVOT.x, originY: BEND_PIVOT.y }}
        >
          <path d={MAIN} />
          <path d={OUTER_HEAD} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── NUDGE — travels up-left and glides home. ──────────────────────────────── */
const nudge: Variants = {
  normal: { x: 0, y: 0, transition: RETURN_TRANSITION },
  animate: { x: [0, -26, 0], y: [0, -7, 0], transition: { duration: 0.7, ease: ARRIVE } },
};
const NudgeIcon = forwardRef<IconHandle, IconProps>(function NudgeIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g variants={reduced ? undefined : nudge}>
          <path d={MAIN} />
          <path d={OUTER_HEAD} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── POP — squash-and-pop tap response. ────────────────────────────────────── */
const pop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.88, 1.08, 1],
    transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] },
  },
};
const PopIcon = forwardRef<IconHandle, IconProps>(function PopIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
  return (
    <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
      <Svg size={size} controls={controls}>
        <motion.g
          variants={reduced ? undefined : pop}
          style={{ transformBox: "view-box", originX: BEND_PIVOT.x, originY: BEND_PIVOT.y }}
        >
          <path d={MAIN} />
          <path d={OUTER_HEAD} />
        </motion.g>
      </Svg>
    </div>
  );
});

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof TurnIcon }[] = [
  { name: "Turn", blurb: "From the video — line draws around the bend, head tracks the tip & rotates", Component: TurnIcon },
  { name: "Spring", blurb: "From the recording — tip shoots out on a spring, overshoots & settles", Component: SpringIcon },
  { name: "Trail", blurb: "Accent comet streaks behind the tracking head", Component: TrailIcon },
  { name: "Loop", blurb: "Head endlessly runs the turn (loops)", Component: LoopIcon },
  { name: "Pingpong", blurb: "Draws out to the tip, then retracts — forever", Component: PingpongIcon },
  { name: "Retrace", blurb: "Head leads the line back out of the corner (loops)", Component: RetraceIcon },
  { name: "Snap", blurb: "Fast bouncy trace with a hard overshoot on arrival", Component: SnapIcon },
  { name: "Draw", blurb: "Filled clip-reveal, tail-first, heads last", Component: DrawIcon },
  { name: "Pivot", blurb: "Filled glyph swings about the bend & springs back", Component: PivotIcon },
  { name: "Nudge", blurb: "Filled glyph travels up-left and glides home", Component: NudgeIcon },
  { name: "Pop", blurb: "Filled glyph squash-and-pop tap response", Component: PopIcon },
];

export default function ArrowBendDoubleUpLeftLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1700);
    };
    cycle();
    const id = window.setInterval(cycle, 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 24px",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
        Arrow Bend Double Up-Left — animation candidates
      </h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 640 }}>
        The first seven trace the line and ride a rotating arrowhead on the growing tip
        (getTotalLength / getPointAtLength / tangent). The last four move the filled glyph. Hover,
        focus, or watch them auto-cycle.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 940,
        }}
      >
        {VARIANTS.map(({ name, blurb, Component }, i) => (
          <div
            key={name}
            tabIndex={0}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              padding: "32px 16px 22px",
              borderRadius: 16,
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              outline: "none",
            }}
          >
            <Component
              ref={(el) => {
                refs.current[i] = el;
              }}
              size={56}
              style={{ color: "var(--text-strong)" }}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{blurb}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
