"use client";

import { useId, type ReactNode } from "react";
import { ImageIcon } from "lucide-react";
import { recoveryNeeded } from "@/lib/academy/risk";

/*
  Static, labelled SVG illustrations for the Risk Management track (one per
  core concept). They are registered as widgets so lesson content can place
  them with an "interactive" block, but they are not interactive: each is a
  plain <figure> with a fixed drawing. All numbers are made-up examples.
  Kept in one file so they can be restyled onto the shared illustration set.
*/

type FigProps = { title: string; caption: string };

const C = {
  fg: "var(--color-fg)",
  muted: "var(--color-fg-subtle)",
  line: "var(--color-line-strong)",
  accent: "var(--color-accent)",
  up: "var(--color-up)",
  down: "var(--color-down)",
  warn: "var(--color-warn)",
};

const W = 340;

function Figure({ title, caption, label, height, children }: FigProps & { label: string; height: number; children: ReactNode }) {
  const id = useId();
  return (
    <figure data-illustration className="my-4 min-w-0 rounded-lg border border-line bg-surface p-3 sm:p-4" aria-labelledby={`${id}-t`}>
      <p id={`${id}-t`} className="mb-2 flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-fg [overflow-wrap:anywhere]">
        <ImageIcon className="size-3.5 shrink-0 text-fg-subtle" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0">{title}</span>
        <span className="ml-auto shrink-0 text-[10px] uppercase tracking-[0.06em] text-fg-subtle">Diagram</span>
      </p>
      <svg role="img" aria-label={label} viewBox={`0 0 ${W} ${height}`} width="100%" className="block max-w-[420px]" style={{ fontSize: 13 }}>
        {children}
      </svg>
      <figcaption className="mt-2 border-t border-line pt-2 text-xs leading-relaxed text-fg-subtle">{caption}</figcaption>
    </figure>
  );
}

const T = ({ x, y, children, fill = C.fg, anchor = "start", size, weight }: { x: number; y: number; children: ReactNode; fill?: string; anchor?: "start" | "middle" | "end"; size?: number; weight?: number }) => (
  <text x={x} y={y} fill={fill} textAnchor={anchor} fontSize={size} fontWeight={weight} dominantBaseline="middle">{children}</text>
);

// ── L1. The R-multiple ladder ───────────────────────────────────────────────

export function FigRLadder({ title, caption }: FigProps) {
  const rungs = [3, 2, 1, 0, -1];
  const y = (r: number) => 24 + (3 - r) * 40;
  return (
    <Figure title={title} caption={caption} height={200} label="A ladder of results in R: the stop at minus 1R loses $100, the entry is 0, and plus 1R, 2R and 3R gain $100, $200 and $300 when $100 is risked.">
      <line x1={110} x2={110} y1={y(3)} y2={y(-1)} stroke={C.line} strokeWidth={2} />
      {rungs.map((r) => (
        <g key={r}>
          <line x1={92} x2={128} y1={y(r)} y2={y(r)} stroke={r < 0 ? C.down : r === 0 ? C.accent : C.up} strokeWidth={r === 0 ? 3 : 2} />
          <T x={82} y={y(r)} anchor="end" fill={r < 0 ? C.down : r === 0 ? C.accent : C.up} weight={600}>{r > 0 ? `+${r}R` : r === 0 ? "0R" : "−1R"}</T>
          <T x={140} y={y(r)}>{r === 0 ? "Entry" : r < 0 ? "Stop: −$100" : `Target: +$${r * 100}`}</T>
        </g>
      ))}
      <T x={250} y={y(1)} fill={C.muted}>Risk $100</T>
      <T x={250} y={y(0)} fill={C.muted}>= 1R</T>
    </Figure>
  );
}

// ── L2. Stop distance → position size ───────────────────────────────────────

export function FigStopSize({ title, caption }: FigProps) {
  const cases = [{ stop: 1, shares: 100 }, { stop: 2, shares: 50 }, { stop: 4, shares: 25 }];
  return (
    <Figure title={title} caption={caption} height={190} label="Three positions that all risk $100: a $1 stop allows 100 shares, a $2 stop 50 shares, a $4 stop 25 shares. Each rectangle has the same area.">
      {cases.map((c, i) => {
        const x = [20, 165, 260][i], w = c.shares * 1.2, h = c.stop * 28;
        return (
          <g key={i}>
            <rect x={x} y={150 - h} width={w} height={h} fill={C.down} fillOpacity={0.18} stroke={C.down} />
            <T x={x} y={163} fill={C.muted}>{`${c.shares} shares`}</T>
            <T x={x} y={178} fill={C.muted}>{`× $${c.stop} stop`}</T>
            <T x={x + w / 2} y={150 - h / 2} anchor="middle" weight={600}>$100</T>
          </g>
        );
      })}
      <T x={20} y={14} fill={C.fg} weight={600}>Same risk, different size</T>
      <T x={20} y={30} fill={C.muted}>height = stop distance, width = shares</T>
    </Figure>
  );
}

// ── L3. Structure stop and ATR stop ─────────────────────────────────────────

export function FigStopMethods({ title, caption }: FigProps) {
  const pts = [[10, 120], [40, 100], [70, 112], [100, 84], [130, 104], [160, 72], [190, 92], [220, 58], [250, 70]];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join("");
  return (
    <Figure title={title} caption={caption} height={190} label="An uptrend of higher lows. The entry is at the last price. A structure stop sits just below the most recent swing low; an ATR stop sits two average true ranges below the entry.">
      <path d={d} fill="none" stroke={C.accent} strokeWidth={2} />
      <circle cx={190} cy={92} r={4} fill={C.up} />
      <T x={196} y={104} fill={C.up}>swing low</T>
      <line x1={250} x2={330} y1={70} y2={70} stroke={C.accent} strokeWidth={1.5} />
      <T x={330} y={60} anchor="end" fill={C.accent}>entry</T>
      <line x1={10} x2={330} y1={100} y2={100} stroke={C.down} strokeDasharray="4 3" />
      <T x={330} y={90} anchor="end" fill={C.down}>structure stop</T>
      <line x1={10} x2={330} y1={142} y2={142} stroke={C.warn} strokeDasharray="4 3" />
      <T x={330} y={154} anchor="end" fill={C.warn}>2 × ATR stop</T>
      <line x1={290} x2={290} y1={72} y2={140} stroke={C.muted} />
      <T x={284} y={121} anchor="end" fill={C.muted}>2 ATR</T>
      <T x={10} y={178} fill={C.muted}>Wider stop → fewer shares, same risk.</T>
    </Figure>
  );
}

// ── L4. Break-even win rate by reward-to-risk ───────────────────────────────

export function FigBreakeven({ title, caption }: FigProps) {
  const rows = [1, 2, 3, 4].map((rr) => ({ rr, p: 100 / (1 + rr) }));
  return (
    <Figure title={title} caption={caption} height={170} label="Break-even win rates: 50% at 1 to 1, 33% at 2 to 1, 25% at 3 to 1 and 20% at 4 to 1.">
      <T x={10} y={12} weight={600}>Win rate needed to break even</T>
      {rows.map((r, i) => {
        const y = 36 + i * 32, w = r.p * 2.4;
        return (
          <g key={r.rr}>
            <T x={10} y={y + 8} fill={C.muted}>{`${r.rr} : 1`}</T>
            <rect x={60} y={y} width={w} height={16} rx={3} fill={C.accent} fillOpacity={0.75} />
            <T x={66 + w} y={y + 8}>{`${Math.round(r.p)}%`}</T>
          </g>
        );
      })}
      <T x={10} y={164} fill={C.muted}>break-even = 1 ÷ (1 + reward-to-risk)</T>
    </Figure>
  );
}

// ── L5. Drawdown and recovery ───────────────────────────────────────────────

export function FigRecovery({ title, caption }: FigProps) {
  const rows = [10, 20, 33, 50, 75].map((x) => ({ x, g: recoveryNeeded(x) ?? 0 }));
  const sc = 0.4; // px per % gain (300% → 120px)
  return (
    <Figure title={title} caption={caption} height={200} label="Loss and the gain needed to recover: 10% needs 11%, 20% needs 25%, 33% needs 50%, 50% needs 100%, 75% needs 300%.">
      <T x={10} y={12} fill={C.down} weight={600}>Loss</T>
      <T x={150} y={12} fill={C.up} weight={600}>Gain needed to get back</T>
      {rows.map((r, i) => {
        const y = 32 + i * 32;
        return (
          <g key={r.x}>
            <rect x={130 - r.x * 1.4} y={y} width={r.x * 1.4} height={16} rx={3} fill={C.down} fillOpacity={0.7} />
            <T x={10} y={y + 8}>{`−${r.x}%`}</T>
            <rect x={150} y={y} width={Math.max(2, r.g * sc)} height={16} rx={3} fill={C.up} fillOpacity={0.7} />
            <T x={156 + r.g * sc} y={y + 8}>{`+${Math.round(r.g)}%`}</T>
          </g>
        );
      })}
      <T x={10} y={194} fill={C.muted}>gain = loss ÷ (1 − loss)</T>
    </Figure>
  );
}

// ── L6. The margin and liquidation ladder ───────────────────────────────────

export function FigMarginLadder({ title, caption }: FigProps) {
  const rows = [
    { y: 30, price: "1.1000", eq: "$5,000", lvl: "136%", label: "Open: margin used $3,667", tone: C.accent },
    { y: 90, price: "1.0867", eq: "$3,667", lvl: "100%", label: "Margin call: no new positions", tone: C.warn },
    { y: 150, price: "1.0683", eq: "$1,833", lvl: "50%", label: "Stop-out: broker closes it", tone: C.down },
  ];
  return (
    <Figure title={title} caption={caption} height={190} label="One lot of EUR/USD bought at 1.1000 in a $5,000 account at 1 to 30. The margin level is 136% at the start, reaches the 100% margin call near 1.0867 and the 50% stop-out near 1.0683.">
      <line x1={70} x2={70} y1={30} y2={150} stroke={C.line} strokeWidth={6} strokeLinecap="round" />
      {rows.map((r) => (
        <g key={r.price}>
          <circle cx={70} cy={r.y} r={7} fill={r.tone} />
          <T x={58} y={r.y} anchor="end" weight={600}>{r.price}</T>
          <T x={84} y={r.y - 8} fill={r.tone} weight={600}>{`${r.lvl} margin level · equity ${r.eq}`}</T>
          <T x={84} y={r.y + 8} fill={C.muted}>{r.label}</T>
        </g>
      ))}
      <T x={10} y={178} fill={C.muted}>A 2.9% fall reaches the stop-out (22 : 1).</T>
    </Figure>
  );
}

// ── L7. Correlated positions stack into one bet ─────────────────────────────

export function FigHeatStack({ title, caption }: FigProps) {
  const usd = ["Long EUR/USD", "Long GBP/USD", "Long AUD/USD"];
  return (
    <Figure title={title} caption={caption} height={190} label="Three positions of 1% each against the US dollar stack into one 3% bet on the dollar, while a 1% gold position and a 1% share position are separate. Total heat is 5%.">
      <T x={10} y={12} weight={600}>What looks like five 1% risks</T>
      {usd.map((u, i) => (
        <g key={u}>
          <rect x={20} y={140 - (i + 1) * 34} width={130} height={30} rx={4} fill={C.down} fillOpacity={0.2} stroke={C.down} />
          <T x={30} y={140 - (i + 1) * 34 + 15}>{`${u} 1%`}</T>
        </g>
      ))}
      <T x={20} y={156} fill={C.down} weight={600}>One dollar bet: 3%</T>
      <rect x={190} y={106} width={130} height={30} rx={4} fill={C.accent} fillOpacity={0.15} stroke={C.accent} />
      <T x={200} y={121}>Long gold 1%</T>
      <rect x={190} y={72} width={130} height={30} rx={4} fill={C.accent} fillOpacity={0.15} stroke={C.accent} />
      <T x={200} y={87}>Long a share 1%</T>
      <T x={190} y={156} fill={C.accent} weight={600}>Separate ideas</T>
      <T x={10} y={180} fill={C.muted}>Heat (all stops hit) = 3% + 1% + 1% = 5%</T>
    </Figure>
  );
}

// ── L8. A gap through a stop ────────────────────────────────────────────────

export function FigGap({ title, caption }: FigProps) {
  const y = (p: number) => 20 + (52 - p) * 14;
  return (
    <Figure title={title} caption={caption} height={190} label="A share closes at $50 with a stop at $48. Overnight news makes it open at $44, below the stop, so the stop fills near $44: a loss of $6 a share instead of the planned $2.">
      <rect x={60} y={y(51)} width={22} height={y(49.6) - y(51)} fill={C.up} fillOpacity={0.6} />
      <line x1={71} x2={71} y1={y(51.4)} y2={y(49.2)} stroke={C.up} />
      <T x={90} y={y(50)}>close $50</T>
      <line x1={20} x2={330} y1={y(48)} y2={y(48)} stroke={C.warn} strokeDasharray="4 3" />
      <T x={330} y={y(48) - 10} anchor="end" fill={C.warn}>stop $48 (planned −$2)</T>
      <T x={20} y={y(46.2)} fill={C.muted}>gap: no trades here</T>
      <rect x={160} y={y(44)} width={22} height={y(42.6) - y(44)} fill={C.down} fillOpacity={0.6} />
      <line x1={171} x2={171} y1={y(44.3)} y2={y(42.3)} stroke={C.down} />
      <T x={190} y={y(44)} fill={C.down} weight={600}>opens $44</T>
      <T x={190} y={y(43)} fill={C.down}>fills ≈ $44 (−$6)</T>
      <T x={10} y={182} fill={C.muted}>Loss = 3 × the plan. Stops are not guaranteed.</T>
    </Figure>
  );
}

// ── L9. Averaging down: price falls, size grows ─────────────────────────────

export function FigAveraging({ title, caption }: FigProps) {
  const buys = [{ p: 100, q: 10 }, { p: 90, q: 20 }, { p: 80, q: 40 }, { p: 70, q: 80 }];
  let tot = 0, paid = 0;
  const rows = buys.map((b) => { tot += b.q; paid += b.p * b.q; return { ...b, tot, avg: paid / tot }; });
  return (
    <Figure title={title} caption={caption} height={200} label="Doubling a position at $100, $90, $80 and $70: the shares held grow from 10 to 150 while the average price falls only to about $77.">
      <T x={10} y={12} weight={600}>Each buy doubles the last</T>
      {rows.map((r, i) => {
        const x = 30 + i * 78, h = r.tot * 0.8;
        return (
          <g key={r.p}>
            <rect x={x} y={160 - h} width={44} height={h} rx={3} fill={C.down} fillOpacity={0.25 + i * 0.15} />
            <T x={x + 22} y={152 - h} anchor="middle">{`${r.tot}`}</T>
            <T x={x + 22} y={172} anchor="middle" fill={C.muted}>{`$${r.p}`}</T>
            <T x={x + 22} y={188} anchor="middle" fill={C.accent}>{`avg ${Math.round(r.avg)}`}</T>
          </g>
        );
      })}
      <T x={330} y={12} anchor="end" fill={C.muted}>shares held</T>
    </Figure>
  );
}

// ── L10. Fixed fractional vs fixed dollar through a losing run ──────────────

export function FigSizingPaths({ title, caption }: FigProps) {
  const n = 12, r = 0.08;
  const ff = Array.from({ length: n + 1 }, (_, i) => 10_000 * (1 - r) ** i);
  const fd = Array.from({ length: n + 1 }, (_, i) => Math.max(0, 10_000 - i * 10_000 * r));
  const X = (i: number) => 40 + (i / n) * 280, Y = (v: number) => 20 + (1 - v / 10_000) * 130;
  const path = (vs: number[]) => vs.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join("");
  return (
    <Figure title={title} caption={caption} height={190} label="Twelve losses in a row at 8% risk: fixed fractional falls to about 37% of the start and slows down, fixed dollar falls in a straight line to 4% of the start.">
      <line x1={40} x2={320} y1={Y(0)} y2={Y(0)} stroke={C.line} />
      <T x={34} y={Y(10_000)} anchor="end" fill={C.muted}>$10k</T>
      <T x={34} y={Y(0)} anchor="end" fill={C.muted}>$0</T>
      <path d={path(ff)} fill="none" stroke={C.accent} strokeWidth={2} />
      <path d={path(fd)} fill="none" stroke={C.down} strokeWidth={2} strokeDasharray="5 3" />
      <T x={X(n) - 2} y={Y(ff[n]) - 10} anchor="end" fill={C.accent}>fixed fractional ≈ $3,700</T>
      <T x={X(n) - 2} y={Y(fd[n]) - 10} anchor="end" fill={C.down}>fixed dollar $400</T>
      <T x={40} y={180} fill={C.muted}>12 losses in a row, 8% risk per trade</T>
    </Figure>
  );
}
