"use client";

/**
 * Capture-only route — a clean recording stage for the "last row" of the icon
 * grid (Angle, Angular, Aperture, App Store Logo, App Window, Apple Logo).
 *
 * It reproduces the light card styling of the home grid and auto-cycles every
 * tile's animation on a shared loop so a screen recorder (Playwright) can grab a
 * seamless looping clip. Not linked from the app; it exists purely for export.
 */

import { useEffect, useRef } from "react";
import { AngleIcon } from "@/registry/icons/angle";
import { AngularIcon } from "@/registry/icons/angular";
import { ApertureIcon } from "@/registry/icons/aperture";
import { AppStoreLogoIcon } from "@/registry/icons/app-store-logo";
import { AppWindowIcon } from "@/registry/icons/app-window";
import { AppleLogoIcon } from "@/registry/icons/apple-logo";
import type { IconComponent } from "@/registry/icons";
import type { IconHandle } from "@/lib/icon";

const ROW: { name: string; motion: string; Component: IconComponent }[] = [
  { name: "Angle", motion: "draw", Component: AngleIcon },
  { name: "Angular", motion: "flip", Component: AngularIcon },
  { name: "Aperture", motion: "iris", Component: ApertureIcon },
  { name: "App Store Logo", motion: "draw", Component: AppStoreLogoIcon },
  { name: "App Window", motion: "blink", Component: AppWindowIcon },
  { name: "Apple Logo", motion: "flick", Component: AppleLogoIcon },
];

// One full loop: play, hold, reset, breathe. Tuned so the slower draws finish
// before the row settles back to rest.
const PLAY_MS = 1500;
const LOOP_MS = 2600;

export default function LastRowCapturePage() {
  const refs = useRef<(IconHandle | null)[]>([]);

  useEffect(() => {
    const play = () => {
      refs.current.forEach((h) => h?.startAnimation());
      window.setTimeout(() => refs.current.forEach((h) => h?.stopAnimation()), PLAY_MS);
    };
    play();
    const id = window.setInterval(play, LOOP_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 1px 1px, #d8dadf 1px, transparent 0) 0 0 / 22px 22px, #f4f5f7",
        fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
      }}
    >
      <div style={{ display: "flex", gap: 18, padding: 28 }}>
        {ROW.map(({ name, motion, Component }, i) => (
          <div
            key={name}
            style={{
              width: 160,
              height: 152,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "22px 20px",
              borderRadius: 16,
              background: "#ffffff",
              border: "1px solid #ececef",
              boxShadow: "0 1px 2px rgba(16,17,20,0.04)",
            }}
          >
            <div style={{ color: "#18181b" }}>
              <Component
                ref={(el) => {
                  refs.current[i] = el;
                }}
                size={28}
              />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1c1c1f" }}>{name}</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#9b9ba3",
                  marginTop: 6,
                }}
              >
                {motion.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
