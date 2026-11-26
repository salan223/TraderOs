"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, FastForward, Info, Play, RotateCcw, SkipForward, Target, XCircle } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { HISTORY_SYMBOLS, symbolMeta } from "@/lib/market/history-symbols";
import { blackScholes, type OptionKind } from "@/lib/quant/options";
import { barsForDays, breakeven, firstTouch, legValueAt, modelVolAt, optionChain, scenarioStart, type Leg } from "@/lib/quant/options-sim";
import { histVolAt } from "@/lib/quant/forecast";
import { cn } from "@/lib/cn";
import { PriceChart } from "./price-chart";
import { useHistory } from "./use-history";

/*
  Options Lab: learn calls, puts, strikes, expiry and the Greeks by trading
  them on real past price paths. The start date is hidden until the end, the
  underlying moves exactly as it really did, and option prices come from the
  Black-Scholes model using recent realised volatility. Virtual money only.
*/

const EXPIRIES = [7, 14, 30, 60, 90] as const;
const ACCOUNT = 10_000;
const MULTIPLIER: Record<string, number> = { "Index fund": 100, Share: 100, Crypto: 0.1, Forex: 10_000, Commodity: 10 };
const STORE = "traderos.options-lab.v1";

type Saved = { id: string; symbol: string; kind: OptionKind; strike: number; days: number; contracts: number; cost: number; pnl: number; targetHit: boolean; from: string; to: string };

const money = (n: number, dp = 2) => (Number.isFinite(n) ? n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: dp, maximumFractionDigits: dp }) : "–");
const pct = (n: number, dp = 1) => (Number.isFinite(n) ? `${n >= 0 ? "+" : ""}${(n * 100).toFixed(dp)}%` : "–");

const STEPS = ["Choose a market", "Read the market", "Pick call or put", "Pick strike and expiry", "Set a target", "Run time forward", "Review"];

function Steps({ at }: { at: number }) {
  return (
    <ol className="flex flex-wrap gap-1.5 text-[12px]">
      {STEPS.map((s, k) => (
        <li key={s} className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1", k < at ? "border-up/30 bg-up-soft text-up" : k === at ? "border-accent bg-accent-soft text-fg" : "border-line text-fg-subtle")}>
          <span className="tabular">{k + 1}</span> {s}
        </li>
      ))}
    </ol>
  );
}

function Explainers() {
  const items = [
    { t: "Call", d: "The right to buy at the strike price until expiry. It gains when the price rises above the strike by more than you paid." },
    { t: "Put", d: "The right to sell at the strike price until expiry. It gains when the price falls below the strike by more than you paid." },
    { t: "Strike", d: "The agreed price. Calls with a strike below the current price, and puts with one above it, already have intrinsic value." },
    { t: "Expiry", d: "The date the right ends. More time costs more, and the option loses time value every day (theta)." },
    { t: "Premium and break-even", d: "What you pay, and the most a buyer can lose. Call break-even = strike + premium; put break-even = strike − premium." },
    { t: "The Greeks", d: "Delta: change per $1 move. Gamma: how fast delta changes. Theta: value lost per day. Vega: change per volatility point." },
  ];
  return (
    <details className="group rounded-lg border border-line bg-panel">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[14px] font-medium">
        <ChevronRight className="size-4 transition-transform group-open:rotate-90" /> How options work, in one minute
      </summary>
      <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <div key={i.t} className="rounded-md border border-line bg-surface p-3">
            <p className="text-[13px] font-semibold">{i.t}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{i.d}</p>
          </div>
        ))}
        <p className="text-[13px] text-fg-muted sm:col-span-2 lg:col-span-3">
          Want the full lesson first? <Link href="/academy/advanced/adv-options-basics" className="text-accent-strong hover:underline">Options basics: calls, puts and the Greeks</Link>
        </p>
      </div>
    </details>
  );
}

export function OptionsLab() {
  const [symbol, setSymbol] = useState<string>("SPY");
  const [seed, setSeed] = useState(() => 1 + Math.floor(Math.random() * 10_000));
  const meta = symbolMeta(symbol);
  const ppy = meta.periodsPerYear;
  const mult = MULTIPLIER[meta.kind] ?? 100;
  const { data, error, loading } = useHistory(symbol);
  const bars = useMemo(() => data?.bars ?? [], [data]);
  const closes = useMemo(() => bars.map((b) => b.c), [bars]);
  const maxBars = barsForDays(90, ppy);
  const i0 = useMemo(() => (closes.length > 400 ? scenarioStart(closes.length, seed, 260, maxBars + 1) : -1), [closes.length, seed, maxBars]);

  // Trade set-up
  const [kind, setKind] = useState<OptionKind>("call");
  const [days, setDays] = useState<(typeof EXPIRIES)[number]>(30);
  const [strike, setStrike] = useState<number | null>(null);
  const [contracts, setContracts] = useState(1);
  const [target, setTarget] = useState<number | null>(null);
  // Running
  const [leg, setLeg] = useState<Leg | null>(null);
  const [k, setK] = useState(0);
  const [closedAt, setClosedAt] = useState<number | null>(null);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(STORE) ?? "[]")); } catch {}
  }, []);

  const reset = (newSeed?: number) => {
    setLeg(null); setK(0); setClosedAt(null); setStrike(null); setTarget(null); setRecorded(false);
    if (newSeed !== undefined) setSeed(newSeed);
  };

  const spot = i0 >= 0 ? closes[i0] : NaN;
  const vol = i0 >= 0 ? modelVolAt(closes, i0, ppy) : NaN;
  const vol60 = i0 >= 0 ? histVolAt(closes, i0, 60, ppy) : NaN;
  const chain = useMemo(() => (Number.isFinite(spot) ? optionChain(spot, vol, days / 365) : []), [spot, vol, days]);
  const chosen = chain.find((r) => r.strike === strike) ?? null;
  const premium = chosen ? (kind === "call" ? chosen.call : chosen.put) : NaN;
  const be = chosen ? breakeven(kind, chosen.strike, premium) : NaN;
  const cost = premium * mult * contracts;
  const dp = spot < 5 ? 4 : 2;
  const expiryBars = barsForDays(days, ppy);

  const start = () => {
    if (!chosen) return;
    setLeg({ kind, strike: chosen.strike, expiryBars, contracts, multiplier: mult, entryPremium: premium });
    setK(0); setClosedAt(null); setRecorded(false);
    if (target === null) setTarget(+be.toFixed(dp));
  };

  const atK = leg ? Math.min(closedAt ?? k, leg.expiryBars) : 0;
  const done = !!leg && (closedAt !== null || k >= leg.expiryBars);
  const valueNow = leg ? (atK >= leg.expiryBars ? Math.max(0, leg.kind === "call" ? closes[i0 + atK] - leg.strike : leg.strike - closes[i0 + atK]) : legValueAt(leg, closes, i0, atK, ppy)) : NaN;
  const pnl = leg ? (valueNow - leg.entryPremium) * leg.multiplier * leg.contracts : NaN;
  const greeksNow = leg && atK < leg.expiryBars ? blackScholes({ kind: leg.kind, spot: closes[i0 + atK], strike: leg.strike, years: (leg.expiryBars - atK) / ppy, vol: modelVolAt(closes, i0 + atK, ppy), rate: 0.03 }) : null;
  const touched = leg && target !== null ? firstTouch(bars, i0, atK, target, spot) : null;

  // A one-line explanation of the latest step.
  const narration = useMemo(() => {
    if (!leg || atK === 0) return null;
    const prevV = atK - 1 >= leg.expiryBars ? 0 : legValueAt(leg, closes, i0, atK - 1, ppy);
    const move = closes[i0 + atK] - closes[i0 + atK - 1];
    const g = blackScholes({ kind: leg.kind, spot: closes[i0 + atK - 1], strike: leg.strike, years: Math.max(0, leg.expiryBars - atK + 1) / ppy, vol: modelVolAt(closes, i0 + atK - 1, ppy), rate: 0.03 });
    if (!g) return null;
    const fromDelta = g.delta * move;
    const change = valueNow - prevV;
    return `Price ${move >= 0 ? "rose" : "fell"} ${Math.abs(move).toFixed(dp)}. Delta (${g.delta.toFixed(2)}) explains about ${fromDelta >= 0 ? "+" : ""}${fromDelta.toFixed(dp)} per unit; time decay took about ${Math.abs(g.theta * (365 / ppy)).toFixed(dp)}. The option moved ${change >= 0 ? "+" : ""}${change.toFixed(dp)} per unit.`;
  }, [leg, atK, closes, i0, ppy, valueNow, dp]);

  useEffect(() => {
    if (!done || !leg || recorded) return;
    const entry: Saved = {
      id: `${Date.now()}`, symbol, kind: leg.kind, strike: leg.strike, days, contracts: leg.contracts,
      cost: leg.entryPremium * leg.multiplier * leg.contracts, pnl, targetHit: touched !== null, from: bars[i0].t, to: bars[i0 + atK].t,
    };
    const next = [entry, ...saved].slice(0, 50);
    setSaved(next);
    setRecorded(true);
    try { localStorage.setItem(STORE, JSON.stringify(next)); } catch {}
  }, [done, leg, recorded, symbol, days, pnl, touched, bars, i0, atK, saved]);

  const stepAt = !data || i0 < 0 ? 0 : !leg ? (chosen ? (target === null ? 4 : 4) : 2) : done ? 6 : 5;
  const view = i0 >= 0 ? (() => {
    const s = Math.max(0, i0 - 119);
    return { past: closes.slice(s, i0 + 1), future: leg ? closes.slice(i0 + 1, i0 + 1 + atK) : [] };
  })() : null;

  const wins = saved.filter((t) => t.pnl > 0).length;
  const total = saved.reduce((a, t) => a + t.pnl, 0);

  return (
    <div className="space-y-4">
      <Steps at={stepAt} />
      <Explainers />

      <div className="grid items-start gap-4 lg:grid-cols-12">
        <div className="min-w-0 space-y-4 lg:col-span-8">
          <Panel
            title={i0 >= 0 ? `${meta.symbol} · ${meta.name}` : "Price history"}
            hint={leg ? `Day ${atK} of ${leg.expiryBars} trading days. The date stays hidden until the end; the path is what really happened.` : "A real past date, hidden from you. Everything to the left of the line is what you would have known that day."}
            source={data?.bars.length ? "computed" : undefined}
            action={!leg && (
              <Button onClick={() => reset(seed + 1)} title="Pick another hidden date"><RotateCcw className="size-3.5" /> New date</Button>
            )}
          >
            {loading && <p className="text-sm text-fg-muted">Loading real price history…</p>}
            {error && <p className="text-sm text-warn">{error}</p>}
            {view && (
              <PriceChart
                past={view.past}
                future={view.future}
                totalSteps={view.past.length + (leg?.expiryBars ?? expiryBars)}
                lines={[
                  ...(chosen || leg ? [{ y: leg?.strike ?? chosen!.strike, label: "Strike", tone: "accent" as const, dashed: true }] : []),
                  ...(Number.isFinite(leg ? breakeven(leg.kind, leg.strike, leg.entryPremium) : be) ? [{ y: leg ? breakeven(leg.kind, leg.strike, leg.entryPremium) : be, label: "Break-even", tone: "warn" as const, dashed: true }] : []),
                  ...(target !== null ? [{ y: target, label: "Your target", tone: "up" as const }] : []),
                ]}
                label={`${meta.name}: 120 days of real closes before a hidden date${leg ? `, then ${atK} days revealed` : ""}`}
                decimals={dp}
                nowLabel="trade day"
              />
            )}
          </Panel>

          {i0 >= 0 && !leg && (
            <Panel title="Build your trade" hint="Prices are Black-Scholes model prices using the last 30 days' volatility, the way a real market maker starts. Real option quotes would include a bid-ask spread." source="computed">
              <div className="flex flex-wrap items-end gap-4">
                <fieldset>
                  <legend className="text-xs text-fg-muted">Option</legend>
                  <div className="mt-1 flex gap-1.5">
                    {(["call", "put"] as const).map((o) => (
                      <button key={o} type="button" onClick={() => setKind(o)} className={cn("rounded-md border px-3 py-1.5 text-[13px]", kind === o ? "border-accent bg-accent-soft text-fg" : "border-line-strong bg-raised text-fg-muted")}>
                        Buy a {o} {o === "call" ? "(bet it rises)" : "(bet it falls)"}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="text-xs text-fg-muted">Expiry</legend>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {EXPIRIES.map((d) => (
                      <button key={d} type="button" onClick={() => setDays(d)} className={cn("rounded-md border px-2.5 py-1.5 text-[13px]", days === d ? "border-accent bg-accent-soft text-fg" : "border-line-strong bg-raised text-fg-muted")}>{d} days</button>
                    ))}
                  </div>
                </fieldset>
                <label className="text-xs text-fg-muted">
                  Contracts ({mult.toLocaleString()} units each)
                  <input type="number" min={1} max={20} value={contracts} onChange={(e) => setContracts(Math.max(1, Math.min(20, Math.round(Number(e.target.value) || 1))))} className="mt-1 block w-24 rounded-md border border-line-strong bg-raised px-2 py-1.5 text-[13px] text-fg" />
                </label>
              </div>

              <div className="mt-4 overflow-x-auto rounded-md border border-line">
                <table className="w-full text-left text-[13px] tabular">
                  <thead className="bg-raised text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
                    <tr><th className="px-3 py-2">Strike</th><th className="px-3 py-2">{kind} price</th><th className="px-3 py-2">Delta</th><th className="px-3 py-2">Model chance to finish in the money</th><th className="px-3 py-2" /></tr>
                  </thead>
                  <tbody>
                    {chain.map((r) => {
                      const p = kind === "call" ? r.call : r.put;
                      const itm = kind === "call" ? r.strike < spot : r.strike > spot;
                      const sel = r.strike === strike;
                      return (
                        <tr key={r.strike} className={cn("border-t border-line/70", sel && "bg-accent-soft")}>
                          <td className="px-3 py-1.5 font-mono">{r.strike.toFixed(dp)} {itm && <span className="ml-1 rounded bg-up-soft px-1 text-[10px] text-up">ITM</span>}</td>
                          <td className="px-3 py-1.5 font-mono">{p.toFixed(dp)}</td>
                          <td className="px-3 py-1.5 font-mono">{(kind === "call" ? r.callDelta : r.putDelta).toFixed(2)}</td>
                          <td className="px-3 py-1.5 font-mono">{((kind === "call" ? r.callItm : r.putItm) * 100).toFixed(0)}%</td>
                          <td className="px-3 py-1.5 text-right">
                            <button type="button" onClick={() => { setStrike(r.strike); setTarget(null); }} className={cn("rounded-md border px-2 py-1 text-[12px]", sel ? "border-accent text-fg" : "border-line-strong text-fg-muted hover:text-fg")}>{sel ? "Selected" : "Choose"}</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {chosen && (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Stat label="Premium per unit" value={premium.toFixed(dp)} />
                    <Stat label="Total cost (max loss)" value={money(cost)} tone={cost > ACCOUNT * 0.05 ? "warn" : undefined} sub={`${((cost / ACCOUNT) * 100).toFixed(1)}% of a ${money(ACCOUNT, 0)} practice account`} />
                    <Stat label="Break-even at expiry" value={be.toFixed(dp)} sub={`${pct(be / spot - 1)} from today`} />
                    <Stat label="Expiry" value={`${days} days`} sub={`${expiryBars} trading days`} />
                  </div>
                  <label className="block text-xs text-fg-muted">
                    <span className="inline-flex items-center gap-1"><Target className="size-3.5" /> Your price target for {meta.symbol} (we&apos;ll check whether it was ever reached before expiry)</span>
                    <div className="mt-1 flex items-center gap-3">
                      <input type="range" min={+(spot * 0.7).toFixed(dp)} max={+(spot * 1.3).toFixed(dp)} step={spot / 500} value={target ?? be} onChange={(e) => setTarget(+Number(e.target.value).toFixed(dp))} className="h-6 flex-1 accent-accent" aria-valuetext={`${(target ?? be).toFixed(dp)}`} />
                      <span className="w-28 text-right font-mono text-[13px] text-fg">{(target ?? be).toFixed(dp)}</span>
                    </div>
                  </label>
                  {cost > ACCOUNT * 0.05 && <p className="text-[12px] text-warn">This one trade would risk more than 5% of the practice account. Consider fewer contracts.</p>}
                  <Button variant="primary" onClick={start}><Play className="size-3.5" /> Place the simulated trade</Button>
                </div>
              )}
            </Panel>
          )}

          {leg && (
            <Panel title={done ? "Result" : "Run time forward"} hint={done ? "The hidden dates are revealed below." : "Move one day at a time to see how price, time and volatility change the option's value, or skip ahead."} source="computed">
              <div className="grid gap-3 sm:grid-cols-4">
                <Stat label={`${meta.symbol} now`} value={closes[i0 + atK].toFixed(dp)} sub={`${pct(closes[i0 + atK] / spot - 1)} since entry`} />
                <Stat label="Option value per unit" value={valueNow.toFixed(dp)} sub={`paid ${leg.entryPremium.toFixed(dp)}`} />
                <Stat label="Profit or loss" value={money(pnl)} tone={pnl >= 0 ? "up" : "down"} sub={pct(valueNow / leg.entryPremium - 1)} />
                <Stat label="Trading days left" value={String(Math.max(0, leg.expiryBars - atK))} />
              </div>
              {greeksNow && !done && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Delta" value={greeksNow.delta.toFixed(2)} sub="per $1 move" />
                  <Stat label="Gamma" value={greeksNow.gamma.toFixed(4)} sub="delta change per $1" />
                  <Stat label="Theta" value={greeksNow.theta.toFixed(dp)} sub="per calendar day" tone="down" />
                  <Stat label="Vega" value={greeksNow.vega.toFixed(dp)} sub="per volatility point" />
                </div>
              )}
              {narration && !done && <p className="mt-3 rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-fg-body">{narration}</p>}
              {!done ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => setK((x) => Math.min(leg.expiryBars, x + 1))}><ChevronRight className="size-3.5" /> Next day</Button>
                  <Button onClick={() => setK((x) => Math.min(leg.expiryBars, x + (ppy >= 365 ? 7 : 5)))}><FastForward className="size-3.5" /> Skip a week</Button>
                  <Button onClick={() => setK(leg.expiryBars)}><SkipForward className="size-3.5" /> Skip to expiry</Button>
                  <Button onClick={() => setClosedAt(k)}><XCircle className="size-3.5" /> Sell the option now</Button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className={cn("flex items-start gap-2 rounded-md border px-3 py-2.5 text-[13px]", pnl >= 0 ? "border-up/40 bg-up-soft" : "border-down/40 bg-down-soft")}>
                    {pnl >= 0 ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-up" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-down" />}
                    <div>
                      <p className="font-medium text-fg">
                        {closedAt !== null && closedAt < leg.expiryBars ? `You sold after ${atK} trading days` : "Held to expiry"}: {pnl >= 0 ? "profit" : "loss"} of {money(Math.abs(pnl))} ({pct(valueNow / leg.entryPremium - 1)}).
                      </p>
                      <p className="mt-1 text-fg-muted">
                        Real dates: {bars[i0].t} to {bars[i0 + atK].t}. {meta.symbol} went from {spot.toFixed(dp)} to {closes[i0 + atK].toFixed(dp)}.{" "}
                        {target !== null && (touched !== null ? `Your target of ${target.toFixed(dp)} was reached on trading day ${touched}.` : `Your target of ${target.toFixed(dp)} was not reached.`)}{" "}
                        {atK >= leg.expiryBars && (valueNow > 0 ? "The option finished in the money." : "The option expired worthless: the whole premium was lost.")}
                      </p>
                    </div>
                  </div>
                  <p className="text-[13px] text-fg-muted">
                    {touched !== null && pnl < 0 ? "Your view on price was right at some point, but the option still lost: timing and time decay matter as much as direction. " : ""}
                    Try the same date with a different strike or expiry to see how each choice changes the result.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => reset()}><RotateCcw className="size-3.5" /> Same date, new trade</Button>
                    <Button variant="primary" onClick={() => reset(seed + 1)}>New hidden date <ArrowRight className="size-3.5" /></Button>
                  </div>
                </div>
              )}
            </Panel>
          )}
        </div>

        <div className="min-w-0 space-y-4 lg:col-span-4">
          <Panel title="Choose a market" hint="Real daily prices; the simulation picks a hidden date from the last two decades.">
            <select value={symbol} onChange={(e) => { setSymbol(e.target.value); reset(seed + 1); }} className="w-full rounded-md border border-line-strong bg-raised px-2 py-2 text-[13px] text-fg" aria-label="Market">
              {HISTORY_SYMBOLS.map((s) => <option key={s.symbol} value={s.symbol}>{s.symbol} · {s.name}</option>)}
            </select>
            {i0 >= 0 && (
              <dl className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
                <div><dt className="text-fg-muted">Price on trade day</dt><dd className="font-mono text-fg">{spot.toFixed(dp)}</dd></div>
                <div><dt className="text-fg-muted">30-day volatility</dt><dd className="font-mono text-fg">{(vol * 100).toFixed(1)}%</dd></div>
                <div><dt className="text-fg-muted">60-day volatility</dt><dd className="font-mono text-fg">{(vol60 * 100).toFixed(1)}%</dd></div>
                <div><dt className="text-fg-muted">Typical {days}-day move (±1σ)</dt><dd className="font-mono text-fg">±{(spot * vol * Math.sqrt(days / 365)).toFixed(dp)}</dd></div>
              </dl>
            )}
            <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-relaxed text-fg-muted">
              <Info className="mt-0.5 size-3.5 shrink-0" /> Higher volatility makes options dearer, because bigger moves are more likely in either direction.
            </p>
          </Panel>

          <Panel title="Your simulated trades" hint="Saved in this browser.">
            {saved.length === 0 ? (
              <p className="text-[13px] text-fg-muted">No trades yet. Finish one to see it here.</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 text-[13px]">
                  <Stat label="Trades" value={String(saved.length)} />
                  <Stat label="Winners" value={`${Math.round((wins / saved.length) * 100)}%`} />
                  <Stat label="Total" value={money(total, 0)} tone={total >= 0 ? "up" : "down"} />
                </div>
                <ul className="mt-3 max-h-72 space-y-1.5 overflow-auto">
                  {saved.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px]">
                      <span className="min-w-0 truncate">{t.symbol} {t.kind} {t.strike} · {t.days}d · {t.from}</span>
                      <span className={cn("shrink-0 font-mono", t.pnl >= 0 ? "text-up" : "text-down")}>{money(t.pnl, 0)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "up" | "down" | "warn" }) {
  return (
    <div className="min-w-0 rounded-md border border-line bg-surface px-3 py-2">
      <p className="text-[11px] text-fg-muted">{label}</p>
      <p className={cn("mt-0.5 font-mono text-[15px] tabular", tone === "up" && "text-up", tone === "down" && "text-down", tone === "warn" && "text-warn", !tone && "text-fg")}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-fg-subtle">{sub}</p>}
    </div>
  );
}
