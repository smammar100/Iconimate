import { visibleIcons } from "@/registry/icons";
import { SITE, SITE_NAME, SITE_DESCRIPTION, AUTHOR, ICON_COUNT } from "@/lib/seo";

/**
 * All of the site's JSON-LD, rendered server-side in the root layout. This is
 * the linchpin of the single-page SEO plan: instead of 147 icon routes, the
 * ItemList schema hands crawlers and AI assistants a clean enumerated inventory
 * of every icon, each pointing at its shareable deep link. Paired with
 * SoftwareApplication (site facts), it makes the whole gallery
 * machine-readable without adding a single page.
 */
export function StructuredData() {
  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: SITE,
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: AUTHOR },
    keywords:
      "animated react icons, phosphor animated icons, svg icon animation, " +
      "shadcn icons, animated svg icons, react icon library",
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Iconimate animated icons",
    description: `The full set of ${ICON_COUNT} animated React icons in Iconimate.`,
    numberOfItems: visibleIcons.length,
    itemListElement: visibleIcons.map((icon, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Animated ${icon.name} icon`,
      url: `${SITE}/?icon=${icon.slug}`,
    })),
  };

  const graphs = [softwareApplication, itemList];

  return (
    <>
      {graphs.map((graph, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify output is safe to inline; there is no user input here.
          // Escape <, >, & so a future dynamic icon name containing "</script>"
          // can't break out of the JSON-LD script tag (these escapes stay valid
          // JSON). Defense-in-depth — the data is static today.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(graph)
              .replace(/</g, "\\u003c")
              .replace(/>/g, "\\u003e")
              .replace(/&/g, "\\u0026"),
          }}
        />
      ))}
    </>
  );
}
