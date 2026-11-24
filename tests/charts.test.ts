import { describe, expect, it } from "vitest";
import {
  aggregate, atr, barsFromTicks, candleMetrics, combine, detectGaps, directional, efficiencyRatio, ema, forwardStats, heikinAshi,
  labelSwings, linearRegression, linearScale, logReturn, logScale, logTicks, niceTicks, patternsAt, pctChange, pointAndFigure,
  relativeVolume, renko, rng, simulateSeries, simulateTicks, sma, stopFill, structureOf, swings, trueRange, validateOhlc,
  zoneTouches, zoneVisits, PATTERN_IDS, type Bar,
} from "@/lib/academy/charts";

const bar = (o: number, h: number, l: number, c: number, v = 100, t = 0): Bar => ({ t, o, h, l, c, v });
const near = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe("seeded simulation", () => {
  it("is deterministic for a seed and different across seeds", () => {
    expect(simulateSeries({ seed: 7, bars: 50 })).toEqual(simulateSeries({ seed: 7, bars: 50 }));
    expect(simulateSeries({ seed: 7, bars: 50 }).bars).not.toEqual(simulateSeries({ seed: 8, bars: 50 }).bars);
    const r = rng(1);
    const xs = Array.from({ length: 1000 }, r);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThan(1);
  });

  it("every simulated bar is a valid OHLC bar with positive volume", () => {
    for (const seed of [1, 2, 3, 99]) {
      const { bars, regimes } = simulateSeries({ seed, bars: 500, gapChance: 0.05 });
      expect(bars).toHaveLength(500);
      expect(regimes).toHaveLength(500);
      for (const b of bars) {
        expect(validateOhlc(b)).toEqual([]);
        expect(b.v).toBeGreaterThan(0);
      }
    }
  });

  it("gaps appear when asked for, and gap bars carry more volume on average", () => {
    const { bars } = simulateSeries({ seed: 5, bars: 400, gapChance: 0.08, gapSize: 0.04 });
    const gaps = detectGaps(bars, 1.5);
    expect(gaps.length).toBeGreaterThan(5);
    const gv = gaps.map((g) => bars[g.index].v).reduce((a, b) => a + b, 0) / gaps.length;
    const av = bars.map((b) => b.v).reduce((a, b) => a + b, 0) / bars.length;
    expect(gv).toBeGreaterThan(av);
  });

  it("without regimes it is a driftless walk; with regimes it records them", () => {
    const flat = simulateSeries({ seed: 3, bars: 200, regimes: false });
    expect(new Set(flat.regimes)).toEqual(new Set(["range"]));
    const multi = simulateSeries({ seed: 3, bars: 500, switchChance: 0.05 });
    expect(new Set(multi.regimes).size).toBeGreaterThan(1);
  });

  it("ticks trade at the bid or the ask, with the ask above the bid", () => {
    const ticks = simulateTicks({ seed: 4, trades: 300 });
    let t = 0;
    for (const k of ticks) {
      expect(k.ask).toBeGreaterThan(k.bid);
      expect(k.price).toBe(k.side === "buy" ? k.ask : k.bid);
      expect(k.t).toBeGreaterThanOrEqual(t);
      t = k.t;
    }
  });
});

describe("aggregation", () => {
  const bars = [bar(10, 12, 9, 11, 5), bar(11, 13, 10, 12, 7), bar(12, 12.5, 8, 9, 4), bar(9, 10, 8.5, 9.5, 6), bar(9.5, 11, 9, 10, 3)];

  it("combine: first open, highest high, lowest low, last close, summed volume", () => {
    expect(combine(bars.slice(0, 3))).toEqual({ t: 0, o: 10, h: 13, l: 8, c: 9, v: 16 });
  });

  it("aggregates in groups and flags a partial last group", () => {
    const r = aggregate(bars, 2);
    expect(r.bars).toHaveLength(3);
    expect(r.partial).toBe(true);
    expect(r.bars[0]).toEqual({ t: 0, o: 10, h: 13, l: 9, c: 12, v: 12 });
    expect(r.bars[2]).toEqual(bars[4]);
    expect(aggregate(bars.slice(0, 4), 2).partial).toBe(false);
  });

  it("a daily bar built from intraday bars matches aggregating the whole day at once", () => {
    const { bars: mins } = simulateSeries({ seed: 11, bars: 390, vol: 0.001 });
    const hourly = aggregate(mins, 30).bars;
    const fromHours = combine(hourly);
    const direct = combine(mins);
    expect(fromHours).toEqual(direct);
    expect(direct.h).toBe(Math.max(...mins.map((b) => b.h)));
    expect(direct.v).toBe(mins.reduce((a, b) => a + b.v, 0));
  });

  it("builds time, tick, volume and range bars from trade prints", () => {
    const ticks = simulateTicks({ seed: 9, trades: 400 });
    const tick = barsFromTicks(ticks, { kind: "tick", trades: 25 });
    expect(tick).toHaveLength(16);
    const vol = barsFromTicks(ticks, { kind: "volume", size: 5000 });
    for (const b of vol.slice(0, -1)) expect(b.v).toBeGreaterThanOrEqual(5000);
    const range = barsFromTicks(ticks, { kind: "range", range: 0.1 });
    for (const b of range) expect(b.h - b.l).toBeLessThanOrEqual(0.1 + 1e-9);
    const time = barsFromTicks(ticks, { kind: "time", seconds: 60 });
    for (const b of time) expect(validateOhlc(b)).toEqual([]);
    const total = ticks.reduce((a, k) => a + k.size, 0);
    for (const bs of [tick, vol, range, time]) expect(bs.reduce((a, b) => a + b.v, 0)).toBe(total);
  });
});

describe("transformed charts", () => {
  it("Heikin-Ashi follows its formulas, and its open/close are not the traded ones", () => {
    const bars = [bar(10, 12, 9, 11), bar(11, 14, 10, 13), bar(13, 13.5, 11, 12)];
    const ha = heikinAshi(bars);
    near(ha[0].c, (10 + 12 + 9 + 11) / 4);
    near(ha[0].o, (10 + 11) / 2);
    near(ha[1].o, (ha[0].o + ha[0].c) / 2);
    near(ha[1].c, (11 + 14 + 10 + 13) / 4);
    near(ha[1].h, Math.max(14, ha[1].o, ha[1].c));
    near(ha[2].l, Math.min(11, ha[2].o, ha[2].c));
    expect(ha[1].c).not.toBe(bars[1].c);
  });

  it("Renko prints one brick per box and needs two boxes to reverse", () => {
    expect(renko([100, 101, 102.1, 103], 1).map((b) => [b.lo, b.hi, b.dir])).toEqual([[100, 101, "up"], [101, 102, "up"], [102, 103, "up"]]);
    // From the top of the last up brick (102), a fall to 101 is only one box: no brick.
    expect(renko([100, 101, 102, 101], 1)).toHaveLength(2);
    // A fall to 100 (two boxes) prints a down brick from 101 to 100.
    const r = renko([100, 101, 102, 100], 1);
    expect(r.at(-1)).toEqual({ lo: 100, hi: 101, dir: "down", bar: 3 });
    expect(renko([100, 100.4, 99.7, 100.2], 1)).toEqual([]); // time passes, nothing prints
    expect(renko([1, 2], 0)).toEqual([]);
  });

  it("point and figure: X columns up, O columns down, 3-box reversal", () => {
    const cols = pointAndFigure([100, 101, 103, 105, 104, 103, 102, 101, 104, 106], 1, 3);
    expect(cols.map((c) => [c.dir, c.bottom, c.top])).toEqual([["X", 100, 105], ["O", 101, 104], ["X", 102, 106]]);
    // A 2-box dip does not reverse a column.
    expect(pointAndFigure([100, 105, 103, 106], 1, 3).map((c) => c.dir)).toEqual(["X"]);
  });
});

describe("candles", () => {
  it("measures body, wicks, range and body-to-range ratio", () => {
    const m = candleMetrics(bar(10, 15, 8, 14));
    expect(m).toEqual({ body: 4, range: 7, upperWick: 1, lowerWick: 2, bodyRatio: 4 / 7, direction: "bullish" });
    expect(candleMetrics(bar(10, 10, 10, 10)).bodyRatio).toBe(0);
    expect(candleMetrics(bar(12, 13, 9, 10)).direction).toBe("bearish");
    expect(candleMetrics(bar(12, 13, 9, 12)).direction).toBe("flat");
  });

  it("validates OHLC: high ≥ max(open, close), low ≤ min(open, close), positive prices", () => {
    expect(validateOhlc(bar(10, 12, 9, 11))).toEqual([]);
    expect(validateOhlc(bar(10, 10.5, 9, 11)).join(" ")).toMatch(/high must be at least/);
    expect(validateOhlc(bar(10, 12, 10.5, 11)).join(" ")).toMatch(/low must be at or below/);
    expect(validateOhlc(bar(10, 12, 0, 11)).join(" ")).toMatch(/above zero/);
    expect(validateOhlc({ o: NaN, h: 1, l: 1, c: 1 }).length).toBeGreaterThan(0);
  });

  it("detects pattern shapes, and the same shape gets a different name after a rise or a fall", () => {
    const down = [20, 19.5, 19, 18.5, 18, 17.5].map((c) => bar(c + 0.3, c + 0.4, c - 0.1, c));
    const up = [10, 10.5, 11, 11.5, 12, 12.5].map((c) => bar(c - 0.3, c + 0.1, c - 0.4, c));
    const hammerShape = (p: number) => bar(p, p + 0.05, p - 1.2, p + 0.25);
    expect(patternsAt([...down, hammerShape(17.3)], 6)).toContain("hammer");
    expect(patternsAt([...up, hammerShape(12.6)], 6)).toContain("hanging-man");
    const starShape = (p: number) => bar(p + 0.25, p + 1.2, p - 0.05, p);
    expect(patternsAt([...up, starShape(12.6)], 6)).toContain("shooting-star");
    expect(patternsAt([...down, starShape(17.3)], 6)).toContain("inverted-hammer");
    expect(patternsAt([bar(10, 11, 9, 10.02)], 0)).toContain("doji");
    expect(patternsAt([bar(10, 11.02, 9.99, 11)], 0)).toContain("marubozu");
    expect(patternsAt([bar(11, 11.2, 9.9, 10), bar(9.9, 11.4, 9.8, 11.3)], 1)).toEqual(expect.arrayContaining(["bullish-engulfing", "outside-bar"]));
    expect(patternsAt([bar(10, 11.2, 9.9, 11), bar(10.8, 10.9, 10.2, 10.3)], 1)).toEqual(expect.arrayContaining(["bearish-harami", "inside-bar"]));
    expect(patternsAt([bar(12, 12.1, 10.9, 11), bar(10.9, 11, 10.7, 10.85), bar(10.9, 11.8, 10.85, 11.7)], 2)).toContain("morning-star");
    expect(patternsAt([bar(10, 11, 9.9, 10.9), bar(10.8, 11.8, 10.7, 11.7), bar(11.6, 12.6, 11.5, 12.5)], 2)).toContain("three-white-soldiers");
    expect(patternsAt([bar(12.5, 12.6, 11.5, 11.6), bar(11.7, 11.8, 10.7, 10.8), bar(10.9, 11, 9.9, 10)], 2)).toContain("three-black-crows");
    expect(PATTERN_IDS).toHaveLength(16);
  });

  it("forward statistics compare a pattern with the base rate", () => {
    const bars = [100, 101, 102, 101, 103].map((c, i) => bar(c, c, c, c, 1, i));
    const s = forwardStats(bars, [0, 1], 2);
    expect(s.count).toBe(2);
    near(s.meanPct!, (2 + (0 / 101) * 100) / 2);
    expect(forwardStats(bars, [4], 2)).toEqual({ count: 0, meanPct: null, upShare: null });
  });
});

describe("structure and trend", () => {
  // A zig-zag: up to 5, down to 3, up to 7, down to 5, up to 9, down to 7, then flat bars to confirm the last swing.
  const path = [1, 3, 5, 4, 3, 5, 7, 6, 5, 7, 9, 8, 7, 7.5, 7.6];
  const zz = path.map((c, i) => bar(c, c + 0.1, c - 0.1, c, 1, i));

  it("finds alternating swing highs and lows", () => {
    const s = swings(zz, 2);
    expect(s.map((x) => [x.kind, x.index])).toEqual([["high", 2], ["low", 4], ["high", 6], ["low", 8], ["high", 10], ["low", 12]]);
    for (let i = 1; i < s.length; i++) expect(s[i].kind).not.toBe(s[i - 1].kind);
  });

  it("labels HH/HL and calls the structure an up-trend; the mirror image is a down-trend", () => {
    const lab = labelSwings(swings(zz, 2));
    expect(lab.map((x) => x.label)).toEqual(["first", "first", "HH", "HL", "HH", "HL"]);
    expect(structureOf(swings(zz, 2))).toBe("uptrend");
    const mirror = path.map((c, i) => bar(20 - c, 20 - c + 0.1, 20 - c - 0.1, 20 - c, 1, i));
    expect(labelSwings(swings(mirror, 2)).map((x) => x.label)).toEqual(["first", "first", "LL", "LH", "LL", "LH"]);
    expect(structureOf(swings(mirror, 2))).toBe("downtrend");
    expect(structureOf([])).toBe("unknown");
  });

  it("linear regression recovers a straight line and reports r²", () => {
    const r = linearRegression([2, 4, 6, 8, 10]);
    near(r.slope, 2); near(r.intercept, 2); near(r.r2, 1);
    expect(linearRegression([1, 3, 1, 3, 1, 3]).r2).toBeLessThan(0.2);
    expect(linearRegression([5]).slope).toBe(0);
  });

  it("SMA and EMA", () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
    const e = ema([1, 2, 3, 4, 5], 3);
    expect(e.slice(0, 2)).toEqual([null, null]);
    near(e[2]!, 2); near(e[3]!, 0.5 * 4 + 0.5 * 2); near(e[4]!, 0.5 * 5 + 0.5 * 3);
  });

  it("true range uses the previous close when price gapped", () => {
    expect(trueRange(bar(12, 13, 11.5, 12.5), 10)).toBe(3);
    expect(trueRange(bar(12, 13, 11.5, 12.5))).toBe(1.5);
    const a = atr([bar(10, 11, 9, 10), bar(10, 11, 9, 10), bar(10, 12, 9, 11)], 2);
    expect(a[0]).toBeNull();
    near(a[1]!, 2); near(a[2]!, (2 * 1 + 3) / 2);
  });

  it("ADX is high for a steady trend and low for a back-and-forth market", () => {
    const trendBars = Array.from({ length: 60 }, (_, i) => bar(100 + i, 100.6 + i, 99.8 + i, 100.5 + i, 1, i));
    const chop = Array.from({ length: 60 }, (_, i) => { const c = i % 2 ? 101 : 100; return bar(c, c + 0.6, c - 0.6, c, 1, i); });
    const tA = directional(trendBars, 14).adx.at(-1)!;
    const cA = directional(chop, 14).adx.at(-1)!;
    expect(tA).toBeGreaterThan(50);
    expect(cA).toBeLessThan(20);
    expect(directional(trendBars, 14).plusDI.at(-1)!).toBeGreaterThan(directional(trendBars, 14).minusDI.at(-1)!);
  });

  it("efficiency ratio: 1 for a straight line, near 0 for back-and-forth", () => {
    expect(efficiencyRatio([1, 2, 3, 4, 5], 4)).toBe(1);
    expect(efficiencyRatio([1, 2, 1, 2, 1], 4)).toBe(0);
    expect(efficiencyRatio([1, 2], 4)).toBeNull();
  });
});

describe("volume, scales, gaps and levels", () => {
  it("relative volume divides by the average of the previous n bars", () => {
    expect(relativeVolume([10, 10, 10, 30, 5], 3)).toEqual([null, null, null, 3, 5 / (50 / 3)]);
  });

  it("linear and log scales map and invert", () => {
    const lin = linearScale(0, 100, 200, 0);
    expect(lin(25)).toBe(150);
    expect(lin.invert(150)).toBe(25);
    const lg = logScale(10, 1000, 0, 100);
    near(lg(100), 50);
    near(lg.invert(50), 100, 1e-6);
    // Equal percentage moves get equal distance on a log scale, not on a linear one.
    near(lg(20) - lg(10), lg(200) - lg(100));
    expect(linearScale(10, 1000, 0, 100)(20) - linearScale(10, 1000, 0, 100)(10)).not.toBeCloseTo(linearScale(10, 1000, 0, 100)(200) - linearScale(10, 1000, 0, 100)(100));
  });

  it("percentage change is asymmetric; log returns add up", () => {
    expect(pctChange(100, 50)).toBe(-50);
    expect(pctChange(50, 100)).toBe(100);
    near(logReturn(100, 50) + logReturn(50, 100), 0);
    near(logReturn(100, 110) + logReturn(110, 121), logReturn(100, 121));
  });

  it("axis ticks", () => {
    expect(niceTicks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(niceTicks(99.3, 101.1, 4)).toEqual([99.5, 100, 100.5, 101]);
    expect(niceTicks(5, 5)).toEqual([5]);
    expect(logTicks(1, 1000)).toEqual([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]);
    expect(logTicks(-1, 5)).toEqual([]);
  });

  it("detects opening gaps, windows and fills", () => {
    const bars = [bar(100, 101, 99, 100), bar(103, 104, 102.5, 103.5), bar(103.5, 104, 99.8, 100.5), bar(100, 100.5, 99, 99.5), bar(96, 97, 95, 96)];
    const g = detectGaps(bars, 1);
    expect(g).toEqual([
      { index: 1, dir: "up", gapPct: 3, window: true, filledAt: 2 },
      { index: 4, dir: "down", gapPct: pctChange(99.5, 96), window: true, filledAt: null },
    ]);
  });

  it("a stop gapped through fills at the open, not at the stop", () => {
    expect(stopFill(95, "sell", { o: 90, h: 91, l: 88 })).toEqual({ triggered: true, fill: 90, slippage: 5 });
    expect(stopFill(95, "sell", { o: 97, h: 98, l: 94 })).toEqual({ triggered: true, fill: 95, slippage: 0 });
    expect(stopFill(95, "sell", { o: 97, h: 98, l: 96 })).toEqual({ triggered: false, fill: null, slippage: 0 });
    expect(stopFill(105, "buy", { o: 108, h: 109, l: 107 })).toEqual({ triggered: true, fill: 108, slippage: 3 });
  });

  it("counts zone touches and separate visits", () => {
    const bars = [100, 105, 110, 104, 100, 109, 110, 111].map((c) => bar(c, c + 0.5, c - 0.5, c));
    const t = zoneTouches(bars, 109, 110);
    expect(t).toEqual([2, 5, 6]);
    expect(zoneVisits(t, 1)).toBe(2);
    expect(zoneVisits([], 1)).toBe(0);
  });
});
