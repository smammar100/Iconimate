"use client";

import { useMemo, useRef, useState } from "react";
import { visibleIcons, type IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";
import { installCommand, metaFor, PACKAGE_MANAGERS, type PackageManager } from "./icon-meta";

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

// Curated tile icons — ONLY slugs from the visible (Phosphor 147) set. Any slug
// that isn't in that set is skipped and back-filled from visibleIcons, so a
// filled tile is never empty and never shows a hidden/non-Phosphor icon.
const CURATED = [
  "alarm", "anchor", "airplane", "alien", "ambulance", "address-book", "aperture", "archive", "armchair", "atom", "avocado", "axe",
  "acorn", "control-tower", "phone-book", "baby-carriage", "apple-logo", "android-logo", "amazon-logo", "asterisk", "at", "asclepius", "presentation", "angle",
];

function useTileIcons(count: number): IconEntry[] {
  return useMemo(() => {
    const seen = new Set<string>();
    const out: IconEntry[] = [];
    for (const slug of CURATED) {
      const e = visibleIcons.find((i) => i.slug === slug);
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

/** A filled tile: registry icon that plays its motion on hover / focus.
 *  Each icon wears its own identity hue (the glow from icon-meta). */
function IconTile({ entry }: { entry: IconEntry }) {
  const ref = useRef<IconHandle>(null);
  const { Component, name, slug } = entry;
  const { glow } = metaFor(slug);
  const play = () => ref.current?.startAnimation();
  const rest = () => ref.current?.stopAnimation();
  return (
    <div
      className="fh-tile fh-tile--icon"
      title={name}
      style={{ color: glow }}
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

export function HeroTiles({
  onCopyInstall,
  onOpenSearch,
}: {
  /** Copy the hero install command for the given package manager. */
  onCopyInstall: (pm: PackageManager) => void;
  onOpenSearch: () => void;
}) {
  const [pm, setPm] = useState<PackageManager>("npm");
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
            Hover any tile to watch it move.
          </p>
          <div className="fh-cta-row">
            <span className="dc-install-block">
              <span className="dc-install__tabs" role="tablist" aria-label="Package manager">
                {PACKAGE_MANAGERS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={pm === p}
                    className={`dc-install__tab dc-mono${pm === p ? " is-active" : ""}`}
                    onClick={() => setPm(p)}
                  >
                    {p}
                  </button>
                ))}
              </span>
              <span className="dc-install dc-mono">
                <span className="dc-install__dollar">$</span>
                <span className="dc-install__cmd">{installCommand("bell", pm)}</span>
                <button
                  type="button"
                  className="dc-install__copy"
                  aria-label="Copy install command"
                  onClick={() => onCopyInstall(pm)}
                >
                  <CopyGlyph />
                </button>
              </span>
            </span>
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

function CopyGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
    </svg>
  );
}
