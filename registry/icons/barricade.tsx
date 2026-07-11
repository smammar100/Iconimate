"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// GUST — a truck blows past: the striped panel rocks on its legs in a
// decaying wobble while the hazard stripes stream across it, the wake and
// the traffic flow in one read. The legs hold their footing.
//
// The Phosphor "barricade" glyph is rebuilt so the stripes are real strokes:
//   FRAME   — the panel outline as an even-odd ring (16 thick).
//   STRIPES — the glyph's black diagonals as 16-wide 45° strokes along
//             x − y = c for c ∈ {−60, 12, 84} (period 72), clipped to the
//             panel interior; translating one period loops seamlessly.
//   LEGS    — two 16-wide round-capped strokes (x64/x192, y168–208).
// Rest state reproduces the original glyph 1:1.
const FRAME =
  "M224,64H32A16,16,0,0,0,16,80v72a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V80A16,16,0,0,0,224,64ZM224,152H32V80H224Z";
const STRIPE_CS = [-204, -132, -60, 12, 84]; // two extra periods left for the march
const stripe = (c: number) => `M${c + 40},40L${c + 216},216`;
const LEG_L = "M64,168v32";
const LEG_R = "M192,168v32";
const MARCH_PERIOD = 72;
// Full original glyph, for the reduced-motion static render.
const BARRICADE =
  "M224,64H32A16,16,0,0,0,16,80v72a16,16,0,0,0,16,16H56v32a8,8,0,0,0,16,0V168H184v32a8,8,0,0,0,16,0V168h24a16,16,0,0,0,16-16V80A16,16,0,0,0,224,64Zm0,64.69L175.31,80H224ZM80.69,80l72,72H103.31L32,80.69V80ZM32,103.31,80.69,152H32ZM224,152H175.31l-72-72h49.38L224,151.32V152Z";

// The panel rocks about the point where the legs meet the road.
const GROUND = { transformBox: "view-box" as const, originX: 0.5, originY: 208 / 256 };

const gust: Variants = {
  normal: { rotate: 0, transition: RETURN_TRANSITION },
  animate: {
    rotate: [0, -4, 3.2, -2, 1, 0],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.2, 0.42, 0.64, 0.84, 1] },
  },
};
const march: Variants = {
  normal: { x: 0, transition: { duration: 0.25 } },
  animate: {
    x: [0, MARCH_PERIOD],
    transition: { duration: 1.1, ease: "linear" },
  },
};

export const BarricadeIcon = forwardRef<IconHandle, IconProps>(function BarricadeIcon(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  const clipId = useId();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

  if (reduced) {
    return (
      <div {...props} {...bind} style={{ display: "inline-flex", overflow: "hidden", ...style }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
          <path d={BARRICADE} />
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
        <motion.g variants={gust} style={GROUND}>
          <path d={FRAME} fillRule="evenodd" />
          <clipPath id={clipId}>
            <rect x={32} y={80} width={192} height={72} />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <motion.g variants={march}>
              {STRIPE_CS.map((c) => (
                <path key={c} d={stripe(c)} fill="none" stroke="currentColor" strokeWidth={16} />
              ))}
            </motion.g>
          </g>
        </motion.g>
        <path d={LEG_L} fill="none" stroke="currentColor" strokeWidth={16} strokeLinecap="round" />
        <path d={LEG_R} fill="none" stroke="currentColor" strokeWidth={16} strokeLinecap="round" />
      </motion.svg>
    </div>
  );
});
