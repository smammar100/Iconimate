import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AppProvider } from "./providers";
import { StructuredData } from "@/components/seo/structured-data";
import { SITE, SITE_NAME, META_TITLE, META_DESCRIPTION } from "@/lib/seo";

/**
 * Vercel Geist typography: Geist Sans sets UI and prose, Geist Mono sets code,
 * data, and tabular figures. Both are open source and ship with the `geist`
 * package, so this is the real design system — no substitutes.
 */

const TITLE = META_TITLE;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: META_DESCRIPTION,
  applicationName: SITE_NAME,
  // Google has ignored the keywords meta tag since 2009, so this ranks nothing;
  // it is kept because some non-Google crawlers and AI indexers still read it,
  // and it costs a few bytes. The terms that actually have to earn rankings
  // live in the title, the description, and the on-page copy.
  keywords: [
    "animated icon library",
    "animated icons",
    "icon animation",
    "icon library",
    "icon motion",
    "motion icons",
    "animated react icons",
    "animated svg icons",
    "react icon library",
    "svg icon animation",
    "phosphor animated icons",
    "shadcn icons",
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
    description: META_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: META_DESCRIPTION,
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

// Blocking pre-hydration script: reads the persisted theme from the
// `iconimate-theme` cookie (the same cookie the ThemeToggle writes) and applies
// `data-theme`/`data-color-scheme` before first paint, so the page can be
// statically prerendered with a `light` default yet show dark with no flash.
// Default to light on any error/absence (matches the documented Geist default).
const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )iconimate-theme=([^;]+)/);var t=m&&decodeURIComponent(m[1])==="dark"?"dark":"light";var e=document.documentElement;e.setAttribute("data-theme",t);e.setAttribute("data-color-scheme",t);}catch(_){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No `await cookies()` here — that dynamic API would force the whole tree to
  // render per-request. The layout ships a static `light` default; the inline
  // script above corrects to dark before paint. suppressHydrationWarning covers
  // the attribute mutation the script does before React hydrates.
  return (
    <html
      lang="en"
      data-theme="light"
      data-color-scheme="light"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
        <StructuredData />
        <Analytics />
      </body>
    </html>
  );
}
