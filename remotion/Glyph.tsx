import { useId, type CSSProperties } from "react";
import { GLYPHS, type GlyphPart } from "./glyphs";
import { TEXT } from "./tokens";

/**
 * A resting Phosphor glyph, drawn from the extracted registry geometry.
 *
 * Two things the extraction records that a plain `<path>` would lose:
 *   · `s` parts are STROKES (fill="none" in the source): battery bars, barcode
 *     bars, the baby's head ring. Filling one collapses it into a blob.
 *   · `k` parts are KNOCKOUTS — the align icons punch a hole through a block by
 *     painting an inner path with the card surface colour. Reproduced as an SVG
 *     mask so the hole is genuinely transparent over any background.
 */
export function Glyph({
  name,
  size,
  color = TEXT,
  style,
}: {
  name: string;
  size: number;
  color?: string;
  style?: CSSProperties;
}) {
  const parts: GlyphPart[] = GLYPHS[name] ?? [];
  const uid = useId();
  const hasKnock = parts.some((p) => p.k);
  const solid = parts.filter((p) => !p.s);
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill={color} style={style}>
      {hasKnock && (
        <mask id={uid} maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">
          {solid.map((p, i) => (
            <path key={i} d={p.d} fill={p.k ? "#000" : "#fff"} fillRule={p.fr ?? "nonzero"} />
          ))}
        </mask>
      )}
      {hasKnock && <rect x="0" y="0" width="256" height="256" fill={color} mask={`url(#${uid})`} />}
      {parts.map((p, i) =>
        p.s ? (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={color}
            strokeWidth={p.w ?? 16}
            strokeLinecap={p.c ?? "butt"}
            strokeLinejoin={p.c === "round" ? "round" : "miter"}
          />
        ) : hasKnock ? null : (
          <path key={i} d={p.d} fillRule={p.fr ?? "nonzero"} />
        ),
      )}
    </svg>
  );
}
