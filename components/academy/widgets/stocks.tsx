"use client";

import { useState } from "react";
import { RotateCcw, Send } from "lucide-react";
import {
  applySplit, buybackEps, capBucket, capWeightsChecked, classifySurprise, dividendYield, eps, exDividendPrice, feesOverYears,
  futuresPosition, indexChangePct, indexWeights, marginPctOf, marketCap, matchOrder, navPerUnit, peRatio, premiumPct,
  surprisePct, type Book, type CapBucket, type IndexMember, type MatchResult, type WeightMethod,
} from "@/lib/academy/calc";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Bar, Choice, NumberField, Readout, Readouts, Result, Slider, WidgetFrame, bigMoney, money, num, signed, useSvgText } from "./kit";

type FrameProps = { title: string; caption: string };

// ── 10. Order book ──────────────────────────────────────────────────────────

const START_BOOK: Book = {
  asks: [{ price: 50.02, qty: 300 }, { price: 50.03, qty: 500 }, { price: 50.05, qty: 800 }, { price: 50.08, qty: 1200 }],
  bids: [{ price: 49.99, qty: 400 }, { price: 49.98, qty: 600 }, { price: 49.95, qty: 900 }, { price: 49.9, qty: 1500 }],
};
const cloneBook = (b: Book): Book => ({ asks: b.asks.map((l) => ({ ...l })), bids: b.bids.map((l) => ({ ...l })) });

function describe(r: MatchResult, side: "buy" | "sell", type: "market" | "limit", qty: number, limit: number) {
  const verb = side === "buy" ? "bought" : "sold";
  const fills = r.fills.map((f) => `${f.qty} at $${f.price.toFixed(2)}`).join(", ");
  switch (r.status) {
    case "filled":
      return `Filled: ${verb} all ${qty} shares (${fills}). Average price $${r.avgPrice!.toFixed(3)}.${r.fills.length > 1 ? " The order was bigger than the best level, so it walked up the book to worse prices: that is slippage." : ""}`;
    case "partial-rested":
      return `Partly filled: ${verb} ${r.filledQty} (${fills}). The other ${r.restedQty} now wait in the book as a ${side === "buy" ? "bid" : "ask"} at $${limit.toFixed(2)}, because nobody is ${side === "buy" ? "selling that cheaply" : "paying that much"} yet.`;
    case "rested":
      return `Resting: no one is ${side === "buy" ? "selling at" : "buying at"} $${limit.toFixed(2)} or better, so your ${qty} shares join the book as a new ${side === "buy" ? "bid" : "ask"}. It fills only if the price comes to you, and may never fill.`;
    case "partial-cancelled":
      return `Book ran out: ${verb} ${r.filledQty} (${fills}). The remaining ${r.cancelledQty} could not be filled. Real markets are deeper, but thin stocks can behave like this.`;
    case "unfilled":
      return "Nothing on the other side of the book, so nothing could be filled.";
    default:
      return type === "limit" ? "Choose a limit price above zero." : "Choose a quantity.";
  }
}

export function OrderBook({ title, caption }: FrameProps) {
  const [book, setBook] = useState<Book>(() => cloneBook(START_BOOK));
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"market" | "limit">("market");
  const [qty, setQty] = useState(500);
  const [limit, setLimit] = useState(50.0);
  const [last, setLast] = useState<{ text: string; tone: "good" | "info" | "warn"; prices: number[] } | null>(null);
  const bestBid = book.bids[0]?.price, bestAsk = book.asks[0]?.price;
  const maxQty = Math.max(1, ...book.asks.map((l) => l.qty), ...book.bids.map((l) => l.qty));
  const submit = () => {
    const r = matchOrder(book, { side, type, qty, limit: type === "limit" ? limit : undefined });
    setBook(r.book);
    setLast({
      text: describe(r, side, type, qty, limit),
      tone: r.status === "filled" ? "good" : r.status === "invalid" || r.status === "unfilled" || r.status === "partial-cancelled" ? "warn" : "info",
      prices: r.fills.map((f) => f.price),
    });
  };
  const reset = () => { setBook(cloneBook(START_BOOK)); setLast(null); };
  const Row = ({ price, qty: q, kind }: { price: number; qty: number; kind: "ask" | "bid" }) => (
    <li className={cn("relative flex justify-between gap-2 overflow-hidden rounded px-2 py-1 font-mono text-xs tabular", last?.prices.includes(price) && "ring-1 ring-accent")}>
      <span aria-hidden className={cn("absolute inset-y-0 right-0 transition-[width] duration-300 motion-reduce:transition-none", kind === "ask" ? "bg-down-soft" : "bg-up-soft")} style={{ width: `${(q / maxQty) * 100}%` }} />
      <span className={cn("relative", kind === "ask" ? "text-down" : "text-up")}>${price.toFixed(2)}</span>
      <span className="relative text-fg-muted">{q.toLocaleString("en-US")}</span>
    </li>
  );
  return (
    <WidgetFrame title={title} caption={caption}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 rounded-md border border-line bg-panel p-2" aria-label="Order book for the fictional Example Co">
          <p className="flex justify-between px-2 pb-1 text-[10px] uppercase tracking-[0.06em] text-fg-subtle"><span>Price</span><span>Shares waiting</span></p>
          <p className="px-2 text-[11px] text-fg-subtle">Asks (sellers), cheapest at the bottom</p>
          <ul className="space-y-0.5" aria-label="Asks">
            {[...book.asks].reverse().map((l) => <Row key={`a${l.price}`} price={l.price} qty={l.qty} kind="ask" />)}
            {book.asks.length === 0 && <li className="px-2 py-1 text-xs text-fg-subtle">No sellers left</li>}
          </ul>
          <p className="my-1 border-y border-line px-2 py-1 text-center text-[11px] text-fg-muted">
            Spread {bestAsk !== undefined && bestBid !== undefined ? `$${(bestAsk - bestBid).toFixed(2)}` : "—"}
          </p>
          <ul className="space-y-0.5" aria-label="Bids">
            {book.bids.map((l) => <Row key={`b${l.price}`} price={l.price} qty={l.qty} kind="bid" />)}
            {book.bids.length === 0 && <li className="px-2 py-1 text-xs text-fg-subtle">No buyers left</li>}
          </ul>
          <p className="px-2 pt-1 text-[11px] text-fg-subtle">Bids (buyers), highest at the top</p>
        </div>
        <div className="min-w-0 space-y-3">
          <Choice label="Side" value={side} onChange={setSide} options={[{ id: "buy", label: "Buy" }, { id: "sell", label: "Sell" }]} />
          <Choice label="Order type" value={type} onChange={setType} options={[{ id: "market", label: "Market" }, { id: "limit", label: "Limit" }]} />
          <Slider label="Shares" value={qty} min={100} max={3000} step={100} onChange={setQty} format={(n) => n.toLocaleString("en-US")} />
          {type === "limit" && <Slider label="Limit price" value={limit} min={49.85} max={50.15} step={0.01} onChange={setLimit} format={(n) => `$${n.toFixed(2)}`} hint={side === "buy" ? "Buy at this price or lower." : "Sell at this price or higher."} />}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={submit}><Send className="size-3.5" aria-hidden /> Send order</Button>
            <Button variant="ghost" onClick={reset}><RotateCcw className="size-3.5" aria-hidden /> Reset book</Button>
          </div>
        </div>
      </div>
      <Result tone={last?.tone ?? "info"}>{last?.text ?? "Choose an order and press Send. Try a market buy of 1,000 shares, then a limit buy at $49.97."}</Result>
    </WidgetFrame>
  );
}

// ── 11. Earnings ────────────────────────────────────────────────────────────

type Guidance = "raised" | "kept" | "cut";

function reaction(s: "beat" | "in-line" | "miss" | null, g: Guidance) {
  if (s === null) return "Set an expected EPS that is not zero to compare.";
  if (s === "beat" && g === "cut") return "Beat, but guidance was cut: the share price can still fall. Investors pay for the future, and the company just said the future looks weaker.";
  if (s === "beat" && g === "raised") return "Beat and raised guidance: often welcomed. Even so, if investors had hoped for more than the published forecast, or the price had already risen a lot, the reaction can be muted or negative.";
  if (s === "beat") return "Beat with guidance kept: usually seen as positive, but how much depends on the size of the beat and what was already priced in.";
  if (s === "miss" && g === "raised") return "Missed this quarter, but raised guidance: a mixed picture. The price could go either way depending on which part investors trust more.";
  if (s === "miss") return `Missed${g === "cut" ? " and cut guidance" : ""}: often taken badly, because the company earned less than hoped${g === "cut" ? " and expects less ahead" : ""}. A miss caused by a one-off cost may matter less.`;
  return g === "cut" ? "In line, but guidance was cut: the outlook dominates, and that can push the price down." : g === "raised" ? "In line with raised guidance: the outlook improved, which is often taken well." : "In line and nothing changed: there may be little reaction because the result was priced in.";
}

export function EarningsToy({ title, caption }: FrameProps) {
  const SHARES = 100; // million
  const [revenue, setRevenue] = useState(500);
  const [costs, setCosts] = useState(440);
  const [expected, setExpected] = useState(0.55);
  const [guidance, setGuidance] = useState<Guidance>("kept");
  const [price, setPrice] = useState(48);
  const profit = revenue - costs;
  const e = eps(profit * 1e6, SHARES * 1e6);
  const sp = e === null ? null : surprisePct(e, expected);
  const s = e === null ? null : classifySurprise(e, expected);
  // P/E is defined on a YEAR of earnings. Simplification: this quarter × 4.
  const yearlyEps = e === null ? null : e * 4;
  const pe = yearlyEps === null ? null : peRatio(price, yearlyEps);
  const margin = marginPctOf(profit, revenue);
  return (
    <WidgetFrame title={title} caption={caption}>
      <p className="text-[13px] text-fg-muted">Fictional company <strong className="font-medium text-fg">Harbour Bikes</strong> has 100 million shares. All figures are made up.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Revenue this quarter" value={revenue} min={300} max={700} step={5} onChange={setRevenue} format={(n) => `$${n}m`} />
        <Slider label="All costs, interest and tax" value={costs} min={250} max={700} step={5} onChange={setCosts} format={(n) => `$${n}m`} />
        <Slider label="Analysts expected EPS" value={expected} min={0.1} max={1.5} step={0.05} onChange={setExpected} format={(n) => `$${num(n, 2)}`} />
        <Slider label="Share price" value={price} min={5} max={150} step={1} onChange={setPrice} format={(n) => `$${num(n, 2)}`} />
      </div>
      <Choice label="Guidance for next quarter" value={guidance} onChange={setGuidance} options={[{ id: "raised", label: "Raised" }, { id: "kept", label: "Kept" }, { id: "cut", label: "Cut" }]} />
      <div className="space-y-1.5" aria-hidden>
        <Bar label="Revenue" pct={(revenue / 700) * 100} tone="muted" value={`$${revenue}m`} />
        <Bar label="Costs" pct={(costs / 700) * 100} tone="warn" value={`$${costs}m`} />
        <Bar label={profit >= 0 ? "Profit" : "Loss"} pct={(Math.abs(profit) / 700) * 100} tone={profit >= 0 ? "up" : "down"} value={`${profit < 0 ? "−" : ""}$${Math.abs(profit)}m`} />
      </div>
      <Readouts cols={4}>
        <Readout label="Profit margin" value={margin === null ? "—" : `${num(margin, 1)}%`} />
        <Readout label="EPS this quarter (profit ÷ shares)" value={money(e)} tone="accent" />
        <Readout label="vs forecast" value={sp === null ? "—" : signed(sp, 1, "%")} tone={s === "beat" ? "up" : s === "miss" ? "down" : undefined} sub={s ?? undefined} />
        <Readout label="P/E (price ÷ yearly EPS)" value={pe === null ? "n/a" : num(pe, 1)} sub={pe === null ? "Not meaningful for a loss" : `Yearly EPS ≈ this quarter × 4 = ${money(yearlyEps)} (a simplification)`} />
      </Readouts>
      <Result tone={s === "beat" && guidance !== "cut" ? "good" : s === "miss" || guidance === "cut" ? "warn" : "info"}>{reaction(s, guidance)}</Result>
    </WidgetFrame>
  );
}

// ── 12. Market-cap bubbles ──────────────────────────────────────────────────

type Co = { id: string; name: string; sector: string; price: number; shares: number };
const COMPANIES: Co[] = [
  { id: "orbit", name: "Orbit Software", sector: "Technology", price: 240, shares: 2.5e9 },
  { id: "kite", name: "Kite Chips", sector: "Technology", price: 85, shares: 400e6 },
  { id: "meadow", name: "Meadow Health", sector: "Health care", price: 120, shares: 900e6 },
  { id: "pillar", name: "Pillar Bank", sector: "Financials", price: 45, shares: 1.6e9 },
  { id: "acorn", name: "Acorn Grocers", sector: "Consumer staples", price: 30, shares: 300e6 },
  { id: "volt", name: "Volt Utilities", sector: "Utilities", price: 18, shares: 200e6 },
  { id: "rig", name: "Ridgeline Energy", sector: "Energy", price: 64, shares: 700e6 },
  { id: "loom", name: "Loom Apparel", sector: "Consumer discretionary", price: 9, shares: 60e6 },
];
const SECTOR_TONE: Record<string, string> = {
  Technology: "fill-accent", "Health care": "fill-info", Financials: "fill-warn", "Consumer staples": "fill-up",
  Utilities: "fill-fg-subtle", Energy: "fill-down", "Consumer discretionary": "fill-pink-400",
};
const SECTOR_BG: Record<string, string> = {
  Technology: "bg-accent", "Health care": "bg-info", Financials: "bg-warn", "Consumer staples": "bg-up",
  Utilities: "bg-fg-subtle", Energy: "bg-down", "Consumer discretionary": "bg-pink-400",
};
const BUCKET_LABEL: Record<CapBucket, string> = { mega: "Mega-cap", large: "Large-cap", mid: "Mid-cap", small: "Small-cap", micro: "Micro-cap" };

export function CapBubbles({ title, caption }: FrameProps) {
  const [sel, setSel] = useState("kite");
  const [mult, setMult] = useState<Record<string, number>>({});
  const caps = COMPANIES.map((c) => marketCap(c.price * (mult[c.id] ?? 1), c.shares) ?? 0);
  const total = caps.reduce((a, b) => a + b, 0);
  const maxCap = Math.max(...caps);
  const i = COMPANIES.findIndex((c) => c.id === sel);
  const co = COMPANIES[i];
  const m = mult[sel] ?? 1;
  const bucket = capBucket(caps[i]);
  // 4 × 2 grid; radius ∝ √cap so AREA matches value. Labels keep a fixed
  // on-screen size, so the rows are spaced by the current text size (fs, in SVG units).
  const R = 34;
  const svgText = useSvgText(340);
  const fs = parseFloat(String(svgText.style.fontSize)) || 11;
  const rowY = [R + 4, R + 4 + R + fs * 2.7 + 10 + R];
  const H = Math.ceil(rowY[1] + R + fs * 2.6 + 4);
  const sectors = [...new Set(COMPANIES.map((c) => c.sector))];
  return (
    <WidgetFrame title={title} caption={caption}>
      <svg ref={svgText.ref} style={svgText.style} viewBox={`0 0 340 ${H}`} className="mx-auto h-auto w-full max-w-[560px]" role="img" aria-label={`Bubbles sized by market value. ${co.name} is ${bigMoney(caps[i])}.`}>
        {COMPANIES.map((c, k) => {
          const cx = 42 + (k % 4) * 85, cy = rowY[Math.floor(k / 4)];
          const r = Math.max(3, R * Math.sqrt(caps[k] / maxCap));
          return (
            <g key={c.id} onClick={() => setSel(c.id)} className="cursor-pointer">
              <circle cx={cx} cy={cy} r={r} className={cn(SECTOR_TONE[c.sector], "transition-all duration-300 motion-reduce:transition-none", c.id === sel ? "opacity-100" : "opacity-55")} />
              {c.id === sel && <circle cx={cx} cy={cy} r={r + 3} className="fill-none stroke-fg" strokeWidth="1.5" />}
              <text x={cx} y={cy + R} dy="1.1em" textAnchor="middle" className={cn("fill-fg-muted", c.id === sel && "fill-fg font-medium")}>{c.name.split(" ")[0]}</text>
              <text x={cx} y={cy + R} dy="2.25em" textAnchor="middle" className="fill-fg-subtle">{bigMoney(caps[k])}</text>
            </g>
          );
        })}
      </svg>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-fg-muted" aria-label="Sector colours">
        {sectors.map((sec) => (
          <li key={sec} className="inline-flex items-center gap-1.5"><span className={cn("inline-block size-2.5 rounded-full", SECTOR_BG[sec])} aria-hidden />{sec}</li>
        ))}
      </ul>
      <div className="min-w-0">
        <label htmlFor="cap-bubbles-sel" className="block text-xs text-fg-muted">Company</label>
        <select id="cap-bubbles-sel" value={sel} onChange={(e) => setSel(e.target.value)} className="mt-1 h-9 w-full min-w-0 rounded-md border border-line-strong bg-raised px-2 text-[13px] text-fg">
          {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.sector}</option>)}
        </select>
      </div>
      <Slider label={`${co.name} share price`} value={m} min={0.1} max={5} step={0.05} onChange={(n) => setMult((x) => ({ ...x, [sel]: n }))} format={(n) => `$${num(co.price * n, 2)} (×${num(n, 2)})`} />
      <Readouts cols={4}>
        <Readout label="Shares in issue" value={`${num(co.shares / 1e6, 0)}m`} />
        <Readout label="Market cap" value={bigMoney(caps[i])} tone="accent" />
        <Readout label="Size label" value={bucket ? BUCKET_LABEL[bucket] : "—"} />
        <Readout label="Share of this group" value={`${num((caps[i] / total) * 100, 1)}%`} />
      </Readouts>
      <Result>
        {co.name} ({co.sector}): ${num(co.price * m, 2)} × {num(co.shares / 1e6, 0)} million shares = {bigMoney(caps[i])}. A high share price alone does not make a company big: at the starting prices Kite Chips ($85) costs more per share than Pillar Bank ($45), yet Pillar Bank is worth about twice as much because it has four times as many shares. Size labels are rough rules of thumb that differ between providers.
      </Result>
    </WidgetFrame>
  );
}

// ── 13. Index builder ───────────────────────────────────────────────────────

const MEMBERS: (IndexMember & { name: string })[] = [
  { id: "alto", name: "Alto Motors", price: 400, shares: 50e6, float: 1 },
  { id: "birch", name: "Birch Retail", price: 40, shares: 2e9, float: 0.6 },
  { id: "cobalt", name: "Cobalt Mining", price: 25, shares: 1e9, float: 1 },
  { id: "delta", name: "Delta Foods", price: 60, shares: 500e6, float: 1 },
];
const METHODS: { id: WeightMethod; label: string }[] = [
  { id: "price", label: "Price-weighted" },
  { id: "float", label: "Float-adjusted cap" },
  { id: "equal", label: "Equal-weighted" },
];

const CAP = 0.35;

export function IndexBuilder({ title, caption }: FrameProps) {
  const [changes, setChanges] = useState<Record<string, number>>({ alto: 5, birch: -2, cobalt: 0, delta: 1 });
  const [method, setMethod] = useState<WeightMethod>("float");
  const [split, setSplit] = useState(false);
  const [capped, setCapped] = useState(false);
  const members = MEMBERS.map((m) => (split && m.id === "alto" ? { ...m, price: m.price / 4, shares: m.shares * 4 } : m));
  const weightsFor = (meth: WeightMethod) => {
    const w = indexWeights(members, meth);
    return capped && meth === "float" ? capWeightsChecked(w, CAP).weights : w;
  };
  const changeFor = (meth: WeightMethod) => {
    const w = weightsFor(meth);
    return capped && meth === "float"
      ? members.reduce((s, m) => s + w[m.id] * (changes[m.id] ?? 0), 0)
      : indexChangePct(members, changes, meth);
  };
  const w = weightsFor(method);
  const capInfo = capWeightsChecked(indexWeights(members, "float"), CAP);
  return (
    <WidgetFrame title={title} caption={caption}>
      <p className="text-[13px] text-fg-muted">Four fictional companies. Move each one&apos;s price change for the day and compare how three common methods turn them into one index move.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {members.map((m) => (
          <Slider
            key={m.id}
            label={<>{m.name} <span className="text-fg-subtle">(${num(m.price, 0)}, {num(m.shares / 1e6, 0)}m shares{m.float !== 1 ? `, ${num((m.float ?? 1) * 100, 0)}% float` : ""})</span></>}
            value={changes[m.id] ?? 0}
            min={-10}
            max={10}
            step={0.5}
            onChange={(n) => setChanges((c) => ({ ...c, [m.id]: n }))}
            format={(n) => signed(n, 1, "%")}
          />
        ))}
      </div>
      <Readouts cols={3}>
        {METHODS.map((mm) => {
          const c = changeFor(mm.id);
          return <Readout key={mm.id} label={mm.label} value={signed(c, 2, "%")} tone={c === null || Math.abs(c) < 0.005 ? undefined : c > 0 ? "up" : "down"} />;
        })}
      </Readouts>
      <Choice label="Show the weights for" value={method} onChange={setMethod} options={METHODS} />
      <div className="space-y-2">
        {members.map((m) => <Bar key={m.id} label={m.name} pct={(w[m.id] ?? 0) * 100} />)}
      </div>
      <div className="flex flex-col gap-2 text-[13px] text-fg-muted">
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} className="size-4 accent-accent" /> Alto Motors does a 4-for-1 share split</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={capped} onChange={(e) => setCapped(e.target.checked)} className="size-4 accent-accent" /> Cap any one member at 35% (float-adjusted only)</label>
      </div>
      <Result>
        {method === "price" && <>Price-weighted: Alto Motors counts most only because its share price is highest. {split ? "After the split its price is a quarter, so its weight collapses although the company is unchanged. Real price-weighted indices adjust a divisor so the level does not jump, but the weights still change." : "Tick the split box to see how a split, which changes nothing about the company, changes its weight."}</>}
        {method === "float" && <>Float-adjusted: weight = price × shares that are freely available to trade. Birch Retail is the biggest company, but 40% of its shares are held by insiders, so only 60% counts. {capped ? (capInfo.feasible ? "With the cap, any excess above 35% is shared out among the others, as capped (“modified”) indices do." : "A 35% cap cannot be met with this few members (they would add up to less than 100%), so the closest possible result, equal weights, is shown instead.") : ""}</>}
        {method === "equal" && <>Equal-weighted: every member counts 25%, whatever its size, so the index move is the simple average. Small companies matter as much as giants.</>}
      </Result>
    </WidgetFrame>
  );
}

// ── 14. ETF basket ──────────────────────────────────────────────────────────

const HOLDINGS = [
  { id: "alto", name: "Alto Motors", qty: 1000, price: 100 },
  { id: "birch", name: "Birch Retail", qty: 2500, price: 40 },
  { id: "cobalt", name: "Cobalt Mining", qty: 4000, price: 25 },
  { id: "delta", name: "Delta Foods", qty: 1500, price: 60 },
];
const UNITS = 10_000;

export function EtfBasket({ title, caption }: FrameProps) {
  const [moves, setMoves] = useState<Record<string, number>>({});
  const [premium, setPremium] = useState(0);
  const [fee, setFee] = useState(0.2);
  const [invest, setInvest] = useState(10_000);
  const values = HOLDINGS.map((h) => h.qty * h.price * (1 + (moves[h.id] ?? 0) / 100));
  const total = values.reduce((a, b) => a + b, 0);
  const nav = navPerUnit(total, 5000, 0, UNITS);
  const market = nav === null ? null : nav * (1 + premium / 100);
  const prem = market === null || nav === null ? null : premiumPct(market, nav);
  const fee1 = feesOverYears(invest, fee, 1);
  const fee10 = feesOverYears(invest, fee, 10);
  const tones = ["fill-accent", "fill-info", "fill-warn", "fill-up"];
  const basketText = useSvgText(160);
  let y = 150;
  return (
    <WidgetFrame title={title} caption={caption}>
      <div className="grid items-center gap-3 sm:grid-cols-[160px_1fr]">
        <svg ref={basketText.ref} style={basketText.style} viewBox="0 0 160 170" className="mx-auto h-auto w-40" role="img" aria-label={`Fund basket worth ${money(total, "USD", 0)} plus cash`}>
          <path d="M20 30 L30 160 L130 160 L140 30" className="fill-none stroke-line-strong" strokeWidth="2" />
          {HOLDINGS.map((h, k) => {
            const hgt = (values[k] / 600_000) * 120;
            y -= hgt;
            return <rect key={h.id} x="34" y={y + 2} width="92" height={Math.max(1, hgt - 2)} rx="2" className={cn(tones[k], "opacity-80 transition-all duration-300 motion-reduce:transition-none")} />;
          })}
          <text x="80" y="20" textAnchor="middle" className="fill-fg-muted">1 fund = a basket</text>
        </svg>
        <div className="space-y-3">
          {HOLDINGS.map((h, k) => (
            <Slider key={h.id} label={<><span className={cn("mr-1 inline-block size-2 rounded-full", ["bg-accent", "bg-info", "bg-warn", "bg-up"][k])} aria-hidden />{h.name} · {h.qty.toLocaleString("en-US")} shares</>} value={moves[h.id] ?? 0} min={-20} max={20} step={1} onChange={(n) => setMoves((m) => ({ ...m, [h.id]: n }))} format={(n) => signed(n, 0, "%")} />
          ))}
        </div>
      </div>
      <Readouts cols={3}>
        <Readout label="Holdings + $5,000 cash" value={money(total + 5000, "USD", 0)} />
        <Readout label="NAV per unit (÷ 10,000 units)" value={money(nav)} tone="accent" />
        <Readout label="Price on the exchange" value={money(market)} sub={prem === null ? undefined : Math.abs(prem) < 0.005 ? "At NAV" : `${signed(prem, 2, "%")} ${prem > 0 ? "premium" : "discount"}`} />
      </Readouts>
      <Slider label="Exchange price vs NAV" value={premium} min={-2} max={2} step={0.1} onChange={setPremium} format={(n) => signed(n, 1, "%")} hint="For big, liquid ETFs this gap is usually tiny, because large firms can create or redeem units when it opens up." />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Yearly fee (expense ratio)" value={fee} min={0.03} max={1.5} step={0.01} onChange={setFee} format={(n) => `${num(n, 2)}%`} />
        <NumberField label="Amount held (USD)" value={invest} onChange={setInvest} min={0} max={10_000_000} step={1000} />
      </div>
      <Result>Fees: about {money(fee1)} in the first year and {money(fee10)} over ten years on {money(invest, "USD", 0)}, assuming no growth at all (this lesson does not predict returns). The fee is taken from the fund, so you never see a bill; it shows up as the fund trailing its index slightly.</Result>
    </WidgetFrame>
  );
}

// ── 15. Index futures ───────────────────────────────────────────────────────

export function FuturesCalc({ title, caption }: FrameProps) {
  const [level, setLevel] = useState(5000);
  const [mult, setMult] = useState<"50" | "5">("50");
  const [contracts, setContracts] = useState(1);
  const [margin, setMargin] = useState(25_000);
  const [points, setPoints] = useState(-50);
  const [dir, setDir] = useState<"long" | "short">("long");
  const m = Number(mult);
  const scaledMargin = mult === "50" ? margin : margin / 10;
  const f = futuresPosition(level, m, contracts, scaledMargin * contracts, points, dir);
  const pctMove = (points / level) * 100;
  return (
    <WidgetFrame title={title} caption={caption}>
      <p className="text-[13px] text-fg-muted">A sample index futures contract. The index level and margin are made up; exchanges and brokers set real margins and change them.</p>
      <Choice label="Contract size" value={mult} onChange={setMult} options={[{ id: "50", label: "$50 per point (E-mini style)" }, { id: "5", label: "$5 per point (micro style)" }]} />
      <Choice label="Direction" value={dir} onChange={setDir} options={[{ id: "long", label: "Long (buy)" }, { id: "short", label: "Short (sell)" }]} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Index level (sample)" value={level} min={1000} max={8000} step={50} onChange={setLevel} format={(n) => n.toLocaleString("en-US")} />
        <Slider label="Contracts" value={contracts} min={1} max={5} step={1} onChange={setContracts} format={(n) => String(n)} />
        <Slider label={`Margin per contract (${mult === "50" ? "large" : "micro"})`} value={margin} min={5000} max={50000} step={1000} onChange={setMargin} format={(n) => money(mult === "50" ? n : n / 10, "USD", 0)} />
        <Slider label="Index moves" value={points} min={-300} max={300} step={5} onChange={setPoints} format={(n) => `${signed(n, 0)} points (${signed((n / level) * 100, 1, "%")})`} />
      </div>
      <Readouts cols={4}>
        <Readout label="Exposure (notional)" value={money(f?.notional, "USD", 0)} sub="level × $ per point × contracts" />
        <Readout label="Margin posted" value={money(scaledMargin * contracts, "USD", 0)} />
        <Readout label="Effective leverage" value={f?.leverage ? `${num(f.leverage, 1)}×` : "—"} tone="accent" />
        <Readout label="P&L" value={money(f?.pnl, "USD", 0)} tone={!f || f.pnl === 0 ? undefined : f.pnl > 0 ? "up" : "down"} sub={f?.pnlPctOfMargin === null || !f ? undefined : `${signed(f.pnlPctOfMargin, 1, "%")} of margin`} />
      </Readouts>
      <Result tone={f && f.pnlPctOfMargin !== null && f.pnlPctOfMargin <= -50 ? "bad" : "info"}>
        A {signed(pctMove, 1, "%")} index move becomes {f?.pnlPctOfMargin === null || !f ? "—" : signed(f.pnlPctOfMargin, 1, "%")} on the money you put down, because you control {money(f?.notional, "USD", 0)} with {money(scaledMargin * contracts, "USD", 0)}. Gains and losses are settled every day; if your account falls below the maintenance margin (the minimum the exchange requires you to keep while the position is open, a little below the margin needed to open it) you must top it up or the position is closed.
      </Result>
    </WidgetFrame>
  );
}

// ── 16. Splits, dividends, buybacks ─────────────────────────────────────────

export function CorporateActions({ title, caption }: FrameProps) {
  const [tab, setTab] = useState<"split" | "dividend" | "buyback">("split");
  const [ratio, setRatio] = useState<"2" | "3" | "0.1">("2");
  const [div, setDiv] = useState(0.5);
  const [held, setHeld] = useState(100);
  const [bought, setBought] = useState(5);
  return (
    <WidgetFrame title={title} caption={caption}>
      <Choice label="Corporate action" value={tab} onChange={setTab} options={[{ id: "split", label: "Share split" }, { id: "dividend", label: "Dividend" }, { id: "buyback", label: "Buyback" }]} />
      {tab === "split" && <SplitView ratio={Number(ratio)} setRatio={(r) => setRatio(r as "2" | "3" | "0.1")} ratioId={ratio} />}
      {tab === "dividend" && (() => {
        const PRICE = 50;
        const ex = exDividendPrice(PRICE, div);
        const y = dividendYield(div * 4, PRICE);
        return (
          <>
            <Slider label="Dividend per share (paid quarterly)" value={div} min={0} max={2} step={0.05} onChange={setDiv} format={(n) => `$${num(n, 2)}`} />
            <Slider label="Shares you hold" value={held} min={10} max={1000} step={10} onChange={setHeld} format={(n) => String(n)} />
            <Readouts cols={4}>
              <Readout label="Price before ex-date" value={money(PRICE)} />
              <Readout label="Expected price after" value={money(ex)} sub="Before any other news" />
              <Readout label="Cash you receive" value={money(div * held)} tone="up" sub="Before tax" />
              <Readout label="Yearly yield (×4)" value={y === null ? "—" : `${num(y, 1)}%`} />
            </Readouts>
            <Result>On the ex-dividend date the share usually opens lower by about the dividend, because new buyers no longer get it. Shares {money((ex ?? 0) * held)} + cash {money(div * held)} = {money(PRICE * held)}: you were not made richer, part of the company&apos;s value was handed to you as cash (and may be taxed).</Result>
          </>
        );
      })()}
      {tab === "buyback" && (() => {
        const PROFIT = 200e6, SHARES = 100e6;
        const b = buybackEps(PROFIT, SHARES, (bought / 100) * SHARES);
        const myShares = 1e6;
        return (
          <>
            <Slider label="Shares bought back and cancelled" value={bought} min={0} max={30} step={1} onChange={setBought} format={(n) => `${n}%`} />
            <Readouts cols={3}>
              <Readout label="EPS before" value={money(b?.before)} />
              <Readout label="EPS after (same profit)" value={money(b?.after)} tone="accent" sub={b ? signed(b.changePct, 1, "%") : undefined} />
              <Readout label="Your stake (1m shares)" value={`${num((myShares / (SHARES * (1 - bought / 100))) * 100, 2)}%`} sub="was 1.00%" />
            </Readouts>
            <Result>Profit stays $200m, but it is split among fewer shares, so earnings per share rise and remaining owners hold a slightly bigger slice. The company paid cash to do it: whether that was a good use of money depends on the price it paid.</Result>
          </>
        );
      })()}
    </WidgetFrame>
  );
}

function SplitView({ ratio, ratioId, setRatio }: { ratio: number; ratioId: string; setRatio: (r: string) => void }) {
  const PRICE = 300, HELD = 10;
  const s = applySplit(PRICE, HELD, ratio)!;
  const slices = Math.max(1, Math.min(30, Math.round(s.shares)));
  const before = Math.min(30, HELD);
  const pie = (n: number, cx: number) => Array.from({ length: n }, (_, k) => {
    const a0 = (k / n) * 2 * Math.PI - Math.PI / 2, a1 = ((k + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const r = 40;
    const p = n === 1 ? `M${cx - r},60 a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0` : `M${cx},60 L${cx + r * Math.cos(a0)},${60 + r * Math.sin(a0)} A${r},${r} 0 0,1 ${cx + r * Math.cos(a1)},${60 + r * Math.sin(a1)} Z`;
    return <path key={k} d={p} className="fill-accent-soft stroke-accent" strokeWidth="1" />;
  });
  const pieText = useSvgText(320);
  return (
    <>
      <Choice label="Split" value={ratioId} onChange={setRatio} options={[{ id: "2", label: "2-for-1" }, { id: "3", label: "3-for-1" }, { id: "0.1", label: "1-for-10 reverse" }]} />
      <svg ref={pieText.ref} style={pieText.style} viewBox="0 0 320 124" className="mx-auto h-auto w-full max-w-[480px]" role="img" aria-label={`Before: ${HELD} shares at $${PRICE}. After: ${num(s.shares, 0)} shares at $${num(s.price, 2)}. Same total value.`}>
        {pie(before, 70)}
        {pie(slices, 250)}
        <text x="70" y="104" dy="1em" textAnchor="middle" className="fill-fg-muted">{HELD} × ${PRICE}</text>
        <text x="250" y="104" dy="1em" textAnchor="middle" className="fill-fg-muted">{num(s.shares, 0)} × ${num(s.price, 2)}</text>
        <text x="160" y="60" dy="0.35em" textAnchor="middle" className="fill-fg-subtle text-[1.3em]">→</text>
      </svg>
      <Readouts cols={3}>
        <Readout label="Shares you hold" value={`${HELD} → ${num(s.shares, 0)}`} />
        <Readout label="Share price" value={`${money(PRICE)} → ${money(s.price)}`} />
        <Readout label="Your holding" value={`${money(s.value, "USD", 0)} → ${money(s.price * s.shares, "USD", 0)}`} tone="accent" />
      </Readouts>
      <Result>A split cuts the same pizza into {ratio > 1 ? "more" : "fewer"} slices. The company and your stake are worth the same; only the number of shares and the price per share change.{ratio < 1 ? " Reverse splits are often used by companies whose share price has fallen very low." : ""}</Result>
    </>
  );
}
