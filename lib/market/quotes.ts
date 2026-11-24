import "server-only";
import { cached } from "./cache";
import { GROUP_LABEL } from "./instruments";
import { fetchCryptoQuotes } from "./providers/coinbase";
import { fetchUsQuotes, finnhubKey } from "./providers/finnhub";
import { fetchFxQuotes, twelveDataKey, twelveDataRefreshSeconds } from "./providers/twelvedata";
import { forexWeekOpen, sessionStatus, US_STOCKS } from "@/lib/sessions";
import type { Quote, QuoteGroup, QuoteGroupId, QuotesResponse } from "./types";

type GroupDef = {
  id: QuoteGroupId;
  provider: string;
  providerUrl: string;
  /** Empty string when no key is needed. */
  keyName: string;
  hasKey: () => boolean;
  marketOpen: (now: Date) => boolean | null;
  /** Seconds between provider requests while the market is open / closed. */
  ttl: (open: boolean | null) => number;
  load: () => Promise<Quote[]>;
};

const GROUPS: GroupDef[] = [
  {
    id: "us",
    provider: "Finnhub",
    providerUrl: "https://finnhub.io",
    keyName: "FINNHUB_API_KEY",
    hasKey: () => !!finnhubKey(),
    marketOpen: (now) => sessionStatus(US_STOCKS, now).open,
    // 10 symbols every 15 s = 40 requests a minute; with the news feed (1 a
    // minute) that leaves about 19 of the free plan's 60 a minute spare.
    ttl: (open) => (open ? 15 : 300),
    load: fetchUsQuotes,
  },
  {
    id: "fx",
    provider: "Twelve Data",
    providerUrl: "https://twelvedata.com",
    keyName: "TWELVE_DATA_API_KEY",
    hasKey: () => !!twelveDataKey(),
    marketOpen: (now) => forexWeekOpen(now),
    ttl: (open) => (open ? twelveDataRefreshSeconds() : 1800),
    load: fetchFxQuotes,
  },
  {
    id: "crypto",
    provider: "Coinbase",
    providerUrl: "https://www.coinbase.com",
    keyName: "",
    hasKey: () => true,
    marketOpen: () => true,
    ttl: () => 10,
    load: fetchCryptoQuotes,
  },
];

async function loadGroup(def: GroupDef, now: Date): Promise<QuoteGroup> {
  const marketOpen = def.marketOpen(now);
  const refreshSeconds = def.ttl(marketOpen);
  const base = {
    id: def.id,
    label: GROUP_LABEL[def.id],
    provider: def.provider,
    providerUrl: def.providerUrl,
    marketOpen,
    refreshSeconds,
  };
  if (!def.hasKey()) {
    return {
      ...base,
      status: "missing_key",
      message: `Add a free ${def.provider} key as ${def.keyName} in .env.local to see these prices.`,
      fetchedAt: null,
      quotes: [],
    };
  }
  const r = await cached(`quotes:${def.id}`, refreshSeconds * 1000, def.load);
  if (r.value && !r.stale) return { ...base, status: "ok", fetchedAt: r.fetchedAt, quotes: r.value };
  if (r.value) {
    return { ...base, status: "stale", message: r.error, fetchedAt: r.fetchedAt, quotes: r.value };
  }
  return { ...base, status: "error", message: r.error ?? `${def.provider} could not be reached.`, fetchedAt: null, quotes: [] };
}

export async function getQuotes(): Promise<QuotesResponse> {
  const now = new Date();
  const groups = await Promise.all(GROUPS.map((g) => loadGroup(g, now)));
  return { generatedAt: Date.now(), groups };
}
