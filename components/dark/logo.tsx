import { LogoMark } from "@/components/dark/logo-mark";

/**
 * Full Iconimate logo lockup: the M5 mark (script I + double swash) beside the
 * wordmark. Used in site navs; the mark alone (LogoMark / app/icon.svg) covers
 * favicons and tight responsive spots.
 */
export function Logo({ sub }: { sub?: string }) {
  return (
    <div className="dc-logo">
      <span className="dc-logo-mark">
        <LogoMark />
      </span>
      <span>Iconimate</span>
      {sub ? (
        <span
          className="dc-mono"
          style={{ marginLeft: 6, color: "var(--text-faint)", fontSize: 12 }}
        >
          {sub}
        </span>
      ) : null}
    </div>
  );
}
