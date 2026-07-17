import { Gallery } from "@/components/dark/gallery";
import { getIcons } from "@/lib/sanity/icons";

/**
 * Server component. Resolves the icon list from Sanity — names, motion labels,
 * keywords and homepage visibility — and hands it to the client gallery.
 *
 * Server-side rather than client-fetched for three reasons: the names are in the
 * SSR HTML (so crawlers and the LCP pass see real content, not a loading state),
 * the ISR cache means Sanity sees roughly one request per revalidate window
 * instead of one per visitor, and the projectId never has to reach the browser.
 *
 * getIcons() falls back to the generated repo data if Sanity is unreachable, so
 * this page renders with or without Sanity. The glyphs themselves are always
 * compiled code from registry/icons — Sanity supplies the words, never the art.
 */
export default async function Home() {
  const { icons } = await getIcons();
  return <Gallery icons={icons} />;
}
