/**
 * Instrument definitions. This is reference information about WHAT each
 * market is. It contains no prices; prices arrive from a provider in Phase 3.
 */
export type AssetClass = "forex" | "commodity" | "index" | "crypto";

export type Instrument = {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  /** Plain-English explanation for a beginner. */
  explainer: string;
};

export const INITIAL_INSTRUMENTS: Instrument[] = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", assetClass: "forex",
    explainer: "How many US dollars one euro buys. The most traded currency pair in the world." },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", assetClass: "forex",
    explainer: "How many US dollars one British pound buys. Nicknamed \"cable\"." },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", assetClass: "forex",
    explainer: "How many Japanese yen one US dollar buys." },
  { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", assetClass: "forex",
    explainer: "How many US dollars one Australian dollar buys. Often moves with commodity prices." },
  { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", assetClass: "forex",
    explainer: "How many Swiss francs one US dollar buys." },
  { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", assetClass: "forex",
    explainer: "How many Canadian dollars one US dollar buys. Often moves with oil prices." },
  { symbol: "XAU/USD", name: "Gold", assetClass: "commodity",
    explainer: "The price of one troy ounce of gold in US dollars." },
  { symbol: "SPX", name: "S&P 500", assetClass: "index",
    explainer: "An index tracking 500 large US companies. A common gauge of the US stock market." },
  { symbol: "NDX", name: "Nasdaq 100", assetClass: "index",
    explainer: "An index of 100 large non-financial companies on the Nasdaq exchange, heavy in technology." },
  { symbol: "BTC/USD", name: "Bitcoin", assetClass: "crypto",
    explainer: "The price of one bitcoin in US dollars. Trades 24 hours a day, 7 days a week." },
  { symbol: "ETH/USD", name: "Ethereum", assetClass: "crypto",
    explainer: "The price of one ether, the currency of the Ethereum network, in US dollars." },
];

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  forex: "Forex",
  commodity: "Commodity",
  index: "Index",
  crypto: "Crypto",
};
