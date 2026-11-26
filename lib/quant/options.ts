/**
 * Option maths shared by the Academy (Advanced Trading Concepts) and the
 * Options module: the Black-Scholes(-Merton) price of a European option on a
 * non-dividend-paying asset, its Greeks, and expiry payoffs.
 *
 * Units, used everywhere in this file:
 *   spot, strike     price units
 *   years            time to expiry in years (days / 365)
 *   vol              annualised volatility as a decimal (0.25 = 25%)
 *   rate             continuously compounded risk-free rate as a decimal
 *
 * Greeks are returned in the units traders quote:
 *   delta   price change per 1.00 move in the underlying
 *   gamma   delta change per 1.00 move in the underlying
 *   vega    price change per 1 volatility point (0.01)
 *   theta   price change per calendar day (negative = decay)
 *   rho     price change per 1 rate point (0.01)
 *
 * The model assumes constant volatility and rates, no dividends, continuous
 * trading and log-normal prices. Real option prices differ from it; that is
 * a lesson in itself, not a bug.
 */

export type OptionKind = "call" | "put";

export type OptionInputs = {
  kind: OptionKind;
  spot: number;
  strike: number;
  years: number;
  vol: number;
  rate?: number;
};

export type Greeks = { delta: number; gamma: number; vega: number; theta: number; rho: number };

export type OptionValue = Greeks & {
  price: number;
  intrinsic: number;
  timeValue: number;
  /** Model probability that the option finishes in the money (N(d2) or N(−d2)). */
  probItm: number;
};

/** Standard normal density. */
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Standard normal cumulative distribution (Abramowitz & Stegun 7.1.26 via erf, error < 1.5e-7). */
export function normCdf(x: number): number {
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-z * z);
  return x >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

export function intrinsicValue(kind: OptionKind, spot: number, strike: number): number {
  return kind === "call" ? Math.max(0, spot - strike) : Math.max(0, strike - spot);
}

const valid = (i: OptionInputs) =>
  Number.isFinite(i.spot) && Number.isFinite(i.strike) && Number.isFinite(i.years) && Number.isFinite(i.vol) &&
  i.spot > 0 && i.strike > 0 && i.years >= 0 && i.vol >= 0;

/** Black-Scholes price and Greeks. Returns null for impossible inputs. */
export function blackScholes(i: OptionInputs): OptionValue | null {
  if (!valid(i)) return null;
  const { kind, spot: S, strike: K, years: T, vol: v } = i;
  const r = i.rate ?? 0;
  const intrinsic = intrinsicValue(kind, S, K);

  // At expiry, or with no volatility, the option is worth its (discounted) intrinsic value.
  if (T <= 1e-9 || v <= 1e-9) {
    const fwdIntrinsic = kind === "call" ? Math.max(0, S - K * Math.exp(-r * T)) : Math.max(0, K * Math.exp(-r * T) - S);
    const itm = kind === "call" ? S > K : S < K;
    return { price: fwdIntrinsic, intrinsic, timeValue: Math.max(0, fwdIntrinsic - intrinsic), delta: itm ? (kind === "call" ? 1 : -1) : 0, gamma: 0, vega: 0, theta: 0, rho: 0, probItm: itm ? 1 : 0 };
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * v * v) * T) / (v * sqrtT);
  const d2 = d1 - v * sqrtT;
  const disc = Math.exp(-r * T);
  const pdf = normPdf(d1);

  const price = kind === "call" ? S * normCdf(d1) - K * disc * normCdf(d2) : K * disc * normCdf(-d2) - S * normCdf(-d1);
  const delta = kind === "call" ? normCdf(d1) : normCdf(d1) - 1;
  const gamma = pdf / (S * v * sqrtT);
  const vega = (S * pdf * sqrtT) / 100;
  const thetaYear =
    kind === "call"
      ? -(S * pdf * v) / (2 * sqrtT) - r * K * disc * normCdf(d2)
      : -(S * pdf * v) / (2 * sqrtT) + r * K * disc * normCdf(-d2);
  const rho = kind === "call" ? (K * T * disc * normCdf(d2)) / 100 : (-K * T * disc * normCdf(-d2)) / 100;

  return {
    price: Math.max(0, price),
    intrinsic,
    timeValue: Math.max(0, price - intrinsic),
    delta,
    gamma,
    vega,
    theta: thetaYear / 365,
    rho,
    probItm: kind === "call" ? normCdf(d2) : normCdf(-d2),
  };
}

/** Profit or loss at expiry of one option bought (side "long") or sold ("short") for `premium`, per unit of underlying. */
export function payoffAtExpiry(kind: OptionKind, side: "long" | "short", strike: number, premium: number, spotAtExpiry: number): number {
  const v = intrinsicValue(kind, spotAtExpiry, strike) - premium;
  return side === "long" ? v : -v;
}

/** The underlying price at which a long or short option breaks even at expiry. */
export function breakeven(kind: OptionKind, strike: number, premium: number): number {
  return kind === "call" ? strike + premium : strike - premium;
}

/**
 * The volatility that makes the model price equal a given market price
 * (bisection). Null when no volatility between 0.1% and 500% fits, for
 * example when the price is below intrinsic value.
 */
export function impliedVol(i: Omit<OptionInputs, "vol">, marketPrice: number): number | null {
  if (!Number.isFinite(marketPrice) || marketPrice <= 0) return null;
  let lo = 0.001, hi = 5;
  const at = (v: number) => blackScholes({ ...i, vol: v })?.price ?? NaN;
  if (!(at(lo) <= marketPrice && at(hi) >= marketPrice)) return null;
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2;
    if (at(mid) < marketPrice) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * The one-standard-deviation expected move implied by a volatility over a
 * number of calendar days: spot × vol × √(days / 365). About two times in
 * three the price ends inside ± this amount, if the model's assumptions hold.
 */
export function expectedMove(spot: number, vol: number, days: number): number {
  if (!(spot > 0) || !(vol >= 0) || !(days >= 0)) return NaN;
  return spot * vol * Math.sqrt(days / 365);
}
