"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderBook, Participants, previewMarket, type OrderResult, type OrderSpec, type OrderType, type Side, type TimeInForce } from "@/lib/academy/orderbook";
import { cn } from "@/lib/cn";
import { Choice, Readout, Readouts, Result, Slider, WidgetFrame, num } from "./kit";
import { Toggle } from "./ta-lab";

/*
  The Market Structure order book simulator. A seeded set of simulated
  participants (a market maker, limit-order traders and small market orders)
  keeps a book going; the learner sends limit, market, stop and stop-limit
  orders with day, IOC or FOK, optionally as an iceberg. Matching is the
  price-time priority engine in lib/academy/orderbook.ts. Prices are cents.
*/

type Liquidity = "deep" | "normal" | "thin";
const LIQ: Record<Liquidity, { label: string; value: number }> = {
  deep: { label: "Deep", value: 1.6 },
  normal: { label: "Normal", value: 1 },
  thin: { label: "Thin", value: 0.3 },
};
const MID = 10000; // $100.00
const usd = (c: number | null | undefined, dp = 2) => (c === null || c === undefined || !Number.isFinite(c) ? "–" : `$${(c / 100).toFixed(dp)}`);
const YOU = "You";

type Preset = "book" | "types" | "slippage" | "thin";
const PRESETS: Record<Preset, { liq: Liquidity; type: OrderType; qty: number; seed: number }> = {
  book: { liq: "normal", type: "limit", qty: 100, seed: 1301 },
  types: { liq: "normal", type: "stop", qty: 200, seed: 1302 },
  slippage: { liq: "normal", type: "market", qty: 800, seed: 1303 },
  thin: { liq: "thin", type: "market", qty: 300, seed: 1304 },
};

type LogRow = { n: number; text: string; result: OrderResult; side: Side; touch: number | null };

function makeSim(liq: Liquidity, seed: number) {
  const book = new OrderBook();
  const parts = new Participants({ seed, mid: MID, liquidity: LIQ[liq].value, levels: 10 });
  parts.seed(book);
  for (let i = 0; i < 12; i++) parts.step(book);
  return { book, parts, log: [] as LogRow[], steps: 12 };
}

const STATUS: Record<OrderResult["status"], string> = {
  filled: "Filled",
  "partial-resting": "Part filled, rest resting",
  resting: "Resting in the book",
  "partial-cancelled": "Part filled, rest cancelled",
  cancelled: "Not filled, cancelled",
  "pending-stop": "Stop waiting for its trigger",
  rejected: "Rejected",
};

export function OrderBookSim({ title, caption, preset = "book" }: { title: string; caption: string; preset?: Preset }) {
  const P = PRESETS[preset];
  const [liq, setLiq] = useState<Liquidity>(P.liq);
  const sim = useRef<ReturnType<typeof makeSim> | null>(null);
  if (sim.current === null) sim.current = makeSim(P.liq, P.seed);
  const [, setV] = useState(0);
  const bump = () => setV((v) => v + 1);
  const { book, log } = sim.current;

  const [side, setSide] = useState<Side>("buy");
  const [type, setType] = useState<OrderType>(P.type);
  const [tif, setTif] = useState<TimeInForce>("day");
  const [qty, setQty] = useState(P.qty);
  const mid = book.mid() ?? MID;
  const [limitOff, setLimitOff] = useState(0); // ticks from the mid
  const [stopOff, setStopOff] = useState(-5);
  const [iceberg, setIceberg] = useState(false);
  const [display, setDisplay] = useState(50);
  const [message, setMessage] = useState<string>("Choose an order and press Send. Press Others trade to let the simulated participants act.");

  const limitPx = Math.round(mid) + limitOff;
  const stopPx = Math.round(mid) + stopOff;
  const isLimit = type === "limit" || type === "stop-limit";
  const isStop = type === "stop" || type === "stop-limit";

  const reset = (l: Liquidity) => { setLiq(l); sim.current = makeSim(l, P.seed); setMessage(`New ${LIQ[l].label.toLowerCase()} book.`); bump(); };
  const step = (n: number) => {
    const s = sim.current!;
    const before = s.book.tape.length;
    for (let i = 0; i < n; i++) s.parts.step(s.book);
    s.steps += n;
    const fills = s.book.tape.length - before;
    const mine = s.book.tape.slice(before).filter((f) => f.makerOwner === YOU);
    setMessage(`${n === 1 ? "One round" : `${n} rounds`} of simulated activity: ${fills} trade${fills === 1 ? "" : "s"}.${mine.length ? ` ${mine.reduce((a, f) => a + f.qty, 0)} of your resting shares traded.` : ""}`);
    bump();
  };

  const preview = type === "market" ? previewMarket(book, side, qty) : null;

  const send = () => {
    const s = sim.current!;
    const touch = side === "buy" ? s.book.bestAsk() : s.book.bestBid();
    const spec: OrderSpec = {
      owner: YOU, side, type, qty,
      tif: type === "market" || type === "stop" ? "ioc" : tif,
      ...(isLimit ? { price: limitPx } : {}),
      ...(isStop ? { stopPrice: stopPx } : {}),
      ...(iceberg && type === "limit" && tif === "day" && display < qty ? { display } : {}),
    };
    const r = s.book.submit(spec);
    const desc = `${side === "buy" ? "Buy" : "Sell"} ${qty} ${type}${isLimit ? ` @ ${usd(limitPx)}` : ""}${isStop ? ` stop ${usd(stopPx)}` : ""}${spec.tif && type !== "market" && type !== "stop" ? ` ${spec.tif.toUpperCase()}` : ""}${spec.display ? ` iceberg ${display}` : ""}`;
    s.log.unshift({ n: s.log.length + 1, text: desc, result: r, side, touch });
    for (const t of r.triggered) s.log.unshift({ n: s.log.length + 1, text: "Triggered stop", result: t, side: t.fills[0]?.aggressor ?? side, touch: null });
    const slip = r.avgPrice !== null && touch !== null ? (side === "buy" ? r.avgPrice - touch : touch - r.avgPrice) : null;
    setMessage(`${desc}: ${STATUS[r.status].toLowerCase()}${r.filled ? `, ${r.filled} at an average ${usd(r.avgPrice, 3)}` : ""}${slip !== null && r.filled ? ` (${num(slip, 1)}¢ ${slip > 0 ? "worse" : "better"} than the touch when you sent it)` : ""}.${r.reason ? ` ${r.reason}` : ""}`);
    bump();
  };

  const asks = book.depth("sell", 8).reverse();
  const bids = book.depth("buy", 8);
  const maxQ = Math.max(1, ...asks.map((l) => l.qty), ...bids.map((l) => l.qty));
  const mineAt = new Set([...book.bids, ...book.asks].filter((o) => o.owner === YOU).map((o) => `${o.side}:${o.price}`));
  const myOrders = [...book.bids, ...book.asks].filter((o) => o.owner === YOU);
  const myStops = book.stops.filter((s) => s.spec.owner === YOU);
  const tape = book.tape.slice(-10).reverse();

  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="flex flex-wrap items-end justify-between gap-2" data-ms-book>
        <Choice label="Simulated liquidity" value={liq} onChange={reset} options={(Object.keys(LIQ) as Liquidity[]).map((id) => ({ id, label: LIQ[id].label }))} />
        <div className="flex gap-2">
          <Button onClick={() => step(1)}>Others trade</Button>
          <Button onClick={() => step(10)}>×10</Button>
        </div>
      </div>

      <Readouts cols={4}>
        <Readout label="Best bid" value={usd(book.bestBid())} tone="up" />
        <Readout label="Best ask" value={usd(book.bestAsk())} tone="down" />
        <Readout label="Spread" value={book.spread() === null ? "–" : `${book.spread()}¢`} sub={book.mid() ? `${num((book.spread()! / book.mid()!) * 10000, 1)} bp of the mid` : undefined} />
        <Readout label="Last trade" value={usd(book.last)} />
      </Readouts>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="mb-1 text-xs text-fg-muted">Order book ladder (visible size; hidden iceberg size is not shown)</p>
          <table className="w-full table-fixed text-xs" data-ladder aria-label="Order book ladder: sellers' asks above, buyers' bids below">
            <thead className="text-fg-subtle"><tr><th className="py-1 text-left font-normal">Bids</th><th className="py-1 text-center font-normal">Price</th><th className="py-1 text-right font-normal">Asks</th></tr></thead>
            <tbody className="font-mono tabular">
              {asks.map((l) => (
                <tr key={`a${l.price}`} className="border-t border-line" data-side="ask">
                  <td />
                  <td className={cn("py-0.5 text-center", mineAt.has(`sell:${l.price}`) && "font-semibold text-accent-strong")}>{usd(l.price)}{mineAt.has(`sell:${l.price}`) ? " ●" : ""}</td>
                  <td className="relative py-0.5 text-right"><span className="absolute inset-y-0.5 right-0 rounded-sm bg-down/15" style={{ width: `${(l.qty / maxQ) * 100}%` }} aria-hidden /><span className="relative">{l.qty}</span></td>
                </tr>
              ))}
              <tr className="border-t border-line-strong"><td colSpan={3} className="py-0.5 text-center text-[11px] text-fg-subtle">spread {book.spread() ?? "–"}¢ · mid {usd(book.mid(), 3)}</td></tr>
              {bids.map((l) => (
                <tr key={`b${l.price}`} className="border-t border-line" data-side="bid">
                  <td className="relative py-0.5 text-left"><span className="absolute inset-y-0.5 left-0 rounded-sm bg-up/15" style={{ width: `${(l.qty / maxQ) * 100}%` }} aria-hidden /><span className="relative">{l.qty}</span></td>
                  <td className={cn("py-0.5 text-center", mineAt.has(`buy:${l.price}`) && "font-semibold text-accent-strong")}>{usd(l.price)}{mineAt.has(`buy:${l.price}`) ? " ●" : ""}</td>
                  <td />
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1 text-[11px] text-fg-subtle">● marks a price where you have an order resting.</p>
        </div>

        <div className="min-w-0 space-y-3" data-ticket>
          <p className="text-xs text-fg-muted">Your order ticket</p>
          <Choice label="Side" value={side} onChange={setSide} options={[{ id: "buy", label: "Buy" }, { id: "sell", label: "Sell" }]} />
          <Choice label="Order type" value={type} onChange={setType} options={[{ id: "market", label: "Market" }, { id: "limit", label: "Limit" }, { id: "stop", label: "Stop" }, { id: "stop-limit", label: "Stop-limit" }]} />
          {(type === "limit" || type === "stop-limit") && (
            <Choice label="Time in force" value={tif} onChange={setTif} options={[{ id: "day", label: "Day" }, { id: "ioc", label: "IOC" }, { id: "fok", label: "FOK" }]} />
          )}
          <Slider label="Quantity (shares)" value={qty} min={10} max={2000} step={10} onChange={setQty} />
          {isLimit && <Slider label="Limit price" value={limitOff} min={-20} max={20} step={1} onChange={setLimitOff} format={(o) => `${usd(Math.round(mid) + o)} (${o >= 0 ? "+" : ""}${o}¢ from mid)`} />}
          {isStop && <Slider label="Stop trigger price" value={stopOff} min={-20} max={20} step={1} onChange={setStopOff} format={(o) => `${usd(Math.round(mid) + o)} (${o >= 0 ? "+" : ""}${o}¢ from mid)`} />}
          {type === "limit" && tif === "day" && (
            <div className="space-y-2">
              <Toggle label="Iceberg (show only part)" checked={iceberg} onChange={setIceberg} />
              {iceberg && <Slider label="Shown size" value={display} min={10} max={500} step={10} onChange={setDisplay} />}
            </div>
          )}
          {preview && (
            <p className="text-[12px] text-fg-muted" data-preview>
              {preview.filled === 0 ? "Nothing on the other side to trade with." : `Now this would fill ${preview.filled} across ${preview.levels} price level${preview.levels === 1 ? "" : "s"} at an average ${usd(preview.avgPrice, 3)}: ${num(preview.slippageVsTouch, 1)}¢ beyond the touch, ${num(preview.slippageVsMid, 1)}¢ from the mid.`}
            </p>
          )}
          <Button variant="primary" onClick={send}>Send order</Button>
        </div>
      </div>

      <Result>{message}</Result>

      {(myOrders.length > 0 || myStops.length > 0) && (
        <div className="space-y-1" data-my-orders>
          <p className="text-xs text-fg-muted">Your resting orders</p>
          {myOrders.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-2 py-1 text-xs">
              <span className="font-mono tabular">{o.side === "buy" ? "Buy" : "Sell"} {o.qty}{o.display ? ` (showing ${o.shown})` : ""} @ {usd(o.price)} · queue position {book.queuePosition(o.id) + 1}</span>
              <Button variant="ghost" className="h-7 px-2" onClick={() => { book.cancel(o.id); setMessage(`Cancelled your order at ${usd(o.price)}.`); bump(); }}>Cancel</Button>
            </div>
          ))}
          {myStops.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed border-line px-2 py-1 text-xs">
              <span className="font-mono tabular">{s.spec.side === "buy" ? "Buy" : "Sell"} {s.spec.qty} {s.spec.type} · triggers at {usd(s.spec.stopPrice!)}{s.spec.price ? `, limit ${usd(s.spec.price)}` : ""}</span>
              <Button variant="ghost" className="h-7 px-2" onClick={() => { book.cancel(s.id); setMessage("Cancelled your stop."); bump(); }}>Cancel</Button>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="min-w-0" data-fill-log>
          <p className="mb-1 text-xs text-fg-muted">Your fill log</p>
          {log.length === 0 ? <p className="text-xs text-fg-subtle">No orders sent yet.</p> : (
            <ul className="space-y-1 text-xs">
              {log.slice(0, 6).map((r) => (
                <li key={r.n} className="rounded-md border border-line px-2 py-1">
                  <span className="text-fg">{r.text}</span>
                  <span className="block font-mono tabular text-fg-muted">{STATUS[r.result.status]} · filled {r.result.filled}{r.result.avgPrice !== null ? ` @ ${usd(r.result.avgPrice, 3)}` : ""}{r.result.fills.length > 1 ? ` (${r.result.fills.length} fills)` : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="min-w-0" data-tape>
          <p className="mb-1 text-xs text-fg-muted">Time and sales (latest first)</p>
          <table className="w-full table-fixed text-xs">
            <thead className="text-fg-subtle"><tr><th className="py-0.5 text-left font-normal">#</th><th className="py-0.5 text-left font-normal">Price</th><th className="py-0.5 text-right font-normal">Size</th><th className="py-0.5 text-right font-normal">Aggressor</th></tr></thead>
            <tbody className="font-mono tabular">
              {tape.map((f, i) => (
                <tr key={`${f.t}-${i}-${f.makerId}`} className="border-t border-line">
                  <td className="py-0.5 text-fg-subtle">{f.t}</td>
                  <td className={cn("py-0.5", f.aggressor === "buy" ? "text-up" : "text-down")}>{usd(f.price)}</td>
                  <td className="py-0.5 text-right">{f.qty}</td>
                  <td className="truncate py-0.5 text-right">{f.takerOwner === YOU || f.makerOwner === YOU ? "You · " : ""}{f.aggressor === "buy" ? "buyer" : "seller"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WidgetFrame>
  );
}

export const BookSim = (p: { title: string; caption: string }) => <OrderBookSim {...p} preset="book" />;
export const BookTypes = (p: { title: string; caption: string }) => <OrderBookSim {...p} preset="types" />;
export const BookSlippage = (p: { title: string; caption: string }) => <OrderBookSim {...p} preset="slippage" />;
export const BookThin = (p: { title: string; caption: string }) => <OrderBookSim {...p} preset="thin" />;
