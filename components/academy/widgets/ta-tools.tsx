"use client";

import { useMemo, useState } from "react";
import { aggregate, atr, simulateSeries, swings, type Bar } from "@/lib/academy/charts";
import {
  FIB_RATIOS, alignedCorrelation, bollinger, fibCoverage, fibLevels, findPatterns, lineThrough, macd, median, nearFibShare, obv, overfitExperiment,
  rateOfChange, reachedMirror, reachedTarget, regressionChannel, retracementRatios, rsi, stochastic, timeframeStates, trendlineTest, type PatternHit,
} from "@/lib/academy/indicators";
import { CandleChart, useWidth, type Annotation } from "@/components/academy/charts/candle-chart";
import { Bar as Meter, Choice, Readout, Readouts, Result, Slider, WidgetFrame, num, signed } from "./kit";
import { LinePlot } from "./risk-plot";
import { Toggle } from "./ta-lab";
import { SyncedChart } from "./ta-chart";

/*
  Technical Analysis tools beyond the indicator lab: divergence, trendlines
  and channels, chart patterns, Fibonacci, multi-timeframe confluence with
  indicator redundancy, and overfitting. Every series is simulated by a
  seeded generator; several are driftless random walks on purpose, because
  there nothing can be predicted, so any "hit rate" there is what chance
  alone produces.
*/

type FrameProps = { title: string; caption: string };
const pct = (x: number | null | undefined, dp = 0) => (x === null || x === undefined || !Number.isFinite(x) ? "—" : `${num(x * 100, dp)}%`);

// ── L7. Divergence ──────────────────────────────────────────────────────────

const DIV = simulateSeries({ seed: 7201, bars: 600, vol: 0.011, trend: 0.0025, switchChance: 0.03, volume: 30_000, start: 40 }).bars;
const DIV_C = DIV.map((b) => b.c);

export function DivergenceTool({ title, caption }: FrameProps) {
  const [ind, setInd] = useState<"rsi" | "macd">("rsi");
  const [k, setK] = useState(3);
  const horizon = 10;
  const values = useMemo(() => (ind === "rsi" ? rsi(DIV_C, 14) : macd(DIV_C).macd), [ind]);
  const all = useMemo(() => {
    // Swing points need k bars after them; a divergence is only known then.
    const sw = swings(DIV, k);
    const out: { kind: "bearish" | "bullish"; a: number; b: number }[] = [];
    let lastH: (typeof sw)[number] | undefined, lastL: (typeof sw)[number] | undefined;
    for (const s of sw) {
      const p = s.kind === "high" ? lastH : lastL;
      if (s.kind === "high") lastH = s; else lastL = s;
      if (!p || s.index - p.index > 40) continue;
      const v0 = values[p.index], v1 = values[s.index];
      if (v0 == null || v1 == null) continue;
      if (s.kind === "high" && s.price > p.price && v1 < v0) out.push({ kind: "bearish", a: p.index, b: s.index });
      if (s.kind === "low" && s.price < p.price && v1 > v0) out.push({ kind: "bullish", a: p.index, b: s.index });
    }
    return out;
  }, [k, values]);
  const stats = useMemo(() => {
    const move = (i: number) => (i + horizon < DIV_C.length ? DIV_C[i + horizon] - DIV_C[i] : null);
    let bear = 0, bearOk = 0, bull = 0, bullOk = 0;
    for (const d of all) {
      const m = move(d.b + k);
      if (m === null) continue;
      if (d.kind === "bearish") { bear++; if (m < 0) bearOk++; } else { bull++; if (m > 0) bullOk++; }
    }
    let n = 0, down = 0;
    for (let i = 0; i + horizon < DIV_C.length; i++) { n++; if (DIV_C[i + horizon] < DIV_C[i]) down++; }
    return { bear, bearOk, bull, bullOk, baseDown: n ? down / n : 0 };
  }, [all, k]);

  const annotations: Annotation[] = all.flatMap((d): Annotation[] => {
    const hi = d.kind === "bearish";
    const pa = hi ? DIV[d.a].h : DIV[d.a].l, pb = hi ? DIV[d.b].h : DIV[d.b].l;
    return [
      { kind: "line", i0: d.a, p0: pa, i1: d.b, p1: pb, tone: hi ? "down" : "up" },
      { kind: "marker", index: d.b, price: pb, label: hi ? "Bear" : "Bull", tone: hi ? "down" : "up", pos: hi ? "above" : "below" },
    ];
  });
  const segs = all.flatMap((d) => (values[d.a] != null && values[d.b] != null ? [{ i0: d.a, v0: values[d.a]!, i1: d.b, v1: values[d.b]!, tone: d.kind === "bearish" ? ("down" as const) : ("up" as const) }] : []));
  const pane = ind === "rsi"
    ? { title: "RSI 14", lines: [{ values, label: "RSI", tone: "accent" as const }], levels: [30, 70], min: 0, max: 100, segs }
    : { title: "MACD line", lines: [{ values, label: "MACD", tone: "accent" as const }], levels: [0], decimals: 2, segs };
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Compare price with" value={ind} onChange={setInd} options={[{ id: "rsi", label: "RSI 14" }, { id: "macd", label: "MACD line" }]} />
      <SyncedChart bars={DIV} label="Simulated price with regular divergences marked between swing points, and the indicator below" height={180} annotations={annotations} panes={[pane]} initialWindow={150} barLabel={(i) => `${i + 1}`} />
      <Slider label="Swing strength (bars each side)" value={k} min={2} max={6} step={1} onChange={setK} format={(n) => `${n}`} hint="A swing is only confirmed this many bars later." />
      <Readouts cols={3}>
        <Readout label="Bearish divergences (whole series)" value={`${stats.bear}`} sub={`${pct(stats.bear ? stats.bearOk / stats.bear : null)} lower ${horizon} bars later`} tone="down" />
        <Readout label="Bullish divergences (whole series)" value={`${stats.bull}`} sub={`${pct(stats.bull ? stats.bullOk / stats.bull : null)} higher ${horizon} bars later`} tone="up" />
        <Readout label={`Any bar: lower ${horizon} bars later`} value={pct(stats.baseDown)} sub="the base rate to beat" />
      </Readouts>
      <Result>
        {`On this simulated series of ${DIV.length} bars, compare each "worked" share with the base rate (and with 100% minus it for bullish cases). Measured from the bar where the divergence was confirmed, not from the swing itself. A divergence says momentum was weaker at the second swing. It does not say when, or whether, price will turn: it can repeat several times while a trend carries on.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L8. Trendlines and channels ─────────────────────────────────────────────

const TL = simulateSeries({ seed: 7302, bars: 200, vol: 0.01, trend: 0.003, switchChance: 0.012, initial: "up", start: 40 }).bars;
const TL_C = TL.map((b) => b.c);

export function TrendlineTool({ title, caption }: FrameProps) {
  const [side, setSide] = useState<"support" | "resistance">("support");
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const [tolPct, setTolPct] = useState(0.5);
  const [channel, setChannel] = useState(false);
  const pts = useMemo(() => swings(TL, 3).filter((s) => s.kind === (side === "support" ? "low" : "high") && s.index < 150), [side]);
  const ia = Math.min(a, pts.length - 2), ib = Math.max(ia + 1, Math.min(b, pts.length - 1));
  const A = pts[ia], B = pts[ib];
  const line = A && B ? lineThrough(A.index, A.price, B.index, B.price) : null;
  const tol = (TL_C[TL_C.length - 1] * tolPct) / 100;
  const test = line && B ? trendlineTest(TL, line, side, B.index + 1, tol) : null;
  const ch = A ? regressionChannel(TL_C, A.index, TL.length, 2) : null;
  const last = TL.length - 1;
  const annotations: Annotation[] = [];
  if (line && A && B) {
    const stop = test?.breakAt ?? last;
    annotations.push({ kind: "line", i0: A.index, p0: A.price, i1: stop, p1: line.at(stop), label: side === "support" ? "support line" : "resistance line", tone: "accent" });
    annotations.push({ kind: "marker", index: A.index, price: A.price, label: "1", tone: "accent", pos: side === "support" ? "below" : "above" });
    annotations.push({ kind: "marker", index: B.index, price: B.price, label: "2", tone: "accent", pos: side === "support" ? "below" : "above" });
    for (const t of test?.touches ?? []) annotations.push({ kind: "marker", index: t, price: side === "support" ? TL[t].l : TL[t].h, label: "t", tone: "info", pos: side === "support" ? "below" : "above" });
    if (test?.breakAt != null) annotations.push({ kind: "vline", index: test.breakAt, label: "break", tone: "down" });
  }
  if (channel && ch && A) {
    for (const [L, tone] of [[ch.upper, "muted"], [ch.mid, "warn"], [ch.lower, "muted"]] as const) annotations.push({ kind: "line", i0: A.index, p0: L.at(A.index), i1: last, p1: L.at(last), tone });
  }
  const slopePct = line ? (line.slope / TL_C[last]) * 100 : null;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Line type" value={side} onChange={(v) => { setSide(v); setA(0); setB(1); }} options={[{ id: "support", label: "Through swing lows" }, { id: "resistance", label: "Through swing highs" }]} />
      <CandleChart bars={TL} label="Simulated price with a trendline through two swing points you choose" height={200} annotations={annotations} barLabel={(i) => `${i + 1}`} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="First anchor (swing number)" value={ia} min={0} max={Math.max(0, pts.length - 2)} step={1} onChange={(n) => { setA(n); if (b <= n) setB(n + 1); }} format={(n) => `${n + 1} of ${pts.length} · bar ${pts[n]?.index + 1}`} />
        <Slider label="Second anchor (swing number)" value={ib} min={1} max={Math.max(1, pts.length - 1)} step={1} onChange={(n) => { setB(n); if (a >= n) setA(n - 1); }} format={(n) => `${n + 1} of ${pts.length} · bar ${pts[n]?.index + 1}`} />
        <Slider label="Touch tolerance" value={tolPct} min={0.1} max={1.5} step={0.1} onChange={setTolPct} format={(n) => `±${num(n, 1)}% of price`} />
        <div className="flex items-end"><Toggle label="Regression channel (±2 sd)" checked={channel} onChange={setChannel} /></div>
      </div>
      <Readouts cols={3}>
        <Readout label="Line slope" value={slopePct === null ? "—" : `${signed(slopePct, 2)}% per bar`} />
        <Readout label="Touches after anchor 2" value={`${test?.touches.length ?? 0}`} />
        <Readout label="First close through it" value={test?.breakAt != null ? `bar ${test.breakAt + 1}` : "none yet"} tone={test?.breakAt != null ? "down" : undefined} />
        {channel && ch && <Readout label="Channel fit (r²)" value={num(ch.r2, 2)} sub={`width ±${num(2 * ch.sd, 2)}`} />}
      </Readouts>
      <Result>
        {`Move the anchors: the same chart gives a different line, slope and "break" for each pair of points you choose. A trendline records a choice, not a law. The touch count also depends on the tolerance you allow. The regression channel is less arbitrary, because it fits every close since anchor 1, but its edges are statistics of the past, not barriers.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L9. Chart patterns, honestly counted ────────────────────────────────────

const PATTERN_SERIES = {
  a: { label: "Random walk A", bars: simulateSeries({ seed: 7401, bars: 3000, regimes: false, vol: 0.011, start: 50 }).bars },
  b: { label: "Random walk B", bars: simulateSeries({ seed: 7402, bars: 3000, regimes: false, vol: 0.011, start: 50 }).bars },
  c: { label: "Trend regimes", bars: simulateSeries({ seed: 7403, bars: 3000, vol: 0.011, trend: 0.0025, switchChance: 0.02, start: 50 }).bars },
} as const;
type PatternSeriesId = keyof typeof PATTERN_SERIES;
const KIND_LABEL: Record<PatternHit["kind"], string> = {
  "double-top": "Double top", "double-bottom": "Double bottom", "head-and-shoulders": "Head and shoulders", "inverse-head-and-shoulders": "Inverse head and shoulders",
};
const KIND_SHORT: Record<PatternHit["kind"], string> = { "double-top": "DT", "double-bottom": "DB", "head-and-shoulders": "HS", "inverse-head-and-shoulders": "iHS" };

export function PatternCounter({ title, caption }: FrameProps) {
  const [series, setSeries] = useState<PatternSeriesId>("a");
  const [tolPct, setTolPct] = useState(1.5);
  const [horizon, setHorizon] = useState(20);
  const bars = PATTERN_SERIES[series].bars;
  const hits = useMemo(() => findPatterns(bars, 3, tolPct), [bars, tolPct]);
  const rows = useMemo(() => (Object.keys(KIND_LABEL) as PatternHit["kind"][]).map((kind) => {
    const hs = hits.filter((h) => h.kind === kind);
    let tested = 0, target = 0, mirror = 0;
    for (const h of hs) {
      const t = reachedTarget(bars, h, horizon), m = reachedMirror(bars, h, horizon);
      if (t === null) continue;
      tested++; if (t) target++; if (m) mirror++;
    }
    return { kind, found: hs.length, tested, target, mirror };
  }), [hits, bars, horizon]);
  const total = rows.reduce((a, r) => ({ tested: a.tested + r.tested, target: a.target + r.target, mirror: a.mirror + r.mirror }), { tested: 0, target: 0, mirror: 0 });
  const view = 160, from = bars.length - view;
  const shown = hits.filter((h) => h.points[0] >= from).slice(-4);
  const annotations: Annotation[] = shown.flatMap((h): Annotation[] => {
    const mid = h.points[Math.floor(h.points.length / 2)];
    const top = h.kind === "double-top" || h.kind === "head-and-shoulders";
    return [
      { kind: "line", i0: h.points[0] - from, p0: h.neckline, i1: Math.min(view - 1, (h.confirmedAt ?? h.points[h.points.length - 1]) - from), p1: h.neckline, tone: "warn" },
      { kind: "marker", index: mid - from, price: top ? bars[mid].h : bars[mid].l, label: KIND_SHORT[h.kind], tone: top ? "down" : "up", pos: top ? "above" : "below" },
    ];
  });
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Simulated series (3,000 bars)" value={series} onChange={setSeries} options={(Object.keys(PATTERN_SERIES) as PatternSeriesId[]).map((id) => ({ id, label: PATTERN_SERIES[id].label }))} />
      <CandleChart bars={bars.slice(from)} label="The last 160 bars of the simulated series, with mechanically found patterns and their necklines" height={180} annotations={annotations} barLabel={(i) => `${from + i + 1}`} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="How equal the peaks must be" value={tolPct} min={0.5} max={3} step={0.5} onChange={setTolPct} format={(n) => `within ${num(n, 1)}%`} />
        <Slider label="Bars allowed to reach the target" value={horizon} min={10} max={40} step={5} onChange={setHorizon} format={(n) => `${n} bars`} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-0 text-left text-xs">
          <thead className="text-fg-subtle">
            <tr><th className="py-1 pr-2 font-normal">Pattern</th><th className="py-1 pr-2 font-normal">Found</th><th className="py-1 pr-2 font-normal">Target hit</th><th className="py-1 font-normal">Mirror hit</th></tr>
          </thead>
          <tbody className="font-mono tabular text-fg">
            {rows.map((r) => (
              <tr key={r.kind} className="border-t border-line">
                <td className="py-1 pr-2 font-sans">{KIND_LABEL[r.kind]}</td>
                <td className="py-1 pr-2">{r.found}</td>
                <td className="py-1 pr-2">{r.tested ? pct(r.target / r.tested) : "—"}</td>
                <td className="py-1">{r.tested ? pct(r.mirror / r.tested) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Result tone={series === "c" ? "info" : "warn"}>
        {`${total.tested} confirmed patterns: the measured-move target was reached in ${pct(total.tested ? total.target / total.tested : null)} of them, and the same distance the opposite way in ${pct(total.tested ? total.mirror / total.tested : null)}. ${series === "c" ? "This series has trending regimes, but they are not linked to the patterns, so compare the two columns before crediting the pattern." : "This series is a random walk: nothing in it can be predicted, so these shapes and hit rates are what chance alone produces."} A pattern adds information only if its target is reached clearly more often than its mirror, on data it was not designed on.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L10. Fibonacci, with a control ──────────────────────────────────────────

const MADE_UP = [0.2, 0.35, 0.5, 0.65, 0.8] as const;
const FIB_WALK = simulateSeries({ seed: 7501, bars: 6000, regimes: false, vol: 0.011, start: 50 }).bars;
const FIB_RATIOS_MEASURED = retracementRatios(swings(FIB_WALK, 3));
const FIB_CHART = simulateSeries({ seed: 7502, bars: 140, vol: 0.011, trend: 0.004, switchChance: 0.02, initial: "up", start: 50 }).bars;

export function FibonacciTool({ title, caption }: FrameProps) {
  const [set, setSet] = useState<"fib" | "made">("fib");
  const [tolPP, setTolPP] = useState(3);
  const levels = set === "fib" ? FIB_RATIOS : MADE_UP;
  const tol = tolPP / 100;
  const coverage = fibCoverage(tol, levels);
  const share = nearFibShare(FIB_RATIOS_MEASURED, tol, levels);
  const other = nearFibShare(FIB_RATIOS_MEASURED, tol, set === "fib" ? MADE_UP : FIB_RATIOS);
  const sw = useMemo(() => swings(FIB_CHART, 3), []);
  // The last confirmed up-leg: a swing low followed by a swing high.
  const leg = useMemo(() => {
    for (let j = sw.length - 1; j > 0; j--) if (sw[j].kind === "high" && sw[j - 1].kind === "low") return { lo: sw[j - 1], hi: sw[j] };
    return null;
  }, [sw]);
  const annotations: Annotation[] = leg
    ? [
        { kind: "marker", index: leg.lo.index, price: leg.lo.price, label: "0%", tone: "accent", pos: "below" },
        { kind: "marker", index: leg.hi.index, price: leg.hi.price, label: "100%", tone: "accent", pos: "above" },
        ...fibLevels(leg.lo.price, leg.hi.price, levels).map((l): Annotation => ({ kind: "hline", price: l.price, label: `${num(l.ratio * 100, 1)}%`, tone: set === "fib" ? "warn" : "info", dashed: true })),
      ]
    : [];
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Levels drawn" value={set} onChange={setSet} options={[{ id: "fib", label: "Fibonacci ratios" }, { id: "made", label: "Made-up ratios" }]} />
      <CandleChart bars={FIB_CHART} label="Simulated up-move with retracement levels drawn from the last swing low to the last swing high" height={200} annotations={annotations} barLabel={(i) => `${i + 1}`} />
      <Slider label="Counts as 'at a level' if within" value={tolPP} min={1} max={5} step={0.5} onChange={setTolPP} format={(n) => `±${num(n, 1)} points`} hint="Points of retracement, e.g. ±3 means 58.8% to 64.8% counts as 61.8%." />
      <Readouts cols={3}>
        <Readout label="Chance a random retracement is 'at a level'" value={pct(coverage)} sub="share of 0–100% covered" />
        <Readout label={`Random-walk retracements at a level (${FIB_RATIOS_MEASURED.length})`} value={pct(share)} tone="accent" />
        <Readout label={set === "fib" ? "Same, using made-up ratios" : "Same, using Fibonacci ratios"} value={pct(other)} />
      </Readouts>
      <Meter label="Covered by the levels (chance of a 'hit')" pct={coverage * 100} tone="warn" />
      <Result tone="warn">
        {`The levels are ${levels.map((l) => `${num(l * 100, 1)}%`).join(", ")}. With ±${num(tolPP, 1)} points around each, they cover ${pct(coverage)} of all possible retracements, so many pullbacks will "respect a level" by chance. Measured on a random walk, ${pct(share)} land near these levels and ${pct(other)} near the ${set === "fib" ? "made-up" : "Fibonacci"} set. A level that works should beat both, on data it was not chosen on.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L11. Confluence across timeframes, and redundant indicators ─────────────

const CONF = simulateSeries({ seed: 7601, bars: 600, vol: 0.011, trend: 0.0025, switchChance: 0.02, volume: 30_000, start: 50 }).bars;
const RED = simulateSeries({ seed: 7602, bars: 2000, vol: 0.011, trend: 0.0025, switchChance: 0.02, volume: 30_000, start: 50 }).bars;

function StateStrip({ rows, label }: { rows: { name: string; states: readonly (1 | -1 | null)[] }[]; label: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const padL = 6, padR = 11 * 5.2, rowH = 16, gap = 4;
  const n = Math.max(1, ...rows.map((r) => r.states.length));
  const plotW = Math.max(40, width - padL - padR), step = plotW / n;
  const h = rows.length * (rowH + gap);
  return (
    <div ref={ref} className="relative min-w-0 rounded-md border border-line bg-panel">
      <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} className="block w-full" role="img" aria-label={label} style={{ fontSize: "11px", height: h }}>
        {rows.map((r, k) => (
          <g key={r.name}>
            {r.states.map((s, i) => s === null ? null : <rect key={i} x={padL + i * step} width={Math.max(0.5, step)} y={k * (rowH + gap) + gap / 2} height={rowH} className={s > 0 ? "fill-up" : "fill-down"} opacity={0.6} />)}
            <text x={padL + plotW + 4} y={k * (rowH + gap) + gap / 2 + rowH - 4} className="fill-fg-subtle">{r.name}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function ConfluenceTool({ title, caption }: FrameProps) {
  const [factor, setFactor] = useState<"4" | "5" | "10">("5");
  const [n, setN] = useState(20);
  const k = Number(factor);
  const tf = useMemo(() => timeframeStates(CONF, k, n), [k, n]);
  const flips = (xs: readonly (1 | -1 | null)[]) => xs.reduce<number>((a, s, i) => (i > 0 && s !== null && xs[i - 1] !== null && s !== xs[i - 1] ? a + 1 : a), 0);
  const view = 200, from = CONF.length - view;
  const corr = useMemo(() => {
    const cs = RED.map((b) => b.c);
    const r = rsi(cs, 14), st = stochastic(RED, 14, 3, 3).k, roc = rateOfChange(cs, 14), m = macd(cs).hist, pb = bollinger(cs, 20, 2).pctB;
    const ob = obv(RED), obc: (number | null)[] = ob.map((v, i) => (i >= 14 ? v - ob[i - 14] : null));
    const at = atr(RED, 14);
    return [
      { a: "RSI 14", b: "Stochastic 14", r: alignedCorrelation(r, st) },
      { a: "RSI 14", b: "Rate of change 14", r: alignedCorrelation(r, roc) },
      { a: "RSI 14", b: "Bollinger %b", r: alignedCorrelation(r, pb) },
      { a: "RSI 14", b: "MACD histogram", r: alignedCorrelation(r, m) },
      { a: "RSI 14", b: "OBV, 14-bar change", r: alignedCorrelation(r, obc) },
      { a: "RSI 14", b: "ATR 14", r: alignedCorrelation(r, at) },
    ];
  }, []);
  const hb = aggregate(CONF, k).bars.length;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <p className="text-[13px] font-medium text-fg">1. Two timeframes</p>
      <CandleChart bars={CONF.slice(from)} label="The last 200 bars of a simulated series on the base timeframe" height={160} barLabel={(i) => `${from + i + 1}`} />
      <StateStrip label="Trend state on the base and the higher timeframe for the same bars: green above the moving average, red below" rows={[{ name: "Base", states: tf.base.slice(from) }, { name: `${k}× bars`, states: tf.higher.slice(from) }]} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Higher timeframe" value={factor} onChange={setFactor} options={[{ id: "4", label: "4× longer" }, { id: "5", label: "5× longer" }, { id: "10", label: "10× longer" }]} />
        <Slider label="Moving average on each timeframe" value={n} min={5} max={50} step={5} onChange={setN} format={(x) => `${x} bars`} />
      </div>
      <Readouts cols={3}>
        <Readout label="Bars where both agree" value={pct(tf.aligned)} />
        <Readout label="State changes, base" value={`${flips(tf.base)}`} />
        <Readout label={`State changes, ${k}× (${hb} bars)`} value={`${flips(tf.higher)}`} />
      </Readouts>
      <p className="pt-2 text-[13px] font-medium text-fg">2. Are these different opinions?</p>
      <div className="space-y-2" data-redundancy>
        {corr.map((c) => (
          <Meter key={c.b} label={`${c.a} vs ${c.b}`} pct={Math.abs(c.r ?? 0) * 100} tone={Math.abs(c.r ?? 0) >= 0.7 ? "warn" : "muted"} value={c.r === null ? "—" : signed(c.r, 2)} />
        ))}
      </div>
      <Result>
        {`The higher timeframe only uses bars that have closed, so it changes state less often and agrees with the base timeframe on ${pct(tf.aligned)} of bars. The second part is correlation over ${RED.length} simulated bars: RSI, the stochastic and rate of change are all built from the same recent closes, so they mostly say the same thing. Three of them agreeing is closer to one opinion than three.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L12. Overfitting: the best of many tries ────────────────────────────────

const COMBOS = [1, 2, 4, 8, 16, 32, 64] as const;

export function OverfitTool({ title, caption }: FrameProps) {
  const [ci, setCi] = useState(4);
  const [cost, setCost] = useState(0.05);
  const [seed, setSeed] = useState<"1" | "2" | "3">("1");
  const curve = useMemo(() => COMBOS.map((c) => {
    const e = overfitExperiment({ seed: 7700 + Number(seed), paths: 40, bars: 500, combos: c, costPct: cost });
    return { c, bestIn: median(e.bestIn) ?? 0, out: median(e.itsOut) ?? 0, outUp: e.itsOut.filter((x) => x > 0).length / Math.max(1, e.itsOut.length), inUp: e.bestIn.filter((x) => x > 0).length / Math.max(1, e.bestIn.length) };
  }), [cost, seed]);
  const cur = curve[ci];
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Slider label="Moving-average pairs tried on each path" value={ci} min={0} max={COMBOS.length - 1} step={1} onChange={setCi} format={(i) => `${COMBOS[i]}`} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Cost per entry or exit" value={cost} min={0} max={0.2} step={0.05} onChange={setCost} format={(n) => `${num(n, 2)}%`} />
        <Choice label="Batch of random walks" value={seed} onChange={setSeed} options={[{ id: "1", label: "Batch 1" }, { id: "2", label: "Batch 2" }, { id: "3", label: "Batch 3" }]} />
      </div>
      <LinePlot
        label="Median return of the best in-sample rule, in sample and out of sample, against the number of pairs tried"
        series={[{ values: curve.map((p) => p.bestIn), tone: "warn", label: "In sample" }, { values: curve.map((p) => p.out), tone: "accent", label: "Out of sample" }]}
        lines={[{ y: 0, label: "0%", tone: "muted", dashed: true }]}
        markers={[{ x: ci, y: cur.bestIn, tone: "warn" }, { x: ci, y: cur.out, tone: "accent" }]}
        xFormat={(i) => `${COMBOS[i] ?? ""}`}
        yFormat={(n) => `${num(n, 0)}%`}
        xLabel="Pairs tried (warn: best in sample; accent: same rule out of sample)"
        height={170}
      />
      <Readouts cols={4}>
        <Readout label="Best in sample (median)" value={`${signed(cur.bestIn, 1)}%`} tone="warn" />
        <Readout label="Same rule, out of sample" value={`${signed(cur.out, 1)}%`} tone="accent" />
        <Readout label="Paths where best gains in sample" value={pct(cur.inUp)} />
        <Readout label="…and out of sample" value={pct(cur.outUp)} />
      </Readouts>
      <Result tone={COMBOS[ci] >= 16 ? "warn" : "info"}>
        {`Each of 40 random walks (500 bars, no edge by construction) is split in half. The pair with the best result on the first half is chosen, then run on the second half. With ${COMBOS[ci]} pair${COMBOS[ci] === 1 ? "" : "s"} tried, the chosen rule's median is ${signed(cur.bestIn, 1)}% in sample and ${signed(cur.out, 1)}% out of sample. The in-sample number rises with every extra try; the out-of-sample number does not, because the only thing selected was luck.`}
      </Result>
    </WidgetFrame>
  );
}
