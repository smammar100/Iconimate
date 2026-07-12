"use client";

import { MotionConfig } from "motion/react";

/**
 * App-wide client boundary. Icon hover animations must always play — Motion does
 * not auto-disable them under the OS reduced-motion setting — so everything is
 * wrapped in `MotionConfig reducedMotion="never"`.
 *
 * Native-control theming (the ⌘K input caret, scrollbars) follows the document
 * theme via `color-scheme` in globals.css, keyed off `[data-theme]` — no design
 * system provider needed.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
