import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
  Static, labelled diagrams for the Backtesting track, one per lesson.
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

// ── L1. What a backtest is ──────────────────────────────────────────────────

export function FigBtWhat({ title, caption }: FigProps) {
  const id = "bt-fig-what";
  return (
    <Frame id={id} title={title} caption={caption} h={190} label="Rules and past data go into a simulator, which produces one equity curve. The curve shows how the rules would have behaved on that one past path. Many possible futures fan out to the right, and the backtest says nothing certain about which one comes.">
      <Box x={8} y={30} w={84} h={34} />
      <T x={50} y={51} size={11}>Exact rules</T>
      <Box x={8} y={84} w={84} h={34} />
      <T x={50} y={105} size={11}>Past data</T>
      <Arrow id={id} x1={94} y1={47} x2={118} y2={68} />
      <Arrow id={id} x1={94} y1={101} x2={118} y2={80} />
      <Box x={120} y={56} w={78} h={36} cls="fill-accent-soft stroke-accent" />
      <T x={159} y={78} size={11} weight={600}>Simulator</T>
      <Arrow id={id} x1={200} y1={74} x2={222} y2={74} />
      <polyline points="224,110 240,100 256,104 272,86 288,80 300,74" fill="none" className="stroke-accent" strokeWidth={2.2} />
      <polyline points="300,74 350,40" fill="none" className="stroke-fg-subtle" strokeDasharray="3 3" />
      <polyline points="300,74 350,74" fill="none" className="stroke-fg-subtle" strokeDasharray="3 3" />
      <polyline points="300,74 350,112" fill="none" className="stroke-fg-subtle" strokeDasharray="3 3" />
      <T x={262} y={130} size={10}>one past path</T>
      <T x={330} y={130} size={10} cls={SUB}>futures?</T>
      <T x={180} y={176} size={10} cls={SUB}>A backtest describes the past under stated assumptions; it does not forecast</T>
    </Frame>
  );
}

// ── L2. Data adjustments ────────────────────────────────────────────────────

export function FigBtData({ title, caption }: FigProps) {
  const id = "bt-fig-data";
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="A raw price line that drops by half overnight at a 2-for-1 split, next to an adjusted line that stays smooth because earlier prices were divided by two.">
      <T x={90} y={16} weight={600} cls="fill-down">Raw prices</T>
      <polyline points="16,70 40,64 64,60 88,54 90,110 112,104 136,100 160,96" fill="none" className="stroke-down" strokeWidth={2.2} />
      <T x={90} y={132} size={10}>split: price halves</T>
      <T x={90} y={146} size={10} cls={SUB}>looks like a 50% crash</T>
      <line x1={180} x2={180} y1={10} y2={160} className="stroke-line" />
      <T x={270} y={16} weight={600} cls="fill-accent">Adjusted prices</T>
      <polyline points="196,122 220,119 244,117 268,114 270,110 292,104 316,100 340,96" fill="none" className="stroke-accent" strokeWidth={2.2} />
      <T x={270} y={132} size={10}>earlier prices ÷ 2</T>
      <T x={270} y={146} size={10} cls={SUB}>no false move</T>
      <T x={180} y={174} size={10} cls={SUB}>Dividends and futures rolls need the same care</T>
    </Frame>
  );
}

// ── L3. Lookahead and survivorship ──────────────────────────────────────────

export function FigBtBias({ title, caption }: FigProps) {
  const id = "bt-fig-bias";
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="Top: a timeline. The signal is read at the close of bar t, so the earliest honest fill is the open of bar t plus one. Filling at the open of bar t uses a close that has not happened yet. Bottom: a universe of stocks narrows to survivors, and the stocks that dropped out are missing from a survivor-only database.">
      <T x={180} y={14} weight={600}>Lookahead</T>
      <Box x={40} y={24} w={120} h={40} />
      <T x={100} y={40} size={10}>bar t</T>
      <T x={100} y={56} size={9} cls={SUB}>open … close</T>
      <Box x={200} y={24} w={120} h={40} />
      <T x={260} y={40} size={10}>bar t + 1</T>
      <T x={260} y={56} size={9} cls={SUB}>open … close</T>
      <circle cx={156} cy={44} r={4} className="fill-accent" />
      <circle cx={204} cy={44} r={4} className="fill-up" />
      <circle cx={44} cy={44} r={4} className="fill-down" />
      <T x={204} y={80} size={9} cls="fill-up">honest fill</T>
      <T x={44} y={80} size={9} cls="fill-down">bug: fill before the signal</T>
      <T x={156} y={20} size={9} cls="fill-accent">signal</T>
      <T x={180} y={108} weight={600}>Survivorship</T>
      <polygon points="40,118 320,118 250,168 110,168" className="fill-accent-soft stroke-accent" />
      <T x={180} y={140} size={10}>every stock that existed</T>
      <T x={180} y={160} size={10}>survivors only</T>
      <T x={180} y={190} size={10} cls={SUB}>The losers that dropped out are the ones a survivor-only test never sees</T>
    </Frame>
  );
}

// ── L4. Costs ───────────────────────────────────────────────────────────────

export function FigBtCosts({ title, caption }: FigProps) {
  const id = "bt-fig-costs";
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="Two pairs of bars. For a slow rule, gross and net return are close. For a fast rule that trades often, commission, spread and slippage take a large slice, leaving little or nothing.">
      <line x1={20} x2={340} y1={140} y2={140} className="stroke-line-strong" />
      <rect x={50} y={60} width={40} height={80} className="fill-up/60" />
      <rect x={96} y={70} width={40} height={70} className="fill-accent/60" />
      <T x={93} y={156} size={10}>slow rule</T>
      <rect x={220} y={50} width={40} height={90} className="fill-up/60" />
      <rect x={266} y={128} width={40} height={12} className="fill-accent/60" />
      <T x={263} y={156} size={10}>fast rule</T>
      <T x={70} y={52} size={9}>gross</T>
      <T x={116} y={62} size={9}>net</T>
      <T x={240} y={42} size={9}>gross</T>
      <T x={286} y={120} size={9}>net</T>
      <T x={180} y={174} size={10} cls={SUB}>Each trade pays commission + spread + slippage, twice</T>
    </Frame>
  );
}

// ── L5. Metrics ─────────────────────────────────────────────────────────────

export function FigBtMetrics({ title, caption }: FigProps) {
  const id = "bt-fig-metrics";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Two equity curves that start and end at the same level. One rises smoothly. The other has a deep drawdown in the middle. They share the same total return and very different risk.">
      <polyline points="20,130 340,40" fill="none" className="stroke-up" strokeWidth={2.2} />
      <polyline points="20,130 90,90 140,60 190,150 240,140 290,80 340,40" fill="none" className="stroke-down" strokeWidth={2.2} />
      <T x={300} y={30} size={10}>same end point</T>
      <T x={190} y={164} size={10} cls="fill-down">deep drawdown hidden by the total return</T>
    </Frame>
  );
}

// ── L6. In-sample and out-of-sample ─────────────────────────────────────────

export function FigBtSplit({ title, caption }: FigProps) {
  const id = "bt-fig-split";
  return (
    <Frame id={id} title={title} caption={caption} h={130} label="A timeline split in two. The earlier in-sample part is where rules are built and tuned. The later out-of-sample part is locked away and used once, after the rules are fixed.">
      <Box x={10} y={40} w={220} h={40} cls="fill-accent-soft stroke-accent" />
      <T x={120} y={58} size={11} weight={600}>In-sample</T>
      <T x={120} y={73} size={9} cls={SUB}>build and tune here</T>
      <Box x={234} y={40} w={116} h={40} cls="fill-warn/15 stroke-warn" />
      <T x={292} y={58} size={11} weight={600}>Out-of-sample</T>
      <T x={292} y={73} size={9} cls={SUB}>use once, at the end</T>
      <T x={180} y={110} size={10} cls={SUB}>time →</T>
    </Frame>
  );
}

// ── L7. Walk-forward ────────────────────────────────────────────────────────

export function FigBtWalkForward({ title, caption }: FigProps) {
  const id = "bt-fig-walkforward";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Four rows of rolling windows. Each row has a training block followed by a short test block, and each row starts later than the one above. The test blocks join up into one out-of-sample record.">
      {[0, 1, 2, 3].map((k) => (
        <g key={k}>
          <Box x={10 + k * 50} y={14 + k * 30} w={160} h={22} cls="fill-accent-soft stroke-accent" r={4} />
          <T x={90 + k * 50} y={29 + k * 30} size={9}>train</T>
          <Box x={172 + k * 50} y={14 + k * 30} w={46} h={22} cls="fill-warn/20 stroke-warn" r={4} />
          <T x={195 + k * 50} y={29 + k * 30} size={9}>test</T>
        </g>
      ))}
      <T x={180} y={150} size={10} cls={SUB}>The test blocks, stitched together, are the walk-forward result</T>
    </Frame>
  );
}

// ── L8. Plateau versus spike ────────────────────────────────────────────────

export function FigBtPlateau({ title, caption }: FigProps) {
  const id = "bt-fig-plateau";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Two curves of result against a parameter. On the left, a broad plateau where nearby settings give similar results. On the right, a narrow spike where one setting stands far above its neighbours.">
      <T x={90} y={16} weight={600} cls="fill-up">Plateau</T>
      <path d="M16,140 C40,140 50,70 90,66 S140,140 164,140" fill="none" className="stroke-up" strokeWidth={2.2} />
      <T x={90} y={160} size={10} cls={SUB}>nearby settings agree</T>
      <line x1={180} x2={180} y1={10} y2={160} className="stroke-line" />
      <T x={270} y={16} weight={600} cls="fill-down">Spike</T>
      <polyline points="196,138 240,134 262,132 270,40 278,132 300,134 344,138" fill="none" className="stroke-down" strokeWidth={2.2} />
      <T x={270} y={160} size={10} cls={SUB}>one lucky setting</T>
    </Frame>
  );
}

// ── L9. Monte Carlo ─────────────────────────────────────────────────────────

export function FigBtMonteCarlo({ title, caption }: FigProps) {
  const id = "bt-fig-montecarlo";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Several equity paths built from the same trades in different orders. They all end at the same point but take different routes, with different drawdowns along the way.">
      <polyline points="20,130 80,100 140,110 200,70 260,80 320,40" fill="none" className="stroke-accent" strokeWidth={2.2} />
      <polyline points="20,130 80,140 140,120 200,110 260,60 320,40" fill="none" className="stroke-fg-subtle" strokeWidth={1.3} />
      <polyline points="20,130 80,90 140,70 200,120 260,100 320,40" fill="none" className="stroke-fg-subtle" strokeWidth={1.3} />
      <polyline points="20,130 80,115 140,150 200,95 260,70 320,40" fill="none" className="stroke-fg-subtle" strokeWidth={1.3} />
      <circle cx={320} cy={40} r={4} className="fill-accent" />
      <T x={316} y={30} a="end" size={10}>same trades, same end</T>
      <T x={180} y={164} size={10} cls={SUB}>The order changes the drawdown you would have lived through</T>
    </Frame>
  );
}

// ── L10. Data snooping ──────────────────────────────────────────────────────

export function FigBtSnooping({ title, caption }: FigProps) {
  const id = "bt-fig-snooping";
  const hs = [30, 52, 18, 44, 60, 25, 38, 90, 33, 47, 22, 56];
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Twelve bars showing the backtest results of twelve variants with no real edge. One bar is much taller than the rest and is labelled the one that gets reported.">
      <line x1={14} x2={346} y1={140} y2={140} className="stroke-line-strong" />
      {hs.map((h, i) => <rect key={i} x={20 + i * 27} y={140 - h} width={20} height={h} className={i === 7 ? "fill-warn" : "fill-fg-subtle/40"} />)}
      <T x={229} y={42} size={10} cls="fill-warn">the one that gets reported</T>
      <T x={180} y={160} size={10} cls={SUB}>Twelve variants, no edge: the best still looks good</T>
    </Frame>
  );
}

// ── L11. Regimes ────────────────────────────────────────────────────────────

export function FigBtRegimes({ title, caption }: FigProps) {
  const id = "bt-fig-regimes";
  return (
    <Frame id={id} title={title} caption={caption} h={160} label="One strategy's equity line across three shaded periods: it rises in a trending period, falls in a ranging period, and drifts in a random period.">
      <rect x={20} y={20} width={106} height={110} className="fill-up/10" />
      <rect x={126} y={20} width={106} height={110} className="fill-down/10" />
      <rect x={232} y={20} width={108} height={110} className="fill-raised" />
      <polyline points="20,110 70,85 126,55 160,70 200,80 232,90 270,86 300,92 340,88" fill="none" className="stroke-accent" strokeWidth={2.2} />
      <T x={73} y={146} size={10}>trending</T>
      <T x={179} y={146} size={10}>ranging</T>
      <T x={286} y={146} size={10}>random</T>
    </Frame>
  );
}

// ── L12. Backtest, paper, live ──────────────────────────────────────────────

export function FigBtForward({ title, caption }: FigProps) {
  const id = "bt-fig-forward";
  return (
    <Frame id={id} title={title} caption={caption} h={160} label="Three bars of decreasing height labelled backtest, paper trading and live. Results usually shrink from one stage to the next as selection effects, costs and real fills appear.">
      <line x1={30} x2={330} y1={130} y2={130} className="stroke-line-strong" />
      <rect x={60} y={30} width={60} height={100} className="fill-accent/60" />
      <rect x={150} y={65} width={60} height={65} className="fill-accent/45" />
      <rect x={240} y={95} width={60} height={35} className="fill-accent/30" />
      <T x={90} y={146} size={10}>backtest</T>
      <T x={180} y={146} size={10}>paper</T>
      <T x={270} y={146} size={10}>live</T>
      <T x={180} y={20} size={10} cls={SUB}>a typical pattern, drawn to show the idea</T>
    </Frame>
  );
}

// ── L13. Checklist ──────────────────────────────────────────────────────────

export function FigBtChecklist({ title, caption }: FigProps) {
  const id = "bt-fig-checklist";
  const items = ["Exact rules, fixed first", "Honest fills", "No survivorship", "Adjusted data", "Full costs", "Out-of-sample used once", "Variants counted"];
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="A clipboard with seven ticked checks: exact rules fixed first, honest fills, no survivorship bias, adjusted data, full costs, out-of-sample used once, and variants counted.">
      <Box x={80} y={8} w={200} h={186} />
      {items.map((t, i) => (
        <g key={t}>
          <rect x={96} y={24 + i * 24} width={12} height={12} rx={2} className="fill-up/20 stroke-up" strokeWidth={1.2} />
          <path d={`M98,${30 + i * 24} l3,3 l5,-6`} fill="none" className="stroke-up" strokeWidth={1.6} />
          <T x={116} y={34 + i * 24} a="start" size={11}>{t}</T>
        </g>
      ))}
    </Frame>
  );
}
