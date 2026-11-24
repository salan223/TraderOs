/**
 * Shapes shared by the market data API routes (server) and the live
 * components (browser). Nothing in here is invented data: every quote and
 * headline comes from a named provider, with the time it was fetched.
 */

export type QuoteGroupId = "us" | "fx" | "crypto";

export type GroupStatus =
  | "ok"          // fresh data from the provider
  | "stale"       // the last refresh failed; showing the last good data
  | "missing_key" // the provider needs an API key that is not set
  | "error";      // the provider failed and there is no earlier data

export type Quote = {
  /** Our symbol, for example "EUR/USD" or "AAPL". */
  symbol: string;
  name: string;
  price: number;
  change: number | null;
  changePct: number | null;
  high: number | null;
  low: number | null;
  /** What `change` is measured against, in plain words ("previous close", "24h ago"). */
  changeBasis: string;
  /** When the provider says this price was set (ms since epoch), if it says. */
  asOf: number | null;
  decimals: number;
};

export type QuoteGroup = {
  id: QuoteGroupId;
  label: string;
  provider: string;
  providerUrl: string;
  status: GroupStatus;
  message?: string;
  /** Is the market for this group trading right now? Null when unknown. */
  marketOpen: boolean | null;
  /** How often the server asks the provider for new prices. */
  refreshSeconds: number;
  /** When the server last got data from the provider (ms). */
  fetchedAt: number | null;
  quotes: Quote[];
};

export type QuotesResponse = { generatedAt: number; groups: QuoteGroup[] };

export type NewsImpact = "high" | "normal";

export type NewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: number;
  summary?: string;
  tags: string[];
  impact: NewsImpact;
};

export type NewsSourceStatus = {
  id: string;
  name: string;
  status: "ok" | "error" | "missing_key";
  count: number;
  message?: string;
};

export type NewsResponse = {
  generatedAt: number;
  refreshSeconds: number;
  items: NewsItem[];
  sources: NewsSourceStatus[];
};
