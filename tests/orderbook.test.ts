import { describe, expect, it } from "vitest";
import {
  OrderBook, Participants, averageSpread, breakEvenHalfSpread, darkPoolSim, gmQuotes, luldBand, luldPrices, marketWideBreaker,
  nbbo, previewMarket, retailFill, route, tradesThrough, uncross, type OrderSpec,
} from "@/lib/academy/orderbook";

const lim = (owner: string, side: "buy" | "sell", qty: number, price: number, extra: Partial<OrderSpec> = {}): OrderSpec => ({ owner, side, type: "limit", qty, price, ...extra });
const mkt = (side: "buy" | "sell", qty: number): OrderSpec => ({ owner: "T", side, type: "market", qty });

/** A small book: asks 101×100, 102×200, 104×300; bids 99×100, 98×200, 96×300. */
function book() {
  const b = new OrderBook();
  b.submit(lim("A", "sell", 100, 101));
  b.submit(lim("B", "sell", 200, 102));
  b.submit(lim("C", "sell", 300, 104));
  b.submit(lim("D", "buy", 100, 99));
  b.submit(lim("E", "buy", 200, 98));
  b.submit(lim("F", "buy", 300, 96));
  return b;
}

describe("order book basics", () => {
  it("reports touch, spread, mid and visible depth", () => {
    const b = book();
    expect([b.bestBid(), b.bestAsk(), b.spread(), b.mid()]).toEqual([99, 101, 2, 100]);
    expect(b.depth("sell")).toEqual([{ price: 101, qty: 100, orders: 1 }, { price: 102, qty: 200, orders: 1 }, { price: 104, qty: 300, orders: 1 }]);
    expect(b.depth("buy", 2).map((l) => l.price)).toEqual([99, 98]);
  });

  it("a non-marketable limit order rests and does not trade", () => {
    const b = book();
    const r = b.submit(lim("You", "buy", 50, 100));
    expect(r.status).toBe("resting");
    expect(b.bestBid()).toBe(100);
    expect(b.tape).toHaveLength(0);
  });

  it("rejects malformed orders", () => {
    const b = book();
    expect(b.submit({ owner: "x", side: "buy", type: "limit", qty: 0, price: 100 }).status).toBe("rejected");
    expect(b.submit({ owner: "x", side: "buy", type: "limit", qty: 10 }).status).toBe("rejected");
    expect(b.submit({ owner: "x", side: "buy", type: "stop", qty: 10 }).status).toBe("rejected");
    expect(b.submit({ owner: "x", side: "buy", type: "market", qty: 1.5 }).status).toBe("rejected");
  });

  it("cancel removes a resting order or a pending stop", () => {
    const b = book();
    const r = b.submit(lim("You", "buy", 50, 100));
    expect(b.cancel(r.id)).toBe(true);
    expect(b.bestBid()).toBe(99);
    const s = b.submit({ owner: "You", side: "sell", type: "stop", qty: 10, stopPrice: 90 });
    expect(s.status).toBe("pending-stop");
    expect(b.cancel(s.id)).toBe(true);
    expect(b.stops).toHaveLength(0);
    expect(b.cancel(9999)).toBe(false);
  });

  it("clone is independent", () => {
    const b = book();
    const c = b.clone();
    c.submit(mkt("buy", 150));
    expect(b.bestAsk()).toBe(101);
    expect(c.bestAsk()).toBe(102);
  });
});

describe("price-time priority", () => {
  it("at the same price, the earlier order fills first", () => {
    const b = new OrderBook();
    const first = b.submit(lim("First", "sell", 100, 50));
    const second = b.submit(lim("Second", "sell", 100, 50));
    expect(b.queuePosition(first.id)).toBe(0);
    expect(b.queuePosition(second.id)).toBe(1);
    const r = b.submit(mkt("buy", 60));
    expect(r.fills.map((f) => [f.makerOwner, f.qty])).toEqual([["First", 60]]);
    // A partly filled order keeps its place at the front.
    expect(b.queuePosition(first.id)).toBe(0);
    expect(b.find(first.id)!.qty).toBe(40);
  });

  it("a better price beats an earlier time", () => {
    const b = new OrderBook();
    b.submit(lim("Early", "buy", 100, 50));
    b.submit(lim("Better", "buy", 100, 51));
    const r = b.submit(mkt("sell", 100));
    expect(r.fills[0].makerOwner).toBe("Better");
  });

  it("trades at the resting order's price, so an aggressive limit gets price improvement", () => {
    const b = book();
    const r = b.submit(lim("You", "buy", 50, 103));
    expect(r.status).toBe("filled");
    expect(r.avgPrice).toBe(101);
  });
});

describe("partial fills, market orders and slippage", () => {
  it("a marketable limit fills partly and rests the remainder at its limit", () => {
    const b = book();
    const r = b.submit(lim("You", "buy", 250, 101));
    expect(r.status).toBe("partial-resting");
    expect(r.filled).toBe(100);
    expect(r.resting).toBe(150);
    expect(b.bestBid()).toBe(101);
    expect(b.bestAsk()).toBe(102);
  });

  it("a market order walks the book: average price, worst price and slippage", () => {
    const b = book();
    const p = previewMarket(b, "buy", 400);
    // 100 @ 101 + 200 @ 102 + 100 @ 104 = 40,900 / 400 = 102.25
    expect(p.avgPrice).toBe(102.25);
    expect(p.worstPrice).toBe(104);
    expect(p.levels).toBe(3);
    expect(p.slippageVsTouch).toBeCloseTo(1.25, 10);
    expect(p.slippageVsMid).toBeCloseTo(2.25, 10);
    // The preview did not change the book.
    expect(b.bestAsk()).toBe(101);
    const r = b.submit(mkt("buy", 400));
    expect(r.avgPrice).toBe(102.25);
    expect(b.bestAsk()).toBe(104);
    expect(b.spread()).toBe(5); // the touch is gone, so the spread widened
  });

  it("slippage grows with order size", () => {
    const b = book();
    const s = [50, 150, 300, 500].map((q) => previewMarket(b, "sell", q).slippageVsTouch!);
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThan(s[i - 1]);
  });

  it("a market order larger than the book fills what exists and cancels the rest", () => {
    const b = book();
    const r = b.submit(mkt("buy", 1000));
    expect(r.filled).toBe(600);
    expect(r.cancelled).toBe(400);
    expect(r.status).toBe("partial-cancelled");
    expect(b.bestAsk()).toBeNull();
    expect(b.submit(mkt("buy", 10)).status).toBe("cancelled");
  });

  it("buy and sell volume on the tape always match", () => {
    const b = book();
    b.submit(mkt("buy", 250));
    b.submit(mkt("sell", 150));
    const total = b.tape.reduce((a, f) => a + f.qty, 0);
    expect(total).toBe(400);
    expect(b.tape.every((f) => f.qty > 0)).toBe(true);
  });
});

describe("time in force", () => {
  it("IOC fills what it can at once and cancels the rest", () => {
    const b = book();
    const r = b.submit(lim("You", "buy", 250, 102, { tif: "ioc" }));
    expect(r.filled).toBe(250);
    const r2 = b.submit(lim("You", "buy", 200, 102, { tif: "ioc" }));
    expect(r2.filled).toBe(50);
    expect(r2.cancelled).toBe(150);
    expect(b.bestBid()).toBe(99); // nothing rested
  });

  it("FOK fills everything or nothing", () => {
    const b = book();
    const no = b.submit(lim("You", "buy", 350, 102, { tif: "fok" }));
    expect(no.status).toBe("cancelled");
    expect(no.filled).toBe(0);
    expect(b.tape).toHaveLength(0);
    const yes = b.submit(lim("You", "buy", 300, 102, { tif: "fok" }));
    expect(yes.status).toBe("filled");
  });
});

describe("stops", () => {
  it("a sell stop becomes a market order and can fill well below its trigger", () => {
    const b = book();
    const s = b.submit({ owner: "You", side: "sell", type: "stop", qty: 200, stopPrice: 99 });
    expect(s.status).toBe("pending-stop");
    const r = b.submit(mkt("sell", 100)); // trades at 99, which triggers the stop
    expect(r.triggered).toHaveLength(1);
    const t = r.triggered[0];
    expect(t.status).toBe("filled");
    expect(t.avgPrice).toBe(98); // all 200 at 98: one tick below the trigger
  });

  it("a stop-limit protects the price but may not fill at all after a gap", () => {
    const b = book();
    b.submit({ owner: "You", side: "sell", type: "stop-limit", qty: 100, stopPrice: 99, price: 99 });
    const r = b.submit(mkt("sell", 300)); // 100 @ 99, 200 @ 98 → last 98, stop fires
    const t = r.triggered[0];
    expect(t.filled).toBe(0);
    expect(t.status).toBe("resting");
    expect(b.bestAsk()).toBe(99); // the stop-limit now sits as an offer at 99
  });

  it("stops can cascade: one triggered stop's trades trigger the next", () => {
    const b = book();
    b.submit({ owner: "S1", side: "sell", type: "stop", qty: 100, stopPrice: 99 });
    b.submit({ owner: "S2", side: "sell", type: "stop", qty: 100, stopPrice: 98 });
    const r = b.submit(mkt("sell", 100));
    expect(r.triggered.length).toBe(2);
    expect(b.last).toBe(98);
  });

  it("a stop whose trigger is already met fires at once", () => {
    const b = book();
    b.submit(mkt("buy", 10)); // last = 101
    const r = b.submit({ owner: "You", side: "buy", type: "stop", qty: 10, stopPrice: 100 });
    expect(r.status).toBe("filled");
  });
});

describe("icebergs", () => {
  it("shows only the display size, trades hidden size, and loses time priority on each refresh", () => {
    const b = new OrderBook();
    const ice = b.submit(lim("Ice", "sell", 500, 100, { display: 100 }));
    b.submit(lim("Plain", "sell", 100, 100));
    expect(b.depth("sell")[0]).toEqual({ price: 100, qty: 200, orders: 2 });
    expect(b.available("buy", 100)).toBe(600);
    const r = b.submit(mkt("buy", 150));
    // 100 from the iceberg's shown slice, then the plain order is ahead of the refreshed slice.
    expect(r.fills.map((f) => [f.makerOwner, f.qty])).toEqual([["Ice", 100], ["Plain", 50]]);
    expect(b.queuePosition(ice.id)).toBe(1);
    expect(b.find(ice.id)!.shown).toBe(100);
    expect(b.find(ice.id)!.qty).toBe(400);
  });

  it("an iceberg's whole size counts for fill-or-kill", () => {
    const b = new OrderBook();
    b.submit(lim("Ice", "sell", 500, 100, { display: 100 }));
    expect(b.submit(lim("You", "buy", 450, 100, { tif: "fok" })).status).toBe("filled");
  });
});

describe("simulated participants", () => {
  it("are deterministic for a seed", () => {
    const run = () => {
      const b = new OrderBook();
      const p = new Participants({ seed: 5, mid: 10000, liquidity: 1 });
      p.seed(b);
      for (let i = 0; i < 50; i++) p.step(b);
      return JSON.stringify([b.depth("buy"), b.depth("sell"), b.tape.length]);
    };
    expect(run()).toBe(run());
  });

  it("keep a two-sided book that never crosses", () => {
    const b = new OrderBook();
    const p = new Participants({ seed: 9, mid: 10000, liquidity: 0.6 });
    p.seed(b);
    for (let i = 0; i < 300; i++) {
      p.step(b);
      if (b.bestBid() !== null && b.bestAsk() !== null) expect(b.bestBid()!).toBeLessThan(b.bestAsk()!);
    }
    expect(b.tape.length).toBeGreaterThan(20);
  });

  it("thin liquidity gives a wider average spread", () => {
    const seeds = [1, 2, 3, 4, 5];
    const avg = (liq: number) => seeds.reduce((a, s) => a + averageSpread({ seed: s, mid: 10000, liquidity: liq }, 300), 0) / seeds.length;
    expect(avg(0.25)).toBeGreaterThan(avg(1.5) * 1.5);
  });
});

describe("call auction", () => {
  it("picks the price that trades the most and gives everyone the same price", () => {
    const r = uncross([
      { side: "buy", qty: 300, price: 102 }, { side: "buy", qty: 200, price: 101 }, { side: "buy", qty: 100, price: 100 },
      { side: "sell", qty: 100, price: 99 }, { side: "sell", qty: 300, price: 100 }, { side: "sell", qty: 300, price: 101 },
    ], 100);
    // At 101: buy 500, sell 700 → 500. At 100: buy 600, sell 400 → 400. At 102: buy 300 → 300.
    expect(r.price).toBe(101);
    expect(r.volume).toBe(500);
    expect(r.imbalance).toBe(200);
    expect(r.imbalanceSide).toBe("sell");
  });

  it("market orders trade at any price; ties go to the smaller imbalance, then nearest the reference", () => {
    const r = uncross([{ side: "buy", qty: 100, price: null }, { side: "sell", qty: 100, price: 98 }, { side: "sell", qty: 100, price: 102 }], 100);
    expect(r.volume).toBe(100);
    expect(r.price).toBe(98);
    const t = uncross([{ side: "buy", qty: 100, price: 105 }, { side: "sell", qty: 100, price: 95 }], 101);
    expect(t.price).toBe(105); // 95 and 105 both trade 100 with no imbalance; 105 is nearer 101
  });

  it("no crossing orders means no auction price", () => {
    expect(uncross([{ side: "buy", qty: 100, price: 99 }, { side: "sell", qty: 100, price: 101 }], 100).price).toBeNull();
  });
});

describe("venues, NBBO and routing", () => {
  const q = [
    { venue: "X", bid: 9998, bidSize: 300, ask: 10002, askSize: 200 },
    { venue: "Y", bid: 9999, bidSize: 100, ask: 10001, askSize: 100 },
    { venue: "Z", bid: 9999, bidSize: 200, ask: 10003, askSize: 500 },
  ];
  it("the best bid and offer across venues", () => {
    expect(nbbo(q)).toEqual({ bid: 9999, bidVenues: ["Y", "Z"], bidSize: 300, ask: 10001, askVenues: ["Y"], askSize: 100 });
  });
  it("routing takes the best prices first across venues", () => {
    const r = route(q, "buy", 400);
    expect(r.fills).toEqual([{ venue: "Y", price: 10001, qty: 100 }, { venue: "X", price: 10002, qty: 200 }, { venue: "Z", price: 10003, qty: 100 }]);
    expect(r.avgPrice).toBe(10002);
  });
  it("detects a trade-through", () => {
    const best = nbbo(q);
    expect(tradesThrough("buy", 10002, best)).toBe(true);
    expect(tradesThrough("buy", 10001, best)).toBe(false);
    expect(tradesThrough("sell", 9998, best)).toBe(true);
  });
});

describe("spread models", () => {
  it("Glosten–Milgrom: no informed traders, no adverse-selection spread", () => {
    const g = gmQuotes({ vLow: 90, vHigh: 110, informed: 0 });
    expect(g.ask).toBeCloseTo(100, 10);
    expect(g.bid).toBeCloseTo(100, 10);
  });
  it("the spread widens with the share of informed traders and reaches the full range when all are informed", () => {
    const s = [0, 0.1, 0.3, 0.6].map((m) => gmQuotes({ vLow: 90, vHigh: 110, informed: m }).spread);
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThan(s[i - 1]);
    expect(gmQuotes({ vLow: 90, vHigh: 110, informed: 0.2 }).spread).toBeCloseTo(4, 10); // ask = 100 + 20·0.2/2
    const all = gmQuotes({ vLow: 90, vHigh: 110, informed: 1 });
    expect([all.bid, all.ask]).toEqual([90, 110]);
  });
  it("order-processing cost adds to both sides", () => {
    const g = gmQuotes({ vLow: 90, vHigh: 110, informed: 0.2, cost: 0.5 });
    expect(g.spread).toBeCloseTo(5, 10);
    expect(g.processing).toBe(1);
    expect(g.adverseSelection).toBeCloseTo(4, 10);
  });
  it("latency race: a provider who always wins the race needs no spread; a slower one needs more", () => {
    expect(breakEvenHalfSpread({ investorRate: 10, jumpRate: 2, jump: 5, loseRace: 0 })).toBe(0);
    const h = breakEvenHalfSpread({ investorRate: 10, jumpRate: 2, jump: 5, loseRace: 0.5 });
    expect(h).toBeCloseTo(5 / 11, 10);
    expect(10 * h).toBeCloseTo(2 * 0.5 * (5 - h), 10); // zero profit
    expect(breakEvenHalfSpread({ investorRate: 10, jumpRate: 2, jump: 5, loseRace: 0.9 })).toBeGreaterThan(h);
  });
});

describe("retail fills and dark pools", () => {
  it("price improvement is measured against the quote; effective spread against the mid", () => {
    const r = retailFill({ bid: 50.0, ask: 50.02, side: "buy", shares: 100, improvementShare: 0.25, pfofPerShare: 0.001 });
    expect(r.price).toBeCloseTo(50.0175, 10);
    expect(r.improvementTotal).toBeCloseTo(0.25, 10);
    expect(r.effectiveHalfSpread).toBeCloseTo(0.0075, 10);
    expect(r.pfofTotal).toBeCloseTo(0.1, 10);
  });
  it("dark pool: deterministic, never overfills, and leftover is bought at the ask", () => {
    const a = darkPoolSim({ seed: 3, qty: 5000, minutes: 30, arrivalPerMin: 0.2, meanSize: 800, vol: 1, drift: 0, halfSpread: 1, impact: 0.5 });
    expect(darkPoolSim({ seed: 3, qty: 5000, minutes: 30, arrivalPerMin: 0.2, meanSize: 800, vol: 1, drift: 0, halfSpread: 1, impact: 0.5 })).toEqual(a);
    expect(a.filled + a.leftover).toBe(5000);
    expect(a.litCostVsStartMid).toBeCloseTo(3.5, 10);
    const none = darkPoolSim({ seed: 3, qty: 5000, minutes: 30, arrivalPerMin: 0, meanSize: 800, vol: 0, drift: 0, halfSpread: 1, impact: 0.5 });
    expect(none.filled).toBe(0);
    expect(none.totalCostVsStartMid).toBeCloseTo(3.5, 10);
  });
  it("dark pool: a price drifting away makes waiting costly", () => {
    const base = { seed: 4, qty: 5000, minutes: 60, arrivalPerMin: 0.05, meanSize: 500, vol: 0, halfSpread: 1, impact: 0.5 };
    expect(darkPoolSim({ ...base, drift: 0.2 }).totalCostVsStartMid).toBeGreaterThan(darkPoolSim({ ...base, drift: 0 }).totalCostVsStartMid);
  });
});

describe("US halts", () => {
  it("LULD bands by price and tier, doubled in the last 25 minutes", () => {
    expect(luldBand(50, 1, false).pct).toBe(5);
    expect(luldBand(50, 2, false).pct).toBe(10);
    expect(luldBand(2, 1, false).pct).toBe(20);
    expect(luldBand(0.5, 2, false).dollars).toBeCloseTo(0.15, 10);
    expect(luldBand(0.1, 2, false).dollars).toBeCloseTo(0.075, 10);
    expect(luldBand(50, 1, true).pct).toBe(10);
    expect(luldBand(50, 2, true)).toEqual({ pct: 10, dollars: null, doubled: false }); // Tier 2 above $3 is not doubled
    expect(luldBand(2, 2, true).pct).toBe(40);
    expect(luldPrices(100, { pct: 5, dollars: null })).toEqual({ lower: 95, upper: 105 });
  });
  it("market-wide circuit breaker levels", () => {
    expect(marketWideBreaker(6.9, true).level).toBe(0);
    expect(marketWideBreaker(7, true)).toEqual({ level: 1, halt: "15-minute market-wide halt" });
    expect(marketWideBreaker(13.5, false).halt).toMatch(/No halt/);
    expect(marketWideBreaker(20, false).level).toBe(3);
  });
});
