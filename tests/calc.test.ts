import { describe, expect, it } from "vitest";
import {
  LOT_UNITS, adverseMoveToLevel, applySplit, buybackEps, capBucket, capWeights, classifyPair, classifySurprise, convert,
  dividendYield, divisorAfterSplit, eps, exDividendPrice, feesOverYears, futuresPosition, indexChangePct, indexWeights,
  invertRate, lotsToUnits, marginPct, marginPctOf, marginRequired, marginSnapshot, marketCap, matchOrder, navPerUnit,
  pctChange, peRatio, pipSize, pipValue, pipetteSize, pipsBetween, positionSize, premiumPct, priceWeightedLevel,
  quoteFromBidAsk, rolloverNights, round, spreadCost, surprisePct, swapPerNight, tradePnl, tradingCost, trackingDifference,
  unitsToLots, type Book, type IndexMember,
} from "@/lib/academy/calc";

const close = (a: number | null | undefined, b: number, eps = 1e-9) => {
  expect(a).not.toBeNull();
  expect(Math.abs((a as number) - b)).toBeLessThan(eps);
};

describe("round", () => {
  it("rounds half away from zero and keeps non-finite values", () => {
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(-1.005, 2)).toBe(-1.01);
    expect(round(0)).toBe(0);
    expect(round(12.3456, 0)).toBe(12);
    expect(round(NaN)).toBeNaN();
  });
});

describe("pips and lots", () => {
  it("uses 0.0001 for most pairs and 0.01 for JPY; a pipette is a tenth of a pip", () => {
    expect(pipSize("USD")).toBe(0.0001);
    expect(pipSize("jpy")).toBe(0.01);
    expect(pipSize(" JPY ")).toBe(0.01);
    expect(pipetteSize("USD")).toBeCloseTo(0.00001, 12);
    expect(pipetteSize("JPY")).toBeCloseTo(0.001, 12);
  });

  it("counts pips between prices, both ways, for JPY and non-JPY pairs", () => {
    expect(pipsBetween(1.1000, 1.1025, "USD")).toBe(25);
    expect(pipsBetween(1.1025, 1.1000, "USD")).toBe(-25);
    expect(pipsBetween(150.0, 150.35, "JPY")).toBe(35);
    expect(pipsBetween(1.10005, 1.1001, "USD")).toBe(0.5); // half a pip = 5 pipettes
    expect(pipsBetween(0, 1, "USD")).toBeNull();
    expect(pipsBetween(-1, 1, "USD")).toBeNull();
    expect(pipsBetween(NaN, 1, "USD")).toBeNull();
  });

  it("converts lots and units (standard 100k, mini 10k, micro 1k)", () => {
    expect(LOT_UNITS).toEqual({ standard: 100000, mini: 10000, micro: 1000 });
    expect(lotsToUnits(1)).toBe(100000);
    expect(lotsToUnits(0.1)).toBe(10000);
    expect(lotsToUnits(0.01)).toBe(1000);
    expect(lotsToUnits(0)).toBe(0);
    expect(lotsToUnits(-1)).toBeNull();
    expect(unitsToLots(25000)).toBe(0.25);
    expect(unitsToLots(Infinity)).toBeNull();
  });
});

describe("pipValue", () => {
  it("USD quote with a USD account: $10 per pip for a standard lot", () => {
    const v = pipValue({ base: "EUR", quote: "USD", units: 100000, rate: 1.1, account: "USD" })!;
    close(v.inQuote, 10);
    close(v.inAccount, 10);
    expect(v.method).toBe("quote-is-account");
  });

  it("JPY quote with a USD account: divide by the USD/JPY rate", () => {
    const v = pipValue({ base: "USD", quote: "JPY", units: 100000, rate: 150, account: "USD" })!;
    close(v.inQuote, 1000); // ¥1,000 per pip
    close(v.inAccount, 1000 / 150); // ≈ $6.67
    expect(v.method).toBe("base-is-account");
  });

  it("non-USD quote with a USD account: multiply by quote→USD", () => {
    // EUR/GBP, pip worth £10 per standard lot; GBP/USD at 1.25 → $12.50
    const v = pipValue({ base: "EUR", quote: "GBP", units: 100000, rate: 0.85, account: "USD", quoteToAccount: 1.25 })!;
    close(v.inQuote, 10);
    close(v.inAccount, 12.5);
    expect(v.method).toBe("cross");
  });

  it("cross pair with JPY quote and a EUR account", () => {
    // GBP/JPY micro lot: ¥10 per pip. 1 JPY = 0.0062 EUR → €0.062
    const v = pipValue({ base: "GBP", quote: "JPY", units: 1000, rate: 190, account: "EUR", quoteToAccount: 0.0062 })!;
    close(v.inQuote, 10);
    close(v.inAccount, 0.062);
  });

  it("zero units is worth zero; huge sizes stay finite", () => {
    expect(pipValue({ base: "EUR", quote: "USD", units: 0, rate: 1.1, account: "USD" })!.inAccount).toBe(0);
    const big = pipValue({ base: "EUR", quote: "USD", units: 1e12, rate: 1.1, account: "USD" })!;
    expect(Number.isFinite(big.inAccount)).toBe(true);
    close(big.inAccount, 1e8, 1e-3);
  });

  it("rejects nonsense", () => {
    expect(pipValue({ base: "EUR", quote: "USD", units: -1, rate: 1.1, account: "USD" })).toBeNull();
    expect(pipValue({ base: "EUR", quote: "USD", units: 1000, rate: 0, account: "USD" })).toBeNull();
    expect(pipValue({ base: "EUR", quote: "USD", units: 1000, rate: -1.1, account: "USD" })).toBeNull();
    expect(pipValue({ base: "EUR", quote: "EUR", units: 1000, rate: 1, account: "EUR" })).toBeNull();
    // cross without a conversion rate
    expect(pipValue({ base: "EUR", quote: "GBP", units: 1000, rate: 0.85, account: "USD" })).toBeNull();
    expect(pipValue({ base: "EUR", quote: "GBP", units: 1000, rate: 0.85, account: "USD", quoteToAccount: 0 })).toBeNull();
  });
});

describe("trade P&L and position size", () => {
  it("long and short P&L in the quote currency", () => {
    close(tradePnl("long", 1.1, 1.105, 100000), 500);
    close(tradePnl("short", 1.1, 1.105, 100000), -500);
    close(tradePnl("long", 150, 149.5, 10000), -5000); // yen
    expect(tradePnl("long", 1.1, 1.1, 100000)).toBe(0);
    expect(tradePnl("long", 0, 1, 1)).toBeNull();
    expect(tradePnl("long", 1, 1, -5)).toBeNull();
  });

  it("sizes a position from risk %, stop and pip value; rounds down to micro lots", () => {
    // $10,000 × 1% = $100 risk; 50-pip stop; EUR/USD pip per unit = $0.0001 → 20,000 units
    const p = positionSize(10000, 1, 50, 0.0001)!;
    expect(p.units).toBe(20000);
    expect(p.lots).toBe(0.2);
    expect(p.riskAmount).toBe(100);
    // 30-pip stop → 33,333 → rounded DOWN to 33,000
    expect(positionSize(10000, 1, 30, 0.0001)!.units).toBe(33000);
    // tiny account → below one micro lot → 0 units (do not trade rather than over-risk)
    expect(positionSize(50, 1, 50, 0.0001)!.units).toBe(0);
  });

  it("position size rejects zero/negative/over-100% inputs", () => {
    expect(positionSize(0, 1, 50, 0.0001)).toBeNull();
    expect(positionSize(1000, 0, 50, 0.0001)).toBeNull();
    expect(positionSize(1000, 101, 50, 0.0001)).toBeNull();
    expect(positionSize(1000, 1, 0, 0.0001)).toBeNull();
    expect(positionSize(1000, 1, 50, 0)).toBeNull();
    expect(positionSize(1000, -1, 50, 0.0001)).toBeNull();
  });
});

describe("margin and leverage", () => {
  it("margin = notional ÷ leverage", () => {
    close(marginRequired(110000, 30), 3666.6666666667, 1e-6);
    expect(marginRequired(100000, 1)).toBe(100000);
    expect(marginRequired(0, 30)).toBe(0);
    expect(marginRequired(100000, 0.5)).toBeNull();
    expect(marginRequired(100000, 0)).toBeNull();
    expect(marginRequired(-1, 30)).toBeNull();
    close(marginPct(30), 3.3333333333, 1e-6);
    expect(marginPct(0)).toBeNull();
  });

  it("snapshot: equity, free margin, margin level and status", () => {
    const ok = marginSnapshot(1000, -200, 400)!;
    expect(ok.equity).toBe(800);
    expect(ok.freeMargin).toBe(400);
    expect(ok.marginLevel).toBe(200);
    expect(ok.status).toBe("ok");
    expect(marginSnapshot(1000, -600, 400)!.status).toBe("margin-call"); // 100%
    expect(marginSnapshot(1000, -700, 400)!.status).toBe("margin-call"); // 75%
    expect(marginSnapshot(1000, -800, 400)!.status).toBe("stop-out"); // 50%
    const neg = marginSnapshot(1000, -1200, 400)!; // gap: equity below zero
    expect(neg.equity).toBe(-200);
    expect(neg.status).toBe("stop-out");
    expect(marginSnapshot(1000, 0, 0)).toEqual({ equity: 1000, freeMargin: 1000, marginLevel: null, status: "ok" });
    expect(marginSnapshot(1000, 0, -5)).toBeNull();
    expect(marginSnapshot(NaN, 0, 5)).toBeNull();
    // custom broker levels
    expect(marginSnapshot(1000, -500, 400, 150, 80)!.status).toBe("margin-call"); // 125%
  });

  it("adverse move to a margin level", () => {
    // $1,000 balance, 100,000 units, $3,667 used margin: already below 100% at open → null
    expect(adverseMoveToLevel(1000, 100000, 3667, 100)).toBeNull();
    // $1,000, 10,000 units, $367 margin → stop-out at 50% when equity = $183.5 → move 0.08165
    close(adverseMoveToLevel(1000, 10000, 367, 50), (1000 - 183.5) / 10000);
    expect(adverseMoveToLevel(1000, 0, 367, 50)).toBeNull();
  });
});

describe("costs", () => {
  it("spread cost and bid/ask", () => {
    close(spreadCost(1.2, 100000, "USD"), 12);
    close(spreadCost(2, 10000, "JPY"), 200); // ¥200
    expect(spreadCost(0, 100000, "USD")).toBe(0);
    expect(spreadCost(-1, 100000, "USD")).toBeNull();
    const q = quoteFromBidAsk(1.1, 1.1002, "USD")!;
    close(q.mid, 1.1001);
    expect(q.spreadPips).toBe(2);
    expect(quoteFromBidAsk(150.1, 150.13, "JPY")!.spreadPips).toBe(3);
    expect(quoteFromBidAsk(1.2, 1.1, "USD")).toBeNull(); // crossed
    expect(quoteFromBidAsk(1.1, 1.1, "USD")!.spreadPips).toBe(0);
  });

  it("swap: sign follows the rate differential, markup pushes both sides down", () => {
    // AUD 4%, JPY 0.5%: long earns, short pays
    const long = swapPerNight("long", 100000, 100, 4, 0.5, 0)!;
    const short = swapPerNight("short", 100000, 100, 4, 0.5, 0)!;
    expect(long).toBeGreaterThan(0);
    expect(short).toBeLessThan(0);
    close(long, -short);
    close(long, (100000 * 100 * 3.5) / 100 / 365);
    // equal rates + markup → both negative
    expect(swapPerNight("long", 100000, 1.1, 2, 2, 0.5)!).toBeLessThan(0);
    expect(swapPerNight("short", 100000, 1.1, 2, 2, 0.5)!).toBeLessThan(0);
    // small positive differential eaten by the markup
    expect(swapPerNight("long", 100000, 1.1, 2.3, 2, 0.5)!).toBeLessThan(0);
    // negative interest rates work
    expect(swapPerNight("long", 100000, 1.1, -0.5, 1, 0)!).toBeLessThan(0);
    expect(swapPerNight("long", 0, 1.1, 5, 1, 0)).toBe(0);
    expect(swapPerNight("long", 100000, 0, 5, 1, 0)).toBeNull();
    expect(swapPerNight("long", 100000, 1.1, 5, 1, -1)).toBeNull();
  });

  it("rollover days: Wednesday counts three times, weekends none, a week sums to 7", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(rolloverNights)).toEqual([0, 1, 1, 3, 1, 1, 0]);
    expect([0, 1, 2, 3, 4, 5, 6].reduce((s, d) => s + rolloverNights(d), 0)).toBe(7);
    expect(rolloverNights(7)).toBe(0);
    expect(rolloverNights(-1)).toBe(0);
    expect(rolloverNights(2.5)).toBe(0);
  });

  it("total cost: swap income reduces the cost, swap charges add to it", () => {
    expect(tradingCost(12, 7, -3)).toEqual({ spread: 12, commission: 7, swap: 3, total: 22 });
    expect(tradingCost(12, 7, 5)).toEqual({ spread: 12, commission: 7, swap: -5, total: 14 });
    expect(tradingCost(0, 0, 0)!.total).toBe(0);
    expect(tradingCost(-1, 0, 0)).toBeNull();
  });
});

describe("pairs and conversion", () => {
  it("classifies majors, minors and exotics", () => {
    expect(classifyPair("EUR", "USD")).toBe("major");
    expect(classifyPair("USD", "JPY")).toBe("major");
    expect(classifyPair("usd", "cad")).toBe("major");
    expect(classifyPair("EUR", "GBP")).toBe("minor");
    expect(classifyPair("AUD", "NZD")).toBe("minor");
    expect(classifyPair("USD", "TRY")).toBe("exotic");
    expect(classifyPair("EUR", "ZAR")).toBe("exotic");
    expect(classifyPair("USD", "USD")).toBeNull();
    expect(classifyPair("EURO", "USD")).toBeNull();
    expect(classifyPair("", "USD")).toBeNull();
  });

  it("converts both ways and inverts", () => {
    close(convert(100, 1.25, "base-to-quote"), 125);
    close(convert(125, 1.25, "quote-to-base"), 100);
    expect(convert(0, 1.25, "base-to-quote")).toBe(0);
    expect(convert(100, 0, "base-to-quote")).toBeNull();
    expect(convert(-5, 1.2, "base-to-quote")).toBeNull();
    close(invertRate(1.25), 0.8);
    expect(invertRate(0)).toBeNull();
    close(pctChange(1.1, 1.21), 10);
    close(pctChange(-2, -1), 50);
    expect(pctChange(0, 1)).toBeNull();
  });
});

describe("order book matching", () => {
  const book = (): Book => ({
    bids: [{ price: 99.9, qty: 300 }, { price: 99.8, qty: 500 }],
    asks: [{ price: 100.0, qty: 200 }, { price: 100.1, qty: 400 }],
  });

  it("a market buy walks the asks and reports the average price", () => {
    const r = matchOrder(book(), { side: "buy", type: "market", qty: 500 });
    expect(r.status).toBe("filled");
    expect(r.fills).toEqual([{ price: 100.0, qty: 200 }, { price: 100.1, qty: 300 }]);
    close(r.avgPrice, (100 * 200 + 100.1 * 300) / 500);
    expect(r.book.asks).toEqual([{ price: 100.1, qty: 100 }]);
  });

  it("a market order bigger than the book partly fills and the rest is cancelled", () => {
    const r = matchOrder(book(), { side: "sell", type: "market", qty: 1000 });
    expect(r.status).toBe("partial-cancelled");
    expect(r.filledQty).toBe(800);
    expect(r.cancelledQty).toBe(200);
    expect(r.book.bids).toEqual([]);
  });

  it("a market order into an empty side does nothing", () => {
    const r = matchOrder({ bids: [], asks: [] }, { side: "buy", type: "market", qty: 10 });
    expect(r.status).toBe("unfilled");
    expect(r.avgPrice).toBeNull();
  });

  it("a limit buy below the best ask rests on the bid side", () => {
    const r = matchOrder(book(), { side: "buy", type: "limit", qty: 100, limit: 99.95 });
    expect(r.status).toBe("rested");
    expect(r.restedQty).toBe(100);
    expect(r.book.bids[0]).toEqual({ price: 99.95, qty: 100 }); // new best bid
  });

  it("a marketable limit partly fills up to its price, then rests", () => {
    const r = matchOrder(book(), { side: "buy", type: "limit", qty: 300, limit: 100.0 });
    expect(r.status).toBe("partial-rested");
    expect(r.filledQty).toBe(200);
    expect(r.restedQty).toBe(100);
    expect(r.book.asks).toEqual([{ price: 100.1, qty: 400 }]);
    expect(r.book.bids[0]).toEqual({ price: 100.0, qty: 100 });
  });

  it("a limit at an existing level joins it; a sell limit fills only at or above its price", () => {
    expect(matchOrder(book(), { side: "buy", type: "limit", qty: 50, limit: 99.9 }).book.bids[0]).toEqual({ price: 99.9, qty: 350 });
    const s = matchOrder(book(), { side: "sell", type: "limit", qty: 400, limit: 99.9 });
    expect(s.filledQty).toBe(300);
    expect(s.restedQty).toBe(100);
    expect(s.book.asks[0]).toEqual({ price: 99.9, qty: 100 });
  });

  it("never mutates the input and rejects invalid orders", () => {
    const b = book();
    const snapshot = JSON.stringify(b);
    matchOrder(b, { side: "buy", type: "market", qty: 500 });
    expect(JSON.stringify(b)).toBe(snapshot);
    for (const o of [
      { side: "buy" as const, type: "market" as const, qty: 0 },
      { side: "buy" as const, type: "market" as const, qty: -5 },
      { side: "buy" as const, type: "market" as const, qty: 1.5 },
      { side: "buy" as const, type: "limit" as const, qty: 5 },
      { side: "buy" as const, type: "limit" as const, qty: 5, limit: 0 },
    ]) expect(matchOrder(b, o).status).toBe("invalid");
  });

  it("ignores junk levels and sorts an unsorted book", () => {
    const r = matchOrder({ bids: [], asks: [{ price: 101, qty: 5 }, { price: 100, qty: 5 }, { price: NaN, qty: 5 }, { price: 99, qty: 0 }] }, { side: "buy", type: "market", qty: 6 });
    expect(r.fills).toEqual([{ price: 100, qty: 5 }, { price: 101, qty: 1 }]);
  });
});

describe("earnings and size", () => {
  it("EPS, P/E and surprise", () => {
    expect(eps(50e6, 25e6)).toBe(2);
    expect(eps(-10e6, 20e6)).toBe(-0.5);
    expect(eps(1, 0)).toBeNull();
    expect(peRatio(40, 2)).toBe(20);
    expect(peRatio(40, 0)).toBeNull();
    expect(peRatio(40, -1)).toBeNull(); // loss-making: P/E not meaningful
    expect(peRatio(0, 2)).toBeNull();
    close(surprisePct(1.1, 1.0), 10);
    close(surprisePct(0.9, 1.0), -10);
    close(surprisePct(-0.4, -0.5), 20); // smaller loss than expected is a beat
    expect(surprisePct(1, 0)).toBeNull();
    expect(classifySurprise(1.005, 1)).toBe("in-line");
    expect(classifySurprise(1.05, 1)).toBe("beat");
    expect(classifySurprise(0.9, 1)).toBe("miss");
    expect(classifySurprise(1, 0)).toBeNull();
    expect(marginPctOf(20, 200)).toBe(10);
    expect(marginPctOf(-20, 200)).toBe(-10);
    expect(marginPctOf(20, 0)).toBeNull();
  });

  it("market cap and size buckets", () => {
    expect(marketCap(50, 1e9)).toBe(5e10);
    expect(marketCap(-1, 1)).toBeNull();
    expect(capBucket(250e9)).toBe("mega");
    expect(capBucket(200e9)).toBe("mega");
    expect(capBucket(50e9)).toBe("large");
    expect(capBucket(5e9)).toBe("mid");
    expect(capBucket(500e6)).toBe("small");
    expect(capBucket(100e6)).toBe("micro");
    expect(capBucket(0)).toBe("micro");
    expect(capBucket(-1)).toBeNull();
  });
});

describe("index weighting", () => {
  const M: IndexMember[] = [
    { id: "a", price: 300, shares: 1e6, float: 1 },
    { id: "b", price: 30, shares: 50e6, float: 0.5 },
    { id: "c", price: 60, shares: 10e6, float: 1 },
  ];

  it("weights sum to 1 under every method", () => {
    for (const m of ["price", "cap", "float", "equal"] as const) {
      const w = indexWeights(M, m);
      close(Object.values(w).reduce((a, b) => a + b, 0), 1);
    }
    const pw = indexWeights(M, "price");
    close(pw.a, 300 / 390);
    const cw = indexWeights(M, "cap"); // caps 300m, 1500m, 600m
    close(cw.b, 1500 / 2400);
    const fw = indexWeights(M, "float"); // 300m, 750m, 600m
    close(fw.b, 750 / 1650);
    close(indexWeights(M, "equal").c, 1 / 3);
  });

  it("a 10% move in the highest-priced stock dominates a price-weighted index", () => {
    const ch = { a: 10, b: 0, c: 0 };
    close(indexChangePct(M, ch, "price"), (30 / 390) * 100); // = Σ new / Σ old − 1
    close(indexChangePct(M, ch, "cap"), 10 * (300 / 2400));
    close(indexChangePct(M, ch, "equal"), 10 / 3);
  });

  it("price-weighted change equals Σ new prices ÷ Σ old prices − 1", () => {
    const ch = { a: -5, b: 20, c: 3 };
    const before = 300 + 30 + 60;
    const after = 300 * 0.95 + 30 * 1.2 + 60 * 1.03;
    close(indexChangePct(M, ch, "price"), (after / before - 1) * 100);
  });

  it("handles empty, missing changes, zero and invalid members", () => {
    expect(indexWeights([], "cap")).toEqual({});
    expect(indexChangePct([], {}, "cap")).toBeNull();
    expect(indexChangePct(M, {}, "cap")).toBe(0);
    expect(indexWeights([{ id: "x", price: 0, shares: 1 }], "price")).toEqual({});
    expect(indexWeights([{ id: "x", price: 1, shares: 1, float: 0 }], "float")).toEqual({});
    expect(indexWeights([{ id: "x", price: 1, shares: 1, float: 1.5 }], "float")).toEqual({});
    expect(indexChangePct(M, { a: -150 }, "equal")).toBeNull(); // cannot fall more than 100%
    expect(indexChangePct(M, { a: NaN }, "equal")).toBeNull();
    close(indexChangePct(M, { a: -100, b: -100, c: -100 }, "cap"), -100);
  });

  it("divisor keeps a price-weighted index level unchanged through a split", () => {
    const prices = [300, 30, 60];
    expect(priceWeightedLevel(prices, 1)).toBe(390);
    const d = divisorAfterSplit(prices, 1, 0, 3)!; // 3-for-1 split of the $300 stock
    close(priceWeightedLevel([100, 30, 60], d), 390);
    expect(priceWeightedLevel(prices, 0)).toBeNull();
    expect(divisorAfterSplit(prices, 1, 5, 2)).toBeNull();
    expect(divisorAfterSplit(prices, 1, 0, 0)).toBeNull();
  });

  it("caps weights and redistributes the excess in proportion", () => {
    const w = capWeights({ a: 0.6, b: 0.3, c: 0.1 }, 0.4);
    // round 1: a → 0.4, b → 0.3/0.4 × 0.6 = 0.45 (now above the cap) → round 2: b → 0.4, c gets the rest
    close(w.a, 0.4);
    close(w.b, 0.4);
    close(w.c, 0.2);
    const w2 = capWeights({ a: 0.6, b: 0.3, c: 0.1 }, 0.45);
    close(w2.a, 0.45);
    close(w2.b, 0.3 / 0.4 * 0.55);
    close(Object.values(w2).reduce((s, x) => s + x, 0), 1);
    // repeated rounds converge with every weight at or below the cap where possible
    const w3 = capWeights({ a: 0.5, b: 0.3, c: 0.15, d: 0.05 }, 0.3);
    for (const v of Object.values(w3)) expect(v).toBeLessThanOrEqual(0.3 + 1e-9);
    close(Object.values(w3).reduce((s, x) => s + x, 0), 1);
    // impossible cap → equal weights; no-op caps
    expect(capWeights({ a: 0.7, b: 0.3 }, 0.4)).toEqual({ a: 0.5, b: 0.5 });
    expect(capWeights({ a: 0.7, b: 0.3 }, 1)).toEqual({ a: 0.7, b: 0.3 });
    expect(capWeights({}, 0.3)).toEqual({});
  });
});

describe("funds and futures", () => {
  it("NAV, premium and fees", () => {
    expect(navPerUnit(1_000_000, 10_000, 0, 10_000)).toBe(101);
    expect(navPerUnit(1_000_000, 0, 0, 0)).toBeNull();
    close(premiumPct(101, 100), 1);
    close(premiumPct(99, 100), -1);
    expect(premiumPct(0, 100)).toBeNull();
    close(feesOverYears(10000, 0.1, 1), 10);
    close(feesOverYears(10000, 1, 10), 10000 * (1 - 0.99 ** 10));
    expect(feesOverYears(10000, 0, 30)).toBe(0);
    expect(feesOverYears(10000, 100, 1)).toBeNull();
    close(trackingDifference(9.8, 10), -0.2);
  });

  it("futures: notional, leverage and P&L", () => {
    // E-mini style: $50 per index point
    const f = futuresPosition(5000, 50, 1, 25000, -20)!;
    expect(f.notional).toBe(250000);
    expect(f.leverage).toBe(10);
    expect(f.pnl).toBe(-1000);
    expect(f.pnlPctOfMargin).toBe(-4);
    expect(futuresPosition(5000, 50, 1, 25000, -20, "short")!.pnl).toBe(1000);
    expect(futuresPosition(5000, 50, 0, 25000, 10)!.pnl).toBe(0);
    expect(futuresPosition(5000, 50, 1, 0, 10)!.leverage).toBeNull();
    expect(futuresPosition(5000, 50, 1.5, 100, 10)).toBeNull();
    expect(futuresPosition(0, 50, 1, 100, 10)).toBeNull();
  });
});

describe("dividends and corporate actions", () => {
  it("yield and ex-dividend price", () => {
    expect(dividendYield(2, 50)).toBe(4);
    expect(dividendYield(0, 50)).toBe(0);
    expect(dividendYield(2, 0)).toBeNull();
    expect(exDividendPrice(50, 0.5)).toBe(49.5);
    expect(exDividendPrice(50, 0)).toBe(50);
    expect(exDividendPrice(50, 60)).toBeNull();
  });

  it("splits keep the value of a holding the same; reverse splits too", () => {
    expect(applySplit(300, 10, 3)).toEqual({ price: 100, shares: 30, value: 3000 });
    const r = applySplit(0.5, 1000, 0.1)!; // 1-for-10 reverse
    close(r.price, 5);
    close(r.shares, 100);
    close(r.price * r.shares, r.value);
    expect(applySplit(100, 10, 0)).toBeNull();
  });

  it("buybacks raise EPS when profit is unchanged", () => {
    const b = buybackEps(100e6, 50e6, 5e6)!;
    expect(b.before).toBe(2);
    close(b.after, 100e6 / 45e6);
    close(b.changePct, (50 / 45 - 1) * 100);
    expect(buybackEps(100e6, 50e6, 50e6)).toBeNull();
    expect(buybackEps(0, 50e6, 1e6)!.changePct).toBe(0);
  });
});

describe("openForexSessions (session clock helper)", () => {
  it("reports the London–New York overlap on a weekday and nothing at the weekend", async () => {
    const { openForexSessions } = await import("@/lib/sessions");
    expect(openForexSessions(new Date("2026-03-11T14:00:00Z")).map((s) => s.id)).toEqual(["london", "newyork"]);
    expect(openForexSessions(new Date("2026-03-11T02:00:00Z")).map((s) => s.id)).toEqual(["sydney", "tokyo"]);
    expect(openForexSessions(new Date("2026-03-14T14:00:00Z"))).toEqual([]); // Saturday
    expect(openForexSessions(new Date("2026-03-13T22:30:00Z"))).toEqual([]); // Friday after the NY close
  });
});

describe("capWeightsChecked (explicit infeasible flag)", () => {
  it("reports infeasible caps instead of silently breaking them", async () => {
    const { capWeightsChecked } = await import("@/lib/academy/calc");
    const bad = capWeightsChecked({ a: 0.9, b: 0.1 }, 0.35);
    expect(bad.feasible).toBe(false);
    expect(bad.weights).toEqual({ a: 0.5, b: 0.5 }); // documented fallback, above the cap
    expect(bad.capped).toEqual([]);
    const ok = capWeightsChecked({ a: 0.6, b: 0.3, c: 0.1 }, 0.4);
    expect(ok.feasible).toBe(true);
    expect(ok.capped).toEqual(["a"]);
    expect(capWeightsChecked({ a: 0.6, b: 0.4 }, 1)).toEqual({ weights: { a: 0.6, b: 0.4 }, feasible: true, capped: [] });
    expect(capWeightsChecked({}, 0.3).feasible).toBe(true);
  });
});

describe("parseFieldNumber (widget number boxes)", () => {
  it("reads comma decimals, thousands, exponents and symbols; rejects junk", async () => {
    const { parseFieldNumber } = await import("@/lib/academy/shuffle");
    expect(parseFieldNumber("12,5")).toBe(12.5);
    expect(parseFieldNumber(",5")).toBe(0.5);
    expect(parseFieldNumber("1,000")).toBe(1000);
    expect(parseFieldNumber("1,000,000.5")).toBe(1000000.5);
    expect(parseFieldNumber("$ 2,500")).toBe(2500);
    expect(parseFieldNumber("1e3")).toBe(1000);
    expect(parseFieldNumber("−500")).toBe(-500);
    expect(parseFieldNumber("12.5")).toBe(12.5);
    for (const bad of ["", "abc", "1,2,3", "12,5,0", "1e", "Infinity", "NaN", "0x10", "--5", "1.2.3", "1e999"]) expect(parseFieldNumber(bad), bad).toBeNull();
  });
});
