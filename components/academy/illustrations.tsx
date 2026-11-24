import type { ReactNode } from "react";
import type { IllustrationId } from "@/lib/academy/types";
import { cn } from "@/lib/cn";

/*
  Static teaching illustrations for the lessons. They are drawings, not data:
  every one is shown with an "Illustration" label and a caption, has no price
  numbers unless the lesson gives them, and uses only the theme tokens
  (fill-up / fill-down for direction, accent for what to look at).

  Most are drawn in price units with <Candles>, which scales them into the
  box, so new diagrams are a few lines of data.
*/

type C = { o: number; h: number; l: number; c: number; /** Drawn faded: context, not the point of the picture. */ ctx?: boolean };
const cd = (o: number, h: number, l: number, c: number, ctx?: boolean): C => ({ o, h, l, c, ctx });

const LBL = "fill-fg";
const SUB = "fill-fg-muted";

function Svg({ title, w = 360, h = 200, children, className }: { title: string; w?: number; h?: number; children: ReactNode; className?: string }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title} className={cn("h-auto w-full", className)} fontFamily="var(--font-sans)">
      <defs>
        <marker id="ill-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 z" className="fill-fg-muted" />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

function T({ x, y, children, a = "middle", cls = LBL, size = 12, weight }: { x: number; y: number; children: ReactNode; a?: "start" | "middle" | "end"; cls?: string; size?: number; weight?: number }) {
  return <text x={x} y={y} textAnchor={a} className={cls} fontSize={size} fontWeight={weight}>{children}</text>;
}

/** One candle in SVG coordinates (y grows downwards). */
function Candle({ x, w, yo, yh, yl, yc, faded }: { x: number; w: number; yo: number; yh: number; yl: number; yc: number; faded?: boolean }) {
  const up = yc <= yo;
  return (
    <g opacity={faded ? 0.38 : 1}>
      <line x1={x} x2={x} y1={yh} y2={yl} className={up ? "stroke-up" : "stroke-down"} strokeWidth={Math.max(1.25, w / 12)} />
      <rect x={x - w / 2} width={w} y={Math.min(yo, yc)} height={Math.max(1.5, Math.abs(yo - yc))} rx={1} className={up ? "fill-up" : "fill-down"} />
    </g>
  );
}

/** A run of candles in price units, scaled into the box [x0, x0+w] × [y0, y0+h]. */
function Candles({ data, x0, y0, w, h, lo, hi, gap = 0.45 }: { data: C[]; x0: number; y0: number; w: number; h: number; lo?: number; hi?: number; gap?: number }) {
  const min = lo ?? Math.min(...data.map((d) => d.l)), max = hi ?? Math.max(...data.map((d) => d.h));
  const y = (p: number) => y0 + ((max - p) / (max - min || 1)) * h;
  const step = w / data.length;
  const bw = Math.min(26, step * (1 - gap));
  return (
    <g>
      {data.map((d, i) => (
        <Candle key={i} x={x0 + step * (i + 0.5)} w={bw} yo={y(d.o)} yh={y(d.h)} yl={y(d.l)} yc={y(d.c)} faded={d.ctx} />
      ))}
    </g>
  );
}

// ── Candle basics ────────────────────────────────────────────────────────────

function Bracket({ x, y1, y2, label, tone = SUB }: { x: number; y1: number; y2: number; label: string; tone?: string }) {
  return (
    <g>
      <path d={`M${x},${y1} h5 V${y2} h-5`} className="fill-none stroke-fg-subtle" strokeWidth={1} />
      <T x={x + 9} y={(y1 + y2) / 2 + 4} a="start" cls={tone} size={11}>{label}</T>
    </g>
  );
}

function Tick({ x, y, label, side = "left" }: { x: number; y: number; label: string; side?: "left" | "right" }) {
  const dx = side === "left" ? -1 : 1;
  return (
    <g>
      <line x1={x} x2={x + dx * 10} y1={y} y2={y} className="stroke-fg-subtle" strokeDasharray="2 2" />
      <T x={x + dx * 13} y={y + 4} a={side === "left" ? "end" : "start"} size={11} cls={LBL}>{label}</T>
    </g>
  );
}

function CandleAnatomy() {
  const one = (cx: number, bull: boolean) => {
    const yh = 44, yl = 200, top = 84, bot = 160;
    const yo = bull ? bot : top, yc = bull ? top : bot;
    return (
      <g>
        <Candle x={cx} w={30} yo={yo} yh={yh} yl={yl} yc={yc} />
        <Tick x={cx - 2} y={yh} label="High" />
        <Tick x={cx - 17} y={top} label={bull ? "Close" : "Open"} />
        <Tick x={cx - 17} y={bot} label={bull ? "Open" : "Close"} />
        <Tick x={cx - 2} y={yl} label="Low" />
        <Bracket x={cx + 20} y1={yh} y2={top - 2} label="Upper wick" />
        <Bracket x={cx + 20} y1={top} y2={bot} label="Body" tone={bull ? "fill-up" : "fill-down"} />
        <Bracket x={cx + 20} y1={bot + 2} y2={yl} label="Lower wick" />
      </g>
    );
  };
  return (
    <Svg title="Anatomy of a candle. A bullish candle on the left: open at the bottom of the body, close at the top. A bearish candle on the right: open at the top, close at the bottom. Both have a high at the top of the upper wick and a low at the bottom of the lower wick." h={224}>
      <T x={100} y={20} weight={600} cls="fill-up">Bullish candle</T>
      <T x={100} y={34} cls={SUB} size={10.5}>closed above its open</T>
      <T x={270} y={20} weight={600} cls="fill-down">Bearish candle</T>
      <T x={270} y={34} cls={SUB} size={10.5}>closed below its open</T>
      {one(88, true)}
      {one(258, false)}
    </Svg>
  );
}

function CandleTypes() {
  const items: { x: number; d: C; name: string; sub: string; cls: string }[] = [
    { x: 60, d: cd(3, 9.2, 2.2, 8.4), name: "Bullish", sub: "close above open", cls: "fill-up" },
    { x: 180, d: cd(8.4, 9.2, 2.2, 3), name: "Bearish", sub: "close below open", cls: "fill-down" },
    { x: 300, d: cd(5.6, 9.2, 2.2, 5.66), name: "Doji", sub: "open ≈ close", cls: LBL },
  ];
  return (
    <Svg title="Three candles: a bullish candle with a tall green body, a bearish candle with a tall red body, and a doji whose open and close are almost equal so the body is a thin line." h={176}>
      {items.map((it) => (
        <g key={it.name}>
          <Candles data={[it.d]} x0={it.x - 30} y0={14} w={60} h={110} lo={2} hi={9.5} gap={0.55} />
          <T x={it.x} y={146} weight={600} cls={it.cls}>{it.name}</T>
          <T x={it.x} y={163} size={11} cls={SUB}>{it.sub}</T>
        </g>
      ))}
    </Svg>
  );
}

function OhlcToCandle() {
  const yh = 30, yl = 170, yo = 130, yc = 64;
  return (
    <Svg title="The same four prices drawn as an OHLC bar and as a candle. On the bar, the open is a tick on the left and the close a tick on the right. On the candle, the open and close are the ends of the body." h={196}>
      <T x={95} y={16} weight={600}>OHLC bar</T>
      <line x1={95} x2={95} y1={yh} y2={yl} className="stroke-up" strokeWidth={2.5} />
      <line x1={80} x2={95} y1={yo} y2={yo} className="stroke-up" strokeWidth={2.5} />
      <line x1={95} x2={110} y1={yc} y2={yc} className="stroke-up" strokeWidth={2.5} />
      <T x={70} y={yo + 4} a="end" size={11}>Open: left tick</T>
      <T x={120} y={yc + 4} a="start" size={11}>Close: right tick</T>
      <T x={102} y={yh + 4} a="start" size={11} cls={SUB}>High</T>
      <T x={102} y={yl + 2} a="start" size={11} cls={SUB}>Low</T>
      <line x1={186} x2={226} y1={100} y2={100} className="stroke-fg-muted" strokeWidth={1.25} markerEnd="url(#ill-arrow)" />
      <T x={206} y={92} size={10.5} cls={SUB}>same prices</T>
      <T x={280} y={16} weight={600}>Candle</T>
      <Candle x={280} w={28} yo={yo} yh={yh} yl={yl} yc={yc} />
      <T x={300} y={yc + 4} a="start" size={11}>Close</T>
      <T x={300} y={yo + 4} a="start" size={11}>Open</T>
      <T x={287} y={yh + 4} a="start" size={11} cls={SUB}>High</T>
      <T x={287} y={yl + 2} a="start" size={11} cls={SUB}>Low</T>
      <T x={180} y={192} size={11} cls={SUB}>The body fills the space between open and close.</T>
    </Svg>
  );
}

// ── Candle patterns (lesson 4) ───────────────────────────────────────────────

const FALL = [cd(9.6, 9.9, 8.6, 8.8, true), cd(8.8, 9.0, 7.7, 7.9, true), cd(7.9, 8.1, 6.9, 7.1, true)];
const RISE = [cd(4.6, 5.9, 4.4, 5.7, true), cd(5.7, 6.9, 5.5, 6.7, true), cd(6.7, 7.9, 6.5, 7.7, true)];

const PATTERNS: Record<string, { title: string; data: C[]; mark: number }> = {
  "pattern-hammer": { title: "Hammer: after a fall, a small body near the top and a long lower wick", data: [...FALL, cd(6.6, 7.0, 5.1, 6.9)], mark: 1 },
  "pattern-hanging-man": { title: "Hanging man: the hammer shape after a rise", data: [...RISE, cd(8.1, 8.4, 6.5, 8.3)], mark: 1 },
  "pattern-inverted-hammer": { title: "Inverted hammer: after a fall, a small body near the bottom and a long upper wick", data: [...FALL, cd(6.6, 8.4, 6.5, 6.9)], mark: 1 },
  "pattern-shooting-star": { title: "Shooting star: the inverted-hammer shape after a rise", data: [...RISE, cd(8.1, 9.9, 7.8, 7.85)], mark: 1 },
  "pattern-doji": { title: "Doji: open and close almost equal", data: [cd(6.4, 7.4, 6.2, 7.2, true), cd(7.2, 7.6, 6.6, 6.9, true), cd(7.0, 7.9, 6.1, 7.03)], mark: 1 },
  "pattern-marubozu": { title: "Marubozu: almost all body, tiny or no wicks", data: [cd(6.4, 6.9, 6.1, 6.7, true), cd(6.7, 6.9, 6.2, 6.4, true), cd(6.4, 8.9, 6.38, 8.88)], mark: 1 },
  "pattern-pin-bar": { title: "Pin bars: one very long wick and a small body at the other end", data: [cd(7.2, 7.5, 5.0, 7.4), cd(6.8, 9.2, 6.6, 6.7)], mark: 2 },
  "pattern-engulfing": { title: "Bullish engulfing: a green body that covers the previous red body", data: [...FALL.slice(0, 2), cd(7.6, 7.8, 6.9, 7.0), cd(6.8, 8.1, 6.6, 7.95)], mark: 2 },
  "pattern-harami": { title: "Harami: a small body inside the previous larger body, opposite colour", data: [cd(9.2, 9.4, 8.4, 8.6, true), cd(8.6, 8.8, 5.9, 6.1), cd(6.6, 7.6, 6.4, 7.3)], mark: 2 },
  "pattern-inside-bar": { title: "Inside bar: the whole range inside the previous candle's range", data: [cd(5.8, 6.4, 5.4, 6.1, true), cd(6.0, 8.7, 5.5, 8.3), cd(8.0, 8.2, 6.6, 6.9)], mark: 2 },
  "pattern-outside-bar": { title: "Outside bar: a higher high and a lower low than the previous candle", data: [cd(6.8, 7.3, 6.5, 7.1, true), cd(7.1, 7.8, 6.7, 7.5), cd(7.6, 8.5, 5.9, 6.3)], mark: 2 },
  "pattern-morning-star": { title: "Morning star: a large red candle, a small body, then a large green candle closing past the middle of the first", data: [cd(9.9, 10.1, 9.0, 9.2, true), cd(9.2, 9.3, 7.0, 7.2), cd(6.9, 7.1, 6.4, 6.7), cd(6.9, 8.7, 6.8, 8.6)], mark: 3 },
  "pattern-three-soldiers": { title: "Three white soldiers: three large green candles in a row, each opening inside the previous body", data: [cd(5.6, 5.8, 4.6, 4.8, true), cd(4.9, 6.4, 4.8, 6.3), cd(5.9, 7.6, 5.8, 7.5), cd(7.1, 8.8, 7.0, 8.7)], mark: 3 },
};

function PatternArt({ id }: { id: string }) {
  const p = PATTERNS[id];
  const n = p.data.length, w = 120, step = w / n;
  return (
    <Svg title={`Illustration. ${p.title}.`} w={120} h={96}>
      <rect x={step * (n - p.mark) + 2} y={3} width={step * p.mark - 4} height={90} rx={6} className="fill-accent-soft stroke-accent/50" strokeDasharray="3 3" />
      <Candles data={p.data} x0={0} y0={8} w={w} h={80} gap={0.5} />
    </Svg>
  );
}

// ── Timeframes and structure ─────────────────────────────────────────────────

function TimeframeAggregation() {
  const small = [cd(5, 6.2, 4.6, 5.9), cd(5.9, 7.4, 5.7, 7.1), cd(7.1, 7.3, 6.0, 6.3), cd(6.3, 8.6, 6.2, 8.2), cd(8.2, 8.4, 7.0, 7.4), cd(7.4, 7.9, 6.8, 7.7)];
  const lo = 4.4, hi = 8.8, y0 = 34, h = 130;
  const y = (p: number) => y0 + ((hi - p) / (hi - lo)) * h;
  const merged = { o: 5, h: 8.6, l: 4.6, c: 7.7 };
  return (
    <Svg title="Six shorter candles merge into one longer candle. Its open is the first open, its high the highest high, its low the lowest low and its close the last close." h={208}>
      <T x={92} y={18} weight={600}>Six shorter candles</T>
      <Candles data={small} x0={10} y0={y0} w={170} h={h} lo={lo} hi={hi} />
      <line x1={10} x2={330} y1={y(8.6)} y2={y(8.6)} className="stroke-fg-subtle" strokeDasharray="3 3" />
      <line x1={10} x2={330} y1={y(4.6)} y2={y(4.6)} className="stroke-fg-subtle" strokeDasharray="3 3" />
      <line x1={190} x2={226} y1={100} y2={100} className="stroke-fg-muted" strokeWidth={1.25} markerEnd="url(#ill-arrow)" />
      <T x={280} y={18} weight={600}>One longer candle</T>
      <Candle x={262} w={28} yo={y(merged.o)} yh={y(merged.h)} yl={y(merged.l)} yc={y(merged.c)} />
      <T x={282} y={y(merged.h) + 4} a="start" size={10.5}>High = highest high</T>
      <T x={282} y={y(merged.c) + 4} a="start" size={10.5}>Close = last close</T>
      <T x={282} y={y(merged.o) + 4} a="start" size={10.5}>Open = first open</T>
      <T x={282} y={y(merged.l) + 12} a="start" size={10.5}>Low = lowest low</T>
      <T x={180} y={200} size={11} cls={SUB}>Volume adds up; the detail inside the period is lost.</T>
    </Svg>
  );
}

/** A zigzag through points in [0..1]², drawn into a panel, with labels at the turning points. */
function Zig({ x0, y0, w, h, pts, labels, tone = "stroke-fg" }: { x0: number; y0: number; w: number; h: number; pts: [number, number][]; labels?: (string | null)[]; tone?: string }) {
  const P = pts.map(([u, v]) => [x0 + u * w, y0 + (1 - v) * h] as const);
  return (
    <g>
      <polyline points={P.map((p) => p.join(",")).join(" ")} className={cn("fill-none", tone)} strokeWidth={2} strokeLinejoin="round" />
      {labels?.map((l, i) => {
        if (!l) return null;
        const [x, yy] = P[i];
        const above = /H$/.test(l);
        const tone2 = l === "HH" || l === "HL" ? "fill-up" : l === "LH" || l === "LL" ? "fill-down" : SUB;
        return (
          <g key={i}>
            <circle cx={x} cy={yy} r={3} className="fill-fg" />
            <T x={x} y={above ? yy - 8 : yy + 17} size={11} weight={600} cls={tone2}>{l}</T>
          </g>
        );
      })}
    </g>
  );
}

function SwingStructure() {
  return (
    <Svg title="Swing structure. In an uptrend each swing high is higher than the last (HH) and each swing low is higher than the last (HL). In a downtrend the highs are lower (LH) and the lows are lower (LL)." h={210}>
      <T x={88} y={16} weight={600} cls="fill-up">Uptrend</T>
      <T x={88} y={30} size={10.5} cls={SUB}>higher highs, higher lows</T>
      <Zig x0={12} y0={48} w={156} h={130} pts={[[0, 0.05], [0.2, 0.45], [0.36, 0.22], [0.56, 0.68], [0.72, 0.44], [0.92, 0.92], [1, 0.8]]} labels={["L", "H", "HL", "HH", "HL", "HH", null]} />
      <line x1={180} x2={180} y1={20} y2={196} className="stroke-line-strong" />
      <T x={272} y={16} weight={600} cls="fill-down">Downtrend</T>
      <T x={272} y={30} size={10.5} cls={SUB}>lower highs, lower lows</T>
      <Zig x0={194} y0={48} w={156} h={130} pts={[[0, 0.95], [0.2, 0.55], [0.36, 0.78], [0.56, 0.32], [0.72, 0.56], [0.92, 0.08], [1, 0.2]]} labels={["H", "L", "LH", "LL", "LH", "LL", null]} />
      <T x={180} y={206} size={10.5} cls={SUB}>Labels compare each swing with the previous swing of the same kind.</T>
    </Svg>
  );
}

function TrendVsRange() {
  return (
    <Svg title="Trend versus range. On the left price makes progress in one direction. On the right price moves back and forth between a ceiling and a floor without net progress." h={190}>
      <T x={88} y={16} weight={600}>Trend</T>
      <T x={88} y={30} size={10.5} cls={SUB}>net progress one way</T>
      <Zig x0={12} y0={44} w={156} h={120} pts={[[0, 0.05], [0.18, 0.38], [0.32, 0.22], [0.52, 0.6], [0.66, 0.45], [0.86, 0.85], [1, 0.75]]} />
      <line x1={14} y1={160} x2={160} y2={56} className="stroke-accent" strokeWidth={1.25} strokeDasharray="5 4" markerEnd="url(#ill-arrow)" />
      <line x1={180} x2={180} y1={20} y2={176} className="stroke-line-strong" />
      <T x={272} y={16} weight={600}>Range</T>
      <T x={272} y={30} size={10.5} cls={SUB}>back and forth, little net progress</T>
      <line x1={194} x2={350} y1={62} y2={62} className="stroke-down" strokeDasharray="4 3" />
      <line x1={194} x2={350} y1={150} y2={150} className="stroke-up" strokeDasharray="4 3" />
      <Zig x0={194} y0={62} w={156} h={88} pts={[[0, 0.4], [0.14, 0.95], [0.3, 0.06], [0.46, 0.9], [0.62, 0.1], [0.8, 0.98], [1, 0.5]]} />
      <T x={348} y={56} a="end" size={10.5} cls="fill-down">ceiling</T>
      <T x={348} y={166} a="end" size={10.5} cls="fill-up">floor</T>
      <T x={180} y={186} size={10.5} cls={SUB}>The same market can trend on one timeframe and range on another.</T>
    </Svg>
  );
}

function SupportResistance() {
  return (
    <Svg title="Support and resistance drawn as zones. Price turned down several times inside a band near the top (resistance) and turned up several times inside a band near the bottom (support). The turns happen at slightly different prices, which is why a zone fits better than a single line." h={196}>
      <rect x={10} y={38} width={340} height={22} className="fill-down-soft" />
      <rect x={10} y={136} width={340} height={22} className="fill-up-soft" />
      <T x={16} y={32} a="start" size={11} weight={600} cls="fill-down">Resistance zone (a ceiling)</T>
      <T x={16} y={174} a="start" size={11} weight={600} cls="fill-up">Support zone (a floor)</T>
      <Zig x0={10} y0={40} w={340} h={116} pts={[[0, 0.55], [0.1, 0.95], [0.22, 0.12], [0.36, 0.88], [0.5, 0.04], [0.64, 1], [0.78, 0.16], [0.9, 0.84], [1, 0.4]]} />
      <T x={180} y={192} size={10.5} cls={SUB}>Turns land at slightly different prices: think in zones, not exact lines.</T>
    </Svg>
  );
}

function LinearVsLog() {
  const vals = [10, 20, 40, 80];
  const panel = (x0: number, title: string, sub: string, ys: number[], ticks: { p: number; y: number }[]) => (
    <g>
      <T x={x0 + 80} y={16} weight={600}>{title}</T>
      <T x={x0 + 80} y={30} size={10.5} cls={SUB}>{sub}</T>
      {ticks.map((t) => (
        <g key={t.p}>
          <line x1={x0 + 26} x2={x0 + 160} y1={t.y} y2={t.y} className="stroke-line" />
          <T x={x0 + 22} y={t.y + 4} a="end" size={10.5} cls={SUB}>{t.p}</T>
        </g>
      ))}
      <polyline points={ys.map((yy, i) => `${x0 + 36 + i * 40},${yy}`).join(" ")} className="fill-none stroke-accent" strokeWidth={2} />
      {ys.map((yy, i) => <circle key={i} cx={x0 + 36 + i * 40} cy={yy} r={3} className="fill-accent" />)}
    </g>
  );
  const top = 46, bot = 172;
  const lin = (p: number) => bot - ((p - 0) / 80) * (bot - top);
  const lg = (p: number) => bot - (Math.log2(p / 10) / 3) * (bot - top);
  return (
    <Svg title="The same prices, 10, 20, 40 and 80, each double the last. On a linear scale each step looks bigger than the one before. On a log scale every doubling takes the same height, so the line is straight." h={200}>
      {panel(4, "Linear scale", "equal steps = equal amounts", vals.map(lin), [0, 20, 40, 60, 80].map((p) => ({ p, y: lin(p) })))}
      <line x1={180} x2={180} y1={20} y2={186} className="stroke-line-strong" />
      {panel(186, "Log scale", "equal steps = equal percentages", vals.map(lg), vals.map((p) => ({ p, y: lg(p) })))}
      <T x={180} y={196} size={10.5} cls={SUB}>Each point is double the one before.</T>
    </Svg>
  );
}

function Gaps() {
  const lo = 3, hi = 10, y0 = 40, h = 120;
  const y = (p: number) => y0 + ((hi - p) / (hi - lo)) * h;
  const up = [cd(4, 5.2, 3.8, 5), cd(5, 5.6, 4.6, 5.4), cd(7, 7.8, 6.8, 7.6), cd(7.6, 7.8, 6.4, 6.6), cd(6.6, 6.8, 5.2, 5.4)];
  const dn = [cd(9, 9.4, 8.2, 8.6), cd(8.6, 8.9, 7.8, 8.0), cd(6, 6.4, 5.2, 5.6), cd(5.6, 6.8, 5.5, 6.6), cd(6.6, 8.2, 6.5, 8.1)];
  return (
    <Svg title="A gap up and a gap down. In a gap up the next period trades entirely above the previous one, leaving an empty space on the chart. Later candles fall back into the space: the gap is filled. A gap down is the mirror image." h={196}>
      <T x={88} y={16} weight={600} cls="fill-up">Gap up</T>
      <rect x={12} y={y(6.8)} width={156} height={y(5.6) - y(6.8)} className="fill-accent-soft" />
      <T x={20} y={y(6.8) - 4} a="start" size={10.5} cls="fill-accent-strong">gap</T>
      <Candles data={up} x0={12} y0={y0} w={156} h={h} lo={lo} hi={hi} />
      <T x={140} y={y(5.2) + 22} size={10.5} cls={SUB}>filled</T>
      <line x1={180} x2={180} y1={20} y2={182} className="stroke-line-strong" />
      <T x={272} y={16} weight={600} cls="fill-down">Gap down</T>
      <rect x={194} y={y(7.8)} width={156} height={y(6.4) - y(7.8)} className="fill-accent-soft" />
      <T x={202} y={y(6.4) + 13} a="start" size={10.5} cls="fill-accent-strong">gap</T>
      <Candles data={dn} x0={194} y0={y0} w={156} h={h} lo={lo} hi={hi} />
      <T x={322} y={y(8.2) - 10} size={10.5} cls={SUB}>filled</T>
      <T x={180} y={192} size={10.5} cls={SUB}>Filled: price later trades back to the previous close.</T>
    </Svg>
  );
}

function GapStop() {
  const lo = 3, hi = 10, y0 = 34, h = 130;
  const y = (p: number) => y0 + ((hi - p) / (hi - lo)) * h;
  const bars = [cd(8.2, 9.0, 7.9, 8.7, true), cd(8.7, 9.3, 8.4, 8.9, true), cd(8.9, 9.1, 8.3, 8.5, true), cd(4.6, 5.4, 3.8, 4.9)];
  const stop = 7.2;
  return (
    <Svg title="A stop jumped by a gap. The stop is below the previous close. The next period opens far below the stop, so the first price available is the open. The order fills there, and the loss is larger than planned." h={200}>
      <Candles data={bars} x0={20} y0={y0} w={220} h={h} lo={lo} hi={hi} />
      <line x1={20} x2={250} y1={y(stop)} y2={y(stop)} className="stroke-warn" strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={24} y={y(stop) - 6} a="start" size={11} weight={600} cls="fill-warn">Stop level</T>
      <circle cx={212} cy={y(4.6)} r={4} className="fill-down stroke-panel" />
      <T x={258} y={y(stop) + 4} a="start" size={11} cls={LBL}>Planned exit</T>
      <T x={258} y={y(4.6) + 4} a="start" size={11} weight={600} cls="fill-down">Actual fill: the open</T>
      <path d={`M250,${y(stop)} h4 V${y(4.6)} h-4`} className="fill-none stroke-down" />
      <T x={258} y={(y(stop) + y(4.6)) / 2 + 4} a="start" size={10.5} cls={SUB}>extra loss</T>
      <T x={180} y={20} size={11} cls={SUB}>No trades happened between the close and the open.</T>
      <T x={180} y={194} size={10.5} cls={SUB}>A stop becomes an order to exit at the next available price, not at the stop price.</T>
    </Svg>
  );
}

// ── Registry ─────────────────────────────────────────────────────────────────

const ART: Record<IllustrationId, () => ReactNode> = {
  "candle-anatomy": CandleAnatomy,
  "candle-types": CandleTypes,
  "ohlc-to-candle": OhlcToCandle,
  "pattern-hammer": () => <PatternArt id="pattern-hammer" />,
  "pattern-hanging-man": () => <PatternArt id="pattern-hanging-man" />,
  "pattern-inverted-hammer": () => <PatternArt id="pattern-inverted-hammer" />,
  "pattern-shooting-star": () => <PatternArt id="pattern-shooting-star" />,
  "pattern-doji": () => <PatternArt id="pattern-doji" />,
  "pattern-marubozu": () => <PatternArt id="pattern-marubozu" />,
  "pattern-pin-bar": () => <PatternArt id="pattern-pin-bar" />,
  "pattern-engulfing": () => <PatternArt id="pattern-engulfing" />,
  "pattern-harami": () => <PatternArt id="pattern-harami" />,
  "pattern-inside-bar": () => <PatternArt id="pattern-inside-bar" />,
  "pattern-outside-bar": () => <PatternArt id="pattern-outside-bar" />,
  "pattern-morning-star": () => <PatternArt id="pattern-morning-star" />,
  "pattern-three-soldiers": () => <PatternArt id="pattern-three-soldiers" />,
  "timeframe-aggregation": TimeframeAggregation,
  "swing-structure": SwingStructure,
  "trend-vs-range": TrendVsRange,
  "support-resistance": SupportResistance,
  "linear-vs-log": LinearVsLog,
  "gaps": Gaps,
  "gap-stop": GapStop,
};

export const ILLUSTRATION_IDS = Object.keys(ART) as IllustrationId[];

/** The bare drawing (used inside cards, where the card supplies the text). */
export function IllustrationArt({ id }: { id: IllustrationId }) {
  const El = ART[id];
  return El ? <El /> : null;
}

/** A drawing in a figure with an "Illustration" label and a caption. */
export function Illustration({ id, caption }: { id: IllustrationId; caption: string }) {
  if (!ART[id]) return null;
  return (
    <figure className="max-w-[74ch] overflow-hidden rounded-lg border border-line bg-surface px-3 pb-3 pt-2.5 sm:px-4" data-illustration={id}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="t-label rounded-full border border-line-strong px-2 py-0.5 text-[10px]">Illustration</span>
        <span className="t-small text-xs text-fg-subtle">Not real data</span>
      </div>
      <div className="mx-auto max-w-[540px]">
        <IllustrationArt id={id} />
      </div>
      <figcaption className="t-small mt-2">{caption}</figcaption>
    </figure>
  );
}
