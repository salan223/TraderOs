"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { isStringRecord, loadLocal, removeLocal, saveLocal } from "@/lib/academy/psychology";
import {
  ARCHETYPES, CROSSOVER_PAIRS, REGIMES, RULE_FIELDS, bestOfNoise, buildSpec, combinedSharpe, decayPath, drawdownDistribution, efficiencyAt,
  entryExitTrades, mixedPath, probLosingStreak, runArchetype, toPrices, tradeMoments, tradesToConfirm, tradesToDetect, tradesUntilBelowCost,
  twoStrategyVol, underperformance, logPath, type Archetype, type EntryKind, type ExitKind, type Regime,
} from "@/lib/academy/strategy";
import { cn } from "@/lib/cn";
import { Choice, Readout, Readouts, Result, Slider, WidgetFrame, num, signed } from "./kit";
import { LinePlot, type PlotTone } from "./risk-plot";
import { Toggle } from "./ta-lab";

/*
  Tools for the Strategy Development track. Every price series is simulated
  from a seed and every other number is computed from what the learner sets;
  none is market data or real performance. The spec template saves only in
  this browser, inside try/catch.
*/

type P = { title: string; caption: string };
const pct = (x: number, dp = 0) => (Number.isFinite(x) ? `${num(x * 100, dp)}%` : "–");
const rR = (x: number, dp = 2) => (Number.isFinite(x) ? `${signed(x, dp)}R` : "–");
const sp = (x: number, dp = 0) => (Number.isFinite(x) ? `${signed(x, dp)}%` : "–");
const TONES: Record<Archetype, PlotTone> = { trend: "accent", meanrev: "up", breakout: "warn", carry: "muted" };

// ── L1/L3. Rule builder ─────────────────────────────────────────────────────

export function RuleBuilder({ title, caption }: P) {
  const [c, setC] = useState<Record<string, string>>({});
  const spec = buildSpec(c);
  const chosen = RULE_FIELDS.filter((f) => c[f.id]).length;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        {RULE_FIELDS.map((f) => (
          <div key={f.id} data-field={f.id} className="min-w-0">
            <Choice label={f.label} value={c[f.id] ?? ""} options={f.options.map((o) => ({ id: o.id, label: o.label }))} onChange={(v) => setC((s) => ({ ...s, [f.id]: v }))} />
          </div>
        ))}
      </div>
      <div className="rounded-md border border-line bg-panel p-2.5" data-spec>
        <p className="t-label mb-1">Rule spec</p>
        {spec.lines.length ? (
          <ol className="list-decimal space-y-0.5 pl-5 text-[13px]">{spec.lines.map((l) => <li key={l}>{l}</li>)}</ol>
        ) : (
          <p className="text-[13px] text-fg-muted">Choose an option in each part to build the spec.</p>
        )}
      </div>
      {spec.flags.length > 0 && chosen > 0 && (
        <ul className="space-y-1 text-[13px]" data-flags>
          {spec.flags.filter((f) => chosen === RULE_FIELDS.length || !/Not chosen/.test(f.reason)).map((f) => (
            <li key={f.field} className="rounded-md border border-warn/30 bg-warn-soft px-2 py-1"><span className="font-medium">{f.field}:</span> {f.reason}</li>
          ))}
        </ul>
      )}
      <Result tone={spec.testable ? "good" : chosen === 0 ? "info" : "warn"}>
        {spec.testable
          ? "Every part is exact. Someone else could code this rule and get the same trades. Testable is not the same as profitable."
          : chosen < RULE_FIELDS.length
            ? `${chosen} of ${RULE_FIELDS.length} parts chosen. A rule with a missing part cannot be tested.`
            : `${spec.flags.length} part${spec.flags.length > 1 ? "s" : ""} flagged. Rewrite them as exact rules before testing.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L2. Edge-source sorter ──────────────────────────────────────────────────

const SOURCES = [
  { id: "risk", label: "Risk premium" },
  { id: "behav", label: "Behavioural" },
  { id: "struct", label: "Structural / flow" },
  { id: "info", label: "Information" },
  { id: "noise", label: "Probably noise" },
] as const;
type SourceId = (typeof SOURCES)[number]["id"];

export const EDGE_IDEAS: { id: string; text: string; answer: SourceId; why: string }[] = [
  { id: "e1", text: "Being paid to hold an asset that others want to hedge or sell in a crisis, and accepting the crash risk.", answer: "risk", why: "A reward for bearing a risk others avoid: a risk premium. It can lose badly when that risk shows up." },
  { id: "e2", text: "Buying assets that fell for years because investors overreacted to bad news.", answer: "behav", why: "The idea is that other investors' biases push prices too far: a behavioural source." },
  { id: "e3", text: "Trading against predictable index-rebalancing orders that must be done by a set date.", answer: "struct", why: "Forced, predictable flows create a structural edge, but many others compete for it." },
  { id: "e4", text: "Faster, better analysis of public company filings than most other readers.", answer: "info", why: "Processing information better or faster than others. Hard for a retail trader to sustain." },
  { id: "e5", text: "A pattern that made money in the last 40 trades on one chart.", answer: "noise", why: "No reason given for why it should work, and 40 trades is a tiny sample. Most likely luck." },
  { id: "e6", text: "An indicator setting found by trying 300 combinations on two years of data.", answer: "noise", why: "The best of many tries on one sample is expected to look good by chance: overfitting." },
];

export function EdgeSorter({ title, caption }: P) {
  const [a, setA] = useState<Record<string, SourceId | "">>({});
  const done = EDGE_IDEAS.filter((e) => a[e.id]);
  const right = done.filter((e) => a[e.id] === e.answer).length;
  return (
    <WidgetFrame title={title} caption={caption} source="sample">
      <ul className="space-y-2.5">
        {EDGE_IDEAS.map((e) => {
          const v = a[e.id] ?? "";
          return (
            <li key={e.id} className="rounded-md border border-line p-2.5" data-idea={e.id}>
              <p className="mb-1.5 text-[13px]">{e.text}</p>
              <Choice label="Main source of the claimed edge" value={v} options={SOURCES} onChange={(x) => setA((s) => ({ ...s, [e.id]: x }))} />
              {v && <p className={cn("mt-1.5 text-xs", v === e.answer ? "text-up" : "text-down")} data-verdict>{v === e.answer ? "Right." : `Best answer: ${SOURCES.find((s) => s.id === e.answer)!.label.toLowerCase()}.`} {e.why}</p>}
            </li>
          );
        })}
      </ul>
      <Result tone={done.length === EDGE_IDEAS.length && right === done.length ? "good" : "info"}>
        {done.length ? `${right} of ${done.length} sorted as suggested.` : "Sort each made-up idea."} Naming a source is only a start: each still needs a test, and most retail ideas with no clear source turn out to be noise.
      </Result>
    </WidgetFrame>
  );
}

// ── L4. Archetype playground ────────────────────────────────────────────────

export function ArchetypePlayground({ title, caption }: P) {
  const [regime, setRegime] = useState<Regime>("trending");
  const [seed, setSeed] = useState(1);
  const [cost, setCost] = useState(0.05);
  const x = useMemo(() => logPath(regime, 4000 + seed, 1500), [regime, seed]);
  const res = useMemo(() => ARCHETYPES.map((a) => ({ a, r: runArchetype(a.id, x, cost) })), [x, cost]);
  const best = [...res].sort((p, q) => q.r.totalPct - p.r.totalPct)[0];
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Simulated market regime" value={regime} options={REGIMES} onChange={setRegime} />
        <Slider label="Cost per unit traded" value={cost} min={0} max={0.3} step={0.01} onChange={setCost} format={(n) => `${num(n, 2)}%`} />
      </div>
      <LinePlot label={`Simulated price, ${regime} regime`} height={110} series={[{ values: toPrices(x), tone: "muted" }]} yFormat={(n) => num(n, 0)} />
      <LinePlot
        label="Running result in percent for the four archetypes on the same simulated price"
        series={res.map(({ a, r }) => ({ values: r.equity, tone: TONES[a.id] }))}
        xLabel="Bar"
        lines={[{ y: 0, label: "0%", tone: "muted", dashed: true }]}
        yFormat={(n) => `${num(n, 0)}%`}
      />
      <p className="text-[11px] text-fg-subtle">Blue: trend-following · green: mean-reversion · amber: breakout · grey: carry.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] text-[12px]" data-results>
          <thead><tr className="text-left text-fg-muted"><th className="py-1 pr-2 font-normal">Archetype</th><th className="pr-2 font-normal">Result</th><th className="pr-2 font-normal">Max drawdown</th><th className="font-normal">Trades</th></tr></thead>
          <tbody>
            {res.map(({ a, r }) => (
              <tr key={a.id} className="border-t border-line" data-archetype={a.id}>
                <td className="py-1 pr-2">{a.label}</td>
                <td className={cn("pr-2 font-mono tabular", r.totalPct >= 0 ? "text-up" : "text-down")}>{sp(r.totalPct)}</td>
                <td className="pr-2 font-mono tabular">{num(r.maxDrawdownPct, 0)}%</td>
                <td className="font-mono tabular">{r.trades}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Result>
        In this {regime === "random" ? "random-walk" : regime} simulation, {best.a.label.toLowerCase()} did best ({sp(best.r.totalPct)}). Switch regimes: each archetype has conditions it needs, and none wins everywhere. Results come from one seeded path, not a forecast.
      </Result>
      <Button onClick={() => setSeed((s) => s + 1)}>New simulated path</Button>
    </WidgetFrame>
  );
}

// ── L5. Entry versus exit experiment ────────────────────────────────────────

const COMBOS: { entry: EntryKind; exit: ExitKind; label: string }[] = [
  { entry: "random", exit: "good", label: "Random entry, sound exit" },
  { entry: "signal", exit: "bad", label: "Signal entry, poor exit" },
  { entry: "signal", exit: "good", label: "Signal entry, sound exit" },
  { entry: "random", exit: "bad", label: "Random entry, poor exit" },
];

export function EntryExitLab({ title, caption }: P) {
  const [regime, setRegime] = useState<Regime>("trending");
  const [seed, setSeed] = useState(1);
  const rows = useMemo(() => COMBOS.map((c) => {
    // Average four seeded paths of 300 trades each so one lucky path does not decide.
    const runs = [0, 1, 2, 3].map((k) => entryExitTrades({ seed: 5000 + seed * 10 + k, regime, entry: c.entry, exit: c.exit, trades: 300 }));
    const all = runs.flatMap((r) => r.results);
    const wins = all.filter((x) => x > 0);
    return { ...c, n: all.length, mean: all.reduce((a, b) => a + b, 0) / all.length, win: wins.length / all.length, worst: Math.min(...all) };
  }), [regime, seed]);
  const best = [...rows].sort((a, b) => b.mean - a.mean)[0];
  const re = rows[0], sb = rows[1];
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Simulated market regime" value={regime} options={REGIMES} onChange={setRegime} />
      <div className="space-y-2" data-combos>
        {rows.map((r) => (
          <div key={r.label} className="rounded-md border border-line p-2" data-combo={`${r.entry}-${r.exit}`}>
            <p className="mb-1 text-[13px] font-medium">{r.label}</p>
            <Readouts cols={3}>
              <Readout label="Average per trade" value={rR(r.mean)} tone={r.mean > 0 ? "up" : "down"} />
              <Readout label="Win rate" value={pct(r.win)} />
              <Readout label="Worst trade" value={rR(r.worst, 1)} tone="down" />
            </Readouts>
          </div>
        ))}
      </div>
      <Result tone="info">
        {`Over ${re.n} simulated trades each, the random entry with the sound exit averaged ${rR(re.mean)} against ${rR(sb.mean)} for the signal entry with the poor exit. Best here: ${best.label.toLowerCase()}. `}
        Sound exit: 1R initial stop, then a stop trailing 2R behind the best price. Poor exit: a +0.5R target and a −3R stop. Which exit suits depends on the regime.
      </Result>
      <Button onClick={() => setSeed((s) => s + 1)}>New simulated paths</Button>
    </WidgetFrame>
  );
}

// ── L6. Regime filter ───────────────────────────────────────────────────────

export function RegimeFilter({ title, caption }: P) {
  const [thr, setThr] = useState(0.3);
  const [on, setOn] = useState(true);
  const [seed, setSeed] = useState(1);
  const m = useMemo(() => mixedPath(7000 + seed, 2000), [seed]);
  const er = useMemo(() => m.x.map((_, t) => efficiencyAt(m.x, t, 20) ?? 0), [m]);
  const trendRaw = useMemo(() => runArchetype("trend", m.x), [m]);
  const mrRaw = useMemo(() => runArchetype("meanrev", m.x), [m]);
  const trendF = runArchetype("trend", m.x, 0.05, (t) => er[t] > thr);
  const mrF = runArchetype("meanrev", m.x, 0.05, (t) => er[t] <= thr);
  const shown = on ? [trendF, mrF] : [trendRaw, mrRaw];
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <LinePlot label="Simulated price that alternates trending and ranging stretches of 250 bars" height={110} series={[{ values: toPrices(m.x), tone: "muted" }]} yFormat={(n) => num(n, 0)} />
      <div className="flex flex-wrap items-end gap-3">
        <Toggle label="Use the regime filter" checked={on} onChange={setOn} />
        <div className="min-w-[200px] flex-1"><Slider label="Efficiency ratio threshold" value={thr} min={0.1} max={0.6} step={0.05} onChange={setThr} format={(n) => num(n, 2)} hint="Trend-following only trades above it; mean-reversion only at or below it." /></div>
      </div>
      <LinePlot
        label="Running result in percent for trend-following and mean-reversion, with or without the filter"
        series={[{ values: shown[0].equity, tone: "accent" }, { values: shown[1].equity, tone: "up" }]}
        xLabel="Bar"
        lines={[{ y: 0, label: "0%", tone: "muted", dashed: true }]}
        yFormat={(n) => `${num(n, 0)}%`}
      />
      <p className="text-[11px] text-fg-subtle">Blue: trend-following · green: mean-reversion.</p>
      <Readouts cols={4}>
        <Readout label="Trend, no filter" value={sp(trendRaw.totalPct)} />
        <Readout label="Trend, filtered" value={sp(trendF.totalPct)} />
        <Readout label="Mean-rev, no filter" value={sp(mrRaw.totalPct)} />
        <Readout label="Mean-rev, filtered" value={sp(mrF.totalPct)} />
      </Readouts>
      <Result>
        The filter is one fixed rule, set before looking at results. Here it {trendF.totalPct + mrF.totalPct > trendRaw.totalPct + mrRaw.totalPct ? "improved" : "did not improve"} the combined result on this path. Tuning the threshold until it looks best is curve-fitting; test any choice on fresh paths.
      </Result>
      <Button onClick={() => setSeed((s) => s + 1)}>New simulated path</Button>
    </WidgetFrame>
  );
}

// ── L7. Curve-fitting on noise ──────────────────────────────────────────────

export function OverfitLab({ title, caption }: P) {
  const [variants, setVariants] = useState(1);
  const [seed, setSeed] = useState(1);
  const b = useMemo(() => bestOfNoise({ seed: 300 + seed, variants }), [seed, variants]);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Slider label="Settings tried in-sample" value={variants} min={1} max={CROSSOVER_PAIRS.length} step={1} onChange={setVariants} hint="Fast/slow moving-average pairs, tried on the first 1,000 bars of each random walk." />
      <LinePlot
        label="One of the simulated random walks; the dashed line marks where in-sample ends and the fresh out-of-sample data begins"
        height={130}
        series={[{ values: toPrices(b.example.x), tone: "muted" }]}
        markers={[{ x: b.split, y: toPrices(b.example.x)[b.split], label: "out-of-sample starts", tone: "warn" }]}
        yFormat={(n) => num(n, 0)}
      />
      <Readouts cols={3}>
        <Readout label="Best in-sample Sharpe (average)" value={num(b.avgBestIs, 2)} tone="up" />
        <Readout label="Same setting out-of-sample" value={num(b.avgOos, 2)} tone={b.avgOos > 0.2 ? "up" : "warn"} />
        <Readout label="Settings tried" value={`${b.tried} of ${b.available}`} />
      </Readouts>
      <Result tone={variants > 20 ? "warn" : "info"}>
        These prices are random walks: no setting has a real edge. The more settings you try, the better the best one looks in-sample ({num(b.avgBestIs, 2)} averaged over {b.paths} paths), while on fresh data it averages {num(b.avgOos, 2)}. Always count and report how many variants you tried.
      </Result>
      <Button onClick={() => setSeed((s) => s + 1)}>New random walks</Button>
    </WidgetFrame>
  );
}

// ── L8. Strategy spec template (saved in this browser) ──────────────────────

const SPEC_KEY = "trader-os:strat-spec:v1";
export const SPEC_FIELDS = [
  { id: "hypothesis", label: "Hypothesis and edge source", hint: "Why should this work, and who is on the other side?" },
  { id: "market", label: "Markets and timeframe", hint: "Named instruments, bar size, trading hours." },
  { id: "entry", label: "Entry rule", hint: "Exact: indicator, lookback, close or intrabar, order type." },
  { id: "exit", label: "Exit rules and stop", hint: "Stop, target or trailing rule, time exit." },
  { id: "sizing", label: "Position sizing and limits", hint: "Risk per trade, maximum positions, loss limits." },
  { id: "filters", label: "Filters and regime rules", hint: "Each one exact, and decided before testing." },
  { id: "costs", label: "Costs and data", hint: "Commission, spread, slippage; data source and period." },
  { id: "tests", label: "Test plan", hint: "In-sample, out-of-sample, variants tried, forward-test length." },
  { id: "kill", label: "Kill criteria", hint: "The drawdown, losing run or shortfall at which you stop." },
] as const;

export function SpecTemplate({ title, caption }: P) {
  const [spec, setSpec] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<"idle" | "saved" | "blocked">("idle");
  useEffect(() => {
    setSpec(loadLocal(SPEC_KEY, {}, isStringRecord));
  }, []);
  const set = (id: string, v: string) => {
    const next = { ...spec, [id]: v.slice(0, 1500) };
    setSpec(next);
    setSaved(saveLocal(SPEC_KEY, next) ? "saved" : "blocked");
  };
  const filled = SPEC_FIELDS.filter((f) => (spec[f.id] ?? "").trim().length > 0).length;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <p className="text-xs text-fg-muted" data-storage-note>Saved only in this browser as you type. Nothing is sent anywhere, and clearing your browser data removes it.</p>
      <div className="space-y-3">
        {SPEC_FIELDS.map((f) => (
          <div key={f.id} className="min-w-0" data-field={f.id}>
            <label htmlFor={`strat-spec-${f.id}`} className="text-[13px] font-medium">{f.label}</label>
            <p className="text-[11px] text-fg-subtle">{f.hint}</p>
            <textarea id={`strat-spec-${f.id}`} value={spec[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)} rows={2} className="mt-1 w-full min-w-0 rounded-md border border-line-strong bg-raised p-2 text-[13px]" />
          </div>
        ))}
      </div>
      <Result tone={filled === SPEC_FIELDS.length ? "good" : "info"}>
        {filled} of {SPEC_FIELDS.length} sections filled. {filled === SPEC_FIELDS.length ? "A complete draft. Freeze it before testing, and log any later change with its date." : "Leave nothing to decide later: every blank is a discretion gap."}
        {saved === "saved" ? " Saved in this browser." : saved === "blocked" ? " This browser blocked saving, so your text lasts only until you leave the page." : ""}
      </Result>
      <Button variant="ghost" onClick={() => { removeLocal(SPEC_KEY); setSpec({}); setSaved("idle"); }}>Clear the spec</Button>
    </WidgetFrame>
  );
}

// ── L9. Forward-test sample size ────────────────────────────────────────────

export function SampleSizeTool({ title, caption }: P) {
  const [win, setWin] = useState(45);
  const [pay, setPay] = useState(1.5);
  const [perWeek, setPerWeek] = useState(5);
  const m = tradeMoments(win / 100, pay);
  const n = tradesToConfirm(m.mean, m.sd);
  const weeks = Number.isFinite(n) ? Math.ceil(n / Math.max(1, perWeek)) : NaN;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Expected win rate" value={win} min={30} max={70} step={1} onChange={setWin} format={(v) => `${v}%`} />
        <Slider label="Average win (a loss is 1R)" value={pay} min={0.5} max={3} step={0.1} onChange={setPay} format={(v) => `${num(v, 1)}R`} />
        <Slider label="Trades per week" value={perWeek} min={1} max={50} step={1} onChange={setPerWeek} />
      </div>
      <Readouts cols={4}>
        <Readout label="Expected per trade" value={rR(m.mean)} tone={m.mean > 0 ? "up" : "down"} />
        <Readout label="Spread per trade (sd)" value={`${num(m.sd, 2)}R`} />
        <Readout label="Trades to tell it from zero" value={Number.isFinite(n) ? n.toLocaleString("en-US") : "never"} sub="about 2 standard errors" tone="warn" />
        <Readout label="Forward-test length" value={Number.isFinite(weeks) ? `${weeks.toLocaleString("en-US")} weeks` : "–"} />
      </Readouts>
      <Result tone={m.mean <= 0 ? "bad" : "info"}>
        {m.mean <= 0 ? "With no positive expectancy there is nothing to confirm." : `If the edge is exactly as expected, it takes about ${n.toLocaleString("en-US")} trades before the average is two standard errors above zero.`} Smaller edges need far more trades: halving the edge roughly quadruples the number.
      </Result>
    </WidgetFrame>
  );
}

// ── L10. Kill-criteria calculator ───────────────────────────────────────────

export function KillCalculator({ title, caption }: P) {
  const [win, setWin] = useState(45);
  const [pay, setPay] = useState(1.5);
  const [n, setN] = useState(100);
  const [obs, setObs] = useState(-0.1);
  const [dd, setDd] = useState(15);
  const m = tradeMoments(win / 100, pay);
  const u = underperformance(m.mean, obs, m.sd, n);
  const dist = useMemo(() => drawdownDistribution({ seed: 10_000, winRate: win / 100, payoffR: pay, trades: n, runs: 2000 }), [win, pay, n]);
  const shareDd = dist.shareAtLeast(dd);
  const detect = tradesToDetect(m.mean - obs, m.sd);
  const streak10 = probLosingStreak(n, 10, 1 - win / 100);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Tested win rate" value={win} min={30} max={70} step={1} onChange={setWin} format={(v) => `${v}%`} />
        <Slider label="Tested average win (a loss is 1R)" value={pay} min={0.5} max={3} step={0.1} onChange={setPay} format={(v) => `${num(v, 1)}R`} />
        <Slider label="Live trades so far" value={n} min={10} max={500} step={10} onChange={setN} />
        <Slider label="Live average per trade" value={obs} min={-1} max={1} step={0.05} onChange={setObs} format={(v) => rR(v)} />
        <Slider label="Current drawdown" value={dd} min={1} max={60} step={1} onChange={setDd} format={(v) => `${v}R`} />
      </div>
      <Readouts cols={3}>
        <Readout label="Tested expectancy" value={rR(m.mean)} />
        <Readout label="Shortfall z-score" value={Number.isFinite(u.z) ? signed(u.z, 2) : "–"} sub={`chance this bad or worse: ${pct(u.pLower, 1)}`} tone={u.pLower < 0.05 ? "down" : undefined} />
        <Readout label={`Drawdown ≥ ${dd}R in ${n} trades`} value={pct(shareDd, 1)} sub="share of simulated runs" tone={shareDd < 0.05 ? "down" : undefined} />
        <Readout label="Typical worst drawdown" value={`${num(dist.p50, 0)}R`} sub={`95%: ${num(dist.p95, 0)}R · 99%: ${num(dist.p99, 0)}R`} />
        <Readout label="Trades to detect this shortfall" value={Number.isFinite(detect) ? detect.toLocaleString("en-US") : "–"} sub="at 2 standard errors" />
        <Readout label={`10+ losses in a row in ${n}`} value={pct(streak10, 1)} sub="exact, if the edge is intact" />
      </Readouts>
      <Result tone={u.pLower < 0.05 || shareDd < 0.05 ? "bad" : "info"}>
        {u.pLower < 0.05 || shareDd < 0.05
          ? "Unusual if the tested edge were real: fewer than 5% of simulated runs did this badly. That meets a typical pre-set kill rule: stop and review."
          : "Within what the tested edge would often produce. Not proof the edge is intact either; keep following the pre-set rules."}{" "}
        Simulated with a seeded model of independent trades; real results can be worse.
      </Result>
    </WidgetFrame>
  );
}

// ── L11. Diversifying across strategies ─────────────────────────────────────

const NS = Array.from({ length: 10 }, (_, i) => i + 1);

export function DiversifyTool({ title, caption }: P) {
  const [s, setS] = useState(0.5);
  const [n, setN] = useState(4);
  const [rho, setRho] = useState(0.2);
  const [v1, setV1] = useState(10);
  const [v2, setV2] = useState(10);
  const comb = combinedSharpe(s, n, rho);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Sharpe ratio of each strategy" value={s} min={0.1} max={1.5} step={0.05} onChange={setS} format={(x) => num(x, 2)} />
        <Slider label="Number of strategies" value={n} min={1} max={10} step={1} onChange={setN} />
        <Slider label="Average correlation between them" value={rho} min={0} max={1} step={0.05} onChange={setRho} format={(x) => num(x, 2)} />
      </div>
      <LinePlot
        label="Combined Sharpe ratio against the number of equal-risk strategies, at the chosen correlation and at zero and full correlation"
        series={[{ values: NS.map((k) => combinedSharpe(s, k, rho)), tone: "accent" }, { values: NS.map((k) => combinedSharpe(s, k, 0)), tone: "up", width: 1 }, { values: NS.map((k) => combinedSharpe(s, k, 1)), tone: "muted", width: 1 }]}
        xValues={NS}
        xLabel="Number of strategies"
        markers={[{ x: n, y: comb, tone: "accent" }]}
        yFormat={(x) => num(x, 1)}
        yMin={0}
      />
      <p className="text-[11px] text-fg-subtle">Blue: your correlation · green: uncorrelated · grey: perfectly correlated.</p>
      <Readouts cols={2}>
        <Readout label="Combined Sharpe" value={num(comb, 2)} tone="up" />
        <Readout label="Ceiling as strategies are added" value={rho > 0 ? num(s / Math.sqrt(rho), 2) : "no ceiling"} sub="s ÷ √correlation" />
      </Readouts>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Strategy A volatility" value={v1} min={2} max={30} step={1} onChange={setV1} format={(x) => `${x}%`} />
        <Slider label="Strategy B volatility" value={v2} min={2} max={30} step={1} onChange={setV2} format={(x) => `${x}%`} />
      </div>
      <Readouts cols={2}>
        <Readout label="50/50 mix volatility" value={`${num(twoStrategyVol(v1, v2, rho), 1)}%`} />
        <Readout label="Average of the two" value={`${num((v1 + v2) / 2, 1)}%`} />
      </Readouts>
      <Result>
        Adding strategies helps most when they are not correlated. With an average correlation of {num(rho, 2)}, {n} strategies give a combined Sharpe of {num(comb, 2)} against {num(s, 2)} each. Correlations measured in calm periods often rise in a crisis.
      </Result>
    </WidgetFrame>
  );
}

// ── L12. Strategy decay ─────────────────────────────────────────────────────

export function DecayTool({ title, caption }: P) {
  const [edge, setEdge] = useState(0.3);
  const [half, setHalf] = useState(300);
  const [cost, setCost] = useState(0.05);
  const [seed, setSeed] = useState(1);
  const trades = 1000;
  const d = useMemo(() => decayPath({ seed: 1200 + seed, edge0: edge, halfLife: half, cost, sd: 1.2, trades }), [seed, edge, half, cost]);
  const below = tradesUntilBelowCost(edge, half, cost);
  const peak = d.expected.reduce((bi, v, i, a) => (v > a[bi] ? i : bi), 0);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Starting edge per trade" value={edge} min={0.05} max={0.6} step={0.05} onChange={setEdge} format={(x) => `${num(x, 2)}R`} />
        <Slider label="Half-life of the edge" value={half} min={50} max={2000} step={50} onChange={setHalf} format={(x) => `${x} trades`} />
        <Slider label="Cost per trade" value={cost} min={0} max={0.2} step={0.01} onChange={setCost} format={(x) => `${num(x, 2)}R`} />
      </div>
      <LinePlot
        label={`Cumulative result in R over ${trades} trades of a strategy whose edge halves every ${half} trades: one simulated path and the expected path`}
        series={[{ values: d.cum, tone: "accent" }, { values: d.expected, tone: "muted", width: 1.5 }]}
        xLabel="Trade number"
        lines={[{ y: 0, label: "start", tone: "muted", dashed: true }]}
        yFormat={(x) => `${num(x, 0)}R`}
      />
      <p className="text-[11px] text-fg-subtle">Blue: one simulated path · grey: the expected path after costs.</p>
      <Readouts cols={2}>
        <Readout label="Edge falls below cost at trade" value={Number.isFinite(below) ? below.toLocaleString("en-US") : "not within range"} tone="warn" />
        <Readout label="Expected total peaks at trade" value={peak.toLocaleString("en-US")} />
      </Readouts>
      <Result>
        A decaying edge looks fine for a long time, then the expected curve flattens and turns down once the edge is smaller than costs. Noise hides the turn, which is why kill criteria are set in advance.
      </Result>
      <Button onClick={() => setSeed((x) => x + 1)}>New simulated path</Button>
    </WidgetFrame>
  );
}
