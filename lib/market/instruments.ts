import type { QuoteGroupId } from "./types";

/**
 * The live watchlist: which markets we ask each provider for.
 *
 * Index levels themselves (the S&P 500 number) are not in any good free plan,
 * so the US indices are tracked through the exchange-traded funds that follow
 * them (SPY, QQQ, DIA). Their price is not the index level, but their daily
 * percentage move is almost the same. The labels say so.
 */
export type LiveInstrument = {
  symbol: string;
  /** The symbol as the provider spells it. */
  providerSymbol: string;
  name: string;
  group: QuoteGroupId;
  decimals: number;
  explainer: string;
};

export const LIVE_INSTRUMENTS: LiveInstrument[] = [
  // US stock market (Finnhub)
  { symbol: "SPY", providerSymbol: "SPY", name: "S&P 500 (via SPY fund)", group: "us", decimals: 2,
    explainer: "SPY is a fund that holds the 500 companies in the S&P 500 index. Its daily % move tracks the index closely; its price is not the index level." },
  { symbol: "QQQ", providerSymbol: "QQQ", name: "Nasdaq 100 (via QQQ fund)", group: "us", decimals: 2,
    explainer: "QQQ is a fund that tracks the Nasdaq 100, 100 large non-financial companies, heavy in technology." },
  { symbol: "DIA", providerSymbol: "DIA", name: "Dow Jones (via DIA fund)", group: "us", decimals: 2,
    explainer: "DIA is a fund that tracks the Dow Jones Industrial Average, 30 large US companies." },
  { symbol: "AAPL", providerSymbol: "AAPL", name: "Apple", group: "us", decimals: 2,
    explainer: "Apple Inc. shares. One of the largest companies in the S&P 500, so it moves the index." },
  { symbol: "MSFT", providerSymbol: "MSFT", name: "Microsoft", group: "us", decimals: 2,
    explainer: "Microsoft Corp. shares. One of the largest companies in the S&P 500." },
  { symbol: "NVDA", providerSymbol: "NVDA", name: "Nvidia", group: "us", decimals: 2,
    explainer: "Nvidia Corp. shares. A chip maker and one of the largest, most traded US stocks." },
  { symbol: "AMZN", providerSymbol: "AMZN", name: "Amazon", group: "us", decimals: 2,
    explainer: "Amazon.com Inc. shares." },
  { symbol: "GOOGL", providerSymbol: "GOOGL", name: "Alphabet (Google)", group: "us", decimals: 2,
    explainer: "Alphabet Inc. class A shares, the parent company of Google." },
  { symbol: "META", providerSymbol: "META", name: "Meta Platforms", group: "us", decimals: 2,
    explainer: "Meta Platforms Inc. shares, the owner of Facebook, Instagram and WhatsApp." },
  { symbol: "TSLA", providerSymbol: "TSLA", name: "Tesla", group: "us", decimals: 2,
    explainer: "Tesla Inc. shares. Known for large daily moves." },

  // Forex and gold (Twelve Data)
  { symbol: "EUR/USD", providerSymbol: "EUR/USD", name: "Euro / US Dollar", group: "fx", decimals: 5,
    explainer: "How many US dollars one euro buys. The most traded currency pair in the world." },
  { symbol: "GBP/USD", providerSymbol: "GBP/USD", name: "British Pound / US Dollar", group: "fx", decimals: 5,
    explainer: "How many US dollars one British pound buys. Nicknamed \"cable\"." },
  { symbol: "USD/JPY", providerSymbol: "USD/JPY", name: "US Dollar / Japanese Yen", group: "fx", decimals: 3,
    explainer: "How many Japanese yen one US dollar buys." },
  { symbol: "AUD/USD", providerSymbol: "AUD/USD", name: "Australian Dollar / US Dollar", group: "fx", decimals: 5,
    explainer: "How many US dollars one Australian dollar buys. Often moves with commodity prices." },
  { symbol: "USD/CAD", providerSymbol: "USD/CAD", name: "US Dollar / Canadian Dollar", group: "fx", decimals: 5,
    explainer: "How many Canadian dollars one US dollar buys. Often moves with oil prices." },
  { symbol: "USD/CHF", providerSymbol: "USD/CHF", name: "US Dollar / Swiss Franc", group: "fx", decimals: 5,
    explainer: "How many Swiss francs one US dollar buys." },
  { symbol: "XAU/USD", providerSymbol: "XAU/USD", name: "Gold", group: "fx", decimals: 2,
    explainer: "The price of one troy ounce of gold in US dollars." },

  // Crypto (Coinbase public market data, no key needed)
  { symbol: "BTC/USD", providerSymbol: "BTC-USD", name: "Bitcoin", group: "crypto", decimals: 2,
    explainer: "The price of one bitcoin in US dollars. Trades 24 hours a day, 7 days a week." },
  { symbol: "ETH/USD", providerSymbol: "ETH-USD", name: "Ethereum", group: "crypto", decimals: 2,
    explainer: "The price of one ether, the currency of the Ethereum network, in US dollars." },
  { symbol: "SOL/USD", providerSymbol: "SOL-USD", name: "Solana", group: "crypto", decimals: 2,
    explainer: "The price of one SOL, the currency of the Solana network, in US dollars." },
];

export const GROUP_LABEL: Record<QuoteGroupId, string> = {
  us: "US stock market",
  fx: "Forex and gold",
  crypto: "Crypto",
};

export function instrumentsIn(group: QuoteGroupId) {
  return LIVE_INSTRUMENTS.filter((i) => i.group === group);
}

export function explainerFor(symbol: string) {
  return LIVE_INSTRUMENTS.find((i) => i.symbol === symbol)?.explainer;
}
