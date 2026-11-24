/**
 * Pure calculation helpers used by the Academy's interactive illustrations
 * (components/academy/widgets) and checked by tests/calc.test.ts.
 *
 * Every function is total: invalid input (NaN, Infinity, negative sizes,
 * zero prices) returns null or an "invalid" result instead of throwing, so a
 * half-typed number in an input box can never crash a lesson page.
 *
 * These are textbook formulas for teaching. Real brokers round, add fees and
 * apply their own rules; the lessons say so wherever it matters.
 */

const fin = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const pos = (n: unknown): n is number => fin(n) && n > 0;
const nonNeg = (n: unknown): n is number => fin(n) && n >= 0;

/** Round to `dp` decimal places, avoiding most binary floating-point surprises (1.005 → 1.01). */
export function round(n: number, dp = 2): number {
  if (!fin(n)) return n;
  const f = 10 ** dp;
  return Math.round((n + Math.sign(n) * Number.EPSILON * Math.abs(n)) * f) / f;
}

// ── Forex: pips, lots, pip value ────────────────────────────────────────────

/** Standard lot sizes, in units of the base currency. */
export const LOT_UNITS = { standard: 100_000, mini: 10_000, micro: 1_000 } as const;

/** Pip size for a quote currency: 0.01 for the Japanese yen, otherwise 0.0001. */
export function pipSize(quote: string): number {
  return quote.trim().toUpperCase() === "JPY" ? 0.01 : 0.0001;
}

/** A pipette (fractional pip) is one tenth of a pip. */
export function pipetteSize(quote: string): number {
  return pipSize(quote) / 10;
}

/** Number of pips between two prices (positive if `to` is higher). Null if either price is invalid. */
export function pipsBetween(from: number, to: number, quote: string): number | null {
  if (!pos(from) || !pos(to)) return null;
  return round((to - from) / pipSize(quote), 1);
}

export function lotsToUnits(lots: number): number | null {
  return nonNeg(lots) ? round(lots * LOT_UNITS.standard, 0) : null;
}

export function unitsToLots(units: number): number | null {
  return nonNeg(units) ? units / LOT_UNITS.standard : null;
}

export type PipValueInput = {
  base: string;
  quote: string;
  /** Position size in units of the base currency. */
  units: number;
  /** The pair's price: how many quote-currency units one base unit costs. */
  rate: number;
  /** Your account currency. */
  account: string;
  /**
   * Only needed when the account currency is neither the base nor the quote:
   * how many account-currency units ONE unit of the quote currency is worth
   * (for EUR/GBP with a USD account, that is the GBP/USD rate).
   */
  quoteToAccount?: number;
};

export type PipValue = {
  /** Value of one pip in the quote currency: pip size × units. */
  inQuote: number;
  /** Value of one pip in the account currency. */
  inAccount: number;
  /** Which conversion was used, for showing the working. */
  method: "quote-is-account" | "base-is-account" | "cross";
};

/**
 * Value of a one-pip move.
 *   in quote currency   = pip size × units
 *   account = quote     → same number
 *   account = base      → divide by the pair's rate
 *   otherwise           → multiply by the quote→account rate
 */
export function pipValue(i: PipValueInput): PipValue | null {
  if (!nonNeg(i.units) || !pos(i.rate)) return null;
  const base = i.base.toUpperCase(), quote = i.quote.toUpperCase(), account = i.account.toUpperCase();
  if (base === quote) return null;
  const inQuote = pipSize(quote) * i.units;
  if (account === quote) return { inQuote, inAccount: inQuote, method: "quote-is-account" };
  if (account === base) return { inQuote, inAccount: inQuote / i.rate, method: "base-is-account" };
  if (!pos(i.quoteToAccount)) return null;
  return { inQuote, inAccount: inQuote * i.quoteToAccount, method: "cross" };
}

/** Profit or loss in the QUOTE currency: (exit − entry) × units, flipped for a short. */
export function tradePnl(direction: "long" | "short", entry: number, exit: number, units: number): number | null {
  if (!pos(entry) || !pos(exit) || !nonNeg(units)) return null;
  const raw = (exit - entry) * units;
  return direction === "long" ? raw : -raw;
}

export type PositionSize = { units: number; lots: number; riskAmount: number };

/**
 * Position size that risks a set share of the account if the stop-loss is hit:
 *   units = (balance × risk%) ÷ (stop distance in pips × pip value per unit)
 * Rounded DOWN to whole micro lots (1,000 units), because rounding up would
 * risk more than planned. Null when the inputs make no sense.
 */
export function positionSize(balance: number, riskPct: number, stopPips: number, pipValuePerUnit: number): PositionSize | null {
  if (!pos(balance) || !pos(riskPct) || riskPct > 100 || !pos(stopPips) || !pos(pipValuePerUnit)) return null;
  const riskAmount = balance * (riskPct / 100);
  const raw = riskAmount / (stopPips * pipValuePerUnit);
  const units = Math.floor(raw / LOT_UNITS.micro + 1e-9) * LOT_UNITS.micro;
  return { units, lots: units / LOT_UNITS.standard, riskAmount };
}

// ── Forex: leverage and margin ──────────────────────────────────────────────

/** Margin needed to open a position: notional value ÷ leverage. Null for leverage below 1. */
export function marginRequired(notional: number, leverage: number): number | null {
  if (!nonNeg(notional) || !fin(leverage) || leverage < 1) return null;
  return notional / leverage;
}

/** Margin as a percentage of the position (1:30 → 3.33%). */
export function marginPct(leverage: number): number | null {
  return fin(leverage) && leverage >= 1 ? 100 / leverage : null;
}

export type MarginStatus = "ok" | "margin-call" | "stop-out";

export type MarginSnapshot = {
  equity: number;
  freeMargin: number;
  /** Equity ÷ used margin × 100. Null when no margin is in use. */
  marginLevel: number | null;
  status: MarginStatus;
};

/**
 * Account state with open positions.
 *   equity       = balance + floating P&L
 *   free margin  = equity − used margin
 *   margin level = equity ÷ used margin × 100 (%)
 * Status is "margin-call" at or below `callLevel` and "stop-out" at or below
 * `stopOutLevel`. The defaults (100% and 50%) are common examples only:
 * every broker sets its own levels.
 */
export function marginSnapshot(
  balance: number,
  floatingPnl: number,
  usedMargin: number,
  callLevel = 100,
  stopOutLevel = 50,
): MarginSnapshot | null {
  if (!fin(balance) || !fin(floatingPnl) || !nonNeg(usedMargin) || !fin(callLevel) || !fin(stopOutLevel)) return null;
  const equity = balance + floatingPnl;
  const freeMargin = equity - usedMargin;
  if (usedMargin === 0) return { equity, freeMargin, marginLevel: null, status: "ok" };
  const marginLevel = (equity / usedMargin) * 100;
  const status: MarginStatus = marginLevel <= stopOutLevel ? "stop-out" : marginLevel <= callLevel ? "margin-call" : "ok";
  return { equity, freeMargin, marginLevel, status };
}

/**
 * How far (in price units of the quote currency per base unit) a position can
 * move against you before the margin level falls to `level`%.
 * Solves (balance − move × units) ÷ usedMargin × 100 = level for `move`.
 * Assumes the quote currency is the account currency. Null if it is already there.
 */
export function adverseMoveToLevel(balance: number, units: number, usedMargin: number, level: number): number | null {
  if (!fin(balance) || !pos(units) || !pos(usedMargin) || !nonNeg(level)) return null;
  const move = (balance - (level / 100) * usedMargin) / units;
  return move > 0 ? move : null;
}

// ── Forex: costs ────────────────────────────────────────────────────────────

/** Cost of crossing the spread once (open at one side, close at the other), in the quote currency. */
export function spreadCost(spreadPips: number, units: number, quote: string): number | null {
  if (!nonNeg(spreadPips) || !nonNeg(units)) return null;
  return spreadPips * pipSize(quote) * units;
}

/** Mid price and spread in pips from a bid and ask. Null if the ask is below the bid. */
export function quoteFromBidAsk(bid: number, ask: number, quote: string): { mid: number; spreadPips: number } | null {
  if (!pos(bid) || !pos(ask) || ask < bid) return null;
  return { mid: (bid + ask) / 2, spreadPips: round((ask - bid) / pipSize(quote), 1) };
}

/**
 * A simplified overnight swap (rollover) for ONE night, in the quote currency.
 *   long  ≈ notional × (base rate − quote rate − markup) ÷ 365
 *   short ≈ notional × (quote rate − base rate − markup) ÷ 365
 * Rates are annual percentages; notional = units × price. Brokers subtract
 * their markup either way, which is why both directions can be negative.
 * (Some markets use 360 days; the difference is small at this level.)
 */
export function swapPerNight(
  direction: "long" | "short",
  units: number,
  price: number,
  baseRatePct: number,
  quoteRatePct: number,
  markupPct: number,
): number | null {
  if (!nonNeg(units) || !pos(price) || !fin(baseRatePct) || !fin(quoteRatePct) || !nonNeg(markupPct)) return null;
  const diff = direction === "long" ? baseRatePct - quoteRatePct : quoteRatePct - baseRatePct;
  return (units * price * (diff - markupPct)) / 100 / 365;
}

/**
 * How many days of swap the rollover at the end of a given trading day
 * charges (0 = Sunday … 6 = Saturday, rollover at the New York 17:00 close).
 * Spot forex settles two business days after the trade, so the rollover on
 * Wednesday moves the settlement date over a weekend (Friday → Monday) and
 * usually counts three times. Monday, Tuesday, Thursday and Friday count
 * once; there is no rollover on Saturday or Sunday. Over a full week that
 * adds up to 7 days. Brokers and holidays can shift this.
 */
export function rolloverNights(weekday: number): number {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return 0;
  if (weekday === 3) return 3;
  if (weekday === 0 || weekday === 6) return 0;
  return 1;
}

export type CostBreakdown = { spread: number; commission: number; swap: number; total: number };

/** Total trading cost in the account currency (positive = cost). Swap income reduces the total. */
export function tradingCost(spread: number, commission: number, swapTotal: number): CostBreakdown | null {
  if (!nonNeg(spread) || !nonNeg(commission) || !fin(swapTotal)) return null;
  const swap = -swapTotal; // a negative swap is a cost
  return { spread, commission, swap, total: spread + commission + swap };
}

// ── Forex: pair types ───────────────────────────────────────────────────────

/** The seven currencies most often paired with the US dollar in the "majors". */
export const MAJOR_CURRENCIES = ["EUR", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"] as const;

export type PairType = "major" | "minor" | "exotic";

/**
 * Common classification (brokers differ at the edges):
 *   major  = USD with one of the seven major currencies
 *   minor  = two of the seven, without USD (a "cross")
 *   exotic = anything with an emerging-market or smaller currency
 */
export function classifyPair(base: string, quote: string): PairType | null {
  const b = base.trim().toUpperCase(), q = quote.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(b) || !/^[A-Z]{3}$/.test(q) || b === q) return null;
  const major = (c: string) => (MAJOR_CURRENCIES as readonly string[]).includes(c);
  if ((b === "USD" && major(q)) || (q === "USD" && major(b))) return "major";
  if (major(b) && major(q)) return "minor";
  return "exotic";
}

/** Converting an amount at a rate quoted BASE/QUOTE. */
export function convert(amount: number, rate: number, direction: "base-to-quote" | "quote-to-base"): number | null {
  if (!nonNeg(amount) || !pos(rate)) return null;
  return direction === "base-to-quote" ? amount * rate : amount / rate;
}

/** The same rate quoted the other way round (EUR/USD 1.25 → USD/EUR 0.8). */
export function invertRate(rate: number): number | null {
  return pos(rate) ? 1 / rate : null;
}

/** Percentage change. Null when the starting value is zero or invalid. */
export function pctChange(from: number, to: number): number | null {
  if (!fin(from) || !fin(to) || from === 0) return null;
  return ((to - from) / Math.abs(from)) * 100;
}

// ── Stocks: order book ──────────────────────────────────────────────────────

export type BookLevel = { price: number; qty: number };
/** Bids sorted highest first, asks sorted lowest first. */
export type Book = { bids: BookLevel[]; asks: BookLevel[] };
export type IncomingOrder = { side: "buy" | "sell"; type: "market" | "limit"; qty: number; limit?: number };
export type MatchStatus = "filled" | "partial-rested" | "rested" | "partial-cancelled" | "unfilled" | "invalid";
export type MatchResult = {
  fills: BookLevel[];
  filledQty: number;
  /** Volume-weighted average fill price, or null if nothing filled. */
  avgPrice: number | null;
  /** Quantity left resting in the book as a limit order. */
  restedQty: number;
  /** Quantity a market order could not fill because the book ran out. */
  cancelledQty: number;
  status: MatchStatus;
  book: Book;
};

function cleanLevels(levels: BookLevel[], side: "bids" | "asks"): BookLevel[] {
  const ok = levels.filter((l) => pos(l.price) && pos(l.qty)).map((l) => ({ price: l.price, qty: l.qty }));
  return ok.sort((a, b) => (side === "bids" ? b.price - a.price : a.price - b.price));
}

/**
 * Price-time priority matching against a simple order book.
 * A buy takes asks from the cheapest up; a sell takes bids from the highest down.
 * A limit order stops at its limit price and the rest waits ("rests") in the
 * book. A market order takes whatever is there; anything left is cancelled.
 * The input book is never mutated.
 */
export function matchOrder(bookIn: Book, order: IncomingOrder): MatchResult {
  const book: Book = { bids: cleanLevels(bookIn.bids, "bids"), asks: cleanLevels(bookIn.asks, "asks") };
  const invalid = (): MatchResult => ({ fills: [], filledQty: 0, avgPrice: null, restedQty: 0, cancelledQty: 0, status: "invalid", book });
  if (!pos(order.qty) || !Number.isInteger(order.qty)) return invalid();
  if (order.type === "limit" && !pos(order.limit)) return invalid();

  const buying = order.side === "buy";
  const opposite = buying ? book.asks : book.bids;
  const crosses = (p: number) => order.type === "market" || (buying ? p <= order.limit! : p >= order.limit!);

  let left = order.qty;
  const fills: BookLevel[] = [];
  while (left > 0 && opposite.length > 0 && crosses(opposite[0].price)) {
    const lvl = opposite[0];
    const take = Math.min(left, lvl.qty);
    fills.push({ price: lvl.price, qty: take });
    left -= take;
    lvl.qty -= take;
    if (lvl.qty === 0) opposite.shift();
  }
  const filledQty = order.qty - left;
  const avgPrice = filledQty > 0 ? fills.reduce((s, f) => s + f.price * f.qty, 0) / filledQty : null;

  let restedQty = 0, cancelledQty = 0;
  if (left > 0) {
    if (order.type === "limit") {
      restedQty = left;
      const same = buying ? book.bids : book.asks;
      const at = same.find((l) => l.price === order.limit);
      if (at) at.qty += left; // joins the back of the queue at that price
      else {
        same.push({ price: order.limit!, qty: left });
        same.sort((a, b) => (buying ? b.price - a.price : a.price - b.price));
      }
    } else cancelledQty = left;
  }
  const status: MatchStatus =
    left === 0 ? "filled"
      : order.type === "limit" ? (filledQty > 0 ? "partial-rested" : "rested")
        : filledQty > 0 ? "partial-cancelled" : "unfilled";
  return { fills, filledQty, avgPrice, restedQty, cancelledQty, status, book };
}

// ── Stocks: earnings ────────────────────────────────────────────────────────

/** Earnings per share: net profit ÷ shares. Null if there are no shares. */
export function eps(netProfit: number, shares: number): number | null {
  if (!fin(netProfit) || !pos(shares)) return null;
  return netProfit / shares;
}

/** Price-to-earnings ratio. Null when EPS is zero or negative: a P/E is not meaningful for a loss. */
export function peRatio(price: number, epsValue: number): number | null {
  if (!pos(price) || !fin(epsValue) || epsValue <= 0) return null;
  return price / epsValue;
}

/** How far a result beat (+) or missed (−) the forecast, as a % of the forecast's size. */
export function surprisePct(actual: number, expected: number): number | null {
  if (!fin(actual) || !fin(expected) || expected === 0) return null;
  return ((actual - expected) / Math.abs(expected)) * 100;
}

export type Surprise = "beat" | "in-line" | "miss";

/** Within ±`band`% of the forecast counts as in line. */
export function classifySurprise(actual: number, expected: number, band = 1): Surprise | null {
  const s = surprisePct(actual, expected);
  if (s === null) return null;
  return s > band ? "beat" : s < -band ? "miss" : "in-line";
}

/** Profit margin: profit ÷ revenue × 100. Null when revenue is not positive. */
export function marginPctOf(profit: number, revenue: number): number | null {
  if (!fin(profit) || !pos(revenue)) return null;
  return (profit / revenue) * 100;
}

// ── Stocks: size ────────────────────────────────────────────────────────────

export function marketCap(price: number, shares: number): number | null {
  return nonNeg(price) && nonNeg(shares) ? price * shares : null;
}

export type CapBucket = "mega" | "large" | "mid" | "small" | "micro";

/**
 * Rough size labels in US dollars. There is no official definition; these
 * are common rule-of-thumb cut-offs (mega ≥ $200bn, large ≥ $10bn,
 * mid ≥ $2bn, small ≥ $300m, micro below). Index providers use their own.
 */
export function capBucket(capUsd: number): CapBucket | null {
  if (!nonNeg(capUsd)) return null;
  if (capUsd >= 200e9) return "mega";
  if (capUsd >= 10e9) return "large";
  if (capUsd >= 2e9) return "mid";
  if (capUsd >= 300e6) return "small";
  return "micro";
}

// ── Indices ─────────────────────────────────────────────────────────────────

export type IndexMember = {
  id: string;
  price: number;
  shares: number;
  /** Share of shares freely available to trade, 0–1. Defaults to 1. */
  float?: number;
};

export type WeightMethod = "price" | "cap" | "float" | "equal";

/** Each member's weight (summing to 1) under a weighting method. Empty if inputs are invalid. */
export function indexWeights(members: IndexMember[], method: WeightMethod): Record<string, number> {
  if (members.length === 0) return {};
  const raw = members.map((m) => {
    const f = m.float ?? 1;
    if (!pos(m.price) || !pos(m.shares) || !fin(f) || f <= 0 || f > 1) return NaN;
    switch (method) {
      case "price": return m.price;
      case "cap": return m.price * m.shares;
      case "float": return m.price * m.shares * f;
      case "equal": return 1;
    }
  });
  if (raw.some((r) => !fin(r))) return {};
  const sum = raw.reduce((a, b) => a + b, 0);
  return Object.fromEntries(members.map((m, i) => [m.id, raw[i] / sum]));
}

/**
 * Index percentage change when each member's price changes by `changesPct`.
 *   price-weighted: Σ new prices ÷ Σ old prices − 1  (dollar moves count, not % moves)
 *   cap / float:    Σ weight × member % change
 *   equal:          average of member % changes
 * All four are the same as "weight at the start × % change".
 */
export function indexChangePct(members: IndexMember[], changesPct: Record<string, number>, method: WeightMethod): number | null {
  const w = indexWeights(members, method);
  if (Object.keys(w).length === 0) return null;
  let total = 0;
  for (const m of members) {
    const c = changesPct[m.id] ?? 0;
    if (!fin(c) || c < -100) return null;
    total += w[m.id] * c;
  }
  return total;
}

/**
 * A price-weighted index level: sum of prices ÷ divisor. The divisor is
 * adjusted after splits and member changes so the level does not jump.
 */
export function priceWeightedLevel(prices: number[], divisor: number): number | null {
  if (!pos(divisor) || prices.some((p) => !nonNeg(p))) return null;
  return prices.reduce((a, b) => a + b, 0) / divisor;
}

/** New divisor after a split so that the index level is unchanged: new sum ÷ old level. */
export function divisorAfterSplit(prices: number[], divisor: number, index: number, ratio: number): number | null {
  const level = priceWeightedLevel(prices, divisor);
  if (level === null || level === 0 || !pos(ratio) || index < 0 || index >= prices.length) return null;
  const after = prices.map((p, i) => (i === index ? p / ratio : p));
  return after.reduce((a, b) => a + b, 0) / level;
}

/**
 * Cap any weight above `cap` (e.g. 0.25) and share the excess among the
 * others in proportion to their weights, repeating until none is above it.
 * A simplified version of what "modified" or "capped" indices do.
 *
 * Contract when the cap is IMPOSSIBLE (cap × members < 1, e.g. two members
 * at 35%): no set of weights can sum to 1 with every weight at or below the
 * cap, so the closest achievable result, equal weights, is returned, and
 * those equal weights are ABOVE the cap. Callers that need to know (the UI
 * says so to the learner) should use `capWeightsChecked`, which reports
 * `feasible: false` in that case.
 */
export function capWeights(weights: Record<string, number>, cap: number): Record<string, number> {
  const ids = Object.keys(weights);
  if (ids.length === 0 || !pos(cap) || cap >= 1) return { ...weights };
  if (cap * ids.length < 1) return Object.fromEntries(ids.map((id) => [id, 1 / ids.length]));
  const w: Record<string, number> = { ...weights };
  const capped = new Set<string>();
  for (let guard = 0; guard < ids.length + 1; guard++) {
    const over = ids.filter((id) => !capped.has(id) && w[id] > cap + 1e-12);
    if (over.length === 0) break;
    for (const id of over) capped.add(id);
    const free = ids.filter((id) => !capped.has(id));
    const freeSum = free.reduce((s, id) => s + w[id], 0);
    const room = 1 - cap * capped.size;
    for (const id of capped) w[id] = cap;
    for (const id of free) w[id] = freeSum > 0 ? (w[id] / freeSum) * room : room / free.length;
  }
  return w;
}

// ── Funds and futures ───────────────────────────────────────────────────────

/** Net asset value per unit: (holdings + cash − liabilities) ÷ units. */
export function navPerUnit(holdingsValue: number, cash: number, liabilities: number, units: number): number | null {
  if (!nonNeg(holdingsValue) || !fin(cash) || !nonNeg(liabilities) || !pos(units)) return null;
  return (holdingsValue + cash - liabilities) / units;
}

/** Premium (+) or discount (−) of an ETF's market price to its NAV, in %. */
export function premiumPct(marketPrice: number, nav: number): number | null {
  if (!pos(marketPrice) || !pos(nav)) return null;
  return ((marketPrice - nav) / nav) * 100;
}

/**
 * Total fees paid over `years` on a starting amount with NO growth assumed,
 * charged as `ratePct` per year of the remaining balance. Kept growth-free on
 * purpose: the lesson does not predict returns.
 */
export function feesOverYears(amount: number, ratePct: number, years: number): number | null {
  if (!nonNeg(amount) || !nonNeg(ratePct) || ratePct >= 100 || !nonNeg(years)) return null;
  return amount * (1 - (1 - ratePct / 100) ** years);
}

/** Tracking difference: fund return minus index return, in percentage points. */
export function trackingDifference(fundReturnPct: number, indexReturnPct: number): number | null {
  if (!fin(fundReturnPct) || !fin(indexReturnPct)) return null;
  return fundReturnPct - indexReturnPct;
}

export type FuturesPosition = { notional: number; leverage: number | null; pnl: number; pnlPctOfMargin: number | null };

/**
 * An index futures position.
 *   notional = index level × multiplier × contracts
 *   leverage = notional ÷ margin posted
 *   P&L      = points moved × multiplier × contracts (× −1 when short)
 */
export function futuresPosition(level: number, multiplier: number, contracts: number, margin: number, pointsMoved: number, direction: "long" | "short" = "long"): FuturesPosition | null {
  if (!pos(level) || !pos(multiplier) || !nonNeg(contracts) || !Number.isInteger(contracts) || !nonNeg(margin) || !fin(pointsMoved)) return null;
  const notional = level * multiplier * contracts;
  const pnl = pointsMoved * multiplier * contracts * (direction === "long" ? 1 : -1);
  return {
    notional,
    leverage: margin > 0 ? notional / margin : null,
    pnl,
    pnlPctOfMargin: margin > 0 ? (pnl / margin) * 100 : null,
  };
}

// ── Dividends and corporate actions ─────────────────────────────────────────

/** Dividend yield: yearly dividends per share ÷ share price × 100. */
export function dividendYield(annualDividend: number, price: number): number | null {
  if (!nonNeg(annualDividend) || !pos(price)) return null;
  return (annualDividend / price) * 100;
}

/** Theoretical opening price on the ex-dividend date: previous close − dividend (ignores everything else that day). */
export function exDividendPrice(close: number, dividend: number): number | null {
  if (!pos(close) || !nonNeg(dividend) || dividend >= close) return null;
  return close - dividend;
}

/**
 * A split of `ratio` new shares for every old one (2 = "2-for-1";
 * 0.1 = a 1-for-10 reverse split). Your total value does not change.
 */
export function applySplit(price: number, sharesHeld: number, ratio: number): { price: number; shares: number; value: number } | null {
  if (!pos(price) || !nonNeg(sharesHeld) || !pos(ratio)) return null;
  return { price: price / ratio, shares: sharesHeld * ratio, value: price * sharesHeld };
}

/** EPS before and after a buyback that cancels `sharesBought`, with profit unchanged. */
export function buybackEps(netProfit: number, shares: number, sharesBought: number): { before: number; after: number; changePct: number } | null {
  if (!fin(netProfit) || !pos(shares) || !nonNeg(sharesBought) || sharesBought >= shares) return null;
  const before = netProfit / shares;
  const after = netProfit / (shares - sharesBought);
  return { before, after, changePct: before === 0 ? 0 : ((after - before) / Math.abs(before)) * 100 };
}

export type CappedWeights = {
  weights: Record<string, number>;
  /** False when no weights can respect the cap (cap × members < 1); weights are then equal and above the cap. */
  feasible: boolean;
  /** Ids that started above the cap and were cut back to it (empty when infeasible or nothing was over it). */
  capped: string[];
};

/** `capWeights` plus whether the cap could actually be honoured and which members were cut. */
export function capWeightsChecked(weights: Record<string, number>, cap: number): CappedWeights {
  const ids = Object.keys(weights);
  const result = capWeights(weights, cap);
  const active = ids.length > 0 && pos(cap) && cap < 1;
  const feasible = !active || cap * ids.length >= 1;
  const capped = active && feasible ? ids.filter((id) => weights[id] > cap + 1e-12) : [];
  return { weights: result, feasible, capped };
}
