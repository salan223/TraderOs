/**
 * Pure maths for Track 14 (Advanced Trading Concepts) widgets: correlated
 * made-up returns, portfolio volatility, parametric VaR and expected
 * shortfall, futures margin paths and performance statistics. Every series is
 * generated from a seed; none is real market data.
 */
import { rng } from "./charts";

/** A standard normal draw from a uniform generator (Box-Muller). */
function gauss(r: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Two series of made-up daily returns (in %) with true correlation `rho`. */
export function correlatedReturns(n: number, rho: number, volA: number, volB: number, seed: number): { a: number[]; b: number[] } {
  const r = rng(seed);
  const a: number[] = [], b: number[] = [];
  const c = Math.max(-1, Math.min(1, rho));
  for (let i = 0; i < n; i++) {
    const z1 = gauss(r), z2 = gauss(r);
    a.push(volA * z1);
    b.push(volB * (c * z1 + Math.sqrt(1 - c * c) * z2));
  }
  return { a, b };
}

export function mean(xs: readonly number[]): number {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : NaN;
}

export function stdev(xs: readonly number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

/** Sample (Pearson) correlation. */
export function corr(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 3) return NaN;
  const ma = mean(a.slice(0, n)), mb = mean(b.slice(0, n));
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) {
    sab += (a[i] - ma) * (b[i] - mb);
    saa += (a[i] - ma) ** 2;
    sbb += (b[i] - mb) ** 2;
  }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : NaN;
}

/**
 * Volatility of a portfolio (same units as the inputs, e.g. % a year).
 * σp² = Σ wᵢ² σᵢ² + Σ_{i≠j} wᵢ wⱼ σᵢ σⱼ ρᵢⱼ. Weights are fractions (they need not sum to 1).
 */
export function portfolioVol(weights: readonly number[], vols: readonly number[], rho: (i: number, j: number) => number): number {
  const n = weights.length;
  if (n === 0 || vols.length !== n) return NaN;
  let v = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) v += weights[i] * weights[j] * vols[i] * vols[j] * (i === j ? 1 : rho(i, j));
  return Math.sqrt(Math.max(0, v));
}

/** z-scores for common one-sided confidence levels. */
export const Z: Readonly<Record<number, number>> = { 90: 1.2816, 95: 1.6449, 99: 2.3263 };

/**
 * Parametric (normal) one-day Value at Risk and Expected Shortfall in money,
 * as positive numbers, assuming a zero mean.
 * VaR = z × σ × value;  ES = φ(z) / (1 − c) × σ × value.
 */
export function parametricVaR(value: number, dailyVolPct: number, confidence: 90 | 95 | 99): { varAmount: number; esAmount: number } | null {
  if (!(value > 0) || !(dailyVolPct >= 0)) return null;
  const z = Z[confidence];
  const sigma = (dailyVolPct / 100) * value;
  const phi = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  return { varAmount: z * sigma, esAmount: (phi / (1 - confidence / 100)) * sigma };
}

export type MarginDay = { day: number; price: number; pnl: number; balance: number; call: boolean; topUp: number };

/**
 * Daily mark-to-market of a futures position. When the balance falls below
 * maintenance margin, a margin call asks for enough to get back to initial
 * margin (topped up at once in this model).
 */
export function futuresMarginPath(i: { prices: readonly number[]; contracts: number; multiplier: number; side: "long" | "short"; initialMargin: number; maintenanceMargin: number }): { days: MarginDay[]; totalTopUp: number; calls: number } | null {
  const { prices, contracts, multiplier, side, initialMargin, maintenanceMargin } = i;
  if (prices.length < 2 || !(contracts > 0) || !(multiplier > 0) || !(initialMargin > 0) || !(maintenanceMargin > 0) || maintenanceMargin > initialMargin) return null;
  const dir = side === "long" ? 1 : -1;
  const im = initialMargin * contracts, mm = maintenanceMargin * contracts;
  let balance = im;
  let totalTopUp = 0, calls = 0;
  const days: MarginDay[] = [{ day: 0, price: prices[0], pnl: 0, balance, call: false, topUp: 0 }];
  for (let d = 1; d < prices.length; d++) {
    const pnl = dir * (prices[d] - prices[d - 1]) * contracts * multiplier;
    balance += pnl;
    let topUp = 0;
    const call = balance < mm;
    if (call) {
      topUp = im - balance;
      totalTopUp += topUp;
      calls++;
      balance = im;
    }
    days.push({ day: d, price: prices[d], pnl, balance, call, topUp });
  }
  return { days, totalTopUp, calls };
}

/** Compound annual growth rate in % from a start and end value over a number of years. */
export function cagr(start: number, end: number, years: number): number {
  if (!(start > 0) || !(end > 0) || !(years > 0)) return NaN;
  return ((end / start) ** (1 / years) - 1) * 100;
}

/** Annualised Sharpe ratio from periodic returns in %, risk-free rate per period in %. */
export function sharpe(returnsPct: readonly number[], periodsPerYear: number, rfPerPeriodPct = 0): number {
  const ex = returnsPct.map((r) => r - rfPerPeriodPct);
  const s = stdev(ex);
  return s > 0 ? (mean(ex) / s) * Math.sqrt(periodsPerYear) : NaN;
}

/**
 * Approximate standard error of an annualised Sharpe ratio estimated from
 * `years` of data, for independent normal returns (Lo 2002): √((1 + SR²/2) / years).
 */
export function sharpeStandardError(sr: number, years: number): number {
  if (!Number.isFinite(sr) || !(years > 0)) return NaN;
  return Math.sqrt((1 + (sr * sr) / 2) / years);
}

/** Largest peak-to-trough fall of an equity curve, in %. */
export function maxDrawdownPct(equity: readonly number[]): number {
  let peak = -Infinity, worst = 0;
  for (const v of equity) {
    peak = Math.max(peak, v);
    if (peak > 0) worst = Math.min(worst, (v - peak) / peak);
  }
  return worst * 100;
}

/** Beta and annualised alpha (in %) of returns against a benchmark, both in % per period. */
export function betaAlpha(returnsPct: readonly number[], benchPct: readonly number[], periodsPerYear: number): { beta: number; alphaPct: number } | null {
  const n = Math.min(returnsPct.length, benchPct.length);
  if (n < 3) return null;
  const mr = mean(returnsPct.slice(0, n)), mb = mean(benchPct.slice(0, n));
  let cov = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    cov += (returnsPct[i] - mr) * (benchPct[i] - mb);
    vb += (benchPct[i] - mb) ** 2;
  }
  if (!(vb > 0)) return null;
  const beta = cov / vb;
  return { beta, alphaPct: (mr - beta * mb) * periodsPerYear };
}

/** Equity curve from periodic returns in %, starting at `start`. */
export function equityFromReturns(returnsPct: readonly number[], start = 100): number[] {
  const out = [start];
  for (const r of returnsPct) out.push(out[out.length - 1] * (1 + r / 100));
  return out;
}

/** Made-up monthly strategy and benchmark returns with a chosen true edge (alpha, % a month), beta and noise. */
export function madeUpTrack(months: number, alphaPctPerMonth: number, beta: number, noisePct: number, seed: number): { strategy: number[]; bench: number[] } {
  const r = rng(seed);
  const bench: number[] = [], strategy: number[] = [];
  for (let i = 0; i < months; i++) {
    const m = 0.6 + 4 * gauss(r);
    bench.push(m);
    strategy.push(alphaPctPerMonth + beta * m + noisePct * gauss(r));
  }
  return { strategy, bench };
}
