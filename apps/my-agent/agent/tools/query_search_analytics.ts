import { defineTool } from "eve/tools";
import {
  querySearchAnalytics,
  searchAnalyticsQueryInputSchema,
  type SearchAnalyticsQuery,
} from "../lib/search-console.js";

export default defineTool({
  description:
    "Query Google Search Console Search Analytics for the property: the site's own real clicks, impressions, CTR, and average position by query, page, country, device, and date. First-party ground truth for striking-distance, low-CTR, cannibalization, and decay analysis.",
  inputSchema: searchAnalyticsQueryInputSchema,
  async execute(input: unknown) {
    return querySearchAnalytics(input as SearchAnalyticsQuery);
  },
});
