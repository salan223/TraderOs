"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Pause, Play, RotateCcw, Shuffle, SkipForward } from "lucide-react";
import {
  aggregate, barsFromTicks, candleMetrics, combine, forwardStats, heikinAshi, labelSwings, linearRegression, linearScale, niceTicks,
  patternsAt, pointAndFigure, renko, simulateSeries, simulateTicks, structureOf, swings, validateOhlc, type Bar, type PatternId,
} from "@/lib/academy/charts";
import { Button } from "@/components/ui/button";
import { BrickChart, CandleChart, PfChart, fmtPrice, useWidth, type Annotation } from "@/components/academy/charts/candle-chart";
import { cn } from "@/lib/cn";
import { Choice, NumberField, Readout, Readouts, Result, Slider, WidgetFrame, num, signed, useReducedMotion } from "./kit";

type FrameProps = { title: string; caption: string };

const clock = (s: number) => {
  const t = Math.floor(s);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

// ── L1. Trades print, the chart builds ──────────────────────────────────────

const TAPE = simulateTicks({ seed: 61, trades: 240, start: 50, spread: 0.02, vol: 0.0009, meanGap: 1.6 });

export function TradeTape({ title, caption }: FrameProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(12);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(4);
  const [view, setView] = useState<"candles" | "line">("candles");
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setShown((s) => Math.min(TAPE.length, s + 1)), Math.round(1000 / speed));
    return () => clearInterval(id);
  }, [playing, speed]);
  useEffect(() => { if (shown >= TAPE.length) setPlaying(false); }, [shown]);
  const ticks = TAPE.slice(0, shown);
  const bars = useMemo(() => barsFromTicks(ticks, { kind: "time", seconds: 30 }), [ticks]);
  const last = ticks[ticks.length - 1];
  const cur = bars[bars.length - 1];
  const recent = ticks.slice(-6).reverse();
  const done = shown >= TAPE.length;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-[1fr_minmax(0,15rem)]">
        <CandleChart bars={bars} mode={view} label="Simulated chart built from the trades so far, one bar per 30 seconds" height={170} volume barLabel={(i) => clock(i * 30)} />
        <div className="min-w-0 rounded-md border border-line bg-panel p-2">
          <p className="px-1 pb-1 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">Trade prints (newest first)</p>
          <ul className="space-y-0.5" aria-label="Latest simulated trades">
            {recent.map((t, k) => (
              <li key={shown - k} className={cn("flex justify-between gap-2 rounded px-1 py-0.5 font-mono text-xs tabular", k === 0 && "bg-accent-soft")}>
                <span className="text-fg-subtle">{clock(t.t)}</span>
                <span className={t.side === "buy" ? "text-up" : "text-down"}>{t.price.toFixed(2)}</span>
                <span className="text-fg-muted">{t.size}</span>
                <span className="text-[11px] text-fg-subtle">{t.side === "buy" ? "at ask" : "at bid"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Readouts cols={4}>
        <Readout label="Best bid (buyers wait)" value={last ? last.bid.toFixed(2) : "—"} tone="up" />
        <Readout label="Best ask (sellers wait)" value={last ? last.ask.toFixed(2) : "—"} tone="down" />
        <Readout label="Last traded price" value={last ? last.price.toFixed(2) : "—"} />
        <Readout label="Trades printed" value={`${shown} of ${TAPE.length}`} />
      </Readouts>
      <div className="flex flex-wrap items-end gap-2">
        <Button variant="primary" onClick={() => setPlaying((p) => !p)} disabled={done} aria-pressed={playing}>
          {playing ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />} {playing ? "Pause" : "Play"}
        </Button>
        <Button onClick={() => setShown((s) => Math.min(TAPE.length, s + 1))} disabled={done}><SkipForward className="size-3.5" aria-hidden /> Next trade</Button>
        <Button onClick={() => setShown((s) => Math.min(TAPE.length, s + 20))} disabled={done}>Next 20 trades</Button>
        <Button variant="ghost" onClick={() => { setPlaying(false); setShown(12); }}><RotateCcw className="size-3.5" aria-hidden /> Reset</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Draw the trades as" value={view} onChange={setView} options={[{ id: "candles", label: "Candles" }, { id: "line", label: "Line of closes" }]} />
        <Slider label="Playback speed" value={speed} min={1} max={10} step={1} onChange={setSpeed} format={(n) => `${n} trades a second`} hint={reduced ? "Your device asks for less motion, so nothing plays until you press Play." : undefined} />
      </div>
      <Result>
        {cur && last
          ? `The newest bar opened at ${cur.o.toFixed(2)} and has traded between ${cur.l.toFixed(2)} and ${cur.h.toFixed(2)}; its close is not final until its 30 seconds are over. The last trade, ${last.size} at ${last.price.toFixed(2)}, happened ${last.side === "buy" ? "at the ask: a buyer accepted a seller's price" : "at the bid: a seller accepted a buyer's price"}. The chart shows none of the orders that are waiting, nor who traded or why.`
          : "Press Play or Next trade to print trades."}
      </Result>
    </WidgetFrame>
  );
}

// ── L2. One series, many chart types ────────────────────────────────────────

type ChartType = "line" | "ohlc" | "candles" | "ha" | "renko" | "pf" | "tick" | "volume" | "range";

const TYPE_INFO: Record<ChartType, { label: string; keeps: string; changes: string; hides: string; param: { label: string; min: number; max: number; step: number; def: number; fmt: (n: number) => string } }> = {
  line: { label: "Line", keeps: "The close of each period, in time order.", changes: "Nothing is transformed.", hides: "Opens, highs, lows and everything that happened inside each period.", param: { label: "Seconds per point", min: 30, max: 300, step: 30, def: 60, fmt: (n) => `${n} s` } },
  ohlc: { label: "OHLC bars", keeps: "Open, high, low and close of each period.", changes: "Nothing: the same four prices as a candle, drawn as ticks on a line.", hides: "The order of trades inside the period (did the high come first or the low?).", param: { label: "Seconds per bar", min: 30, max: 300, step: 30, def: 60, fmt: (n) => `${n} s` } },
  candles: { label: "Candles", keeps: "Open, high, low and close, with the body coloured by direction.", changes: "Nothing.", hides: "The path inside the period, and the volume unless shown separately.", param: { label: "Seconds per candle", min: 30, max: 300, step: 30, def: 60, fmt: (n) => `${n} s` } },
  ha: { label: "Heikin-Ashi", keeps: "The broad direction, smoothed.", changes: "Every value is an average: HA close = (O+H+L+C)/4 and HA open is the midpoint of the previous HA candle.", hides: "The real open and close. The last HA close is usually NOT a price anyone traded at.", param: { label: "Seconds per candle", min: 30, max: 300, step: 30, def: 60, fmt: (n) => `${n} s` } },
  renko: { label: "Renko", keeps: "Moves of at least one box size.", changes: "Time is removed: a brick prints only after a move of one box (two to reverse).", hides: "Time, volume, wicks and every move smaller than a box.", param: { label: "Box size", min: 0.05, max: 0.4, step: 0.05, def: 0.1, fmt: (n) => n.toFixed(2) } },
  pf: { label: "Point & figure", keeps: "Rises (X) and falls (O) of at least one box.", changes: "Time is removed; a new column needs a three-box reversal.", hides: "Time, volume and small moves.", param: { label: "Box size", min: 0.05, max: 0.3, step: 0.05, def: 0.05, fmt: (n) => n.toFixed(2) } },
  tick: { label: "Tick bars", keeps: "Every bar has the same number of trades.", changes: "The clock is replaced by trade count: busy periods get more bars.", hides: "How much clock time each bar took.", param: { label: "Trades per bar", min: 10, max: 100, step: 10, def: 30, fmt: (n) => `${n} trades` } },
  volume: { label: "Volume bars", keeps: "Every bar has (about) the same traded volume.", changes: "The clock is replaced by volume.", hides: "Clock time; a bar can take seconds or an hour.", param: { label: "Volume per bar", min: 2000, max: 20000, step: 2000, def: 6000, fmt: (n) => `${n.toLocaleString("en-US")} units` } },
  range: { label: "Range bars", keeps: "Every bar spans the same price range.", changes: "A bar closes when its range is used up.", hides: "Clock time; quiet periods may form no bar at all.", param: { label: "Range per bar", min: 0.1, max: 0.6, step: 0.05, def: 0.2, fmt: (n) => n.toFixed(2) } },
};
const TYPES = Object.keys(TYPE_INFO) as ChartType[];
const SAME = simulateTicks({ seed: 62, trades: 1600, start: 100, spread: 0.02, vol: 0.0011, meanGap: 2 });

export function ChartTypes({ title, caption }: FrameProps) {
  const [type, setType] = useState<ChartType>("ha");
  const [params, setParams] = useState<Record<ChartType, number>>(() => Object.fromEntries(TYPES.map((t) => [t, TYPE_INFO[t].param.def])) as Record<ChartType, number>);
  const p = params[type];
  const info = TYPE_INFO[type];
  const reference = useMemo(() => barsFromTicks(SAME, { kind: "time", seconds: 60 }), []);
  const view = useMemo(() => {
    if (type === "line" || type === "ohlc" || type === "candles") return { bars: barsFromTicks(SAME, { kind: "time", seconds: p }) };
    if (type === "ha") return { bars: heikinAshi(barsFromTicks(SAME, { kind: "time", seconds: p })) };
    if (type === "tick") return { bars: barsFromTicks(SAME, { kind: "tick", trades: p }) };
    if (type === "volume") return { bars: barsFromTicks(SAME, { kind: "volume", size: p }) };
    if (type === "range") return { bars: barsFromTicks(SAME, { kind: "range", range: p }) };
    const closes = reference.map((b) => b.c);
    if (type === "renko") return { bricks: renko(closes, p) };
    return { columns: pointAndFigure(closes, p, 3) };
  }, [type, p, reference]);
  const realLast = SAME[SAME.length - 1].price;
  const count = view.bars?.length ?? view.bricks?.length ?? view.columns?.length ?? 0;
  const unit = view.bricks ? "bricks" : view.columns ? "columns" : "bars";
  const haLast = type === "ha" && view.bars ? view.bars[view.bars.length - 1] : null;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Chart type" value={type} onChange={setType} options={TYPES.map((t) => ({ id: t, label: TYPE_INFO[t].label }))} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] text-fg-subtle">Reference: 1-minute candles of the same simulated trades</p>
          <CandleChart bars={reference} label="Reference simulated 1-minute candlestick chart" height={160} barLabel={(i) => `${i}m`} />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] text-fg-subtle">{info.label}: {count} {unit} from the same {SAME.length.toLocaleString("en-US")} trades</p>
          {view.bars && <CandleChart bars={view.bars} mode={type === "line" ? "line" : type === "ohlc" ? "ohlc" : "candles"} label={`Simulated ${info.label} chart`} height={160} barLabel={(i) => `#${i + 1}`} />}
          {view.bricks && <BrickChart bricks={view.bricks} label="Simulated Renko chart" height={180} />}
          {view.columns && <PfChart columns={view.columns} box={p} label="Simulated point-and-figure chart" height={180} />}
        </div>
      </div>
      <Slider label={info.param.label} value={p} min={info.param.min} max={info.param.max} step={info.param.step} onChange={(n) => setParams((s) => ({ ...s, [type]: n }))} format={info.param.fmt} />
      <Readouts cols={3}>
        <Readout label="Keeps" value={<span className="font-sans text-[13px]">{info.keeps}</span>} />
        <Readout label="Transforms" value={<span className="font-sans text-[13px]">{info.changes}</span>} />
        <Readout label="Hides or removes" value={<span className="font-sans text-[13px]">{info.hides}</span>} tone="warn" />
      </Readouts>
      <Result tone={type === "ha" ? "warn" : "info"}>
        {haLast
          ? `The last real trade was at ${realLast.toFixed(2)}. The last Heikin-Ashi candle "closes" at ${haLast.c.toFixed(3)} and "opens" at ${haLast.o.toFixed(3)}: averages, not prices anyone traded. Never read a Heikin-Ashi close as the market price or use it to work out a fill.`
          : `${info.label}: ${count} ${unit} from the same trades as the reference chart. Change the ${info.param.label.toLowerCase()} and watch how much the picture changes while the trades stay the same.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L3. Build a candle ──────────────────────────────────────────────────────

type Target = "free" | "bear-upper" | "doji" | "bull-maru" | "long-lower";
const TARGETS: { id: Target; label: string; test: (b: Bar) => boolean; hint: string }[] = [
  { id: "free", label: "Free build", test: () => true, hint: "Any valid candle." },
  { id: "bear-upper", label: "Bearish, long upper wick", test: (b) => { const m = candleMetrics(b); return m.direction === "bearish" && m.upperWick >= 2 * m.body && m.body > 0; }, hint: "Close below open, and an upper wick at least twice the body." },
  { id: "doji", label: "Doji", test: (b) => { const m = candleMetrics(b); return m.range > 0 && m.bodyRatio <= 0.1; }, hint: "Open and close almost equal: body at most 10% of the range." },
  { id: "bull-maru", label: "Bullish marubozu", test: (b) => { const m = candleMetrics(b); return m.direction === "bullish" && m.bodyRatio >= 0.9; }, hint: "Close above open, with almost no wicks (body 90%+ of the range)." },
  { id: "long-lower", label: "Long lower wick", test: (b) => { const m = candleMetrics(b); return m.lowerWick >= 2 * m.body && m.upperWick <= 0.25 * m.range && m.range > 0; }, hint: "Lower wick at least twice the body, small upper wick." },
];

function shapeName(b: Bar): string {
  const m = candleMetrics(b);
  if (m.range === 0) return "a flat line: one price all period";
  if (m.bodyRatio <= 0.1) return "doji-like: open and close almost equal";
  if (m.bodyRatio >= 0.9) return `${m.direction} marubozu-like: almost all body`;
  if (m.lowerWick >= 2 * m.body && m.upperWick <= 0.25 * m.range) return "hammer-shaped (called a hammer after a fall, a hanging man after a rise)";
  if (m.upperWick >= 2 * m.body && m.lowerWick <= 0.25 * m.range) return "shooting-star-shaped (called an inverted hammer after a fall)";
  return `an ordinary ${m.direction} candle`;
}

export function CandleBuilder({ title, caption }: FrameProps) {
  const [o, setO] = useState(100);
  const [h, setH] = useState(104);
  const [l, setL] = useState(98);
  const [c, setC] = useState(103);
  const [target, setTarget] = useState<Target>("free");
  const [lastValid, setLastValid] = useState<Bar>({ t: 0, o: 100, h: 104, l: 98, c: 103, v: 0 });
  const cand: Bar = { t: 0, o, h, l, c, v: 0 };
  const errors = validateOhlc(cand);
  useEffect(() => { if (errors.length === 0) setLastValid({ t: 0, o, h, l, c, v: 0 }); }, [o, h, l, c, errors.length]);
  const b = errors.length ? lastValid : cand;
  const m = candleMetrics(b);
  const t = TARGETS.find((x) => x.id === target)!;
  const hit = errors.length === 0 && t.test(cand);
  const [ref, width] = useWidth<HTMLDivElement>();
  const H = 200;
  const lo = Math.min(b.l, 90), hi = Math.max(b.h, 110);
  const y = linearScale(lo, hi, H - 10, 10);
  const cx = Math.min(width / 2, 120);
  const ticks = niceTicks(lo, hi, 4);
  const tone = m.direction === "bearish" ? "down" : "up";
  return (
    <WidgetFrame title={title} caption={caption} source="sample">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Open" value={o} onChange={setO} min={1} max={1000} step={0.5} />
          <NumberField label="High" value={h} onChange={setH} min={1} max={1000} step={0.5} />
          <NumberField label="Low" value={l} onChange={setL} min={1} max={1000} step={0.5} />
          <NumberField label="Close" value={c} onChange={setC} min={1} max={1000} step={0.5} />
        </div>
        <div ref={ref} className="min-w-0 rounded-md border border-line bg-panel" role="img" aria-label={`Your candle: open ${fmtPrice(b.o, 2)}, high ${fmtPrice(b.h, 2)}, low ${fmtPrice(b.l, 2)}, close ${fmtPrice(b.c, 2)}`}>
          <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block w-full" style={{ fontSize: "11px", height: H }} aria-hidden>
            {ticks.map((v) => <g key={v}><line x1={0} x2={width - 50} y1={y(v)} y2={y(v)} className="stroke-line" /><text x={width - 46} y={y(v) + 4} className="fill-fg-subtle">{v}</text></g>)}
            <line x1={cx} x2={cx} y1={y(b.h)} y2={y(b.l)} className={tone === "up" ? "stroke-up" : "stroke-down"} strokeWidth={2} />
            <rect x={cx - 16} width={32} y={Math.min(y(b.o), y(b.c))} height={Math.max(1.5, Math.abs(y(b.o) - y(b.c)))} className={tone === "up" ? "fill-up" : "fill-down"} />
            <text x={cx + 24} y={y(b.h) + 4} className="fill-fg-muted">High</text>
            <text x={cx + 24} y={y(b.l) + 4} className="fill-fg-muted">Low</text>
            <text x={Math.max(2, cx - 64)} y={y(b.o) + 4} className="fill-fg-muted">Open</text>
            <text x={Math.max(2, cx - 64)} y={y(b.c) + (Math.abs(y(b.o) - y(b.c)) < 12 ? 16 : 4)} className="fill-fg-muted">Close</text>
          </svg>
        </div>
      </div>
      <Readouts cols={3}>
        <Readout label="Body |close − open|" value={num(m.body)} />
        <Readout label="Range high − low" value={num(m.range)} />
        <Readout label="Body ÷ range" value={`${Math.round(m.bodyRatio * 100)}%`} />
        <Readout label="Upper wick" value={num(m.upperWick)} />
        <Readout label="Lower wick" value={num(m.lowerWick)} />
        <Readout label="Direction" value={m.direction} tone={m.direction === "bullish" ? "up" : m.direction === "bearish" ? "down" : undefined} />
      </Readouts>
      <Choice label="Challenge: build this candle" value={target} onChange={setTarget} options={TARGETS.map((x) => ({ id: x.id, label: x.label }))} />
      <Result tone={errors.length ? "bad" : hit && target !== "free" ? "good" : "info"}>
        {errors.length
          ? `Not a possible candle: ${errors.join(" ")} The drawing still shows your last valid candle.`
          : target === "free"
            ? `Valid. Your candle is ${shapeName(cand)}. A shape on its own says what happened in one period, not what happens next.`
            : hit
              ? `Done: that is a valid "${t.label}" candle (${shapeName(cand)}).`
              : `Valid, but not yet "${t.label}". Target: ${t.hint}`}
      </Result>
    </WidgetFrame>
  );
}

// ── L4. Pattern lab: shapes in pure noise ───────────────────────────────────

const LAB_PATTERNS: { id: PatternId; label: string }[] = [
  { id: "hammer", label: "Hammer" },
  { id: "shooting-star", label: "Shooting star" },
  { id: "bullish-engulfing", label: "Bullish engulfing" },
  { id: "bearish-engulfing", label: "Bearish engulfing" },
  { id: "doji", label: "Doji" },
  { id: "inside-bar", label: "Inside bar" },
  { id: "morning-star", label: "Morning star" },
  { id: "three-white-soldiers", label: "Three soldiers" },
];

export function PatternLab({ title, caption }: FrameProps) {
  const [seed, setSeed] = useState(401);
  const [pat, setPat] = useState<PatternId>("hammer");
  const [horizon, setHorizon] = useState(5);
  const bars = useMemo(() => simulateSeries({ seed, bars: 500, regimes: false, vol: 0.012, start: 80 }).bars, [seed]);
  const hits = useMemo(() => bars.map((_, i) => i).filter((i) => patternsAt(bars, i).includes(pat)), [bars, pat]);
  const after = forwardStats(bars, hits, horizon);
  const base = forwardStats(bars, bars.map((_, i) => i), horizon);
  const label = LAB_PATTERNS.find((x) => x.id === pat)!.label;
  const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Pattern to find" value={pat} onChange={setPat} options={LAB_PATTERNS} />
      <CandleChart bars={bars} label={`500 simulated random-walk candles with every ${label} shape highlighted`} height={190} controls initialWindow={120} highlight={hits} barLabel={(i) => `${i + 1}`} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Look this many bars ahead" value={horizon} min={1} max={20} step={1} onChange={setHorizon} format={(n) => `${n} bar${n === 1 ? "" : "s"}`} />
        <div className="flex items-end"><Button onClick={() => setSeed((s) => s + 1)}><Shuffle className="size-3.5" aria-hidden /> New random series</Button></div>
      </div>
      <Readouts cols={3}>
        <Readout label={`${label} shapes found`} value={after.count} sub="in 500 bars" />
        <Readout label={`Higher ${horizon} bars after a ${label}`} value={pct(after.upShare)} sub={after.meanPct === null ? "no cases" : `average ${signed(after.meanPct)}%`} />
        <Readout label={`Higher ${horizon} bars after ANY bar`} value={pct(base.upShare)} sub={base.meanPct === null ? "" : `average ${signed(base.meanPct)}%`} />
      </Readouts>
      <Result tone="warn">
        {after.count === 0
          ? `No ${label} shapes in this series. Try another series: how often a shape appears depends on the exact definition used.`
          : `${after.count} ${label} shapes appeared in a series built from coin flips, which has no memory at all. Any difference between the two "higher" figures is luck, and with only ${after.count} cases it can easily be large. Press "New random series" a few times and watch it change sign. That is why a pattern needs out-of-sample tests, costs and many cases before it counts as evidence.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L5. Timeframes: re-aggregation and the daily candle ─────────────────────

const PER_DAY = 78; // 5-minute bars in a 6.5-hour session
const DAYS = 10;
const INTRADAY = simulateSeries({ seed: 65, bars: PER_DAY * DAYS, vol: 0.0028, trend: 0.0006, switchChance: 0.012, start: 40 }).bars;
const TF: { id: "5m" | "15m" | "1h" | "1d"; label: string; k: number }[] = [
  { id: "5m", label: "5 minutes", k: 1 }, { id: "15m", label: "15 minutes", k: 3 }, { id: "1h", label: "1 hour", k: 12 }, { id: "1d", label: "1 day", k: PER_DAY },
];
const timeOf = (barInDay: number) => { const m = 9 * 60 + 30 + barInDay * 5; return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`; };

function byDay(bars: readonly Bar[], k: number) {
  const out: { bar: Bar; day: number; first: number }[] = [];
  for (let d = 0; d < DAYS; d++) {
    const day = bars.slice(d * PER_DAY, (d + 1) * PER_DAY);
    aggregate(day, k).bars.forEach((b, j) => out.push({ bar: b, day: d, first: j * k }));
  }
  return out;
}

function slopeWord(bars: readonly Bar[], n: number) {
  const ys = bars.slice(-n).map((b) => b.c);
  if (ys.length < 3) return "too few bars";
  const { slope } = linearRegression(ys);
  const pctPerBar = (slope / ys[ys.length - 1]) * 100;
  const total = pctPerBar * (ys.length - 1);
  return Math.abs(total) < 0.6 ? "flat" : total > 0 ? "rising" : "falling";
}

export function Timeframes({ title, caption }: FrameProps) {
  const [tf, setTf] = useState<(typeof TF)[number]["id"]>("1h");
  const [elapsed, setElapsed] = useState(40);
  const k = TF.find((x) => x.id === tf)!.k;
  const rows = useMemo(() => byDay(INTRADAY, k), [k]);
  const bars = rows.map((r) => r.bar);
  const lastDay = INTRADAY.slice((DAYS - 1) * PER_DAY);
  const soFar = combine(lastDay.slice(0, elapsed));
  const verdicts = TF.map((x) => {
    const bs = byDay(INTRADAY, x.k).map((r) => r.bar);
    return { ...x, word: slopeWord(bs, 20), n: Math.min(20, bs.length) };
  });
  const words = new Set(verdicts.map((v) => v.word));
  const [ref, width] = useWidth<HTMLDivElement>();
  const H = 150;
  const y = linearScale(Math.min(...lastDay.map((b) => b.l)), Math.max(...lastDay.map((b) => b.h)), H - 8, 8);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Timeframe (one bar =)" value={tf} onChange={setTf} options={TF} />
      <CandleChart
        bars={bars}
        label={`Ten simulated trading days drawn with ${TF.find((x) => x.id === tf)!.label} bars`}
        height={180}
        controls={bars.length > 60}
        initialWindow={Math.min(bars.length, 120)}
        barLabel={(i) => (k === PER_DAY ? `Day ${i + 1}` : `D${rows[i].day + 1} ${timeOf(rows[i].first)}`)}
      />
      <Readouts cols={4}>
        {verdicts.map((v) => <Readout key={v.id} label={`${v.label}: last ${v.n} bars`} value={v.word} tone={v.word === "rising" ? "up" : v.word === "falling" ? "down" : undefined} />)}
      </Readouts>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] text-fg-subtle">Day {DAYS}, 5-minute bars, up to {timeOf(elapsed)}</p>
          <CandleChart bars={lastDay} label={`Day ${DAYS} in simulated 5-minute bars`} height={130} fadeAfter={elapsed - 1} barLabel={timeOf} />
        </div>
        <div ref={ref} className="min-w-0 rounded-md border border-line bg-panel" role="img" aria-label={`Daily candle so far: open ${soFar.o.toFixed(2)}, high ${soFar.h.toFixed(2)}, low ${soFar.l.toFixed(2)}, close ${soFar.c.toFixed(2)}`}>
          <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} className="block w-full" style={{ fontSize: "11px", height: H }} aria-hidden>
            <text x={6} y={14} className="fill-fg-subtle">Daily candle so far</text>
            <line x1={width / 2} x2={width / 2} y1={y(soFar.h)} y2={y(soFar.l)} className={soFar.c >= soFar.o ? "stroke-up" : "stroke-down"} strokeWidth={2} />
            <rect x={width / 2 - 12} width={24} y={Math.min(y(soFar.o), y(soFar.c))} height={Math.max(1.5, Math.abs(y(soFar.o) - y(soFar.c)))} className={soFar.c >= soFar.o ? "fill-up" : "fill-down"} />
          </svg>
        </div>
      </div>
      <Slider label="Time of day on day 10" value={elapsed} min={1} max={PER_DAY} step={1} onChange={setElapsed} format={(n) => `${timeOf(n)} (${n} of ${PER_DAY} bars)`} />
      <Result tone={words.size > 1 ? "warn" : "info"}>
        {`So far today: open ${soFar.o.toFixed(2)} (the first 5-minute open), high ${soFar.h.toFixed(2)} and low ${soFar.l.toFixed(2)} (the extremes of all ${elapsed} bars), last ${soFar.c.toFixed(2)}. Until the session ends, the daily candle is unfinished. `}
        {words.size > 1
          ? `The same prices read as ${[...words].join(" and ")} depending on the timeframe. Pick the timeframe before you look, not the one that agrees with you.`
          : `Here all four timeframes agree (${[...words][0]}), which is less common than it looks.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L6. Mark the structure yourself ─────────────────────────────────────────

const STRUCT = simulateSeries({ seed: 23, bars: 64, vol: 0.013, trend: 0.005, switchChance: 0.05, start: 60 }).bars;

export function StructureMarker({ title, caption }: FrameProps) {
  const [kind, setKind] = useState<"high" | "low">("high");
  const [marks, setMarks] = useState<{ index: number; kind: "high" | "low" }[]>([]);
  const [checked, setChecked] = useState(false);
  const [k, setK] = useState(3);
  const answer = useMemo(() => labelSwings(swings(STRUCT, k)), [k]);
  const pick = ({ index }: { index: number }) => {
    setMarks((ms) => ms.some((m) => m.index === index && m.kind === kind) ? ms.filter((m) => !(m.index === index && m.kind === kind)) : [...ms, { index, kind }]);
  };
  const matched = marks.filter((m) => answer.some((s) => s.kind === m.kind && Math.abs(s.index - m.index) <= 1));
  const missed = answer.filter((s) => !marks.some((m) => m.kind === s.kind && Math.abs(s.index - m.index) <= 1));
  const structure = structureOf(swings(STRUCT, k));
  const annotations: Annotation[] = [
    ...marks.map((m): Annotation => ({ kind: "marker", index: m.index, price: m.kind === "high" ? STRUCT[m.index].h : STRUCT[m.index].l, label: m.kind === "high" ? "H?" : "L?", tone: "accent", pos: m.kind === "high" ? "above" : "below" })),
    ...(checked ? answer.map((s): Annotation => ({ kind: "marker", index: s.index, price: s.price, label: s.label === "first" ? (s.kind === "high" ? "SH" : "SL") : s.label, tone: s.kind === "high" ? "down" : "up", pos: s.kind === "high" ? "above" : "below" })) : []),
  ];
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <p className="text-[13px] text-fg-muted">Click (or move the cursor with the arrow keys and press Enter) on each bar you think is a swing high, then switch and mark the swing lows. Nothing is labelled until you check.</p>
      <Choice label="I am marking" value={kind} onChange={setKind} options={[{ id: "high", label: "Swing highs" }, { id: "low", label: "Swing lows" }]} />
      <CandleChart bars={STRUCT} label="Simulated candlestick chart for marking swing highs and lows" height={210} onPick={pick} annotations={annotations} barLabel={(i) => `${i + 1}`} />
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => setChecked(true)} disabled={marks.length < 2 || checked}><Check className="size-3.5" aria-hidden /> Check my marks</Button>
        <Button variant="ghost" onClick={() => { setMarks([]); setChecked(false); }}><RotateCcw className="size-3.5" aria-hidden /> Clear and start again</Button>
      </div>
      <Slider label="Rule used for the answer: bars on each side" value={k} min={2} max={5} step={1} onChange={setK} format={(n) => `${n} bars`} hint="A swing high here is a bar whose high beats the highs of this many bars on each side. Other rules give other answers." />
      {checked && (
        <Readouts cols={3}>
          <Readout label="Your marks that match" value={`${matched.length} of ${marks.length}`} tone="up" />
          <Readout label="Swings you did not mark" value={missed.length} tone={missed.length ? "warn" : undefined} />
          <Readout label="Structure by this rule" value={structure} />
        </Readouts>
      )}
      <Result tone={checked ? (missed.length === 0 && matched.length === marks.length ? "good" : "info") : "info"}>
        {!checked
          ? `${marks.length} mark${marks.length === 1 ? "" : "s"} so far (${marks.filter((m) => m.kind === "high").length} highs, ${marks.filter((m) => m.kind === "low").length} lows). Mark at least two, then check.`
          : `With a ${k}-bar rule there are ${answer.length} swings, labelled against the previous swing of the same kind (HH higher high, LH lower high, HL higher low, LL lower low). ${matched.length} of your ${marks.length} marks are within one bar of one. Change the rule and the answer changes: swing structure depends on a definition, so state yours before you trade on it. The last ${k} bars cannot be swings yet, because the bars that would confirm them have not happened.`}
      </Result>
    </WidgetFrame>
  );
}
