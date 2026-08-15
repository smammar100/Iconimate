"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** Nav button that flips the document theme and persists the choice in a cookie. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // The server always renders an explicit data-theme (light default), so the
    // attribute is the single source of truth — no matchMedia guessing.
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    // Repaint every surface on the SAME frame. Without this the hero grid
    // checkerboards: `.fh-tile--icon` eases background/color over 0.15s while
    // the `--soft`/`--blank` tiles beside it have no transition and flip at
    // once. The attribute kills transitions globally (see globals.css), the
    // forced reflow commits the new colours while they are still off, and it
    // clears on the next frame so hover/reveal transitions are untouched.
    root.setAttribute("data-theme-switching", "");
    root.setAttribute("data-theme", next);
    root.setAttribute("data-color-scheme", next);
    void root.offsetHeight;

    // BELT AND BRACES ON THE CLEAR. rAF alone is not safe here: it is starved
    // in a background or throttled tab, and this attribute kills every
    // transition on the page, so failing to remove it silently disables all
    // hover/reveal motion until the next toggle. Caught in testing, where the
    // attribute was still set 3.7s after the flip. Both paths are idempotent.
    const clear = () => root.removeAttribute("data-theme-switching");
    requestAnimationFrame(clear);
    window.setTimeout(clear, 120);

    document.cookie = `iconimate-theme=${next};path=/;max-age=31536000;samesite=lax`;
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="dc-theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onClick={toggle}
    >
      {theme === "dark" ? <SunGlyph /> : <MoonGlyph />}
    </button>
  );
}

function SunGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function MoonGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
