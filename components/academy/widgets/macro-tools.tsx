"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  BASKET, EVENT_KINDS, MATURITIES, basketInflation, carry, classifyCurve, diffusionIndex, earningsGap, histogram, quantile, sentenceDiff,
  simulateSpike, simulateSurprise, switchingCorrelation, toneScore, type EventKind,
} from "@/lib/academy/macro";
import { cn } from "@/lib/cn";
import { Choice, Readout, Readouts, Result, Slider, WidgetFrame, money, num, signed } from "./kit";
import { LinePlot } from "./risk-plot";

/*
  Tools for the Macro and News track. Every release, rate, statement and
  source here is made up, and every reaction is drawn from a seeded random
  model or computed from what the learner sets. Nothing is live or real data.
*/

type P = { title: string; caption: string };
const sp = (x: number, dp = 2) => (Number.isFinite(x) ? `${signed(x, dp)}%` : "–");
const pc = (x: number, dp = 0) => (Number.isFinite(x) ? `${num(x * 100, dp)}%` : "–");

/** A small histogram with an optional marked value. */
function Histogram({ values, lo, hi, bins = 20, mark, label, unit }: { values: readonly number[]; lo: number; hi: number; bins?: number; mark?: number; label: string; unit: (v: number) => string }) {
  const h = histogram(values, lo, hi, bins);
  const max = Math.max(1, ...h);
  const W = 360, H = 130, X0 = 10, PW = 340;
  const ax = (v: number) => X0 + ((v - lo) / Math.max(1e-9, hi - lo)) * PW;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      {h.map((c, k) => <rect key={k} x={X0 + (k * PW) / bins} y={100 - (c / max) * 90} width={PW / bins - 1.5} height={(c / max) * 90} className="fill-accent/60" />)}
      <line x1={X0} x2={X0 + PW} y1={100.5} y2={100.5} className="stroke-line-strong" />
      {mark !== undefined && Number.isFinite(mark) && mark >= lo && mark <= hi && <line x1={ax(mark)} x2={ax(mark)} y1={6} y2={102} className="stroke-warn" strokeWidth={1.5} strokeDasharray="4 3" />}
      <text x={X0} y={116} fontSize={10} className="fill-fg-subtle">{unit(lo)}</text>
      <text x={X0 + PW / 2} y={116} fontSize={10} textAnchor="middle" className="fill-fg-subtle">{unit((lo + hi) / 2)}</text>
      <text x={X0 + PW} y={116} fontSize={10} textAnchor="end" className="fill-fg-subtle">{unit(hi)}</text>
    </svg>
  );
}

// ── Economic-calendar surprise simulator ────────────────────────────────────

const RELEASES = {
  nfp: { label: "Payrolls", unit: "thousand jobs", min: -50, max: 400, step: 10, consensus: 150, sd: 60, beta: 0.25, noise: 0.15, dp: 0 },
  cpi: { label: "CPI, monthly", unit: "%", min: -0.3, max: 1, step: 0.1, consensus: 0.3, sd: 0.1, beta: 0.3, noise: 0.15, dp: 1 },
  pmi: { label: "PMI", unit: "index", min: 40, max: 60, step: 0.5, consensus: 50, sd: 1.5, beta: 0.12, noise: 0.1, dp: 1 },
} as const;
type ReleaseId = keyof typeof RELEASES;

export function SurpriseSimulator({ title, caption }: P) {
  const [rel, setRelRaw] = useState<ReleaseId>("nfp");
  const r = RELEASES[rel];
  const [consensus, setConsensus] = useState<number>(r.consensus);
  const [actual, setActual] = useState<number>(r.consensus + 2 * r.step);
  const [seed, setSeed] = useState(1);
  const setRel = (id: ReleaseId) => { setRelRaw(id); setConsensus(RELEASES[id].consensus); setActual(RELEASES[id].consensus + 2 * RELEASES[id].step); };
  const res = useMemo(() => simulateSurprise({ consensus, actual, surpriseSd: r.sd, beta: r.beta, noise: r.noise, seed }), [consensus, actual, r, seed]);
  const fmt = (v: number) => `${num(v, r.dp)}${r.unit === "%" ? "%" : ""}`;
  const big = Math.abs(res.standardised) >= 1;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Made-up release" value={rel} options={(Object.keys(RELEASES) as ReleaseId[]).map((id) => ({ id, label: RELEASES[id].label }))} onChange={setRel} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label={`Consensus (${r.unit})`} value={consensus} min={r.min} max={r.max} step={r.step} onChange={setConsensus} format={fmt} />
        <Slider label={`Actual (${r.unit})`} value={actual} min={r.min} max={r.max} step={r.step} onChange={setActual} format={fmt} />
      </div>
      <Histogram values={res.moves} lo={-1.5} hi={1.5} mark={0} label="Histogram of 1,000 simulated price moves in the minutes after the release, with zero marked." unit={(v) => `${signed(v, 1)}%`} />
      <Readouts cols={3}>
        <Readout label="Surprise (actual − consensus)" value={`${signed(res.surprise, r.dp)}${r.unit === "%" ? " pts" : ""}`} />
        <Readout label="Surprise in typical sizes" value={signed(res.standardised, 1)} sub={`one typical surprise = ${num(r.sd, r.dp)}`} tone={big ? "warn" : undefined} />
        <Readout label="Average simulated move" value={sp(res.mean)} />
        <Readout label="90% of simulated moves" value={`${sp(res.p5)} to ${sp(res.p95)}`} />
        <Readout label="Share of moves up" value={pc(res.shareUp)} />
      </Readouts>
      <div><Button onClick={() => setSeed((s) => s + 1)}>New simulated draws</Button></div>
      <Result tone={big ? "warn" : "info"}>
        {Math.abs(res.surprise) < 1e-9
          ? `Actual equals consensus. However high or low ${fmt(actual)} is, in this model it was already expected, so the average move is about zero.`
          : `The release came in ${res.surprise > 0 ? "above" : "below"} consensus by ${num(Math.abs(res.standardised), 1)} typical surprises. Even so, ${pc(res.surprise > 0 ? 1 - res.shareUp : res.shareUp)} of simulated moves went the other way, because other news and positioning add noise.`}{" "}
        Move the consensus and keep the actual fixed: the reaction follows the gap, not the level.
      </Result>
    </WidgetFrame>
  );
}

// ── Rate differential and carry calculator ──────────────────────────────────

export function CarryCalculator({ title, caption }: P) {
  const [longRate, setLong] = useState(4.5);
  const [shortRate, setShort] = useState(1);
  const [notional, setNotional] = useState(10_000);
  const [days, setDays] = useState(90);
  const [markup, setMarkup] = useState(0.5);
  const [fx, setFx] = useState(0);
  const c = carry({ longRate, shortRate, notional, days, markup, fxMovePct: fx });
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Rate of the currency you buy (made up)" value={longRate} min={0} max={10} step={0.25} onChange={setLong} format={(v) => `${num(v, 2)}%`} />
        <Slider label="Rate of the currency you sell (made up)" value={shortRate} min={0} max={10} step={0.25} onChange={setShort} format={(v) => `${num(v, 2)}%`} />
        <Slider label="Position size" value={notional} min={1_000} max={100_000} step={1_000} onChange={setNotional} format={(v) => money(v, "USD", 0)} />
        <Slider label="Days held" value={days} min={1} max={365} step={1} onChange={setDays} />
        <Slider label="Broker's mark-up on the differential" value={markup} min={0} max={2} step={0.1} onChange={setMarkup} format={(v) => `${num(v, 1)} pts a year`} />
        <Slider label="Exchange-rate move over the period" value={fx} min={-10} max={10} step={0.5} onChange={setFx} format={(v) => sp(v, 1)} />
      </div>
      <Readouts cols={3}>
        <Readout label="Rate differential" value={`${signed(c.diff, 2)} pts`} />
        <Readout label="After the mark-up" value={`${signed(c.netDiff, 2)} pts`} />
        <Readout label="Carry over the period" value={money(c.carryMoney, "USD", 0)} sub={sp(c.carryPct, 2)} tone={c.carryMoney >= 0 ? "up" : "down"} />
        <Readout label="Exchange-rate gain or loss" value={money(c.fxMoney, "USD", 0)} tone={c.fxMoney >= 0 ? "up" : "down"} />
        <Readout label="Total" value={money(c.total, "USD", 0)} tone={c.total >= 0 ? "up" : "down"} />
        <Readout label="Adverse move that wipes out the carry" value={sp(-Math.abs(c.breakevenMovePct), 2)} />
      </Readouts>
      <Result tone={c.total < 0 && c.carryMoney > 0 ? "warn" : "info"}>
        {c.carryMoney > 0 && c.total < 0
          ? "The carry was positive, but the exchange rate moved against you by more than it earned. Carry is small and slow; currency moves can be large and fast."
          : "Carry accrues a little each day. A small move in the exchange rate can add to it or wipe it out."}{" "}
        The rates and moves here are made up; check your broker's actual swap rates.
      </Result>
    </WidgetFrame>
  );
}

// ── Yield-curve builder ─────────────────────────────────────────────────────

const PRESETS: Record<string, Record<string, number>> = {
  normal: { "3m": 2, "2y": 2.6, "5y": 3.1, "10y": 3.6, "30y": 4 },
  flat: { "3m": 3.5, "2y": 3.6, "5y": 3.6, "10y": 3.7, "30y": 3.8 },
  inverted: { "3m": 5, "2y": 4.6, "5y": 4.1, "10y": 3.9, "30y": 4 },
};
const YMIN = 0, YMAX = 8;

export function YieldCurveBuilder({ title, caption }: P) {
  const [y, setY] = useState<Record<string, number>>(PRESETS.normal);
  const [drag, setDrag] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const W = 360, H = 200, X0 = 40, X1 = 345, T0 = 12, B0 = 170;
  const xs = (k: number) => X0 + (k / (MATURITIES.length - 1)) * (X1 - X0);
  const ys = (v: number) => B0 - ((v - YMIN) / (YMAX - YMIN)) * (B0 - T0);
  const clamp = (v: number) => Math.round(Math.max(YMIN, Math.min(YMAX, v)) * 20) / 20;
  const c = classifyCurve(y);
  const setAt = (id: string, v: number) => setY((s) => ({ ...s, [id]: clamp(v) }));
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drag || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const py = ((e.clientY - r.top) / r.height) * H;
    setAt(drag, YMIN + ((B0 - py) / (B0 - T0)) * (YMAX - YMIN));
  };
  const onKey = (id: string) => (e: KeyboardEvent<SVGCircleElement>) => {
    const d = e.key === "ArrowUp" ? 0.05 : e.key === "ArrowDown" ? -0.05 : e.key === "PageUp" ? 0.5 : e.key === "PageDown" ? -0.5 : 0;
    if (d) { e.preventDefault(); setAt(id, (y[id] ?? 0) + d); }
  };
  const path = MATURITIES.map((m, k) => `${k ? "L" : "M"}${xs(k)},${ys(y[m.id])}`).join("");
  const SHAPE = { normal: "Normal (upward sloping)", flat: "Flat", inverted: "Inverted" } as const;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="flex flex-wrap gap-2">
        {Object.keys(PRESETS).map((k) => <Button key={k} onClick={() => setY(PRESETS[k])}>{`Start from ${k}`}</Button>)}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none"
        role="group"
        aria-label="Made-up yield curve. Drag a point up or down, or focus it and use the arrow keys."
        onPointerMove={onMove}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        {[0, 2, 4, 6, 8].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={ys(v)} y2={ys(v)} className="stroke-line" />
            <text x={X0 - 6} y={ys(v) + 4} fontSize={10} textAnchor="end" className="fill-fg-subtle">{`${v}%`}</text>
          </g>
        ))}
        <path d={path} fill="none" className={cn(c.shape === "inverted" ? "stroke-down" : c.shape === "flat" ? "stroke-warn" : "stroke-accent")} strokeWidth={2} />
        {MATURITIES.map((m, k) => (
          <g key={m.id}>
            <circle
              cx={xs(k)}
              cy={ys(y[m.id])}
              r={drag === m.id ? 9 : 7}
              tabIndex={0}
              role="slider"
              aria-label={`${m.label} yield`}
              aria-valuemin={YMIN}
              aria-valuemax={YMAX}
              aria-valuenow={y[m.id]}
              aria-valuetext={`${num(y[m.id], 2)}%`}
              className="cursor-ns-resize fill-surface stroke-accent focus-visible:outline-none focus-visible:stroke-fg"
              strokeWidth={2}
              onPointerDown={(e) => { e.preventDefault(); (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId); setDrag(m.id); }}
              onKeyDown={onKey(m.id)}
            />
            <text x={xs(k)} y={B0 + 16} fontSize={11} textAnchor="middle" className="fill-fg-muted">{m.label}</text>
            <text x={xs(k)} y={ys(y[m.id]) - 12} fontSize={10} textAnchor="middle" className="fill-fg tabular">{num(y[m.id], 2)}</text>
          </g>
        ))}
        <text x={X1} y={H - 4} fontSize={10} textAnchor="end" className="fill-fg-subtle">maturity</text>
      </svg>
      <Readouts cols={3}>
        <Readout label="10-year minus 3-month" value={`${signed(c.spread10y3m, 2)} pts`} tone={c.shape === "inverted" ? "down" : undefined} />
        <Readout label="10-year minus 2-year" value={`${signed(c.spread10y2y, 2)} pts`} />
        <Readout label="Shape" value={SHAPE[c.shape]} tone={c.shape === "inverted" ? "down" : c.shape === "flat" ? "warn" : "up"} />
      </Readouts>
      <Result tone={c.shape === "inverted" ? "warn" : "info"}>
        {c.shape === "inverted"
          ? "Short rates are above long rates. In past US data an inversion has often come before recessions, but with a long, uneven delay and at least some false alarms. It is a warning light, not a timing signal."
          : c.shape === "flat"
            ? "Short and long yields are close together. Markets expect little change in rates, or rising short rates are catching up with long ones."
            : "Long yields are above short ones, the usual shape: lenders want more for tying money up for longer."}{" "}
        "Flat" here means a 10-year minus 3-month spread between 0 and 0.5 points, this course's convention.
      </Result>
    </WidgetFrame>
  );
}

// ── News-spike spread and slippage simulator ────────────────────────────────

export function NewsSpikeSimulator({ title, caption }: P) {
  const [kind, setKind] = useState<EventKind>("major");
  const [base, setBase] = useState(1);
  const [stop, setStop] = useState(15);
  const [seed, setSeed] = useState(1);
  const r = useMemo(() => simulateSpike({ kind, baseSpread: base, stopPips: stop, seed }), [kind, base, stop, seed]);
  const ev = EVENT_KINDS.find((e) => e.id === kind)!;
  const medR = quantile(r.stopLossR, 0.5), p95R = quantile(r.stopLossR, 0.95);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Simulated event" value={kind} options={EVENT_KINDS.map((e) => ({ id: e.id, label: e.label }))} onChange={setKind} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Normal spread" value={base} min={0.5} max={3} step={0.1} onChange={setBase} format={(v) => `${num(v, 1)} pips`} />
        <Slider label="Stop distance (long trade)" value={stop} min={5} max={60} step={1} onChange={setStop} format={(v) => `${v} pips`} />
      </div>
      {r.stopLossR.length >= 5 ? (
        <Histogram values={r.stopLossR} lo={1} hi={4} bins={15} mark={1} label="Histogram of the loss on each stopped trade, as a multiple of the planned loss, with the planned loss of 1 marked." unit={(v) => `${num(v, 1)}×`} />
      ) : (
        <p className="t-small">The stop was hit in fewer than 5 of 1,000 simulated runs, too few to draw.</p>
      )}
      <Readouts cols={3}>
        <Readout label="Spread at the event" value={`${num(r.spread, 1)} pips`} sub={`${ev.spreadMult}× normal`} tone={ev.spreadMult > 2 ? "warn" : undefined} />
        <Readout label="Market order cost, typical" value={`${num(quantile(r.marketSlip, 0.5), 1)} pips`} sub={`bad 5%: ${num(quantile(r.marketSlip, 0.95), 1)} pips or more`} />
        <Readout label="Stops hit" value={pc(r.stopHitShare)} />
        <Readout label="Stopped loss, typical" value={Number.isFinite(medR) ? `${num(medR, 2)}× plan` : "–"} />
        <Readout label="Stopped loss, bad 5%" value={Number.isFinite(p95R) ? `${num(p95R, 2)}× plan` : "–"} tone={p95R > 1.5 ? "down" : undefined} />
        <Readout label="Stops filled at worse than 1.5× plan" value={pc(r.badFillShare)} tone={r.badFillShare > 0.1 ? "down" : undefined} />
      </Readouts>
      <div><Button onClick={() => setSeed((s) => s + 1)}>New simulated draws</Button></div>
      <Result tone={kind === "major" || kind === "shock" ? "bad" : "info"}>
        {kind === "quiet"
          ? "In a quiet hour the spread stays tight and stops fill close to plan."
          : `At this event the spread is ${ev.spreadMult} times normal, and in ${pc(ev.gapChance)} of runs the price jumps with no trading in between, so a stop fills at the first price after the jump.`}{" "}
        A stop limits where you ask to get out, not the price you get. Standing aside costs nothing.
      </Result>
    </WidgetFrame>
  );
}

// ── Statement-tone comparer ─────────────────────────────────────────────────

const STATEMENT_PAIRS = {
  a: {
    label: "Pair A",
    before: "Inflation remains elevated. The labour market is strong. The Committee judges that further tightening may be appropriate. The Committee will remain vigilant to upside risks to inflation.",
    after: "Inflation remains elevated but is moderating. The labour market is strong. The Committee will be patient in assessing further adjustments. The Committee will remain vigilant to upside risks to inflation.",
  },
  b: {
    label: "Pair B",
    before: "Growth is slowing and inflation is moderating. Policy remains accommodative. The Committee expects a gradual path for rates.",
    after: "Growth is slowing and inflation is moderating. Price pressures have proved persistent. The Committee expects a gradual path for rates. Upside risks to inflation have increased.",
  },
} as const;
type PairId = keyof typeof STATEMENT_PAIRS;

function Marked({ text }: { text: string }) {
  const { hawk, dove } = toneScore(text);
  const terms = [...hawk.map((t) => ({ t, k: "h" })), ...dove.map((t) => ({ t, k: "d" }))].sort((a, b) => b.t.length - a.t.length);
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map((x) => x.t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) => {
        const hit = terms.find((x) => x.t === part.toLowerCase());
        return hit ? <mark key={i} className={cn("rounded px-0.5 text-fg", hit.k === "h" ? "bg-down-soft" : "bg-up-soft")}>{part}</mark> : <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function ToneComparer({ title, caption }: P) {
  const [pair, setPair] = useState<PairId>("a");
  const s = STATEMENT_PAIRS[pair];
  const t0 = toneScore(s.before), t1 = toneScore(s.after);
  const d = sentenceDiff(s.before, s.after);
  const shift = t1.score - t0.score;
  return (
    <WidgetFrame title={title} caption={caption} source="sample">
      <Choice label="Made-up statements" value={pair} options={(Object.keys(STATEMENT_PAIRS) as PairId[]).map((id) => ({ id, label: STATEMENT_PAIRS[id].label }))} onChange={setPair} />
      <div className="grid gap-3 sm:grid-cols-2">
        {([["Previous statement", s.before, t0], ["New statement", s.after, t1]] as const).map(([h, txt, t]) => (
          <div key={h} className="min-w-0 rounded-md border border-line p-2.5">
            <p className="mb-1 text-xs text-fg-muted">{h}</p>
            <p className="text-[13px] leading-relaxed"><Marked text={txt} /></p>
            <p className="mt-1.5 text-[11px] text-fg-subtle">{`Hawkish words ${t.hawk.length} · dovish words ${t.dove.length} · tone ${signed(t.score, 2)}`}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 text-[13px]">
        <div><p className="text-xs text-fg-muted">Sentences added</p><ul className="mt-1 list-disc space-y-1 pl-4">{d.added.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><p className="text-xs text-fg-muted">Sentences removed</p><ul className="mt-1 list-disc space-y-1 pl-4">{d.removed.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
      <p className="t-small"><span className="rounded bg-down-soft px-1">Red</span> marks words this tool counts as hawkish; <span className="rounded bg-up-soft px-1">green</span> marks dovish ones.</p>
      <Result tone={Math.abs(shift) > 0.2 ? "warn" : "info"}>
        {`Tone moved from ${signed(t0.score, 2)} to ${signed(t1.score, 2)}: ${shift > 0.2 ? "more hawkish" : shift < -0.2 ? "more dovish" : "about the same"}.`} Read the changed sentences, not the whole text: most of a statement is repeated each time. A word count is a crude guide; context, the press conference and what markets already expected matter more.
      </Result>
    </WidgetFrame>
  );
}

// ── Source-reliability sorter ───────────────────────────────────────────────

type SourceCat = "primary" | "secondary" | "rumour";
const SOURCE_CATS: { id: SourceCat; label: string }[] = [
  { id: "primary", label: "Primary source" },
  { id: "secondary", label: "Reputable secondary" },
  { id: "rumour", label: "Unverified" },
];
const SOURCE_ITEMS: { id: string; text: string; answer: SourceCat; why: string }[] = [
  { id: "s1", text: "The statistics agency's own release page with the inflation figure and its notes.", answer: "primary", why: "The publisher of the number itself." },
  { id: "s2", text: "A central bank's statement posted on its own website at the scheduled time.", answer: "primary", why: "The original text, from the source." },
  { id: "s3", text: "A company's results filed with the market regulator.", answer: "primary", why: "The official filing." },
  { id: "s4", text: "A wire-service headline quoting the release a few seconds after it came out.", answer: "secondary", why: "Usually reliable, but a summary that can be wrong or later corrected." },
  { id: "s5", text: "A newspaper article explaining what the decision means, citing the statement.", answer: "secondary", why: "Useful context, one step from the source." },
  { id: "s6", text: "An anonymous account posting \"hearing the bank will cut tomorrow\" with no link.", answer: "rumour", why: "No source, no way to check, and an incentive to move the price." },
  { id: "s7", text: "A screenshot of a \"leaked\" figure shared in a chat group before the release time.", answer: "rumour", why: "Screenshots are easy to fake, and real early leaks are rare and often illegal to trade on." },
  { id: "s8", text: "A video claiming a war has started, with no outlet or official confirming it.", answer: "rumour", why: "Shocks attract fakes; wait for confirmation from reliable outlets." },
];

export function SourceSorter({ title, caption }: P) {
  const [a, setA] = useState<Record<string, SourceCat | "">>({});
  const done = SOURCE_ITEMS.filter((s) => a[s.id]);
  const right = done.filter((s) => a[s.id] === s.answer).length;
  return (
    <WidgetFrame title={title} caption={caption} source="sample">
      <ul className="space-y-2.5">
        {SOURCE_ITEMS.map((s) => {
          const v = a[s.id] ?? "";
          return (
            <li key={s.id} className="rounded-md border border-line p-2.5" data-source={s.id}>
              <p className="mb-1.5 text-[13px]">{s.text}</p>
              <Choice label="What kind of source is this?" value={v} options={SOURCE_CATS} onChange={(x) => setA((st) => ({ ...st, [s.id]: x }))} />
              {v && <p className={cn("mt-1.5 text-xs", v === s.answer ? "text-up" : "text-down")}>{v === s.answer ? "Right." : `Suggested: ${SOURCE_CATS.find((c) => c.id === s.answer)!.label.toLowerCase()}.`} {s.why}</p>}
            </li>
          );
        })}
      </ul>
      <Result tone={done.length === SOURCE_ITEMS.length && right === done.length ? "good" : "info"}>
        {done.length ? `${right} of ${done.length} sorted as suggested.` : "Sort each made-up source."} Before acting on news, trace it back to the primary source. If you cannot, treat it as unverified.
      </Result>
    </WidgetFrame>
  );
}

// ── Headline and core inflation ─────────────────────────────────────────────

export function InflationBasket({ title, caption }: P) {
  const [ch, setCh] = useState<Record<string, number>>({ food: 4, energy: 12, housing: 4, goods: 2, services: 3 });
  const r = basketInflation(BASKET, ch);
  const gap = r.headline - r.core;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        {BASKET.map((b) => (
          <Slider key={b.id} label={`${b.label} (weight ${b.weight}%${b.core ? "" : ", not in core"})`} value={ch[b.id]} min={-10} max={20} step={0.5} onChange={(v) => setCh((s) => ({ ...s, [b.id]: v }))} format={(v) => sp(v, 1)} />
        ))}
      </div>
      <Readouts cols={3}>
        <Readout label="Headline inflation" value={sp(r.headline, 1)} />
        <Readout label="Core (no food or energy)" value={sp(r.core, 1)} />
        <Readout label="Headline − core" value={`${signed(gap, 1)} pts`} tone={Math.abs(gap) > 1 ? "warn" : undefined} />
      </Readouts>
      <Result tone={Math.abs(gap) > 1 ? "warn" : "info"}>
        {Math.abs(gap) > 1
          ? `Food and energy are pulling headline ${gap > 0 ? "above" : "below"} core. Those prices swing a lot, so central banks also watch core to see the underlying trend.`
          : "Headline and core are close: food and energy are moving roughly with everything else."}{" "}
        The basket and weights are made up; real indices have hundreds of items.
      </Result>
    </WidgetFrame>
  );
}

// ── PMI diffusion index ─────────────────────────────────────────────────────

export function PmiCalculator({ title, caption }: P) {
  const [higher, setHigher] = useState(30);
  const [same, setSame] = useState(45);
  const s = Math.min(same, 100 - higher);
  const lower = 100 - higher - s;
  const idx = diffusionIndex(higher, s);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Firms reporting higher output" value={higher} min={0} max={100} step={1} onChange={setHigher} format={(v) => `${v}%`} />
        <Slider label="Firms reporting no change" value={s} min={0} max={100 - higher} step={1} onChange={setSame} format={(v) => `${v}%`} />
      </div>
      <Readouts cols={3}>
        <Readout label="Firms reporting lower" value={`${lower}%`} />
        <Readout label="Diffusion index" value={num(idx, 1)} tone={idx > 50 ? "up" : idx < 50 ? "down" : undefined} />
        <Readout label="Reading" value={idx > 50 ? "Expanding" : idx < 50 ? "Contracting" : "No change"} />
      </Readouts>
      <Result>
        The index counts how many firms say things got better or worse, not by how much. {num(idx, 1)} means {idx > 50 ? "more firms reported higher than lower" : idx < 50 ? "more firms reported lower than higher" : "as many reported higher as lower"}. A reading of 52 with a few firms booming looks the same as 52 with many firms barely growing.
      </Result>
    </WidgetFrame>
  );
}

// ── Changing correlation ────────────────────────────────────────────────────

export function CorrelationShift({ title, caption }: P) {
  const [rhoA, setA] = useState(-0.4);
  const [rhoB, setB] = useState(0.5);
  const [win, setWin] = useState(60);
  const [seed, setSeed] = useState(1);
  const r = useMemo(() => switchingCorrelation({ rhoA, rhoB, regimeLen: 250, window: win, days: 1000, seed }), [rhoA, rhoB, win, seed]);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="True correlation, periods 1 and 3" value={rhoA} min={-0.9} max={0.9} step={0.1} onChange={setA} format={(v) => num(v, 1)} />
        <Slider label="True correlation, periods 2 and 4" value={rhoB} min={-0.9} max={0.9} step={0.1} onChange={setB} format={(v) => num(v, 1)} />
        <Slider label="Rolling window" value={win} min={20} max={250} step={10} onChange={setWin} format={(v) => `${v} days`} />
      </div>
      <LinePlot
        label="Rolling correlation of two simulated return series, with the true correlation of each period"
        series={[{ values: r.truth, tone: "muted", label: "true" }, { values: r.rolling, tone: "accent", label: "measured" }]}
        yMin={-1}
        yMax={1}
        lines={[{ y: 0, label: "0", tone: "muted", dashed: true }]}
        xLabel="simulated day"
        yFormat={(v) => num(v, 1)}
      />
      <Readouts cols={2}>
        <Readout label="Correlation over all 1,000 days" value={num(r.full, 2)} />
        <Readout label="Window" value={`${win} days`} />
      </Readouts>
      <div><Button onClick={() => setSeed((s) => s + 1)}>New simulated data</Button></div>
      <Result>
        Grey: the true correlation, which switches every 250 days. Blue: what a {win}-day window measures. The full-period number ({num(r.full, 2)}) describes neither period. A short window reacts faster but is noisier; a long one lags the switch.
      </Result>
    </WidgetFrame>
  );
}

// ── Holding a share through results ─────────────────────────────────────────

export function EarningsGapTool({ title, caption }: P) {
  const [stop, setStop] = useState(46);
  const [shares, setShares] = useState(100);
  const [gap, setGap] = useState(-15);
  const entry = 50;
  const r = earningsGap({ entry, stop, shares, gapPct: gap });
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <p className="t-small">A made-up long position: {shares} shares bought at {money(entry, "USD", 2)}, held into a results release.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Stop price" value={stop} min={35} max={49} step={0.5} onChange={setStop} format={(v) => money(v, "USD", 2)} />
        <Slider label="Shares" value={shares} min={10} max={500} step={10} onChange={setShares} />
        <Slider label="Opening move after results" value={gap} min={-30} max={20} step={1} onChange={setGap} format={(v) => sp(v, 0)} />
      </div>
      <Readouts cols={3}>
        <Readout label="Planned risk to the stop" value={money(r.risk, "USD", 0)} />
        <Readout label="First price after results" value={money(r.open, "USD", 2)} />
        <Readout label={r.stopped ? "Loss, filled at the open" : "Open profit or loss"} value={money(r.stopped ? -r.loss : r.pnl, "USD", 0)} tone={r.pnl >= 0 ? "up" : "down"} />
        <Readout label="Loss in R" value={r.stopped ? `${num(r.lossR, 2)}R` : "stop not hit"} tone={r.stopped && r.lossR > 1.2 ? "down" : undefined} />
      </Readouts>
      <Result tone={r.stopped && r.lossR > 1.2 ? "bad" : "info"}>
        {r.stopped
          ? `The price opened below the stop, so the stop filled at ${money(r.open, "USD", 2)}, not at ${money(stop, "USD", 2)}. The loss is ${num(r.lossR, 2)} times what was planned.`
          : "The opening price stayed above the stop this time."}{" "}
        Holding through results means accepting a gap risk the stop cannot cap. Smaller size, or no position, are the only reliable limits.
      </Result>
    </WidgetFrame>
  );
}
