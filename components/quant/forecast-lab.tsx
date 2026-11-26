"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Info, Minus, Shuffle } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { HISTORY_SYMBOLS, symbolMeta } from "@/lib/market/history-symbols";
import { METHODS, histVolAt, regressionAt, signalAt, smaAt, testBands, testDirection, volBands, type MethodId } from "@/lib/quant/forecast";
import { cn } from "@/lib/cn";
import { PriceChart } from "./price-chart";
import { useHistory } from "./use-history";

/*
  Forecast Lab: runs simple, well-known forecasting methods on real daily
  history and, for each one, shows how often it was right in the past against
  a naive baseline. It never gives a trade signal; the point is to see what
  forecasting can and cannot do.
*/

const HORIZONS = [5, 20, 60] as const;
const VIEW = 250;

const pct = (x: number, dp = 1) => (Number.isFinite(x) ? `${(x * 100).toFixed(dp)}%` : "–");

function Call({ s }: { s: -1 | 0 | 1 }) {
  if (s === 0) return <span className="inline-flex items-center gap-1 text-fg-muted"><Minus className="size-3.5" /> No call</span>;
  const Up = s > 0;
  const Icon = Up ? ArrowUpRight : ArrowDownRight;
  return <span className={cn("inline-flex items-center gap-1 font-medium", Up ? "text-up" : "text-down")}><Icon className="size-4" /> {Up ? "Up" : "Down"}</span>;
}

export function ForecastLab() {
  const [symbol, setSymbol] = useState<string>("SPY");
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>(20);
  const [mode, setMode] = useState<"latest" | "past">("latest");
  const [seed, setSeed] = useState(1);
  const meta = symbolMeta(symbol);
  const { data, error, loading } = useHistory(symbol);
  const bars = data?.bars ?? [];
  const closes = useMemo(() => bars.map((b) => b.c), [bars]);
  const ppy = meta.periodsPerYear;

  // "As of" index: the latest bar, or a random past day with enough history before and the horizon after.
  const asOf = useMemo(() => {
    if (closes.length < 400) return closes.length - 1;
    if (mode === "latest") return closes.length - 1;
    const lo = 260, hi = closes.length - 1 - horizon;
    const r = Math.abs(Math.sin(seed * 9301 + 49297)) % 1;
    return lo + Math.floor(r * (hi - lo));
  }, [closes.length, mode, seed, horizon]);

  const analysis = useMemo(() => {
    if (closes.length < 400) return null;
    const i = asOf;
    const hist = closes.slice(0, i + 1); // tests use only data up to the as-of day
    const vol20 = histVolAt(closes, i, 20, ppy);
    const vol60 = histVolAt(closes, i, 60, ppy);
    const bands = volBands(closes[i], vol60, horizon, ppy);
    const reg = regressionAt(closes, i, 60, horizon);
    const methods = METHODS.map((m) => ({ ...m, signal: signalAt(m.id, closes, i), test: testDirection(m.id as MethodId, hist, horizon, 5) }));
    const bandTest = testBands(hist, horizon, 60, ppy);
    return { i, vol20, vol60, bands, reg, methods, bandTest };
  }, [closes, asOf, horizon, ppy]);

  const view = useMemo(() => {
    if (!analysis) return null;
    const start = Math.max(0, analysis.i - VIEW + 1);
    const past = closes.slice(start, analysis.i + 1);
    const future = mode === "past" ? closes.slice(analysis.i + 1, analysis.i + 1 + horizon) : [];
    const sma50 = past.map((_, k) => smaAt(closes, 50, start + k));
    const sma200 = past.map((_, k) => smaAt(closes, 200, start + k));
    return { past, future, sma50, sma200 };
  }, [analysis, closes, mode, horizon]);

  const outcome = mode === "past" && analysis ? closes[analysis.i + horizon] : undefined;
  const dp = closes.length && closes[closes.length - 1] < 10 ? 4 : 2;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-warn/30 bg-warn-soft px-3 py-2.5 text-[13px] text-fg">
        <Info className="mt-0.5 size-4 shrink-0 text-warn" />
        <p>
          This is a teaching lab, not a signal service. Each method below is tested on years of real history so you can see how often it was right compared with simply guessing &quot;up&quot;. Past hit rates do not promise future ones.
        </p>
      </div>

      <Panel title="Set up a forecast" hint="Pick a market, how far ahead to look, and whether to forecast from today or from a hidden past date so you can check the result." source={data?.bars.length ? "computed" : undefined}>
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-xs text-fg-muted">
            Market
            <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="mt-1 block rounded-md border border-line-strong bg-raised px-2 py-1.5 text-[13px] text-fg">
              {HISTORY_SYMBOLS.map((s) => <option key={s.symbol} value={s.symbol}>{s.symbol} · {s.name}</option>)}
            </select>
          </label>
          <fieldset>
            <legend className="text-xs text-fg-muted">Look ahead</legend>
            <div className="mt-1 flex gap-1.5">
              {HORIZONS.map((h) => (
                <button key={h} type="button" onClick={() => setHorizon(h)} className={cn("rounded-md border px-2.5 py-1.5 text-[13px]", horizon === h ? "border-accent bg-accent-soft text-fg" : "border-line-strong bg-raised text-fg-muted")}>
                  {h} days
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-xs text-fg-muted">Forecast from</legend>
            <div className="mt-1 flex gap-1.5">
              <button type="button" onClick={() => setMode("latest")} className={cn("rounded-md border px-2.5 py-1.5 text-[13px]", mode === "latest" ? "border-accent bg-accent-soft text-fg" : "border-line-strong bg-raised text-fg-muted")}>Latest data</button>
              <button type="button" onClick={() => setMode("past")} className={cn("rounded-md border px-2.5 py-1.5 text-[13px]", mode === "past" ? "border-accent bg-accent-soft text-fg" : "border-line-strong bg-raised text-fg-muted")}>A random past date</button>
            </div>
          </fieldset>
          {mode === "past" && <Button onClick={() => setSeed((s) => s + 1)}><Shuffle className="size-3.5" /> Another date</Button>}
        </div>
      </Panel>

      {loading && <p className="text-sm text-fg-muted">Loading real price history…</p>}
      {error && <p className="text-sm text-warn">{error}</p>}

      {analysis && view && (
        <>
          <Panel
            title={`${meta.symbol} · ${meta.name}`}
            hint={`Real daily closes from ${data?.provider}. As of ${bars[analysis.i].t}${mode === "past" ? `; the highlighted line shows what happened over the next ${horizon} trading days` : ""}. The shaded cone is the ±1σ and ±2σ range from recent volatility; the dashed line is the 60-day trend line projected forward.`}
            source="computed"
          >
            <PriceChart
              past={view.past}
              future={view.future}
              totalSteps={view.past.length + horizon}
              overlays={[{ values: view.sma50, tone: "warn", label: "50-day average" }, { values: view.sma200, tone: "muted", label: "200-day average" }]}
              cone={{ from: view.past.length - 1, steps: horizon, lo1: analysis.bands.lo1, hi1: analysis.bands.hi1, lo2: analysis.bands.lo2, hi2: analysis.bands.hi2, mid: analysis.reg?.projected }}
              label={`${meta.name}: last ${view.past.length} daily closes with moving averages and a ${horizon}-day forecast cone`}
              decimals={dp}
              nowLabel={mode === "past" ? "forecast made here" : "today"}
            />
            {outcome !== undefined && (
              <p className="mt-2 text-[13px] text-fg-body">
                Actual close {horizon} days later: <span className="font-mono">{outcome.toFixed(dp)}</span> ({pct(outcome / closes[analysis.i] - 1)}).{" "}
                {outcome >= analysis.bands.lo1 && outcome <= analysis.bands.hi1 ? "Inside the ±1σ band." : outcome >= analysis.bands.lo2 && outcome <= analysis.bands.hi2 ? "Outside ±1σ but inside ±2σ." : "Outside even the ±2σ band: a large move."}
              </p>
            )}
          </Panel>

          <div className="grid items-start gap-4 lg:grid-cols-12">
            <Panel className="lg:col-span-7" title="Direction methods, tested on history" hint={`Each method's call for the next ${horizon} trading days, and how often it was right when tested every 5 days on data up to the as-of date.`} source="computed" bodyClassName="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
                    <tr className="border-b border-line">
                      <th className="px-4 py-2 font-medium">Method</th>
                      <th className="px-3 py-2 font-medium">Says</th>
                      <th className="px-3 py-2 font-medium">Right in the past</th>
                      <th className="px-3 py-2 font-medium">Always &quot;up&quot;</th>
                      <th className="px-3 py-2 font-medium">Edge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.methods.map((m) => {
                      const real = Number.isFinite(m.test.edge) && m.test.edge > m.test.margin;
                      return (
                        <tr key={m.id} className="border-b border-line/70 align-top">
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-fg">{m.name}</p>
                            <p className="mt-0.5 text-[12px] text-fg-muted">{m.rule}</p>
                            <p className="mt-0.5 font-mono text-[11px] text-fg-subtle">{m.math}</p>
                          </td>
                          <td className="px-3 py-2.5"><Call s={m.signal} /></td>
                          <td className="px-3 py-2.5 font-mono tabular">{pct(m.test.hitRate)}<span className="block text-[11px] text-fg-subtle">± {pct(m.test.margin)} · {m.test.windows} tests</span></td>
                          <td className="px-3 py-2.5 font-mono tabular">{pct(m.test.upRate)}</td>
                          <td className="px-3 py-2.5">
                            <span className={cn("whitespace-nowrap font-mono tabular", real ? "text-up" : "text-fg-muted")}>{Number.isFinite(m.test.edge) ? `${m.test.edge >= 0 ? "+" : ""}${(m.test.edge * 100).toFixed(1)} pts` : "–"}</span>
                            <span className="block text-[11px] text-fg-subtle">{real ? "beat the baseline" : "no clear edge"}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-line px-4 py-2.5 text-[12px] leading-relaxed text-fg-muted">
                &quot;Edge&quot; compares each method with the better of always guessing up or always guessing down. Markets that rose most of the time make &quot;always up&quot; a tough baseline. Tests overlap, so the true uncertainty is larger than the ± shown, and a method that looks good here may have been found by trying many.
              </p>
            </Panel>

            <div className="space-y-4 lg:col-span-5">
              <Panel title="How far it might move" hint={`Volatility-based ranges for the next ${horizon} trading days, assuming no trend.`} source="computed">
                <dl className="grid grid-cols-2 gap-3 text-[13px]">
                  <div><dt className="text-fg-muted">Volatility, last 20 days</dt><dd className="font-mono text-fg">{pct(analysis.vol20)} a year</dd></div>
                  <div><dt className="text-fg-muted">Volatility, last 60 days</dt><dd className="font-mono text-fg">{pct(analysis.vol60)} a year</dd></div>
                  <div><dt className="text-fg-muted">Likely range (±1σ, ~68%)</dt><dd className="font-mono text-fg">{analysis.bands.lo1.toFixed(dp)} – {analysis.bands.hi1.toFixed(dp)}</dd></div>
                  <div><dt className="text-fg-muted">Wide range (±2σ, ~95%)</dt><dd className="font-mono text-fg">{analysis.bands.lo2.toFixed(dp)} – {analysis.bands.hi2.toFixed(dp)}</dd></div>
                  <div className="col-span-2"><dt className="text-fg-muted">How often the ±1σ / ±2σ bands held in the past</dt><dd className="font-mono text-fg">{pct(analysis.bandTest.inside1)} / {pct(analysis.bandTest.inside2)} <span className="text-fg-subtle">(theory: 68% / 95%)</span></dd></div>
                </dl>
                <p className="mt-3 text-[12px] leading-relaxed text-fg-muted">
                  σ move = volatility × √(days ÷ {ppy}). The same maths sets option prices: an at-the-money option roughly prices a one-σ move. Real markets have more large moves than this model, so the ±2σ band is broken more often than 5% of the time.
                </p>
              </Panel>
              {analysis.reg && (
                <Panel title="60-day trend line" hint="A straight line through the logarithm of recent closes, extended forward." source="computed">
                  <dl className="grid grid-cols-2 gap-3 text-[13px]">
                    <div><dt className="text-fg-muted">Slope</dt><dd className="font-mono text-fg">{pct(Math.exp(analysis.reg.slopePerDay * ppy) - 1)} a year</dd></div>
                    <div><dt className="text-fg-muted">Projected in {horizon} days</dt><dd className="font-mono text-fg">{analysis.reg.projected.toFixed(dp)}</dd></div>
                  </dl>
                  <p className="mt-3 text-[12px] leading-relaxed text-fg-muted">Extending a recent trend assumes it continues. Trends end without warning; compare this line&apos;s hit rate in the table with the baseline before trusting it.</p>
                </Panel>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
