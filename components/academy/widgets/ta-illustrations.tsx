import type { ReactNode } from "react";
import { ema, sma } from "@/lib/academy/charts";
import { bollinger, rsi } from "@/lib/academy/indicators";
import { cn } from "@/lib/cn";

/*
  Static, labelled diagrams for the Technical Analysis track, one per core
  concept. They are registered as widgets so lessons can place them, but
  they are drawings, not data: each is framed exactly like the shared
  illustrations ("Illustration · Not real data" and a caption), carries no
  prices, and uses only theme tokens. Curves are drawn from simple made-up
  shapes (sines and straight lines), never from market data.
*/

type FigProps = { title: string; caption: string };
const W = 360;
const LBL = "fill-fg", SUB = "fill-fg-muted";

function Frame({ id, title, caption, label, h, children }: FigProps & { id: string; label: string; h: number; children: ReactNode }) {
  return (
    <figure className="max-w-[74ch] overflow-hidden rounded-lg border border-line bg-surface px-3 pb-3 pt-2.5 sm:px-4" data-illustration={id} aria-label={title}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="t-label rounded-full border border-line-strong px-2 py-0.5 text-[10px]">Illustration</span>
        <span className="t-small text-xs text-fg-subtle">Not real data</span>
      </div>
      <div className="mx-auto max-w-[540px]">
        <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label={label} className="h-auto w-full" fontFamily="var(--font-sans)">
          <defs>
            <marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 z" className="fill-fg-muted" />
            </marker>
          </defs>
          {children}
        </svg>
      </div>
      <figcaption className="t-small mt-2">{caption}</figcaption>
    </figure>
  );
}

function T({ x, y, children, a = "middle", cls = LBL, size = 12, weight }: { x: number; y: number; children: ReactNode; a?: "start" | "middle" | "end"; cls?: string; size?: number; weight?: number }) {
  return <text x={x} y={y} textAnchor={a} className={cls} fontSize={size} fontWeight={weight}>{children}</text>;
}

/** Path through values (nulls break the line), mapped into a box. */
function path(vals: readonly (number | null)[], x0: number, x1: number, top: number, bottom: number, lo: number, hi: number) {
  let d = "", pen = false;
  const n = Math.max(1, vals.length - 1);
  vals.forEach((v, i) => {
    if (v == null) { pen = false; return; }
    const x = x0 + ((x1 - x0) * i) / n, y = bottom - ((v - lo) / (hi - lo)) * (bottom - top);
    d += `${pen ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    pen = true;
  });
  return d;
}
const range = <T,>(n: number, f: (i: number) => T): T[] => Array.from({ length: n }, (_, i) => f(i));
const Line = ({ d, cls = "stroke-fg", w = 2, dash }: { d: string; cls?: string; w?: number; dash?: string }) => <path d={d} className={cn("fill-none", cls)} strokeWidth={w} strokeDasharray={dash} strokeLinejoin="round" />;

// A smooth made-up price shape: up, a top, then down.
const HUMP = range(80, (i) => 50 + 38 * Math.sin((i / 79) * Math.PI) + 3 * Math.sin(i * 0.9));

// ── L1. Moving-average lag and a crossover ──────────────────────────────────

export function FigMaLag({ title, caption }: FigProps) {
  const ma = sma(HUMP, 15);
  const cross = HUMP.findIndex((v, i) => i > 45 && ma[i] !== null && v < ma[i]!);
  const xOf = (i: number) => 20 + (320 * i) / 79;
  const yOf = (v: number) => 170 - ((v - 40) / 60) * 140;
  const top = HUMP.indexOf(Math.max(...HUMP));
  return (
    <Frame id="ta-fig-ma-lag" title={title} caption={caption} h={200} label="A price line rises to a top and falls. A moving average follows it but turns later and lower. The point where price crosses below the average comes well after the top, which is the lag.">
      <Line d={path(HUMP, 20, 340, 30, 170, 40, 100)} />
      <Line d={path(ma, 20, 340, 30, 170, 40, 100)} cls="stroke-accent" w={2.5} />
      <circle cx={xOf(top)} cy={yOf(HUMP[top])} r={4} className="fill-fg" />
      <T x={xOf(top)} y={yOf(HUMP[top]) - 10}>Price top</T>
      <circle cx={xOf(cross)} cy={yOf(HUMP[cross])} r={5} className="fill-down" />
      <T x={xOf(cross) + 8} y={yOf(HUMP[cross]) + 22} a="start" cls="fill-down" weight={600}>Crossover</T>
      <line x1={xOf(top)} x2={xOf(cross)} y1={186} y2={186} className="stroke-fg-muted" strokeWidth={1.5} markerEnd="url(#ta-fig-ma-lag-arrow)" markerStart="url(#ta-fig-ma-lag-arrow)" />
      <T x={(xOf(top) + xOf(cross)) / 2} y={180} size={11} cls={SUB}>lag</T>
      <T x={24} y={22} a="start" size={11} cls="fill-accent" weight={600}>Moving average</T>
      <T x={24} y={190} a="start" size={11} cls={SUB}>Price</T>
    </Frame>
  );
}

// ── L2. RSI: a 0–100 balance of gains and losses ────────────────────────────

export function FigRsi({ title, caption }: FigProps) {
  const rise = range(60, (i) => 40 + i * 0.9 + 2.5 * Math.sin(i * 0.8));
  const r = rsi(rise, 14);
  return (
    <Frame id="ta-fig-rsi" title={title} caption={caption} h={220} label="Top: a price line rising steadily. Bottom: its RSI on a 0 to 100 scale, with lines at 30 and 70. The RSI stays above 70, in the overbought zone, for most of the rise while price keeps going up.">
      <T x={20} y={16} a="start" size={11} cls={SUB}>Price keeps rising…</T>
      <Line d={path(rise, 20, 320, 24, 84, 35, 100)} />
      <rect x={20} y={104} width={300} height={30} className="fill-down-soft" />
      <rect x={20} y={164} width={300} height={30} className="fill-up-soft" />
      <rect x={20} y={104} width={300} height={90} className="fill-none stroke-line-strong" />
      <Line d={path(r, 20, 320, 104, 194, 0, 100)} cls="stroke-accent" w={2.5} />
      <T x={326} y={108} a="start" size={11} cls={SUB}>100</T>
      <T x={326} y={138} a="start" size={11} cls={SUB}>70</T>
      <T x={326} y={168} a="start" size={11} cls={SUB}>30</T>
      <T x={326} y={198} a="start" size={11} cls={SUB}>0</T>
      <T x={26} y={146} a="start" size={11} cls="fill-accent" weight={600}>…and RSI stays above 70</T>
      <T x={180} y={214} size={11} cls={SUB}>"Overbought" is a reading, not a sell signal</T>
    </Frame>
  );
}

// ── L3. MACD from two averages ──────────────────────────────────────────────

export function FigMacd({ title, caption }: FigProps) {
  const f = ema(HUMP, 6), s = ema(HUMP, 16);
  const m = HUMP.map((_, i) => (f[i] !== null && s[i] !== null ? f[i]! - s[i]! : null));
  const sig = (() => { const first = m.findIndex((x) => x !== null); const e = ema(m.slice(first) as number[], 5); return m.map((_, i) => (i < first ? null : e[i - first])); })();
  const hist = m.map((v, i) => (v !== null && sig[i] !== null ? v - sig[i]! : null));
  const bx = (i: number) => 20 + (300 * i) / 79;
  const hy = (v: number) => 170 - (v / 14) * 40;
  return (
    <Frame id="ta-fig-macd" title={title} caption={caption} h={226} label="Top: price with a fast and a slow average. Bottom: the MACD line, which is the gap between the two averages, a signal line that smooths it, and histogram bars showing MACD minus signal. MACD crosses zero when the averages cross.">
      <Line d={path(HUMP, 20, 320, 20, 104, 40, 100)} cls="stroke-fg-subtle" w={1.5} />
      <Line d={path(f, 20, 320, 20, 104, 40, 100)} cls="stroke-accent" />
      <Line d={path(s, 20, 320, 20, 104, 40, 100)} cls="stroke-warn" />
      <T x={324} y={36} a="start" size={11} cls="fill-accent">fast</T>
      <T x={324} y={56} a="start" size={11} cls="fill-warn">slow</T>
      <line x1={20} x2={320} y1={170} y2={170} className="stroke-line-strong" strokeDasharray="4 3" />
      {hist.map((v, i) => (v === null ? null : <rect key={i} x={bx(i) - 1.5} width={3} y={Math.min(hy(v), 170)} height={Math.abs(hy(v) - 170)} className={v >= 0 ? "fill-up" : "fill-down"} opacity={0.6} />))}
      <Line d={path(m, 20, 320, 130, 210, -14, 14)} cls="stroke-accent" />
      <Line d={path(sig, 20, 320, 130, 210, -14, 14)} cls="stroke-warn" w={1.5} />
      <T x={324} y={174} a="start" size={11} cls={SUB}>0</T>
      <T x={22} y={124} a="start" size={11} weight={600}>MACD = fast − slow</T>
      <T x={22} y={222} a="start" size={11} cls={SUB}>Bars: MACD − signal</T>
    </Frame>
  );
}

// ── L4. Stochastic: where the close sits in the range ───────────────────────

export function FigStoch({ title, caption }: FigProps) {
  const bars = [[60, 30, 150, 120], [110, 60, 160, 80], [90, 40, 130, 70], [70, 50, 140, 120], [120, 70, 165, 100], [100, 52, 120, 64]];
  return (
    <Frame id="ta-fig-stoch" title={title} caption={caption} h={200} label="Six candles inside a box from the lowest low to the highest high of the period. The last close sits near the top of the box, at about 80 percent of the range, which is a stochastic reading of about 80.">
      <rect x={36} y={30} width={196} height={136} className="fill-accent-soft stroke-accent" strokeDasharray="4 3" />
      {bars.map(([o, hi, lo, c], i) => {
        const x = 56 + i * 32, up = c < o;
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={hi} y2={lo} className={up ? "stroke-up" : "stroke-down"} strokeWidth={1.5} />
            <rect x={x - 7} width={14} y={Math.min(o, c)} height={Math.max(2, Math.abs(o - c))} className={up ? "fill-up" : "fill-down"} />
          </g>
        );
      })}
      <line x1={232} x2={262} y1={56} y2={56} className="stroke-fg" strokeWidth={2} />
      <T x={268} y={60} a="start" weight={600}>Close</T>
      <T x={268} y={36} a="start" size={11} cls={SUB}>Highest high</T>
      <T x={268} y={168} a="start" size={11} cls={SUB}>Lowest low</T>
      <line x1={250} x2={250} y1={164} y2={60} className="stroke-fg-muted" markerEnd="url(#ta-fig-stoch-arrow)" />
      <T x={268} y={112} a="start" size={12} cls="fill-accent" weight={600}>%K ≈ 80</T>
      <T x={180} y={192} size={11} cls={SUB}>%K = 100 × (close − low) ÷ (high − low)</T>
    </Frame>
  );
}

// ── L5. Bollinger Bands: squeeze and expansion ──────────────────────────────

export function FigBands({ title, caption }: FigProps) {
  const xs = range(90, (i) => 60 + (i < 45 ? 1.2 * Math.sin(i * 1.3) : 9 * Math.sin(i * 0.45) + 0.15 * (i - 45)));
  const b = bollinger(xs, 12, 2);
  return (
    <Frame id="ta-fig-bands" title={title} caption={caption} h={196} label="A price line with bands two standard deviations either side of its moving average. In a quiet stretch the bands squeeze close together; when price starts swinging, they widen.">
      <Line d={path(b.upper, 20, 340, 24, 160, 40, 82)} cls="stroke-info" w={1.5} />
      <Line d={path(b.lower, 20, 340, 24, 160, 40, 82)} cls="stroke-info" w={1.5} />
      <Line d={path(b.mid, 20, 340, 24, 160, 40, 82)} cls="stroke-fg-subtle" w={1.25} dash="4 3" />
      <Line d={path(xs, 20, 340, 24, 160, 40, 82)} />
      <T x={90} y={70} size={12} cls="fill-accent" weight={600}>Squeeze</T>
      <T x={90} y={84} size={11} cls={SUB}>quiet: bands narrow</T>
      <T x={270} y={182} size={12} cls="fill-accent" weight={600}>Expansion</T>
      <T x={24} y={186} a="start" size={11} cls={SUB}>Bands = average ± 2 sd</T>
    </Frame>
  );
}

// ── L5. True range ──────────────────────────────────────────────────────────

export function FigTrueRange({ title, caption }: FigProps) {
  return (
    <Frame id="ta-fig-true-range" title={title} caption={caption} h={190} label="Yesterday's close is well below today's bar because price gapped up. Today's high minus low is small, but the true range runs from yesterday's close to today's high, so it counts the gap.">
      <line x1={70} x2={70} y1={110} y2={160} className="stroke-down" strokeWidth={1.5} />
      <rect x={62} y={120} width={16} height={30} className="fill-down" />
      <line x1={50} x2={190} y1={150} y2={150} className="stroke-fg-muted" strokeDasharray="4 3" />
      <T x={46} y={154} a="end" size={11} cls={SUB}>prev close</T>
      <line x1={150} x2={150} y1={36} y2={86} className="stroke-up" strokeWidth={1.5} />
      <rect x={142} y={46} width={16} height={30} className="fill-up" />
      <line x1={186} x2={186} y1={36} y2={86} className="stroke-fg-muted" strokeWidth={1.5} markerEnd="url(#ta-fig-true-range-arrow)" markerStart="url(#ta-fig-true-range-arrow)" />
      <T x={194} y={64} a="start" size={11} cls={SUB}>high − low</T>
      <line x1={250} x2={250} y1={36} y2={150} className="stroke-accent" strokeWidth={2.5} markerEnd="url(#ta-fig-true-range-arrow)" markerStart="url(#ta-fig-true-range-arrow)" />
      <T x={258} y={98} a="start" cls="fill-accent" weight={600}>True range</T>
      <T x={258} y={114} a="start" size={11} cls={SUB}>includes the gap</T>
      <T x={180} y={182} size={11} cls={SUB}>ATR = Wilder average of true ranges</T>
    </Frame>
  );
}

// ── L6. VWAP and OBV ────────────────────────────────────────────────────────

export function FigVwapObv({ title, caption }: FigProps) {
  const vols = [9, 7, 5, 3, 3, 4, 3, 2, 3, 4, 6, 8];
  const px = [50, 54, 57, 56, 58, 60, 59, 61, 60, 58, 55, 53];
  let pv = 0, vv = 0;
  const vw = px.map((p, i) => { pv += p * vols[i]; vv += vols[i]; return pv / vv; });
  let o = 0;
  const ob = px.map((p, i) => { if (i > 0) o += p > px[i - 1] ? vols[i] : p < px[i - 1] ? -vols[i] : 0; return o; });
  const x = (i: number) => 30 + i * 26;
  return (
    <Frame id="ta-fig-vwap-obv" title={title} caption={caption} h={232} label="Top: price through one session with its volume-weighted average price, which leans toward the prices where most volume traded, early in the session. Bottom: on-balance volume, which steps up on up closes and down on down closes.">
      <T x={20} y={14} a="start" size={11} cls={SUB}>One session</T>
      <Line d={path(px, 30, 316, 24, 96, 48, 63)} />
      <Line d={path(vw, 30, 316, 24, 96, 48, 63)} cls="stroke-accent" w={2.5} />
      <T x={322} y={58} a="start" size={11} cls="fill-accent" weight={600}>VWAP</T>
      {vols.map((v, i) => <rect key={i} x={x(i) - 6} width={12} y={132 - v * 3} height={v * 3} className={i > 0 && px[i] < px[i - 1] ? "fill-down" : "fill-up"} opacity={0.55} />)}
      <T x={322} y={128} a="start" size={11} cls={SUB}>Volume</T>
      <Line d={path(ob, 30, 316, 150, 206, Math.min(...ob), Math.max(...ob))} cls="stroke-warn" />
      <T x={322} y={176} a="start" size={11} cls="fill-warn" weight={600}>OBV</T>
      <T x={20} y={226} a="start" size={11} cls={SUB}>OBV: + volume on up closes, − on down closes</T>
    </Frame>
  );
}

// ── L7. Divergence ──────────────────────────────────────────────────────────

export function FigDivergence({ title, caption }: FigProps) {
  return (
    <Frame id="ta-fig-divergence" title={title} caption={caption} h={220} label="Top: price makes a higher high. Bottom: the momentum indicator makes a lower high at the same two points. Lines join the two highs in each pane, sloping up on price and down on the indicator: a bearish divergence.">
      <polyline points="20,90 60,60 90,40 120,70 150,80 190,60 230,26 260,58 300,90 340,84" className="fill-none stroke-fg" strokeWidth={2} />
      <line x1={90} x2={230} y1={40} y2={26} className="stroke-down" strokeWidth={2} strokeDasharray="5 3" />
      <T x={90} y={30} size={11} cls={SUB}>High 1</T>
      <T x={230} y={16} size={11} cls="fill-down" weight={600}>Higher high</T>
      <line x1={20} x2={340} y1={110} y2={110} className="stroke-line-strong" />
      <polyline points="20,180 60,150 90,130 120,160 150,168 190,152 230,148 260,165 300,185 340,180" className="fill-none stroke-accent" strokeWidth={2} />
      <line x1={90} x2={230} y1={130} y2={148} className="stroke-down" strokeWidth={2} strokeDasharray="5 3" />
      <T x={230} y={140} size={11} cls="fill-down" weight={600} a="start">  Lower high</T>
      <T x={22} y={126} a="start" size={11} cls="fill-accent">Momentum (e.g. RSI)</T>
      <T x={180} y={212} size={11} cls={SUB}>Bearish divergence: momentum fading, not a turn signal</T>
    </Frame>
  );
}

// ── L8. Trendlines are choices ──────────────────────────────────────────────

export function FigTrendline({ title, caption }: FigProps) {
  const pts: [number, number][] = [[20, 150], [50, 120], [70, 136], [110, 92], [135, 118], [175, 70], [200, 98], [240, 56], [262, 86], [300, 66], [320, 120], [340, 132]];
  return (
    <Frame id="ta-fig-trendline" title={title} caption={caption} h={196} label="A zigzag price in an up-trend. A solid line through the first two swing lows touches a third low and is broken near the end. A dashed line through different lows has another slope and is broken at a different point: the line depends on which points you choose.">
      <polyline points={pts.map((p) => p.join(",")).join(" ")} className="fill-none stroke-fg" strokeWidth={2} />
      <line x1={20} x2={340} y1={150} y2={50} className="stroke-accent" strokeWidth={2} />
      <line x1={70} x2={340} y1={136} y2={64} className="stroke-warn" strokeWidth={2} strokeDasharray="6 4" />
      {[[20, 150, "1"], [135, 118, "2"]].map(([x, y, t]) => <g key={String(t)}><circle cx={Number(x)} cy={Number(y)} r={4.5} className="fill-accent" /><T x={Number(x)} y={Number(y) + 18} size={11} cls="fill-accent" weight={600}>{t}</T></g>)}
      <circle cx={262} cy={86} r={4.5} className="fill-none stroke-accent" strokeWidth={2} />
      <T x={262} y={104} size={11} cls={SUB}>touch</T>
      <circle cx={318} cy={118} r={5} className="fill-down" />
      <T x={312} y={142} size={11} cls="fill-down" weight={600}>break?</T>
      <T x={24} y={22} a="start" size={11} cls="fill-accent" weight={600}>Line through lows 1 and 2</T>
      <T x={24} y={38} a="start" size={11} cls="fill-warn" weight={600}>Another choice of lows</T>
      <T x={180} y={188} size={11} cls={SUB}>Same chart, different anchors, different "break"</T>
    </Frame>
  );
}

// ── L9. Head and shoulders, with its measured move ──────────────────────────

export function FigHeadShoulders({ title, caption }: FigProps) {
  return (
    <Frame id="ta-fig-head-shoulders" title={title} caption={caption} h={230} label="A head-and-shoulders shape: a left shoulder, a higher head, a right shoulder at about the same height as the left, and a neckline through the two lows between them. After a close below the neckline, the measured-move target is the head's height below the neckline.">
      <polyline points="16,150 60,80 95,120 150,36 200,118 245,82 285,124 320,190" className="fill-none stroke-fg" strokeWidth={2} />
      <line x1={40} x2={340} y1={120} y2={120} className="stroke-warn" strokeWidth={2} strokeDasharray="6 4" />
      <T x={344} y={116} a="end" size={11} cls="fill-warn" weight={600}>Neckline</T>
      <T x={60} y={70} size={11} weight={600}>Left shoulder</T>
      <T x={150} y={26} size={11} weight={600}>Head</T>
      <T x={245} y={72} size={11} weight={600}>Right shoulder</T>
      <line x1={170} x2={170} y1={38} y2={118} className="stroke-fg-muted" markerEnd="url(#ta-fig-head-shoulders-arrow)" markerStart="url(#ta-fig-head-shoulders-arrow)" />
      <T x={176} y={82} a="start" size={11} cls={SUB}>height</T>
      <line x1={330} x2={330} y1={122} y2={200} className="stroke-down" strokeWidth={2} markerEnd="url(#ta-fig-head-shoulders-arrow)" />
      <line x1={300} x2={350} y1={202} y2={202} className="stroke-down" strokeDasharray="3 3" />
      <T x={296} y={206} a="end" size={11} cls="fill-down" weight={600}>Target?</T>
      <T x={16} y={222} a="start" size={11} cls={SUB}>Target = neckline − height (often missed)</T>
    </Frame>
  );
}

// ── L9. Triangles ───────────────────────────────────────────────────────────

export function FigTriangles({ title, caption }: FigProps) {
  const panel = (x0: number, name: string, top: [number, number], bot: [number, number], zig: string) => (
    <g>
      <line x1={x0 + 6} x2={x0 + 104} y1={top[0]} y2={top[1]} className="stroke-down" strokeWidth={2} />
      <line x1={x0 + 6} x2={x0 + 104} y1={bot[0]} y2={bot[1]} className="stroke-up" strokeWidth={2} />
      <polyline points={zig} transform={`translate(${x0},0)`} className="fill-none stroke-fg" strokeWidth={1.5} />
      <T x={x0 + 55} y={156} size={12} weight={600}>{name}</T>
    </g>
  );
  return (
    <Frame id="ta-fig-triangles" title={title} caption={caption} h={196} label="Three small triangles. Ascending: a flat upper line and rising lows. Descending: falling highs and a flat lower line. Symmetrical: falling highs and rising lows that meet.">
      {panel(4, "Ascending", [40, 40], [130, 54], "6,128 22,42 38,110 56,42 72,88 90,42 104,60")}
      {panel(124, "Descending", [36, 116], [130, 130], "6,128 22,44 40,128 58,70 74,128 90,100 104,124")}
      {panel(244, "Symmetrical", [34, 82], [134, 92], "6,132 22,44 40,118 58,60 74,104 90,74 104,88")}
      <T x={180} y={184} size={11} cls={SUB}>Named by the slopes of the two lines</T>
    </Frame>
  );
}

// ── L10. Fibonacci levels and how much they cover ───────────────────────────

export function FigFibonacci({ title, caption }: FigProps) {
  const levels = [0.236, 0.382, 0.5, 0.618, 0.786];
  const y = (r: number) => 30 + r * 150; // 0% retracement at the top (the high), 100% at the low
  return (
    <Frame id="ta-fig-fibonacci" title={title} caption={caption} h={212} label="A move up from a low to a high, with retracement levels at 23.6, 38.2, 50, 61.8 and 78.6 percent drawn across. Shaded bands of plus or minus 3 points around each level together cover 30 percent of the whole retracement range.">
      <polyline points="30,180 70,140 90,150 130,80 150,95 190,30 230,90 260,110" className="fill-none stroke-fg" strokeWidth={2} />
      {levels.map((r) => (
        <g key={r}>
          <rect x={30} width={250} y={y(r - 0.03)} height={150 * 0.06} className="fill-warn-soft" />
          <line x1={30} x2={280} y1={y(r)} y2={y(r)} className="stroke-warn" strokeDasharray="4 3" />
          <T x={286} y={y(r) + 4} a="start" size={11} cls="fill-warn">{`${(r * 100).toFixed(1)}%`}</T>
        </g>
      ))}
      <T x={286} y={34} a="start" size={11} cls={SUB}>0% (high)</T>
      <T x={286} y={184} a="start" size={11} cls={SUB}>100% (low)</T>
      <circle cx={260} cy={110} r={4.5} className="fill-accent" />
      <T x={20} y={204} a="start" size={11} cls={SUB}>Shaded ±3 points: 30% of all possible pullbacks</T>
    </Frame>
  );
}

// ── L11. Timeframes for context and timing ──────────────────────────────────

export function FigTimeframes({ title, caption }: FigProps) {
  const rows = [
    { name: "Higher", role: "context: which way?", y: 40, pts: "40,64 120,46 200,40 280,24" },
    { name: "Middle", role: "setup", y: 100, pts: "40,120 80,104 110,116 160,96 190,108 240,90 280,98" },
    { name: "Lower", role: "timing", y: 160, pts: "40,176 60,166 75,174 95,160 112,170 135,156 155,166 180,150 200,162 225,148 250,158 280,146" },
  ];
  return (
    <Frame id="ta-fig-timeframes" title={title} caption={caption} h={212} label="Three stacked charts of the same market. The higher timeframe shows one smooth up-move and gives context. The middle one shows the setup. The lower one shows many small swings and is used only for timing.">
      {rows.map((r) => (
        <g key={r.name}>
          <rect x={30} y={r.y - 4} width={260} height={46} rx={6} className="fill-panel stroke-line" />
          <polyline points={r.pts} className="fill-none stroke-fg" strokeWidth={1.75} />
          <T x={298} y={r.y + 14} a="start" size={12} weight={600}>{r.name}</T>
          <T x={298} y={r.y + 30} a="start" size={10.5} cls={SUB}>{r.role}</T>
        </g>
      ))}
      <T x={30} y={22} a="start" size={11} cls={SUB}>One market, three bar lengths</T>
      <T x={30} y={206} a="start" size={11} cls={SUB}>Fix each timeframe's job before you look</T>
    </Frame>
  );
}

// ── L11. Redundancy: three indicators, one input ────────────────────────────

export function FigRedundancy({ title, caption }: FigProps) {
  return (
    <Frame id="ta-fig-redundancy" title={title} caption={caption} h={190} label="One box, the last 14 closes, feeds three boxes: RSI, the stochastic and rate of change. All three then point to the same conclusion, which is one piece of evidence counted three times, not three independent votes.">
      <rect x={14} y={70} width={100} height={46} rx={8} className="fill-accent-soft stroke-accent" />
      <T x={64} y={90} weight={600}>Last 14</T>
      <T x={64} y={106} weight={600}>closes</T>
      {[["RSI", 30], ["Stochastic", 84], ["Rate of change", 138]].map(([name, y]) => (
        <g key={String(name)}>
          <line x1={114} x2={170} y1={93} y2={Number(y) + 18} className="stroke-fg-muted" markerEnd="url(#ta-fig-redundancy-arrow)" />
          <rect x={172} y={Number(y)} width={120} height={36} rx={8} className="fill-panel stroke-line-strong" />
          <T x={232} y={Number(y) + 22} size={12}>{name}</T>
          <T x={300} y={Number(y) + 22} a="start" cls="fill-up" weight={600}>↑</T>
        </g>
      ))}
      <T x={180} y={186} size={11} cls={SUB}>Three "agreeing" signals, one source</T>
    </Frame>
  );
}

// ── L12. A rule you can test ────────────────────────────────────────────────

export function FigRule({ title, caption }: FigProps) {
  const steps = ["Entry rule", "Exit rule", "Costs", "Size", "Unseen data"];
  return (
    <Frame id="ta-fig-rule" title={title} caption={caption} h={150} label="Five boxes in a row, joined by arrows: entry rule, exit rule, costs, size, then a test on unseen data. A rule is testable only when every box is written down before the test.">
      {steps.map((s, i) => {
        const x = 8 + i * 70;
        return (
          <g key={s}>
            <rect x={x} y={40} width={62} height={50} rx={8} className={i === 4 ? "fill-accent-soft stroke-accent" : "fill-panel stroke-line-strong"} />
            <T x={x + 31} y={62} size={11} weight={600}>{s.split(" ")[0]}</T>
            <T x={x + 31} y={78} size={11} weight={600}>{s.split(" ")[1] ?? ""}</T>
            {i < 4 && <line x1={x + 62} x2={x + 70} y1={65} y2={65} className="stroke-fg-muted" markerEnd="url(#ta-fig-rule-arrow)" />}
          </g>
        );
      })}
      <T x={180} y={26} size={11} cls={SUB}>Written down before any test</T>
      <T x={180} y={124} size={11} cls={SUB}>Missing a box? Then it is not a rule yet.</T>
    </Frame>
  );
}

// ── L12. Overfitting: in sample versus out of sample ───────────────────────

export function FigOverfit({ title, caption }: FigProps) {
  const many = range(12, (k) => range(40, (i) => 100 + Math.sin(i * (0.3 + k * 0.07) + k) * (4 + k) + (k - 6) * i * 0.25));
  const best = range(40, (i) => 100 + i * 1.1 + 3 * Math.sin(i * 0.7));
  const after = range(30, (i) => best[39] + 4 * Math.sin(i * 0.5) - i * 0.25);
  return (
    <Frame id="ta-fig-overfit" title={title} caption={caption} h={210} label="Left of a dividing line, in sample: many faint equity curves from tried settings, and the best one rising strongly. Right of the line, out of sample: the same best setting goes sideways and down. The good result was mostly selected luck.">
      {many.map((m, k) => <Line key={k} d={path(m, 20, 200, 30, 170, 70, 150)} cls="stroke-fg-subtle" w={1} />)}
      <Line d={path(best, 20, 200, 30, 170, 70, 150)} cls="stroke-warn" w={2.5} />
      <Line d={path(after, 200, 340, 30, 170, 70, 150)} cls="stroke-accent" w={2.5} />
      <line x1={200} x2={200} y1={20} y2={180} className="stroke-line-strong" strokeDasharray="4 3" />
      <T x={110} y={18} size={11} weight={600}>In sample</T>
      <T x={270} y={18} size={11} weight={600}>Out of sample</T>
      <T x={30} y={44} a="start" size={11} cls="fill-warn" weight={600}>Best of many tries</T>
      <T x={270} y={60} size={11} cls="fill-accent" weight={600}>Same rule, new data</T>
      <T x={180} y={200} size={11} cls={SUB}>More tries → better-looking best → bigger fall</T>
    </Frame>
  );
}
