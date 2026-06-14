"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { icons, visibleIcons, type IconEntry } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";
import { metaFor } from "./icon-meta";

/**
 * The hero, rebuilt as the Figma-Community hover interaction. The heading carries
 * three interactive phrases; hovering one lights it up (accent + shimmer) and pops
 * a scattered cluster of icons into the margins — and, unlike Figma's static
 * thumbnails, each icon plays its animation while it's shown.
 */

type PhraseKey = "animated" | "motion" | "magic";

const bySlug = (slug: string) => icons.find((i) => i.slug === slug) as IconEntry;

const PHRASES: { key: PhraseKey; label: string; slugs: string[] }[] = [
  { key: "animated", label: "animated icons", slugs: ["bell", "heart", "star", "bookmark", "sun", "acorn"] },
  { key: "motion", label: "spring motion", slugs: ["bolt", "arrow-right", "moon", "cloud", "camera", "address-book"] },
  { key: "magic", label: "hover magic", slugs: ["mail", "trash", "sun", "heart", "moon", "star"] },
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

const decorV: Variants = {
  hidden: { scale: 0.4, opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
  shown: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { delay: i * 0.035, type: "spring", stiffness: 340, damping: 20, mass: 0.7 },
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
      <motion.div className="dc-decor" custom={index} variants={decorV} initial="hidden" animate={active ? "shown" : "hidden"}>
        <span className="dc-decor__glow" style={{ background: glow }} aria-hidden />
        <Component ref={ref} size={24} style={{ pointerEvents: "none", position: "relative", zIndex: 1 }} />
      </motion.div>
    </div>
  );
}

export function InteractiveHero({
  onCopy,
  onOpenSearch,
}: {
  onCopy: (slug: string, name: string) => void;
  onOpenSearch: () => void;
}) {
  const [active, setActive] = useState<PhraseKey | null>(null);
  const interacted = useRef(false);

  // A gentle one-time auto-demo on load so the interaction is discoverable.
  // Cancels the moment the visitor hovers a word themselves.
  useEffect(() => {
    const seq: PhraseKey[] = ["animated", "motion", "magic"];
    const timers: number[] = [];
    seq.forEach((key, i) => {
      timers.push(window.setTimeout(() => !interacted.current && setActive(key), 700 + i * 1100));
    });
    timers.push(window.setTimeout(() => !interacted.current && setActive(null), 700 + seq.length * 1100));
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

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
            <Word phrase={magic} /> for React.
          </h1>

          <p className="dc-ihero__sub">
            Spring physics, anticipation, and settle frames, calibrated to read at 24px. Hover a phrase
            to see the set move.
          </p>

          <div className="dc-cta" style={{ justifyContent: "center" }}>
            <span className="dc-install dc-mono">
              <span className="dc-install__dollar">$</span>
              shadcn add iconimate/bell
              <button
                type="button"
                className="dc-install__copy"
                aria-label="Copy install command"
                onClick={() => onCopy("bell", "Bell")}
              >
                <CopyGlyph />
              </button>
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
