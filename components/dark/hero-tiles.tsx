"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { BorderBeam } from "border-beam";
import { visibleIcons, type IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";
import { installCommand, metaFor, PACKAGE_MANAGERS, type PackageManager } from "./icon-meta";

/*
 * The tile hero — a centered headline flanked by two 6×6 scatter grids of icon
 * tiles, adapted from the Fintech Web Template. Where that template drops in bank
 * logos, this drops in registry icons: each filled tile plays its own motion on
 * hover / focus (via the imperative IconHandle). The left grid mirrors the right.
 *
 * ─────────────────────────────────────────────────────────
 * HERO STORYBOARD
 *
 *    0ms   center lockup rises: title → subtext → install bar,
 *          staggered 90ms, each 14px up with a soft spring
 *  150ms   tiles pop in: scale 0.4 → 1 spring, rippling outward
 *          from each grid's inner edge (the side facing the text)
 * ~1400ms  entrance settles
 *  then    ambient life: every ~2.6s one random visible tile
 *          plays its own icon animation for ~1.4s
 *          (skipped under prefers-reduced-motion)
 * ─────────────────────────────────────────────────────────
 */
const HERO = {
  centerStagger: 0.09, // s between title / sub / install bar
  centerRise: { type: "spring", visualDuration: 0.55, bounce: 0.18 } as const,
  tileDelay: 0.15, // s before the first tile pops
  tileStagger: 0.05, // s per ripple step
  tilePop: { type: "spring", visualDuration: 0.5, bounce: 0.34 } as const,
  ambientEvery: 2600, // ms between ambient icon plays
  ambientPlay: 1400, // ms an ambient play runs before gliding home
};

// (The center lockup's rise is CSS — .fh-rise in globals.css — so the LCP text
// paints without waiting for hydration. Only the decorative tiles use Motion.)
const tileV: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  shown: (step: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: HERO.tileDelay + step * HERO.tileStagger, ...HERO.tilePop },
  }),
};

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

/** A filled tile: registry icon that plays its motion on hover / focus, pops in
 *  on entrance, and registers its handle for the ambient loop. Each icon wears
 *  its own identity hue (the glow from icon-meta). */
function IconTile({
  entry,
  step,
  register,
}: {
  entry: IconEntry;
  step: number;
  register: (h: IconHandle | null) => void;
}) {
  const ref = useRef<IconHandle>(null);
  const { Component, name, slug } = entry;
  const { glow } = metaFor(slug);
  const play = () => ref.current?.startAnimation();
  const rest = () => ref.current?.stopAnimation();
  return (
    <motion.div
      className="fh-tile fh-tile--icon"
      title={name}
      style={{ color: glow }}
      custom={step}
      variants={tileV}
      initial="hidden"
      animate="shown"
      onMouseEnter={play}
      onMouseLeave={rest}
      onFocus={play}
      onBlur={rest}
    >
      <Component
        ref={(h: IconHandle | null) => {
          (ref as React.MutableRefObject<IconHandle | null>).current = h;
          register(h);
        }}
        size={44}
        style={{ pointerEvents: "none" }}
      />
    </motion.div>
  );
}

/** One 6×6 scatter grid rendered from a fill pattern. Decorative (aria-hidden).
 *  Ripple steps radiate from the grid's inner edge — the side facing the text —
 *  so both grids appear to grow outward from the headline. */
function TileGrid({
  pattern,
  entries,
  side,
  register,
}: {
  pattern: string[];
  entries: IconEntry[];
  side: "left" | "right";
  register: (h: IconHandle | null) => void;
}) {
  let iconIdx = 0;
  const cells: React.ReactNode[] = [];
  pattern.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      const key = `${side}-${r}-${c}`;
      // distance from the inner edge (col 5 for the left grid, col 0 for the right)
      const inner = side === "left" ? 5 - c : c;
      const step = inner + Math.abs(r - 2.5);
      if (ch === "X") {
        cells.push(<IconTile key={key} entry={entries[iconIdx % entries.length]} step={step} register={register} />);
        iconIdx += 1;
      } else if (ch === "s") {
        cells.push(
          <motion.div key={key} className="fh-tile fh-tile--soft" custom={step} variants={tileV} initial="hidden" animate="shown" />,
        );
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
  // Hover beam on the install field; theme is read from the document toggle at
  // hover time so it matches the site theme (not just the OS preference).
  const [beamOn, setBeamOn] = useState(false);
  const [beamTheme, setBeamTheme] = useState<"dark" | "light">("light");
  const reduceMotion = useReducedMotion();
  const all = useTileIcons(24);
  const rightIcons = all.slice(0, 12);
  const leftIcons = all.slice(12, 24);

  // Ambient life: every few seconds one random tile plays its icon's motion.
  // Handles are collected via ref callbacks; the loop skips under reduced motion.
  const handles = useRef<Set<IconHandle>>(new Set());
  const register = (h: IconHandle | null) => {
    if (h) handles.current.add(h);
  };
  useEffect(() => {
    if (reduceMotion) return;
    let stopTimer: number | undefined;
    const tick = window.setInterval(() => {
      const pool = [...handles.current];
      if (!pool.length) return;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      pick.startAnimation();
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => pick.stopAnimation(), HERO.ambientPlay);
    }, HERO.ambientEvery);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(stopTimer);
    };
  }, [reduceMotion]);

  return (
    <section className="fh">
      <div className="fh-inner">
        <TileGrid pattern={LEFT_PATTERN} entries={leftIcons} side="left" register={register} />

        <div className="fh-center">
          {/* The center lockup is the page's LCP content, so its entrance is
              pure CSS (fh-rise) — it paints and animates immediately at first
              paint instead of waiting for JS hydration like Motion's
              SSR-inlined `opacity: 0` would. */}
          <h1 className="fh-title fh-rise">Animated icons that earn their motion</h1>
          <p className="fh-sub fh-rise" style={{ animationDelay: "90ms" }}>
            Open-source React icons, hand-drawn on the Phosphor 256 grid and tuned to read at 24px.
            Hover any tile to watch it move.
          </p>
          <div className="fh-cta-row fh-rise" style={{ animationDelay: "180ms" }}>
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
              <BorderBeam
                active={beamOn && !reduceMotion}
                theme={beamTheme}
                size="sm"
                style={{ display: "inline-flex", maxWidth: "100%" }}
                onMouseEnter={() => {
                  setBeamTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
                  setBeamOn(true);
                }}
                onMouseLeave={() => setBeamOn(false)}
              >
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
              </BorderBeam>
            </span>
            <button type="button" className="fh-kbd-hint" onClick={onOpenSearch}>
              Press <span className="dc-kbd">⌘K</span> to search
            </button>
          </div>
        </div>

        <TileGrid pattern={RIGHT_PATTERN} entries={rightIcons} side="right" register={register} />
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
