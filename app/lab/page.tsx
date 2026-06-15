"use client";

import { useRef } from "react";
import type { IconHandle } from "@/lib/icon";
import { ThemeToggle } from "@/components/dark/theme-toggle";
import { ALIGN_BOTTOM } from "./align-bottom-icon";
import { AlignV1 } from "./variants/g1";
import { AlignV2 } from "./variants/g2";
import { AlignV3 } from "./variants/g3";
import { AlignV4 } from "./variants/g4";
import { AlignV5 } from "./variants/g5";

const VARIANTS = [
  { n: 1, name: "Drop (spring)", C: AlignV1 },
  { n: 2, name: "Grow (spring)", C: AlignV2 },
  { n: 3, name: "Nudge (loop)", C: AlignV3 },
  { n: 4, name: "Equalizer (loop)", C: AlignV4 },
  { n: 5, name: "Rise", C: AlignV5 },
];

export default function Lab() {
  const refs = useRef<(IconHandle | null)[]>([]);
  const playAll = () => refs.current.forEach((r) => r?.startAnimation());

  return (
    <main className="dc">
      <div className="dc-hero__glow" aria-hidden />
      <div className="dc-shell">
        <nav className="dc-nav">
          <div className="dc-logo">
            <span className="dc-logo-mark">I</span>
            <span>Iconimate</span>
            <span className="dc-mono" style={{ marginLeft: 6, color: "var(--text-faint)", fontSize: 12 }}>
              / lab
            </span>
          </div>
          <div className="dc-nav-links">
            <a href="/">← Back to set</a>
            <ThemeToggle />
          </div>
        </nav>

        <header className="lab-head">
          <span className="lab-eyebrow">
            <span className="dc-eyebrow__dot" />
            Prototype · align bottom · 5 candidates
          </span>
          <h1 className="lab-title">Stick the landing.</h1>
          <p className="lab-sub">
            Five takes on align-bottom — blocks dropping in from the top and springing to rest on
            the line, blocks growing up out of the floor, a soft attention nudge, an equalizer
            pump, and a rise from below. Bottoms stay aligned throughout; the artwork is untouched.
            Hover any card to preview, or click to replay. Tell me the number you want.
          </p>
          <div className="lab-toolbar">
            <button type="button" className="dc-btn" onClick={playAll}>
              Play all
            </button>
            <div className="lab-source">
              <span className="lab-source__icon">
                <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
                  <path d={ALIGN_BOTTOM} />
                </svg>
              </span>
              <span className="dc-mono" style={{ fontSize: 12.5 }}>
                Phosphor align bottom · 256 grid
              </span>
            </div>
          </div>
        </header>

        <div className="lab-grid">
          {VARIANTS.map((v, i) => {
            const C = v.C;
            return (
              <button
                key={v.n}
                type="button"
                className="lab-card"
                aria-label={`Variant ${v.n}: ${v.name}`}
                onMouseEnter={() => refs.current[i]?.startAnimation()}
                onMouseLeave={() => refs.current[i]?.stopAnimation()}
                onClick={() => refs.current[i]?.startAnimation()}
              >
                <span className="lab-card__num dc-mono">v{v.n}</span>
                <span className="lab-card__icon">
                  <C
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    size={72}
                  />
                </span>
                <span className="lab-card__name">{v.name}</span>
                <span className="lab-card__hint dc-mono">hover · click to replay</span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
