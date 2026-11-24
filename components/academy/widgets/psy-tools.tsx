"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TILT_PROMPTS, TK1992, acceptableGain, coinBetValue, dispositionRatios, expectancyR, expectedShareAfterStreak, flips, isStringArray,
  isStringRecord, loadLocal, longestRun, median, netOfTurnover, probLosingStreak, prospectValue, removeLocal, saveLocal, shareAfterStreak,
  simulateDays, simulateEdge, tiltReflection, zeroEdgeTraders,
} from "@/lib/academy/psychology";
import { cn } from "@/lib/cn";
import { Choice, Readout, Readouts, Result, Slider, WidgetFrame, num, signed } from "./kit";
import { LinePlot } from "./risk-plot";
import { Toggle } from "./ta-lab";

/*
  Tools for the Trading Psychology track. Every number is simulated from a
  seed or computed from what the learner enters; none is market data. Results
  are in R (multiples of the amount risked per trade). The checklist and the
  plan are saved only in this browser, inside try/catch, and work without it.
*/

type P = { title: string; caption: string };
const pct = (x: number, dp = 0) => (Number.isFinite(x) ? `${num(x * 100, dp)}%` : "–");
const r1 = (x: number) => (Number.isFinite(x) ? `${signed(x, 1)}R` : "–");

// ── L1. Prospect theory value function ──────────────────────────────────────

const LAMBDAS = [
  { id: "1", label: "λ = 1 (no loss aversion)" },
  { id: "1.5", label: "λ = 1.5" },
  { id: "2.25", label: "λ = 2.25 (1992 estimate)" },
] as const;
type LambdaId = (typeof LAMBDAS)[number]["id"];
const XS = Array.from({ length: 41 }, (_, i) => -500 + i * 25);

export function ProspectTool({ title, caption }: P) {
  const [gain, setGain] = useState(150);
  const [loss, setLoss] = useState(100);
  const [lam, setLam] = useState<LambdaId>("2.25");
  const p = { ...TK1992, lambda: Number(lam) };
  const vg = prospectValue(gain, p), vl = prospectValue(-loss, p), bet = coinBetValue(gain, loss, p);
  const need = acceptableGain(loss, p);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Possible gain (points)" value={gain} min={0} max={500} step={10} onChange={setGain} />
        <Slider label="Possible loss (points)" value={loss} min={0} max={500} step={10} onChange={setLoss} />
      </div>
      <Choice label="Loss aversion in the model" value={lam} options={LAMBDAS} onChange={setLam} />
      <LinePlot
        label="Prospect theory value function: felt value against the change from the reference point, steeper for losses than for gains"
        series={[{ values: XS.map((x) => prospectValue(x, p)), tone: "accent" }, { values: XS.map((x) => x), tone: "muted", width: 1, opacity: 0.6 }]}
        xValues={XS}
        xLabel="Change from the reference point (points)"
        markers={[{ x: gain, y: vg, tone: "up", label: "gain" }, { x: -loss, y: vl, tone: "down", label: "loss" }]}
        yFormat={(n) => num(n, 0)}
        xFormat={(n) => num(n, 0)}
      />
      <p className="text-[11px] text-fg-subtle">Blue: the model&apos;s felt value. Grey: a straight line where a point gained and a point lost count the same.</p>
      <Readouts cols={3}>
        <Readout label="Felt value of the gain" value={num(vg, 0)} tone="up" />
        <Readout label="Felt value of the loss" value={num(vl, 0)} tone="down" />
        <Readout label="A 50/50 bet on both" value={num(bet, 0)} tone={bet < 0 ? "warn" : undefined} />
      </Readouts>
      <Result tone={bet < 0 ? "warn" : "info"}>
        {loss === 0 ? "With nothing to lose, any gain feels good." : `In this model a 50/50 bet that risks ${loss} needs a gain of about ${num(need, 0)} before it stops feeling bad.`}{" "}
        The 2.25 figure is a median from one 1992 experiment. How strong loss aversion is, and when it appears, is debated.
      </Result>
    </WidgetFrame>
  );
}

// ── L2. Disposition effect: which positions would you sell? ─────────────────

const POSITIONS = [
  { id: "A", pl: 2.1 }, { id: "B", pl: 0.8 }, { id: "C", pl: 0.3 },
  { id: "D", pl: -0.4 }, { id: "E", pl: -1.2 }, { id: "F", pl: -2.5 },
];

export function DispositionTool({ title, caption }: P) {
  const [sold, setSold] = useState<Record<string, boolean>>({});
  const gains = POSITIONS.filter((x) => x.pl > 0), losses = POSITIONS.filter((x) => x.pl < 0);
  const r = dispositionRatios({
    realisedGains: gains.filter((x) => sold[x.id]).length,
    paperGains: gains.filter((x) => !sold[x.id]).length,
    realisedLosses: losses.filter((x) => sold[x.id]).length,
    paperLosses: losses.filter((x) => !sold[x.id]).length,
  });
  const any = Object.values(sold).some(Boolean);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <p className="text-[13px] text-fg-muted">Six made-up open positions. Tick the ones you would sell today, then compare the two ratios.</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {POSITIONS.map((x) => (
          <li key={x.id} className="flex items-center justify-between gap-2 rounded-md border border-line p-2" data-position={x.id}>
            <span className="text-[13px]">Position {x.id}: <span className={cn("font-mono tabular", x.pl > 0 ? "text-up" : "text-down")}>{r1(x.pl)}</span> open</span>
            <Toggle label="Sell" checked={!!sold[x.id]} onChange={(v) => setSold((s) => ({ ...s, [x.id]: v }))} />
          </li>
        ))}
      </ul>
      <Readouts cols={3}>
        <Readout label="Gains realised (PGR)" value={pct(r.pgr)} tone="up" />
        <Readout label="Losses realised (PLR)" value={pct(r.plr)} tone="down" />
        <Readout label="PGR − PLR" value={`${signed(r.diff * 100, 0)} pts`} />
      </Readouts>
      <Result tone={r.diff > 0 ? "warn" : "info"}>
        {!any ? "Nothing sold yet. " : r.diff > 0 ? "You sold gains more readily than losses: the pattern Odean (1998) called the disposition effect. " : r.diff < 0 ? "You sold losses more readily than gains here. " : "You sold gains and losses at the same rate. "}
        Whether to sell should follow each position&apos;s plan (its stop, target and reason for holding), not whether it shows a profit.
      </Result>
    </WidgetFrame>
  );
}

// ── L3. Overtrading: turnover against costs ─────────────────────────────────

const TURNS = Array.from({ length: 21 }, (_, i) => i * 50);

export function OvertradingTool({ title, caption }: P) {
  const [gross, setGross] = useState(8);
  const [turn, setTurn] = useState(250);
  const [cost, setCost] = useState(1);
  const net = netOfTurnover(gross, turn, cost);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Return before costs, per year" value={gross} min={-10} max={20} step={1} onChange={setGross} format={(n) => `${n}%`} />
        <Slider label="Turnover, per year" value={turn} min={0} max={1000} step={25} onChange={setTurn} format={(n) => `${n}%`} hint="100% = the whole account sold and replaced once a year." />
        <Slider label="Cost per round trip" value={cost} min={0} max={2} step={0.05} onChange={setCost} format={(n) => `${num(n, 2)}%`} hint="Commission, spread and impact on the value traded." />
      </div>
      <LinePlot
        label="Net yearly return against turnover, for the chosen return before costs and cost per round trip"
        series={[{ values: TURNS.map((t) => netOfTurnover(gross, t, cost)), tone: "accent" }]}
        xValues={TURNS}
        xLabel="Turnover per year (%)"
        lines={[{ y: 0, label: "0%", tone: "muted", dashed: true }]}
        markers={[{ x: turn, y: net, tone: net < 0 ? "down" : "up" }]}
        yFormat={(n) => `${num(n, 0)}%`}
        xFormat={(n) => `${n}%`}
      />
      <Readouts cols={2}>
        <Readout label="Cost drag per year" value={`${num((turn / 100) * cost, 2)}%`} tone="warn" />
        <Readout label="Return after costs" value={`${signed(net, 2)}%`} tone={net < 0 ? "down" : "up"} />
      </Readouts>
      <Result tone={net < 0 ? "bad" : "info"}>
        Costs grow with every trade, while skill does not. At {turn}% turnover and {num(cost, 2)}% a round trip, costs take {num((turn / 100) * cost, 2)} points a year. The numbers are yours to set; none is a forecast.
      </Result>
    </WidgetFrame>
  );
}

// ── L4. Bias-spotting scenario trainer ──────────────────────────────────────

const BIASES = {
  hindsight: "Hindsight bias",
  confirmation: "Confirmation bias",
  recency: "Recency bias",
  gambler: "Gambler's fallacy",
  outcome: "Outcome bias",
  overconfidence: "Overconfidence",
  disposition: "Disposition effect",
  fomo: "FOMO",
} as const;
type BiasId = keyof typeof BIASES;

export const BIAS_SCENARIOS: { id: string; text: string; answer: BiasId; options: BiasId[]; why: string }[] = [
  { id: "s1", text: "After a sharp fall, Sam says: \"It was obvious this would happen. All the signs were there.\" Sam made no such call beforehand.", answer: "hindsight", options: ["hindsight", "recency", "overconfidence", "outcome"], why: "Knowing the outcome makes it seem predictable. Sam's journal shows no forecast before the fall." },
  { id: "s2", text: "Priya is long a share. She reads only the bullish analyst notes and skips the bearish ones as \"noise\".", answer: "confirmation", options: ["disposition", "confirmation", "hindsight", "fomo"], why: "She looks for evidence that agrees with her position and discounts the rest." },
  { id: "s3", text: "A strategy had three great weeks. Leo doubles its size, ignoring its five-year record of long flat spells.", answer: "recency", options: ["gambler", "outcome", "recency", "confirmation"], why: "He weights the last few weeks far more than the long record." },
  { id: "s4", text: "After five losing trades in a row, Mia raises her size because \"a winner is due\". Each trade is independent of the last.", answer: "gambler", options: ["recency", "fomo", "overconfidence", "gambler"], why: "Past losses do not make an independent next trade more likely to win." },
  { id: "s5", text: "Tom broke his stop rule, held a loser, and it recovered. He tells himself it was a good decision because it worked.", answer: "outcome", options: ["outcome", "hindsight", "disposition", "confirmation"], why: "He is judging the decision by its result, not by whether it followed a sound process." },
  { id: "s6", text: "Ana rates herself a top-10% trader after two months and trades every day. Her costs now exceed her gross gains.", answer: "overconfidence", options: ["fomo", "overconfidence", "recency", "gambler"], why: "Overrating her skill leads to frequent trading, and costs eat the gains." },
  { id: "s7", text: "Raj sells every position as soon as it shows a small profit, but holds losing ones for months, \"until they come back\".", answer: "disposition", options: ["confirmation", "outcome", "disposition", "hindsight"], why: "Selling winners early and holding losers is the disposition effect." },
  { id: "s8", text: "A coin everyone talks about is up 40% this week. Kim buys at the top of a spike with no plan, \"before it's too late\".", answer: "fomo", options: ["hindsight", "gambler", "overconfidence", "fomo"], why: "Fear of missing out drives a rushed entry without a plan." },
];

export function BiasTrainer({ title, caption }: P) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<BiasId | "">("");
  const [score, setScore] = useState({ right: 0, done: 0 });
  const s = BIAS_SCENARIOS[i % BIAS_SCENARIOS.length];
  const pick = (b: BiasId | "") => {
    if (picked || !b) return;
    setPicked(b);
    setScore((x) => ({ right: x.right + (b === s.answer ? 1 : 0), done: x.done + 1 }));
  };
  return (
    <WidgetFrame title={title} caption={caption} source="sample">
      <p className="t-label">Scenario {(i % BIAS_SCENARIOS.length) + 1} of {BIAS_SCENARIOS.length}</p>
      <p className="text-[14px] leading-relaxed" data-scenario={s.id}>{s.text}</p>
      <Choice label="Which bias fits best?" value={picked} options={s.options.map((b) => ({ id: b, label: BIASES[b] }))} onChange={pick} />
      {picked ? (
        <Result tone={picked === s.answer ? "good" : "bad"}>
          {picked === s.answer ? "Right: " : `Not quite. This is ${BIASES[s.answer].toLowerCase().replace("fomo", "FOMO")}: `}
          {s.why}
        </Result>
      ) : (
        <Result>Pick one. The people and events are made up.</Result>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-fg-muted" data-score>Score: {score.right} of {score.done}</span>
        <Button onClick={() => { setI((x) => x + 1); setPicked(""); }} disabled={!picked}>Next scenario</Button>
      </div>
    </WidgetFrame>
  );
}

// ── L5. Coin flips: streaks and the hot hand ────────────────────────────────

const EXACT10 = [1, 2, 3].map((k) => expectedShareAfterStreak(10, k));

export function StreakTool({ title, caption }: P) {
  const [n, setN] = useState(100);
  const [seed, setSeed] = useState(1);
  const [k, setK] = useState<"1" | "2" | "3">("3");
  const seq = useMemo(() => flips(9000 + seed, n), [seed, n]);
  const kk = Number(k);
  const after = shareAfterStreak(seq, kk);
  const heads = seq.filter(Boolean).length;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Number of flips" value={n} min={20} max={200} step={10} onChange={setN} />
        <Choice label="Streak length to check" value={k} options={[{ id: "1", label: "1 head" }, { id: "2", label: "2 heads" }, { id: "3", label: "3 heads" }]} onChange={setK} />
      </div>
      <div className="flex flex-wrap gap-[3px]" aria-label={`Sequence of ${n} simulated fair coin flips`} role="img" data-flips>
        {seq.map((h, j) => (
          <span key={j} className={cn("inline-block size-2.5 rounded-[2px]", h ? "bg-up" : "bg-down/70")} />
        ))}
      </div>
      <p className="text-[11px] text-fg-subtle">Green: heads · red: tails. A fair, seeded simulated coin.</p>
      <Readouts cols={4}>
        <Readout label="Heads" value={`${heads} of ${n}`} />
        <Readout label="Longest heads run" value={`${longestRun(seq, true)}`} />
        <Readout label="Longest tails run" value={`${longestRun(seq, false)}`} />
        <Readout label={`Heads after ${kk} head${kk > 1 ? "s" : ""}`} value={after.count ? pct(after.share) : "–"} sub={`${after.count} cases`} />
      </Readouts>
      <Result>
        Runs of 5 or more are normal in 100 fair flips. The coin has no memory, so the next flip is still 50/50. Averaged over every possible run of 10 fair flips, the share of heads straight after {kk} head{kk > 1 ? "s" : ""} is only {pct(EXACT10[kk - 1], 1)}, not 50%: the counting method itself is biased, as Miller and Sanjurjo (2018) showed.
      </Result>
      <Button onClick={() => setSeed((x) => x + 1)}>New flips</Button>
    </WidgetFrame>
  );
}

// ── L6. Edge simulator: variance and losing streaks ─────────────────────────

const RUNS = 20;

export function EdgeSim({ title, caption }: P) {
  const [win, setWin] = useState(45);
  const [pay, setPay] = useState(1.5);
  const [trades, setTrades] = useState(200);
  const [k, setK] = useState(8);
  const [seed, setSeed] = useState(1);
  const sims = useMemo(() => simulateEdge({ seed: 6100 + seed, winRate: win / 100, payoffR: pay, trades, runs: RUNS }), [seed, win, pay, trades]);
  const e = expectancyR(win / 100, pay);
  const streaks = sims.map((s) => s.longestLosing);
  const below = sims.filter((s) => s.final < 0).length;
  const pk = probLosingStreak(trades, k, 1 - win / 100);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Win rate" value={win} min={30} max={70} step={1} onChange={setWin} format={(n) => `${n}%`} />
        <Slider label="Average win (a loss is 1R)" value={pay} min={0.5} max={3} step={0.1} onChange={setPay} format={(n) => `${num(n, 1)}R`} />
        <Slider label="Trades per trader" value={trades} min={50} max={500} step={50} onChange={setTrades} />
        <Slider label="Losing streak to check" value={k} min={3} max={15} step={1} onChange={setK} format={(n) => `${n} in a row`} />
      </div>
      <LinePlot
        label={`Equity in R for ${RUNS} simulated traders with the same edge, over ${trades} trades`}
        series={sims.map((s, j) => ({ values: s.path, tone: j === 0 ? "accent" : "muted", width: j === 0 ? 2 : 1, opacity: j === 0 ? 1 : 0.45 }))}
        xLabel="Trade number"
        lines={[{ y: 0, label: "start", tone: "muted", dashed: true }]}
        yFormat={(n) => `${num(n, 0)}R`}
      />
      <p className="text-[11px] text-fg-subtle">Each line is one simulated trader. Same rules, same edge; only luck differs.</p>
      <Readouts cols={4}>
        <Readout label="Expectancy per trade" value={r1(e)} tone={e > 0 ? "up" : e < 0 ? "down" : undefined} />
        <Readout label="Longest losing streak" value={`median ${median(streaks)}`} sub={`worst ${Math.max(...streaks)}`} />
        <Readout label="Traders below start" value={`${below} of ${RUNS}`} />
        <Readout label={`Chance of ${k}+ losses in a row`} value={pct(pk, 0)} sub={`in ${trades} trades (exact)`} tone="warn" />
      </Readouts>
      <Result tone={e <= 0 ? "bad" : "info"}>
        {e <= 0 ? "With no positive expectancy, no amount of discipline makes this profitable on average. " : `Even with a positive expectancy of ${r1(e)} a trade, long losing runs are likely. `}
        A streak alone does not tell you the edge is gone; judge that from a large sample and from whether you followed the rules.
      </Result>
      <Button onClick={() => setSeed((x) => x + 1)}>Run again</Button>
    </WidgetFrame>
  );
}

// ── L7. Decision versus outcome sorter ──────────────────────────────────────

export const OUTCOME_CASES: { id: string; text: string; sound: boolean; goodOutcome: boolean }[] = [
  { id: "c1", text: "Followed the plan: 1% risk, stop set before entry. The stop was hit for −1R.", sound: true, goodOutcome: false },
  { id: "c2", text: "No stop, five times normal size on a tip from a chat group. It made +6R.", sound: false, goodOutcome: true },
  { id: "c3", text: "Skipped a setup because it broke the daily loss stop. The setup would have won.", sound: true, goodOutcome: false },
  { id: "c4", text: "Doubled size after two losses to win it back. It lost another −4R.", sound: false, goodOutcome: false },
  { id: "c5", text: "Checklist complete, size per plan, exit at the planned target for +2R.", sound: true, goodOutcome: true },
  { id: "c6", text: "Moved the stop further away to avoid being stopped out. Price came back and it closed at +0.5R.", sound: false, goodOutcome: true },
];
const CELL = (sound: boolean, good: boolean) => (sound ? (good ? "Earned reward" : "Bad luck: keep doing it") : good ? "Dumb luck: do not repeat" : "Deserved loss");

export function OutcomeSorter({ title, caption }: P) {
  const [ans, setAns] = useState<Record<string, "sound" | "poor" | "">>({});
  const done = OUTCOME_CASES.filter((c) => ans[c.id]);
  const right = done.filter((c) => (ans[c.id] === "sound") === c.sound).length;
  return (
    <WidgetFrame title={title} caption={caption} source="sample">
      <p className="text-[13px] text-fg-muted">Judge each made-up trade by its process, not its result.</p>
      <ul className="space-y-2.5">
        {OUTCOME_CASES.map((c) => {
          const a = ans[c.id] ?? "";
          const ok = a && (a === "sound") === c.sound;
          return (
            <li key={c.id} className="rounded-md border border-line p-2.5" data-case={c.id}>
              <p className="mb-1.5 text-[13px]">{c.text}</p>
              <Choice label="The decision was" value={a} options={[{ id: "sound", label: "Sound process" }, { id: "poor", label: "Poor process" }]} onChange={(v) => setAns((s) => ({ ...s, [c.id]: v }))} />
              {a && (
                <p className={cn("mt-1.5 text-xs", ok ? "text-up" : "text-down")} data-verdict>
                  {ok ? "Right." : "Look again."} {c.sound ? "Sound process" : "Poor process"}, {c.goodOutcome ? "good" : "bad"} outcome: {CELL(c.sound, c.goodOutcome).toLowerCase()}.
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <Result tone={done.length === OUTCOME_CASES.length ? (right === done.length ? "good" : "warn") : "info"}>
        {done.length === 0 ? "Sort each case." : `${right} of ${done.length} judged by process.`} A good outcome from a poor process is the most dangerous cell: it teaches you to repeat the mistake.
      </Result>
    </WidgetFrame>
  );
}

// ── L8. Revenge trading versus a daily loss stop ────────────────────────────

const DAYS = 250;

export function RevengeTool({ title, caption }: P) {
  const [stop, setStop] = useState(3);
  const [maxT, setMaxT] = useState(10);
  const [cost, setCost] = useState(0.05);
  const [seed, setSeed] = useState(1);
  const st = useMemo(() => simulateDays({ seed: 8100 + seed, days: DAYS, policy: "stop", maxTrades: maxT, dailyStopR: stop, badR: 10, costR: cost }), [seed, stop, maxT, cost]);
  const rv = useMemo(() => simulateDays({ seed: 8100 + seed, days: DAYS, policy: "revenge", maxTrades: maxT, dailyStopR: stop, badR: 10, costR: cost }), [seed, stop, maxT, cost]);
  const cum = (xs: number[]) => xs.reduce<number[]>((a, x) => [...a, (a[a.length - 1] ?? 0) + x], [0]);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Daily loss stop" value={stop} min={1} max={6} step={1} onChange={setStop} format={(n) => `${n}R`} />
        <Slider label="Most trades in a day" value={maxT} min={5} max={20} step={1} onChange={setMaxT} />
        <Slider label="Cost per trade" value={cost} min={0} max={0.2} step={0.01} onChange={setCost} format={(n) => `${num(n, 2)}R`} />
      </div>
      <LinePlot
        label={`Running total in R over ${DAYS} simulated days: fixed 1R risk with a daily loss stop, against doubling the size after every loss`}
        series={[{ values: cum(st.finals), tone: "accent" }, { values: cum(rv.finals), tone: "down" }]}
        xLabel="Day"
        lines={[{ y: 0, label: "start", tone: "muted", dashed: true }]}
        yFormat={(n) => `${num(n, 0)}R`}
      />
      <p className="text-[11px] text-fg-subtle">Blue: 1R a trade with a {stop}R daily stop · red: revenge sizing (double after each loss, up to 32R).</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-line p-2.5" data-policy="stop">
          <p className="t-label mb-1">Daily loss stop</p>
          <Readouts>
            <Readout label="Winning days" value={pct(st.winningDays)} />
            <Readout label="Worst day" value={r1(st.worst)} />
            <Readout label="Days worse than −10R" value={pct(st.badDays)} />
            <Readout label="Average day" value={r1(st.mean)} />
          </Readouts>
        </div>
        <div className="rounded-md border border-down/30 p-2.5" data-policy="revenge">
          <p className="t-label mb-1">Revenge sizing</p>
          <Readouts>
            <Readout label="Winning days" value={pct(rv.winningDays)} />
            <Readout label="Worst day" value={r1(rv.worst)} tone="down" />
            <Readout label="Days worse than −10R" value={pct(rv.badDays)} tone="down" />
            <Readout label="Average day" value={r1(rv.mean)} />
          </Readouts>
        </div>
      </div>
      <Result tone="warn">
        The setup has no edge (50/50, win 1R, lose 1R, minus costs), so neither rule can make money on average. Revenge sizing wins more often but its worst day here is {r1(rv.worst)}, against {r1(st.worst)} with the stop. Rare, huge losses are what end accounts.
      </Result>
      <Button onClick={() => setSeed((x) => x + 1)}>Simulate new days</Button>
    </WidgetFrame>
  );
}

// ── L9. Tilt self-check (reflection, not a diagnosis) ───────────────────────

const LEVELS = [{ id: "0", label: "Not at all" }, { id: "1", label: "A little" }, { id: "2", label: "Very much" }] as const;
type Level = (typeof LEVELS)[number]["id"];

export function TiltCheck({ title, caption }: P) {
  const [a, setA] = useState<Level[]>(TILT_PROMPTS.map(() => "0"));
  const r = tiltReflection(a.map(Number));
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <p className="rounded-md border border-warn/30 bg-warn-soft p-2 text-[13px]" data-not-diagnosis>
        A reflection tool, not a diagnosis or a health assessment. Your answers stay on this page and are not saved or sent.
      </p>
      <ol className="space-y-2.5">
        {TILT_PROMPTS.map((t, j) => (
          <li key={j} data-prompt={j}>
            <Choice label={`${j + 1}. ${t}`} value={a[j]} options={LEVELS} onChange={(v) => setA((x) => x.map((y, i) => (i === j ? v : y)))} />
          </li>
        ))}
      </ol>
      <Readouts cols={2}>
        <Readout label="Your total" value={`${r.score} of ${r.max}`} />
        <Readout label="Suggested next step" value={r.band === "pause" ? "Pause" : r.band === "watch" ? "Slow down" : "Carry on with your plan"} tone={r.band === "pause" ? "down" : r.band === "watch" ? "warn" : "up"} />
      </Readouts>
      <Result tone={r.band === "pause" ? "bad" : r.band === "watch" ? "warn" : "good"}>
        {r.band === "pause"
          ? "Consider stopping for the day: close the platform, write down what happened, and review tomorrow. A broken rule is reason enough on its own."
          : r.band === "watch"
            ? "Some warning signs. Take a break, re-read your plan and checklist, and trade smaller or not at all until they pass."
            : "No strong warning signs right now. Keep following your plan and check in again after a loss."}{" "}
        If stress or low mood reach beyond trading, talk to someone you trust or a health professional.
      </Result>
    </WidgetFrame>
  );
}

// ── L10. Pre-trade checklist builder (saved in this browser) ────────────────

const CHECK_KEY = "trader-os:psy-checklist:v1";
const DEFAULT_CHECKS = [
  "The setup is one my plan allows.",
  "I know my entry, stop and target before I enter.",
  "Risk on this trade is within my plan's limit.",
  "I am inside today's daily loss stop.",
  "I am not trying to win back a loss.",
  "I have checked for news or events that could gap the price.",
];

export function ChecklistBuilder({ title, caption }: P) {
  const [items, setItems] = useState<string[]>(DEFAULT_CHECKS);
  const [ticked, setTicked] = useState<Record<number, boolean>>({});
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState<"idle" | "saved" | "blocked">("idle");
  useEffect(() => {
    const v = loadLocal(CHECK_KEY, DEFAULT_CHECKS, isStringArray);
    if (v.length) setItems(v);
  }, []);
  const persist = (next: string[]) => {
    setItems(next);
    setTicked({});
    setSaved(saveLocal(CHECK_KEY, next) ? "saved" : "blocked");
  };
  const all = items.length > 0 && items.every((_, i) => ticked[i]);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <p className="text-xs text-fg-muted" data-storage-note>Saved only in this browser. Nothing is sent anywhere, and clearing your browser data removes it.</p>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={`${i}-${t}`} className="flex items-start justify-between gap-2" data-check={i}>
            <label className="flex min-w-0 cursor-pointer items-start gap-2 text-[13px]">
              <input type="checkbox" checked={!!ticked[i]} onChange={(e) => setTicked((s) => ({ ...s, [i]: e.target.checked }))} className="mt-0.5 size-3.5 shrink-0 accent-accent" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{t}</span>
            </label>
            <Button variant="ghost" className="h-7 shrink-0 px-2 text-xs" aria-label={`Remove: ${t}`} onClick={() => persist(items.filter((_, j) => j !== i))}>Remove</Button>
          </li>
        ))}
      </ul>
      <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); const t = draft.trim().slice(0, 160); if (t) { persist([...items, t]); setDraft(""); } }}>
        <label className="sr-only" htmlFor="psy-check-new">New checklist item</label>
        <input id="psy-check-new" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add your own rule" maxLength={160} className="h-8 min-w-0 flex-1 rounded-md border border-line-strong bg-raised px-2 text-[13px]" />
        <Button type="submit" variant="primary">Add</Button>
        <Button type="button" variant="ghost" onClick={() => { removeLocal(CHECK_KEY); setItems(DEFAULT_CHECKS); setTicked({}); setSaved("idle"); }}>Reset to defaults</Button>
      </form>
      <Result tone={all ? "good" : "warn"}>
        {items.length === 0 ? "Your checklist is empty. Add at least one rule." : all ? "Every item ticked. The trade meets your own rules; that is not a prediction that it will win." : `${items.filter((_, i) => ticked[i]).length} of ${items.length} ticked. If any item is not true, the rule is: no trade.`}
        {saved === "saved" ? " Changes saved in this browser." : saved === "blocked" ? " This browser blocked saving, so changes last only until you leave the page." : ""}
      </Result>
    </WidgetFrame>
  );
}

// ── L11. Realistic expectations: zero-edge traders after costs ──────────────

export function ExpectationsTool({ title, caption }: P) {
  const [trades, setTrades] = useState(100);
  const [cost, setCost] = useState(0.1);
  const [seed, setSeed] = useState(1);
  const z = useMemo(() => zeroEdgeTraders({ seed: 1100 + seed, traders: 1000, trades, costR: cost }), [seed, trades, cost]);
  const bins = useMemo(() => {
    const lo = Math.floor(z.worst / 10) * 10, hi = Math.ceil((z.best + 0.001) / 10) * 10;
    const out: { from: number; n: number }[] = [];
    for (let b = lo; b < hi; b += 10) out.push({ from: b, n: z.finals.filter((x) => x >= b && x < b + 10).length });
    return out;
  }, [z]);
  const maxN = Math.max(1, ...bins.map((b) => b.n));
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Trades per trader" value={trades} min={20} max={500} step={20} onChange={setTrades} />
        <Slider label="Cost per trade" value={cost} min={0} max={0.3} step={0.02} onChange={setCost} format={(n) => `${num(n, 2)}R`} />
      </div>
      <div className="flex h-28 items-end gap-px" role="img" aria-label={`Histogram of final results in R for 1,000 simulated traders with no edge, after ${trades} trades`} data-histogram>
        {bins.map((b) => (
          <div key={b.from} title={`${b.from}R to ${b.from + 10}R: ${b.n}`} className={cn("min-w-0 flex-1 rounded-t-sm", b.from >= 0 ? "bg-up/70" : "bg-down/70")} style={{ height: `${(b.n / maxN) * 100}%` }} />
        ))}
      </div>
      <p className="text-[11px] text-fg-subtle">Final result of 1,000 simulated traders, in 10R bins. Green: ahead · red: behind.</p>
      <Readouts cols={4}>
        <Readout label="Ahead after costs" value={`${z.ahead} of 1,000`} />
        <Readout label="Average result" value={r1(z.mean)} tone="down" />
        <Readout label="Best trader" value={r1(z.best)} tone="up" />
        <Readout label="Worst trader" value={r1(z.worst)} tone="down" />
      </Readouts>
      <Result tone="warn">
        None of these traders has any skill: every trade is a coin flip. Costs push the average to {r1(z.mean)}, yet {z.ahead} still finish ahead by luck alone. The best of them would look talented. A good record over a short period is weak evidence of skill.
      </Result>
      <Button onClick={() => setSeed((x) => x + 1)}>New traders</Button>
    </WidgetFrame>
  );
}

// ── L12. Trading-plan template (saved in this browser) ──────────────────────

const PLAN_KEY = "trader-os:psy-plan:v1";
export const PLAN_FIELDS = [
  { id: "why", label: "Why I trade and what I want from it", hint: "For example: to learn a skill with money I can afford to lose." },
  { id: "markets", label: "Markets and times I trade", hint: "Which instruments, which sessions, and when I do not trade." },
  { id: "setups", label: "Setups I am allowed to take", hint: "Each written as a rule someone else could check." },
  { id: "risk", label: "Risk per trade and position sizing", hint: "For example: 1% of the account, sized from the stop distance." },
  { id: "limits", label: "Daily and weekly loss stops", hint: "The loss at which I stop for the day or week, no exceptions." },
  { id: "routine", label: "Before, during and after the session", hint: "Checklist, journal, and when I review." },
  { id: "rules", label: "If-then rules for tilt and losing streaks", hint: "For example: if I break a rule, I stop for the day." },
  { id: "review", label: "How and when I review the plan", hint: "Judge the process over a large sample, not one week of P&L." },
] as const;

export function PlanTemplate({ title, caption }: P) {
  const [plan, setPlan] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<"idle" | "saved" | "blocked">("idle");
  useEffect(() => {
    setPlan(loadLocal(PLAN_KEY, {}, isStringRecord));
  }, []);
  const set = (id: string, v: string) => {
    const next = { ...plan, [id]: v.slice(0, 1200) };
    setPlan(next);
    setSaved(saveLocal(PLAN_KEY, next) ? "saved" : "blocked");
  };
  const filled = PLAN_FIELDS.filter((f) => (plan[f.id] ?? "").trim().length > 0).length;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <p className="text-xs text-fg-muted" data-storage-note>Saved only in this browser as you type. Nothing is sent anywhere, and clearing your browser data removes it.</p>
      <div className="space-y-3">
        {PLAN_FIELDS.map((f) => (
          <div key={f.id} className="min-w-0" data-field={f.id}>
            <label htmlFor={`psy-plan-${f.id}`} className="text-[13px] font-medium">{f.label}</label>
            <p className="text-[11px] text-fg-subtle">{f.hint}</p>
            <textarea id={`psy-plan-${f.id}`} value={plan[f.id] ?? ""} onChange={(e) => set(f.id, e.target.value)} rows={2} className="mt-1 w-full min-w-0 rounded-md border border-line-strong bg-raised p-2 text-[13px]" />
          </div>
        ))}
      </div>
      <Result tone={filled === PLAN_FIELDS.length ? "good" : "info"}>
        {filled} of {PLAN_FIELDS.length} sections filled.{" "}
        {filled === PLAN_FIELDS.length ? "A complete first draft. Test it on a demo account before risking money." : "A plan does not need to be long, but each section should be specific enough to check."}
        {saved === "saved" ? " Saved in this browser." : saved === "blocked" ? " This browser blocked saving, so your text lasts only until you leave the page." : ""}
      </Result>
      <Button variant="ghost" onClick={() => { removeLocal(PLAN_KEY); setPlan({}); setSaved("idle"); }}>Clear the plan</Button>
    </WidgetFrame>
  );
}
