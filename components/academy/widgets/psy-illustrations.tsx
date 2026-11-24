import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
  Static, labelled diagrams for the Trading Psychology track, one per lesson.
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

// ── L1. The value function ──────────────────────────────────────────────────

export function FigPsyValue({ title, caption }: FigProps) {
  const id = "psy-fig-value";
  const cx = 180, cy = 100, s = 0.3;
  const pts = Array.from({ length: 61 }, (_, i) => -150 + i * 5).map((x) => {
    const v = x >= 0 ? Math.pow(x, 0.88) : -2.25 * Math.pow(-x, 0.88);
    return `${cx + x},${cy - v * s}`;
  });
  return (
    <Frame id={id} title={title} caption={caption} h={200} label="An S-shaped value curve through the reference point. To the right, gains rise and flatten. To the left, losses fall more steeply than gains rise, so a loss feels larger than a gain of the same size.">
      <line x1={20} x2={340} y1={cy} y2={cy} className="stroke-line-strong" />
      <line x1={cx} x2={cx} y1={10} y2={190} className="stroke-line-strong" />
      <polyline points={pts.join(" ")} fill="none" className="stroke-accent" strokeWidth={2.5} />
      <T x={338} y={cy - 6} a="end" size={10} cls={SUB}>gains</T>
      <T x={22} y={cy - 6} a="start" size={10} cls={SUB}>losses</T>
      <T x={cx + 6} y={18} a="start" size={10} cls={SUB}>felt value</T>
      <T x={cx + 4} y={cy + 14} a="start" size={10}>reference point</T>
      <T x={290} y={48} size={11} cls="fill-up">flattens: diminishing</T>
      <T x={290} y={62} size={11} cls="fill-up">sensitivity</T>
      <T x={78} y={176} size={11} cls="fill-down">steeper: loss aversion</T>
    </Frame>
  );
}

// ── L2. Disposition effect ──────────────────────────────────────────────────

export function FigPsyDisposition({ title, caption }: FigProps) {
  const id = "psy-fig-disposition";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Two open positions. The winner is sold early, cutting off further gains. The loser is held and keeps falling. The disposition effect is selling winners too soon and holding losers too long.">
      <T x={90} y={18} weight={600}>Winner</T>
      <polyline points="20,120 50,100 80,80 100,70" fill="none" className="stroke-up" strokeWidth={2.5} />
      <polyline points="100,70 130,55 160,40" fill="none" className="stroke-up" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.6} />
      <circle cx={100} cy={70} r={5} className="fill-up" />
      <T x={100} y={95} size={10}>sold early</T>
      <T x={150} y={30} size={9} cls={SUB}>gains missed</T>
      <line x1={180} x2={180} y1={10} y2={160} className="stroke-line" />
      <T x={270} y={18} weight={600}>Loser</T>
      <polyline points="200,40 230,60 260,80 290,105 320,130 345,150" fill="none" className="stroke-down" strokeWidth={2.5} />
      <T x={300} y={70} size={10}>held, hoping</T>
      <T x={300} y={84} size={10}>to break even</T>
      <T x={180} y={166} size={10} cls={SUB}>the plan, not the profit or loss, should decide the exit</T>
    </Frame>
  );
}

// ── L3. Overconfidence and overtrading ──────────────────────────────────────

export function FigPsyOverconfidence({ title, caption }: FigProps) {
  const id = "psy-fig-overconfidence";
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="A loop: overconfidence leads to more trades, more trades lead to more costs, and costs reduce net returns. A separate bar compares a return before costs with a smaller return after costs.">
      <Box x={20} y={20} w={110} h={34} cls="fill-accent-soft stroke-accent" />
      <T x={75} y={42} size={11}>Overconfidence</T>
      <Box x={20} y={80} w={110} h={34} />
      <T x={75} y={102} size={11}>More trades</T>
      <Box x={20} y={140} w={110} h={34} />
      <T x={75} y={162} size={11}>More costs</T>
      <Arrow id={id} x1={75} y1={56} x2={75} y2={78} />
      <Arrow id={id} x1={75} y1={116} x2={75} y2={138} />
      <rect x={210} y={40} width={36} height={120} className="fill-up" opacity={0.55} />
      <rect x={280} y={90} width={36} height={70} className="fill-accent" opacity={0.6} />
      <line x1={196} x2={330} y1={160} y2={160} className="stroke-line-strong" />
      <T x={228} y={34} size={10}>before costs</T>
      <T x={298} y={84} size={10}>after costs</T>
      <Arrow id={id} x1={140} y1={157} x2={272} y2={120} dash="4 3" />
    </Frame>
  );
}

// ── L4. Hindsight, confirmation and recency ─────────────────────────────────

export function FigPsyBiases({ title, caption }: FigProps) {
  const id = "psy-fig-biases";
  const col = (x: number, head: string, l1: string, l2: string) => (
    <g>
      <Box x={x} y={20} w={104} h={130} />
      <T x={x + 52} y={42} size={12} weight={600}>{head}</T>
      <T x={x + 52} y={128} size={10} cls={SUB}>{l1}</T>
      <T x={x + 52} y={142} size={10} cls={SUB}>{l2}</T>
    </g>
  );
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Three panels. Hindsight: after the outcome, the past looks obvious. Confirmation: evidence that agrees is kept, the rest filtered out. Recency: the latest few results get far more weight than the long record.">
      {col(10, "Hindsight", "\"I knew it\"", "after the event")}
      {col(128, "Confirmation", "keep what agrees,", "skip what doesn't")}
      {col(246, "Recency", "last few results", "outweigh the rest")}
      <Arrow id={id} x1={30} y1={95} x2={90} y2={65} />
      <circle cx={92} cy={62} r={4} className="fill-accent" />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={150 + i * 20} cy={70} r={6} className={i % 2 ? "fill-down" : "fill-up"} opacity={i % 2 ? 0.35 : 0.9} />)}
      <line x1={140} x2={220} y1={92} y2={92} className="stroke-fg-muted" />
      <T x={180} y={108} size={9} cls={SUB}>filter</T>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={258 + i * 12} y={100 - (i < 5 ? 10 : 34)} width={8} height={i < 5 ? 10 : 34} className={i < 5 ? "fill-fg-subtle" : "fill-accent"} />)}
    </Frame>
  );
}

// ── L5. Gambler's fallacy and hot hand ──────────────────────────────────────

export function FigPsyGamblers({ title, caption }: FigProps) {
  const id = "psy-fig-gamblers";
  const seq = [1, 1, 1, 1, 1];
  return (
    <Frame id={id} title={title} caption={caption} h={160} label="Five tails in a row, then a question mark. The gambler's fallacy says heads is due; the hot-hand belief says tails will continue. For a fair coin the next flip is still 50/50.">
      {seq.map((_, i) => (
        <g key={i}>
          <circle cx={40 + i * 44} cy={50} r={16} className="fill-down" opacity={0.7} />
          <T x={40 + i * 44} y={55} size={12} cls="fill-canvas" weight={600}>T</T>
        </g>
      ))}
      <circle cx={40 + 5 * 44} cy={50} r={16} className="fill-raised stroke-line-strong" strokeWidth={1.5} strokeDasharray="3 3" />
      <T x={40 + 5 * 44} y={55} size={14} weight={600}>?</T>
      <Box x={10} y={92} w={104} h={50} />
      <T x={62} y={112} size={10} weight={600}>Gambler&apos;s fallacy</T>
      <T x={62} y={128} size={10} cls={SUB}>&quot;heads is due&quot;</T>
      <Box x={128} y={92} w={104} h={50} />
      <T x={180} y={112} size={10} weight={600}>Hot-hand belief</T>
      <T x={180} y={128} size={10} cls={SUB}>&quot;tails will continue&quot;</T>
      <Box x={246} y={92} w={104} h={50} cls="fill-accent-soft stroke-accent" />
      <T x={298} y={112} size={10} weight={600}>Fair coin</T>
      <T x={298} y={128} size={10} cls={SUB}>still 50/50</T>
    </Frame>
  );
}

// ── L6. Variance: many paths from one edge ──────────────────────────────────

export function FigPsyStreaks({ title, caption }: FigProps) {
  const id = "psy-fig-streaks";
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="A straight dashed line shows the expected path of a strategy with a positive edge. Around it, a band shows how far real paths can wander. One path includes a long losing streak that dips below the start before recovering.">
      <line x1={20} x2={340} y1={150} y2={150} className="stroke-line-strong" />
      <path d="M20,150 L340,40 L340,110 L20,150 Z" className="fill-accent-soft" opacity={0.7} />
      <path d="M20,150 L340,0 L340,40 Z" className="fill-accent-soft" opacity={0.35} />
      <line x1={20} x2={340} y1={150} y2={75} className="stroke-accent" strokeWidth={2} strokeDasharray="6 4" />
      <polyline points="20,150 50,140 80,128 100,135 120,145 140,152 160,160 180,156 200,140 230,120 260,104 290,96 320,80 340,70" fill="none" className="stroke-fg" strokeWidth={1.75} />
      <T x={150} y={176} size={10} cls="fill-down">a losing streak</T>
      <T x={300} y={64} size={10} cls="fill-accent-strong">expected path</T>
      <T x={24} y={20} a="start" size={10} cls={SUB}>range of likely paths</T>
      <T x={340} y={166} a="end" size={10} cls={SUB}>trades →</T>
    </Frame>
  );
}

// ── L7. Decision versus outcome ─────────────────────────────────────────────

export function FigPsyOutcome({ title, caption }: FigProps) {
  const id = "psy-fig-outcome";
  const cell = (x: number, y: number, a: string, b: string, cls: string) => (
    <g>
      <Box x={x} y={y} w={130} h={56} cls={cls} />
      <T x={x + 65} y={y + 24} size={11} weight={600}>{a}</T>
      <T x={x + 65} y={y + 40} size={10} cls={SUB}>{b}</T>
    </g>
  );
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="A two-by-two grid. Sound decision with a good outcome: earned reward. Sound decision with a bad outcome: bad luck. Poor decision with a good outcome: dumb luck. Poor decision with a bad outcome: deserved loss.">
      <T x={155} y={18} size={10} cls={SUB}>Good outcome</T>
      <T x={290} y={18} size={10} cls={SUB}>Bad outcome</T>
      <T x={40} y={60} size={10} cls={SUB}>Sound</T>
      <T x={40} y={74} size={10} cls={SUB}>decision</T>
      <T x={40} y={122} size={10} cls={SUB}>Poor</T>
      <T x={40} y={136} size={10} cls={SUB}>decision</T>
      {cell(90, 30, "Earned reward", "repeat", "fill-up/20 stroke-up")}
      {cell(225, 30, "Bad luck", "keep doing it", "fill-raised stroke-line-strong")}
      {cell(90, 94, "Dumb luck", "the dangerous one", "fill-warn/20 stroke-warn")}
      {cell(225, 94, "Deserved loss", "fix the process", "fill-down/20 stroke-down")}
      <T x={225} y={170} size={10} cls={SUB}>judge the row (the decision), not the column (the result)</T>
    </Frame>
  );
}

// ── L8. The revenge spiral ──────────────────────────────────────────────────

export function FigPsyRevenge({ title, caption }: FigProps) {
  const id = "psy-fig-revenge";
  const steps = ["A loss", "Urge to win it back", "Bigger size, worse setup", "Bigger loss"];
  const pos = [[90, 30], [270, 30], [270, 120], [90, 120]];
  return (
    <Frame id={id} title={title} caption={caption} h={190} label="A loop of four steps: a loss, the urge to win it back, a bigger trade on a worse setup, and a bigger loss, which feeds the urge again. A daily loss stop breaks the loop between the loss and the next trade.">
      {steps.map((s, i) => (
        <g key={s}>
          <Box x={pos[i][0] - 70} y={pos[i][1]} w={140} h={34} cls={i === 3 ? "fill-down/20 stroke-down" : "fill-raised stroke-line-strong"} />
          <T x={pos[i][0]} y={pos[i][1] + 22} size={11}>{s}</T>
        </g>
      ))}
      <Arrow id={id} x1={162} y1={47} x2={198} y2={47} />
      <Arrow id={id} x1={270} y1={66} x2={270} y2={118} />
      <Arrow id={id} x1={198} y1={137} x2={162} y2={137} />
      <Arrow id={id} x1={90} y1={118} x2={90} y2={66} />
      <Box x={130} y={78} w={100} h={30} cls="fill-accent-soft stroke-accent" />
      <T x={180} y={97} size={11} weight={600}>Daily loss stop</T>
      <line x1={180} x2={180} y1={64} y2={78} className="stroke-accent" strokeWidth={2} />
      <T x={180} y={180} size={10} cls={SUB}>the stop is set before the session, when you are calm</T>
    </Frame>
  );
}

// ── L9. Tilt cycle ──────────────────────────────────────────────────────────

export function FigPsyTilt({ title, caption }: FigProps) {
  const id = "psy-fig-tilt";
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="A gauge from calm to tilted. Stress, tiredness and losses push the needle towards tilt. Pausing, sleep and following the plan push it back towards calm.">
      <path d="M60,150 A120,120 0 0 1 300,150" fill="none" className="stroke-line-strong" strokeWidth={14} />
      <path d="M60,150 A120,120 0 0 1 140,45" fill="none" className="stroke-up" strokeWidth={14} opacity={0.6} />
      <path d="M220,45 A120,120 0 0 1 300,150" fill="none" className="stroke-down" strokeWidth={14} opacity={0.6} />
      <line x1={180} y1={150} x2={250} y2={80} className="stroke-fg" strokeWidth={3} />
      <circle cx={180} cy={150} r={6} className="fill-fg" />
      <T x={60} y={172} size={11} cls="fill-up">calm</T>
      <T x={300} y={172} size={11} cls="fill-down">tilted</T>
      <T x={345} y={30} a="end" size={10} cls={SUB}>pushed up by: losses, stress,</T>
      <T x={345} y={44} a="end" size={10} cls={SUB}>poor sleep, broken rules</T>
      <T x={15} y={30} a="start" size={10} cls={SUB}>pulled back by: a pause,</T>
      <T x={15} y={44} a="start" size={10} cls={SUB}>rest, the plan</T>
    </Frame>
  );
}

// ── L10. Checklist and journal loop ─────────────────────────────────────────

export function FigPsyChecklist({ title, caption }: FigProps) {
  const id = "psy-fig-checklist";
  const steps = ["Checklist", "Trade", "Journal", "Review"];
  return (
    <Frame id={id} title={title} caption={caption} h={150} label="A loop of four steps: the pre-trade checklist, the trade, the journal entry, and the weekly review, which updates the checklist.">
      {steps.map((s, i) => (
        <g key={s}>
          <Box x={12 + i * 88} y={40} w={72} h={36} cls={i === 0 ? "fill-accent-soft stroke-accent" : "fill-raised stroke-line-strong"} />
          <T x={48 + i * 88} y={63} size={11}>{s}</T>
          {i < 3 && <Arrow id={id} x1={86 + i * 88} y1={58} x2={98 + i * 88} y2={58} />}
        </g>
      ))}
      <path d="M312,78 C312,130 48,130 48,80" fill="none" className="stroke-fg-muted" strokeWidth={1.5} strokeDasharray="4 3" markerEnd={`url(#${id}-arrow)`} />
      <T x={180} y={132} size={10} cls={SUB}>the review updates the rules, judged on process</T>
      <T x={48} y={30} size={9} cls={SUB}>before</T>
      <T x={224} y={30} size={9} cls={SUB}>after</T>
    </Frame>
  );
}

// ── L11. Realistic expectations ─────────────────────────────────────────────

export function FigPsyExpectations({ title, caption }: FigProps) {
  const id = "psy-fig-expectations";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="A wide bar of many traders who start, narrowing to a small group still trading later, and a tiny group who are consistently profitable after costs. The visible success stories come from the small end, which is survivorship bias.">
      <rect x={30} y={30} width={300} height={26} rx={4} className="fill-fg-subtle" opacity={0.5} />
      <rect x={90} y={72} width={180} height={26} rx={4} className="fill-accent" opacity={0.45} />
      <rect x={168} y={114} width={24} height={26} rx={4} className="fill-up" opacity={0.85} />
      <T x={180} y={48} size={11}>many start</T>
      <T x={180} y={90} size={11}>fewer keep going</T>
      <T x={204} y={132} a="start" size={11}>few profit after costs</T>
      <T x={180} y={160} size={10} cls={SUB}>widths not to scale; the stories you hear come from the bottom bar</T>
    </Frame>
  );
}

// ── L12. The trading plan ───────────────────────────────────────────────────

export function FigPsyPlan({ title, caption }: FigProps) {
  const id = "psy-fig-plan";
  const parts = ["Goals", "Markets", "Setups", "Risk", "Loss stops", "Routine", "If-then rules", "Review"];
  return (
    <Frame id={id} title={title} caption={caption} h={150} label="A plan page with eight sections: goals, markets, setups, risk, loss stops, routine, if-then rules and review.">
      <Box x={60} y={10} w={240} h={130} />
      {parts.map((p, i) => (
        <g key={p}>
          <rect x={i < 4 ? 76 : 188} y={28 + (i % 4) * 26} width={10} height={10} rx={2} className={i === 3 || i === 4 ? "fill-accent" : "fill-fg-subtle"} />
          <T x={(i < 4 ? 76 : 188) + 16} y={37 + (i % 4) * 26} a="start" size={11}>{p}</T>
        </g>
      ))}
      <T x={318} y={80} a="start" size={9} cls={SUB}>written</T>
      <T x={318} y={92} a="start" size={9} cls={SUB}>first</T>
    </Frame>
  );
}
