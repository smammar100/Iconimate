"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { ARRIVE, DUR, RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

/**
 * LAB — Apple logo, 5 animation candidates.
 *
 * The Phosphor "apple-logo" glyph = the BODY (apple silhouette) plus the LEAF/stem
 * at the top. Splitting them lets the leaf sway and the apple grow from its stem.
 */
const BODY =
  "M223.3,169.59a8.07,8.07,0,0,0-2.8-3.4C203.53,154.53,200,134.64,200,120c0-17.67,13.47-33.06,21.5-40.67a8,8,0,0,0,0-11.62C208.82,55.74,187.82,48,168,48a72.2,72.2,0,0,0-40,12.13,71.56,71.56,0,0,0-90.71,9.09A74.63,74.63,0,0,0,16,123.4a127.06,127.06,0,0,0,40.14,89.73A39.8,39.8,0,0,0,83.59,224h87.68a39.84,39.84,0,0,0,29.12-12.57,125,125,0,0,0,17.82-24.6C225.23,174,224.33,172,223.3,169.59Zm-34.63,30.94a23.76,23.76,0,0,1-17.4,7.47H83.59a23.82,23.82,0,0,1-16.44-6.51A111.14,111.14,0,0,1,32,123,58.5,58.5,0,0,1,48.65,80.47,54.81,54.81,0,0,1,88,64h.78A55.45,55.45,0,0,1,123,76.28a8,8,0,0,0,10,0A55.44,55.44,0,0,1,168,64a70.64,70.64,0,0,1,36,10.35c-13,14.52-20,30.47-20,45.65,0,23.77,7.64,42.73,22.18,55.3A105.82,105.82,0,0,1,188.67,200.53Z";
const LEAF =
  "M128.23,30A40,40,0,0,1,167,0h1a8,8,0,0,1,0,16h-1a24,24,0,0,0-23.24,18,8,8,0,1,1-15.5-4Z";

const CENTER = { transformBox: "view-box" as const, originX: 0.5, originY: 0.5 };
/** Apple base — squashes land here. */
const BOTTOM = { transformBox: "view-box" as const, originX: 0.5, originY: 0.875 };
/** Stem at the top — grow sprouts from here. */
const STEM = { transformBox: "view-box" as const, originX: 0.5, originY: 0.1 };
/** Where the leaf meets the apple — it sways about this point. */
const LEAF_ORIGIN = { transformBox: "view-box" as const, originX: 0.51, originY: 0.133 };

/** Back-out overshoot — spring-like snap on tween transitions. */
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

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

/* ── 1. POP — a tactile squash-and-pop tap, landing on the base. ───────────── */
const pop: Variants = {
  normal: { scale: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [1, 0.9, 1.05, 1],
    transition: { duration: DUR.base, ease: OVERSHOOT, times: [0, 0.3, 0.65, 1] },
  },
};

const AppleLogoPopIcon = forwardRef<IconHandle, IconProps>(
  function AppleLogoPopIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : pop} style={BOTTOM}>
            <path d={BODY} />
            <path d={LEAF} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 2. BOUNCE — a light, even vertical bounce (loops). ────────────────────── */
const bounce: Variants = {
  normal: { y: 0, transition: RETURN_TRANSITION },
  animate: {
    y: [0, -18, 0],
    transition: { duration: 0.85, ease: "easeInOut", repeat: Infinity },
  },
};

const AppleLogoBounceIcon = forwardRef<IconHandle, IconProps>(
  function AppleLogoBounceIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : bounce} style={BOTTOM}>
            <path d={BODY} />
            <path d={LEAF} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 3. WOBBLE — the apple rocks on its base and settles. ──────────────────── */
const wobble: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -7, 5, -3, 0],
    transition: { duration: 0.7, ease: "easeInOut" },
  },
};

const AppleLogoWobbleIcon = forwardRef<IconHandle, IconProps>(
  function AppleLogoWobbleIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : wobble} style={BOTTOM}>
            <path d={BODY} />
            <path d={LEAF} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 4. GROW — the apple sprouts up out of its stem. ───────────────────────── */
const grow: Variants = {
  normal: { scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
    scale: [0.2, 1],
    opacity: [0, 1],
    transition: { duration: DUR.slow, ease: ARRIVE },
  },
};

const AppleLogoGrowIcon = forwardRef<IconHandle, IconProps>(
  function AppleLogoGrowIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <motion.g variants={reduced ? undefined : grow} style={STEM}>
            <path d={BODY} />
            <path d={LEAF} />
          </motion.g>
        </Svg>
      </div>
    );
  },
);

/* ── 5. LEAF — the body holds while the leaf sways in a breeze. ────────────── */
const leafSway: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -16, 10, -5, 0],
    transition: { duration: 0.9, ease: "easeInOut" },
  },
};

const AppleLogoLeafIcon = forwardRef<IconHandle, IconProps>(
  function AppleLogoLeafIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          <path d={BODY} />
          <motion.path d={LEAF} variants={reduced ? undefined : leafSway} style={LEAF_ORIGIN} />
        </Svg>
      </div>
    );
  },
);

/* ── 6. BITE — matches the reference video: the whole OUTLINED apple shows, then a
   quick chomp on the left with action lines flicking out, then it settles bitten.
   The notch is masked out of the outline AND re-capped with a stroked "mouth" arc
   so the outline stays closed (the path is never left broken). ──────────────────── */
// Origin for the action lines' flick.
const BITE_ORIGIN = { transformBox: "view-box" as const, originX: 250 / 256, originY: 116 / 256 };
// Three action lines flicking out to the right of the chomp (as in the video).
const SPEED_LINES = ["M226,96L244,85", "M231,116L251,116", "M226,136L242,148"];

const biteSpeed: Variants = {
  normal: { opacity: 0, scale: 0.6, transition: { duration: 0.1 } },
  animate: {
    opacity: [0, 1, 0],
    scale: [0.6, 1, 1.12],
    transition: { delay: 0.18, duration: 0.5, times: [0, 0.35, 1], ease: "easeOut" },
  },
};
const biteLeaf: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -10, 6, 0],
    transition: { delay: 0.16, duration: 0.6, ease: "easeInOut" },
  },
};

const AppleLogoBiteIcon = forwardRef<IconHandle, IconProps>(
  function AppleLogoBiteIcon({ size = 28, style, ...props }, ref) {
    const { controls, reduced, start, stop, bind } = useHover();
    useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <Svg size={size} controls={controls}>
          {/* Whole apple */}
          <path d={BODY} />
          {/* Action lines */}
          <motion.g variants={reduced ? undefined : biteSpeed} style={BITE_ORIGIN}>
            {SPEED_LINES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth={10} strokeLinecap="round" />
            ))}
          </motion.g>
          <motion.path d={LEAF} variants={reduced ? undefined : biteLeaf} style={LEAF_ORIGIN} />
        </Svg>
      </div>
    );
  },
);

/* ── Preview grid ──────────────────────────────────────────────────────────── */

const VARIANTS: { name: string; blurb: string; Component: typeof AppleLogoPopIcon }[] = [
  { name: "Pop", blurb: "Squash-and-pop tap", Component: AppleLogoPopIcon },
  { name: "Bounce", blurb: "Light vertical bounce (loops)", Component: AppleLogoBounceIcon },
  { name: "Wobble", blurb: "Rocks on its base & settles", Component: AppleLogoWobbleIcon },
  { name: "Grow", blurb: "Sprouts up out of its stem", Component: AppleLogoGrowIcon },
  { name: "Leaf", blurb: "The leaf sways in a breeze", Component: AppleLogoLeafIcon },
  { name: "Bite", blurb: "The leaf flicks with action lines", Component: AppleLogoBiteIcon },
];

export default function AppleLogoLabPage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  // Auto-play every variant on a loop so the page is lively without hovering.
  useEffect(() => {
    const cycle = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), 1600);
    };
    cycle();
    const id = window.setInterval(cycle, 2800);
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
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Apple — animation candidates</h1>
      <p style={{ opacity: 0.55, fontSize: 14, marginTop: 8, marginBottom: 40 }}>
        Hover or focus any tile. They also auto-cycle. Pick one to promote into the registry.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          width: "100%",
          maxWidth: 900,
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
