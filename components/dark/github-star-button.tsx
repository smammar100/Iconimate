"use client";

import { useEffect, useState } from "react";

const REPO_URL = "https://github.com/smammar100/Iconimate";
const REPO_API_URL = "https://api.github.com/repos/smammar100/Iconimate";

function formatStars(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

/**
 * Nav "Star on GitHub" link — same dc-btn shell, plus an animated rainbow
 * edge and a live star count fetched client-side (falls back to hiding the
 * count on failure, so it degrades to a plain button).
 */
export function GithubStarButton() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(REPO_API_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <a className="dc-btn dc-btn--rainbow" href={REPO_URL} target="_blank" rel="noreferrer">
      <GithubGlyph />
      <span>Star on GitHub</span>
      {stars !== null && (
        <span className="dc-btn--rainbow__stars">
          <StarGlyph />
          {formatStars(stars)}
        </span>
      )}
    </a>
  );
}

function GithubGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5v-1.85c-2.78.62-3.37-1.37-3.37-1.37-.46-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .28.18.61.69.5C19.14 20.61 22 16.78 22 12.25 22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function StarGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m12 2 2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2Z" />
    </svg>
  );
}
