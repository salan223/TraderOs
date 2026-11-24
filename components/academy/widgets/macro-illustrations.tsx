import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/*
  Static, labelled diagrams for the Macro and News track, one per lesson.
  Registered as widgets so lessons can place them, but they are drawings:
  each is framed "Illustration · Not real data", shows no real figures,
  and uses theme tokens only.
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

/** A chain of labelled boxes joined by arrows. */
function Chain({ id, items, y, hl = 0 }: { id: string; items: string[]; y: number; hl?: number }) {
  const n = items.length, bw = (W - 20 - (n - 1) * 14) / n;
  return (
    <>
      {items.map((t, i) => {
        const x = 10 + i * (bw + 14);
        return (
          <g key={t}>
            <Box x={x} y={y} w={bw} h={40} cls={i === hl ? "fill-accent-soft stroke-accent" : undefined} />
            <T x={x + bw / 2} y={y + 24} size={10.5}>{t}</T>
            {i < n - 1 && <Arrow id={id} x1={x + bw + 1} y1={y + 20} x2={x + bw + 12} y2={y + 20} />}
          </g>
        );
      })}
    </>
  );
}

// ── L1. Central banks ───────────────────────────────────────────────────────

export function FigMacroCentralBank({ title, caption }: FigProps) {
  const id = "macro-fig-central-bank";
  return (
    <Frame id={id} title={title} caption={caption} h={190} label="A central bank's three tools, the policy rate, forward guidance and bond buying or selling, each feeding into market interest rates, which then feed into borrowing, spending and the currency.">
      {["Policy rate", "Forward guidance", "QE / QT"].map((t, i) => (
        <g key={t}>
          <Box x={10 + i * 118} y={10} w={104} h={34} cls={i === 0 ? "fill-accent-soft stroke-accent" : undefined} />
          <T x={62 + i * 118} y={31} size={11}>{t}</T>
          <Arrow id={id} x1={62 + i * 118} y1={46} x2={180} y2={78} cls="stroke-line-strong" />
        </g>
      ))}
      <Box x={110} y={80} w={140} h={32} />
      <T x={180} y={100} size={11}>Market interest rates</T>
      {["Borrowing", "Spending", "Currency"].map((t, i) => (
        <g key={t}>
          <Arrow id={id} x1={180} y1={114} x2={62 + i * 118} y2={142} cls="stroke-line-strong" />
          <Box x={10 + i * 118} y={144} w={104} h={32} />
          <T x={62 + i * 118} y={164} size={11}>{t}</T>
        </g>
      ))}
    </Frame>
  );
}

// ── L2. Inflation ───────────────────────────────────────────────────────────

export function FigMacroInflation({ title, caption }: FigProps) {
  const id = "macro-fig-inflation";
  const parts = [["Food", 0.14, false], ["Energy", 0.07, false], ["Housing", 0.35, true], ["Goods", 0.2, true], ["Services", 0.24, true]] as const;
  let x = 10;
  return (
    <Frame id={id} title={title} caption={caption} h={150} label="A bar showing a basket split into food, energy, housing, goods and services. Headline inflation uses the whole bar; core inflation leaves out food and energy.">
      <T x={10} y={18} a="start" size={11} cls={SUB}>Headline: the whole basket</T>
      {parts.map(([t, w, core]) => {
        const bw = w * 340, x0 = x;
        x += bw;
        return (
          <g key={t}>
            <rect x={x0} y={26} width={bw - 2} height={40} rx={4} className={core ? "fill-accent/40" : "fill-warn/40"} />
            <T x={x0 + bw / 2} y={51} size={10}>{t}</T>
          </g>
        );
      })}
      <line x1={10 + 0.21 * 340} x2={350} y1={82} y2={82} className="stroke-accent" strokeWidth={2} />
      <T x={10 + 0.21 * 340} y={100} a="start" size={11} cls="fill-accent-strong">Core: food and energy left out</T>
      <T x={10} y={132} a="start" size={10.5} cls={SUB}>Food and energy prices swing most, so core shows the slower trend.</T>
    </Frame>
  );
}

// ── L3. Labour market ───────────────────────────────────────────────────────

export function FigMacroLabour({ title, caption }: FigProps) {
  const id = "macro-fig-labour";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Two surveys behind one jobs report: a survey of employers gives the payrolls change, and a survey of households gives the unemployment rate. Both arrive on the same morning and both are revised later.">
      <Box x={10} y={10} w={160} h={44} />
      <T x={90} y={29} size={11}>Survey of employers</T>
      <T x={90} y={45} size={10} cls={SUB}>jobs added or lost</T>
      <Box x={190} y={10} w={160} h={44} />
      <T x={270} y={29} size={11}>Survey of households</T>
      <T x={270} y={45} size={10} cls={SUB}>unemployment rate</T>
      <Arrow id={id} x1={90} y1={56} x2={160} y2={88} />
      <Arrow id={id} x1={270} y1={56} x2={200} y2={88} />
      <Box x={110} y={90} w={140} h={34} cls="fill-accent-soft stroke-accent" />
      <T x={180} y={111} size={11}>One jobs report</T>
      <Arrow id={id} x1={180} y1={126} x2={180} y2={146} dash="4 3" />
      <T x={180} y={162} size={10.5} cls={SUB}>later revised, sometimes a lot</T>
    </Frame>
  );
}

// ── L4. GDP and PMI ─────────────────────────────────────────────────────────

export function FigMacroGrowth({ title, caption }: FigProps) {
  const id = "macro-fig-growth";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="A timeline: PMI surveys arrive early in the month after, GDP arrives later as a first estimate and is revised afterwards. Under it, a PMI gauge with 50 marked as the line between expanding and contracting.">
      <line x1={20} x2={340} y1={40} y2={40} className="stroke-line-strong" />
      {[["Quarter ends", 30], ["PMI (survey)", 110], ["GDP first estimate", 220], ["Revisions", 320]].map(([t, x]) => (
        <g key={t as string}>
          <circle cx={x as number} cy={40} r={5} className={t === "PMI (survey)" ? "fill-accent" : "fill-fg-muted"} />
          <T x={x as number} y={26} size={10}>{t}</T>
        </g>
      ))}
      <T x={180} y={62} size={10.5} cls={SUB}>early and rough → late and fuller</T>
      <rect x={60} y={90} width={120} height={20} className="fill-down/30" />
      <rect x={180} y={90} width={120} height={20} className="fill-up/30" />
      <line x1={180} x2={180} y1={84} y2={116} className="stroke-fg" strokeWidth={2} />
      <T x={180} y={132} size={11} weight={600}>50</T>
      <T x={120} y={104} size={10.5}>contracting</T>
      <T x={240} y={104} size={10.5}>expanding</T>
      <T x={180} y={156} size={10.5} cls={SUB}>A PMI counts how many firms report better or worse.</T>
    </Frame>
  );
}

// ── L5. Yield curve ─────────────────────────────────────────────────────────

export function FigMacroYieldCurve({ title, caption }: FigProps) {
  const id = "macro-fig-yield-curve";
  const xs = [40, 110, 180, 250, 320];
  const curves = [
    { cls: "stroke-accent", pts: [120, 100, 85, 72, 64], label: "normal" },
    { cls: "stroke-warn", pts: [90, 88, 87, 86, 85], label: "flat" },
    { cls: "stroke-down", pts: [58, 70, 82, 88, 86], label: "inverted" },
  ];
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Three yield curves drawn across maturities from 3 months to 30 years: a normal curve rising to the right, a flat curve, and an inverted curve that starts high and falls.">
      <line x1={30} x2={340} y1={140} y2={140} className="stroke-line-strong" />
      <line x1={30} x2={30} y1={20} y2={140} className="stroke-line-strong" />
      <T x={14} y={80} size={10} cls={SUB}>yield</T>
      {["3m", "2y", "5y", "10y", "30y"].map((m, i) => <T key={m} x={xs[i]} y={156} size={10} cls={SUB}>{m}</T>)}
      {curves.map((c) => (
        <path key={c.label} d={c.pts.map((y, i) => `${i ? "L" : "M"}${xs[i]},${y}`).join("")} fill="none" className={c.cls} strokeWidth={2} />
      ))}
      <T x={300} y={58} size={10.5} cls="fill-accent-strong">normal</T>
      <T x={300} y={100} size={10.5} cls="fill-warn">flat</T>
      <T x={70} y={50} size={10.5} cls="fill-down">inverted</T>
    </Frame>
  );
}

// ── L6. Rate differentials ──────────────────────────────────────────────────

export function FigMacroDifferential({ title, caption }: FigProps) {
  const id = "macro-fig-differential";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Two countries' interest rates drawn as bars, one higher than the other. The gap between them is the rate differential. An arrow shows that money tends to be drawn toward the higher rate, while a second dashed arrow warns that the exchange rate can move against the position.">
      <rect x={50} y={40} width={60} height={90} className="fill-accent/50" />
      <rect x={140} y={95} width={60} height={35} className="fill-fg-subtle/40" />
      <line x1={30} x2={220} y1={130} y2={130} className="stroke-line-strong" />
      <T x={80} y={146} size={10.5}>Currency A</T>
      <T x={170} y={146} size={10.5}>Currency B</T>
      <line x1={112} x2={135} y1={40} y2={40} className="stroke-warn" strokeDasharray="3 3" />
      <line x1={124} x2={124} y1={40} y2={95} className="stroke-warn" strokeWidth={1.5} />
      <T x={128} y={70} a="start" size={10} cls="fill-warn">gap</T>
      <Arrow id={id} x1={240} y1={60} x2={330} y2={60} />
      <T x={285} y={50} size={10.5}>carry earned daily</T>
      <Arrow id={id} x1={330} y1={110} x2={240} y2={110} cls="stroke-down" dash="4 3" />
      <T x={285} y={100} size={10.5} cls="fill-down">FX move can undo it</T>
    </Frame>
  );
}

// ── L7. Risk-on / risk-off ──────────────────────────────────────────────────

export function FigMacroRiskOnOff({ title, caption }: FigProps) {
  const id = "macro-fig-risk-on-off";
  return (
    <Frame id={id} title={title} caption={caption} h={160} label="A see-saw between riskier assets such as shares and higher-yielding currencies on one side, and havens such as some government bonds and some currencies on the other. A note says the links between them change over time.">
      <polygon points="170,120 190,120 180,100" className="fill-fg-muted" />
      <line x1={50} x2={310} y1={88} y2={112} className="stroke-fg" strokeWidth={3} />
      <Box x={20} y={50} w={110} h={32} cls="fill-up/20 stroke-up" />
      <T x={75} y={70} size={10.5}>Riskier assets</T>
      <Box x={230} y={76} w={110} h={32} cls="fill-accent-soft stroke-accent" />
      <T x={285} y={96} size={10.5}>Havens</T>
      <T x={180} y={146} size={10.5} cls={SUB}>The see-saw is a habit, not a law: links can flip.</T>
    </Frame>
  );
}

// ── L8. Economic calendar ───────────────────────────────────────────────────

export function FigMacroCalendar({ title, caption }: FigProps) {
  const id = "macro-fig-calendar";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="A calendar row with three columns: consensus, actual and surprise. The surprise is actual minus consensus. Below, two cases: a high level that matched consensus causing little move, and a modest level well above consensus causing a larger move.">
      {["Consensus", "Actual", "Surprise = actual − consensus"].map((t, i) => (
        <g key={t}>
          <Box x={10 + i * (i === 2 ? 110 : 110)} y={10} w={i === 2 ? 130 : 100} h={32} cls={i === 2 ? "fill-accent-soft stroke-accent" : undefined} />
          <T x={(i === 2 ? 75 : 60) + i * 110} y={30} size={i === 2 ? 9.5 : 11}>{t}</T>
        </g>
      ))}
      <Box x={10} y={64} w={165} h={86} />
      <T x={92} y={84} size={11}>High, as expected</T>
      <line x1={30} x2={155} y1={120} y2={118} className="stroke-fg-muted" strokeWidth={2} />
      <T x={92} y={140} size={10} cls={SUB}>small move</T>
      <Box x={185} y={64} w={165} h={86} cls="fill-raised stroke-warn" />
      <T x={267} y={84} size={11}>Modest, far above</T>
      <path d="M205,124 L245,122 L255,96 L330,92" fill="none" className="stroke-warn" strokeWidth={2} />
      <T x={267} y={140} size={10} cls={SUB}>bigger move</T>
    </Frame>
  );
}

// ── L9. News spike ──────────────────────────────────────────────────────────

export function FigMacroNewsSpike({ title, caption }: FigProps) {
  const id = "macro-fig-news-spike";
  return (
    <Frame id={id} title={title} caption={caption} h={180} label="Bid and ask lines close together before a release, then far apart at the release while price jumps with a gap, then narrowing again. A stop level is drawn below; the fill lands below the stop, at the first price after the gap.">
      <path d="M10,70 L150,70 L160,124 L350,120" fill="none" className="stroke-fg" strokeWidth={1.5} />
      <path d="M10,64 L150,64 L156,40 L162,108 L230,112 L350,114" fill="none" className="stroke-up" strokeWidth={1.25} strokeDasharray="3 2" />
      <path d="M10,76 L150,76 L156,100 L162,142 L230,132 L350,126" fill="none" className="stroke-down" strokeWidth={1.25} strokeDasharray="3 2" />
      <line x1={155} x2={155} y1={20} y2={160} className="stroke-warn" strokeDasharray="4 3" />
      <T x={155} y={16} size={10.5} cls="fill-warn">release</T>
      <line x1={10} x2={350} y1={96} y2={96} className="stroke-accent" strokeDasharray="6 3" />
      <T x={12} y={92} a="start" size={10} cls="fill-accent-strong">your stop</T>
      <circle cx={163} cy={140} r={4} className="fill-down" />
      <T x={172} y={156} a="start" size={10} cls="fill-down">fill: first price after the gap</T>
      <T x={60} y={56} size={10} cls={SUB}>tight spread</T>
      <T x={250} y={104} size={10} cls={SUB}>wide spread</T>
    </Frame>
  );
}

// ── L10. Earnings ───────────────────────────────────────────────────────────

export function FigMacroEarnings({ title, caption }: FigProps) {
  const id = "macro-fig-earnings";
  return (
    <Frame id={id} title={title} caption={caption} h={160} label="A share price line that stops at the close before results, then reopens much lower the next morning, leaving an empty gap. A stop level sits inside the gap, so no trade could happen at the stop.">
      <path d="M10,60 L60,56 L110,62 L160,54" fill="none" className="stroke-fg" strokeWidth={1.75} />
      <path d="M210,120 L260,116 L310,124 L350,118" fill="none" className="stroke-fg" strokeWidth={1.75} />
      <rect x={160} y={54} width={50} height={66} className="fill-down/10" />
      <line x1={160} x2={210} y1={88} y2={88} className="stroke-accent" strokeDasharray="5 3" />
      <T x={185} y={84} size={10} cls="fill-accent-strong">stop</T>
      <T x={185} y={140} size={10} cls="fill-down">gap: no trades here</T>
      <T x={90} y={40} size={10.5} cls={SUB}>close before results</T>
      <T x={280} y={100} size={10.5} cls={SUB}>open after results</T>
    </Frame>
  );
}

// ── L11. Shocks ─────────────────────────────────────────────────────────────

export function FigMacroShocks({ title, caption }: FigProps) {
  const id = "macro-fig-shocks";
  return (
    <Frame id={id} title={title} caption={caption} h={160} label="Two timelines. Scheduled news has a known time, a consensus and a chance to stand aside. Unscheduled shocks arrive with no warning, no consensus and often first as rumours.">
      <Box x={10} y={10} w={165} h={130} />
      <T x={92} y={30} size={11} weight={600}>Scheduled</T>
      {["known time", "a consensus", "can stand aside"].map((t, i) => <T key={t} x={92} y={60 + i * 24} size={10.5}>{t}</T>)}
      <Box x={185} y={10} w={165} h={130} cls="fill-raised stroke-down" />
      <T x={267} y={30} size={11} weight={600}>Unscheduled</T>
      {["no warning", "no consensus", "rumours first"].map((t, i) => <T key={t} x={267} y={60 + i * 24} size={10.5}>{t}</T>)}
    </Frame>
  );
}

// ── L12. Statements ─────────────────────────────────────────────────────────

export function FigMacroStatement({ title, caption }: FigProps) {
  const id = "macro-fig-statement";
  return (
    <Frame id={id} title={title} caption={caption} h={170} label="Two versions of a statement side by side as grey lines of text. Most lines are the same; one line is highlighted as changed. An arrow says: read the change, not the whole text.">
      {[0, 1].map((k) => (
        <g key={k}>
          <Box x={10 + k * 180} y={10} w={160} h={120} />
          <T x={90 + k * 180} y={28} size={10.5} cls={SUB}>{k ? "new statement" : "previous statement"}</T>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={22 + k * 180} y={40 + i * 20} width={136 - (i % 2) * 20} height={8} rx={3} className={k === 1 && i === 2 ? "fill-warn/70" : "fill-fg-subtle/30"} />
          ))}
        </g>
      ))}
      <T x={180} y={152} size={10.5}>Read the changed line, not the whole text.</T>
    </Frame>
  );
}

// ── L13. Sources ────────────────────────────────────────────────────────────

export function FigMacroSources({ title, caption }: FigProps) {
  const id = "macro-fig-sources";
  return (
    <Frame id={id} title={title} caption={caption} h={160} label="A chain from the primary source, such as the agency or central bank itself, to wire services and news outlets, to social media. Reliability falls and speed of rumours rises along the chain.">
      <Chain id={id} items={["Primary source", "Wire / outlet", "Commentary", "Social post"]} y={30} />
      <line x1={20} x2={340} y1={100} y2={100} className="stroke-line-strong" />
      <polygon points="340,100 330,95 330,105" className="fill-fg-muted" />
      <T x={20} y={120} a="start" size={10.5} cls="fill-up">most reliable</T>
      <T x={340} y={120} a="end" size={10.5} cls="fill-down">least checked</T>
      <T x={180} y={146} size={10.5} cls={SUB}>Trace every claim back to the left-hand box.</T>
    </Frame>
  );
}
