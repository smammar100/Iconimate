import { createAnthropic } from "@ai-sdk/anthropic";
import { defineAgent } from "eve";

// Routes Anthropic calls through the Vercel AI Gateway so usage bills against
// the Claude subscription linked in the gateway, rather than gateway credits.
// This is the AI SDK equivalent of the ANTHROPIC_BASE_URL +
// ANTHROPIC_CUSTOM_HEADERS pair that Vercel documents for Claude Code:
// the gateway exposes an Anthropic-compatible endpoint, and authenticates on
// the x-ai-gateway-api-key header instead of Anthropic's own x-api-key.
const anthropic = createAnthropic({
  baseURL: "https://ai-gateway.vercel.sh/v1",
  // The provider requires apiKey to be set, but the gateway ignores it and
  // authenticates on the header below.
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
  headers: {
    "x-ai-gateway-api-key": `Bearer ${process.env.AI_GATEWAY_API_KEY ?? ""}`,
  },
});

export default defineAgent({
  // Direct-provider ids use Anthropic's native hyphenated format, not the
  // gateway's dotted id.
  model: anthropic("claude-sonnet-5"),
});
