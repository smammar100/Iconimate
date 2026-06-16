import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Space_Grotesk, Space_Mono, Doto } from "next/font/google";
import "@react-spectrum/s2/page.css";
import "./globals.css";
import { AppProvider } from "./providers";

// Nothing design DNA: Space Grotesk + Space Mono (Colophon foundry — same as
// Nothing's typefaces), Doto for the dot-matrix display moments.
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-grotesk",
  display: "swap",
});
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});
const doto = Doto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-doto",
  display: "swap",
});

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
      className={`${grotesk.variable} ${mono.variable} ${doto.variable}`}
    >
      <body suppressHydrationWarning>
        <AppProvider initialColorScheme={theme ?? "dark"}>{children}</AppProvider>
      </body>
    </html>
  );
}
