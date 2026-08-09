"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Last-resort boundary: this replaces the root layout when the layout itself throws,
 * which is exactly the case `error.tsx` cannot cover. It therefore has to supply its
 * own <html> and <body> — nothing above it is rendering any more.
 *
 * The retry prop is `unstable_retry`, NOT `reset`. Next 16 renamed it, and every
 * older guide (and most generated code) still passes `reset`, which arrives as
 * undefined and makes the button a no-op that looks like it works.
 *
 * Reporting happens in an effect, not in render: on a double-invoked or retried
 * render the body runs more than once, and one crash would arrive as several issues.
 * Styling is inline because a global stylesheet is one of the things that may have
 * failed to load by the time we get here.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    try {
      // digest is the only handle back to the server-side log for a Server
      // Component error, whose message is deliberately redacted in production.
      posthog.captureException(error, error.digest ? { digest: error.digest } : undefined);
    } catch {
      // A failed report must not replace the error page with a blank one.
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#fff",
          color: "#111",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>Something went wrong</h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.7, margin: "0 0 20px" }}>
            The page failed to load. Trying again often clears it.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              font: "inherit",
              fontSize: 14,
              padding: "9px 18px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ fontSize: 12, opacity: 0.45, marginTop: 20 }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
