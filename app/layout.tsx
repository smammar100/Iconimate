import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cookies } from "next/headers";
import "@react-spectrum/s2/page.css";
import "./globals.css";
import { AppProvider } from "./providers";

/**
 * Vercel Geist typography: Geist Sans sets UI and prose, Geist Mono sets code,
 * data, and tabular figures. Both are open source and ship with the `geist`
 * package, so this is the real design system — no substitutes.
 */

export const metadata: Metadata = {
  title: "Iconimate — Animated icons that earn their motion",
  description:
    "A hand-crafted, open-source set of animated SVG icons for React. Spring physics, anticipation, and settle frames — calibrated to read at 24px. Press ⌘K to search.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The saved theme is read from a cookie so it applies on the server (no flash, no client script).
  // Geist's documented theme here is Light, so first-time visitors default to light.
  const stored = (await cookies()).get("iconimate-theme")?.value;
  const theme = stored === "light" || stored === "dark" ? stored : undefined;

  return (
    <html
      lang="en"
      data-theme={theme}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body suppressHydrationWarning>
        <AppProvider initialColorScheme={theme ?? "light"}>{children}</AppProvider>
      </body>
    </html>
  );
}
