"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Initialises PostHog, AFTER hydration.
 *
 * This deliberately does NOT live in instrumentation-client.ts, which is the
 * documented place for analytics and which ran here first. That file executes
 * before React hydrates, and PostHog injects its own <script> elements into the
 * body as it boots (exception-autocapture.js, the remote config, dead-clicks).
 * The root layout renders <StructuredData />, two <script type="application/ld+json">
 * nodes, into that same body. React then hydrated onto PostHog's scripts instead of
 * its own and rewrote one of them to `type="text/javascript"` while keeping the
 * JSON-LD payload as its contents — so the browser parsed `{"@context": ...}` as
 * JavaScript and threw `SyntaxError: Unexpected token ':'`, with a hydration
 * mismatch warning naming structured-data.tsx alongside it. Two reported errors,
 * one cause.
 *
 * useEffect runs after the commit, so React owns the tree before PostHog appends
 * anything and the two never contend for the same DOM positions.
 *
 * THE COST, stated plainly: an exception thrown DURING hydration now happens before
 * PostHog is listening and will not be captured. That is the price of not corrupting
 * the JSON-LD that every crawler and AI assistant reads off this page. Structured
 * data is load-bearing for this project; pre-hydration error capture is not.
 */
export function PostHogInit() {
  useEffect(() => {
    const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    // Unconfigured means silent — a missing key must never break the page.
    if (!KEY || !HOST) return;

    try {
      posthog.init(KEY, {
        api_host: HOST,
        debug: process.env.NODE_ENV === "development",

        // ── Heatmaps and scroll maps ────────────────────────────────────────
        // All four are required, and the keys are verified against
        // @posthog/types/dist/posthog-config.d.ts rather than recalled.
        //
        // $heatmap carries the click/mousemove coordinates the overlay draws from.
        enable_heatmaps: true,
        // Autocapture records WHICH element was hit; heatmaps only record where.
        // The click map wants both.
        autocapture: true,
        // Scroll depth is not streamed while scrolling — PostHog reports the max
        // reached as properties on $pageleave. With this off the scroll map stays
        // empty no matter how much traffic arrives. Confirmed on the wire:
        // $prev_pageview_max_scroll_percentage rides this event.
        capture_pageleave: true,
        // ...and $pageleave is scoped to a pageview, so pageviews must be on.
        // 'history_change' because this is an App Router SPA: plain `true` fires
        // once on load and every client-side route change after it is invisible.
        capture_pageview: "history_change",
      });

      // Exception autocapture is a METHOD in posthog-js 1.414, not an init option.
      // There is no `capture_exceptions` config key — an unknown init key is
      // silently ignored, so getting this wrong means error tracking never turns on
      // and nothing tells you.
      // Console errors stay off: this app logs handled fetch failures (the Sanity
      // fallback), and shipping those as issues buries the real ones.
      posthog.startExceptionAutocapture({
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: false,
      });
    } catch {
      // Analytics must never be why the page fails.
    }
  }, []);

  return null;
}
