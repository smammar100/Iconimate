"use client";

import { useRef } from "react";
import type { IconHandle } from "@/lib/icon";
import { PERSON, FRAME } from "./address-book-paths";
import { AddressBookV1 } from "./variants/v1";
import { AddressBookV2 } from "./variants/v2";
import { AddressBookV3 } from "./variants/v3";
import { AddressBookV4 } from "./variants/v4";
import { AddressBookV5 } from "./variants/v5";
import { AddressBookV6 } from "./variants/v6";
import { AddressBookV7 } from "./variants/v7";
import { AddressBookV8 } from "./variants/v8";
import { AddressBookV9 } from "./variants/v9";
import { AddressBookV10 } from "./variants/v10";

const VARIANTS = [
  { n: 1, name: "Flip", C: AddressBookV1 },
  { n: 2, name: "Person pop", C: AddressBookV2 },
  { n: 3, name: "Page turn", C: AddressBookV3 },
  { n: 4, name: "Head nod", C: AddressBookV4 },
  { n: 5, name: "Lift", C: AddressBookV5 },
  { n: 6, name: "Jingle", C: AddressBookV6 },
  { n: 7, name: "Person rise", C: AddressBookV7 },
  { n: 8, name: "Heartbeat", C: AddressBookV8 },
  { n: 9, name: "Idle nod (loop)", C: AddressBookV9 },
  { n: 10, name: "Open cover", C: AddressBookV10 },
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
          </div>
        </nav>

        <header className="lab-head">
          <span className="lab-eyebrow">
            <span className="dc-eyebrow__dot" />
            Prototype · address-book · 10 candidates
          </span>
          <h1 className="lab-title">Pick the animation for Address Book.</h1>
          <p className="lab-sub">
            Ten takes on the same glyph. Hover any card to preview, or click to replay. Tell me the
            number you want and I’ll promote it into the main set.
          </p>
          <div className="lab-toolbar">
            <button type="button" className="dc-btn" onClick={playAll}>
              Play all
            </button>
            <div className="lab-source">
              <span className="lab-source__icon">
                <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
                  <path d={FRAME} />
                  <path d={PERSON} />
                </svg>
              </span>
              <span className="dc-mono" style={{ fontSize: 12.5 }}>
                Phosphor “address-book”, filled · 256 grid
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
