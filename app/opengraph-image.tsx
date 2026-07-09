import { ImageResponse } from "next/og";
import { SITE_NAME, TAGLINE, ICON_COUNT } from "@/lib/seo";

export const alt = `${SITE_NAME} — ${TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card, generated at request/build time so there is no PNG to keep
 * in sync. Dark canvas, oversized wordmark, and the one-line pitch, so a shared
 * link renders as a rich card on X, LinkedIn, Slack, and iMessage.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#fafafa",
              color: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            I
          </div>
          <div style={{ fontSize: 40, fontWeight: 600 }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 940 }}>
            {TAGLINE}
          </div>
          <div style={{ fontSize: 34, color: "#a1a1a1", maxWidth: 900 }}>
            {`${ICON_COUNT} open-source animated React icons on the Phosphor 256 grid.`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 26, color: "#a1a1a1" }}>
          <span>MIT licensed</span>
          <span>·</span>
          <span>shadcn registry</span>
          <span>·</span>
          <span>iconimate.app</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
