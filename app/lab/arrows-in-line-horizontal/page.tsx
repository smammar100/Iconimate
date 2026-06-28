"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Arrows In Line Horizontal (collapse to a center line), 5 candidates.
 *
 * A vertical centre line with two arrows pointing inward at it. The centre line is drawn
 * as a stroked quadratic curve so it can bow/wobble like the arrow-line "whip" family.
 * One candidate is the requested whip: the arrows fly in from both edges, strike the
 * line, and it jiggles. Each is grounded in a Disney principle.
 */
const LEFT =
  "M69.66,90.34a8,8,0,0,0-11.32,11.32L76.69,120H16a8,8,0,0,0,0,16H76.69L58.34,154.34a8,8,0,0,0,11.32,11.32l32-32a8,8,0,0,0,0-11.32Z";
const RIGHT =
  "M240,120H179.31l18.35-18.34a8,8,0,0,0-11.32-11.32l-32,32a8,8,0,0,0,0,11.32l32,32a8,8,0,0,0,11.32-11.32L179.31,136H240a8,8,0,0,0,0-16Z";
// Centre line as a quadratic curve (control x bends it left/right). Flat = straight bar.
const flat = "M128,40Q128,128,128,216";
const bow = (cx: number) => `M128,40Q${cx},128,128,216`;
const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
const OFF = 140; // off-frame travel for the arrows

function makeIcon(leftV: Variants, rightV: Variants, lineV: Variants) {
  return forwardRef<IconHandle, IconProps>(function ArrowsInLineIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
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
          <motion.path d={LEFT} variants={reduced ? undefined : leftV} style={CENTER} />
          <motion.path d={RIGHT} variants={reduced ? undefined : rightV} style={CENTER} />
          <motion.path
            d={flat}
            variants={reduced ? undefined : lineV}
            fill="none"
            stroke="currentColor"
            strokeWidth={16}
            strokeLinecap="round"
            style={CENTER}
          />
        </motion.svg>
      </div>
    );
  });
}

/* ── 1. WHIP  (requested) — the arrows fly out to both edges, off-frame, then rush back
   in and strike the line; the line jiggles a beat after impact and settles. Squash &
   stretch + Overlapping action + Follow-through. ─────────────────────────────────── */
const WHIP_AT = { duration: 1.1, times: [0, 0.28, 0.44, 0.64, 1], ease: ["easeIn", "linear", "easeOut", "easeOut"] } as const;
const leftWhip: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: [0, -OFF, -OFF, 12, 0], transition: WHIP_AT },
};
const rightWhip: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: [0, OFF, OFF, -12, 0], transition: WHIP_AT },
};
const lineWhip: Variants = {
  normal: { d: flat, transition: RETURN_TRANSITION },
  animate: {
    d: [flat, flat, bow(146), bow(114), bow(136), flat],
    transition: { duration: 1.1, ease: "easeInOut", times: [0, 0.62, 0.72, 0.83, 0.92, 1] },
  },
};
const WhipIcon = makeIcon(leftWhip, rightWhip, lineWhip);

/* ── 2. CONVERGE — the arrows glide in from both edges to the line and stop; the line
   gives a single gentle bow. Slow in & out. ──────────────────────────────────────── */
const CONV_AT = { duration: 0.95, times: [0, 0.3, 0.46, 1], ease: ["easeIn", "linear", ARRIVE] } as const;
const leftConv: Variants = { normal: { x: 0, transition: RETURN_TRANSITION }, animate: { x: [0, -OFF, -OFF, 0], transition: CONV_AT } };
const rightConv: Variants = { normal: { x: 0, transition: RETURN_TRANSITION }, animate: { x: [0, OFF, OFF, 0], transition: CONV_AT } };
const lineConv: Variants = {
  normal: { d: flat, transition: RETURN_TRANSITION },
  animate: { d: [flat, flat, bow(138), flat], transition: { duration: 0.95, ease: "easeInOut", times: [0, 0.6, 0.76, 1] } },
};
const ConvergeIcon = makeIcon(leftConv, rightConv, lineConv);

/* ── 3. STAGGER — the left arrow strikes first, the right a beat later; the line bumps
   on each hit. Staging / Overlapping action. ─────────────────────────────────────── */
const leftStag: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: [0, -OFF, -OFF, 10, 0], transition: { duration: 1.1, times: [0, 0.26, 0.4, 0.6, 1], ease: ["easeIn", "linear", "easeOut", "easeOut"] } },
};
const rightStag: Variants = {
  normal: { x: 0, transition: RETURN_TRANSITION },
  animate: { x: [0, OFF, OFF, -10, 0], transition: { duration: 1.1, times: [0, 0.26, 0.4, 0.6, 1], ease: ["easeIn", "linear", "easeOut", "easeOut"], delay: 0.18 } },
};
const lineStag: Variants = {
  normal: { d: flat, transition: RETURN_TRANSITION },
  animate: {
    d: [flat, flat, bow(142), flat, bow(118), flat],
    transition: { duration: 1.3, ease: "easeInOut", times: [0, 0.45, 0.56, 0.68, 0.82, 1] },
  },
};
const StaggerIcon = makeIcon(leftStag, rightStag, lineStag);

/* ── 4. RECOIL — the arrows pull back outward (anticipation), then snap in at the line;
   the line jiggles. Anticipation + Follow-through. ───────────────────────────────── */
const REC_AT = { duration: 0.85, times: [0, 0.32, 0.62, 1], ease: ["easeOut", "easeIn", "easeOut"] } as const;
const leftRec: Variants = { normal: { x: 0, transition: RETURN_TRANSITION }, animate: { x: [0, -24, 14, 0], transition: REC_AT } };
const rightRec: Variants = { normal: { x: 0, transition: RETURN_TRANSITION }, animate: { x: [0, 24, -14, 0], transition: REC_AT } };
const lineRec: Variants = {
  normal: { d: flat, transition: RETURN_TRANSITION },
  animate: { d: [flat, flat, bow(142), bow(118), flat], transition: { duration: 0.85, ease: "easeInOut", times: [0, 0.5, 0.64, 0.8, 1] } },
};
const RecoilIcon = makeIcon(leftRec, rightRec, lineRec);

/* ── 5. PULSE — the whole glyph gives a uniform squash-and-pop about the centre — a tap.
   Appeal. ────────────────────────────────────────────────────────────────────────── */
const PULSE: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: { scale: [1, 0.9, 1.06, 1], transition: { duration: 0.5, ease: "easeOut", times: [0, 0.3, 0.65, 1] } },
};
const PulseIcon = makeIcon(PULSE, PULSE, PULSE);

/* ── Preview grid ──────────────────────────────────────────────────────────────── */
const VARIANTS: { name: string; principle: string; blurb: string; Component: typeof WhipIcon }[] = [
  {
    name: "Whip",
    principle: "Squash & stretch",
    blurb: "Requested — arrows fly in from both edges, strike the line, and it jiggles",
    Component: WhipIcon,
  },
  { name: "Converge", principle: "Slow in & out", blurb: "Arrows glide in to the line; it gives one gentle bow", Component: ConvergeIcon },
  {
    name: "Stagger",
    principle: "Staging",
    blurb: "Left strikes first, right a beat later; the line bumps on each",
    Component: StaggerIcon,
  },
  {
    name: "Recoil",
    principle: "Anticipation",
    blurb: "Arrows pull back, then snap in at the line — it jiggles",
    Component: RecoilIcon,
  },
  { name: "Pulse", principle: "Appeal", blurb: "Uniform squash-and-pop about the centre — a tap", Component: PulseIcon },
];

export default function ArrowsInLineHorizontalLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 2000);
    };
    cycle();
    const id = window.setInterval(cycle, 3200);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Arrows In Line Horizontal — animation candidates</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40, textAlign: "center", maxWidth: 640 }}>
        Five takes on the collapse-to-a-line glyph, each built on a Disney motion principle. &ldquo;Whip&rdquo; is the
        requested motion — the arrows fly in from both edges, hit the centre line, and it jiggles. Hover, focus, or watch
        them auto-cycle. Pick one to promote.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 800,
        }}
      >
        {VARIANTS.map(({ name, principle, blurb, Component }, i) => (
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
              <div style={{ fontSize: 11, opacity: 0.4, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {principle}
              </div>
              <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{blurb}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
