import { defineMcpClientConnection } from "eve/connections";

// DataForSEO uses HTTP Basic auth (login:password); `auth` only emits Bearer
// tokens, so the header is built here at the connection layer and the model
// never sees the credentials.
export default defineMcpClientConnection({
  url: "https://mcp.dataforseo.com/mcp",
  description:
    "DataForSEO rankings data: live SERP results by keyword/location, the domain's ranked keywords with position and search volume, keyword gaps against competitors, and search volume lookups.",
  headers: {
    Authorization: `Basic ${Buffer.from(
      `${process.env.DATAFORSEO_LOGIN ?? ""}:${process.env.DATAFORSEO_PASSWORD ?? ""}`,
    ).toString("base64")}`,
  },
  // The hosted server exposes every DataForSEO module; this agent needs
  // exactly four read tools.
  tools: {
    allow: [
      "serp_organic_live_advanced",
      "dataforseo_labs_google_ranked_keywords",
      "dataforseo_labs_google_domain_intersection",
      "keywords_data_google_ads_search_volume",
    ],
  },
});
