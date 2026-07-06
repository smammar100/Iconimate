"use client";

import { useMemo, useRef } from "react";
import { icons, visibleIcons, type IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";

/**
 * The tile hero — a centered headline flanked by two 6×6 scatter grids of icon
 * tiles, adapted from the Fintech Web Template. Where that template drops in bank
 * logos, this drops in registry icons: each filled tile plays its own motion on
 * hover / focus (via the imperative IconHandle). The surrounding empty tiles —
 * "soft" (faint surface) and "blank" (invisible) — recreate the template's
 * scattered rhythm. The left grid is the 180° rotation of the right, mirroring
 * the template's symmetry (icons stay upright, unlike a literal rotate).
 */

// 6×6 fill maps. '.' = blank (invisible), 's' = soft empty tile, 'X' = icon tile.
const RIGHT_PATTERN = [
  ".X...X",
  "XssXX.",
  "..XX.X",
  "sXs.Xs",
  ".X.Xs.",
  "...s..",
];
const LEFT_PATTERN = [
  "..s...",
  ".sX.X.",
  "sX.sXs",
  "X.XX..",
  ".XXssX",
  "X...X.",
];

// Curated tile icons (resolved against the registry; any missing slug is skipped
// and back-filled from the visible set, so a filled tile is never empty).
const CURATED = [
  "bell", "heart", "star", "sun", "cloud", "camera", "bolt", "moon", "alarm", "anchor", "airplane", "mail",
  "acorn", "bookmark", "trash", "alien", "ambulance", "address-book", "aperture", "archive", "armchair", "atom", "avocado", "axe",
];

function useTileIcons(count: number): IconEntry[] {
  return useMemo(() => {
    const seen = new Set<string>();
    const out: IconEntry[] = [];
    for (const slug of CURATED) {
      const e = icons.find((i) => i.slug === slug);
      if (e && !seen.has(e.slug)) {
        seen.add(e.slug);
        out.push(e);
      }
    }
    for (const e of visibleIcons) {
      if (out.length >= count) break;
      if (!seen.has(e.slug)) {
        seen.add(e.slug);
        out.push(e);
      }
    }
    return out.slice(0, count);
  }, [count]);
}

/** A filled tile: registry icon that plays its motion on hover / focus. */
function IconTile({ entry }: { entry: IconEntry }) {
  const ref = useRef<IconHandle>(null);
  const { Component, name } = entry;
  const play = () => ref.current?.startAnimation();
  const rest = () => ref.current?.stopAnimation();
  return (
    <div
      className="fh-tile fh-tile--icon"
      title={name}
      onMouseEnter={play}
      onMouseLeave={rest}
      onFocus={play}
      onBlur={rest}
    >
      <Component ref={ref} size={44} style={{ pointerEvents: "none" }} />
    </div>
  );
}

/** One 6×6 scatter grid rendered from a fill pattern. Decorative (aria-hidden). */
function TileGrid({ pattern, entries, side }: { pattern: string[]; entries: IconEntry[]; side: "left" | "right" }) {
  let iconIdx = 0;
  const cells: React.ReactNode[] = [];
  pattern.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      const key = `${side}-${r}-${c}`;
      if (ch === "X") {
        cells.push(<IconTile key={key} entry={entries[iconIdx % entries.length]} />);
        iconIdx += 1;
      } else if (ch === "s") {
        cells.push(<div key={key} className="fh-tile fh-tile--soft" />);
      } else {
        cells.push(<div key={key} className="fh-tile fh-tile--blank" />);
      }
    });
  });
  return (
    <div className={`fh-grid fh-grid--${side}`} aria-hidden="true">
      {cells}
    </div>
  );
}

export function HeroTiles({ onBrowse, onOpenSearch }: { onBrowse: () => void; onOpenSearch: () => void }) {
  const all = useTileIcons(24);
  const rightIcons = all.slice(0, 12);
  const leftIcons = all.slice(12, 24);

  return (
    <section className="fh">
      <div className="fh-inner">
        <TileGrid pattern={LEFT_PATTERN} entries={leftIcons} side="left" />

        <div className="fh-center">
          <h1 className="fh-title">Animated icons that earn their motion</h1>
          <p className="fh-sub">
            Open-source React icons, hand-drawn on the Phosphor 256 grid and tuned to read at 24px.
            Hover any tile to watch it move — then copy one or install the whole set.
          </p>
          <div className="fh-cta-row">
            <button type="button" className="dc-btn fh-cta" onClick={onBrowse}>
              Browse icons
            </button>
            <button type="button" className="fh-kbd-hint" onClick={onOpenSearch}>
              Press <span className="dc-kbd">⌘K</span> to search
            </button>
          </div>
        </div>

        <TileGrid pattern={RIGHT_PATTERN} entries={rightIcons} side="right" />
      </div>
    </section>
  );
}
