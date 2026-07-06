"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { icons, visibleIcons, type IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";
import { installCommand, metaFor, PACKAGE_MANAGERS, type PackageManager } from "./icon-meta";

/**
 * The hero, rebuilt as the Figma-Community hover interaction. The heading carries
 * three interactive phrases; hovering one lights it up (accent + shimmer) and pops
 * a scattered cluster of icons into the margins — and, unlike Figma's static
 * thumbnails, each icon plays its animation while it's shown.
 */

type PhraseKey = "animated" | "motion" | "magic";

const bySlug = (slug: string) => icons.find((i) => i.slug === slug) as IconEntry;

// Scatter the icons that are actually live on the home page (the visible set).
const PHRASES: { key: PhraseKey; label: string; slugs: string[] }[] = [
  { key: "animated", label: "animated icons", slugs: ["acorn", "address-book", "control-tower", "phone-book", "airplane", "airplane-in-flight"] },
  { key: "motion", label: "spring motion", slugs: ["airplane-landing", "airplane-takeoff", "airplane-taxiing", "airplane-tilt", "acorn", "address-book"] },
  { key: "magic", label: "hover magic", slugs: ["control-tower", "phone-book", "airplane", "airplane-in-flight", "airplane-landing", "airplane-takeoff"] },
];

/** Scatter positions around the centered heading (margins only, so text stays clear). */
const SLOTS = [
  { left: "11%", top: "22%", rot: -8 },
  { left: "5%", top: "54%", rot: 7 },
  { left: "14%", top: "85%", rot: -5 },
  { left: "89%", top: "22%", rot: 8 },
  { left: "95%", top: "54%", rot: -7 },
  { left: "86%", top: "85%", rot: 6 },
];

/* ─────────────────────────────────────────────────────────
 * SCATTER STORYBOARD (per hovered phrase)
 *
 *    0ms   slot 1 pops: scale 0.5 → 1, spring settle (slight overshoot)
 *  +45ms   each following slot pops, staggered outward
 *          while shown, each icon plays its own animation
 *  leave   all fade + shrink out together, fast (no stagger)
 * ───────────────────────────────────────────────────────── */
const DECOR = {
  stagger: 0.045, // s between slots popping in
  pop: { type: "spring", visualDuration: 0.35, bounce: 0.3 } as const, // entrance settle
  exit: { duration: 0.14, ease: "easeOut" } as const, // leave together, quick
};

const decorV: Variants = {
  hidden: { opacity: 0, scale: 0.5, transition: DECOR.exit },
  shown: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * DECOR.stagger, ...DECOR.pop },
  }),
};

function DecorIcon({
  entry,
  slot,
  index,
  active,
}: {
  entry: IconEntry;
  slot: (typeof SLOTS)[number];
  index: number;
  active: boolean;
}) {
  const ref = useRef<IconHandle>(null);
  const { Component } = entry;
  const { glow } = metaFor(entry.slug);

  useEffect(() => {
    if (active) ref.current?.startAnimation();
    else ref.current?.stopAnimation();
  }, [active]);

  return (
    <div
      className="dc-decor-pos"
      style={{ left: slot.left, top: slot.top, ["--rot" as string]: `${slot.rot}deg` } as React.CSSProperties}
    >
      <motion.div
        className="dc-decor"
        style={{ color: glow }}
        custom={index}
        variants={decorV}
        initial="hidden"
        animate={active ? "shown" : "hidden"}
      >
        <Component ref={ref} size={34} style={{ pointerEvents: "none", position: "relative", zIndex: 1 }} />
      </motion.div>
    </div>
  );
}

export function InteractiveHero({
  onCopyInstall,
  onOpenSearch,
}: {
  /** Copy the hero install command for the given package manager. */
  onCopyInstall: (pm: PackageManager) => void;
  onOpenSearch: () => void;
}) {
  const [pm, setPm] = useState<PackageManager>("npm");
  const [active, setActive] = useState<PhraseKey | null>(null);
  const interacted = useRef(false);
  const reduceMotion = useReducedMotion();

  // A gentle one-time auto-demo on load so the interaction is discoverable.
  // Cancels the moment the visitor hovers a word themselves. Skipped under
  // reduced motion — it exists only to show things moving.
  useEffect(() => {
    if (reduceMotion) return;
    const seq: PhraseKey[] = ["animated", "motion", "magic"];
    const timers: number[] = [];
    seq.forEach((key, i) => {
      timers.push(window.setTimeout(() => !interacted.current && setActive(key), 700 + i * 1100));
    });
    timers.push(window.setTimeout(() => !interacted.current && setActive(null), 700 + seq.length * 1100));
    return () => timers.forEach((t) => clearTimeout(t));
  }, [reduceMotion]);

  const set = (key: PhraseKey | null) => {
    interacted.current = true;
    setActive(key);
  };

  const Word = ({ phrase }: { phrase: (typeof PHRASES)[number] }) => (
    <button
      type="button"
      className="dc-iword"
      data-active={active === phrase.key || undefined}
      aria-label={`Preview ${phrase.label}`}
      onMouseEnter={() => set(phrase.key)}
      onMouseLeave={() => set(null)}
      onFocus={() => set(phrase.key)}
      onBlur={() => set(null)}
    >
      {phrase.label}
    </button>
  );

  const [animated, springMotion, magic] = PHRASES;

  return (
    <section className="dc-ihero">
      <div className="dc-hero__glow" aria-hidden />
      <div className="dc-ihero__stage">
        {PHRASES.map((phrase) =>
          phrase.slugs.map((slug, i) => (
            <DecorIcon
              key={`${phrase.key}-${slug}`}
              entry={bySlug(slug)}
              slot={SLOTS[i]}
              index={i}
              active={active === phrase.key}
            />
          )),
        )}

        <div className="dc-ihero__inner">
          <span className="dc-eyebrow">
            <span className="dc-eyebrow__dot" />
            Open source · MIT · {visibleIcons.length} animated icons
          </span>

          <h1 className="dc-ih1">
            A hand-built set of <Word phrase={animated} />, <Word phrase={springMotion} />, and{" "}
            <Word phrase={magic} />.
          </h1>

          <p className="dc-ihero__sub">
            Open-source React icons, hand-drawn on the Phosphor 256 grid and tuned to read at 24px.
            Hover a phrase to watch the set move.
          </p>

          <div className="dc-cta" style={{ justifyContent: "center" }}>
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
            <button
              type="button"
              className="dc-kbd-hint"
              onClick={onOpenSearch}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", marginTop: 0 }}
            >
              Press <span className="dc-kbd">⌘K</span> to search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CopyGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
    </svg>
  );
}
