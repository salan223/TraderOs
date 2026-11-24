"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { PanZoomHint, usePanZoom, useWidth } from "@/components/academy/charts/candle-chart";
import { linearScale, niceTicks } from "@/lib/academy/charts";
import {
  BARS_PER_YEAR, DEFAULT_COSTS, DEFAULT_RUN, REGIMES, TEMPLATES, adjustmentDemo, buyAndHold, configKey, costSweep, curveMetrics, deflatedSharpe,
  drawdowns, expectedMaxZ, forwardGap, haircutSharpe, makeSeries, metrics, moments, monteCarlo, neighbourMean, returnsOf, runBacktest, sharpeIn,
  survivorUniverse, sweep, walkForward, warmup, type AdjustKind, type Metrics, type Params, type Regime, type RunOptions, type Template,
} from "@/lib/academy/backtest";
import { isStringRecord, loadLocal, removeLocal, saveLocal } from "@/lib/academy/psychology";
import { cn } from "@/lib/cn";
import { Choice, Readout, Readouts, Result, Slider, WidgetFrame, num, signed } from "./kit";
import { LinePlot } from "./risk-plot";
import { Toggle } from "./ta-lab";

/*
  The backtesting lab for Track 11. Every price series is simulated from a
  seed (makeSeries) and every number is computed from the learner's
  settings; nothing is market data or real performance. The validity
  checklist saves only in this browser, inside try/catch.
*/

type P = { title: string; caption: string };
const pct = (x: number, dp = 1) => (Number.isFinite(x) ? `${num(x * 100, dp)}%` : "–");
const spct = (x: number, dp = 1) => (Number.isFinite(x) ? `${signed(x * 100, dp)}%` : "–");
const f2 = (x: number) => (Number.isFinite(x) ? num(x, 2) : "–");
const s2 = (x: number) => (Number.isFinite(x) ? signed(x, 2) : "–");
const rR = (x: number) => (Number.isFinite(x) ? `${signed(x, 2)}R` : "–");
const pf = (x: number) => (x === Infinity ? "no losses" : Number.isFinite(x) ? num(x, 2) : "–");
const TEMPLATE_OPTS = (Object.keys(TEMPLATES) as Template[]).map((id) => ({ id, label: TEMPLATES[id].label }));
const BASE = { costs: DEFAULT_COSTS, ...DEFAULT_RUN };
const yearLabel = (i: number) => `year ${num(i / BARS_PER_YEAR + 1, 1)}`;

// ── A pannable equity and drawdown chart (uses the shared usePanZoom) ───────

type ChartLine = { values: readonly number[]; label: string; cls: string; dashed?: boolean };
const PAD_L = 46, PAD_R = 10, TOP = 150, DD_H = 64, GAP = 14, FONT = 11;

export function EquityChart({ lines, dd, split, label }: { lines: readonly ChartLine[]; dd: readonly number[]; split?: number; label: string }) {
  const [boxRef, width] = useWidth<HTMLDivElement>();
  const n = Math.max(1, ...lines.map((l) => l.values.length));
  const pz = usePanZoom(n, n, 30);
  const { from, to } = pz;
  const plotW = Math.max(40, width - PAD_L - PAD_R);
  pz.setPlot(PAD_L, plotW);
  const x = (i: number) => PAD_L + ((i - from) / Math.max(1, to - from - 1)) * plotW;
  let lo = Infinity, hi = -Infinity;
  for (const l of lines) for (let i = from; i < to; i++) { const v = l.values[i]; if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
  if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
  if (hi - lo < 1e-9) { lo -= 0.05; hi += 0.05; }
  const pad = (hi - lo) * 0.06;
  const y = linearScale(lo - pad, hi + pad, TOP - 4, 8);
  const ticks = niceTicks(lo, hi, 4);
  let ddLo = 0;
  for (let i = from; i < to; i++) if (Number.isFinite(dd[i])) ddLo = Math.min(ddLo, dd[i]);
  ddLo = Math.min(-0.01, ddLo * 1.1);
  const ddTop = TOP + GAP;
  const yd = linearScale(ddLo, 0, ddTop + DD_H, ddTop);
  const H = ddTop + DD_H + FONT + 10;
  const path = (vals: readonly number[], yy: (v: number) => number) => {
    let d = "";
    for (let i = from; i < to; i++) { const v = vals[i]; if (!Number.isFinite(v)) continue; d += `${d ? "L" : "M"}${x(i).toFixed(1)},${yy(v).toFixed(1)}`; }
    return d;
  };
  const ddArea = `${path(dd, yd)}L${x(to - 1).toFixed(1)},${yd(0).toFixed(1)}L${x(from).toFixed(1)},${yd(0).toFixed(1)}Z`;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const len = to - from;
    let handled = true;
    if (e.key === "ArrowLeft") pz.panBy(-Math.max(1, Math.round(len * 0.1)));
    else if (e.key === "ArrowRight") pz.panBy(Math.max(1, Math.round(len * 0.1)));
    else if (e.key === "+" || e.key === "=") pz.zoomAt(0.7);
    else if (e.key === "-") pz.zoomAt(1 / 0.7);
    else if (e.key === "0" || e.key === "Home") pz.reset();
    else handled = false;
    if (handled) e.preventDefault();
  };
  const xTicks = niceTicks(from, to - 1, Math.max(2, Math.round(plotW / 110))).filter((t) => t >= from && t < to);
  return (
    <div className="min-w-0" data-chart>
      <div
        ref={(el) => { boxRef.current = el; pz.wrapRef.current = el; }}
        role="group"
        tabIndex={0}
        onKeyDown={onKey}
        aria-label={`${label}. Showing bars ${from + 1} to ${to} of ${n}. Left and right arrows move, plus and minus zoom, 0 resets.`}
        className="min-w-0 rounded-md border border-line bg-panel focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg
          width={width}
          height={H}
          viewBox={`0 0 ${width} ${H}`}
          className={cn("block w-full select-none", pz.dragging ? "cursor-grabbing" : "cursor-grab")}
          style={{ fontSize: `${FONT}px`, height: H, touchAction: "pan-y" }}
          onPointerDown={pz.bind.onPointerDown}
          onPointerMove={pz.bind.onPointerMove}
          onPointerUp={pz.bind.onPointerUp}
          onPointerCancel={pz.bind.onPointerCancel}
          onDoubleClick={() => pz.reset()}
          data-from={from}
          data-to={to}
          aria-hidden
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD_L} x2={PAD_L + plotW} y1={y(t)} y2={y(t)} className="stroke-line" />
              <text x={PAD_L - 4} y={y(t) + 4} textAnchor="end" className="fill-fg-subtle tabular">{`${num((t - 1) * 100, 0)}%`}</text>
            </g>
          ))}
          {split !== undefined && split > from && split < to && (
            <g>
              <rect x={x(split)} y={4} width={Math.max(0, PAD_L + plotW - x(split))} height={TOP - 4} className="fill-warn/10" />
              <line x1={x(split)} x2={x(split)} y1={4} y2={ddTop + DD_H} className="stroke-warn" strokeDasharray="4 3" />
              <text x={x(split) + 4} y={16} className="fill-warn">out-of-sample</text>
            </g>
          )}
          {lines.map((l) => <path key={l.label} d={path(l.values, y)} fill="none" className={l.cls} strokeWidth={l.dashed ? 1.4 : 2} strokeDasharray={l.dashed ? "5 4" : undefined} />)}
          <text x={PAD_L - 4} y={ddTop + 8} textAnchor="end" className="fill-fg-subtle">0%</text>
          <text x={PAD_L - 4} y={ddTop + DD_H} textAnchor="end" className="fill-fg-subtle tabular">{`${num(ddLo * 100, 0)}%`}</text>
          <path d={ddArea} className="fill-down/25 stroke-down" strokeWidth={1} />
          <text x={PAD_L + 4} y={ddTop + 12} className="fill-fg-muted">drawdown</text>
          {xTicks.map((t) => <text key={t} x={x(t)} y={H - 4} textAnchor="middle" className="fill-fg-subtle tabular">{yearLabel(t)}</text>)}
        </svg>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <span className="flex flex-wrap gap-3 text-[11px] text-fg-muted">
          {lines.map((l) => <span key={l.label} className="inline-flex items-center gap-1"><svg width="14" height="6" aria-hidden><line x1="0" x2="14" y1="3" y2="3" className={l.cls} strokeWidth={2} strokeDasharray={l.dashed ? "4 3" : undefined} /></svg>{l.label}</span>)}
        </span>
        <PanZoomHint nudge={pz.nudge} />
      </div>
    </div>
  );
}

// ── Shared settings ─────────────────────────────────────────────────────────

function useStrategySettings(initial: Template = "ma") {
  const [template, setTemplateRaw] = useState<Template>(initial);
  const [params, setParams] = useState<Params>(TEMPLATES[initial].defaults);
  const setTemplate = (t: Template) => { setTemplateRaw(t); setParams(TEMPLATES[t].defaults); };
  return { template, setTemplate, params, setParams };
}

function ParamSliders({ template, params, setParams }: { template: Template; params: Params; setParams: (p: Params) => void }) {
  const d = TEMPLATES[template];
  return (
    <>
      <Slider label={d.p1.label} value={params.p1} min={d.p1.min} max={d.p1.max} step={d.p1.step} onChange={(v) => setParams({ ...params, p1: v })} />
      <Slider label={d.p2.label} value={params.p2} min={d.p2.min} max={d.p2.max} step={d.p2.step} onChange={(v) => setParams({ ...params, p2: v })} />
    </>
  );
}

function MetricsTable({ cols }: { cols: { label: string; m: Metrics; bench?: boolean }[] }) {
  const rows: [string, (m: Metrics, bench?: boolean) => string][] = [
    ["Total return", (m) => spct(m.totalReturn)],
    ["CAGR", (m) => spct(m.cagr)],
    ["Sharpe", (m) => s2(m.sharpe)],
    ["Sortino", (m) => s2(m.sortino)],
    ["Max drawdown", (m) => pct(m.maxDD)],
    ["Profit factor", (m, b) => (b ? "–" : pf(m.profitFactor))],
    ["Win rate", (m, b) => (b ? "–" : pct(m.winRate, 0))],
    ["Expectancy", (m, b) => (b ? "–" : rR(m.expectancyR))],
    ["Exposure", (m) => pct(m.exposure, 0)],
    ["Trades", (m, b) => (b ? "1" : String(m.trades))],
  ];
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[300px] text-[13px] tabular" data-metrics>
        <thead>
          <tr className="text-left text-xs text-fg-muted">
            <th className="py-1 pr-2 font-normal">Metric</th>
            {cols.map((c) => <th key={c.label} className="py-1 pr-2 text-right font-normal">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, get]) => (
            <tr key={name} className="border-t border-line">
              <td className="py-1 pr-2 text-fg-muted">{name}</td>
              {cols.map((c) => <td key={c.label} className="py-1 pr-2 text-right">{get(c.m, c.bench)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── The main lab ────────────────────────────────────────────────────────────

export function BacktestLab({ title, caption }: P) {
  const [regime, setRegime] = useState<Regime>("trending");
  const [seed, setSeed] = useState(1);
  const { template, setTemplate, params, setParams } = useStrategySettings("ma");
  const [comm, setComm] = useState(DEFAULT_COSTS.commissionBps);
  const [slip, setSlip] = useState(DEFAULT_COSTS.slipBps);
  const [risk, setRisk] = useState(DEFAULT_RUN.riskFrac * 100);
  const [stopAtr, setStopAtr] = useState<number>(DEFAULT_RUN.stopAtr);
  const [lookahead, setLookahead] = useState(false);
  const [isShare, setIsShare] = useState(60);
  const [showTrades, setShowTrades] = useState(false);
  const tried = useRef(new Set<string>());
  const [triedCount, setTriedCount] = useState(0);

  const bars = useMemo(() => makeSeries(regime, seed), [regime, seed]);
  const opts: RunOptions = { template, params, costs: { commissionBps: comm, slipBps: slip }, riskFrac: risk / 100, stopAtr, lookahead };
  const key = configKey(regime, seed, opts);
  const run = useMemo(() => runBacktest(bars, opts), [bars, key]); // eslint-disable-line react-hooks/exhaustive-deps
  const bh = useMemo(() => buyAndHold(bars, opts.costs), [bars, comm, slip]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!tried.current.has(key)) { tried.current.add(key); setTriedCount(tried.current.size); }
  }, [key]);

  const n = bars.length;
  const w = Math.min(n - 2, warmup(template, params));
  const split = Math.round(n * (isShare / 100));
  const mIs = metrics(run, w, split), mOos = metrics(run, split, n);
  const bIs = curveMetrics(bh, w, split), bOos = curveMetrics(bh, split, n);
  const eq0 = run.equity[0], b0 = bh[0];
  const lines: ChartLine[] = [
    { values: run.equity.map((e) => e / eq0), label: "Strategy", cls: "stroke-accent" },
    { values: bh.map((e) => e / b0), label: "Buy and hold", cls: "stroke-fg-subtle", dashed: true },
  ];
  const dd = drawdowns(run.equity);
  const full = returnsOf(run.equity, w, n);
  const mm = moments(full);
  const fullSharpe = metrics(run, w, n).sharpe;
  const dsr = deflatedSharpe(fullSharpe, triedCount, full.length, mm.skew, mm.kurt);
  const hc = haircutSharpe(fullSharpe, (n - w) / BARS_PER_YEAR, triedCount);
  const gap = mIs.sharpe - mOos.sharpe;

  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Simulated market" value={regime} options={REGIMES} onChange={setRegime} />
        <div className="flex items-end gap-2">
          <Button onClick={() => setSeed((s) => s + 1)}>New simulated data</Button>
          <span className="pb-1 text-xs text-fg-subtle tabular">seed {seed}</span>
        </div>
        <Choice label="Rule template" value={template} options={TEMPLATE_OPTS} onChange={setTemplate} className="sm:col-span-2" />
        <ParamSliders template={template} params={params} setParams={setParams} />
        <Slider label="Commission per side" value={comm} min={0} max={30} step={1} onChange={setComm} format={(v) => `${v} bp`} />
        <Slider label="Half-spread and slippage per side" value={slip} min={0} max={30} step={1} onChange={setSlip} format={(v) => `${v} bp`} />
        <Slider label="Risk per trade" value={risk} min={0.25} max={5} step={0.25} onChange={setRisk} format={(v) => `${num(v, 2)}% of equity`} />
        <Slider label="Stop distance" value={stopAtr} min={1} max={6} step={0.5} onChange={setStopAtr} format={(v) => `${num(v, 1)} × ATR(14)`} />
        <Slider label="In-sample share" value={isShare} min={40} max={90} step={5} onChange={setIsShare} format={(v) => `${v}% · out-of-sample ${100 - v}%`} />
        <div className="flex items-end"><Toggle label="Lookahead bug: trade at the open using that bar's close" checked={lookahead} onChange={setLookahead} /></div>
      </div>
      <p className="t-small">{TEMPLATES[template].describe(params)} Orders fill at the next bar's open{lookahead ? " (the bug is on: this run cheats)" : ""}. Stop: {num(stopAtr, 1)} × ATR(14) below entry. Long or flat only.</p>
      <EquityChart lines={lines} dd={dd} split={split} label="Simulated equity of the strategy and of buy and hold, with drawdown below" />
      <MetricsTable cols={[{ label: "In-sample", m: mIs }, { label: "Out-of-sample", m: mOos }, { label: "Buy & hold IS", m: bIs, bench: true }, { label: "Buy & hold OOS", m: bOos, bench: true }]} />
      <Readouts cols={3}>
        <Readout label="Variants tried this visit" value={String(triedCount)} sub="every distinct setting counts" tone={triedCount > 20 ? "warn" : undefined} />
        <Readout label="Best Sharpe expected from noise" value={f2(dsr.sr0Annual)} sub={`after ${triedCount} tries, no edge`} />
        <Readout label="Deflated Sharpe ratio" value={pct(dsr.dsr, 0)} sub="chance the true Sharpe is above zero" tone={dsr.dsr < 0.95 ? "warn" : "up"} />
      </Readouts>
      <p className="t-small">Simple haircut: a full-sample Sharpe of {s2(fullSharpe)} becomes {s2(hc.adjusted)} once the p-value is multiplied by {triedCount} tries ({Number.isFinite(hc.haircut) ? `a ${pct(Math.min(1, Math.max(0, hc.haircut)), 0)} haircut` : "no haircut applies to a negative Sharpe"}).</p>
      <Result tone={lookahead ? "bad" : gap > 0.5 ? "warn" : "info"}>
        {lookahead
          ? "The lookahead bug is on. These results use a price the rule could not have known when it traded, so they are not a test of anything."
          : `In-sample Sharpe ${s2(mIs.sharpe)}, out-of-sample ${s2(mOos.sharpe)}. ${gap > 0.5 ? "The out-of-sample result is much weaker, a common sign that settings were tuned to the first part of the data." : "Judge the strategy on the out-of-sample column, and only after fixing the settings."} This is one simulated path.`}
      </Result>
      <div>
        <Button onClick={() => setShowTrades((v) => !v)} aria-expanded={showTrades}>{showTrades ? "Hide" : "Show"} trade list ({run.trades.length})</Button>
        {showTrades && (
          <div className="mt-2 max-h-64 overflow-auto rounded-md border border-line">
            <table className="w-full min-w-[420px] text-[12px] tabular" data-trades>
              <thead className="sticky top-0 bg-surface text-left text-fg-muted">
                <tr><th className="px-2 py-1 font-normal">#</th><th className="px-2 py-1 font-normal">Entry bar</th><th className="px-2 py-1 font-normal">Exit bar</th><th className="px-2 py-1 text-right font-normal">Entry</th><th className="px-2 py-1 text-right font-normal">Exit</th><th className="px-2 py-1 text-right font-normal">Result</th><th className="px-2 py-1 font-normal">Exit by</th><th className="px-2 py-1 font-normal">Period</th></tr>
              </thead>
              <tbody>
                {run.trades.map((t, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-2 py-0.5">{i + 1}</td>
                    <td className="px-2 py-0.5">{t.entryBar + 1}</td>
                    <td className="px-2 py-0.5">{t.exitBar + 1}</td>
                    <td className="px-2 py-0.5 text-right">{num(t.entryPx, 2)}</td>
                    <td className="px-2 py-0.5 text-right">{num(t.exitPx, 2)}</td>
                    <td className={cn("px-2 py-0.5 text-right", t.r > 0 ? "text-up" : "text-down")}>{rR(t.r)}</td>
                    <td className="px-2 py-0.5">{t.reason}</td>
                    <td className="px-2 py-0.5">{t.entryBar < split ? "IS" : "OOS"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </WidgetFrame>
  );
}

// ── Data adjustments ────────────────────────────────────────────────────────

const ADJ_OPTS: { id: AdjustKind; label: string }[] = [
  { id: "split", label: "Stock split" },
  { id: "dividend", label: "Dividends" },
  { id: "roll", label: "Futures roll" },
];
const ADJ_TEXT: Record<AdjustKind, string> = {
  split: "A 2-for-1 split halves the raw price overnight. A rule reading raw prices sees a 50% crash that never cost holders anything.",
  dividend: "Each ex-dividend date drops the raw price by the payout. Price-only data understates what a holder earned.",
  roll: "Each new futures contract here trades above the old one. A naive continuous series jumps at every roll, a move no one could have traded.",
};

export function AdjustmentLab({ title, caption }: P) {
  const [kind, setKind] = useState<AdjustKind>("split");
  const d = useMemo(() => adjustmentDemo(kind, 3), [kind]);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Data event" value={kind} options={ADJ_OPTS} onChange={setKind} />
      <LinePlot
        label="Raw and adjusted simulated prices"
        series={[{ values: d.raw, tone: "down", label: "raw" }, { values: d.adjusted, tone: "accent", label: "adjusted" }]}
        markers={d.events.map((e) => ({ x: e, y: d.raw[e], tone: "warn" as const }))}
        yFormat={(v) => num(v, 0)}
        xLabel="bar"
      />
      <Readouts cols={2}>
        <Readout label="Biggest one-bar move, raw" value={spct(d.biggestRawMove)} tone={Math.abs(d.biggestRawMove) > 0.1 ? "down" : undefined} />
        <Readout label="Biggest one-bar move, adjusted" value={spct(d.biggestAdjMove)} />
        <Readout label="Whole-period change, raw" value={spct(d.rawTotal)} />
        <Readout label="Whole-period change, adjusted" value={spct(d.adjTotal)} />
      </Readouts>
      <Result>{ADJ_TEXT[kind]} Red points mark the events.</Result>
    </WidgetFrame>
  );
}

// ── Lookahead ───────────────────────────────────────────────────────────────

export function LookaheadLab({ title, caption }: P) {
  const [regime, setRegime] = useState<Regime>("trending");
  const { template, setTemplate, params } = useStrategySettings("breakout");
  const bars = useMemo(() => makeSeries(regime, 2), [regime]);
  const honest = useMemo(() => runBacktest(bars, { ...BASE, template, params }), [bars, template, params]);
  const bug = useMemo(() => runBacktest(bars, { ...BASE, template, params, lookahead: true }), [bars, template, params]);
  const w = warmup(template, params);
  const mh = metrics(honest, w), mb = metrics(bug, w);
  const table = useMemo(() => REGIMES.map((r) => {
    const b = makeSeries(r.id, 2);
    return { r: r.label, h: metrics(runBacktest(b, { ...BASE, template, params }), w).sharpe, l: metrics(runBacktest(b, { ...BASE, template, params, lookahead: true }), w).sharpe };
  }), [template, params, w]);
  const inflated = mb.sharpe > mh.sharpe;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Simulated market" value={regime} options={REGIMES} onChange={setRegime} />
        <Choice label="Rule template" value={template} options={TEMPLATE_OPTS} onChange={setTemplate} />
      </div>
      <EquityChart
        label="Simulated equity with the honest fill and with the lookahead bug"
        lines={[{ values: honest.equity.map((e) => e / honest.equity[0]), label: "Honest: next bar's open", cls: "stroke-accent" }, { values: bug.equity.map((e) => e / bug.equity[0]), label: "Bug: same bar's open", cls: "stroke-down", dashed: true }]}
        dd={drawdowns(honest.equity)}
      />
      <Readouts cols={2}>
        <Readout label="Sharpe, honest" value={s2(mh.sharpe)} />
        <Readout label="Sharpe, with the bug" value={s2(mb.sharpe)} tone={inflated ? "warn" : undefined} />
        <Readout label="CAGR, honest" value={spct(mh.cagr)} />
        <Readout label="CAGR, with the bug" value={spct(mb.cagr)} />
      </Readouts>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[280px] text-[13px] tabular">
          <thead><tr className="text-left text-xs text-fg-muted"><th className="py-1 font-normal">Market</th><th className="py-1 text-right font-normal">Honest Sharpe</th><th className="py-1 text-right font-normal">Bug Sharpe</th></tr></thead>
          <tbody>{table.map((t) => <tr key={t.r} className="border-t border-line"><td className="py-1">{t.r}</td><td className="py-1 text-right">{s2(t.h)}</td><td className="py-1 text-right">{s2(t.l)}</td></tr>)}</tbody>
        </table>
      </div>
      <Result tone="warn">
        {inflated
          ? "Here the bug flatters the rule: it buys at the open of a bar it already knows closed strongly."
          : "Here the bug makes results worse: a rule that buys after a fall now buys before the fall it is reacting to. It is still wrong."}{" "}
        Either way the backtest no longer describes anything you could have traded.
      </Result>
    </WidgetFrame>
  );
}

// ── Survivorship ────────────────────────────────────────────────────────────

export function SurvivorshipLab({ title, caption }: P) {
  const [floor, setFloor] = useState(30);
  const [recovery, setRecovery] = useState(50);
  const u = useMemo(() => survivorUniverse(4, 200, 1260, floor / 100, recovery / 100), [floor, recovery]);
  const all = u.reduce((s, x) => s + x.finalReturn, 0) / u.length;
  const surv = u.filter((x) => !x.delisted);
  const sAvg = surv.length ? surv.reduce((s, x) => s + x.finalReturn, 0) / surv.length : NaN;
  const bins = Array.from({ length: 12 }, (_, i) => -1 + i * 0.5);
  const count = (lo: number, list: typeof u) => list.filter((x) => x.finalReturn >= lo && (lo === bins[bins.length - 1] || x.finalReturn < lo + 0.5)).length;
  const maxC = Math.max(1, ...bins.map((b) => count(b, u)));
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Delisted when price falls below" value={floor} min={10} max={60} step={5} onChange={setFloor} format={(v) => `${v}% of start`} />
        <Slider label="Investor gets back at delisting" value={recovery} min={0} max={100} step={10} onChange={setRecovery} format={(v) => `${v}% of last price`} />
      </div>
      <svg viewBox="0 0 360 150" className="h-auto w-full" role="img" aria-label="Histogram of five-year returns for 200 simulated stocks, split into survivors and delisted stocks.">
        {bins.map((b, i) => {
          const a = count(b, u), s = count(b, surv);
          const h = (a / maxC) * 110, hs = (s / maxC) * 110, x = 10 + i * 28.5;
          return (
            <g key={b}>
              <rect x={x} y={120 - h} width={24} height={h} className="fill-down/40" />
              <rect x={x} y={120 - hs} width={24} height={hs} className="fill-accent/70" />
              <text x={x + 12} y={136} textAnchor="middle" fontSize={9} className="fill-fg-subtle">{i % 2 === 0 ? `${num(b * 100, 0)}%` : ""}</text>
            </g>
          );
        })}
        <text x={350} y={148} textAnchor="end" fontSize={9} className="fill-fg-subtle">five-year return</text>
      </svg>
      <p className="t-small"><span className="text-accent-strong">Blue</span>: stocks still listed at the end. <span className="text-down">Red</span>: delisted stocks a survivor-only database would leave out.</p>
      <Readouts cols={3}>
        <Readout label="Average, every stock" value={spct(all)} />
        <Readout label="Average, survivors only" value={spct(sAvg)} tone="warn" />
        <Readout label="Delisted" value={`${u.length - surv.length} of ${u.length}`} />
      </Readouts>
      <Result tone="warn">Every simulated stock had zero expected return. Testing on survivors alone adds {spct(sAvg - all)} to the average five-year return, from nothing but the choice of data.</Result>
    </WidgetFrame>
  );
}

// ── Costs ───────────────────────────────────────────────────────────────────

const SPEEDS = {
  slow: { label: "Slow: MA 20 / 100", template: "ma" as Template, params: { p1: 20, p2: 100 } },
  medium: { label: "Medium: MA 5 / 20", template: "ma" as Template, params: { p1: 5, p2: 20 } },
  fast: { label: "Fast: breakout 5 / 3", template: "breakout" as Template, params: { p1: 5, p2: 3 } },
} as const;
type Speed = keyof typeof SPEEDS;
const LEVELS = [0, 5, 10, 15, 20, 25, 30, 40, 50];

export function CostsLab({ title, caption }: P) {
  const [regime, setRegime] = useState<Regime>("trending");
  const [speed, setSpeed] = useState<Speed>("fast");
  const s = SPEEDS[speed];
  const bars = useMemo(() => makeSeries(regime, 1), [regime]);
  const rows = useMemo(() => costSweep(bars, s.template, s.params, LEVELS, DEFAULT_RUN.riskFrac, DEFAULT_RUN.stopAtr), [bars, s]);
  const be = rows.find((r) => r.sharpe <= 0);
  const perYear = rows[0].trades / ((bars.length - warmup(s.template, s.params)) / BARS_PER_YEAR);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Simulated market" value={regime} options={REGIMES} onChange={setRegime} />
        <Choice label="Rule speed" value={speed} options={(Object.keys(SPEEDS) as Speed[]).map((id) => ({ id, label: SPEEDS[id].label }))} onChange={setSpeed} />
      </div>
      <LinePlot
        label="Net Sharpe ratio at each cost level"
        series={[{ values: rows.map((r) => r.sharpe), tone: "accent", label: "net Sharpe" }]}
        xValues={LEVELS}
        lines={[{ y: 0, label: "0", tone: "muted", dashed: true }]}
        xLabel="cost per side (bp): commission + half-spread + slippage"
        yFormat={(v) => num(v, 1)}
      />
      <Readouts cols={3}>
        <Readout label="Trades per year" value={num(perYear, 0)} />
        <Readout label="Sharpe at zero cost" value={s2(rows[0].sharpe)} />
        <Readout label="Sharpe at 20 bp a side" value={s2(rows[4].sharpe)} />
      </Readouts>
      <Result tone={be ? "warn" : "info"}>
        {be ? `On this path the net Sharpe falls to zero or below by ${be.bps} bp a side.` : "On this path the rule stays above zero across these cost levels."} The more often a rule trades, the faster costs eat it.
      </Result>
    </WidgetFrame>
  );
}

// ── Metrics that disagree ───────────────────────────────────────────────────

export function MetricsLab({ title, caption }: P) {
  const [regime, setRegime] = useState<Regime>("ranging");
  const bars = useMemo(() => makeSeries(regime, 1), [regime]);
  const cols = useMemo(() => {
    const out: { label: string; m: Metrics; bench?: boolean }[] = (Object.keys(TEMPLATES) as Template[]).map((t) => {
      const p = TEMPLATES[t].defaults;
      return { label: TEMPLATES[t].label.split(" ")[0], m: metrics(runBacktest(bars, { ...BASE, template: t, params: p }), 260) };
    });
    out.push({ label: "Buy & hold", m: curveMetrics(buyAndHold(bars, DEFAULT_COSTS), 260), bench: true });
    return out;
  }, [bars]);
  const strat = cols.filter((c) => !c.bench);
  const bestBy = (k: keyof Metrics, hi = true) => strat.reduce((a, b) => ((hi ? b.m[k] > a.m[k] : b.m[k] < a.m[k]) && Number.isFinite(b.m[k]) ? b : a)).label;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Simulated market" value={regime} options={REGIMES} onChange={setRegime} />
      <MetricsTable cols={cols} />
      <Readouts cols={3}>
        <Readout label="Best win rate" value={bestBy("winRate")} />
        <Readout label="Best CAGR" value={bestBy("cagr")} />
        <Readout label="Shallowest drawdown" value={bestBy("maxDD")} />
      </Readouts>
      <Result>Each metric answers a different question. A high win rate can sit next to a poor return, and a shallow drawdown can come from rarely being in the market (see exposure). Read them together.</Result>
    </WidgetFrame>
  );
}

// ── Parameter sweep heatmap ─────────────────────────────────────────────────

function heatCls(v: number): string {
  if (!Number.isFinite(v)) return "fill-raised";
  if (v > 1) return "fill-up/80";
  if (v > 0.5) return "fill-up/55";
  if (v > 0) return "fill-up/25";
  if (v > -0.5) return "fill-down/25";
  return "fill-down/55";
}

export function SweepLab({ title, caption }: P) {
  const [regime, setRegime] = useState<Regime>("random");
  const [template, setTemplate] = useState<Template>("ma");
  const bars = useMemo(() => makeSeries(regime, 1), [regime]);
  const cells = useMemo(() => sweep(bars, template, BASE), [bars, template]);
  const split = 756, start = 260;
  const isGrid = cells.map((row) => row.map((c) => sharpeIn(c.run, start, split)));
  const oosGrid = cells.map((row) => row.map((c) => sharpeIn(c.run, split, bars.length)));
  let bi = 0, bj = 0;
  isGrid.forEach((row, i) => row.forEach((v, j) => { if (Number.isFinite(v) && (!Number.isFinite(isGrid[bi][bj]) || v > isGrid[bi][bj])) { bi = i; bj = j; } }));
  const [sel, setSel] = useState<[number, number] | null>(null);
  useEffect(() => setSel(null), [regime, template]);
  const [si, sj] = sel ?? [bi, bj];
  const d = TEMPLATES[template];
  const here = isGrid[si][sj], nb = neighbourMean(isGrid, si, sj);
  const spike = Number.isFinite(here) && Number.isFinite(nb) && here - nb > 0.4;
  const CW = 46, CH = 28, X0 = 52, Y0 = 8;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Simulated market" value={regime} options={REGIMES} onChange={setRegime} />
        <Choice label="Rule template" value={template} options={TEMPLATE_OPTS} onChange={setTemplate} />
      </div>
      <svg viewBox={`0 0 ${X0 + CW * d.p2.grid.length + 4} ${Y0 + CH * d.p1.grid.length + 34}`} className="h-auto w-full max-w-[420px]" role="img" aria-label={`Heatmap of in-sample Sharpe ratios for ${d.p1.grid.length * d.p2.grid.length} settings. Best cell: ${d.p1.label} ${d.p1.grid[bi]}, ${d.p2.label} ${d.p2.grid[bj]}.`}>
        {cells.map((row, i) => row.map((c, j) => {
          const v = isGrid[i][j], on = i === si && j === sj, best = i === bi && j === bj;
          return (
            <g key={`${i}-${j}`} onClick={() => c.valid && setSel([i, j])} className={c.valid ? "cursor-pointer" : undefined}>
              <rect x={X0 + j * CW} y={Y0 + i * CH} width={CW - 2} height={CH - 2} rx={3} className={cn(heatCls(v), on ? "stroke-fg" : best ? "stroke-accent" : "stroke-transparent")} strokeWidth={on || best ? 2 : 0} />
              <text x={X0 + j * CW + CW / 2 - 1} y={Y0 + i * CH + CH / 2 + 3} textAnchor="middle" fontSize={10} className="fill-fg tabular">{c.valid ? num(v, 1) : "·"}</text>
            </g>
          );
        }))}
        {d.p1.grid.map((v, i) => <text key={v} x={X0 - 6} y={Y0 + i * CH + CH / 2 + 3} textAnchor="end" fontSize={10} className="fill-fg-muted">{v}</text>)}
        {d.p2.grid.map((v, j) => <text key={v} x={X0 + j * CW + CW / 2} y={Y0 + CH * d.p1.grid.length + 12} textAnchor="middle" fontSize={10} className="fill-fg-muted">{v}</text>)}
        <text x={X0} y={Y0 + CH * d.p1.grid.length + 28} fontSize={10} className="fill-fg-subtle">{`rows: ${d.p1.label.toLowerCase()} · columns: ${d.p2.label.toLowerCase()}`}</text>
      </svg>
      <p className="t-small">Tap a cell to inspect it. The outlined cell is the best in-sample setting. Dots mark impossible pairs.</p>
      <Readouts cols={2}>
        <Readout label="Selected cell, in-sample Sharpe" value={s2(here)} />
        <Readout label="Average of its neighbours" value={s2(nb)} tone={spike ? "warn" : undefined} />
        <Readout label="Selected cell, out-of-sample Sharpe" value={s2(oosGrid[si][sj])} />
        <Readout label="Settings tried" value={String(cells.flat().filter((c) => c.valid).length)} />
      </Readouts>
      <Result tone={spike ? "warn" : "info"}>
        {spike
          ? "This cell stands well above its neighbours: a spike. Small changes in the setting lose most of the result, a sign of fitting noise."
          : "This cell sits on a plateau: nearby settings give similar results. That is more reassuring, though it can still be a plateau of luck."}{" "}
        In-sample is years 2–3; out-of-sample is years 4–5.
      </Result>
    </WidgetFrame>
  );
}

// ── Walk-forward ────────────────────────────────────────────────────────────

export function WalkForwardLab({ title, caption }: P) {
  const [regime, setRegime] = useState<Regime>("switching");
  const [template, setTemplate] = useState<Template>("breakout");
  const [train, setTrain] = useState(504);
  const bars = useMemo(() => makeSeries(regime, 1), [regime]);
  const cells = useMemo(() => sweep(bars, template, BASE), [bars, template]);
  const wf = useMemo(() => walkForward(cells, bars.length, train, 126, 0), [cells, bars.length, train]);
  const d = TEMPLATES[template];
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Simulated market" value={regime} options={REGIMES} onChange={setRegime} />
        <Choice label="Rule template" value={template} options={TEMPLATE_OPTS} onChange={setTemplate} />
        <Choice label="Training window" value={String(train)} options={[{ id: "252", label: "1 year" }, { id: "504", label: "2 years" }, { id: "756", label: "3 years" }]} onChange={(v) => setTrain(Number(v))} />
      </div>
      <p className="t-small">Each step picks the best of {cells.flat().filter((c) => c.valid).length} settings on the training window, then trades only that setting for the next 6 months. The test months are stitched together below.</p>
      <LinePlot label="Stitched out-of-sample equity from walk-forward testing" series={[{ values: wf.oosEquity.map((e) => (e - 1) * 100), tone: "accent", label: "walk-forward" }]} lines={[{ y: 0, label: "0%", tone: "muted", dashed: true }]} yFormat={(v) => `${num(v, 0)}%`} xLabel="out-of-sample bar" />
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[320px] text-[12px] tabular">
          <thead><tr className="text-left text-fg-muted"><th className="py-1 font-normal">Test window</th><th className="py-1 font-normal">Chosen</th><th className="py-1 text-right font-normal">Train Sharpe</th><th className="py-1 text-right font-normal">Test Sharpe</th></tr></thead>
          <tbody>{wf.windows.map((w) => <tr key={w.trainTo} className="border-t border-line"><td className="py-0.5">{`bars ${w.trainTo + 1}–${w.testTo}`}</td><td className="py-0.5">{`${w.p1} / ${w.p2}`}</td><td className="py-0.5 text-right">{s2(w.trainSharpe)}</td><td className="py-0.5 text-right">{s2(w.testSharpe)}</td></tr>)}</tbody>
        </table>
      </div>
      <Readouts cols={2}>
        <Readout label="Average training Sharpe of the chosen settings" value={s2(wf.avgTrainSharpe)} />
        <Readout label="Stitched out-of-sample Sharpe" value={s2(wf.oosSharpe)} tone={wf.oosSharpe < wf.avgTrainSharpe - 0.5 ? "warn" : undefined} />
      </Readouts>
      <Result>The training Sharpe is what the search found; the stitched test Sharpe is closer to what the process would have earned. Watch how often the chosen setting ({d.p1.label.toLowerCase()} / {d.p2.label.toLowerCase()}) changes.</Result>
    </WidgetFrame>
  );
}

// ── Monte Carlo and bootstrap ───────────────────────────────────────────────

export function MonteCarloLab({ title, caption }: P) {
  const [regime, setRegime] = useState<Regime>("trending");
  const [template, setTemplate] = useState<Template>("breakout");
  const bars = useMemo(() => makeSeries(regime, 1), [regime]);
  const run2 = useMemo(() => runBacktest(bars, { ...BASE, template, params: template === "breakout" ? { p1: 20, p2: 10 } : TEMPLATES[template].defaults }), [bars, template]);
  const mc = useMemo(() => monteCarlo(run2.trades, 9), [run2]);
  const bins = 14;
  const lo = mc.dds.length ? mc.dds[0] : -0.1, hi = mc.dds.length ? mc.dds[mc.dds.length - 1] : 0;
  const width = Math.max(1e-6, hi - lo) / bins;
  const hist = Array.from({ length: bins }, (_, k) => mc.dds.filter((v) => v >= lo + k * width && (k === bins - 1 || v < lo + (k + 1) * width)).length);
  const maxH = Math.max(1, ...hist);
  const ax = (v: number) => 20 + ((v - lo) / Math.max(1e-6, hi - lo)) * 320;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Simulated market" value={regime} options={REGIMES} onChange={setRegime} />
        <Choice label="Rule template" value={template} options={TEMPLATE_OPTS} onChange={setTemplate} />
      </div>
      {run2.trades.length < 5 ? (
        <Result tone="warn">Only {run2.trades.length} trades on this path: too few to resample in any useful way. That itself is the lesson: a handful of trades cannot support a confident conclusion.</Result>
      ) : (
        <>
          <svg viewBox="0 0 360 140" className="h-auto w-full" role="img" aria-label="Histogram of maximum drawdowns from 1,000 reshuffles of the trade order, with the backtest's own drawdown marked.">
            {hist.map((h, k) => <rect key={k} x={20 + (k * 320) / bins} y={110 - (h / maxH) * 95} width={320 / bins - 2} height={(h / maxH) * 95} className="fill-accent/60" />)}
            <line x1={ax(mc.actualDD)} x2={ax(mc.actualDD)} y1={10} y2={112} className="stroke-warn" strokeWidth={2} />
            <text x={Math.min(330, Math.max(30, ax(mc.actualDD)))} y={9} textAnchor="middle" fontSize={9} className="fill-warn">backtest order</text>
            <text x={20} y={128} fontSize={9} className="fill-fg-subtle">{pct(lo, 0)}</text>
            <text x={340} y={128} textAnchor="end" fontSize={9} className="fill-fg-subtle">{pct(hi, 0)}</text>
            <text x={180} y={138} textAnchor="middle" fontSize={9} className="fill-fg-subtle">maximum drawdown in each reshuffle</text>
          </svg>
          <Readouts cols={2}>
            <Readout label="Drawdown in the backtest's order" value={pct(mc.actualDD)} />
            <Readout label="Worse 5% of reshuffles" value={pct(mc.ddP5)} sub={`median ${pct(mc.ddP50)}`} tone="warn" />
            <Readout label={`Average per trade (${run2.trades.length} trades)`} value={rR(mc.meanR)} />
            <Readout label="Bootstrap 90% interval" value={`${rR(mc.rCI[0])} to ${rR(mc.rCI[1])}`} sub={`${pct(mc.shareMeanRBelowZero, 0)} of resamples at or below zero`} />
          </Readouts>
          <Result>The same trades in a different order give a different drawdown, so plan for the bad end of the range, not the one path you saw. The bootstrap interval shows how uncertain the average trade is with this many trades. Both assume trades are independent, which real trades may not be.</Result>
        </>
      )}
    </WidgetFrame>
  );
}

// ── Multiple testing ────────────────────────────────────────────────────────

export function SnoopingLab({ title, caption }: P) {
  const [sr, setSr] = useState(1);
  const [years, setYears] = useState(5);
  const [trials, setTrials] = useState(50);
  const [skew, setSkew] = useState(0);
  const [kurt, setKurt] = useState(3);
  const T = Math.round(years * BARS_PER_YEAR);
  const d = deflatedSharpe(sr, trials, T, skew, kurt);
  const h = haircutSharpe(sr, years, trials);
  const ns = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Best backtest's Sharpe (annual)" value={sr} min={0} max={3} step={0.05} onChange={setSr} format={(v) => num(v, 2)} />
        <Slider label="Years of daily data" value={years} min={1} max={20} step={1} onChange={setYears} />
        <Slider label="Variants tried" value={trials} min={1} max={1000} step={1} onChange={setTrials} />
        <Slider label="Skew of daily returns" value={skew} min={-2} max={1} step={0.1} onChange={setSkew} format={(v) => num(v, 1)} />
        <Slider label="Kurtosis of daily returns (3 = normal)" value={kurt} min={3} max={15} step={0.5} onChange={setKurt} format={(v) => num(v, 1)} />
      </div>
      <LinePlot label="Expected best Sharpe from noise alone as the number of variants grows" series={[{ values: ns.map((k) => (expectedMaxZ(k) / Math.sqrt(T)) * Math.sqrt(BARS_PER_YEAR)), tone: "warn", label: "best from noise" }]} xValues={ns.map((k) => Math.log10(k))} xFormat={(v) => num(10 ** v, 0)} xLabel="variants tried (log scale)" yFormat={(v) => num(v, 1)} lines={[{ y: sr, label: "your Sharpe", tone: "accent", dashed: true }]} />
      <Readouts cols={2}>
        <Readout label="Best Sharpe expected from noise" value={f2(d.sr0Annual)} sub={`${trials} variants, ${years} years`} />
        <Readout label="Deflated Sharpe ratio" value={pct(d.dsr, 0)} sub="chance the true Sharpe is above zero" tone={d.dsr < 0.95 ? "warn" : "up"} />
        <Readout label="Bonferroni haircut Sharpe" value={f2(h.adjusted)} sub={Number.isFinite(h.haircut) ? `${pct(Math.min(1, Math.max(0, h.haircut)), 0)} haircut` : "–"} />
        <Readout label="Unadjusted t-statistic" value={f2(h.tStat)} sub={`p = ${num(h.p, 3)}; adjusted p = ${num(h.pAdj, 3)}`} />
      </Readouts>
      <Result>The deflated Sharpe follows Bailey and López de Prado (2014), simplified: it treats the variants as independent and with no edge. The haircut is a plain Bonferroni version of the idea in Harvey and Liu. Correlated variants count as fewer independent tries, so treat both as rough guides.</Result>
    </WidgetFrame>
  );
}

// ── Regime dependence ───────────────────────────────────────────────────────

export function RegimeLab({ title, caption }: P) {
  const { template, setTemplate, params, setParams } = useStrategySettings("ma");
  const seeds = [1, 2, 3, 4, 5];
  const table = useMemo(() => REGIMES.map((r) => {
    const sh = seeds.map((s) => metrics(runBacktest(makeSeries(r.id, s), { ...BASE, template, params }), warmup(template, params)).sharpe);
    const m = sh.reduce((a, b) => a + b, 0) / sh.length;
    return { id: r.id, label: r.label, sh, mean: m, min: Math.min(...sh), max: Math.max(...sh) };
  }), [template, params]); // eslint-disable-line react-hooks/exhaustive-deps
  const best = table.reduce((a, b) => (b.mean > a.mean ? b : a)), worst = table.reduce((a, b) => (b.mean < a.mean ? b : a));
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Rule template" value={template} options={TEMPLATE_OPTS} onChange={setTemplate} />
      <div className="grid gap-3 sm:grid-cols-2"><ParamSliders template={template} params={params} setParams={setParams} /></div>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[340px] text-[12px] tabular">
          <thead><tr className="text-left text-fg-muted"><th className="py-1 font-normal">Market</th>{seeds.map((s) => <th key={s} className="py-1 text-right font-normal">{`Path ${s}`}</th>)}<th className="py-1 text-right font-normal">Average</th></tr></thead>
          <tbody>{table.map((t) => <tr key={t.id} className="border-t border-line"><td className="py-1">{t.label}</td>{t.sh.map((v, k) => <td key={k} className={cn("py-1 text-right", v > 0 ? "text-up" : "text-down")}>{s2(v)}</td>)}<td className="py-1 text-right font-medium">{s2(t.mean)}</td></tr>)}</tbody>
        </table>
      </div>
      <Result>Sharpe ratios of the same rule on 20 simulated five-year paths. Best on average: {best.label} ({s2(best.mean)}); worst: {worst.label} ({s2(worst.mean)}). A backtest run in one kind of market says little about another, and even paths of the same kind differ.</Result>
    </WidgetFrame>
  );
}

// ── Backtest versus forward ─────────────────────────────────────────────────

export function ForwardLab({ title, caption }: P) {
  const [regime, setRegime] = useState<Regime>("random");
  const [template, setTemplate] = useState<Template>("ma");
  const pts = useMemo(() => forwardGap(regime, template, 12, BASE), [regime, template]);
  const avg = (k: "bestIs" | "bestFwd" | "fixedIs" | "fixedFwd") => pts.reduce((s, p) => s + p[k], 0) / pts.length;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Simulated market" value={regime} options={REGIMES} onChange={setRegime} />
        <Choice label="Rule template" value={template} options={TEMPLATE_OPTS} onChange={setTemplate} />
      </div>
      <LinePlot
        label="For 12 simulated paths: the searched best setting's backtest Sharpe and its Sharpe in the next two years"
        series={[{ values: pts.map((p) => p.bestIs), tone: "warn", label: "best setting, backtest" }, { values: pts.map((p) => p.bestFwd), tone: "accent", label: "same setting, next 2 years" }]}
        xValues={pts.map((p) => p.seed)}
        lines={[{ y: 0, label: "0", tone: "muted", dashed: true }]}
        xLabel="simulated path"
        yFormat={(v) => num(v, 1)}
      />
      <Readouts cols={2}>
        <Readout label="Searched best: backtest" value={s2(avg("bestIs"))} sub="average over 12 paths" />
        <Readout label="Searched best: next 2 years" value={s2(avg("bestFwd"))} tone={avg("bestFwd") < avg("bestIs") - 0.3 ? "warn" : undefined} />
        <Readout label="Fixed in advance: backtest" value={s2(avg("fixedIs"))} />
        <Readout label="Fixed in advance: next 2 years" value={s2(avg("fixedFwd"))} />
      </Readouts>
      <Result>On each path the best of the grid was picked on years 2–3, then traded on years 4–5. The drop from the first number to the second is the selection effect a forward test reveals. The fixed setting was chosen without looking, so it has no search to undo.</Result>
    </WidgetFrame>
  );
}

// ── Validity checklist (saved in this browser only) ─────────────────────────

const CHECK_KEY = "trader-os:bt-checklist:v1";
export const BT_CHECKS: { id: string; text: string; critical?: boolean }[] = [
  { id: "rules", text: "Every rule is exact and was written before testing.", critical: true },
  { id: "fills", text: "Orders fill at a price the rule could have known (next bar's open or later).", critical: true },
  { id: "survivors", text: "The data includes delisted or dead instruments.", critical: true },
  { id: "adjust", text: "Prices are adjusted for splits, dividends and futures rolls, and I know how.", critical: false },
  { id: "costs", text: "Commission, spread and slippage are charged on every entry and exit.", critical: true },
  { id: "oos", text: "An out-of-sample period was set aside and used once, after the rules were fixed.", critical: true },
  { id: "count", text: "I recorded how many variants I tried, and adjusted for them.", critical: true },
  { id: "plateau", text: "Nearby settings give similar results (a plateau, not a spike).", critical: false },
  { id: "trades", text: "There are enough trades for the average to mean something.", critical: false },
  { id: "regimes", text: "Results were checked in more than one kind of market.", critical: false },
  { id: "mc", text: "I looked at the range of drawdowns, not just the one path.", critical: false },
  { id: "bench", text: "Results were compared with buy and hold over the same period.", critical: false },
  { id: "forward", text: "A paper or small live forward test is planned before full size.", critical: false },
];

export function ChecklistLab({ title, caption }: P) {
  const [done, setDone] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(true);
  useEffect(() => { setDone(loadLocal(CHECK_KEY, {}, isStringRecord)); }, []);
  const toggle = (id: string) => {
    const next = { ...done };
    if (next[id]) delete next[id]; else next[id] = "1";
    setDone(next);
    setSaved(saveLocal(CHECK_KEY, next));
  };
  const count = BT_CHECKS.filter((c) => done[c.id]).length;
  const missingCritical = BT_CHECKS.filter((c) => c.critical && !done[c.id]);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <ul className="space-y-1.5">
        {BT_CHECKS.map((c) => (
          <li key={c.id}>
            <label className="flex cursor-pointer items-start gap-2 text-[13px]">
              <input type="checkbox" className="mt-0.5 size-4 accent-accent" checked={!!done[c.id]} onChange={() => toggle(c.id)} />
              <span>{c.text}{c.critical && <span className="ml-1.5 rounded border border-warn/40 px-1 text-[10px] text-warn">must</span>}</span>
            </label>
          </li>
        ))}
      </ul>
      <Readouts cols={2}>
        <Readout label="Checks passed" value={`${count} of ${BT_CHECKS.length}`} />
        <Readout label="Must-pass checks missing" value={String(missingCritical.length)} tone={missingCritical.length ? "down" : "up"} />
      </Readouts>
      <Result tone={missingCritical.length ? "bad" : "good"}>
        {missingCritical.length ? `Do not trust this backtest yet. Missing: ${missingCritical.map((c) => c.id).join(", ")}.` : "All must-pass checks are ticked. That makes the test fair; it does not make the strategy profitable."}
      </Result>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => { removeLocal(CHECK_KEY); setDone({}); }}>Clear</Button>
        <span className="text-xs text-fg-subtle">{saved ? "Saved only in this browser" : "Could not save in this browser; your ticks last until you leave the page"}</span>
      </div>
    </WidgetFrame>
  );
}
