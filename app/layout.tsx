import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
