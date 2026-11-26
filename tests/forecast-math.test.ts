import { describe, expect, it } from "vitest";
import { histVolAt, logReturns, regressionAt, signalAt, smaAt, testBands, testDirection, volBands } from "@/lib/quant/forecast";
import { rng } from "@/lib/academy/charts";

const close = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

/** A made-up random-walk price path with a given daily volatility and drift. */
function walk(n: number, dailyVol: number, drift: number, seed: number): number[] {
  const r = rng(seed);
  const out = [100];
  for (let i = 1; i < n; i++) {
    const u = Math.max(1e-12, r()), v = r();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    out.push(out[i - 1] * Math.exp(drift + dailyVol * z));
  }
  return out;
}

describe("forecast maths", () => {
  it("moving averages and returns", () => {
    close(smaAt([1, 2, 3, 4, 5], 3, 4), 4);
    expect(Number.isNaN(smaAt([1, 2], 3, 1))).toBe(true);
    close(logReturns([100, 110])[0], Math.log(1.1));
  });
  it("historical volatility recovers the volatility of a random walk", () => {
    const p = walk(3000, 0.01, 0, 4);
    close(histVolAt(p, 2999, 2500), 0.01 * Math.sqrt(252), 0.01);
  });
  it("a straight exponential trend is fitted exactly", () => {
    const p = Array.from({ length: 100 }, (_, k) => 50 * Math.exp(0.002 * k));
    const r = regressionAt(p, 99, 60, 10)!;
    close(r.slopePerDay, 0.002, 1e-9);
    close(r.projected, 50 * Math.exp(0.002 * 109), 1e-6);
    close(r.residualSd, 0, 1e-9);
  });
  it("volatility bands widen with the square root of time", () => {
    const a = volBands(100, 0.2, 63);
    close(a.sigmaMove, 0.2 * Math.sqrt(63 / 252), 1e-12);
    expect(a.hi2).toBeGreaterThan(a.hi1);
    expect(volBands(100, 0.2, 252).sigmaMove).toBeCloseTo(2 * volBands(100, 0.2, 63).sigmaMove, 12);
  });
  it("signals point the right way on a clear uptrend", () => {
    const p = Array.from({ length: 400 }, (_, k) => 100 * Math.exp(0.001 * k));
    for (const m of ["ma-cross", "price-vs-ma", "momentum", "regression"] as const) expect(signalAt(m, p, 399)).toBe(1);
    expect(signalAt("ma-cross", p, 100)).toBe(0); // not enough data for a 200-day average
  });
  it("on a driftless random walk, no method shows a real edge over the baseline", () => {
    const p = walk(5000, 0.012, 0, 9);
    for (const m of ["ma-cross", "price-vs-ma", "momentum", "regression"] as const) {
      const t = testDirection(m, p, 20, 5);
      expect(t.windows).toBeGreaterThan(500);
      expect(Math.abs(t.edge)).toBeLessThan(0.1);
    }
  });
  it("volatility bands catch about 68% (1σ) and 95% (2σ) of outcomes when the model is true", () => {
    const p = walk(6000, 0.01, 0, 2);
    const b = testBands(p, 20, 60);
    close(b.inside1, 0.68, 0.06);
    close(b.inside2, 0.95, 0.04);
  });
});

import { barsForDays, firstTouch, niceStep, optionChain, scenarioStart, strikeLadder } from "@/lib/quant/options-sim";

describe("options simulator helpers", () => {
  it("strike spacing is a round number about 2.5% of the price", () => {
    expect(niceStep(2.4)).toBe(2.5);
    expect(niceStep(11)).toBe(10);
    expect(niceStep(0.027)).toBeCloseTo(0.025, 10);
    const s = strikeLadder(431.7);
    expect(s).toHaveLength(9);
    expect(s[4]).toBe(430);
    expect(s[1] - s[0]).toBe(10);
  });
  it("calendar days map to trading bars", () => {
    expect(barsForDays(30, 252)).toBe(21);
    expect(barsForDays(30, 365)).toBe(30);
    expect(barsForDays(1, 252)).toBe(1);
  });
  it("chains: calls cheaper at higher strikes, puts dearer", () => {
    const c = optionChain(100, 0.25, 30 / 365);
    for (let k = 1; k < c.length; k++) {
      expect(c[k].call).toBeLessThan(c[k - 1].call);
      expect(c[k].put).toBeGreaterThan(c[k - 1].put);
    }
  });
  it("scenario start leaves room before and after, and is repeatable", () => {
    const i = scenarioStart(5000, 7);
    expect(i).toBeGreaterThanOrEqual(260);
    expect(i).toBeLessThanOrEqual(5000 - 1 - 70);
    expect(scenarioStart(5000, 7)).toBe(i);
  });
  it("finds the first day a target is touched", () => {
    const bars = [{ h: 10, l: 9 }, { h: 10.5, l: 9.8 }, { h: 11.2, l: 10.1 }, { h: 12, l: 11 }];
    expect(firstTouch(bars, 0, 3, 11, 10)).toBe(2);
    expect(firstTouch(bars, 0, 3, 13, 10)).toBeNull();
    expect(firstTouch(bars, 0, 3, 9.5, 10)).toBeNull();
  });
});
