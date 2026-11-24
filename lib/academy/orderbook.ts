import { rng } from "./charts";

/*
  A small, deterministic limit order book for the Market Structure track.

  Prices are integers in ticks (for example cents), so there is no
  floating-point drift. Matching follows price-time priority: the best price
  trades first and, at the same price, the order that arrived first trades
  first. A trade always happens at the resting (maker) order's price.

  Everything here is a teaching model. Real venues add many rules this
  leaves out (auctions inside the day, self-trade prevention, minimum sizes,
  price collars, fees and more). The simulated participants are random
  processes, not models of any real firm.
*/

export type Side = "buy" | "sell";
export type OrderType = "limit" | "market" | "stop" | "stop-limit";
/** day: rests until cancelled. ioc: fill what you can now, cancel the rest. fok: fill all now or nothing. */
export type TimeInForce = "day" | "ioc" | "fok";

export type OrderSpec = {
  owner: string;
  side: Side;
  type: OrderType;
  qty: number;
  /** Limit price, in ticks (limit and stop-limit). */
  price?: number;
  /** Trigger price, in ticks (stop and stop-limit). */
  stopPrice?: number;
  tif?: TimeInForce;
  /** Iceberg: only this much is shown at a time. */
  display?: number;
};

export type RestingOrder = {
  id: number;
  owner: string;
  side: Side;
  price: number;
  /** Total quantity left, shown and hidden. */
  qty: number;
  /** Quantity currently shown in the book. Equals qty unless it is an iceberg. */
  shown: number;
  display?: number;
  /** Time priority: lower trades first at the same price. Renewed when an iceberg refreshes. */
  seq: number;
  original: number;
};

export type PendingStop = { id: number; seq: number; spec: OrderSpec };

export type Fill = {
  t: number;
  price: number;
  qty: number;
  aggressor: Side;
  takerId: number;
  makerId: number;
  takerOwner: string;
  makerOwner: string;
};

export type OrderStatus = "filled" | "partial-resting" | "resting" | "partial-cancelled" | "cancelled" | "pending-stop" | "rejected";

export type OrderResult = {
  id: number;
  status: OrderStatus;
  filled: number;
  /** Volume-weighted fill price in ticks, or null if nothing filled. */
  avgPrice: number | null;
  fills: Fill[];
  resting: number;
  cancelled: number;
  reason?: string;
  /** Stops triggered by this order's trades (their own results). */
  triggered: OrderResult[];
};

export type Level = { price: number; qty: number; orders: number };

export class OrderBook {
  bids: RestingOrder[] = [];
  asks: RestingOrder[] = [];
  stops: PendingStop[] = [];
  tape: Fill[] = [];
  last: number | null = null;
  clock = 0;
  private nextId = 1;
  private nextSeq = 1;

  clone(): OrderBook {
    const b = new OrderBook();
    b.bids = this.bids.map((o) => ({ ...o }));
    b.asks = this.asks.map((o) => ({ ...o }));
    b.stops = this.stops.map((s) => ({ ...s, spec: { ...s.spec } }));
    b.tape = this.tape.slice();
    b.last = this.last;
    b.clock = this.clock;
    b.nextId = this.nextId;
    b.nextSeq = this.nextSeq;
    return b;
  }

  bestBid(): number | null { return this.bids.length ? this.bids[0].price : null; }
  bestAsk(): number | null { return this.asks.length ? this.asks[0].price : null; }
  spread(): number | null {
    const b = this.bestBid(), a = this.bestAsk();
    return b === null || a === null ? null : a - b;
  }
  mid(): number | null {
    const b = this.bestBid(), a = this.bestAsk();
    return b === null || a === null ? null : (a + b) / 2;
  }

  /** Visible depth by price level, best first. Hidden iceberg quantity is not shown. */
  depth(side: Side, levels = 10): Level[] {
    const book = side === "buy" ? this.bids : this.asks;
    const out: Level[] = [];
    for (const o of book) {
      if (o.shown <= 0) continue;
      const lv = out[out.length - 1];
      if (lv && lv.price === o.price) { lv.qty += o.shown; lv.orders++; }
      else { if (out.length === levels) break; out.push({ price: o.price, qty: o.shown, orders: 1 }); }
    }
    return out;
  }

  /** Total quantity (shown and hidden) that an order on `side` could trade against at or better than `limit`. */
  available(side: Side, limit: number | null): number {
    const opp = side === "buy" ? this.asks : this.bids;
    let n = 0;
    for (const o of opp) {
      if (limit !== null && (side === "buy" ? o.price > limit : o.price < limit)) break;
      n += o.qty;
    }
    return n;
  }

  /** Position of an order in its price level's queue (0 = first), or -1. */
  queuePosition(id: number): number {
    for (const book of [this.bids, this.asks]) {
      const o = book.find((x) => x.id === id);
      if (o) return book.filter((x) => x.price === o.price && x.seq < o.seq).length;
    }
    return -1;
  }

  find(id: number): RestingOrder | undefined {
    return this.bids.find((o) => o.id === id) ?? this.asks.find((o) => o.id === id);
  }

  cancel(id: number): boolean {
    for (const book of [this.bids, this.asks]) {
      const i = book.findIndex((o) => o.id === id);
      if (i >= 0) { book.splice(i, 1); return true; }
    }
    const s = this.stops.findIndex((x) => x.id === id);
    if (s >= 0) { this.stops.splice(s, 1); return true; }
    return false;
  }

  submit(spec: OrderSpec): OrderResult {
    this.clock++;
    const id = this.nextId++;
    const bad = validate(spec);
    if (bad) return { id, status: "rejected", filled: 0, avgPrice: null, fills: [], resting: 0, cancelled: spec.qty, reason: bad, triggered: [] };
    if (spec.type === "stop" || spec.type === "stop-limit") {
      this.stops.push({ id, seq: this.nextSeq++, spec: { ...spec } });
      // A stop whose trigger is already met fires at once.
      const triggered = this.fireStops();
      const self = triggered.find((r) => r.id === id);
      if (self) return { ...self, triggered: triggered.filter((r) => r !== self) };
      return { id, status: "pending-stop", filled: 0, avgPrice: null, fills: [], resting: 0, cancelled: 0, triggered };
    }
    const res = this.execute(id, spec);
    res.triggered = this.fireStops();
    return res;
  }

  private execute(id: number, spec: OrderSpec): OrderResult {
    const isMarket = spec.type === "market" || spec.type === "stop";
    const limit = isMarket ? null : spec.price!;
    const tif: TimeInForce = isMarket ? "ioc" : spec.tif ?? "day";
    const empty = (status: OrderStatus, reason?: string): OrderResult => ({ id, status, filled: 0, avgPrice: null, fills: [], resting: 0, cancelled: spec.qty, reason, triggered: [] });
    if (tif === "fok" && this.available(spec.side, limit) < spec.qty) return empty("cancelled", "Fill-or-kill: not enough quantity at acceptable prices, so nothing traded.");

    const opp = spec.side === "buy" ? this.asks : this.bids;
    const fills: Fill[] = [];
    let left = spec.qty;
    while (left > 0 && opp.length) {
      const top = opp[0];
      if (limit !== null && (spec.side === "buy" ? top.price > limit : top.price < limit)) break;
      // Trade against the shown slice first; an iceberg then refreshes and goes to the back of its level.
      const avail = top.shown > 0 ? top.shown : top.qty;
      const q = Math.min(left, avail);
      const f: Fill = { t: this.clock, price: top.price, qty: q, aggressor: spec.side, takerId: id, makerId: top.id, takerOwner: spec.owner, makerOwner: top.owner };
      fills.push(f);
      this.tape.push(f);
      this.last = top.price;
      left -= q;
      top.qty -= q;
      top.shown -= q;
      if (top.qty <= 0) opp.shift();
      else if (top.shown <= 0) {
        top.shown = Math.min(top.display ?? top.qty, top.qty);
        top.seq = this.nextSeq++;
        opp.shift();
        insert(opp, top);
      }
    }
    const filled = spec.qty - left;
    const avgPrice = filled ? fills.reduce((a, f) => a + f.price * f.qty, 0) / filled : null;
    if (left === 0) return { id, status: "filled", filled, avgPrice, fills, resting: 0, cancelled: 0, triggered: [] };
    if (tif === "day" && limit !== null) {
      const display = spec.display && spec.display < left ? spec.display : undefined;
      insert(spec.side === "buy" ? this.bids : this.asks, { id, owner: spec.owner, side: spec.side, price: limit, qty: left, shown: display ?? left, display, seq: this.nextSeq++, original: spec.qty });
      return { id, status: filled ? "partial-resting" : "resting", filled, avgPrice, fills, resting: left, cancelled: 0, triggered: [] };
    }
    const reason = isMarket ? (opp.length ? undefined : "The book ran out of orders on the other side; the rest was cancelled.") : "Immediate-or-cancel: the part that could not trade at once was cancelled.";
    return { id, status: filled ? "partial-cancelled" : "cancelled", filled, avgPrice, fills, resting: 0, cancelled: left, reason: reason ?? "No more liquidity; the rest was cancelled.", triggered: [] };
  }

  /** Fire every stop whose trigger the last trade has reached, in time order, until none are left to fire. */
  private fireStops(): OrderResult[] {
    const out: OrderResult[] = [];
    for (;;) {
      if (this.last === null) return out;
      const last = this.last;
      const i = this.stops.findIndex((s) => (s.spec.side === "buy" ? last >= s.spec.stopPrice! : last <= s.spec.stopPrice!));
      if (i < 0) return out;
      const [s] = this.stops.splice(i, 1);
      out.push(this.execute(s.id, s.spec.type === "stop" ? { ...s.spec, type: "market", tif: "ioc" } : { ...s.spec, type: "limit" }));
    }
  }
}

function validate(s: OrderSpec): string | null {
  if (!Number.isInteger(s.qty) || s.qty <= 0) return "Quantity must be a whole number above zero.";
  if ((s.type === "limit" || s.type === "stop-limit") && !(Number.isInteger(s.price) && s.price! > 0)) return "A limit order needs a limit price.";
  if ((s.type === "stop" || s.type === "stop-limit") && !(Number.isInteger(s.stopPrice) && s.stopPrice! > 0)) return "A stop order needs a trigger price.";
  if (s.display !== undefined && (!Number.isInteger(s.display) || s.display <= 0)) return "An iceberg's shown size must be a whole number above zero.";
  if (s.type === "market" && s.tif === "day") return "A market order cannot rest in the book.";
  return null;
}

/** Keep a side sorted by price (bids high→low, asks low→high), then by arrival. */
function insert(book: RestingOrder[], o: RestingOrder) {
  const better = (a: RestingOrder, b: RestingOrder) => (a.side === "buy" ? a.price > b.price : a.price < b.price) || (a.price === b.price && a.seq < b.seq);
  let i = 0;
  while (i < book.length && better(book[i], o)) i++;
  book.splice(i, 0, o);
}

// ── Previews and measures ────────────────────────────────────────────────────

export type SweepPreview = { filled: number; avgPrice: number | null; worstPrice: number | null; levels: number; slippageVsTouch: number | null; slippageVsMid: number | null };

/** What a market order of `qty` would do now, without changing the book. Slippage is per unit, in ticks, against the touch and against the mid. */
export function previewMarket(book: OrderBook, side: Side, qty: number): SweepPreview {
  const touch = side === "buy" ? book.bestAsk() : book.bestBid();
  const mid = book.mid();
  const r = book.clone().submit({ owner: "preview", side, type: "market", qty, tif: "ioc" });
  const worst = r.fills.length ? r.fills[r.fills.length - 1].price : null;
  const sign = side === "buy" ? 1 : -1;
  return {
    filled: r.filled,
    avgPrice: r.avgPrice,
    worstPrice: worst,
    levels: new Set(r.fills.map((f) => f.price)).size,
    slippageVsTouch: r.avgPrice === null || touch === null ? null : sign * (r.avgPrice - touch),
    slippageVsMid: r.avgPrice === null || mid === null ? null : sign * (r.avgPrice - mid),
  };
}

// ── Simulated participants ───────────────────────────────────────────────────

export type SimParams = {
  seed: number;
  /** Starting mid, in ticks. */
  mid: number;
  /** 0.2 (thin) to 2 (deep): scales order sizes and how many orders arrive. */
  liquidity: number;
  /** How many price levels the market maker quotes on each side at the start. */
  levels?: number;
};

/** A seeded set of other participants: a market maker who keeps quoting, limit-order traders, cancellers and small market orders. */
export class Participants {
  private r: () => number;
  constructor(readonly p: SimParams) { this.r = rng(p.seed); }

  private size(base: number) { return Math.max(1, Math.round(base * this.p.liquidity * (0.4 + 1.2 * this.r()))) * 10; }

  /** Fill an empty book around the mid. */
  seed(book: OrderBook) {
    const n = this.p.levels ?? 8;
    const half = this.halfSpread();
    const lo = Math.floor(this.p.mid - half), hi = Math.ceil(this.p.mid + half);
    for (let k = 0; k < n; k++) {
      book.submit({ owner: "Market maker", side: "buy", type: "limit", qty: this.size(10 + 4 * k), price: lo - k * this.gap() });
      book.submit({ owner: "Market maker", side: "sell", type: "limit", qty: this.size(10 + 4 * k), price: hi + k * this.gap() });
    }
  }

  /** Thin markets get wider quotes and bigger gaps between levels. */
  halfSpread() { return Math.max(1, Math.round(1.5 / Math.min(1, this.p.liquidity))); }
  private gap() { return this.p.liquidity < 0.5 ? 2 : 1; }

  /** One round of activity from everyone else. Returns the fills that happened. */
  step(book: OrderBook): Fill[] {
    const before = book.tape.length;
    const r = this.r;
    // Cancel: drop a random non-learner order now and then.
    if (r() < 0.35) {
      const pool = [...book.bids, ...book.asks].filter((o) => o.owner !== "You");
      if (pool.length > 6) book.cancel(pool[Math.floor(r() * pool.length)].id);
    }
    // New limit orders a few ticks behind the touch.
    const adds = 1 + Math.floor(r() * 2 * Math.max(0.5, this.p.liquidity));
    for (let k = 0; k < adds; k++) {
      const side: Side = r() < 0.5 ? "buy" : "sell";
      const bb = book.bestBid(), ba = book.bestAsk(), m = book.mid() ?? this.p.mid;
      const off = 1 + Math.floor(r() * 4) * this.gap();
      const price = side === "buy" ? Math.min((ba ?? Math.ceil(m + 1)) - 1, Math.floor((bb ?? m) - off + 1)) : Math.max((bb ?? Math.floor(m - 1)) + 1, Math.ceil((ba ?? m) + off - 1));
      book.submit({ owner: "Limit trader", side, type: "limit", qty: this.size(6), price });
    }
    // A small market order now and then.
    if (r() < 0.45) book.submit({ owner: "Other trader", side: r() < 0.5 ? "buy" : "sell", type: "market", qty: this.size(4), tif: "ioc" });
    // The market maker re-quotes a side that has emptied near the mid.
    const m = book.mid() ?? (book.bestBid() !== null ? book.bestBid()! + this.halfSpread() : book.bestAsk() !== null ? book.bestAsk()! - this.halfSpread() : this.p.mid);
    if (book.bestBid() === null || m - book.bestBid()! > 3 * this.halfSpread()) book.submit({ owner: "Market maker", side: "buy", type: "limit", qty: this.size(10), price: Math.floor(m - this.halfSpread()) });
    if (book.bestAsk() === null || book.bestAsk()! - m > 3 * this.halfSpread()) book.submit({ owner: "Market maker", side: "sell", type: "limit", qty: this.size(10), price: Math.ceil(m + this.halfSpread()) });
    return book.tape.slice(before);
  }
}

/** Average quoted spread (ticks) over `steps` rounds of simulated activity. */
export function averageSpread(p: SimParams, steps: number): number {
  const book = new OrderBook();
  const sim = new Participants(p);
  sim.seed(book);
  let s = 0, n = 0;
  for (let i = 0; i < steps; i++) {
    sim.step(book);
    const sp = book.spread();
    if (sp !== null) { s += sp; n++; }
  }
  return n ? s / n : NaN;
}

// ── Call auctions (opening and closing) ─────────────────────────────────────

export type AuctionOrder = { side: Side; qty: number; /** null = market (at any price). */ price: number | null };
export type AuctionResult = { price: number | null; volume: number; buyAtPrice: number; sellAtPrice: number; imbalance: number; imbalanceSide: Side | null };

/**
 * Uncross a call auction: the single price that trades the most volume.
 * Ties: the smallest leftover imbalance, then the price closest to `reference`.
 * Everyone who trades gets the same price.
 */
export function uncross(orders: readonly AuctionOrder[], reference: number): AuctionResult {
  const prices = [...new Set(orders.flatMap((o) => (o.price === null ? [] : [o.price])))].sort((a, b) => a - b);
  if (!prices.length) prices.push(reference);
  let best: AuctionResult | null = null;
  for (const p of prices) {
    const buy = orders.filter((o) => o.side === "buy" && (o.price === null || o.price >= p)).reduce((a, o) => a + o.qty, 0);
    const sell = orders.filter((o) => o.side === "sell" && (o.price === null || o.price <= p)).reduce((a, o) => a + o.qty, 0);
    const vol = Math.min(buy, sell), imb = Math.abs(buy - sell);
    const cand: AuctionResult = { price: p, volume: vol, buyAtPrice: buy, sellAtPrice: sell, imbalance: imb, imbalanceSide: buy > sell ? "buy" : sell > buy ? "sell" : null };
    if (!best || vol > best.volume || (vol === best.volume && (imb < best.imbalance || (imb === best.imbalance && Math.abs(p - reference) < Math.abs(best.price! - reference))))) best = cand;
  }
  return best!.volume === 0 ? { ...best!, price: null } : best!;
}

// ── Several venues: NBBO and routing ─────────────────────────────────────────

export type VenueQuote = { venue: string; bid: number; bidSize: number; ask: number; askSize: number };
export type Nbbo = { bid: number; bidVenues: string[]; bidSize: number; ask: number; askVenues: string[]; askSize: number };

/** The best bid and best offer across venues (the US calls this the NBBO), with the size at that price. */
export function nbbo(quotes: readonly VenueQuote[]): Nbbo {
  const bid = Math.max(...quotes.map((q) => q.bid)), ask = Math.min(...quotes.map((q) => q.ask));
  const atBid = quotes.filter((q) => q.bid === bid), atAsk = quotes.filter((q) => q.ask === ask);
  return { bid, bidVenues: atBid.map((q) => q.venue), bidSize: atBid.reduce((a, q) => a + q.bidSize, 0), ask, askVenues: atAsk.map((q) => q.venue), askSize: atAsk.reduce((a, q) => a + q.askSize, 0) };
}

export type RouteFill = { venue: string; price: number; qty: number };

/** Route a marketable order across the venues' displayed quotes, best price first (only the top of each venue). */
export function route(quotes: readonly VenueQuote[], side: Side, qty: number): { fills: RouteFill[]; filled: number; avgPrice: number | null } {
  const legs = quotes.map((q) => ({ venue: q.venue, price: side === "buy" ? q.ask : q.bid, size: side === "buy" ? q.askSize : q.bidSize }))
    .sort((a, b) => (side === "buy" ? a.price - b.price : b.price - a.price));
  const fills: RouteFill[] = [];
  let left = qty;
  for (const l of legs) {
    if (left <= 0) break;
    const q = Math.min(left, l.size);
    if (q > 0) { fills.push({ venue: l.venue, price: l.price, qty: q }); left -= q; }
  }
  const filled = qty - left;
  return { fills, filled, avgPrice: filled ? fills.reduce((a, f) => a + f.price * f.qty, 0) / filled : null };
}

/** A trade "trades through" when it happens at a worse price than a better quote shown elsewhere. */
export function tradesThrough(side: Side, price: number, best: Nbbo): boolean {
  return side === "buy" ? price > best.ask : price < best.bid;
}

// ── Spread components: a Glosten–Milgrom style model ────────────────────────

export type GmParams = { vLow: number; vHigh: number; informed: number; /** Order-processing cost per trade, added to each side. */ cost?: number; prior?: number };

/**
 * Zero-profit quotes when a fraction `informed` of traders know whether the
 * value is high or low, and the rest buy or sell at random. The ask is the
 * expected value given that someone buys; the bid, given that someone sells.
 */
export function gmQuotes({ vLow, vHigh, informed: mu, cost = 0, prior = 0.5 }: GmParams) {
  const pBuyH = mu + (1 - mu) / 2, pBuyL = (1 - mu) / 2;
  const pSellH = (1 - mu) / 2, pSellL = mu + (1 - mu) / 2;
  const ev = prior * vHigh + (1 - prior) * vLow;
  const ask = (prior * pBuyH * vHigh + (1 - prior) * pBuyL * vLow) / (prior * pBuyH + (1 - prior) * pBuyL) + cost;
  const bid = (prior * pSellH * vHigh + (1 - prior) * pSellL * vLow) / (prior * pSellH + (1 - prior) * pSellL) - cost;
  return { ask, bid, spread: ask - bid, adverseSelection: ask - bid - 2 * cost, processing: 2 * cost, value: ev };
}

// ── Latency races: why fast quotes still need a spread ──────────────────────

/**
 * A simplified version of the stale-quote argument in Budish, Cramton & Shim
 * (2015). Investors arrive at `investorRate` and pay the half-spread `h`.
 * Public news jumps the value by `jump` at `jumpRate`; when it does, the
 * liquidity provider loses the race to cancel with probability `loseRace`
 * and is "sniped" for (jump − h). Zero profit: investorRate·h = jumpRate·loseRace·(jump − h).
 */
export function breakEvenHalfSpread({ investorRate, jumpRate, jump, loseRace }: { investorRate: number; jumpRate: number; jump: number; loseRace: number }): number {
  const k = jumpRate * loseRace;
  return (k * jump) / (investorRate + k);
}

// ── Retail fills ─────────────────────────────────────────────────────────────

/** A marketable retail order filled off-exchange with some price improvement, compared with a fill at the quote. Prices in dollars. */
export function retailFill({ bid, ask, side, shares, improvementShare, pfofPerShare }: { bid: number; ask: number; side: Side; shares: number; /** Fraction of the half-spread given back, 0–1. */ improvementShare: number; pfofPerShare: number }) {
  const half = (ask - bid) / 2, mid = (ask + bid) / 2;
  const improvement = half * improvementShare;
  const price = side === "buy" ? ask - improvement : bid + improvement;
  return {
    price,
    improvementPerShare: improvement,
    improvementTotal: improvement * shares,
    effectiveHalfSpread: Math.abs(price - mid),
    costVsMid: Math.abs(price - mid) * shares,
    pfofTotal: pfofPerShare * shares,
  };
}

// ── Dark pool: a midpoint order that may or may not fill ────────────────────

export type DarkSim = { filled: number; avgFillVsStart: number; finalMid: number; leftover: number; totalCostVsStartMid: number; litCostVsStartMid: number; fillTimes: number[] };

/**
 * Buy `qty` resting at the midpoint in a dark pool for `minutes`. Matching
 * sellers arrive at random; the mid wanders. Whatever is left at the end is
 * bought at the ask. Costs are in ticks per share, against the starting mid,
 * compared with buying everything at once at the ask (`halfSpread` above mid,
 * plus `impact` ticks per 1,000 shares for walking the lit book).
 */
export function darkPoolSim({ seed, qty, minutes, arrivalPerMin, meanSize, vol, drift, halfSpread, impact }: { seed: number; qty: number; minutes: number; arrivalPerMin: number; meanSize: number; vol: number; drift: number; halfSpread: number; impact: number }): DarkSim {
  const r = rng(seed);
  let mid = 0, left = qty, cost = 0;
  const fillTimes: number[] = [];
  for (let t = 0; t < minutes; t++) {
    mid += drift + vol * (r() + r() + r() - 1.5) * 2;
    if (left > 0 && r() < arrivalPerMin) {
      const q = Math.min(left, Math.max(100, Math.round((meanSize * (0.3 + 1.4 * r())) / 100) * 100));
      cost += q * mid;
      left -= q;
      fillTimes.push(t + 1);
    }
  }
  const filled = qty - left;
  const total = cost + left * (mid + halfSpread + (impact * left) / 1000);
  return {
    filled,
    avgFillVsStart: filled ? cost / filled : 0,
    finalMid: mid,
    leftover: left,
    totalCostVsStartMid: total / qty,
    litCostVsStartMid: halfSpread + (impact * qty) / 1000,
    fillTimes,
  };
}

// ── US trading halts (labelled US in the lessons) ───────────────────────────

export type LuldTier = 1 | 2;

/** Limit Up-Limit Down percentage band (US equities), from the previous close and tier. */
export function luldBand(prevClose: number, tier: LuldTier, lastMinutes: boolean): { pct: number | null; dollars: number | null; doubled: boolean } {
  let pct: number | null, dollars: number | null = null;
  if (prevClose > 3) pct = tier === 1 ? 5 : 10;
  else if (prevClose >= 0.75) pct = 20;
  else { pct = null; dollars = Math.min(0.15, 0.75 * prevClose); }
  const doubled = lastMinutes && (tier === 1 || prevClose <= 3);
  if (doubled) { if (pct !== null) pct *= 2; if (dollars !== null) dollars *= 2; }
  return { pct, dollars, doubled };
}

export function luldPrices(reference: number, band: { pct: number | null; dollars: number | null }) {
  const d = band.pct !== null ? (reference * band.pct) / 100 : band.dollars!;
  return { lower: Math.max(0, reference - d), upper: reference + d };
}

/** US market-wide circuit breaker on the S&P 500's fall from the prior close. */
export function marketWideBreaker(dropPct: number, before325: boolean): { level: 0 | 1 | 2 | 3; halt: string } {
  if (dropPct >= 20) return { level: 3, halt: "Trading stops for the rest of the day" };
  if (dropPct >= 13) return { level: 2, halt: before325 ? "15-minute market-wide halt" : "No halt at or after 3:25 p.m." };
  if (dropPct >= 7) return { level: 1, halt: before325 ? "15-minute market-wide halt" : "No halt at or after 3:25 p.m." };
  return { level: 0, halt: "No market-wide halt" };
}
