import { createSign } from "node:crypto";

// Google Search Console is the primary data source: real first-party clicks,
// impressions, CTR, and average position for the site's own pages. Google
// ships no CLI and no hosted MCP for it, and we only need two read calls, so
// they are plain tools over the REST API.
//
// Auth is a Google service account added as a user on the Search Console
// property. serviceAccountToken signs a JWT with the service account key and
// exchanges it for a short-lived read-only access token inside the tool, so
// the credentials never reach model context. Minting the token with
// node:crypto keeps this dependency-free.
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const API_BASE = "https://searchconsole.googleapis.com/webmasters/v3";

async function serviceAccountToken(): Promise<string> {
  const raw = process.env.GSC_CREDENTIALS_JSON;
  if (!raw) throw new Error("GSC_CREDENTIALS_JSON is not set");
  const { client_email, private_key } = JSON.parse(raw) as {
    client_email: string;
    private_key: string;
  };

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({ iss: client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  ).toString("base64url");
  const signingInput = `${header}.${claim}`;
  const signature = createSign("RSA-SHA256").update(signingInput).sign(private_key, "base64url");
  const assertion = `${signingInput}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Search Console token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Search Console token exchange returned no access_token");
  return data.access_token;
}

async function apiRequest(path: string, init?: RequestInit): Promise<unknown> {
  const token = await serviceAccountToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`Search Console request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export interface SearchAnalyticsQuery {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: string[];
  type?: string;
  dataState?: string;
  rowLimit?: number;
  startRow?: number;
  dimensionFilterGroups?: Record<string, unknown>[];
}

export const searchAnalyticsQueryInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["siteUrl", "startDate", "endDate"],
  properties: {
    siteUrl: {
      type: "string",
      description: "The property, e.g. `sc-domain:example.com` or `https://www.example.com/`.",
    },
    startDate: { type: "string", description: "YYYY-MM-DD (inclusive)." },
    endDate: { type: "string", description: "YYYY-MM-DD (inclusive)." },
    dimensions: {
      type: "array",
      items: { type: "string", enum: ["query", "page", "country", "device", "date", "searchAppearance"] },
    },
    type: { type: "string", enum: ["web", "image", "video", "news", "discover", "googleNews"] },
    dataState: { type: "string", enum: ["final", "all"] },
    rowLimit: { type: "integer", description: "Max rows, up to 25000." },
    startRow: { type: "integer", description: "Zero-based row offset for paging." },
    dimensionFilterGroups: { type: "array", items: { type: "object", additionalProperties: true } },
  },
} as const;

export async function querySearchAnalytics(input: SearchAnalyticsQuery): Promise<unknown> {
  const { siteUrl, ...body } = input;
  return apiRequest(`/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listSites(): Promise<unknown> {
  return apiRequest("/sites");
}
