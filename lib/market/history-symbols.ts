/**
 * Symbols with real daily history available to the Options Lab and the
 * Forecast Lab. Safe to import in browser code (no server-only imports).
 */
export const HISTORY_SYMBOLS = [
  { symbol: "SPY", name: "S&P 500 (via SPY fund)", kind: "Index fund", periodsPerYear: 252 },
  { symbol: "QQQ", name: "Nasdaq 100 (via QQQ fund)", kind: "Index fund", periodsPerYear: 252 },
  { symbol: "AAPL", name: "Apple", kind: "Share", periodsPerYear: 252 },
  { symbol: "MSFT", name: "Microsoft", kind: "Share", periodsPerYear: 252 },
  { symbol: "NVDA", name: "Nvidia", kind: "Share", periodsPerYear: 252 },
  { symbol: "TSLA", name: "Tesla", kind: "Share", periodsPerYear: 252 },
  { symbol: "AMZN", name: "Amazon", kind: "Share", periodsPerYear: 252 },
  { symbol: "BTC/USD", name: "Bitcoin", kind: "Crypto", periodsPerYear: 365 },
  { symbol: "EUR/USD", name: "Euro / US Dollar", kind: "Forex", periodsPerYear: 260 },
  { symbol: "XAU/USD", name: "Gold", kind: "Commodity", periodsPerYear: 260 },
] as const;

export type HistorySymbol = (typeof HISTORY_SYMBOLS)[number]["symbol"];

export function symbolMeta(symbol: string) {
  return HISTORY_SYMBOLS.find((s) => s.symbol === symbol) ?? HISTORY_SYMBOLS[0];
}
