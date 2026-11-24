"use client";

import { useId, useMemo, useState } from "react";
import { Check, Eye, RotateCcw } from "lucide-react";
import {
  atr, detectGaps, directional, efficiencyRatio, labelSwings, linearRegression, linearScale, logScale, relativeVolume, rng,
  simulateSeries, sma, stopFill, structureOf, swings, zoneTouches, zoneVisits, type Bar,
} from "@/lib/academy/charts";
import { Button } from "@/components/ui/button";
import { CandleChart, fmtPrice, type Annotation, type Overlay } from "@/components/academy/charts/candle-chart";
import { cn } from "@/lib/cn";
import { Choice, Readout, Readouts, Result, Slider, WidgetFrame, money, num, signed } from "./kit";

type FrameProps = { title: string; caption: string };

// ── L7. Trend tools compared ────────────────────────────────────────────────

const TREND = simulateSeries({ seed: 707, bars: 260, vol: 0.011, trend: 0.003, switchChance: 0.025, start: 50 }).bars;
const TREND_SMA20 = sma(TREND.map((b) => b.c), 20);
const TREND_SMA50 = sma(TREND.map((b) => b.c), 50);
const TREND_DM = directional(TREND, 14);
const TREND_ATR = atr(TREND, 14);
type Method = "structure" | "ma" | "regression" | "adx" | "er";

export function TrendTools({ title, caption }: FrameProps) {
  const [method, setMethod] = useState<Method>("ma");
  const [end, setEnd] = useState(180);
  const [look, setLook] = useState(40);
  const bars = TREND.slice(0, end);
  const closes = bars.map((b) => b.c);
  const last = closes[closes.length - 1];
  const seg = closes.slice(-look);
  const reg = linearRegression(seg);
  const regPct = (reg.slope / last) * 100;
  const sw = swings(bars.slice(-Math.max(look, 12)), 3);
  const struct = structureOf(sw);
  const s20 = TREND_SMA20[end - 1], s50 = TREND_SMA50[end - 1];
  const maWord = s20 === null || s50 === null ? "not enough bars" : last > s50 && s20 > s50 ? "up" : last < s50 && s20 < s50 ? "down" : "mixed";
  const adx = TREND_DM.adx[end - 1], pdi = TREND_DM.plusDI[end - 1], mdi = TREND_DM.minusDI[end - 1];
  const er = efficiencyRatio(closes, look);
  const roc = ((last - closes[Math.max(0, closes.length - 11)]) / closes[Math.max(0, closes.length - 11)]) * 100;
  const atrPct = TREND_ATR[end - 1] !== null ? (TREND_ATR[end - 1]! / last) * 100 : null;
  const offset = end - look;
  const overlays: Overlay[] = method === "ma" ? [{ values: TREND_SMA20.slice(0, end), label: "SMA 20", tone: "accent" }, { values: TREND_SMA50.slice(0, end), label: "SMA 50", tone: "warn" }] : [];
  const annotations: Annotation[] = method === "regression"
    ? [{ kind: "line", i0: offset, p0: reg.intercept, i1: end - 1, p1: reg.intercept + reg.slope * (look - 1), label: `slope ${signed(regPct, 2)}%/bar`, tone: "accent" }]
    : method === "structure"
      ? labelSwings(sw).map((s): Annotation => ({ kind: "marker", index: s.index + (end - Math.max(look, 12)), price: s.price, label: s.label === "first" ? (s.kind === "high" ? "SH" : "SL") : s.label, tone: s.kind === "high" ? "down" : "up", pos: s.kind === "high" ? "above" : "below" }))
      : [];
  const verdicts = [
    { id: "structure", label: "Swing structure", value: struct },
    { id: "ma", label: "Moving averages 20/50", value: maWord },
    { id: "regression", label: `Regression over ${look} bars`, value: `${signed(regPct, 2)}%/bar, r² ${num(reg.r2, 2)}` },
    { id: "adx", label: "ADX(14) and ±DI", value: adx === null ? "not enough bars" : `${num(adx, 0)} ${adx >= 25 ? "directional" : adx < 20 ? "not directional" : "in between"}, ${pdi! > mdi! ? "+DI leads" : "−DI leads"}` },
    { id: "er", label: `Efficiency ratio (${look})`, value: er === null ? "not enough bars" : num(er, 2) },
  ];
  const ups = [struct === "uptrend", maWord === "up", regPct > 0.05].filter(Boolean).length;
  const downs = [struct === "downtrend", maWord === "down", regPct < -0.05].filter(Boolean).length;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Show on the chart" value={method} onChange={setMethod} options={[{ id: "structure", label: "Swings" }, { id: "ma", label: "Moving averages" }, { id: "regression", label: "Regression line" }, { id: "adx", label: "ADX" }, { id: "er", label: "Efficiency ratio" }]} />
      <CandleChart bars={bars} label="Simulated price chart for comparing trend methods" height={200} overlays={overlays} annotations={annotations} controls initialWindow={Math.min(end, 140)} barLabel={(i) => `${i + 1}`} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Chart ends at bar" value={end} min={60} max={TREND.length} step={5} onChange={setEnd} format={(n) => `${n}`} hint="Move through time: every method only sees bars up to here." />
        <Slider label="Lookback" value={look} min={15} max={120} step={5} onChange={setLook} format={(n) => `${n} bars`} />
      </div>
      <Readouts cols={3}>
        {verdicts.map((v) => <Readout key={v.id} label={v.label} value={v.value} tone={v.id === method ? "accent" : undefined} />)}
        <Readout label="Momentum: 10-bar change" value={`${signed(roc, 2)}%`} tone={roc > 0 ? "up" : "down"} />
      </Readouts>
      <Result tone={ups && downs ? "warn" : "info"}>
        {`${ups} of the three direction methods say up and ${downs} say down. ${ups && downs ? "They disagree: each answers a different question over a different window." : ups === 3 || downs === 3 ? "They agree here, but agreement is not a forecast." : "Some see no clear direction."} ADX and the efficiency ratio measure how directional the movement has been, not which way. Volatility is separate again: the average true range is ${atrPct === null ? "not available yet" : `${num(atrPct, 2)}% of the price`}, which says how big the swings are, not whether there is a trend. Momentum (the 10-bar change) can turn before a longer trend does.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L8. Volume: relative volume and fragmented venues ───────────────────────

const VOL = simulateSeries({ seed: 808, bars: 160, vol: 0.012, trend: 0.002, gapChance: 0.03, gapSize: 0.03, volume: 50_000, start: 30 }).bars;
const VENUES = (() => {
  const r = rng(809);
  return VOL.map((b, i) => {
    const shareA = Math.min(0.85, Math.max(0.15, 0.5 + 0.25 * Math.sin(i / 9) + (r() - 0.5) * 0.3));
    const a = Math.round(b.v * shareA);
    return { a, b: b.v - a, ticks: Math.max(1, Math.round(b.v / (40 + r() * 80))) };
  });
})();
type VolView = "all" | "a" | "b" | "ticks";

export function VolumeExplorer({ title, caption }: FrameProps) {
  const [view, setView] = useState<VolView>("all");
  const [thr, setThr] = useState(2);
  const [n, setN] = useState(20);
  const vols = VOL.map((b, i) => (view === "all" ? b.v : view === "a" ? VENUES[i].a : view === "b" ? VENUES[i].b : VENUES[i].ticks));
  const bars: Bar[] = VOL.map((b, i) => ({ ...b, v: vols[i] }));
  const rv = relativeVolume(vols, n);
  const rvAll = relativeVolume(VOL.map((b) => b.v), n);
  const spikes = rv.flatMap((x, i) => (x !== null && x >= thr ? [i] : []));
  const spikesAll = new Set(rvAll.flatMap((x, i) => (x !== null && x >= thr ? [i] : [])));
  const shared = spikes.filter((i) => spikesAll.has(i)).length;
  const lastRv = rv[rv.length - 1];
  const VIEW_NOTE: Record<VolView, string> = {
    all: "All venues added together (a consolidated total, as for US shares). Even this can miss trades that are reported late or happen off exchange.",
    a: "One venue only. In crypto, a chart usually shows one exchange's volume; the rest of the market trades elsewhere.",
    b: "Another venue. Its spikes do not always line up with venue A's, because traders move between venues.",
    ticks: "Tick volume: the number of price updates, not the amount traded. Spot forex charts often show this, because there is no central record of traded size.",
  };
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Volume shown" value={view} onChange={setView} options={[{ id: "all", label: "All venues" }, { id: "a", label: "Venue A only" }, { id: "b", label: "Venue B only" }, { id: "ticks", label: "Tick count" }]} />
      <CandleChart bars={bars} label="Simulated price chart with a volume pane; volume spikes highlighted" height={170} volume highlight={spikes} barLabel={(i) => `${i + 1}`} decimals={2} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Spike threshold (relative volume)" value={thr} min={1.5} max={4} step={0.25} onChange={setThr} format={(x) => `${num(x, 2)}× average`} />
        <Slider label="Average over the previous" value={n} min={5} max={40} step={5} onChange={setN} format={(x) => `${x} bars`} />
      </div>
      <Readouts cols={3}>
        <Readout label="Spikes in this view" value={spikes.length} />
        <Readout label="Also spikes in the all-venue total" value={`${shared} of ${spikes.length}`} tone={view !== "all" && shared < spikes.length ? "warn" : undefined} />
        <Readout label="Relative volume, last bar" value={lastRv === null ? "—" : `${num(lastRv, 2)}×`} />
      </Readouts>
      <Result tone={view === "all" ? "info" : "warn"}>
        {`${VIEW_NOTE[view]} Relative volume = this bar's volume ÷ the average of the previous ${n} bars. ${spikes.length} bars reach ${num(thr, 2)}× here${view === "all" ? "." : `, and ${spikes.length - shared} of them are not spikes in the all-venue total.`} High volume says many units changed hands. Every unit bought was also sold, so volume alone cannot say who was "in control".`}
      </Result>
    </WidgetFrame>
  );
}

// ── L9. Linear versus logarithmic scale ─────────────────────────────────────

const SCALE_BASE = simulateSeries({ seed: 909, bars: 300, regimes: false, vol: 0.018, start: 10 }).bars;

export function ScaleCompare({ title, caption }: FrameProps) {
  const [scale, setScale] = useState<"linear" | "log">("linear");
  const [growth, setGrowth] = useState(1.2);
  const g = growth / 100;
  const bars = useMemo(() => SCALE_BASE.map((b, i) => { const f = Math.exp(g * i); return { ...b, o: b.o * f, h: b.h * f, l: b.l * f, c: b.c * f }; }), [g]);
  const start = bars[0].c, endP = bars[bars.length - 1].c;
  const firstDouble = bars.findIndex((b) => b.c >= start * 2);
  let lastHalf = -1;
  for (let i = bars.length - 1; i >= 0; i--) if (bars[i].c <= endP / 2) { lastHalf = i; break; }
  const H = 200;
  const lo = Math.min(...bars.map((b) => b.l)), hi = Math.max(...bars.map((b) => b.h));
  const sc = scale === "log" ? logScale(lo, hi, H, 0) : linearScale(lo, hi, H, 0);
  const px = (a: number, b: number) => Math.abs(sc(a) - sc(b));
  const early = firstDouble > 0 ? px(start, start * 2) : null;
  const late = lastHalf >= 0 ? px(endP / 2, endP) : null;
  const ann: Annotation[] = [
    ...(firstDouble > 0 ? [{ kind: "line", i0: 0, p0: start, i1: firstDouble, p1: start * 2, label: "first doubling", tone: "info" } as Annotation] : []),
    ...(lastHalf >= 0 ? [{ kind: "line", i0: lastHalf, p0: endP / 2, i1: bars.length - 1, p1: endP, label: "last doubling", tone: "warn" } as Annotation] : []),
  ];
  const total = ((endP - start) / start) * 100;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Price scale" value={scale} onChange={setScale} options={[{ id: "linear", label: "Linear" }, { id: "log", label: "Logarithmic" }]} />
      <CandleChart bars={bars} scale={scale} mode="line" label={`Simulated long-term price on a ${scale} scale`} height={H} annotations={ann} barLabel={(i) => `M${i + 1}`} />
      <Slider label="Average growth per bar" value={growth} min={0.4} max={2} step={0.2} onChange={setGrowth} format={(x) => `${num(x, 1)}%`} />
      <Readouts cols={3}>
        <Readout label="Whole move" value={`${fmtPrice(start, 2)} → ${fmtPrice(endP, 2)}`} sub={`${signed(total, 0)}%`} />
        <Readout label="First doubling: height on screen" value={early === null ? "—" : `${Math.round(early)} px`} tone="accent" />
        <Readout label="Last doubling: height on screen" value={late === null ? "—" : `${Math.round(late)} px`} tone="warn" />
      </Readouts>
      <Result tone={scale === "linear" ? "warn" : "good"}>
        {scale === "linear"
          ? `On a linear scale, equal DISTANCES are equal amounts of money. Both marked moves are +100%, but the last one is drawn about ${early && late ? Math.max(1, Math.round(late / Math.max(early, 0.5))) : "many"} times taller, so early history looks flat and recent moves look dramatic.`
          : "On a log scale, equal distances are equal PERCENTAGE moves: both doublings are drawn the same height. For long histories with large price changes, that is the fairer picture of what an investor experienced."}
      </Result>
    </WidgetFrame>
  );
}

// ── L10. Levels as zones ────────────────────────────────────────────────────

const LEVELS = simulateSeries({ seed: 1010, bars: 150, vol: 0.012, initial: "range", switchChance: 0, start: 75 }).bars;
const L_LO = Math.min(...LEVELS.map((b) => b.l)), L_HI = Math.max(...LEVELS.map((b) => b.h));

export function LevelZones({ title, caption }: FrameProps) {
  const [center, setCenter] = useState(Math.round((L_HI - (L_HI - L_LO) * 0.12) * 2) / 2);
  const [width, setWidth] = useState(0.8);
  const half = (center * width) / 100 / 2;
  const lo = center - half, hi = center + half;
  const touches = zoneTouches(LEVELS, lo, hi);
  const visits = zoneVisits(touches, 3);
  const lineTouches = zoneTouches(LEVELS, center, center).length;
  const nudged = zoneTouches(LEVELS, center * 1.003, center * 1.003).length;
  const closesAbove = LEVELS.filter((b) => b.c > hi).length, closesBelow = LEVELS.filter((b) => b.c < lo).length;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <CandleChart
        bars={LEVELS}
        label="Simulated range-bound price with a level drawn as a zone"
        height={200}
        annotations={[{ kind: "zone", lo, hi, tone: "info", label: width > 0 ? `zone ${fmtPrice(lo, 2)}–${fmtPrice(hi, 2)}` : undefined }, { kind: "hline", price: center, tone: "accent", dashed: true }]}
        highlight={touches}
        barLabel={(i) => `${i + 1}`}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Level price" value={center} min={Math.floor(L_LO)} max={Math.ceil(L_HI)} step={0.5} onChange={setCenter} format={(x) => fmtPrice(x, 2)} />
        <Slider label="Zone width" value={width} min={0} max={3} step={0.2} onChange={setWidth} format={(x) => (x === 0 ? "a single line" : `${num(x, 1)}% of price`)} />
      </div>
      <Readouts cols={4}>
        <Readout label="Bars touching the zone" value={touches.length} />
        <Readout label="Separate visits" value={visits} />
        <Readout label="Touches of the exact line" value={lineTouches} sub={`${nudged} if moved up 0.3%`} />
        <Readout label="Closes above / below" value={`${closesAbove} / ${closesBelow}`} />
      </Readouts>
      <Result tone={width === 0 ? "warn" : "info"}>
        {width === 0
          ? `A single line at ${fmtPrice(center, 2)} is touched by ${lineTouches} bars, and by ${nudged} if you move it 0.3%. A level drawn to the cent is false precision: prices react around areas, and a tiny shift changes the count.`
          : `${touches.length} bars touched this zone in ${visits} separate visit${visits === 1 ? "" : "s"}. More touches can mean the area matters to many traders, or simply that price has spent a long time near it. A zone is a place to watch, not a wall: count how often price went straight through it too.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L11. Gaps and stop orders ───────────────────────────────────────────────

const GAP_SCEN = {
  earnings: { label: "Earnings gap down", side: "sell" as const, openPct: -14, lowPct: -17, note: "Results came out after the close; the next open was far below the stop." },
  weekend: { label: "Weekend gap down", side: "sell" as const, openPct: -4.5, lowPct: -6, note: "News over the weekend, while the market was shut." },
  short: { label: "Gap up against a short", side: "buy" as const, openPct: 9, lowPct: 7, note: "A short seller's buy stop above the market; the price opened above it." },
  normal: { label: "Ordinary day", side: "sell" as const, openPct: -0.3, lowPct: -3.5, note: "No gap: price traded down through the stop during the day." },
};
type GapKey = keyof typeof GAP_SCEN;
const GAPPY = simulateSeries({ seed: 1111, bars: 220, vol: 0.012, gapChance: 0.07, gapSize: 0.035, start: 40 }).bars;

export function GapStops({ title, caption }: FrameProps) {
  const [scen, setScen] = useState<GapKey>("earnings");
  const [stopPct, setStopPct] = useState(5);
  const [windowBars, setWindowBars] = useState(10);
  const s = GAP_SCEN[scen];
  const entry = 50, shares = 100;
  const stop = s.side === "sell" ? entry * (1 - stopPct / 100) : entry * (1 + stopPct / 100);
  const o = entry * (1 + s.openPct / 100);
  const ext = entry * (1 + s.lowPct / 100);
  const bar = s.side === "sell" ? { o, h: Math.max(o, entry), l: Math.min(ext, o) } : { o, h: Math.max(ext, o) * 1.01, l: Math.min(o, entry) };
  const f = stopFill(stop, s.side, bar);
  const planned = Math.abs(entry - stop) * shares;
  const actual = f.fill === null ? 0 : Math.abs(entry - f.fill) * shares;
  const gaps = detectGaps(GAPPY, 1.5);
  const filledIn = gaps.filter((g) => g.filledAt !== null && g.filledAt - g.index <= windowBars).length;
  const never = gaps.filter((g) => g.filledAt === null).length;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="What happens overnight" value={scen} onChange={setScen} options={(Object.keys(GAP_SCEN) as GapKey[]).map((k) => ({ id: k, label: GAP_SCEN[k].label }))} />
      <Slider label={s.side === "sell" ? "Sell stop below the $50 entry" : "Buy stop above the $50 short entry"} value={stopPct} min={1} max={12} step={1} onChange={setStopPct} format={(x) => `${x}% (${money(stop)})`} />
      <Readouts cols={4}>
        <Readout label="Stop price" value={money(stop)} />
        <Readout label="Next open" value={money(o)} />
        <Readout label="Likely fill" value={f.fill === null ? "not triggered" : money(f.fill)} tone={f.slippage > 0 ? "down" : undefined} />
        <Readout label="Loss on 100 shares: planned → actual" value={f.fill === null ? `${money(planned)} → none yet` : `${money(planned)} → ${money(actual)}`} tone={actual > planned + 0.5 ? "down" : undefined} />
      </Readouts>
      <Result tone={f.slippage > 0 ? "bad" : "info"}>
        {f.fill === null
          ? `${s.note} Price never reached the ${money(stop)} stop, so it did not trigger.`
          : f.slippage > 0
            ? `${s.note} A stop becomes a market order once triggered; the first price available was the open at ${money(o)}, ${money(f.slippage)} beyond the stop. The planned ${money(planned)} loss became ${money(actual)}. A stop limits risk only while the market trades continuously through it.`
            : `${s.note} The stop triggered at about ${money(stop)} with little slippage, because price traded through it continuously. (In a fast market even this can slip.)`}
      </Result>
      <div className="border-t border-line pt-3">
        <p className="mb-1 text-[11px] text-fg-subtle">Opening gaps of 1.5% or more in a simulated series ({gaps.length} found), marked with dashed lines</p>
        <CandleChart bars={GAPPY} label="Simulated series with opening gaps marked" height={160} annotations={gaps.map((g): Annotation => ({ kind: "vline", index: g.index, tone: g.dir === "up" ? "up" : "down" }))} controls initialWindow={120} barLabel={(i) => `${i + 1}`} />
        <Slider label="Count a gap as filled within" value={windowBars} min={1} max={30} step={1} onChange={setWindowBars} format={(x) => `${x} bar${x === 1 ? "" : "s"}`} />
        <p className={cn("mt-2 text-[13px] text-fg-muted")}>
          {gaps.length === 0 ? "No gaps found in this series." : `${filledIn} of ${gaps.length} gaps (${Math.round((filledIn / gaps.length) * 100)}%) traded back to the previous close within ${windowBars} bars; ${never} never did in this sample. "Gaps always fill" is a saying, not a rule.`}
        </p>
      </div>
    </WidgetFrame>
  );
}

// ── L12. Practical examination ──────────────────────────────────────────────

const EXAM_SEEDS = [
  { id: "s1", label: "Scenario 1", seed: 1201, initial: "up" as const },
  { id: "s2", label: "Scenario 2", seed: 1202, initial: "down" as const },
  { id: "s3", label: "Scenario 3", seed: 1205, initial: "range" as const },
];
const SEEN = 70, TOTAL = 90;
type TrendAns = "up" | "down" | "range";
type VolAns = "higher" | "similar" | "lower";
type InvAns = "below-low" | "above-high" | "outside-range" | "one-red-candle";

function examTruth(bars: Bar[]) {
  const seen = bars.slice(0, SEEN);
  const sw = swings(seen, 3);
  const st = structureOf(sw);
  const trend: TrendAns = st === "uptrend" ? "up" : st === "downtrend" ? "down" : "range";
  const lows = sw.filter((s) => s.kind === "low"), highs = sw.filter((s) => s.kind === "high");
  const support = lows.at(-1) ?? { index: 0, price: Math.min(...seen.map((b) => b.l)), kind: "low" as const };
  const resistance = highs.at(-1) ?? { index: 0, price: Math.max(...seen.map((b) => b.h)), kind: "high" as const };
  const a = atr(seen, 14)[SEEN - 1] ?? (seen[SEEN - 1].h - seen[SEEN - 1].l);
  const recent = seen.slice(-5).reduce((s, b) => s + b.v, 0) / 5;
  const prior = seen.slice(-25, -5).reduce((s, b) => s + b.v, 0) / 20;
  const ratio = recent / prior;
  const vol: VolAns = ratio > 1.25 ? "higher" : ratio < 0.8 ? "lower" : "similar";
  const inv: InvAns = trend === "up" ? "below-low" : trend === "down" ? "above-high" : "outside-range";
  return { seen, trend, support, resistance, tol: Math.max(a * 0.75, seen[SEEN - 1].c * 0.004), ratio, vol, inv, st };
}

export function ChartExam({ title, caption }: FrameProps) {
  const uid = useId();
  const [sid, setSid] = useState("s1");
  const sc = EXAM_SEEDS.find((s) => s.id === sid)!;
  const bars = useMemo(() => simulateSeries({ seed: sc.seed, bars: TOTAL, vol: 0.012, trend: 0.004, switchChance: 0.02, initial: sc.initial, start: 40 + sc.seed % 7 * 5 }).bars, [sc]);
  const truth = useMemo(() => examTruth(bars), [bars]);
  const [level, setLevel] = useState<number | null>(null);
  const [trend, setTrend] = useState<TrendAns | "">("");
  const [vol, setVol] = useState<VolAns | "">("");
  const [inv, setInv] = useState<InvAns | "">("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [future, setFuture] = useState(false);
  const [self, setSelf] = useState<Record<string, boolean>>({});
  const reset = (id: string) => { setSid(id); setLevel(null); setTrend(""); setVol(""); setInv(""); setText(""); setSubmitted(false); setFuture(false); setSelf({}); };
  const lo = Math.min(...truth.seen.map((b) => b.l)), hi = Math.max(...truth.seen.map((b) => b.h));
  const ready = level !== null && trend && vol && inv && text.trim().length >= 40;
  const levelOk = level !== null && Math.abs(level - truth.support.price) <= truth.tol;
  const auto = [levelOk, trend === truth.trend, vol === truth.vol, inv === truth.inv];
  const autoScore = auto.filter(Boolean).length;
  const SELF = [
    { id: "trend", text: "I named the trend AND how I judged it (for example the last highs and lows)." },
    { id: "zone", text: "I described support as an area, not an exact price, and said where it is." },
    { id: "volume", text: "I compared recent volume with earlier volume instead of judging one bar." },
    { id: "invalid", text: "I said what price action would prove my reading wrong." },
    { id: "uncertain", text: "I said what the chart cannot tell me (news, other venues, the future)." },
  ];
  const selfScore = SELF.filter((s) => self[s.id]).length;
  const shown = future ? bars : truth.seen;
  const ann: Annotation[] = [
    ...(level !== null ? [{ kind: "hline", price: level, label: "your support", tone: "accent" } as Annotation] : []),
    ...(submitted ? [
      { kind: "zone", lo: truth.support.price - truth.tol, hi: truth.support.price + truth.tol, tone: "up", label: "model support zone" } as Annotation,
      { kind: "marker", index: truth.support.index, price: truth.support.price, label: "last swing low", tone: "up", pos: "below" } as Annotation,
      { kind: "marker", index: truth.resistance.index, price: truth.resistance.price, label: "last swing high", tone: "down", pos: "above" } as Annotation,
    ] : []),
    ...(future ? [{ kind: "vline", index: SEEN - 1, label: "you were here", tone: "muted" } as Annotation] : []),
  ];
  const TREND_TXT: Record<TrendAns, string> = { up: "an up-trend: higher highs and higher lows", down: "a down-trend: lower highs and lower lows", range: "no clean trend: the last highs and lows do not line up in one direction" };
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Unseen chart" value={sid} onChange={reset} options={EXAM_SEEDS.map((s) => ({ id: s.id, label: s.label }))} />
      <p className="text-[13px] text-fg-muted">A simulated daily chart you have not seen before. Answer every part first; the model answer appears only after you submit.</p>
      <CandleChart bars={shown} label={`${sc.label}: simulated daily chart for the practical exam`} height={210} volume annotations={ann} onPick={submitted ? undefined : ({ price }) => setLevel(Math.round(price * 100) / 100)} fadeAfter={future ? SEEN - 1 : undefined} barLabel={(i) => `Day ${i + 1}`} />
      <fieldset className="space-y-3" disabled={submitted}>
        <legend className="text-[13px] font-medium text-fg">1. Mark the nearest support: click the chart at its price, or use the slider</legend>
        <Slider label="Your support level" value={level ?? Math.round(((lo + hi) / 2) * 100) / 100} min={Math.floor(lo)} max={Math.ceil(hi)} step={0.05} onChange={(x) => setLevel(x)} format={(x) => (level === null ? "not set" : fmtPrice(x, 2))} />
        <Choice label="2. The trend in the bars shown is" value={trend as TrendAns} onChange={setTrend} options={[{ id: "up", label: "Up" }, { id: "down", label: "Down" }, { id: "range", label: "No clear trend" }]} />
        <Choice label="3. Volume over the last 5 days, compared with the 20 before" value={vol as VolAns} onChange={setVol} options={[{ id: "higher", label: "Higher" }, { id: "similar", label: "Similar" }, { id: "lower", label: "Lower" }]} />
        <Choice label="4. Which would most clearly show your reading is wrong?" value={inv as InvAns} onChange={setInv} options={[{ id: "below-low", label: "A close below the last swing low" }, { id: "above-high", label: "A close above the last swing high" }, { id: "outside-range", label: "A close outside the recent range" }, { id: "one-red-candle", label: "One red candle" }]} />
        <div>
          <label htmlFor={`${uid}-why`} className="block text-xs text-fg-muted">5. Explain your reading in your own words: trend, level, volume, what would prove you wrong, and what the chart cannot tell you (at least 40 characters)</label>
          <textarea id={`${uid}-why`} value={text} onChange={(e) => setText(e.target.value.slice(0, 1500))} rows={4} className="mt-1 w-full min-w-0 rounded-md border border-line-strong bg-raised px-2.5 py-2 text-[13px] text-fg" />
          <p className="text-[11px] text-fg-subtle">{text.trim().length} characters</p>
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => setSubmitted(true)} disabled={!ready || submitted}><Check className="size-3.5" aria-hidden /> Submit and see the model answer</Button>
        {submitted && <Button onClick={() => setFuture(true)} disabled={future}><Eye className="size-3.5" aria-hidden /> Show what happened next</Button>}
        <Button variant="ghost" onClick={() => reset(sid)}><RotateCcw className="size-3.5" aria-hidden /> Start this chart again</Button>
      </div>
      {submitted && (
        <div className="space-y-3 rounded-md border border-line bg-panel p-3" data-model-answer>
          <p className="text-[13px] font-medium text-fg">Model answer</p>
          <ul className="list-disc space-y-1 pl-5 text-[13px] text-fg-muted">
            <li className={auto[0] ? "text-fg" : ""}>Support: the last swing low at about {fmtPrice(truth.support.price, 2)}, read as a zone of roughly ±{fmtPrice(truth.tol, 2)} (about three quarters of a day's average true range). Yours: {level === null ? "none" : fmtPrice(level, 2)} — {auto[0] ? "inside the zone" : "outside the zone"}.</li>
            <li className={auto[1] ? "text-fg" : ""}>Trend: {TREND_TXT[truth.trend]} (3-bar swing rule). Yours: {trend === truth.trend ? "the same" : "different"}. Another rule could reasonably disagree; say which rule you use.</li>
            <li className={auto[2] ? "text-fg" : ""}>Volume: the last 5 days averaged {num(truth.ratio, 2)}× the 20 days before, so {truth.vol}. Yours: {vol === truth.vol ? "the same" : vol}.</li>
            <li className={auto[3] ? "text-fg" : ""}>Invalidation: {truth.inv === "below-low" ? "a close below the last swing low would break the higher-low sequence" : truth.inv === "above-high" ? "a close above the last swing high would break the lower-high sequence" : "a close outside the recent range, ideally on higher volume, would end the range reading"}. One red candle proves nothing on its own.</li>
            <li>What the chart cannot say: why price moved, what news is coming, what other venues traded, or what happens next.</li>
          </ul>
          <fieldset>
            <legend className="text-xs text-fg-muted">Self-assessment: tick what your written explanation actually did</legend>
            <div className="mt-1 space-y-1">
              {SELF.map((s) => (
                <label key={s.id} className="flex items-start gap-2 text-[13px] text-fg-muted">
                  <input type="checkbox" checked={!!self[s.id]} onChange={(e) => setSelf((x) => ({ ...x, [s.id]: e.target.checked }))} className="mt-0.5 accent-accent" />
                  <span>{s.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
      <Readouts cols={2}>
        <Readout label="Marked and chosen parts" value={submitted ? `${autoScore} of 4 match the model` : "answer first"} tone={submitted ? (autoScore >= 3 ? "up" : "warn") : undefined} />
        <Readout label="Your written reasoning (self-assessed)" value={submitted ? `${selfScore} of ${SELF.length}` : "answer first"} />
      </Readouts>
      <Result tone={submitted ? (autoScore >= 3 ? "good" : "warn") : "info"}>
        {!submitted
          ? `${[level !== null, !!trend, !!vol, !!inv, text.trim().length >= 40].filter(Boolean).length} of 5 parts answered.`
          : future
            ? `The faded bars show what came next in the simulation. They do not grade your answer: a sound reading can be followed by a move against it, and a careless one can get lucky. Your process score stands.`
            : `Scored: ${autoScore} of 4 parts match the model answer. Compare your written reasoning with it and tick only what you really covered. Then, if you like, look at what happened next.`}
      </Result>
    </WidgetFrame>
  );
}
