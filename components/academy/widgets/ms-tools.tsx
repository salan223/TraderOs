"use client";

import { useMemo, useState } from "react";
import {
  OrderBook, Participants, breakEvenHalfSpread, darkPoolSim, gmQuotes, luldBand, luldPrices, marketWideBreaker, previewMarket, retailFill, uncross,
  type AuctionOrder, type LuldTier, type Side,
} from "@/lib/academy/orderbook";
import { cn } from "@/lib/cn";
import { Bar, Choice, Readout, Readouts, Result, Slider, WidgetFrame, num } from "./kit";
import { LinePlot } from "./risk-plot";

/*
  Smaller tools for the Market Structure track. All numbers are simulated or
  made up for teaching, and say so. Prices are cents unless stated.
*/

type P = { title: string; caption: string };
const usd = (c: number | null | undefined, dp = 2) => (c === null || c === undefined || !Number.isFinite(c) ? "–" : `$${(c / 100).toFixed(dp)}`);
const cents = (c: number | null | undefined, dp = 1) => (c === null || c === undefined || !Number.isFinite(c) ? "–" : `${num(c, dp)}¢`);

function seededBook(seed: number, liquidity: number, steps = 12) {
  const b = new OrderBook();
  const p = new Participants({ seed, mid: 10000, liquidity, levels: 14 });
  p.seed(b);
  for (let i = 0; i < steps; i++) p.step(b);
  return b;
}

// ── L1. Exchange book versus a dealer quote ─────────────────────────────────

const VENUE_BOOK = seededBook(1310, 1, 0);

export function VenueCompare({ title, caption }: P) {
  const [qty, setQty] = useState(500);
  const ex = previewMarket(VENUE_BOOK, "buy", qty);
  const mid = VENUE_BOOK.mid()!;
  // A made-up dealer pricing rule: a fixed half-spread plus a charge that grows with size.
  const dealerHalf = 2 + 0.25 * Math.max(0, qty - 200) / 100;
  const dealer = mid + dealerHalf;
  const better = ex.filled < qty ? "dealer" : ex.avgPrice! < dealer ? "exchange" : ex.avgPrice! > dealer ? "dealer" : "tie";
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Slider label="Shares to buy" value={qty} min={100} max={3000} step={100} onChange={setQty} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-line p-2.5" data-venue="exchange">
          <p className="t-label mb-1">Exchange order book</p>
          <p className="text-[13px] text-fg-muted">Your market order trades against many sellers' limit orders, best price first.</p>
          <Readouts>
            <Readout label="Average price" value={usd(ex.avgPrice, 3)} />
            <Readout label="Price levels used" value={`${ex.levels}`} sub={ex.filled < qty ? `only ${ex.filled} available` : undefined} />
          </Readouts>
        </div>
        <div className="rounded-md border border-line p-2.5" data-venue="dealer">
          <p className="t-label mb-1">Dealer quote (OTC)</p>
          <p className="text-[13px] text-fg-muted">One dealer quotes one price for the whole size and takes the other side itself.</p>
          <Readouts>
            <Readout label="Quoted price" value={usd(dealer, 3)} />
            <Readout label="Counterparty" value="The dealer" />
          </Readouts>
        </div>
      </div>
      <Result tone="info">
        {better === "exchange" ? `For ${qty} shares the book is cheaper here: ${usd(ex.avgPrice, 3)} against the dealer's ${usd(dealer, 3)}.` : better === "dealer" ? `For ${qty} shares the dealer's single price is cheaper here: ${usd(dealer, 3)}${ex.filled < qty ? " (the book could not fill it all)" : ` against ${usd(ex.avgPrice, 3)}`}.` : "Both cost the same here."} The dealer's pricing rule is made up; real quotes depend on the dealer, the client and the market.
      </Result>
    </WidgetFrame>
  );
}

// ── L2. Spread components (Glosten–Milgrom style) ───────────────────────────

export function SpreadComponents({ title, caption }: P) {
  const [informed, setInformed] = useState(20);
  const [range, setRange] = useState(40);
  const [cost, setCost] = useState(1);
  const [inv, setInv] = useState(0);
  const g = gmQuotes({ vLow: 5000 - range / 2, vHigh: 5000 + range / 2, informed: informed / 100, cost });
  // A made-up inventory skew: a dealer who is long shades both quotes down to sell more and buy less.
  const skew = -0.5 * (inv / 1000);
  const bid = g.bid + skew, ask = g.ask + skew;
  const total = g.spread || 1;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Traders who know the true value" value={informed} min={0} max={80} step={5} onChange={setInformed} format={(n) => `${n}%`} />
        <Slider label="How far the value could be from $50" value={range} min={2} max={200} step={2} onChange={setRange} format={(n) => `±${cents(n / 2, 0)}`} />
        <Slider label="Order-processing cost per trade" value={cost} min={0} max={3} step={0.5} onChange={setCost} format={(n) => cents(n)} />
        <Slider label="Market maker's inventory" value={inv} min={-4000} max={4000} step={500} onChange={setInv} format={(n) => `${n > 0 ? "long " : n < 0 ? "short " : ""}${Math.abs(n)} shares`} />
      </div>
      <Readouts cols={3}>
        <Readout label="Bid" value={usd(bid, 3)} tone="up" />
        <Readout label="Ask" value={usd(ask, 3)} tone="down" />
        <Readout label="Spread" value={cents(g.spread, 2)} />
      </Readouts>
      <div className="space-y-2" data-components>
        <Bar label="Adverse selection (losses to better-informed traders)" pct={(g.adverseSelection / total) * 100} value={cents(g.adverseSelection, 2)} />
        <Bar label="Order processing (costs per trade)" pct={(g.processing / total) * 100} tone="muted" value={cents(g.processing, 2)} />
      </div>
      <Result>
        {informed === 0 ? "With nobody better informed, the spread only covers processing costs." : `With ${informed}% informed traders, the market maker loses to them on average, so it charges everyone a wider spread to break even.`}
        {inv !== 0 ? ` Inventory does not widen the spread here; it moves both quotes ${inv > 0 ? "down (to sell more)" : "up (to buy more)"} by ${cents(Math.abs(skew), 2)}.` : ""} This is a simplified model with made-up numbers.
      </Result>
    </WidgetFrame>
  );
}

// ── L5. Slippage curve: how much worse a bigger market order gets ───────────

const IMPACT_BOOKS = { deep: seededBook(1320, 1.6), normal: seededBook(1320, 1), thin: seededBook(1320, 0.3) };
const SIZES = Array.from({ length: 20 }, (_, i) => (i + 1) * 150);

export function ImpactCurve({ title, caption }: P) {
  const [qty, setQty] = useState(900);
  const curves = useMemo(() => Object.fromEntries((Object.keys(IMPACT_BOOKS) as (keyof typeof IMPACT_BOOKS)[]).map((k) => [k, SIZES.map((q) => {
    const p = previewMarket(IMPACT_BOOKS[k], "buy", q);
    return p.filled < q ? NaN : p.slippageVsMid!;
  })])) as Record<keyof typeof IMPACT_BOOKS, number[]>, []);
  const at = (k: keyof typeof IMPACT_BOOKS) => {
    const p = previewMarket(IMPACT_BOOKS[k], "buy", qty);
    return p.filled < qty ? `only ${p.filled} fill` : cents(p.slippageVsMid, 1);
  };
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <LinePlot
        label="Cost of a market buy order, in cents per share from the mid, against order size, for a deep, a normal and a thin simulated book"
        series={[{ values: curves.deep, tone: "up", label: "Deep" }, { values: curves.normal, tone: "accent", label: "Normal" }, { values: curves.thin, tone: "down", label: "Thin" }]}
        xValues={SIZES}
        xLabel="Shares bought at once"
        yFormat={(n) => `${num(n, 0)}¢`}
        xFormat={(n) => `${n}`}
        yMin={0}
      />
      <p className="text-[11px] text-fg-subtle">Green: deep book · blue: normal · red: thin. A line stops where the visible book runs out.</p>
      <Slider label="Order size" value={qty} min={150} max={3000} step={150} onChange={setQty} format={(n) => `${n} shares`} />
      <Readouts cols={3}>
        <Readout label="Deep book" value={at("deep")} />
        <Readout label="Normal book" value={at("normal")} />
        <Readout label="Thin book" value={at("thin")} tone="warn" />
      </Readouts>
      <Result>Cost per share from the mid, if the whole order is sent at once. In a real market other traders also react to your order, which this snapshot leaves out.</Result>
    </WidgetFrame>
  );
}

// ── L6. Call auction ─────────────────────────────────────────────────────────

const AUCTION_BASE: AuctionOrder[] = [
  { side: "buy", qty: 400, price: null }, { side: "buy", qty: 600, price: 5004 }, { side: "buy", qty: 800, price: 5002 }, { side: "buy", qty: 700, price: 5000 }, { side: "buy", qty: 900, price: 4998 },
  { side: "sell", qty: 300, price: null }, { side: "sell", qty: 500, price: 4997 }, { side: "sell", qty: 700, price: 4999 }, { side: "sell", qty: 900, price: 5001 }, { side: "sell", qty: 1000, price: 5003 },
];

export function AuctionTool({ title, caption }: P) {
  const [side, setSide] = useState<Side>("buy");
  const [kind, setKind] = useState<"none" | "market" | "limit">("none");
  const [qty, setQty] = useState(1000);
  const [px, setPx] = useState(5000);
  const orders = kind === "none" ? AUCTION_BASE : [...AUCTION_BASE, { side, qty, price: kind === "market" ? null : px }];
  const r = uncross(orders, 5000);
  const prices = Array.from({ length: 9 }, (_, i) => 5004 - i);
  const rows = prices.map((p) => {
    const buy = orders.filter((o) => o.side === "buy" && (o.price === null || o.price >= p)).reduce((a, o) => a + o.qty, 0);
    const sell = orders.filter((o) => o.side === "sell" && (o.price === null || o.price <= p)).reduce((a, o) => a + o.qty, 0);
    return { p, buy, sell, vol: Math.min(buy, sell) };
  });
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Add your order" value={kind} onChange={setKind} options={[{ id: "none", label: "None" }, { id: "market", label: "Market" }, { id: "limit", label: "Limit" }]} />
        <Choice label="Side" value={side} onChange={setSide} options={[{ id: "buy", label: "Buy" }, { id: "sell", label: "Sell" }]} />
        <Slider label="Your quantity" value={qty} min={100} max={3000} step={100} onChange={setQty} format={(n) => `${n} shares`} />
        {kind === "limit" && <Slider label="Your limit price" value={px} min={4996} max={5004} step={1} onChange={setPx} format={(n) => usd(n)} />}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-0 text-left text-xs" data-auction>
          <thead className="text-fg-subtle"><tr><th className="py-1 pr-2 font-normal">Price</th><th className="py-1 pr-2 font-normal">Would buy</th><th className="py-1 pr-2 font-normal">Would sell</th><th className="py-1 font-normal">Matched</th></tr></thead>
          <tbody className="font-mono tabular">
            {rows.map((x) => (
              <tr key={x.p} className={cn("border-t border-line", x.p === r.price && "bg-accent-soft font-semibold")}>
                <td className="py-0.5 pr-2">{usd(x.p)}{x.p === r.price ? " ◀" : ""}</td><td className="py-0.5 pr-2">{x.buy}</td><td className="py-0.5 pr-2">{x.sell}</td><td className="py-0.5">{x.vol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Readouts cols={3}>
        <Readout label="Auction price" value={usd(r.price)} tone="accent" />
        <Readout label="Shares matched" value={`${r.volume}`} />
        <Readout label="Left unmatched" value={r.imbalance ? `${r.imbalance} ${r.imbalanceSide === "buy" ? "to buy" : "to sell"}` : "none"} />
      </Readouts>
      <Result>Everyone who trades in the auction gets the same price: the one that matches the most shares. Market orders count at every price, so a big one can move the auction price a long way.</Result>
    </WidgetFrame>
  );
}

// ── L7. Several venues: best bid and offer, routing and a trade-through ─────

type Venue = { name: string; asks: [number, number][]; bids: [number, number][] };
const VENUES: Venue[] = [
  { name: "Exchange A", asks: [[5002, 300], [5003, 500], [5005, 800]], bids: [[4998, 300], [4997, 500], [4995, 800]] },
  { name: "Exchange B", asks: [[5001, 200], [5003, 400], [5004, 600]], bids: [[4999, 200], [4997, 400], [4996, 600]] },
  { name: "Exchange C", asks: [[5001, 100], [5002, 300], [5004, 700]], bids: [[4999, 100], [4998, 300], [4996, 700]] },
];

function venueBooks() {
  return VENUES.map((v) => {
    const b = new OrderBook();
    for (const [p, q] of v.asks) b.submit({ owner: v.name, side: "sell", type: "limit", qty: q, price: p });
    for (const [p, q] of v.bids) b.submit({ owner: v.name, side: "buy", type: "limit", qty: q, price: p });
    return { name: v.name, book: b };
  });
}

export function NbboTool({ title, caption }: P) {
  const [side, setSide] = useState<Side>("buy");
  const [qty, setQty] = useState(600);
  const [mode, setMode] = useState<"best" | "one">("best");
  const res = useMemo(() => {
    const books = venueBooks();
    const bestBid = Math.max(...books.map((v) => v.book.bestBid()!)), bestAsk = Math.min(...books.map((v) => v.book.bestAsk()!));
    const fills: { venue: string; price: number; qty: number }[] = [];
    let left = qty;
    if (mode === "one") {
      const r = books[0].book.submit({ owner: "You", side, type: "market", qty });
      for (const f of r.fills) fills.push({ venue: books[0].name, price: f.price, qty: f.qty });
      left -= r.filled;
    } else {
      while (left > 0) {
        const live = books.filter((v) => (side === "buy" ? v.book.bestAsk() : v.book.bestBid()) !== null);
        if (!live.length) break;
        const v = live.reduce((a, b) => ((side === "buy" ? b.book.bestAsk()! < a.book.bestAsk()! : b.book.bestBid()! > a.book.bestBid()!) ? b : a));
        const price = side === "buy" ? v.book.bestAsk()! : v.book.bestBid()!;
        const r = v.book.submit({ owner: "You", side, type: "limit", qty: left, price, tif: "ioc" });
        for (const f of r.fills) fills.push({ venue: v.name, price: f.price, qty: f.qty });
        left -= r.filled;
      }
    }
    const filled = qty - left;
    const avg = filled ? fills.reduce((a, f) => a + f.price * f.qty, 0) / filled : null;
    // A trade-through: a fill at a worse price than another venue was still showing at that moment.
    // Best-price routing always takes the best price available anywhere, so it never trades through.
    const others = books.slice(1);
    const otherBest = side === "buy" ? Math.min(...others.map((v) => v.book.bestAsk() ?? Infinity)) : Math.max(...others.map((v) => v.book.bestBid() ?? -Infinity));
    const through = mode === "one" ? fills.filter((f) => (side === "buy" ? f.price > otherBest : f.price < otherBest)) : [];
    return { bestBid, bestAsk, fills, filled, avg, through };
  }, [side, qty, mode]);
  const best = useMemo(() => {
    const books = venueBooks();
    const bid = Math.max(...books.map((v) => v.book.bestBid()!)), ask = Math.min(...books.map((v) => v.book.bestAsk()!));
    return { bid, ask, bidAt: books.filter((v) => v.book.bestBid() === bid).map((v) => v.name), askAt: books.filter((v) => v.book.bestAsk() === ask).map((v) => v.name) };
  }, []);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="overflow-x-auto">
        <table className="w-full min-w-0 text-left text-xs" data-venues>
          <thead className="text-fg-subtle"><tr><th className="py-1 pr-2 font-normal">Venue</th><th className="py-1 pr-2 font-normal">Best bid</th><th className="py-1 font-normal">Best ask</th></tr></thead>
          <tbody className="font-mono tabular">
            {VENUES.map((v) => (
              <tr key={v.name} className="border-t border-line">
                <td className="py-0.5 pr-2 font-sans">{v.name}</td>
                <td className={cn("py-0.5 pr-2", v.bids[0][0] === best.bid && "font-semibold text-up")}>{usd(v.bids[0][0])} × {v.bids[0][1]}</td>
                <td className={cn("py-0.5", v.asks[0][0] === best.ask && "font-semibold text-down")}>{usd(v.asks[0][0])} × {v.asks[0][1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-fg-muted">Best bid across venues: <span className="font-mono">{usd(best.bid)}</span> ({best.bidAt.join(", ")}). Best ask: <span className="font-mono">{usd(best.ask)}</span> ({best.askAt.join(", ")}). In the US this combined best quote is the NBBO.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Side" value={side} onChange={setSide} options={[{ id: "buy", label: "Buy" }, { id: "sell", label: "Sell" }]} />
        <Choice label="Routing" value={mode} onChange={setMode} options={[{ id: "best", label: "Best price across venues" }, { id: "one", label: "Only Exchange A" }]} />
      </div>
      <Slider label="Shares" value={qty} min={100} max={1500} step={100} onChange={setQty} />
      <ul className="space-y-0.5 text-xs" data-route>
        {res.fills.map((f, i) => <li key={i} className="font-mono tabular">{f.qty} @ {usd(f.price)} on {f.venue}{res.through.includes(f) ? " · worse than a better price shown elsewhere" : ""}</li>)}
      </ul>
      <Readouts cols={3}>
        <Readout label="Average price" value={usd(res.avg, 3)} />
        <Readout label="Filled" value={`${res.filled} of ${qty}`} />
        <Readout label="Shares traded through a better price elsewhere" value={`${res.through.reduce((a, f) => a + f.qty, 0)}`} tone={res.through.length ? "warn" : undefined} />
      </Readouts>
      <Result tone={mode === "one" && res.through.length ? "warn" : "info"}>
        {mode === "one" ? "Sending everything to one venue ignores better prices elsewhere. US rules (the Order Protection Rule) generally stop a venue executing at a worse price than another venue's protected best quote; this tool skips that protection to show why it exists." : "A router takes the best price available on any venue first, then the next best, and so on."}
      </Result>
    </WidgetFrame>
  );
}

// ── L8. Dark pool: midpoint saving against the risk of not filling ──────────

const DARK_RUNS = 200;
export function DarkPoolTool({ title, caption }: P) {
  const [wait, setWait] = useState(30);
  const [arrive, setArrive] = useState(10);
  const [drift, setDrift] = useState(0);
  const out = useMemo(() => {
    let fillShare = 0, cost = 0, worse = 0, lit = 0;
    for (let s = 1; s <= DARK_RUNS; s++) {
      const r = darkPoolSim({ seed: 8800 + s, qty: 10000, minutes: wait, arrivalPerMin: arrive / 100, meanSize: 1500, vol: 0.5, drift: drift / 100, halfSpread: 1, impact: 0.5 });
      fillShare += r.filled / 10000;
      cost += r.totalCostVsStartMid;
      lit = r.litCostVsStartMid;
      if (r.totalCostVsStartMid > r.litCostVsStartMid) worse++;
    }
    return { fillShare: fillShare / DARK_RUNS, cost: cost / DARK_RUNS, lit, worse: worse / DARK_RUNS };
  }, [wait, arrive, drift]);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <p className="text-[13px] text-fg-muted">You want to buy 10,000 shares. Either buy now on the lit book, or rest at the midpoint in a dark pool and buy whatever is left at the end.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Minutes to wait in the dark pool" value={wait} min={5} max={120} step={5} onChange={setWait} format={(n) => `${n} min`} />
        <Slider label="Chance a matching seller arrives each minute" value={arrive} min={0} max={40} step={2} onChange={setArrive} format={(n) => `${n}%`} />
        <Slider label="Price drift against you per minute" value={drift} min={0} max={20} step={1} onChange={setDrift} format={(n) => cents(n / 100, 2)} />
      </div>
      <Readouts cols={3}>
        <Readout label="Average share filled in the dark" value={`${num(out.fillShare * 100, 0)}%`} />
        <Readout label="Average cost, dark then lit" value={`${cents(out.cost, 2)} per share`} sub="from the starting mid" />
        <Readout label="Cost buying all now on the lit book" value={`${cents(out.lit, 2)} per share`} />
      </Readouts>
      <Bar label="Runs where waiting in the dark cost more than buying now" pct={out.worse * 100} tone={out.worse > 0.5 ? "warn" : "accent"} />
      <Result>Averaged over {DARK_RUNS} simulated runs. A midpoint fill saves half the spread and avoids walking the book, but nothing guarantees a fill, and the price can move away while you wait.</Result>
    </WidgetFrame>
  );
}

// ── L9. Latency race: why speed still needs a spread ────────────────────────

export function LatencyTool({ title, caption }: P) {
  const [investors, setInvestors] = useState(10);
  const [jumps, setJumps] = useState(2);
  const [jump, setJump] = useState(4);
  const [racers, setRacers] = useState(3);
  const lose = racers <= 1 ? 0 : (racers - 1) / racers;
  const h = breakEvenHalfSpread({ investorRate: investors, jumpRate: jumps, jump, loseRace: lose });
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Ordinary investor trades per minute" value={investors} min={1} max={50} step={1} onChange={setInvestors} />
        <Slider label="News moments per minute (value jumps)" value={jumps} min={0} max={10} step={0.5} onChange={setJumps} format={(n) => num(n, 1)} />
        <Slider label="Size of each value jump" value={jump} min={1} max={10} step={1} onChange={setJump} format={(n) => cents(n, 0)} />
        <Slider label="Fast firms racing to the stale quote" value={racers} min={1} max={10} step={1} onChange={setRacers} format={(n) => `${n} (quoter loses ${num((n <= 1 ? 0 : (n - 1) / n) * 100, 0)}%)`} />
      </div>
      <Readouts cols={3}>
        <Readout label="Break-even half-spread" value={cents(h, 2)} tone="accent" />
        <Readout label="Break-even spread" value={cents(2 * h, 2)} />
        <Readout label="Paid by investors per minute" value={cents(investors * h, 1)} sub="= lost to sniping" />
      </Readouts>
      <Result>The quoting firm must cancel a stale quote after news before a faster firm trades against it. When it loses that race it loses money, and the spread ordinary investors pay is what covers it. A simplified version of the argument in Budish, Cramton and Shim (2015); the numbers are made up.</Result>
    </WidgetFrame>
  );
}

// ── L10. How a retail order is filled ───────────────────────────────────────

export function RetailFillTool({ title, caption }: P) {
  const [spread, setSpread] = useState(2);
  const [shares, setShares] = useState(200);
  const [impA, setImpA] = useState(20);
  const [impB, setImpB] = useState(60);
  const [pfof, setPfof] = useState(0.1);
  const bid = 50, ask = 50 + spread / 100;
  const a = retailFill({ bid, ask, side: "buy", shares, improvementShare: impA / 100, pfofPerShare: pfof / 100 });
  const b = retailFill({ bid, ask, side: "buy", shares, improvementShare: impB / 100, pfofPerShare: pfof / 100 });
  const d = (x: number, dp = 4) => `$${x.toFixed(dp)}`;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <p className="text-[13px] text-fg-muted">You buy at market. The quote is <span className="font-mono">{d(bid, 2)} / {d(ask, 2)}</span>. Two brokers send the same order to wholesalers that give back different shares of the half-spread.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Quoted spread" value={spread} min={1} max={10} step={1} onChange={setSpread} format={(n) => cents(n, 0)} />
        <Slider label="Shares" value={shares} min={10} max={1000} step={10} onChange={setShares} />
        <Slider label="Broker A: price improvement" value={impA} min={0} max={100} step={5} onChange={setImpA} format={(n) => `${n}% of the half-spread`} />
        <Slider label="Broker B: price improvement" value={impB} min={0} max={100} step={5} onChange={setImpB} format={(n) => `${n}% of the half-spread`} />
        <Slider label="Payment for order flow to the broker" value={pfof} min={0} max={0.3} step={0.05} onChange={setPfof} format={(n) => `${num(n, 2)}¢ per share`} />
      </div>
      <Readouts cols={2}>
        <Readout label="Broker A fill price" value={d(a.price)} sub={`saves ${d(a.improvementTotal, 2)} against the ask`} />
        <Readout label="Broker B fill price" value={d(b.price)} sub={`saves ${d(b.improvementTotal, 2)} against the ask`} />
        <Readout label="Difference on this order" value={d(Math.abs(a.price - b.price) * shares, 2)} tone="accent" />
        <Readout label="Broker's order-flow payment" value={d(a.pfofTotal, 2)} sub="the same for both here" />
      </Readouts>
      <Result>Price improvement is measured against the quoted ask. The real comparison is the effective spread: how far from the mid you paid ({cents(a.effectiveHalfSpread * 100, 2)} for A, {cents(b.effectiveHalfSpread * 100, 2)} for B). The numbers are made up.</Result>
    </WidgetFrame>
  );
}

// ── L11. US halts: LULD bands and market-wide circuit breakers ──────────────

export function HaltTool({ title, caption }: P) {
  const [px, setPx] = useState("50");
  const [tier, setTier] = useState<"1" | "2">("1");
  const [late, setLate] = useState<"no" | "yes">("no");
  const [drop, setDrop] = useState(5);
  const [before, setBefore] = useState<"yes" | "no">("yes");
  const ref = Number(px);
  const band = luldBand(ref, Number(tier) as LuldTier, late === "yes");
  const lim = luldPrices(ref, band);
  const mw = marketWideBreaker(drop, before === "yes");
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <p className="t-label">US: single-stock Limit Up-Limit Down</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Choice label="Price (used for both the tier and the reference)" value={px} onChange={setPx} options={[{ id: "0.5", label: "$0.50" }, { id: "2", label: "$2" }, { id: "50", label: "$50" }, { id: "150", label: "$150" }]} />
        <Choice label="Tier" value={tier} onChange={setTier} options={[{ id: "1", label: "Tier 1" }, { id: "2", label: "Tier 2" }]} />
        <Choice label="Last 25 minutes of the day" value={late} onChange={setLate} options={[{ id: "no", label: "No" }, { id: "yes", label: "Yes" }]} />
      </div>
      <Readouts cols={3}>
        <Readout label="Band" value={band.pct !== null ? `±${band.pct}%` : `±$${band.dollars!.toFixed(3)}`} sub={band.doubled ? "doubled near the close" : undefined} />
        <Readout label="Lower band" value={`$${lim.lower.toFixed(3)}`} tone="down" />
        <Readout label="Upper band" value={`$${lim.upper.toFixed(3)}`} tone="up" />
      </Readouts>
      <p className="t-label pt-1">US: market-wide circuit breakers (S&amp;P 500)</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="S&P 500 fall from the prior close" value={drop} min={0} max={25} step={0.5} onChange={setDrop} format={(n) => `${num(n, 1)}%`} />
        <Choice label="Before 3:25 p.m. Eastern" value={before} onChange={setBefore} options={[{ id: "yes", label: "Yes" }, { id: "no", label: "No" }]} />
      </div>
      <Readouts>
        <Readout label="Level" value={mw.level ? `Level ${mw.level}` : "None"} tone={mw.level ? "warn" : undefined} />
        <Readout label="What happens" value={mw.halt} />
      </Readouts>
      <Result>Simplified. In the real rule the LULD reference is the average price over the previous five minutes, and a stock that stays at a band for 15 seconds pauses for five minutes. Other countries use different mechanisms.</Result>
    </WidgetFrame>
  );
}
