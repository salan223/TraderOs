import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
  Static, labelled diagrams for the Strategy Development track, one per lesson.
  Registered as widgets so lessons can place them, but they are drawings:
  each is framed "Illustration · Not real data", carries no prices or
  results, and uses theme tokens only.
*/

type FigProps = { title: string; caption: string };
const W = 360;
const SUB = "fill-fg-muted";

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

function T({ x, y, children, a = "middle", cls = "fill-fg", size = 12, weight }: { x: number; y: number; children: ReactNode; a?: "start" | "middle" | "end"; cls?: string; size?: number; weight?: number }) {
  return <text x={x} y={y} textAnchor={a} className={cls} fontSize={size} fontWeight={weight}>{children}</text>;
}
const Box = ({ x, y, w, h, cls = "fill-raised stroke-line-strong", r = 6 }: { x: number; y: number; w: number; h: number; cls?: string; r?: number }) => <rect x={x} y={y} width={w} height={h} rx={r} className={cn(cls)} strokeWidth={1.25} />;
const Arrow = ({ id, x1, y1, x2, y2, cls = "stroke-fg-muted", dash }: { id: string; x1: number; y1: number; x2: number; y2: number; cls?: string; dash?: string }) => <line x1={x1} y1={y1} x2={x2} y2={y2} className={cls} strokeWidth={1.5} strokeDasharray={dash} markerEnd={`url(#${id}-arrow)`} />;

// ── L1. Anatomy of a strategy ───────────────────────────────────────────────

export function FigStratAnatomy({ title, caption }: FigProps) {
  const id = "strat-fig-anatomy";
  const parts = ["Hypothesis", "Edge source", "Market", "Timeframe", "Entry", "Exit", "Sizing", "Filters"];
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="A strategy drawn as eight connected parts: hypothesis, edge source, market, timeframe, entry, exit, sizing and filters. The hypothesis sits at the top and every other part follows from it.">
      <Box x={110} y={8} w={140} h={30} cls="fill-accent-soft stroke-accent" />
      <T x={180} y={28} weight={600}>Hypothesis: why it works</T>
      {parts.slice(1).map((p, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const x = 10 + col * 87, y = 70 + row * 60;
        return (
          <g key={p}>
            <Box x={x} y={y} w={78} h={30} />
            <T x={x + 39} y={y + 19} size={11}>{p}</T>
            <Arrow id={id} x1={180} y1={40} x2={x + 39} y2={y - 2} cls="stroke-line-strong" />
          </g>
        );
      })}
      <T x={180} y={190} size={10} cls={SUB}>Each part must be written down before the first trade</T>
    </Frame>
  );
}

// ── L2. Where edges come from ───────────────────────────────────────────────

export function FigStratEdges({ title, caption }: FigProps) {
  const id = "strat-fig-edges";
  const src = [
    { t: "Risk premium", d: "paid for bearing risk", cls: "fill-up/20 stroke-up" },
    { t: "Behavioural", d: "others' predictable errors", cls: "fill-up/20 stroke-up" },
    { t: "Structural / flow", d: "forced or rule-bound trades", cls: "fill-up/20 stroke-up" },
    { t: "Information", d: "knowing or processing faster", cls: "fill-up/20 stroke-up" },
  ];
  return (
    <Frame id={id} title={title} caption={caption} h={210} label="Four boxes name possible edge sources: risk premium, behavioural, structural or flow, and information. A large fifth box labelled noise sits beneath them, drawn bigger to show that most apparent edges found by retail traders fall there.">
      {src.map((s, i) => {
        const x = 8 + (i % 2) * 176, y = 8 + Math.floor(i / 2) * 50;
        return (
          <g key={s.t}>
            <Box x={x} y={y} w={168} h={42} cls={s.cls} />
            <T x={x + 84} y={y + 18} size={12} weight={600}>{s.t}</T>
            <T x={x + 84} y={y + 33} size={10} cls={SUB}>{s.d}</T>
          </g>
        );
      })}
      <Box x={8} y={116} w={344} h={84} cls="fill-warn/15 stroke-warn" />
      <T x={180} y={146} size={13} weight={600}>Noise</T>
      <T x={180} y={164} size={10} cls={SUB}>a pattern that looked good in past data by chance</T>
      <T x={180} y={180} size={10} cls={SUB}>no reason it should repeat</T>
    </Frame>
  );
}

// ── L3. Vague vs exact rules ────────────────────────────────────────────────

export function FigStratRules({ title, caption }: FigProps) {
  const id = "strat-fig-rules";
  const rows = [
    ["Buy when it looks strong", "Buy at close if close > 50-bar average"],
    ["Use a sensible stop", "Stop 2 × ATR(20) below entry"],
    ["Take profits when right", "Exit at close below 20-bar low"],
    ["Bet bigger when sure", "Risk 0.5% of equity per trade"],
  ];
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="Two columns. On the left, vague rules such as buy when it looks strong. On the right, exact versions of the same rules with a number and a trigger, such as buy at the close if the close is above the 50-bar average.">
      <T x={90} y={16} weight={600} cls="fill-down">Vague: two people disagree</T>
      <T x={270} y={16} weight={600} cls="fill-up">Exact: a computer could run it</T>
      {rows.map(([a, b], i) => (
        <g key={a}>
          <Box x={4} y={26 + i * 43} w={170} h={34} cls="fill-down/10 stroke-down" />
          <T x={89} y={47 + i * 43} size={10}>{a}</T>
          <Arrow id={id} x1={176} y1={43 + i * 43} x2={184} y2={43 + i * 43} />
          <Box x={186} y={26 + i * 43} w={170} h={34} cls="fill-up/10 stroke-up" />
          <T x={271} y={47 + i * 43} size={9.5}>{b}</T>
        </g>
      ))}
    </Frame>
  );
}

// ── L4. Archetypes vs regimes ───────────────────────────────────────────────

export function FigStratArchetypes({ title, caption }: FigProps) {
  const id = "strat-fig-archetypes";
  const cols = ["Trending", "Ranging", "Choppy / random"];
  const rows: [string, string[]][] = [
    ["Trend", ["fits", "suffers", "bleeds costs"]],
    ["Mean-rev.", ["suffers", "fits", "bleeds costs"]],
    ["Breakout", ["fits", "false breaks", "bleeds costs"]],
    ["Carry", ["depends", "fits", "crash risk"]],
  ];
  const tone = (s: string) => (s === "fits" ? "fill-up/25 stroke-up" : s === "depends" ? "fill-raised stroke-line-strong" : "fill-down/15 stroke-down");
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="A grid of four strategy types against three market conditions. Trend and breakout fit trending markets, mean reversion fits ranging markets, carry fits calm markets but has crash risk. All of them lose to costs in random, choppy markets.">
      {cols.map((c, j) => <T key={c} x={130 + j * 90} y={16} size={11} weight={600}>{c}</T>)}
      {rows.map(([r, cells], i) => (
        <g key={r}>
          <T x={44} y={46 + i * 40} size={11} weight={600}>{r}</T>
          {cells.map((s, j) => (
            <g key={j}>
              <Box x={90 + j * 90} y={26 + i * 40} w={82} h={32} cls={tone(s)} />
              <T x={131 + j * 90} y={46 + i * 40} size={10}>{s}</T>
            </g>
          ))}
        </g>
      ))}
    </Frame>
  );
}

// ── L5. Same entry, different exits ─────────────────────────────────────────

export function FigStratExits({ title, caption }: FigProps) {
  const id = "strat-fig-exits";
  return (
    <Frame id={id} title={title} caption={caption} h={190} label="One entry point with a single price path after it. One exit takes a small profit early and misses the later move. A trailing exit follows the price up and leaves once it pulls back. The entry is identical; only the exit changes the result.">
      <polyline points="20,140 60,130 90,118 120,122 160,95 200,80 230,88 270,55 300,45 320,70 340,85" fill="none" className="stroke-fg-muted" strokeWidth={2} />
      <circle cx={20} cy={140} r={5} className="fill-accent" />
      <T x={24} y={160} a="start" size={10}>same entry</T>
      <circle cx={90} cy={118} r={5} className="fill-warn" />
      <T x={90} y={108} size={10}>quick target</T>
      <polyline points="20,170 60,170 120,150 160,135 200,120 230,120 270,95 300,85 320,85" fill="none" className="stroke-up" strokeWidth={1.5} strokeDasharray="4 3" />
      <circle cx={320} cy={70} r={5} className="fill-up" />
      <T x={318} y={34} size={10} cls="fill-up">trailing exit</T>
      <T x={180} y={185} size={10} cls={SUB}>dashed line: trailing stop following the best price</T>
    </Frame>
  );
}

// ── L6. Regime filter ───────────────────────────────────────────────────────

export function FigStratRegimes({ title, caption }: FigProps) {
  const id = "strat-fig-regimes";
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="A price line that alternates between a steady trend and a sideways range. Shaded bands mark where a filter switches a trend strategy on during trends and off during ranges.">
      <rect x={20} y={20} width={100} height={130} className="fill-up/10" />
      <rect x={220} y={20} width={110} height={130} className="fill-up/10" />
      <polyline points="20,140 50,120 80,100 120,70 140,80 160,65 180,78 200,68 220,72 250,55 280,40 310,30 330,24" fill="none" className="stroke-accent" strokeWidth={2.2} />
      <T x={70} y={164} size={10} cls="fill-up">filter: on</T>
      <T x={170} y={164} size={10} cls={SUB}>filter: off</T>
      <T x={275} y={164} size={10} cls="fill-up">filter: on</T>
      <T x={170} y={40} size={10} cls={SUB}>range</T>
    </Frame>
  );
}

// ── L7. Overfitting ─────────────────────────────────────────────────────────

export function FigStratOverfit({ title, caption }: FigProps) {
  const id = "strat-fig-overfit";
  return (
    <Frame id={id} title={title} caption={caption} h={190} label="An equity line split by a vertical line into in-sample and out-of-sample. The in-sample part rises smoothly because the rules were tuned to it. After the split the line goes flat and drifts down.">
      <line x1={200} x2={200} y1={10} y2={160} className="stroke-line-strong" strokeDasharray="4 4" />
      <T x={100} y={20} size={11} weight={600}>in-sample (tuned)</T>
      <T x={280} y={20} size={11} weight={600}>out-of-sample</T>
      <polyline points="20,150 50,138 80,125 110,108 140,95 170,78 200,62" fill="none" className="stroke-up" strokeWidth={2.4} />
      <polyline points="200,62 225,70 250,60 275,78 300,74 325,88 345,92" fill="none" className="stroke-down" strokeWidth={2.4} />
      <T x={180} y={180} size={10} cls={SUB}>more variants tried, more luck baked into the best one</T>
    </Frame>
  );
}

// ── L8. The spec document ───────────────────────────────────────────────────

export function FigStratSpec({ title, caption }: FigProps) {
  const id = "strat-fig-spec";
  const lines = ["1. Hypothesis and edge source", "2. Market and timeframe", "3. Entry rule", "4. Exit and stop rules", "5. Sizing rule", "6. Filters", "7. Costs assumed", "8. Tests done", "9. Kill criteria"];
  return (
    <Frame id={id} title={title} caption={caption} h={220} label="A one-page document with nine numbered sections: hypothesis and edge source, market and timeframe, entry, exit and stops, sizing, filters, costs, tests done, and kill criteria.">
      <Box x={70} y={6} w={220} h={208} cls="fill-raised stroke-line-strong" />
      <T x={180} y={26} weight={600}>Strategy spec, version 1</T>
      {lines.map((l, i) => <T key={l} x={86} y={48 + i * 19} a="start" size={11}>{l}</T>)}
    </Frame>
  );
}

// ── L9. Testing pipeline ────────────────────────────────────────────────────

export function FigStratPipeline({ title, caption }: FigProps) {
  const id = "strat-fig-pipeline";
  const steps = ["Backtest", "Paper", "Small live", "Full size"];
  return (
    <Frame id={id} title={title} caption={caption} h={150} label="Four stages in a row: backtest, paper trading, small live size, then full size. Each arrow is a gate the strategy must pass, and a failure at any gate sends it back or ends it.">
      {steps.map((s, i) => (
        <g key={s}>
          <Box x={6 + i * 89} y={40} w={78} h={40} cls={i === 3 ? "fill-accent-soft stroke-accent" : "fill-raised stroke-line-strong"} />
          <T x={45 + i * 89} y={64} size={11} weight={600}>{s}</T>
          {i < 3 && <Arrow id={id} x1={86 + i * 89} y1={60} x2={93 + i * 89} y2={60} />}
        </g>
      ))}
      <T x={180} y={24} size={10} cls={SUB}>each gate has a written pass rule</T>
      <T x={180} y={108} size={10} cls={SUB}>fail a gate: back to the spec, or stop</T>
      <Arrow id={id} x1={300} y1={96} x2={50} y2={96} cls="stroke-down" dash="4 3" />
    </Frame>
  );
}

// ── L10. Drawdown cone ──────────────────────────────────────────────────────

export function FigStratKill({ title, caption }: FigProps) {
  const id = "strat-fig-kill";
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="A cone that widens over time around the expected equity line. Live results inside the cone are consistent with the plan. A live line that drops below the lower edge crosses a kill line set before trading began.">
      <polygon points="20,100 340,30 340,190 20,100" className="fill-accent-soft" />
      <line x1={20} y1={100} x2={340} y2={110} className="stroke-accent" strokeWidth={1.5} strokeDasharray="5 4" />
      <polyline points="20,100 60,108 100,104 140,120 180,132 220,150 260,168 290,182" fill="none" className="stroke-down" strokeWidth={2.2} />
      <line x1={20} y1={175} x2={340} y2={175} className="stroke-down" strokeDasharray="3 3" />
      <T x={338} y={170} a="end" size={10} cls="fill-down">kill line (set in advance)</T>
      <T x={330} y={48} a="end" size={10} cls={SUB}>expected range</T>
      <T x={250} y={102} size={10} cls={SUB}>expected path</T>
    </Frame>
  );
}

// ── L11. Diversification ────────────────────────────────────────────────────

export function FigStratDiversify({ title, caption }: FigProps) {
  const id = "strat-fig-diversify";
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="Two jagged equity lines that zigzag at different times, and a smoother combined line between them. Low correlation means one strategy's bad patch is partly offset by the other.">
      <polyline points="20,120 60,90 100,110 140,70 180,100 220,60 260,90 300,50 340,70" fill="none" className="stroke-up" strokeWidth={1.5} opacity={0.7} />
      <polyline points="20,120 60,130 100,90 140,110 180,70 220,95 260,60 300,85 340,50" fill="none" className="stroke-warn" strokeWidth={1.5} opacity={0.7} />
      <polyline points="20,120 60,110 100,100 140,90 180,85 220,78 260,75 300,68 340,60" fill="none" className="stroke-accent" strokeWidth={2.6} />
      <T x={30} y={24} a="start" size={10} cls="fill-up">strategy A</T>
      <T x={120} y={24} a="start" size={10} cls="fill-warn">strategy B</T>
      <T x={210} y={24} a="start" size={10} cls="fill-accent">combined</T>
      <T x={180} y={165} size={10} cls={SUB}>smoother only if their bad patches do not line up</T>
    </Frame>
  );
}

// ── L12. Lifecycle ──────────────────────────────────────────────────────────

export function FigStratLifecycle({ title, caption }: FigProps) {
  const id = "strat-fig-lifecycle";
  const st = ["Idea", "Research", "Live", "Decay", "Retire"];
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Five stages from left to right: idea, research, live, decay and retire. A curve of the edge rises through research, peaks when live, then slopes down as others find and trade the same effect, until it falls under the cost line.">
      <line x1={20} x2={340} y1={120} y2={120} className="stroke-down" strokeDasharray="4 3" />
      <T x={338} y={134} a="end" size={10} cls="fill-down">costs</T>
      <path d="M20,140 C80,130 110,40 160,40 S260,90 340,130" fill="none" className="stroke-accent" strokeWidth={2.4} />
      {st.map((s, i) => <T key={s} x={36 + i * 72} y={18} size={11} weight={600}>{s}</T>)}
      <T x={160} y={34} size={10} cls={SUB}>edge</T>
    </Frame>
  );
}
