import { defineTool } from "eve/tools";
import { listSites } from "../lib/search-console.js";

export default defineTool({
  description:
    "List the Search Console properties the configured service account can access. Useful to confirm access and the exact property name before querying.",
  inputSchema: { type: "object", additionalProperties: false, properties: {} } as const,
  async execute() {
    return listSites();
  },
});
