"use client";

import { useMemo, useState } from "react";
import { atr, ema, simulateSeries, sma, type Bar } from "@/lib/academy/charts";
import { bollinger, crossovers, macd, obv, rsi, stochastic, vwap } from "@/lib/academy/indicators";
import type { Annotation, Overlay } from "@/components/academy/charts/candle-chart";
import { cn } from "@/lib/cn";
import { Choice, Readout, Readouts, Result, Slider, WidgetFrame, num, signed } from "./kit";
import { SyncedChart, type PaneSpec } from "./ta-chart";

/*
  The Technical Analysis indicator lab: a simulated chart on which the
  learner turns indicators on and off and changes their settings. Price
  and the indicator pane share one view (SyncedChart), so dragging or
  zooming moves both together. Indicators are computed on the whole series,
  and each value uses only bars up to its own, as it would live.
*/

type FrameProps = { title: string; caption: string };

/** A labelled checkbox styled like the kit's choices. */
export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={cn("inline-flex min-h-8 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-[13px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent", checked ? "border-accent bg-accent-soft text-fg" : "border-line-strong bg-raised text-fg-muted hover:text-fg")}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-3.5 accent-accent" />
      {label}
    </label>
  );
}

// ── Simulated markets ───────────────────────────────────────────────────────

export const TA_MARKETS = {
  trend: { label: "Trending", bars: simulateSeries({ seed: 7101, bars: 320, vol: 0.011, trend: 0.003, switchChance: 0.015, initial: "up", volume: 40_000, start: 50 }).bars },
  range: { label: "Ranging", bars: simulateSeries({ seed: 7102, bars: 320, vol: 0.011, switchChance: 0, initial: "range", volume: 40_000, start: 50 }).bars },
  walk: { label: "Random walk", bars: simulateSeries({ seed: 7103, bars: 320, vol: 0.011, regimes: false, volume: 40_000, start: 50 }).bars },
} as const;
export type MarketId = keyof typeof TA_MARKETS;
const MARKET_OPTIONS = (Object.keys(TA_MARKETS) as MarketId[]).map((id) => ({ id, label: TA_MARKETS[id].label }));

// ── The lab ─────────────────────────────────────────────────────────────────

type Pane = "none" | "rsi" | "macd" | "stoch" | "atr" | "obv";
export type LabPreset = "ma" | "rsi" | "macd" | "stoch" | "bands" | "volume";

const PRESETS: Record<LabPreset, { ma: boolean; bands: boolean; vwap: boolean; pane: Pane; market: MarketId }> = {
  ma: { ma: true, bands: false, vwap: false, pane: "none", market: "trend" },
  rsi: { ma: false, bands: false, vwap: false, pane: "rsi", market: "range" },
  macd: { ma: false, bands: false, vwap: false, pane: "macd", market: "trend" },
  stoch: { ma: false, bands: false, vwap: false, pane: "stoch", market: "range" },
  bands: { ma: false, bands: true, vwap: false, pane: "atr", market: "walk" },
  volume: { ma: false, bands: false, vwap: true, pane: "obv", market: "trend" },
};

const PANE_OPTIONS: { id: Pane; label: string }[] = [
  { id: "none", label: "None" }, { id: "rsi", label: "RSI" }, { id: "macd", label: "MACD" }, { id: "stoch", label: "Stochastic" }, { id: "atr", label: "ATR" }, { id: "obv", label: "OBV" },
];

const NOT_TELL: Record<Pane | "ma" | "bands" | "vwap", string> = {
  ma: "Moving averages measure where the average price of the last n bars is. They do not tell you where price goes next, and every crossover arrives after the move has started.",
  bands: "Bollinger Bands measure how spread out recent closes are around their average. A touch of a band is not a signal by itself: in a trend, price can ride a band for a long time.",
  vwap: "VWAP is the average price paid, weighted by volume, since the session began. It describes the session so far; it is not a level the market must return to.",
  none: "No oscillator is shown. Choose one below the chart to see it in its own pane.",
  rsi: "RSI measures the balance of recent up-moves and down-moves on a 0–100 scale. It does not tell you that a move must reverse: 'overbought' can stay overbought in a strong trend.",
  macd: "MACD measures the gap between a fast and a slow average, so it shows momentum and its change. It lags price, and its scale depends on the price level, so values are not comparable across markets.",
  stoch: "The stochastic measures where the close sits in the recent high–low range. It does not measure trend strength, and it swings to its extremes very often.",
  atr: "ATR measures how far price typically travels in a bar, including gaps. It says nothing about direction.",
  obv: "OBV adds volume on up closes and subtracts it on down closes. Its level is arbitrary; only its direction relative to price is read, and that reading is subjective.",
};

export function IndicatorLab({ title, caption, preset = "ma" }: FrameProps & { preset?: LabPreset }) {
  const p = PRESETS[preset];
  const [market, setMarket] = useState<MarketId>(p.market);
  const [maOn, setMaOn] = useState(p.ma);
  const [maType, setMaType] = useState<"sma" | "ema">("sma");
  const [fastN, setFastN] = useState(20);
  const [slowN, setSlowN] = useState(50);
  const [bandsOn, setBandsOn] = useState(p.bands);
  const [bbN, setBbN] = useState(20);
  const [bbK, setBbK] = useState(2);
  const [vwapOn, setVwapOn] = useState(p.vwap);
  const [session, setSession] = useState<"40" | "80" | "all">("40");
  const [pane, setPane] = useState<Pane>(p.pane);
  const [rsiN, setRsiN] = useState(14);
  const [rsiHi, setRsiHi] = useState(70);
  const [mFast, setMFast] = useState(12);
  const [mSlow, setMSlow] = useState(26);
  const [mSig, setMSig] = useState(9);
  const [stN, setStN] = useState(14);
  const [stSmooth, setStSmooth] = useState(3);
  const [atrN, setAtrN] = useState(14);

  const bars: readonly Bar[] = TA_MARKETS[market].bars;
  const closes = useMemo(() => bars.map((b) => b.c), [bars]);
  const last = bars.length - 1;

  const ma = useMemo(() => {
    const f = maType === "sma" ? sma(closes, fastN) : ema(closes, fastN);
    const s = maType === "sma" ? sma(closes, slowN) : ema(closes, slowN);
    return { f, s, x: crossovers(f, s) };
  }, [closes, maType, fastN, slowN]);
  const bb = useMemo(() => bollinger(closes, bbN, bbK), [closes, bbN, bbK]);
  const vw = useMemo(() => vwap(bars, session === "all" ? Infinity : Number(session)), [bars, session]);
  const r = useMemo(() => rsi(closes, rsiN), [closes, rsiN]);
  const m = useMemo(() => macd(closes, mFast, Math.max(mSlow, mFast + 1), mSig), [closes, mFast, mSlow, mSig]);
  const st = useMemo(() => stochastic(bars, stN, stSmooth, 3), [bars, stN, stSmooth]);
  const at = useMemo(() => atr(bars, atrN), [bars, atrN]);
  const ob = useMemo(() => obv(bars), [bars]);

  const overlays: Overlay[] = [];
  const annotations: Annotation[] = [];
  if (maOn) {
    overlays.push({ values: ma.f, label: `${maType.toUpperCase()} ${fastN}`, tone: "accent" }, { values: ma.s, label: `${maType.toUpperCase()} ${slowN}`, tone: "warn" });
    for (const c of ma.x) annotations.push({ kind: "marker", index: c.index, price: closes[c.index], label: c.dir === "up" ? "▲" : "▼", tone: c.dir === "up" ? "up" : "down", pos: c.dir === "up" ? "below" : "above" });
  }
  if (bandsOn) overlays.push({ values: bb.upper, label: "Upper band", tone: "info" }, { values: bb.mid, label: "Middle band", tone: "muted" }, { values: bb.lower, label: "Lower band", tone: "info" });
  if (vwapOn) overlays.push({ values: vw, label: "VWAP", tone: "accent" });

  const crosses = maOn ? ma.x.length : 0;
  const rsiAbove = r.filter((v) => v !== null && v >= rsiHi).length;
  const rsiBelow = r.filter((v) => v !== null && v <= 100 - rsiHi).length;
  const outside = bandsOn ? bars.filter((b, i) => { const u = bb.upper[i], l = bb.lower[i]; return u !== null && l !== null && (b.c > u || b.c < l); }).length : 0;
  const withBands = bb.upper.filter((x) => x !== null).length;

  const panes: PaneSpec[] =
    pane === "rsi" ? [{ title: `RSI ${rsiN}`, lines: [{ values: r, label: `RSI ${rsiN}`, tone: "accent" }], levels: [100 - rsiHi, 50, rsiHi], min: 0, max: 100 }]
    : pane === "macd" ? [{ title: `MACD ${mFast}, ${mSlow}, ${mSig}`, lines: [{ values: m.macd, label: "MACD", tone: "accent" }, { values: m.signal, label: "Signal", tone: "warn" }], hist: m.hist, levels: [0], decimals: 2 }]
    : pane === "stoch" ? [{ title: `Stochastic ${stN}`, lines: [{ values: st.k, label: "%K", tone: "accent" }, { values: st.d, label: "%D", tone: "warn" }], levels: [20, 50, 80], min: 0, max: 100 }]
    : pane === "atr" ? [{ title: `ATR ${atrN}`, lines: [{ values: at, label: `ATR ${atrN}`, tone: "accent" }], decimals: 2 }]
    : pane === "obv" ? [{ title: "OBV", lines: [{ values: ob, label: "OBV", tone: "accent" }], decimals: 0 }]
    : [];

  const v = (xs: readonly (number | null)[], dp = 2) => num(xs[last], dp);
  const lastClose = closes[last];
  const notes: string[] = [];
  if (maOn) notes.push(NOT_TELL.ma);
  if (bandsOn) notes.push(NOT_TELL.bands);
  if (vwapOn) notes.push(NOT_TELL.vwap);
  notes.push(NOT_TELL[pane]);

  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div data-lab className="space-y-3">
        <Choice label="Simulated market" value={market} onChange={setMarket} options={MARKET_OPTIONS} />
        <fieldset className="min-w-0">
          <legend className="mb-1.5 text-xs text-fg-muted">On the price chart</legend>
          <div className="flex flex-wrap gap-1.5">
            <Toggle label="Moving averages" checked={maOn} onChange={setMaOn} />
            <Toggle label="Bollinger Bands" checked={bandsOn} onChange={setBandsOn} />
            <Toggle label="VWAP" checked={vwapOn} onChange={setVwapOn} />
          </div>
        </fieldset>
        <SyncedChart bars={bars} label={`Simulated ${TA_MARKETS[market].label.toLowerCase()} market with the indicators you chose`} height={190} overlays={overlays} annotations={annotations} panes={panes} initialWindow={140} barLabel={(i) => `${i + 1}`} />
        <Choice label="Indicator pane" value={pane} onChange={setPane} options={PANE_OPTIONS} />
        <details className="rounded-md border border-line bg-panel px-3 py-2" open>
          <summary className="cursor-pointer text-[13px] text-fg">Settings</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {maOn && <>
              <Choice label="Average type" value={maType} onChange={setMaType} options={[{ id: "sma", label: "Simple" }, { id: "ema", label: "Exponential" }]} />
              <Slider label="Fast average" value={fastN} min={3} max={60} step={1} onChange={(n) => { setFastN(n); if (n >= slowN) setSlowN(Math.min(200, n + 5)); }} format={(n) => `${n} bars`} />
              <Slider label="Slow average" value={slowN} min={10} max={200} step={5} onChange={(n) => { setSlowN(n); if (n <= fastN) setFastN(Math.max(3, n - 5)); }} format={(n) => `${n} bars`} />
            </>}
            {bandsOn && <>
              <Slider label="Bands length" value={bbN} min={5} max={60} step={1} onChange={setBbN} format={(n) => `${n} bars`} />
              <Slider label="Bands width" value={bbK} min={1} max={3} step={0.5} onChange={setBbK} format={(n) => `${num(n, 1)} sd`} />
            </>}
            {vwapOn && <Choice label="VWAP resets every" value={session} onChange={setSession} options={[{ id: "40", label: "40 bars" }, { id: "80", label: "80 bars" }, { id: "all", label: "Never" }]} />}
            {pane === "rsi" && <>
              <Slider label="RSI length" value={rsiN} min={2} max={30} step={1} onChange={setRsiN} format={(n) => `${n} bars`} />
              <Slider label="Upper line (lower is 100 minus it)" value={rsiHi} min={55} max={90} step={5} onChange={setRsiHi} format={(n) => `${n} / ${100 - n}`} />
            </>}
            {pane === "macd" && <>
              <Slider label="MACD fast EMA" value={mFast} min={3} max={20} step={1} onChange={(n) => { setMFast(n); if (n >= mSlow) setMSlow(n + 1); }} format={(n) => `${n}`} />
              <Slider label="MACD slow EMA" value={mSlow} min={10} max={50} step={1} onChange={(n) => { setMSlow(n); if (n <= mFast) setMFast(Math.max(3, n - 1)); }} format={(n) => `${n}`} />
              <Slider label="Signal EMA" value={mSig} min={2} max={20} step={1} onChange={setMSig} format={(n) => `${n}`} />
            </>}
            {pane === "stoch" && <>
              <Slider label="Stochastic length" value={stN} min={5} max={30} step={1} onChange={setStN} format={(n) => `${n} bars`} />
              <Slider label="%K smoothing" value={stSmooth} min={1} max={5} step={1} onChange={setStSmooth} format={(n) => (n === 1 ? "1 (fast)" : `${n}`)} />
            </>}
            {pane === "atr" && <Slider label="ATR length" value={atrN} min={5} max={30} step={1} onChange={setAtrN} format={(n) => `${n} bars`} />}
            {!maOn && !bandsOn && !vwapOn && pane === "none" && <p className="text-xs text-fg-subtle">Turn on an indicator to see its settings.</p>}
          </div>
        </details>
        <Readouts cols={3}>
          <Readout label={`Close, last bar (${bars.length})`} value={num(lastClose, 2)} />
          {maOn && <Readout label={`${maType.toUpperCase()} ${fastN} / ${slowN}`} value={`${v(ma.f)} / ${v(ma.s)}`} sub={`${crosses} crossover${crosses === 1 ? "" : "s"} in ${bars.length} bars`} />}
          {bandsOn && <Readout label="Bands (lower / upper)" value={`${v(bb.lower)} / ${v(bb.upper)}`} sub={`${outside} of ${withBands} closes outside`} />}
          {vwapOn && <Readout label="VWAP" value={v(vw)} sub={`close ${signed(lastClose - vw[last], 2)} from it`} />}
          {pane === "rsi" && <Readout label={`RSI ${rsiN}`} value={v(r, 1)} sub={`${rsiAbove} bars ≥ ${rsiHi}, ${rsiBelow} ≤ ${100 - rsiHi}`} />}
          {pane === "macd" && <Readout label="MACD / signal / histogram" value={`${v(m.macd)} / ${v(m.signal)} / ${v(m.hist)}`} />}
          {pane === "stoch" && <Readout label="%K / %D" value={`${v(st.k, 1)} / ${v(st.d, 1)}`} />}
          {pane === "atr" && <Readout label={`ATR ${atrN}`} value={v(at)} sub={at[last] !== null ? `${num((at[last]! / lastClose) * 100, 2)}% of price` : undefined} />}
          {pane === "obv" && <Readout label="OBV" value={num(ob[last], 0)} sub={`last 20 bars ${signed(ob[last] - ob[last - 20], 0)}`} />}
        </Readouts>
        <Result>{notes.join(" ")}</Result>
      </div>
    </WidgetFrame>
  );
}

export const LabMa = (p: FrameProps) => <IndicatorLab {...p} preset="ma" />;
export const LabRsi = (p: FrameProps) => <IndicatorLab {...p} preset="rsi" />;
export const LabMacd = (p: FrameProps) => <IndicatorLab {...p} preset="macd" />;
export const LabStoch = (p: FrameProps) => <IndicatorLab {...p} preset="stoch" />;
export const LabBands = (p: FrameProps) => <IndicatorLab {...p} preset="bands" />;
export const LabVolume = (p: FrameProps) => <IndicatorLab {...p} preset="volume" />;
