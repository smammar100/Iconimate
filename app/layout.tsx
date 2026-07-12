import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AppProvider } from "./providers";
import { StructuredData } from "@/components/seo/structured-data";
import { SITE, SITE_NAME, TAGLINE, SITE_DESCRIPTION } from "@/lib/seo";

/**
 * Vercel Geist typography: Geist Sans sets UI and prose, Geist Mono sets code,
 * data, and tabular figures. Both are open source and ship with the `geist`
 * package, so this is the real design system — no substitutes.
 */

const TITLE = `${SITE_NAME} — ${TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "animated react icons",
    "animated svg icons",
    "phosphor animated icons",
    "react icon library",
    "svg icon animation",
    "shadcn icons",
    "motion icons",
    "open source icons",
  ],
  authors: [{ name: "Muhammad Ammar", url: "https://github.com/smammar100" }],
  creator: "Muhammad Ammar",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE,
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The saved theme is read from a cookie so it applies on the server (no flash, no client script).
  // Geist's documented theme here is Light, so first-time visitors default to light.
  const stored = (await cookies()).get("iconimate-theme")?.value;
  // Resolve to an explicit theme so the app tokens AND S2's page.css agree
  // from the first paint (S2 defaults to `color-scheme: light dark`, which
  // would follow the OS and can disagree with our light default).
  const theme = stored === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      data-theme={theme}
      data-color-scheme={theme}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
        <StructuredData />
        <Analytics />
      </body>
    </html>
  );
}
