/**
 * Pure risk-management helpers for Track 8 (Risk Management), used by the
 * widgets in components/academy/widgets/risk-*.tsx and checked by
 * tests/risk.test.ts.
 *
 * Like lib/academy/calc.ts, every function is total: nonsense input returns
 * null instead of throwing, so a half-typed number can never crash a page.
 * These are textbook formulas for teaching. Brokers and exchanges add their
 * own rounding, fees, margin rules and liquidation procedures.
 */

import { LOT_UNITS, pipValue, type PipValue } from "./calc";
import { rng } from "./charts";

const fin = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const pos = (n: unknown): n is number => fin(n) && n > 0;
const nonNeg = (n: unknown): n is number => fin(n) && n >= 0;
const prob = (n: unknown): n is number => fin(n) && n >= 0 && n <= 1;

// ── Risk per trade ──────────────────────────────────────────────────────────

/** Money at risk on one trade: account × risk% ÷ 100. */
export function riskAmount(account: number, riskPct: number): number | null {
  if (!pos(account) || !pos(riskPct) || riskPct > 100) return null;
  return (account * riskPct) / 100;
}

/** Share of the account left after `n` losses in a row, each risking `riskPct` of the CURRENT account (fixed fractional): (1 − r)^n. */
export function equityAfterLosses(riskPct: number, n: number): number | null {
  if (!pos(riskPct) || riskPct >= 100 || !Number.isInteger(n) || n < 0) return null;
  return (1 - riskPct / 100) ** n;
}

/** How many losses in a row (fixed fractional) take the account down by at least `drawdownPct`: ceil(ln(1 − d) ÷ ln(1 − r)). */
export function lossesToDrawdown(riskPct: number, drawdownPct: number): number | null {
  if (!pos(riskPct) || riskPct >= 100 || !pos(drawdownPct) || drawdownPct >= 100) return null;
  return Math.ceil(Math.log(1 - drawdownPct / 100) / Math.log(1 - riskPct / 100) - 1e-9);
}

// ── Position sizing ─────────────────────────────────────────────────────────

export type StockSize = { shares: number; riskAmount: number; actualRisk: number; perShareRisk: number; notional: number; notionalPct: number };

/**
 * Shares to buy (or sell short) so that hitting the stop loses about risk% of the account:
 *   shares = floor(account × risk% ÷ |entry − stop|)
 * Rounded DOWN, because rounding up would risk more than planned.
 */
export function stockSize(account: number, riskPct: number, entry: number, stop: number): StockSize | null {
  const risk = riskAmount(account, riskPct);
  if (risk === null || !pos(entry) || !pos(stop) || entry === stop) return null;
  const perShareRisk = Math.abs(entry - stop);
  const shares = Math.floor(risk / perShareRisk + 1e-9);
  const notional = shares * entry;
  return { shares, riskAmount: risk, actualRisk: shares * perShareRisk, perShareRisk, notional, notionalPct: (notional / account) * 100 };
}

export type FxSize = { units: number; lots: number; riskAmount: number; actualRisk: number; pipValuePerUnit: number; pip: PipValue };

/**
 * FX position size for a stop `stopPips` away:
 *   units = account × risk% ÷ (stop pips × pip value per unit, in the account currency)
 * The pip value per unit depends on the pair (see calc.pipValue): account = quote
 * (EUR/USD, USD account), account = base (USD/JPY, USD account: divide by the rate),
 * or a cross (EUR/GBP, USD account: multiply by GBP/USD). Rounded down to micro lots.
 */
export function fxSize(i: { account: number; riskPct: number; stopPips: number; base: string; quote: string; rate: number; accountCcy: string; quoteToAccount?: number }): FxSize | null {
  const risk = riskAmount(i.account, i.riskPct);
  if (risk === null || !pos(i.stopPips)) return null;
  const pip = pipValue({ base: i.base, quote: i.quote, units: 1, rate: i.rate, account: i.accountCcy, quoteToAccount: i.quoteToAccount });
  if (!pip || !pos(pip.inAccount)) return null;
  const raw = risk / (i.stopPips * pip.inAccount);
  const units = Math.floor(raw / LOT_UNITS.micro + 1e-9) * LOT_UNITS.micro;
  return { units, lots: units / LOT_UNITS.standard, riskAmount: risk, actualRisk: units * i.stopPips * pip.inAccount, pipValuePerUnit: pip.inAccount, pip };
}

export type FuturesSize = { contracts: number; riskAmount: number; riskPerContract: number; actualRisk: number; tooSmall: boolean };

/**
 * Futures contracts for a stop `stopPoints` away, where one point is worth `pointValue`
 * (the contract multiplier, in the account currency):
 *   contracts = floor(account × risk% ÷ (stop points × point value))
 * Contracts are whole numbers; `tooSmall` is true when even one contract risks more than planned.
 */
export function futuresSize(account: number, riskPct: number, stopPoints: number, pointValue: number): FuturesSize | null {
  const risk = riskAmount(account, riskPct);
  if (risk === null || !pos(stopPoints) || !pos(pointValue)) return null;
  const riskPerContract = stopPoints * pointValue;
  const contracts = Math.floor(risk / riskPerContract + 1e-9);
  return { contracts, riskAmount: risk, riskPerContract, actualRisk: contracts * riskPerContract, tooSmall: contracts === 0 };
}

// ── Stops ───────────────────────────────────────────────────────────────────

/** ATR stop: entry − k × ATR for a long, entry + k × ATR for a short. */
export function atrStop(entry: number, atrValue: number, multiple: number, side: "long" | "short"): number | null {
  if (!pos(entry) || !pos(atrValue) || !pos(multiple)) return null;
  const s = side === "long" ? entry - multiple * atrValue : entry + multiple * atrValue;
  return s > 0 ? s : null;
}

/** Structure stop: just beyond the swing point that would invalidate the idea (below a swing low for a long, above a swing high for a short), by `buffer`. */
export function structureStop(swingPrice: number, buffer: number, side: "long" | "short"): number | null {
  if (!pos(swingPrice) || !nonNeg(buffer)) return null;
  const s = side === "long" ? swingPrice - buffer : swingPrice + buffer;
  return s > 0 ? s : null;
}

// ── Risk-reward and expectancy ──────────────────────────────────────────────

/** Reward-to-risk ratio: |target − entry| ÷ |entry − stop|. */
export function rewardRisk(entry: number, stop: number, target: number): number | null {
  if (!pos(entry) || !pos(stop) || !pos(target) || entry === stop) return null;
  return Math.abs(target - entry) / Math.abs(entry - stop);
}

export type Expectancy = { perTrade: number; inR: number | null; breakevenWinRate: number | null; profitFactor: number | null };

/**
 * Expectancy per trade = win rate × average win − loss rate × average loss.
 * In R (multiples of the average loss): p × (W ÷ L) − (1 − p).
 * Break-even win rate = L ÷ (W + L) = 1 ÷ (1 + W/L).
 * Profit factor = (p × W) ÷ ((1 − p) × L): gross wins ÷ gross losses.
 * winRate is a fraction from 0 to 1; average win and loss are positive amounts.
 */
export function expectancy(winRate: number, avgWin: number, avgLoss: number): Expectancy | null {
  if (!prob(winRate) || !nonNeg(avgWin) || !nonNeg(avgLoss)) return null;
  const perTrade = winRate * avgWin - (1 - winRate) * avgLoss;
  const inR = avgLoss > 0 ? perTrade / avgLoss : null;
  const breakevenWinRate = avgWin + avgLoss > 0 ? avgLoss / (avgWin + avgLoss) : null;
  const lossSum = (1 - winRate) * avgLoss;
  const profitFactor = lossSum > 0 ? (winRate * avgWin) / lossSum : null;
  return { perTrade, inR, breakevenWinRate, profitFactor };
}

/** Break-even win rate for a reward-to-risk ratio: 1 ÷ (1 + RR). */
export function breakevenWinRate(rr: number): number | null {
  return pos(rr) ? 1 / (1 + rr) : null;
}

// ── Drawdown and recovery ───────────────────────────────────────────────────

/** Gain needed to recover from a loss of `lossPct`%: x ÷ (1 − x), as a percentage. 100% loss: no recovery is possible (null). */
export function recoveryNeeded(lossPct: number): number | null {
  if (!nonNeg(lossPct) || lossPct >= 100) return null;
  const x = lossPct / 100;
  return (x / (1 - x)) * 100;
}

export type DrawdownStats = { maxDrawdownPct: number; peakIndex: number; troughIndex: number; series: number[] };

/** Drawdown at each point = (equity ÷ running peak − 1) × 100 (zero or negative). Max drawdown is the deepest, as a positive %. */
export function drawdowns(equity: readonly number[]): DrawdownStats | null {
  if (equity.length === 0 || !equity.every(nonNeg)) return null;
  let peak = equity[0], peakAt = 0, best = 0, bestPeak = 0, bestTrough = 0;
  const series: number[] = [];
  equity.forEach((e, i) => {
    if (e > peak) { peak = e; peakAt = i; }
    const dd = peak > 0 ? (e / peak - 1) * 100 : 0;
    series.push(dd);
    if (-dd > best) { best = -dd; bestPeak = peakAt; bestTrough = i; }
  });
  return { maxDrawdownPct: best, peakIndex: bestPeak, troughIndex: bestTrough, series };
}

/**
 * Probability of at least one run of `k` or more losses in a row within `n`
 * independent trades, each lost with probability `q`. Exact, by dynamic
 * programming over "current run length" (0 … k−1). Independence is an
 * assumption: real results can cluster.
 */
export function streakProbability(q: number, k: number, n: number): number | null {
  if (!prob(q) || !Number.isInteger(k) || k < 1 || !Number.isInteger(n) || n < 0) return null;
  if (k > n) return 0;
  let state = new Array<number>(k).fill(0);
  state[0] = 1;
  let hit = 0;
  for (let t = 0; t < n; t++) {
    const next = new Array<number>(k).fill(0);
    for (let r = 0; r < k; r++) {
      const p = state[r];
      if (p === 0) continue;
      next[0] += p * (1 - q);
      if (r + 1 >= k) hit += p * q;
      else next[r + 1] += p * q;
    }
    state = next;
  }
  return Math.min(1, Math.max(0, hit));
}

// ── Leverage and margin ─────────────────────────────────────────────────────

/** Effective leverage = total position notional ÷ account equity. */
export function effectiveLeverage(notional: number, equity: number): number | null {
  return nonNeg(notional) && pos(equity) ? notional / equity : null;
}

export type MarginPlan = {
  notional: number;
  usedMargin: number;
  effectiveLeverage: number;
  /** Price at which the margin level reaches the margin-call level (null: never on this side of zero). */
  callPrice: number | null;
  /** Price at which the margin level reaches the stop-out (liquidation) level. */
  stopOutPrice: number | null;
  /** Adverse move to stop-out as a % of the entry price. */
  stopOutMovePct: number | null;
};

/**
 * One position in an account whose currency is the quote currency.
 *   notional      = units × entry
 *   used margin   = notional ÷ allowed leverage
 *   equity(P)     = balance ± (P − entry) × units
 *   margin level  = equity ÷ used margin × 100
 * Setting margin level = L and solving for P:
 *   long:  P = entry − (balance − L% × used margin) ÷ units
 *   short: P = entry + (balance − L% × used margin) ÷ units
 * Brokers' call and stop-out levels differ; 100% and 50% are common examples only.
 */
export function marginPlan(i: { balance: number; units: number; entry: number; leverage: number; side: "long" | "short"; callLevel?: number; stopOutLevel?: number }): MarginPlan | null {
  const callLevel = i.callLevel ?? 100, stopOutLevel = i.stopOutLevel ?? 50;
  if (!pos(i.balance) || !pos(i.units) || !pos(i.entry) || !fin(i.leverage) || i.leverage < 1 || !nonNeg(callLevel) || !nonNeg(stopOutLevel)) return null;
  const notional = i.units * i.entry;
  const usedMargin = notional / i.leverage;
  const priceAt = (level: number): number | null => {
    const room = (i.balance - (level / 100) * usedMargin) / i.units;
    if (room <= 0) return i.entry; // already at or past that level
    const p = i.side === "long" ? i.entry - room : i.entry + room;
    return p > 0 ? p : null;
  };
  const callPrice = priceAt(callLevel);
  const stopOutPrice = priceAt(stopOutLevel);
  return {
    notional,
    usedMargin,
    effectiveLeverage: notional / i.balance,
    callPrice,
    stopOutPrice,
    stopOutMovePct: stopOutPrice === null ? null : (Math.abs(stopOutPrice - i.entry) / i.entry) * 100,
  };
}

/** Percentage move in the asset that changes equity by `equityMovePct`% at a given effective leverage: asset% = equity% ÷ leverage. */
export function moveForEquityChange(equityMovePct: number, leverage: number): number | null {
  return fin(equityMovePct) && pos(leverage) ? equityMovePct / leverage : null;
}

// ── Correlation and portfolio heat ──────────────────────────────────────────

/** Portfolio heat: the sum of the open risk of every position, in % of the account (the loss if every stop is hit). */
export function portfolioHeat(risksPct: readonly number[]): number | null {
  return risksPct.every(nonNeg) ? risksPct.reduce((a, b) => a + b, 0) : null;
}

/**
 * Combined risk of positions whose outcomes are correlated, treating each
 * position's risk as a standard deviation:  √(Σᵢ Σⱼ rᵢ rⱼ ρᵢⱼ).
 * With ρ = 1 everywhere this equals the simple sum (heat); with ρ = 0 it is √Σr².
 * `corr(i, j)` must return a value from −1 to 1 (1 on the diagonal).
 */
export function combinedRisk(risksPct: readonly number[], corr: (i: number, j: number) => number): number | null {
  if (!risksPct.every(nonNeg)) return null;
  let v = 0;
  for (let i = 0; i < risksPct.length; i++) for (let j = 0; j < risksPct.length; j++) {
    const rho = i === j ? 1 : corr(i, j);
    if (!fin(rho) || rho < -1 || rho > 1) return null;
    v += risksPct[i] * risksPct[j] * rho;
  }
  return Math.sqrt(Math.max(0, v));
}

/** Pearson correlation of two equal-length series. Null if either is constant or the lengths differ. */
export function correlation(a: readonly number[], b: readonly number[]): number | null {
  if (a.length !== b.length || a.length < 2 || !a.every(fin) || !b.every(fin)) return null;
  const n = a.length, ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) ** 2; sbb += (b[i] - mb) ** 2; }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : null;
}

// ── Gaps, slippage and daily loss limits ────────────────────────────────────

export type GapLoss = { fill: number; loss: number; plannedLoss: number; multipleOfPlan: number; slippage: number };

/**
 * Where a stop fills when the market opens beyond it, and what that costs.
 * A sell stop below a long fills at the stop, unless the bar OPENS below the stop,
 * in which case it fills at the open (or worse). Mirror image for a short.
 */
export function gapLoss(i: { entry: number; stop: number; open: number; units: number; side: "long" | "short"; extraSlippage?: number }): GapLoss | null {
  const extra = i.extraSlippage ?? 0;
  if (!pos(i.entry) || !pos(i.stop) || !pos(i.open) || !pos(i.units) || !nonNeg(extra)) return null;
  if (i.side === "long" ? i.stop >= i.entry : i.stop <= i.entry) return null;
  const gapped = i.side === "long" ? i.open < i.stop : i.open > i.stop;
  const base = gapped ? i.open : i.stop;
  const fill = i.side === "long" ? base - extra : base + extra;
  const loss = Math.abs(i.entry - fill) * i.units;
  const plannedLoss = Math.abs(i.entry - i.stop) * i.units;
  return { fill, loss, plannedLoss, multipleOfPlan: loss / plannedLoss, slippage: Math.abs(fill - i.stop) };
}

export type DailyLimitResult = { taken: number; stoppedAt: number | null; dayPnl: number; skipped: number };

/**
 * Applies a daily loss limit to a sequence of trade results (in money): trading
 * stops after the trade that takes the day's P&L to −limit or below.
 */
export function applyDailyLimit(results: readonly number[], limit: number): DailyLimitResult | null {
  if (!pos(limit) || !results.every(fin)) return null;
  let pnl = 0;
  for (let i = 0; i < results.length; i++) {
    pnl += results[i];
    if (pnl <= -limit) return { taken: i + 1, stoppedAt: i, dayPnl: pnl, skipped: results.length - i - 1 };
  }
  return { taken: results.length, stoppedAt: null, dayPnl: pnl, skipped: 0 };
}

// ── Averaging down ──────────────────────────────────────────────────────────

/** Volume-weighted average entry: Σ(price × quantity) ÷ Σ quantity. */
export function averagePrice(fills: readonly { price: number; qty: number }[]): number | null {
  if (fills.length === 0 || !fills.every((f) => pos(f.price) && pos(f.qty))) return null;
  const q = fills.reduce((s, f) => s + f.qty, 0);
  return fills.reduce((s, f) => s + f.price * f.qty, 0) / q;
}

export type AverageDownStep = { price: number; addQty: number; totalQty: number; avgPrice: number; openLoss: number; reboundToBreakevenPct: number };

/**
 * A long position that adds every time price falls a further `stepPct`% from the first entry.
 * "equal": the same quantity each time. "double": twice the previous add (a martingale).
 * Rebound to break even = (average price ÷ current price − 1) × 100.
 */
export function averagingDown(entry: number, qty: number, stepPct: number, adds: number, mode: "equal" | "double"): AverageDownStep[] | null {
  if (!pos(entry) || !pos(qty) || !pos(stepPct) || stepPct >= 100 || !Number.isInteger(adds) || adds < 0) return null;
  const out: AverageDownStep[] = [];
  const fills: { price: number; qty: number }[] = [];
  let add = qty;
  for (let k = 0; k <= adds; k++) {
    const price = entry * (1 - (stepPct / 100) * k);
    if (price <= 0) break;
    if (k > 0 && mode === "double") add *= 2;
    fills.push({ price, qty: add });
    const totalQty = fills.reduce((s, f) => s + f.qty, 0);
    const avg = averagePrice(fills)!;
    out.push({ price, addQty: add, totalQty, avgPrice: avg, openLoss: (avg - price) * totalQty, reboundToBreakevenPct: (avg / price - 1) * 100 });
  }
  return out;
}

// ── Risk of ruin and Monte Carlo ────────────────────────────────────────────

/**
 * Classic gambler's ruin for even-money bets of one fixed unit with win
 * probability p, starting with `units` units and no target:
 *   P(ruin) = ((1 − p) ÷ p)^units  if p > 0.5, otherwise 1.
 */
export function ruinEvenMoney(p: number, units: number): number | null {
  if (!prob(p) || !Number.isInteger(units) || units < 1) return null;
  return p <= 0.5 ? 1 : ((1 - p) / p) ** units;
}

/** Kelly fraction for a bet that wins `rr` times the stake with probability p: f* = p − (1 − p) ÷ rr. Can be negative (no edge: do not bet). */
export function kellyFraction(p: number, rr: number): number | null {
  return prob(p) && pos(rr) ? p - (1 - p) / rr : null;
}

export type MonteCarloInput = {
  seed: number;
  paths: number;
  trades: number;
  /** Win probability, 0–1. */
  winRate: number;
  /** Average win as a multiple of the amount risked (R). */
  rr: number;
  /** Risk per trade in % of the account. */
  riskPct: number;
  /** "fixed-fractional": risk% of CURRENT equity. "fixed-dollar": risk% of the STARTING equity, every trade. */
  mode: "fixed-fractional" | "fixed-dollar";
  start?: number;
  /** A path is "ruined" once equity falls to this % of the start or below (e.g. 50). */
  ruinPct?: number;
};

export type MonteCarloResult = {
  /** Equity after each trade for every path (index 0 = start). */
  paths: number[][];
  ruinShare: number;
  medianFinal: number;
  p5Final: number;
  p95Final: number;
  medianMaxDrawdownPct: number;
  worstMaxDrawdownPct: number;
};

function quantile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const pos_ = (sorted.length - 1) * q, lo = Math.floor(pos_), hi = Math.ceil(pos_);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos_ - lo);
}

/**
 * Seeded Monte Carlo of trade sequences. Each trade wins rr × risk or loses
 * 1 × risk. Fixed fractional risks a share of current equity; fixed dollar
 * risks the same money every time and can reach zero. Equity is floored at 0
 * and a path stops trading once it is at 0. Results are simulated, not a forecast.
 */
export function monteCarlo(i: MonteCarloInput): MonteCarloResult | null {
  const start = i.start ?? 10_000, ruinPct = i.ruinPct ?? 50;
  if (!Number.isInteger(i.paths) || i.paths < 1 || i.paths > 5000 || !Number.isInteger(i.trades) || i.trades < 1 || i.trades > 5000) return null;
  if (!prob(i.winRate) || !pos(i.rr) || !pos(i.riskPct) || i.riskPct > 100 || !pos(start) || !nonNeg(ruinPct) || ruinPct >= 100) return null;
  const rand = rng(i.seed);
  const r = i.riskPct / 100;
  const ruinLine = (start * ruinPct) / 100;
  const paths: number[][] = [];
  const finals: number[] = [];
  const dds: number[] = [];
  let ruined = 0;
  for (let p = 0; p < i.paths; p++) {
    let eq = start, peak = start, maxDd = 0, hitRuin = false;
    const path = [eq];
    for (let t = 0; t < i.trades; t++) {
      if (eq > 0) {
        const stake = i.mode === "fixed-fractional" ? eq * r : start * r;
        eq = rand() < i.winRate ? eq + stake * i.rr : Math.max(0, eq - stake);
      } else rand(); // keep the random stream aligned across paths
      if (eq > peak) peak = eq;
      maxDd = Math.max(maxDd, peak > 0 ? (1 - eq / peak) * 100 : 0);
      if (eq <= ruinLine) hitRuin = true;
      path.push(eq);
    }
    if (hitRuin) ruined++;
    paths.push(path);
    finals.push(eq);
    dds.push(maxDd);
  }
  finals.sort((a, b) => a - b);
  dds.sort((a, b) => a - b);
  return {
    paths,
    ruinShare: ruined / i.paths,
    medianFinal: quantile(finals, 0.5),
    p5Final: quantile(finals, 0.05),
    p95Final: quantile(finals, 0.95),
    medianMaxDrawdownPct: quantile(dds, 0.5),
    worstMaxDrawdownPct: dds[dds.length - 1],
  };
}
