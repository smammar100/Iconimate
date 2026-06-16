"use client";

import { useRef } from "react";
import type { IconHandle } from "@/lib/icon";
import { ThemeToggle } from "@/components/dark/theme-toggle";
import { ALIGN_CENTER_HORIZONTAL } from "./align-center-horizontal-icon";
import { AlignCH1 } from "./variants/h1";
import { AlignCH2 } from "./variants/h2";
import { AlignCH3 } from "./variants/h3";
import { AlignCH4 } from "./variants/h4";
import { AlignCH5 } from "./variants/h5";
import { AlignCH6 } from "./variants/h6";
import { AlignCH7 } from "./variants/h7";

const VARIANTS = [
  { n: 1, name: "Snap (spring)", C: AlignCH1 },
  { n: 2, name: "Grow (spring)", C: AlignCH2 },
  { n: 3, name: "Sway (loop)", C: AlignCH3 },
  { n: 4, name: "Pulse (loop)", C: AlignCH4 },
  { n: 5, name: "Wipe", C: AlignCH5 },
  { n: 6, name: "Center wipe", C: AlignCH6 },
  { n: 7, name: "Drop (bounce)", C: AlignCH7 },
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
            Prototype · align center horizontal simple · 7 candidates
          </span>
          <h1 className="lab-title">Find the center.</h1>
          <p className="lab-sub">
            Seven takes on align-center-horizontal-simple — a spring snap into place, a
            horizontal grow out of the center axis, a gentle balance sway, a breathing
            pulse, a left-to-right wipe, a center-out wipe, and a drop-and-bounce. The exact Phosphor
            glyph, animated whole so the artwork is pixel-identical. Hover any card to
            preview, or click to replay.
          </p>
          <div className="lab-toolbar">
            <button type="button" className="dc-btn" onClick={playAll}>
              Play all
            </button>
            <div className="lab-source">
              <span className="lab-source__icon">
                <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
                  <path d={ALIGN_CENTER_HORIZONTAL} />
                </svg>
              </span>
              <span className="dc-mono" style={{ fontSize: 12.5 }}>
                Phosphor align center horizontal simple · 256 grid
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
