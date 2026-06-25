import { writeFileSync } from "node:fs";

// Shared rounded-square frame (outer + inner counter; rendered with fillRule evenodd).
const SQUARE =
  "M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208Z";

// Per-icon: the inner arrow sub-path, the travel direction (dx, dy) the arrow points,
// and the scroll amplitude (46 for the straight axes, 32 per axis for diagonals so the
// diagonal travel reads the same length). The arrow rides a wheel inside the static box:
// fades in small behind, full at centre, shrinks + fades out ahead — looping in the
// pointing direction. Clipped to the box interior so it only shows inside the frame.
const DATA = {
  "arrow-square-down-left":  { dx: -1, dy:  1, amp: 32, arrow: "M88,160V112a8,8,0,0,1,16,0v28.69l50.34-50.35a8,8,0,0,1,11.32,11.32L115.31,152H144a8,8,0,0,1,0,16H96A8,8,0,0,1,88,160Z" },
  "arrow-square-down-right": { dx:  1, dy:  1, amp: 32, arrow: "M90.34,101.66a8,8,0,0,1,11.32-11.32L152,140.69V112a8,8,0,0,1,16,0v48a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h28.69Z" },
  "arrow-square-left":       { dx: -1, dy:  0, amp: 46, arrow: "M82.34,133.66a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,11.32L107.31,120H168a8,8,0,0,1,0,16H107.31l18.35,18.34a8,8,0,0,1-11.32,11.32Z" },
  "arrow-square-right":      { dx:  1, dy:  0, amp: 46, arrow: "M80,128a8,8,0,0,1,8-8h60.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32-11.32L148.69,136H88A8,8,0,0,1,80,128Z" },
  "arrow-square-up":         { dx:  0, dy: -1, amp: 46, arrow: "M90.34,125.66a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L136,107.31V168a8,8,0,0,1-16,0V107.31l-18.34,18.35A8,8,0,0,1,90.34,125.66Z" },
  "arrow-square-up-left":    { dx: -1, dy: -1, amp: 32, arrow: "M88,144V96a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H115.31l50.35,50.34a8,8,0,0,1-11.32,11.32L104,115.31V144a8,8,0,0,1-16,0Z" },
  "arrow-square-up-right":   { dx:  1, dy: -1, amp: 32, arrow: "M90.34,165.66a8,8,0,0,1,0-11.32L140.69,104H112a8,8,0,0,1,0-16h48a8,8,0,0,1,8,8v48a8,8,0,0,1-16,0V115.31l-50.34,50.35a8,8,0,0,1-11.32,0Z" },
};

const pascal = (slug) => slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("") + "Icon";
const dirLabel = (slug) => slug.replace("arrow-square-", "");

for (const [slug, { dx, dy, amp, arrow }] of Object.entries(DATA)) {
  const Comp = pascal(slug);
  const xs = dx !== 0 ? `[${-dx * amp}, 0, ${dx * amp}]` : null;
  const ys = dy !== 0 ? `[${-dy * amp}, 0, ${dy * amp}]` : null;
  const normalAxes = [xs ? "x: 0" : null, ys ? "y: 0" : null].filter(Boolean).join(", ");
  const animAxes = [xs ? `    x: ${xs},` : null, ys ? `    y: ${ys},` : null].filter(Boolean).join("\n");
  const file = `"use client";

import { forwardRef, useId, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// SCROLL — the ${dirLabel(slug)} arrow rides a wheel inside the static box: it fades in
// small behind, reaches full size at the centre, then shrinks and fades out ahead,
// looping in the pointing direction (${dirLabel(slug)}) — a continuous cycle. The arrow is
// clipped to the box interior so it only ever shows inside the frame. Two exact
// Phosphor sub-paths (the rounded square + the inner arrow), animated whole so the
// artwork is pixel-identical.
const SQUARE =
  "${SQUARE}";
const ARROW =
  "${arrow}";

const scroll: Variants = {
  normal: { ${normalAxes}, scale: 1, opacity: 1, transition: RETURN_TRANSITION },
  animate: {
${animAxes}
    scale: [0.4, 1, 0.4],
    opacity: [0, 1, 0],
    transition: { duration: 1.15, ease: "easeInOut", times: [0, 0.5, 1], repeat: Infinity, repeatDelay: 0.05 },
  },
};

export const ${Comp} = forwardRef<IconHandle, IconProps>(function ${Comp}(
  { size = 28, style, ...props },
  ref,
) {
  const { controls, reduced, start, stop, bind } = useHover();
  const clipId = useId();
  useImperativeHandle(ref, () => ({ startAnimation: start, stopAnimation: stop }), [start, stop]);

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
        <clipPath id={clipId}>
          <rect x={48} y={48} width={160} height={160} rx={6} />
        </clipPath>
        <path d={SQUARE} fillRule="evenodd" />
        <g clipPath={\`url(#\${clipId})\`}>
          <motion.path
            d={ARROW}
            variants={reduced ? undefined : scroll}
            style={{ transformBox: "view-box", originX: 0.5, originY: 0.5 }}
          />
        </g>
      </motion.svg>
    </div>
  );
});
`;
  writeFileSync(new URL(`../registry/icons/${slug}.tsx`, import.meta.url), file);
  console.log("wrote", slug, `(x=${xs}, y=${ys})`);
}
