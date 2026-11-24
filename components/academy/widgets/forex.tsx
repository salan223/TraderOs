"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Minus, Pause, Play, RotateCcw } from "lucide-react";
import {
  LOT_UNITS, classifyPair, convert, invertRate, marginRequired, marginSnapshot, pctChange, pipSize, pipValue,
  positionSize, quoteFromBidAsk, rolloverNights, spreadCost, swapPerNight, tradingCost, type PairType,
} from "@/lib/academy/calc";
import { SESSIONS, forexSessionStatus } from "@/lib/sessions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Bar, Choice, NumberField, Readout, Readouts, Result, Slider, WidgetFrame, money, num, signed, useMounted, useReducedMotion, useSvgText } from "./kit";

type FrameProps = { title: string; caption: string };

// Sample rates used across the forex illustrations. Round, made-up numbers for
// teaching, NOT current market prices.
const SAMPLE_PAIRS = {
  "EUR/USD": { base: "EUR", quote: "USD", rate: 1.1 },
  "GBP/USD": { base: "GBP", quote: "USD", rate: 1.25 },
  "USD/JPY": { base: "USD", quote: "JPY", rate: 150 },
  "USD/CHF": { base: "USD", quote: "CHF", rate: 0.9 },
  "EUR/GBP": { base: "EUR", quote: "GBP", rate: 0.88 },
} as const;
type SamplePair = keyof typeof SAMPLE_PAIRS;
/** For a USD account: how many dollars one unit of each quote currency is worth, at the sample rates. */
const QUOTE_TO_USD: Record<string, number> = { USD: 1, GBP: 1.25, JPY: 1 / 150, CHF: 1 / 0.9 };

/** Price with the pip digits highlighted: 1.10|25|3 or 150.|25|3. */
function PipDigits({ price, quote }: { price: number; quote: string }) {
  const jpy = quote === "JPY";
  const s = price.toFixed(jpy ? 3 : 5);
  const cut = s.length - 3; // last 3 chars = 2 pip digits + pipette
  return (
    <span className="font-mono tabular">
      <span className="text-fg-muted">{s.slice(0, cut)}</span>
      <span className="text-lg font-semibold text-accent-strong">{s.slice(cut, cut + 2)}</span>
      <sup className="text-[11px] text-fg-subtle">{s.slice(cut + 2)}</sup>
    </span>
  );
}

// ── 1. Rate converter ───────────────────────────────────────────────────────

export function RateConverter({ title, caption }: FrameProps) {
  const START = 1.1;
  const [rate, setRate] = useState(START);
  const [amount, setAmount] = useState(1000);
  const [dir, setDir] = useState<"base-to-quote" | "quote-to-base">("base-to-quote");
  const inv = invertRate(rate);
  const out = convert(amount, rate, dir);
  const ch = pctChange(START, rate) ?? 0;
  const pct = ((rate - 0.8) / (1.6 - 0.8)) * 100;
  const axis = useSvgText(320);
  return (
    <WidgetFrame title={title} caption={caption}>
      <div className="rounded-md border border-line bg-panel p-3 text-center">
        <p className="text-xs text-fg-subtle">EUR/USD</p>
        <p className="mt-1 text-2xl"><PipDigits price={rate} quote="USD" /></p>
        <p className="mt-1 text-[13px] text-fg-muted">1 euro buys <strong className="font-medium text-fg">{num(rate, 4)}</strong> US dollars</p>
        <svg ref={axis.ref} style={axis.style} viewBox="0 0 320 44" className="mx-auto mt-2 h-auto w-full max-w-[560px]" aria-hidden>
          <line x1="10" y1="17" x2="310" y2="17" className="stroke-line-strong" strokeWidth="2" />
          <line x1={10 + (300 * (START - 0.8)) / 0.8} y1="9" x2={10 + (300 * (START - 0.8)) / 0.8} y2="25" className="stroke-fg-subtle" strokeDasharray="2 2" />
          <circle cx={10 + 3 * pct} cy="17" r="7" className="fill-accent transition-[cx] duration-200 motion-reduce:transition-none" />
          <text x="10" y="42" className="fill-fg-subtle">0.80</text>
          <text x="310" y="42" textAnchor="end" className="fill-fg-subtle">1.60</text>
        </svg>
      </div>
      <Slider label="Drag the EUR/USD rate" value={rate} min={0.8} max={1.6} step={0.0005} onChange={setRate} format={(n) => num(n, 4)} hint="The dashed line marks where we started (1.1000)." />
      <Readouts>
        <Readout label="1 EUR =" value={`${num(rate, 4)} USD`} />
        <Readout label="1 USD =" value={`${num(inv, 4)} EUR`} sub="The same rate turned upside down (1 ÷ rate)." />
      </Readouts>
      <div className="flex flex-wrap items-end gap-3">
        <NumberField label="Amount to convert" value={amount} onChange={setAmount} min={0} max={10_000_000} step={100} />
        <Choice label="Direction" value={dir} onChange={setDir} options={[{ id: "base-to-quote", label: "EUR → USD" }, { id: "quote-to-base", label: "USD → EUR" }]} />
      </div>
      <Result tone={Math.abs(ch) < 0.05 ? "info" : ch > 0 ? "good" : "warn"}>
        {dir === "base-to-quote"
          ? <>{money(amount, "EUR")} becomes <strong className="font-medium">{money(out, "USD")}</strong> (multiply by the rate). </>
          : <>{money(amount, "USD")} becomes <strong className="font-medium">{money(out, "EUR")}</strong> (divide by the rate). </>}
        {Math.abs(ch) < 0.05
          ? "Move the slider to see what a stronger or weaker euro means."
          : ch > 0
            ? `The rate is ${num(ch, 1)}% higher than at the start: the euro has strengthened and the dollar has weakened, so each euro buys more dollars.`
            : `The rate is ${num(-ch, 1)}% lower than at the start: the euro has weakened and the dollar has strengthened, so each euro buys fewer dollars.`}
      </Result>
    </WidgetFrame>
  );
}

// ── 2. Bid, ask and the round trip ─────────────────────────────────────────

export function SpreadRoundTrip({ title, caption }: FrameProps) {
  const MID = 1.1;
  const [spreadPips, setSpreadPips] = useState(1.0);
  const [lot, setLot] = useState<"micro" | "mini" | "standard">("mini");
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const units = LOT_UNITS[lot];
  const half = (spreadPips * pipSize("USD")) / 2;
  const bid = MID - half, ask = MID + half;
  const q = quoteFromBidAsk(bid, ask, "USD");
  const cost = spreadCost(spreadPips, units, "USD") ?? 0;
  // SVG geometry: price ladder, 1 pip = 10 units, centred on mid. The height
  // follows the spread so a small spread does not leave a tall empty box.
  const halfPx = spreadPips * 5;
  const H = Math.max(64, Math.ceil(halfPx * 2 + 48));
  const MIDY = H / 2;
  const y = (p: number) => MIDY - ((p - MID) / pipSize("USD")) * 10;
  const dotY = step === 1 ? y(ask) : step === 2 ? y(bid) : MIDY;
  const svgText = useSvgText(320);
  return (
    <WidgetFrame title={title} caption={caption}>
      <p className="text-xs text-fg-subtle">You buy at the <span className="text-up">ask</span> and sell at the <span className="text-down">bid</span>. The dashed line is the mid-price.</p>
      <svg ref={svgText.ref} style={svgText.style} viewBox={`0 0 320 ${H}`} className="mx-auto h-auto w-full max-w-[560px]" role="img" aria-label={`Bid ${num(bid, 5)}, ask ${num(ask, 5)}, spread ${num(q?.spreadPips ?? 0, 1)} pips`}>
        <rect x="10" y={y(ask)} width="190" height={Math.max(1, y(bid) - y(ask))} className="fill-warn-soft transition-all duration-300 motion-reduce:transition-none" />
        <line x1="10" x2="200" y1={y(ask)} y2={y(ask)} className="stroke-up transition-all duration-300 motion-reduce:transition-none" strokeWidth="2" />
        <line x1="10" x2="200" y1={y(bid)} y2={y(bid)} className="stroke-down transition-all duration-300 motion-reduce:transition-none" strokeWidth="2" />
        <line x1="10" x2="200" y1={MIDY} y2={MIDY} className="stroke-fg-subtle" strokeDasharray="3 3" />
        <text x="206" y={y(ask)} dy="-0.25em" className="fill-up">Ask {num(ask, 5)}</text>
        <text x="206" y={y(bid)} dy="1em" className="fill-down">Bid {num(bid, 5)}</text>
        <circle cx={step === 2 ? 150 : step === 1 ? 60 : 105} cy={dotY} r="6" className={cn("transition-all duration-500 motion-reduce:transition-none", step === 0 ? "fill-fg-subtle" : step === 1 ? "fill-up" : "fill-down")} />
      </svg>
      <Slider label="Spread" value={spreadPips} min={0.2} max={10} step={0.1} onChange={(n) => { setSpreadPips(n); setStep(0); }} format={(n) => `${num(n, 1)} pips`} />
      <Choice label="Trade size" value={lot} onChange={(v) => { setLot(v); setStep(0); }} options={[{ id: "micro", label: "Micro (1,000)" }, { id: "mini", label: "Mini (10,000)" }, { id: "standard", label: "Standard (100,000)" }]} />
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => setStep(1)} disabled={step !== 0}>1. Buy now</Button>
        <Button onClick={() => setStep(2)} disabled={step !== 1}>2. Sell straight back</Button>
        <Button variant="ghost" onClick={() => setStep(0)} disabled={step === 0}><RotateCcw className="size-3.5" aria-hidden /> Reset</Button>
      </div>
      <Result tone={step === 2 ? "warn" : "info"}>
        {step === 0 && <>Press <strong className="font-medium">Buy now</strong>. Price will not move at all in this example.</>}
        {step === 1 && <>You bought {units.toLocaleString("en-US")} euros at the ask, {num(ask, 5)}. If you closed now you would sell at the bid, {num(bid, 5)}, so the trade already shows a loss of {money(cost)}.</>}
        {step === 2 && <>You sold at the bid. The price never moved, yet the round trip cost <strong className="font-medium">{money(cost)}</strong>: the spread of {num(spreadPips, 1)} pips × {units.toLocaleString("en-US")} units × 0.0001.</>}
      </Result>
    </WidgetFrame>
  );
}

// ── 3. Pip value calculator ─────────────────────────────────────────────────

export function PipCalculator({ title, caption }: FrameProps) {
  const [pair, setPair] = useState<SamplePair>("EUR/USD");
  const [lots, setLots] = useState(0.1);
  const [pips, setPips] = useState(20);
  const p = SAMPLE_PAIRS[pair];
  const units = Math.round(lots * LOT_UNITS.standard);
  const v = pipValue({ base: p.base, quote: p.quote, units, rate: p.rate, account: "USD", quoteToAccount: QUOTE_TO_USD[p.quote] });
  const ps = pipSize(p.quote);
  const working =
    !v ? "" :
      v.method === "quote-is-account" ? `${ps} × ${units.toLocaleString("en-US")} = ${money(v.inAccount)}`
        : v.method === "base-is-account" ? `${ps} × ${units.toLocaleString("en-US")} = ${money(v.inQuote, p.quote)}; ÷ ${p.rate} (the ${pair} rate) = ${money(v.inAccount)}`
          : `${ps} × ${units.toLocaleString("en-US")} = ${money(v.inQuote, p.quote)}; × ${QUOTE_TO_USD[p.quote]} (${p.quote}/USD) = ${money(v.inAccount)}`;
  const pnl = v ? v.inAccount * pips : null;
  return (
    <WidgetFrame title={title} caption={caption}>
      <Choice label="Pair (sample rates)" value={pair} onChange={setPair} options={(Object.keys(SAMPLE_PAIRS) as SamplePair[]).map((k) => ({ id: k, label: k }))} />
      <div className="rounded-md border border-line bg-panel p-3">
        <p className="text-xs text-fg-subtle">{pair} sample price. Big digits = pips, small digit = pipette (a tenth of a pip).</p>
        <p className="mt-1 text-2xl"><PipDigits price={p.rate + (p.quote === "JPY" ? 0.253 : 0.00253)} quote={p.quote} /></p>
        <p className="mt-1 text-xs text-fg-muted">One pip here = <span className="font-mono text-fg">{ps}</span>{p.quote === "JPY" ? " (yen pairs use the second decimal place)" : " (the fourth decimal place)"}</p>
      </div>
      <Slider label="Position size" value={lots} min={0.01} max={2} step={0.01} onChange={setLots} format={(n) => `${num(n, 2)} lots = ${Math.round(n * 100000).toLocaleString("en-US")} ${p.base}`} />
      <Slider label="Price moves by" value={pips} min={-100} max={100} step={1} onChange={setPips} format={(n) => `${signed(n, 0)} pips`} />
      <Readouts cols={3}>
        <Readout label={`1 pip in ${p.quote}`} value={money(v?.inQuote, p.quote, p.quote === "JPY" ? 0 : 2)} />
        <Readout label="1 pip in USD (account)" value={money(v?.inAccount)} tone="accent" />
        <Readout label={`P&L for ${signed(pips, 0)} pips (long)`} value={money(pnl)} tone={pnl === null || pnl === 0 ? undefined : pnl > 0 ? "up" : "down"} />
      </Readouts>
      <Result>Working: {working}. {v?.method === "quote-is-account" ? "The quote currency is already US dollars, so no conversion is needed." : v?.method === "base-is-account" ? "The dollar is the base here, so divide the yen or franc amount by the pair's own rate." : "Neither currency is the dollar, so convert the pound amount at the GBP/USD rate."}</Result>
    </WidgetFrame>
  );
}

// ── 4. Position size from risk ──────────────────────────────────────────────

export function PositionSizer({ title, caption }: FrameProps) {
  const [balance, setBalance] = useState(5000);
  const [risk, setRisk] = useState(1);
  const [stop, setStop] = useState(25);
  const [pair, setPair] = useState<"EUR/USD" | "USD/JPY">("EUR/USD");
  const p = SAMPLE_PAIRS[pair];
  const perUnit = pipValue({ base: p.base, quote: p.quote, units: 1, rate: p.rate, account: "USD" })?.inAccount ?? 0;
  const size = positionSize(balance, risk, stop, perUnit);
  const actualRisk = size ? size.units * perUnit * stop : 0;
  return (
    <WidgetFrame title={title} caption={caption}>
      <div className="flex flex-wrap items-end gap-3">
        <NumberField label="Account balance (USD)" value={balance} onChange={setBalance} min={0} max={10_000_000} step={500} />
        <Choice label="Pair" value={pair} onChange={setPair} options={[{ id: "EUR/USD", label: "EUR/USD" }, { id: "USD/JPY", label: "USD/JPY" }]} />
      </div>
      <Slider label="Risk per trade" value={risk} min={0.25} max={5} step={0.25} onChange={setRisk} format={(n) => `${num(n, 2)}%`} />
      <Slider label="Stop-loss distance" value={stop} min={5} max={150} step={1} onChange={setStop} format={(n) => `${n} pips`} />
      <Readouts cols={3}>
        <Readout label="Money at risk" value={money(size?.riskAmount ?? null)} />
        <Readout label="Position size" value={size ? `${size.units.toLocaleString("en-US")} units` : "—"} sub={size ? `${num(size.lots, 2)} lots` : undefined} tone="accent" />
        <Readout label="Loss if the stop is hit" value={money(-actualRisk)} tone="down" sub="Before spread, slippage and gaps" />
      </Readouts>
      <Result tone={!size || size.units === 0 ? "warn" : risk > 2 ? "warn" : "info"}>
        {!size ? "Enter a balance above zero." : size.units === 0
          ? "Even the smallest common size (one micro lot, 1,000 units) would risk more than you chose. Use a larger account, a closer stop, or skip the trade."
          : <>Size = {money(size.riskAmount)} ÷ ({stop} pips × {money(perUnit, "USD", 6)} per pip per unit), rounded down to whole micro lots. A wider stop means a smaller position for the same risk.{risk > 2 ? " Above about 2% per trade, a short losing streak takes a big bite out of the account." : ""}</>}
      </Result>
    </WidgetFrame>
  );
}

// ── 5. Leverage and margin simulator ────────────────────────────────────────

const LEVERAGES = [1, 10, 30, 100, 500] as const;

export function MarginSimulator({ title, caption }: FrameProps) {
  const BAL = 1000, RATE = 1.1;
  const [lev, setLev] = useState<(typeof LEVERAGES)[number]>(30);
  const [lots, setLots] = useState(0.2);
  const [move, setMove] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const units = Math.round(lots * LOT_UNITS.standard);
  const notional = units * RATE;
  const used = marginRequired(notional, lev) ?? 0;
  const canOpen = used <= BAL;
  const pipUsd = units * 0.0001;
  const pnl = move * pipUsd;
  const snap = marginSnapshot(BAL, pnl, canOpen ? used : 0);
  const stopOutPips = canOpen && pipUsd > 0 ? -Math.max(0, (BAL - 0.5 * used) / pipUsd) : null;
  const callPips = canOpen && pipUsd > 0 ? -Math.max(0, (BAL - used) / pipUsd) : null;
  const stopped = snap?.status === "stop-out";

  // "Play" walks the price down step by step until the stop-out level (or
  // jumps straight there when the user prefers reduced motion).
  const MIN_MOVE = -500;
  const target = stopOutPips === null ? null : Math.max(MIN_MOVE, Math.floor(stopOutPips));
  const stopOutBeyond = stopOutPips !== null && Math.floor(stopOutPips) < MIN_MOVE;
  useEffect(() => {
    if (!playing || target === null) return;
    if (reduced) { setMove(target); setPlaying(false); return; }
    const stepSize = Math.max(1, Math.round(Math.abs(target) / 60));
    const id = setInterval(() => setMove((m) => Math.max(target, m - stepSize)), 50);
    return () => clearInterval(id);
  }, [playing, reduced, target]);
  useEffect(() => {
    if (playing && target !== null && move <= target) setPlaying(false);
  }, [playing, move, target]);

  const reset = () => { setPlaying(false); setMove(0); };
  const equityPct = snap ? Math.max(0, (snap.equity / BAL) * 100) : 0;
  return (
    <WidgetFrame title={title} caption={caption}>
      <p className="text-[13px] text-fg-muted">Sample account: <strong className="font-medium text-fg">{money(BAL)}</strong>, buying EUR/USD at a sample price of 1.1000. Margin call at 100% and stop-out at 50% are example levels; every broker sets its own.</p>
      <Choice label="Leverage" value={String(lev)} onChange={(v) => { setLev(Number(v) as (typeof LEVERAGES)[number]); reset(); }} options={LEVERAGES.map((l) => ({ id: String(l), label: `1:${l}` }))} />
      <Slider label="Position size" value={lots} min={0.01} max={1} step={0.01} onChange={(n) => { setLots(n); reset(); }} format={(n) => `${num(n, 2)} lots (${money(Math.round(n * 100000) * RATE, "USD", 0)} of euros)`} />
      <Slider label="Price move against or for you" value={move} min={-500} max={200} step={1} onChange={(n) => { setPlaying(false); setMove(n); }} format={(n) => `${signed(n, 0)} pips`} />
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => { if (!playing && (stopped || move > 0)) setMove(0); setPlaying((p) => !p); }} disabled={!canOpen || pipUsd === 0}>
          {playing ? <><Pause className="size-3.5" aria-hidden /> Pause</> : <><Play className="size-3.5" aria-hidden /> Play a falling market</>}
        </Button>
        <Button variant="ghost" onClick={reset}><RotateCcw className="size-3.5" aria-hidden /> Reset</Button>
      </div>
      {canOpen ? (
        <>
          <div className="space-y-2">
            <Bar label="Equity (balance + open P&L)" pct={equityPct} tone={stopped ? "down" : snap?.status === "margin-call" ? "warn" : "up"} value={money(snap?.equity)} />
            <Bar label="Used margin (locked as a deposit)" pct={(used / BAL) * 100} tone="muted" value={money(used)} />
          </div>
          <Readouts cols={4}>
            <Readout label="Open P&L" value={money(pnl)} tone={pnl > 0 ? "up" : pnl < 0 ? "down" : undefined} />
            <Readout label="Free margin" value={money(snap?.freeMargin)} tone={(snap?.freeMargin ?? 0) < 0 ? "down" : undefined} />
            <Readout label="Margin level" value={snap?.marginLevel === null || snap?.marginLevel === undefined ? "—" : `${num(snap.marginLevel, 0)}%`} tone={stopped ? "down" : snap?.status === "margin-call" ? "warn" : undefined} />
            <Readout label="Stop-out after" value={stopOutPips === null ? "—" : `${num(Math.abs(stopOutPips), 0)} pips${stopOutBeyond ? " (off this scale)" : ""}`} sub={callPips !== null ? `Margin call after ${num(Math.abs(callPips), 0)}` : undefined} />
          </Readouts>
          <Result tone={stopped ? "bad" : snap?.status === "margin-call" ? "warn" : "info"}>
            {stopped
              ? <>Stop-out: the broker would start closing the position, locking in a loss of about {money(-pnl)} ({num((-pnl / BAL) * 100, 0)}% of the account) from a {num(Math.abs(move), 0)}-pip move, which is about {num(Math.abs(move) * 0.0001 / RATE * 100, 1)}% in the euro.</>
              : snap?.status === "margin-call"
                ? <>Margin call: equity is at or below the margin in use. You would be asked to add money or close positions, and new trades are usually blocked.</>
                : stopOutBeyond && move <= MIN_MOVE
                  ? <>Still open after a {num(-MIN_MOVE, 0)}-pip fall, the end of this simulator&apos;s range. A stop-out would need a move of about {num(Math.abs(stopOutPips!), 0)} pips. That is low leverage and a small position protecting you: the same deposit simply is not stretched far enough for an ordinary move to wipe it out. You have still lost {money(-pnl)} ({num((-pnl / BAL) * 100, 0)}% of the account).</>
                  : <>A {money(notional, "USD", 0)} position needs {money(used)} of margin at 1:{lev}. Each pip is worth {money(pipUsd)}. Higher leverage lets you open bigger positions with the same deposit, so the same price move can wipe out the account faster.</>}
          </Result>
        </>
      ) : (
        <Result tone="warn">Not enough margin: this position needs {money(used)} at 1:{lev}, more than the {money(BAL)} in the account. Choose a smaller size. Higher leverage would let it open, but every pip would still be worth the same, with a much thinner cushion before a stop-out.</Result>
      )}
    </WidgetFrame>
  );
}

// ── 6. Pair explorer ────────────────────────────────────────────────────────

const CURRENCIES: { id: string; name: string }[] = [
  { id: "USD", name: "US dollar" }, { id: "EUR", name: "Euro" }, { id: "JPY", name: "Japanese yen" }, { id: "GBP", name: "British pound" },
  { id: "CHF", name: "Swiss franc" }, { id: "AUD", name: "Australian dollar" }, { id: "CAD", name: "Canadian dollar" }, { id: "NZD", name: "New Zealand dollar" },
  { id: "MXN", name: "Mexican peso" }, { id: "ZAR", name: "South African rand" }, { id: "TRY", name: "Turkish lira" }, { id: "SGD", name: "Singapore dollar" }, { id: "PLN", name: "Polish zloty" },
];
// Rough market-convention order for which currency is written first. Conventions vary at the edges.
const PRIORITY = ["EUR", "GBP", "AUD", "NZD", "USD", "CAD", "CHF", "SGD", "PLN", "MXN", "ZAR", "TRY", "JPY"];

const TYPE_COPY: Record<PairType, { label: string; text: string }> = {
  major: { label: "Major", text: "The US dollar against another big, widely held currency. These are the most traded pairs, so spreads are usually the tightest and prices tend to move more smoothly." },
  minor: { label: "Minor (cross)", text: "Two major currencies without the US dollar. Still widely traded, but usually with somewhat wider spreads than the majors." },
  exotic: { label: "Exotic", text: "Includes the currency of a smaller or emerging economy. Expect noticeably wider spreads, larger swaps, sudden jumps and thinner trading, especially outside local hours." },
};

export function PairExplorer({ title, caption }: FrameProps) {
  const [a, setA] = useState("EUR");
  const [b, setB] = useState("USD");
  const same = a === b;
  const [base, quote] = same ? [a, b] : PRIORITY.indexOf(a) <= PRIORITY.indexOf(b) ? [a, b] : [b, a];
  const type = same ? null : classifyPair(base, quote);
  const selId = "pair-explorer";
  return (
    <WidgetFrame title={title} caption={caption}>
      <div className="grid grid-cols-2 gap-3">
        {[["First currency", a, setA], ["Second currency", b, setB]].map(([label, value, set], i) => (
          <div key={i} className="min-w-0">
            <label htmlFor={`${selId}-${i}`} className="block text-xs text-fg-muted">{label as string}</label>
            <select
              id={`${selId}-${i}`}
              value={value as string}
              onChange={(e) => (set as (v: string) => void)(e.target.value)}
              className="mt-1 h-9 w-full min-w-0 rounded-md border border-line-strong bg-raised px-2 text-[13px] text-fg"
            >
              {CURRENCIES.map((c) => <option key={c.id} value={c.id}>{c.id} · {c.name}</option>)}
            </select>
          </div>
        ))}
      </div>
      {same ? (
        <Result tone="warn">A pair needs two different currencies. Pick another one.</Result>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-md border border-line bg-panel p-3 text-center">
            <div><p className="font-mono text-xl">{base}/{quote}</p><p className="text-[11px] text-fg-subtle">usually written this way round</p></div>
            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", type === "major" ? "border-up/30 bg-up-soft text-up" : type === "minor" ? "border-info/30 bg-info-soft text-info" : "border-warn/30 bg-warn-soft text-warn")}>{type && TYPE_COPY[type].label}</span>
          </div>
          <Readouts cols={3}>
            <Readout label="Base (1 unit of)" value={base} />
            <Readout label="Quote (priced in)" value={quote} />
            <Readout label="One pip" value={pipSize(quote)} sub={quote === "JPY" ? "Yen quote: 2nd decimal" : "4th decimal"} />
          </Readouts>
          <Result tone={type === "exotic" ? "warn" : "info"}>{type && TYPE_COPY[type].text}</Result>
        </>
      )}
    </WidgetFrame>
  );
}

// ── 7. Session clock ────────────────────────────────────────────────────────

const STEP_MS = 15 * 60_000;
const SESSION_TONE: Record<string, string> = { sydney: "fill-info", tokyo: "fill-accent", london: "fill-up", newyork: "fill-warn" };

/** The next Wednesday (or today, if it is one), at local midnight. A Wednesday keeps the example clear of weekend closures. */
function referenceWednesday(now: Date) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7));
  return d;
}

// Older names some systems still report, mapped to the current IANA name.
const ZONE_ALIASES: Record<string, string> = {
  "Asia/Katmandu": "Asia/Kathmandu", "Asia/Calcutta": "Asia/Kolkata", "Asia/Saigon": "Asia/Ho_Chi_Minh", "Asia/Rangoon": "Asia/Yangon",
  "Europe/Kiev": "Europe/Kyiv", "America/Buenos_Aires": "America/Argentina/Buenos_Aires", "Pacific/Truk": "Pacific/Chuuk",
  "Atlantic/Faeroe": "Atlantic/Faroe", "Asia/Ulan_Bator": "Asia/Ulaanbaatar", "America/Godthab": "America/Nuuk",
};

/** "Asia/Kathmandu (GMT+5:45)": the canonical zone name plus its UTC offset on the given day. */
export function zoneLabel(at: Date): string {
  let tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* ignore */ }
  tz = ZONE_ALIASES[tz] ?? tz;
  let off = "";
  try {
    off = new Intl.DateTimeFormat("en-US", { timeZoneName: "shortOffset" }).formatToParts(at).find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch { /* older engines */ }
  if (!tz) return off || "your time zone";
  return off ? `${tz}, ${off}` : tz;
}

export function SessionClock({ title, caption }: FrameProps) {
  const mounted = useMounted();
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      {mounted ? <SessionClockBody /> : <div className="h-64 rounded-md bg-raised" aria-busy="true" aria-label="Loading your local times" />}
    </WidgetFrame>
  );
}

function SessionClockBody() {
  // The axis runs from local midnight to the NEXT local midnight in real
  // elapsed time, so a clock-change day has 92 or 100 quarter-hours, not 96.
  const day = useMemo(() => referenceWednesday(new Date()), []);
  const end = useMemo(() => new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1), [day]);
  const steps = Math.max(1, Math.round((end.getTime() - day.getTime()) / STEP_MS));
  const tz = useMemo(() => zoneLabel(day), [day]);
  const at = (q: number) => new Date(day.getTime() + q * STEP_MS);
  const grid = useMemo(
    () => SESSIONS.map((s) => Array.from({ length: steps }, (_, q) => forexSessionStatus(s, new Date(day.getTime() + q * STEP_MS)).open)),
    [day, steps],
  );
  const [q, setQ] = useState(() => {
    // start where London and New York overlap, if they do on this day
    const i = grid[2].findIndex((open, k) => open && grid[3][k]);
    return i >= 0 ? i + 2 : Math.floor(steps / 2);
  });
  const t = at(q);
  const open = SESSIONS.filter((_, i) => grid[i][q]);
  const time = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateLabel = day.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
  const X0 = 64, AXIS = 276, cell = AXIS / steps;
  const xOf = (d: Date) => X0 + ((d.getTime() - day.getTime()) / (end.getTime() - day.getTime())) * AXIS;
  // Axis ticks at local 00:00, 06:00, 12:00, 18:00 and the next 00:00, placed by real elapsed time.
  const ticks = [0, 6, 12, 18, 24].map((h) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, 0));
  const overlapLN = grid[2][q] && grid[3][q];
  const overlapTL = grid[1][q] && grid[2][q];
  const svgText = useSvgText(340);
  const sk = parseFloat(String(svgText.style.fontSize)) / 11; // > 1 when the drawing is shrunk
  const narrow = sk > 0.85; // drawing narrower than ~400px: show three axis labels, not five
  const H = 152 + Math.max(0, (sk - 1) * 12);
  return (
    <>
      <p className="text-[13px] text-fg-muted">Times are in your time zone ({tz}) for <strong className="font-medium text-fg">{dateLabel}</strong>, worked out from your device clock. Hours are approximate and ignore holidays.{steps !== 96 ? ` Clocks change on this day, so it is ${steps / 4} hours long.` : ""}</p>
      <svg ref={svgText.ref} style={svgText.style} viewBox={`0 0 340 ${H}`} className="mx-auto h-auto w-full max-w-[640px]" role="img" aria-label={`Session timeline for ${dateLabel}. At ${time(t)}: ${open.length ? open.map((s) => s.name).join(", ") + " open" : "no major session open"}.`}>
        {SESSIONS.map((s, i) => (
          <g key={s.id}>
            <text x="0" y={19 + i * 28} dy="0.35em" className="fill-fg-muted text-[0.95em]">{narrow && s.id === "newyork" ? "NY" : s.name}</text>
            <rect x={X0} y={12 + i * 28} width={AXIS} height="14" rx="3" className="fill-raised" />
            {grid[i].map((o, k) => o && <rect key={k} x={X0 + k * cell} y={12 + i * 28} width={cell + 0.3} height="14" className={cn(SESSION_TONE[s.id], "opacity-80")} />)}
          </g>
        ))}
        {ticks.map((d, k) => (
          <text
            key={k}
            x={k === 4 ? X0 + AXIS : xOf(d)}
            y="134"
            textAnchor={k === 0 ? "start" : k === 4 ? "end" : "middle"}
            className={cn("fill-fg-subtle text-[0.95em]", narrow && (k === 1 || k === 3) && "hidden")}
          >
            {time(d)}
          </text>
        ))}
        <line x1={X0 + q * cell} x2={X0 + q * cell} y1="6" y2="122" className="stroke-fg transition-all duration-150 motion-reduce:transition-none" strokeWidth="1.5" />
        <text x={Math.min(Math.max(X0 + q * cell, X0 + 30), X0 + AXIS - 30)} y={135} dy="1.25em" textAnchor="middle" className="fill-fg font-medium">{time(t)}</text>
      </svg>
      <Slider label="Move through the day" value={q} min={0} max={steps - 1} step={1} onChange={setQ} format={(n) => time(at(n))} />
      <Result tone={overlapLN ? "good" : open.length === 0 ? "warn" : "info"}>
        At {time(t)} your time: {open.length ? <><strong className="font-medium">{open.map((s) => s.name).join(" + ")}</strong> open.</> : "no major session is in its business hours."}{" "}
        {overlapLN ? "London and New York overlap: often the busiest stretch of the day, with high liquidity and tight spreads in the majors."
          : overlapTL ? "Tokyo and London overlap briefly: activity picks up as Europe arrives."
            : open.length === 0 ? "Forex can still trade, but fewer participants means thinner liquidity and often wider spreads."
              : open.length === 1 ? `Only ${open[0].name} is in business hours. ${open[0].note}` : ""}
      </Result>
    </>
  );
}

// ── 8. What moves currencies ────────────────────────────────────────────────

type Driver = "rates" | "inflation" | "risk" | "trade";

export function DriversToy({ title, caption }: FrameProps) {
  const [driver, setDriver] = useState<Driver>("rates");
  const [expected, setExpected] = useState(0.25);
  const [actual, setActual] = useState(0.5);
  const [cpiGap, setCpiGap] = useState(0.3);
  const [mood, setMood] = useState<"risk-on" | "risk-off">("risk-off");
  const [trade, setTrade] = useState(1);

  let tendency = 0; // −1 weaker … +1 stronger, for the "home" currency
  let who = "the currency";
  let why = "";
  if (driver === "rates") {
    const surprise = actual - expected;
    tendency = Math.max(-1, Math.min(1, surprise / 0.5));
    who = "the home currency";
    why = Math.abs(surprise) < 0.01
      ? `The central bank did exactly what markets expected (${signed(actual, 2)} points). That was largely priced in, so the reaction may be small. The words about future moves often matter more.`
      : surprise > 0
        ? `Rates moved ${signed(surprise, 2)} points more than expected (a "hawkish" surprise). Higher expected returns on deposits and bonds in that currency can attract money, which tends to support it.`
        : `Rates moved ${num(Math.abs(surprise), 2)} points less than expected (a "dovish" surprise). Lower expected returns can push money elsewhere, which tends to weigh on the currency.`;
  } else if (driver === "inflation") {
    tendency = Math.max(-1, Math.min(1, cpiGap / 0.6));
    who = "the home currency";
    why = Math.abs(cpiGap) < 0.05
      ? "Inflation came in as forecast, so little new information reached the market."
      : cpiGap > 0
        ? "Inflation came in above forecast. Traders may expect the central bank to keep rates higher for longer, which often supports the currency in the short term. Over the long run, persistently high inflation erodes a currency's buying power."
        : "Inflation came in below forecast. Traders may expect rate cuts sooner, which often weighs on the currency in the short term.";
  } else if (driver === "risk") {
    tendency = mood === "risk-off" ? 0.8 : -0.5;
    who = "the yen and Swiss franc (often seen as safe havens)";
    why = mood === "risk-off"
      ? "In a fearful, risk-off mood investors often pull money from riskier assets. Currencies seen as safe havens (the yen, the Swiss franc and often the US dollar) have tended to gain, while currencies linked to commodities and growth, such as the Australian dollar, have tended to fall."
      : "In a confident, risk-on mood investors look for higher returns. Safe-haven currencies have tended to lose ground, while growth- and commodity-linked currencies have tended to gain.";
  } else {
    tendency = Math.max(-1, Math.min(1, trade / 3));
    who = "the exporter's currency";
    why = trade === 0
      ? "Exports and imports balance. No extra pressure either way from trade."
      : trade > 0
        ? "Foreign buyers of the country's exports need its currency to pay, adding demand for it. Over time that tends to support the currency, but capital flows (investment money) are often much larger than trade flows."
        : "The country imports more than it exports, so it sells its own currency to pay for foreign goods. That tends to weigh on it over time, but investment flows can more than offset it.";
  }
  const Icon = tendency > 0.15 ? ArrowUp : tendency < -0.15 ? ArrowDown : Minus;
  const label = tendency > 0.15 ? "tends to strengthen" : tendency < -0.15 ? "tends to weaken" : "little change likely";
  // rotate(+θ) turns the upright needle clockwise, towards "stronger" on the right.
  const angle = tendency * 60;
  const direction = tendency > 0.15 ? "stronger" : tendency < -0.15 ? "weaker" : "flat";
  return (
    <WidgetFrame title={title} caption={caption}>
      <Choice label="Pick a driver" value={driver} onChange={setDriver} options={[{ id: "rates", label: "Interest rates" }, { id: "inflation", label: "Inflation" }, { id: "risk", label: "Risk mood" }, { id: "trade", label: "Trade flows" }]} />
      {driver === "rates" && (
        <>
          <Slider label="Rate change markets expected" value={expected} min={-0.75} max={0.75} step={0.25} onChange={setExpected} format={(n) => `${signed(n, 2)} pts`} />
          <Slider label="Rate change the central bank announces" value={actual} min={-0.75} max={0.75} step={0.25} onChange={setActual} format={(n) => `${signed(n, 2)} pts`} />
        </>
      )}
      {driver === "inflation" && <Slider label="Inflation reading minus forecast" value={cpiGap} min={-0.6} max={0.6} step={0.1} onChange={setCpiGap} format={(n) => `${signed(n, 1)} pts`} />}
      {driver === "risk" && <Choice label="Market mood" value={mood} onChange={setMood} options={[{ id: "risk-on", label: "Risk-on (confident)" }, { id: "risk-off", label: "Risk-off (fearful)" }]} />}
      {driver === "trade" && <Slider label="Exports minus imports (made-up scale)" value={trade} min={-3} max={3} step={1} onChange={setTrade} format={(n) => (n === 0 ? "balanced" : n > 0 ? `surplus ${n}` : `deficit ${-n}`)} />}
      <div className="flex items-center gap-4 rounded-md border border-line bg-panel p-3">
        <div className="w-24 shrink-0" aria-hidden>
          <svg viewBox="0 0 80 50" className="h-auto w-full" data-gauge>
            <path d="M8 46 A32 32 0 0 1 72 46" className="fill-none stroke-line-strong" strokeWidth="6" />
            <line x1="40" y1="46" x2="40" y2="18" transform={`rotate(${angle} 40 46)`} data-angle={angle} data-direction={direction} className={cn("transition-transform duration-500 motion-reduce:transition-none", tendency > 0.15 ? "stroke-up" : tendency < -0.15 ? "stroke-down" : "stroke-fg-subtle")} strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="mt-0.5 flex justify-between text-[11px] leading-none text-fg-subtle"><span>weaker</span><span>stronger</span></div>
        </div>
        <p className="min-w-0 text-[13px]">
          <span className="text-fg-subtle">Textbook tendency for {who}: </span>
          <span className={cn("inline-flex items-center gap-1 font-medium", tendency > 0.15 ? "text-up" : tendency < -0.15 ? "text-down" : "text-fg-muted")}><Icon className="size-3.5" aria-hidden />{label}</span>
        </p>
      </div>
      <Result>{why} <span className="text-fg-subtle">A tendency, not a rule: other news, what was already priced in and big investors&apos; positions can override it.</span></Result>
    </WidgetFrame>
  );
}

// ── 9. Cost calculator ──────────────────────────────────────────────────────

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CostCalculator({ title, caption }: FrameProps) {
  const PRICE = 1.1;
  const [dir, setDir] = useState<"long" | "short">("long");
  const [lots, setLots] = useState(1);
  const [spread, setSpread] = useState(1);
  const [commission, setCommission] = useState(7);
  const [baseRate, setBaseRate] = useState(2);
  const [quoteRate, setQuoteRate] = useState(4);
  const [markup, setMarkup] = useState(0.5);
  const [openDay, setOpenDay] = useState("1");
  const [nights, setNights] = useState(3);
  const units = Math.round(lots * LOT_UNITS.standard);
  const sp = spreadCost(spread, units, "USD") ?? 0;
  const comm = commission * lots;
  const perNight = swapPerNight(dir, units, PRICE, baseRate, quoteRate, markup) ?? 0;
  let swapDays = 0;
  let holdsWednesday = false;
  const days: string[] = [];
  for (let i = 0; i < nights; i++) {
    const wd = (Number(openDay) + i) % 7;
    const n = rolloverNights(wd);
    swapDays += n;
    if (wd === 3) holdsWednesday = true;
    days.push(`${WEEKDAY[wd]}${n === 3 ? " ×3" : n === 0 ? " ×0" : ""}`);
  }
  const swapTotal = perNight * swapDays;
  const c = tradingCost(sp, comm, swapTotal);
  const total = c?.total ?? 0;
  const max = Math.max(1, sp + comm + Math.abs(swapTotal));
  return (
    <WidgetFrame title={title} caption={caption}>
      <p className="text-[13px] text-fg-muted">A sample EUR/USD trade at 1.1000 in a USD account. Interest rates and charges below are made up for practice.</p>
      <div className="flex flex-wrap gap-3">
        <Choice label="Direction" value={dir} onChange={setDir} options={[{ id: "long", label: "Long (buy EUR)" }, { id: "short", label: "Short (sell EUR)" }]} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Size" value={lots} min={0.01} max={2} step={0.01} onChange={setLots} format={(n) => `${num(n, 2)} lots`} />
        <Slider label="Spread" value={spread} min={0} max={5} step={0.1} onChange={setSpread} format={(n) => `${num(n, 1)} pips`} />
        <Slider label="Commission (round trip, per lot)" value={commission} min={0} max={12} step={0.5} onChange={setCommission} format={(n) => money(n)} />
        <Slider label="Broker swap markup" value={markup} min={0} max={1.5} step={0.05} onChange={setMarkup} format={(n) => `${num(n, 2)}% a year`} />
        <Slider label="EUR interest rate (base)" value={baseRate} min={-1} max={8} step={0.25} onChange={setBaseRate} format={(n) => `${num(n, 2)}%`} />
        <Slider label="USD interest rate (quote)" value={quoteRate} min={-1} max={8} step={0.25} onChange={setQuoteRate} format={(n) => `${num(n, 2)}%`} />
      </div>
      <Choice label="Open the trade on" value={openDay} onChange={setOpenDay} options={[1, 2, 3, 4, 5].map((d) => ({ id: String(d), label: WEEKDAY[d] }))} />
      <Slider label="Hold for" value={nights} min={0} max={10} step={1} onChange={setNights} format={(n) => (n === 0 ? "closed same day" : `${n} night${n === 1 ? "" : "s"}`)} hint={nights ? `Rollovers: ${days.join(", ")}` : "Closed before the daily rollover: no swap."} />
      <div className="space-y-2">
        <Bar label="Spread" pct={(sp / max) * 100} tone="warn" value={money(sp)} />
        <Bar label="Commission" pct={(comm / max) * 100} tone="warn" value={money(comm)} />
        <Bar label={swapTotal >= 0 ? "Swap (you receive)" : "Swap (you pay)"} pct={(Math.abs(swapTotal) / max) * 100} tone={swapTotal >= 0 ? "up" : "down"} value={money(swapTotal)} />
      </div>
      <Readouts cols={3}>
        <Readout label="Swap per night" value={money(perNight)} tone={perNight >= 0 ? "up" : "down"} />
        <Readout label="Total cost" value={money(total)} tone={total > 0 ? "warn" : "up"} />
        <Readout label="Pips needed to break even" value={units ? num(total / (units * 0.0001), 1) : "—"} />
      </Readouts>
      <Result tone={total > 0 ? "warn" : "good"}>
        {dir === "long" ? "Long EUR/USD" : "Short EUR/USD"}: you {dir === "long" ? "hold euros" : "owe euros"} and {dir === "long" ? "owe dollars" : "hold dollars"}, so the swap is roughly the rate gap ({signed(dir === "long" ? baseRate - quoteRate : quoteRate - baseRate, 2)}%) minus the broker&apos;s {num(markup, 2)}% markup, per year, charged nightly. {holdsWednesday ? "The Wednesday rollover counts three days because it covers the weekend; Saturday and Sunday then count zero." : ""}
      </Result>
    </WidgetFrame>
  );
}

