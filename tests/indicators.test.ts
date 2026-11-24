import { describe, expect, it } from "vitest";
import { simulateSeries, sma, type Bar } from "@/lib/academy/charts";
import {
  FIB_RATIOS, adLine, alignedCorrelation, bestInSample, bollinger, buyHoldPct, classifyTriangle, crossoverBacktest, crossovers, divergences,
  fibCoverage, fibLevels, findPatterns, lineThrough, macd, median, nearFibShare, obv, outsideBands, overfitExperiment, parameterSweep,
  rateOfChange, reachedMirror, reachedTarget, regressionChannel, retracementRatios, rollingStdev, rsi, smaLag, stochastic, sweepGrid, timeframeStates,
  trendlineTest, typicalPrice, vwap,
} from "@/lib/academy/indicators";

const close = (a: number | null | undefined, b: number, eps = 1e-9) => {
  expect(a).not.toBeNull();
  expect(Math.abs((a as number) - b)).toBeLessThan(eps);
};
const bar = (t: number, o: number, h: number, l: number, c: number, v = 100): Bar => ({ t, o, h, l, c, v });
const fromCloses = (cs: number[]) => cs.map((c, i) => bar(i, c, c + 0.5, c - 0.5, c));

describe("moving averages and crossovers", () => {
  it("finds up and down crosses only where the order flips", () => {
    const fast = [null, 1, 2, 3, 2, 1, 1];
    const slow = [null, 2, 2, 2, 2, 2, 1];
    expect(crossovers(fast, slow)).toEqual([{ index: 3, dir: "up" }, { index: 5, dir: "down" }]);
  });
  it("SMA lag is (n − 1) ÷ 2 bars: on a straight line the SMA trails price by that much", () => {
    expect(smaLag(21)).toBe(10);
    const line = Array.from({ length: 40 }, (_, i) => i);
    close(line[39] - sma(line, 21)[39]!, 10);
  });
});

describe("RSI (Wilder)", () => {
  it("matches a hand calculation", () => {
    // changes +1 +1 −1 +1; n = 2: first averages 1 and 0 → 100; then 0.5/0.5 → 50; then 0.75/0.25 → 75
    const r = rsi([1, 2, 3, 2, 3], 2);
    expect(r.slice(0, 2)).toEqual([null, null]);
    close(r[2], 100); close(r[3], 50); close(r[4], 75);
  });
  it("is 50 when nothing moves, stays in 0–100 and is 0 after only falls", () => {
    expect(rsi([5, 5, 5, 5], 2)[3]).toBe(50);
    close(rsi([5, 4, 3, 2], 2)[3], 0);
    const { bars } = simulateSeries({ seed: 3, bars: 300 });
    for (const v of rsi(bars.map((b) => b.c), 14)) if (v !== null) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(100); }
  });
});

describe("MACD", () => {
  it("is fast EMA − slow EMA; histogram = MACD − signal; zero on a flat series", () => {
    const flat = Array(60).fill(10);
    const m = macd(flat);
    close(m.macd[59], 0); close(m.signal[59], 0); close(m.hist[59], 0);
    expect(m.macd[24]).toBeNull();
    expect(m.macd[25]).not.toBeNull();
    expect(m.signal[25 + 7]).toBeNull();
    expect(m.signal[25 + 8]).not.toBeNull();
  });
  it("is positive in a steady rise (the fast average is nearer the price)", () => {
    const up = Array.from({ length: 80 }, (_, i) => 100 + i);
    const m = macd(up);
    expect(m.macd[79]!).toBeGreaterThan(0);
    close(m.hist[79]!, m.macd[79]! - m.signal[79]!);
  });
});

describe("stochastic", () => {
  it("raw %K is where the close sits in the n-bar range", () => {
    const bars = [bar(0, 5, 10, 0, 5), bar(1, 5, 8, 2, 8), bar(2, 8, 9, 4, 4)];
    const s = stochastic(bars, 3, 1, 1);
    close(s.k[2], 40); // (4 − 0) ÷ (10 − 0)
    expect(s.k[1]).toBeNull();
  });
  it("is 50 when the range is zero, and %D smooths %K", () => {
    const flat = Array.from({ length: 10 }, (_, i) => bar(i, 1, 1, 1, 1));
    expect(stochastic(flat, 3, 1, 1).k[5]).toBe(50);
    const { bars } = simulateSeries({ seed: 9, bars: 100 });
    const s = stochastic(bars);
    const i = 60;
    close(s.d[i], (s.k[i]! + s.k[i - 1]! + s.k[i - 2]!) / 3);
  });
});

describe("Bollinger Bands", () => {
  it("are SMA ± k population standard deviations", () => {
    const xs = [2, 4, 4, 4, 5, 5, 7, 9]; // mean 5, population sd 2
    close(rollingStdev(xs, 8)[7], 2);
    const b = bollinger(xs, 8, 2);
    close(b.mid[7], 5); close(b.upper[7], 9); close(b.lower[7], 1);
    close(b.width[7], 8 / 5);
    close(b.pctB[7], (9 - 1) / 8);
  });
  it("a minority of closes fall outside 2-sd bands on a random walk (not a fixed 5%)", () => {
    const { bars } = simulateSeries({ seed: 4, bars: 2000, regimes: false });
    const cs = bars.map((b) => b.c);
    const share = outsideBands(cs, bollinger(cs, 20, 2));
    expect(share).toBeGreaterThan(0.02);
    expect(share).toBeLessThan(0.2);
  });
});

describe("volume indicators", () => {
  it("VWAP weights typical price by volume and resets each session", () => {
    const bars = [bar(0, 10, 12, 9, 12, 100), bar(1, 12, 13, 11, 12, 300), bar(2, 20, 21, 19, 20, 50)];
    close(typicalPrice(bars[0]), 11);
    const v = vwap(bars, 2);
    close(v[0], 11);
    close(v[1], (11 * 100 + 12 * 300) / 400);
    close(v[2], 20); // new session
  });
  it("OBV adds volume on up closes and subtracts it on down closes", () => {
    const bars = [bar(0, 1, 1, 1, 10, 5), bar(1, 1, 1, 1, 11, 7), bar(2, 1, 1, 1, 9, 3), bar(3, 1, 1, 1, 9, 4)];
    expect(obv(bars)).toEqual([0, 7, 4, 4]);
  });
  it("A/D uses where the close sits in the bar", () => {
    const bars = [bar(0, 0, 10, 0, 10, 100), bar(1, 0, 10, 0, 0, 50), bar(2, 0, 10, 0, 5, 80)];
    expect(adLine(bars)).toEqual([100, 50, 50]);
  });
});

describe("divergence", () => {
  it("flags a higher price high with a lower indicator high as bearish", () => {
    const cs = [10, 11, 12, 15, 12, 11, 10, 11, 12, 16, 12, 11, 10];
    const bars = fromCloses(cs);
    const ind = cs.map((_, i) => (i === 3 ? 80 : i === 9 ? 65 : 50));
    const d = divergences(bars, ind, 2);
    expect(d).toContainEqual({ kind: "bearish", a: 3, b: 9 });
    // the same price swings with a rising indicator: no divergence
    const ind2 = cs.map((_, i) => (i === 3 ? 60 : i === 9 ? 70 : 50));
    expect(divergences(bars, ind2, 2).filter((x) => x.kind === "bearish")).toEqual([]);
  });
});

describe("trendlines and channels", () => {
  it("a line through two points extends linearly", () => {
    const L = lineThrough(2, 10, 6, 14);
    close(L.slope, 1); close(L.at(10), 18);
  });
  it("counts touches and the first close through a support line", () => {
    const L = lineThrough(0, 10, 10, 20);
    const bars = Array.from({ length: 12 }, (_, i) => bar(i, 12 + i, 14 + i, i === 5 ? 15 : 12 + i, 13 + i));
    bars[8] = bar(8, 18, 19, 15, 15); // closes 3 below the line (18)
    const t = trendlineTest(bars, L, "support", 0, 0.2);
    expect(t.touches).toEqual([5]);
    expect(t.breakAt).toBe(8);
  });
  it("a regression channel on a perfect line has zero width and r² = 1", () => {
    const cs = Array.from({ length: 20 }, (_, i) => 50 + 2 * i);
    const ch = regressionChannel(cs, 5, 15);
    close(ch.sd, 0); close(ch.r2, 1); close(ch.mid.at(10), 70); close(ch.mid.slope, 2);
  });
});

describe("chart patterns", () => {
  it("finds a double top, its neckline, measured-move target and confirmation", () => {
    const cs = [10, 12, 14, 16, 20, 16, 14, 13, 14, 16, 20.1, 16, 14, 12, 10, 9, 8, 7, 6, 5.5, 5.5, 5.5];
    const bars = cs.map((c, i) => bar(i, c, c, c, c));
    const hit = findPatterns(bars, 2, 1).find((p) => p.kind === "double-top")!;
    expect(hit.points).toEqual([4, 7, 10]);
    close(hit.neckline, 13);
    close(hit.target, 13 - (20.1 - 13));
    expect(hit.confirmedAt).toBe(13);
    expect(reachedTarget(bars, hit, 6)).toBe(true);
    // the mirror target (close 12 + (12 − 5.9) = 18.1) was never reached after confirmation
    expect(reachedMirror(bars, hit, 6)).toBe(false);
    expect(reachedTarget(bars, hit, 60)).toBeNull();
  });
  it("finds a head and shoulders with the head above both shoulders", () => {
    const cs = [10, 13, 15, 13, 11, 14, 18, 14, 11.5, 13, 15.1, 13, 10, 9, 8, 8, 8];
    const bars = cs.map((c, i) => bar(i, c, c, c, c));
    const hit = findPatterns(bars, 2, 1.5).find((p) => p.kind === "head-and-shoulders")!;
    expect(hit.points).toEqual([2, 4, 6, 8, 10]);
    close(hit.neckline, 11);
    close(hit.target, 11 - 7);
    expect(hit.confirmedAt).toBe(12);
  });
  it("classifies triangles by the slopes of their boundary lines", () => {
    expect(classifyTriangle(0, 0.5, 0.05)).toBe("ascending");
    expect(classifyTriangle(-0.5, 0, 0.05)).toBe("descending");
    expect(classifyTriangle(-0.4, 0.4, 0.05)).toBe("symmetrical");
    expect(classifyTriangle(0.3, -0.3, 0.05)).toBe("expanding");
    expect(classifyTriangle(0.3, 0.3, 0.05)).toBe("channel");
  });
});

describe("Fibonacci", () => {
  it("retracement levels of a move", () => {
    const lv = fibLevels(100, 200);
    expect(lv.map((x) => x.ratio)).toEqual([...FIB_RATIOS]);
    close(lv[3].price, 200 - 61.8);
    close(lv[2].price, 150);
  });
  it("±3% around the five usual ratios covers 30% of all possible retracements", () => {
    close(fibCoverage(0.03), 0.3);
    close(fibCoverage(0.05), 0.5);
    close(fibCoverage(0), 0);
    expect(fibCoverage(0.2)).toBeLessThanOrEqual(1);
  });
  it("retracement ratios come from consecutive swing legs", () => {
    const sw = [{ index: 0, price: 100, kind: "low" as const }, { index: 5, price: 200, kind: "high" as const }, { index: 9, price: 150, kind: "low" as const }];
    expect(retracementRatios(sw)).toEqual([0.5]);
    expect(nearFibShare([0.5, 0.7, 0.61], 0.02)).toBeCloseTo(2 / 3);
    expect(nearFibShare([0.5, 0.7, 0.61], 0.02, [0.7])).toBeCloseTo(1 / 3);
  });
});

describe("multi-timeframe and redundancy", () => {
  it("higher-timeframe state only uses closed higher bars", () => {
    const { bars } = simulateSeries({ seed: 5, bars: 120 });
    const s = timeframeStates(bars, 4, 5);
    // bars 0..22 cannot see a closed 5-bar SMA on the 4× series (needs 5 closed higher bars = 20 base bars)
    expect(s.higher.slice(0, 19).every((x) => x === null)).toBe(true);
    expect(s.higher[19]).not.toBeNull();
    expect(s.aligned).toBeGreaterThan(0);
    expect(s.aligned).toBeLessThanOrEqual(1);
  });
  it("RSI and rate of change move together: two momentum readings of the same closes", () => {
    const { bars } = simulateSeries({ seed: 2, bars: 600 });
    const cs = bars.map((b) => b.c);
    expect(alignedCorrelation(rsi(cs, 14), rateOfChange(cs, 14))!).toBeGreaterThan(0.7);
    close(alignedCorrelation([1, 2, 3, null], [2, 4, 6, 1]), 1);
    expect(alignedCorrelation([1, null], [1, 2])).toBeNull();
  });
});

describe("backtests and overfitting", () => {
  it("a crossover backtest acts on the next bar and charges costs on entry and exit", () => {
    // Rises then falls. Close 11 > SMA2 10.5 at bar 1, so long for bars 1→2, 2→3 and 3→4.
    // The rule only sees the turn at the close of bar 4 (12 < 12.5): it gives back 13 → 12 first (lag).
    const cs = [10, 11, 12, 13, 12, 11];
    const r = crossoverBacktest(cs, 1, 2, 0);
    expect(r.trades).toBe(1);
    close(r.returnPct, (12 / 11 - 1) * 100);
    const withCost = crossoverBacktest(cs, 1, 2, 1);
    close(withCost.returnPct, ((12 / 11) * 0.99 * 0.99 - 1) * 100);
    close(buyHoldPct(cs), 10);
  });
  it("a sweep reports in-sample and out-of-sample results and picks the best in-sample", () => {
    const { bars } = simulateSeries({ seed: 8, bars: 400, regimes: false });
    const rows = parameterSweep(bars.map((b) => b.c), [5, 10], [20, 40], 0.5);
    expect(rows).toHaveLength(4);
    const best = bestInSample(rows)!;
    for (const r of rows) expect(best.inSample).toBeGreaterThanOrEqual(r.inSample);
    expect(median([3, 1, 2])).toBe(2);
    expect(median([])).toBeNull();
    expect(sweepGrid(16).fasts.length * sweepGrid(16).slows.length).toBeGreaterThanOrEqual(16);
  });
  it("on random walks, the best of many tries looks far better in-sample than it does out of sample", () => {
    const e = overfitExperiment({ seed: 1, paths: 100, bars: 500, combos: 64 });
    expect(e.bestIn).toHaveLength(100);
    expect(median(e.bestIn)! - median(e.itsOut)!).toBeGreaterThan(5);
    // out of sample, the "best" rule is a coin flip: about half the paths gain
    const up = e.itsOut.filter((x) => x > 0).length;
    expect(up).toBeGreaterThan(35);
    expect(up).toBeLessThan(65);
    // trying more combinations raises the best in-sample result
    const few = overfitExperiment({ seed: 1, paths: 100, bars: 500, combos: 1 });
    expect(median(e.bestIn)! - median(few.bestIn)!).toBeGreaterThan(5);
  });
});
