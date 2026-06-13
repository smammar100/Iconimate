import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@react-spectrum/s2/page.css";
import "./globals.css";
import { AppProvider } from "./providers";

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
  // First-time visitors have no cookie and fall back to the system preference via CSS.
  const stored = (await cookies()).get("iconimate-theme")?.value;
  const theme = stored === "light" || stored === "dark" ? stored : undefined;

  return (
    <html
      lang="en"
      data-theme={theme}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        <AppProvider initialColorScheme={theme ?? "dark"}>{children}</AppProvider>
      </body>
    </html>
  );
}
