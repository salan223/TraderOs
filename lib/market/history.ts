import "server-only";
import { cached } from "./cache";
import { fetchDailyHistory, twelveDataKey, type DailyBar } from "./providers/twelvedata";
import { HISTORY_SYMBOLS, type HistorySymbol } from "./history-symbols";

export { HISTORY_SYMBOLS, type HistorySymbol };

/**
 * Real daily price history for the Options Lab and the Forecast Lab.
 * Only these symbols can be requested, so a public endpoint cannot spend the
 * Twelve Data budget on arbitrary symbols. Each symbol is fetched at most once
 * every 12 hours per server, for 1 credit.
 */
export type HistoryResponse = {
  symbol: string;
  name: string;
  provider: "Twelve Data";
  fetchedAt: number | null;
  bars: DailyBar[];
  error?: string;
};

const TTL_MS = 12 * 60 * 60 * 1000;

export function isHistorySymbol(s: string): s is HistorySymbol {
  return HISTORY_SYMBOLS.some((x) => x.symbol === s);
}

export async function getHistory(symbol: HistorySymbol): Promise<HistoryResponse> {
  const meta = HISTORY_SYMBOLS.find((x) => x.symbol === symbol)!;
  const base = { symbol, name: meta.name, provider: "Twelve Data" as const };
  if (!twelveDataKey()) {
    return { ...base, fetchedAt: null, bars: [], error: "Add a free Twelve Data key as TWELVE_DATA_API_KEY to load real price history." };
  }
  const r = await cached(`history:${symbol}`, TTL_MS, () => fetchDailyHistory(symbol));
  if (r.value) return { ...base, fetchedAt: r.fetchedAt, bars: r.value, error: r.stale ? r.error : undefined };
  return { ...base, fetchedAt: null, bars: [], error: r.error ?? "Price history could not be loaded." };
}
