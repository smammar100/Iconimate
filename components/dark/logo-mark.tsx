/**
 * Iconimate logo mark ("M5"): a script capital I over a double swash —
 * thick over thin — lifted from the A1 wordmark. Drawn as pure paths
 * (no font dependency) so it renders identically everywhere, and inherits
 * `currentColor` so the brand red is set by the caller (see `.dc-logo-mark`).
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* script capital I: arched top flag + slanted stem with an exit flick.
          The lm-* classes are animation hooks — see `.dc-logo` in globals.css. */}
      <g className="lm-i">
        <path
          d="M18 16 C 26 9.5, 39 8.5, 47 13"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M43 11 C 38 21, 31 32, 26.5 41 C 25.5 43.5, 26.5 45.5, 29.5 44.5"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
      {/* double swash: thick over thin, tips rising to the right */}
      <path
        className="lm-swash lm-swash--thick"
        d="M14 50 C 26 56.5, 41 56.5, 51 48"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        className="lm-swash lm-swash--thin"
        d="M20 57.5 C 29 62, 39 62, 46.5 56.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
