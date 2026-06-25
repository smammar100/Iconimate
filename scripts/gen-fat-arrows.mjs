import { writeFileSync } from "node:fs";

// Bounding boxes (user units) measured via getBBox in the live page; every glyph
// spans 208 units along its pointing axis, so the in-bounds ceiling is 1.077 for
// all of them. We use peak 1.07 (tip lands at the artboard edge) + coil 0.86,
// matching the shipped arrow-fat-down.
const DATA = {
  "arrow-fat-left":        { axis: "x", dir: "left",  anchor: 224, path: "M208,72H128V32a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,0,11.32l96,96A8,8,0,0,0,128,224V184h80a16,16,0,0,0,16-16V88A16,16,0,0,0,208,72Zm0,96H120a8,8,0,0,0-8,8v28.69L35.31,128,112,51.31V80a8,8,0,0,0,8,8h88Z" },
  "arrow-fat-line-down":   { axis: "y", dir: "down",  anchor: 32,  path: "M231.39,132.94A8,8,0,0,0,224,128H184V72a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v56H32a8,8,0,0,0-5.66,13.66l96,96a8,8,0,0,0,11.32,0l96-96A8,8,0,0,0,231.39,132.94ZM128,220.69,51.31,144H80a8,8,0,0,0,8-8V80h80v56a8,8,0,0,0,8,8h28.69ZM72,40a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,40Z" },
  "arrow-fat-line-left":   { axis: "x", dir: "left",  anchor: 224, path: "M184,72H128V32a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,0,11.32l96,96A8,8,0,0,0,128,224V184h56a8,8,0,0,0,8-8V80A8,8,0,0,0,184,72Zm-8,96H120a8,8,0,0,0-8,8v28.69L35.31,128,112,51.31V80a8,8,0,0,0,8,8h56Zm48-88v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Z" },
  "arrow-fat-line-right":  { axis: "x", dir: "right", anchor: 32,  path: "M237.66,122.34l-96-96A8,8,0,0,0,128,32V72H72a8,8,0,0,0-8,8v96a8,8,0,0,0,8,8h56v40a8,8,0,0,0,13.66,5.66l96-96A8,8,0,0,0,237.66,122.34ZM144,204.69V176a8,8,0,0,0-8-8H80V88h56a8,8,0,0,0,8-8V51.31L220.69,128ZM48,80v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Z" },
  "arrow-fat-line-up":     { axis: "y", dir: "up",    anchor: 224, path: "M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v56a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v56H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Zm8,104a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,216Z" },
  "arrow-fat-lines-down":  { axis: "y", dir: "down",  anchor: 32,  path: "M231.39,132.94A8,8,0,0,0,224,128H184V104a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v24H32a8,8,0,0,0-5.66,13.66l96,96a8,8,0,0,0,11.32,0l96-96A8,8,0,0,0,231.39,132.94ZM128,220.69,51.31,144H80a8,8,0,0,0,8-8V112h80v24a8,8,0,0,0,8,8h28.69ZM72,40a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,40Zm0,32a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,72Z" },
  "arrow-fat-lines-left":  { axis: "x", dir: "left",  anchor: 224, path: "M152,72H128V32a8,8,0,0,0-13.66-5.66l-96,96a8,8,0,0,0,0,11.32l96,96A8,8,0,0,0,128,224V184h24a8,8,0,0,0,8-8V80A8,8,0,0,0,152,72Zm-8,96H120a8,8,0,0,0-8,8v28.69L35.31,128,112,51.31V80a8,8,0,0,0,8,8h24Zm80-88v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Zm-32,0v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Z" },
  "arrow-fat-lines-right": { axis: "x", dir: "right", anchor: 32,  path: "M237.66,122.34l-96-96A8,8,0,0,0,128,32V72H104a8,8,0,0,0-8,8v96a8,8,0,0,0,8,8h24v40a8,8,0,0,0,13.66,5.66l96-96A8,8,0,0,0,237.66,122.34ZM144,204.69V176a8,8,0,0,0-8-8H112V88h24a8,8,0,0,0,8-8V51.31L220.69,128ZM48,80v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Zm32,0v96a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Z" },
  "arrow-fat-lines-up":    { axis: "y", dir: "up",    anchor: 224, path: "M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v24a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v24H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Zm8,104a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,216Zm0-32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,184Z" },
  "arrow-fat-right":       { axis: "x", dir: "right", anchor: 32,  path: "M237.66,122.34l-96-96A8,8,0,0,0,128,32V72H48A16,16,0,0,0,32,88v80a16,16,0,0,0,16,16h80v40a8,8,0,0,0,13.66,5.66l96-96A8,8,0,0,0,237.66,122.34ZM144,204.69V176a8,8,0,0,0-8-8H48V88h88a8,8,0,0,0,8-8V51.31L220.69,128Z" },
  "arrow-fat-up":          { axis: "y", dir: "up",    anchor: 224, path: "M229.66,114.34l-96-96a8,8,0,0,0-11.32,0l-96,96A8,8,0,0,0,32,128H72v80a16,16,0,0,0,16,16h80a16,16,0,0,0,16-16V128h40a8,8,0,0,0,5.66-13.66ZM176,112a8,8,0,0,0-8,8v88H88V120a8,8,0,0,0-8-8H51.31L128,35.31,204.69,112Z" },
};

const pascal = (slug) => slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("") + "Icon";
// Which artboard edge the tip approaches, and which glyph edge stays pinned.
const EDGE = {
  down:  { anchorEdge: "top edge",    leads: "downward", crosses: "y=256" },
  up:    { anchorEdge: "bottom edge", leads: "upward",   crosses: "y=0" },
  left:  { anchorEdge: "right edge",  leads: "leftward", crosses: "x=0" },
  right: { anchorEdge: "left edge",   leads: "rightward",crosses: "x=256" },
};

for (const [slug, { axis, dir, anchor, path }] of Object.entries(DATA)) {
  const Comp = pascal(slug);
  const scaleProp = axis === "y" ? "scaleY" : "scaleX";
  const origin = axis === "y"
    ? `originX: 0.5, originY: ${anchor} / 256`
    : `originX: ${anchor} / 256, originY: 0.5`;
  const e = EDGE[dir];
  const file = `"use client";

import { forwardRef, useImperativeHandle } from "react";
import { motion, type Variants } from "motion/react";
import { useHover } from "@/hooks/use-hover";
import { RETURN_TRANSITION } from "@/lib/motion-tokens";
import type { IconHandle, IconProps } from "@/lib/icon";

// PLUNGE — anchored at the ${e.anchorEdge}, the fat arrow coils then elongates ${e.leads},
// the tip leading the plunge while the tail stays pinned, and snaps back with an
// elastic recoil. Every arrow-fat glyph spans 208 units along its axis, so the
// stretch tops out at ${scaleProp} ≈ 1.077 before the tip crosses ${e.crosses}; the peak
// lands the tip right at that edge. The exact Phosphor ${slug}, animated whole so
// the artwork stays pixel-identical.
const ARROW =
  "${path}";
// Anchor the glyph's ${e.anchorEdge} so it stays put while the body elongates ${e.leads}.
const ANCHOR = { transformBox: "view-box" as const, ${origin} };

const plunge: Variants = {
  normal: { ${scaleProp}: 1, transition: RETURN_TRANSITION },
  animate: {
    // rest → coil (anticipation) → plunge ${dir} (peak 1.07, tip at the edge) → recoil → settle
    ${scaleProp}: [1, 0.86, 1.07, 0.97, 1.02, 1],
    transition: { duration: 0.9, ease: "easeInOut", times: [0, 0.18, 0.48, 0.68, 0.84, 1] },
  },
};

export const ${Comp} = forwardRef<IconHandle, IconProps>(function ${Comp}(
  { size = 28, style, ...props },
  ref,
) {
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
        <motion.path d={ARROW} variants={reduced ? undefined : plunge} style={ANCHOR} />
      </motion.svg>
    </div>
  );
});
`;
  writeFileSync(new URL(`../registry/icons/${slug}.tsx`, import.meta.url), file);
  console.log("wrote", slug, `(${scaleProp}, anchor ${anchor})`);
}
