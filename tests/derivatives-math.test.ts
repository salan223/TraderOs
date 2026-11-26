import { describe, expect, it } from "vitest";
import { blackScholes, breakeven, expectedMove, impliedVol, normCdf, payoffAtExpiry } from "@/lib/quant/options";
import { annualiseVol, buildChain, scamScore, stablecoinRun, toyHash, volAdjustedSize } from "@/lib/academy/crypto";
import { crackSpread321, goldSilverRatio, priceInCurrency, rollSimulation, stocksToUse } from "@/lib/academy/commodities";
import { betaAlpha, cagr, corr, correlatedReturns, futuresMarginPath, madeUpTrack, maxDrawdownPct, parametricVaR, portfolioVol, sharpeStandardError } from "@/lib/academy/advanced";

const close = (a: number, b: number, tol = 1e-3) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe("Black-Scholes", () => {
  it("matches the textbook example (S=100, K=100, T=1, σ=20%, r=5%)", () => {
    const c = blackScholes({ kind: "call", spot: 100, strike: 100, years: 1, vol: 0.2, rate: 0.05 })!;
    const p = blackScholes({ kind: "put", spot: 100, strike: 100, years: 1, vol: 0.2, rate: 0.05 })!;
    close(c.price, 10.4506, 1e-3);
    close(p.price, 5.5735, 1e-3);
    close(c.delta, 0.6368, 1e-3);
    close(p.delta, -0.3632, 1e-3);
    close(c.gamma, 0.01876, 1e-4);
    close(c.vega, 0.37524, 1e-3);
    close(c.theta, -6.414 / 365, 1e-4);
  });
  it("satisfies put-call parity", () => {
    for (const [S, K, T, v, r] of [[90, 100, 0.5, 0.3, 0.02], [120, 100, 0.1, 0.5, 0.04], [100, 80, 2, 0.15, 0]]) {
      const c = blackScholes({ kind: "call", spot: S, strike: K, years: T, vol: v, rate: r })!.price;
      const p = blackScholes({ kind: "put", spot: S, strike: K, years: T, vol: v, rate: r })!.price;
      close(c - p, S - K * Math.exp(-r * T), 1e-6);
    }
  });
  it("is worth intrinsic value at expiry and never negative", () => {
    expect(blackScholes({ kind: "call", spot: 110, strike: 100, years: 0, vol: 0.3 })!.price).toBe(10);
    expect(blackScholes({ kind: "put", spot: 110, strike: 100, years: 0, vol: 0.3 })!.price).toBe(0);
    expect(blackScholes({ kind: "call", spot: -1, strike: 100, years: 1, vol: 0.3 })).toBeNull();
  });
  it("recovers implied volatility from its own price", () => {
    const price = blackScholes({ kind: "call", spot: 100, strike: 105, years: 0.25, vol: 0.37, rate: 0.01 })!.price;
    close(impliedVol({ kind: "call", spot: 100, strike: 105, years: 0.25, rate: 0.01 }, price)!, 0.37, 1e-4);
    expect(impliedVol({ kind: "call", spot: 100, strike: 50, years: 0.25 }, 10)).toBeNull(); // below intrinsic
  });
  it("normal CDF is accurate", () => {
    close(normCdf(0), 0.5, 1e-7);
    close(normCdf(1.6449), 0.95, 1e-4);
    close(normCdf(-1.96), 0.025, 1e-4);
  });
  it("payoffs, breakevens and the expected move", () => {
    expect(payoffAtExpiry("call", "long", 100, 5, 120)).toBe(15);
    expect(payoffAtExpiry("put", "long", 100, 5, 120)).toBe(-5);
    expect(payoffAtExpiry("put", "short", 100, 5, 90)).toBe(-5);
    expect(breakeven("call", 100, 5)).toBe(105);
    expect(breakeven("put", 100, 5)).toBe(95);
    close(expectedMove(100, 0.365, 365), 36.5, 1e-9);
  });
});

describe("crypto maths", () => {
  it("toy hash is deterministic and changes with the input", () => {
    expect(toyHash("abc")).toBe(toyHash("abc"));
    expect(toyHash("abc")).not.toBe(toyHash("abd"));
    expect(toyHash("abc")).toMatch(/^[0-9a-f]{8}$/);
  });
  it("editing a block breaks every later link", () => {
    const orig = ["a", "b", "c", "d"];
    expect(buildChain(orig, orig).every((b) => b.valid)).toBe(true);
    const tampered = buildChain(orig, ["a", "X", "c", "d"]);
    expect(tampered.map((b) => b.valid)).toEqual([true, true, false, false]);
  });
  it("annualises volatility with the square root of trading days", () => {
    close(annualiseVol(4, 365), 76.42, 0.01);
    close(annualiseVol(1, 252), 15.87, 0.01);
    expect(volAdjustedSize(10_000, 1, 50_000, 4, 2)).toBeCloseTo(0.025, 6);
  });
  it("a fully cash-backed coin survives a run; a thin one does not", () => {
    expect(stablecoinRun({ cashPct: 100, billsPct: 0, riskyPct: 0, reserveRatio: 1, redeemPct: 60 })!.pegHolds).toBe(true);
    expect(stablecoinRun({ cashPct: 10, billsPct: 20, riskyPct: 70, reserveRatio: 1, redeemPct: 60 })!.pegHolds).toBe(false);
  });
  it("a seed-phrase request alone maxes the scam score", () => {
    expect(scamScore(["seed"])).toBe(100);
    expect(scamScore([])).toBe(0);
  });
});

describe("commodity maths", () => {
  it("3-2-1 crack spread", () => close(crackSpread321(80, 2.5, 3), 32, 1e-9));
  it("ratios and conversions", () => {
    close(goldSilverRatio(2000, 25), 80, 1e-9);
    close(stocksToUse(150, 1000), 15, 1e-9);
    close(priceInCurrency(80, 0.9), 72, 1e-9);
  });
  it("rolling in steady 2%-a-month contango loses about 21% a year with a flat spot price", () => {
    const r = rollSimulation({ months: 12, startSpot: 80, spotDriftPct: 0, curvePct: 2 })!;
    close(r.spotReturnPct, 0, 1e-9);
    close(r.heldReturnPct, (1 / 1.02 ** 12 - 1) * 100, 1e-6);
    expect(r.heldReturnPct).toBeLessThan(-20);
    // Backwardation adds return instead.
    expect(rollSimulation({ months: 12, startSpot: 80, spotDriftPct: 0, curvePct: -1 })!.heldReturnPct).toBeGreaterThan(0);
  });
});

describe("advanced maths", () => {
  it("generated returns have roughly the requested correlation", () => {
    const { a, b } = correlatedReturns(5000, 0.6, 1, 2, 7);
    close(corr(a, b), 0.6, 0.05);
  });
  it("portfolio volatility: perfect correlation adds up, zero correlation diversifies", () => {
    close(portfolioVol([0.5, 0.5], [20, 20], () => 1), 20, 1e-9);
    close(portfolioVol([0.5, 0.5], [20, 20], () => 0), 14.142, 1e-3);
    close(portfolioVol([0.5, 0.5], [20, 20], () => -1), 0, 1e-9);
  });
  it("parametric VaR and expected shortfall", () => {
    const v = parametricVaR(1_000_000, 1, 95)!;
    close(v.varAmount, 16449, 1);
    close(v.esAmount, 20627, 2);
  });
  it("futures margin calls top up to initial margin", () => {
    const r = futuresMarginPath({ prices: [100, 98, 95, 96], contracts: 1, multiplier: 100, side: "long", initialMargin: 1000, maintenanceMargin: 800 })!;
    // Day 1: −200 → 800 (not below). Day 2: −300 → 500 < 800, top up 500. Day 3: +100 → 1100.
    expect(r.calls).toBe(1);
    expect(r.totalTopUp).toBe(500);
    expect(r.days[3].balance).toBe(1100);
  });
  it("performance statistics", () => {
    close(cagr(100, 200, 10), 7.177, 1e-3);
    close(maxDrawdownPct([100, 120, 90, 130, 117]), -25, 1e-9);
    close(sharpeStandardError(1, 4), Math.sqrt(1.5 / 4), 1e-9);
    const t = madeUpTrack(240, 0.5, 0.8, 0.5, 3);
    const ba = betaAlpha(t.strategy, t.bench, 12)!;
    close(ba.beta, 0.8, 0.05);
  });
});
