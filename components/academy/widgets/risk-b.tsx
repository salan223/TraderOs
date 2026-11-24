"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { rng } from "@/lib/academy/charts";
import { applyDailyLimit, averagingDown, combinedRisk, gapLoss, marginPlan, monteCarlo, portfolioHeat, recoveryNeeded } from "@/lib/academy/risk";
import { Button } from "@/components/ui/button";
import { Bar, Choice, NumberField, Readout, Readouts, Result, Slider, WidgetFrame, money, num, signed } from "./kit";
import { LinePlot } from "./risk-plot";

type FrameProps = { title: string; caption: string };
const pct = (n: number | null | undefined, dp = 1) => (n === null || n === undefined || !Number.isFinite(n) ? "—" : `${num(n, dp)}%`);

// ── L6. Leverage and margin ─────────────────────────────────────────────────

const LEVERAGE_CHOICES = [
  { id: "2", label: "1:2" }, { id: "10", label: "1:10" }, { id: "30", label: "1:30" }, { id: "100", label: "1:100" }, { id: "500", label: "1:500" },
] as const;
type LevId = (typeof LEVERAGE_CHOICES)[number]["id"];

export function LeverageSim({ title, caption }: FrameProps) {
  const [balance, setBalance] = useState(5_000);
  const [lots, setLots] = useState(0.5);
  const [lev, setLev] = useState<LevId>("30");
  const [side, setSide] = useState<"long" | "short">("long");
  const [move, setMove] = useState(0);
  const entry = 1.1;
  const units = Math.round(lots * 100_000);
  const plan = marginPlan({ balance, units, entry, leverage: Number(lev), side, callLevel: 100, stopOutLevel: 50 });
  const price = entry * (1 + move / 100);
  const pnl = (side === "long" ? price - entry : entry - price) * units;
  const equity = balance + pnl;
  const level = plan && plan.usedMargin > 0 ? (equity / plan.usedMargin) * 100 : null;
  const status = level === null ? "ok" : level <= 50 ? "stop-out" : level <= 100 ? "margin-call" : "ok";
  const tooBig = plan !== null && plan.usedMargin > balance;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Account balance" value={balance} onChange={setBalance} min={100} max={1_000_000} suffix="USD" />
        <Slider label="Position size (EUR/USD at 1.1000)" value={lots} min={0.01} max={5} step={0.01} onChange={setLots} format={(n) => `${num(n, 2)} lots = ${Math.round(n * 100_000).toLocaleString("en-US")} EUR`} />
        <Choice label="Maximum leverage the broker allows" value={lev} onChange={setLev} options={LEVERAGE_CHOICES} />
        <Choice label="Direction" value={side} onChange={setSide} options={[{ id: "long", label: "Long (buy)" }, { id: "short", label: "Short (sell)" }]} />
      </div>
      <Readouts cols={4}>
        <Readout label="Position value (notional)" value={plan ? money(plan.notional) : "—"} />
        <Readout label="Margin used" value={plan ? money(plan.usedMargin) : "—"} tone={tooBig ? "down" : undefined} sub={tooBig ? "More than the balance: cannot open" : undefined} />
        <Readout label="Effective leverage" value={plan ? `${num(plan.effectiveLeverage, 1)} : 1` : "—"} tone={plan && plan.effectiveLeverage > 10 ? "warn" : "accent"} sub="Notional ÷ balance" />
        <Readout label="1% move in EUR/USD" value={plan ? `${pct(plan.effectiveLeverage)} of the account` : "—"} />
        <Readout label="Margin call (100%) at" value={plan?.callPrice ? num(plan.callPrice, 4) : "—"} />
        <Readout label="Stop-out (50%) at" value={plan?.stopOutPrice ? num(plan.stopOutPrice, 4) : "—"} tone="down" sub={plan?.stopOutMovePct !== null && plan?.stopOutMovePct !== undefined ? `a ${num(plan.stopOutMovePct, 2)}% move against you` : undefined} />
      </Readouts>
      <Slider label="Move EUR/USD" value={move} min={-5} max={5} step={0.05} onChange={setMove} format={(n) => `${signed(n, 2)}% → ${num(price, 4)}`} hint="Try the moves needed to reach the margin call and the stop-out." />
      <Readouts cols={3}>
        <Readout label="Floating P&L" value={money(pnl)} tone={pnl >= 0 ? "up" : "down"} />
        <Readout label="Equity" value={money(equity)} />
        <Readout label="Margin level" value={level === null ? "—" : pct(level, 0)} tone={status === "ok" ? undefined : "down"} />
      </Readouts>
      {plan && <Bar label="Margin level (100% = margin call, 50% = stop-out in this example)" pct={Math.min(100, (level ?? 0) / 5)} value={pct(level, 0)} tone={status === "ok" ? "up" : status === "margin-call" ? "warn" : "down"} />}
      <Result tone={status === "stop-out" ? "bad" : status === "margin-call" || tooBig ? "warn" : "info"}>
        {tooBig
          ? `At 1:${lev} this position needs ${money(plan!.usedMargin)} of margin, more than the balance. Brokers would refuse it.`
          : `Effective leverage is the position value ÷ your money: ${money(plan?.notional)} ÷ ${money(balance)} = ${num(plan?.effectiveLeverage ?? 0, 1)} : 1. It does not depend on the broker's maximum: 1:${lev} only sets the margin needed. ${status === "stop-out" ? "The margin level is at or below 50%: in this example the broker closes positions automatically, at whatever price it can get." : status === "margin-call" ? "The margin level is at or below 100%: a margin call. You cannot open more, and a little further the broker starts closing positions." : `A ${num(plan?.stopOutMovePct ?? 0, 2)}% move against you would trigger the stop-out. Margin call and stop-out levels differ between brokers; these are examples.`}`}
      </Result>
    </WidgetFrame>
  );
}

// ── L7. Correlation and portfolio heat ──────────────────────────────────────

type Pos = { id: string; label: string; group: "usd" | "tech" | "gold"; risk: number };
const START_POS: Pos[] = [
  { id: "eurusd", label: "Long EUR/USD", group: "usd", risk: 1 },
  { id: "gbpusd", label: "Long GBP/USD", group: "usd", risk: 1 },
  { id: "audusd", label: "Long AUD/USD", group: "usd", risk: 1 },
  { id: "tech", label: "Long a tech share", group: "tech", risk: 1 },
  { id: "gold", label: "Long gold", group: "gold", risk: 1 },
];

export function PortfolioHeat({ title, caption }: FrameProps) {
  const [risks, setRisks] = useState<number[]>(START_POS.map((p) => p.risk));
  const [within, setWithin] = useState(0.8);
  const [across, setAcross] = useState(0.2);
  const [cap, setCap] = useState(5);
  const heat = portfolioHeat(risks) ?? 0;
  const corr = (i: number, j: number) => (START_POS[i].group === START_POS[j].group ? within : across);
  const combined = combinedRisk(risks, corr) ?? 0;
  const independent = combinedRisk(risks, () => 0) ?? 0;
  const usd = risks.filter((_, i) => START_POS[i].group === "usd").reduce((a, b) => a + b, 0);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        {START_POS.map((p, i) => (
          <Slider key={p.id} label={`${p.label}: risk to its stop`} value={risks[i]} min={0} max={3} step={0.25} onChange={(n) => setRisks((r) => r.map((x, k) => (k === i ? n : x)))} format={(n) => `${num(n, 2)}%`} />
        ))}
      </div>
      <div className="grid gap-3 border-t border-line pt-3 sm:grid-cols-3">
        <Slider label="Correlation within a group (the three USD pairs)" value={within} min={-1} max={1} step={0.05} onChange={setWithin} format={(n) => num(n, 2)} />
        <Slider label="Correlation between groups" value={across} min={-1} max={1} step={0.05} onChange={setAcross} format={(n) => num(n, 2)} />
        <Slider label="Your heat limit" value={cap} min={1} max={15} step={0.5} onChange={setCap} format={(n) => `${num(n, 1)}%`} />
      </div>
      <Readouts cols={4}>
        <Readout label="Portfolio heat (all stops hit)" value={pct(heat, 2)} tone={heat > cap ? "down" : "accent"} />
        <Readout label="Correlation-adjusted risk" value={pct(combined, 2)} sub="√(Σ rᵢ rⱼ ρᵢⱼ)" />
        <Readout label="If all were independent" value={pct(independent, 2)} />
        <Readout label="Risk on one idea: a weaker USD" value={pct(usd, 2)} tone={usd > 2 ? "warn" : undefined} />
      </Readouts>
      <div className="space-y-2">
        <Bar label="Heat against your limit" pct={(heat / Math.max(cap, heat)) * 100} value={`${pct(heat, 2)} of ${pct(cap, 1)}`} tone={heat > cap ? "down" : "accent"} />
        <Bar label="Correlation-adjusted, same scale" pct={(combined / Math.max(cap, heat)) * 100} value={pct(combined, 2)} tone="muted" />
      </div>
      <Result tone={heat > cap ? "bad" : usd > 2 ? "warn" : "info"}>
        {`Heat adds up the risk to every stop: ${pct(heat, 2)}. That is what you lose if everything goes wrong at once, which is the case that matters. With these correlations, a statistical "typical" combined risk is ${pct(combined, 2)}, but correlations are estimates from the past and tend to rise in sell-offs (see the research below), so do not rely on the lower number. Three long-USD-against-something trades are mostly one bet against the dollar: ${pct(usd, 2)} on one idea.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L8. Gaps, slippage and a daily loss limit ───────────────────────────────

const DAY = (() => {
  const r = rng(8808);
  return Array.from({ length: 12 }, () => (r() < 0.42 ? Math.round(80 + r() * 140) : -Math.round(60 + r() * 60)));
})();

export function GapLimits({ title, caption }: FrameProps) {
  const [gapPct, setGapPct] = useState(6);
  const [slip, setSlip] = useState(0.05);
  const [limit, setLimit] = useState(250);
  const entry = 50, stop = 48, units = 50; // risk $100
  const open = entry * (1 - gapPct / 100);
  const g = gapLoss({ entry, stop, open, units, side: "long", extraSlippage: slip });
  const d = applyDailyLimit(DAY, limit);
  let run = 0;
  const cum = DAY.map((x) => (run += x));
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <p className="text-xs leading-relaxed text-fg-muted">Long 50 shares at $50.00 with a stop at $48.00: a planned loss of $100. Overnight, news arrives.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Next open, below yesterday's close" value={gapPct} min={0} max={25} step={0.5} onChange={setGapPct} format={(n) => `−${num(n, 1)}% → $${num(open, 2)}`} />
        <Slider label="Extra slippage when the stop executes" value={slip} min={0} max={0.5} step={0.01} onChange={setSlip} format={(n) => `$${num(n, 2)} a share`} />
      </div>
      <Readouts cols={4}>
        <Readout label="Stop filled at" value={g ? money(g.fill) : "—"} tone={g && g.fill < stop ? "down" : undefined} />
        <Readout label="Actual loss" value={g ? money(g.loss) : "—"} tone="down" />
        <Readout label="Planned loss" value={g ? money(g.plannedLoss) : "—"} />
        <Readout label="Actual ÷ planned" value={g ? `${num(g.multipleOfPlan, 2)} R` : "—"} tone={g && g.multipleOfPlan > 1.5 ? "down" : undefined} />
      </Readouts>
      <Result tone={g && g.multipleOfPlan > 1.5 ? "bad" : "info"}>
        {g
          ? `${open < stop ? `The market opened at $${num(open, 2)}, below the stop, so the stop became a market order at the open and filled at about $${num(g.fill, 2)}.` : `The open ($${num(open, 2)}) was above the stop, so the stop could still fill near $48.00 (minus slippage).`} The loss is ${num(g.multipleOfPlan, 2)} times the plan. A stop sets where you want out, not the price you get.`
          : "Check the inputs."}
      </Result>
      <div className="border-t border-line pt-3">
        <Slider label="Daily loss limit" value={limit} min={50} max={600} step={25} onChange={setLimit} format={(n) => money(n, "USD", 0)} hint="Twelve simulated trade results for one day, in order." />
        <LinePlot
          label="Running profit and loss over one simulated day of twelve trades, with the daily loss limit"
          series={[{ values: [0, ...cum.slice(0, d?.taken ?? 12)], tone: "accent" }, { values: [0, ...cum], tone: "muted", opacity: 0.5, width: 1.25 }]}
          lines={[{ y: -limit, label: `limit −${money(limit, "USD", 0)}`, tone: "down" }]}
          yFormat={(n) => money(n, "USD", 0)}
          xLabel="Trades taken today"
          height={170}
        />
        <Readouts cols={3}>
          <Readout label="Trades taken" value={d ? `${d.taken} of ${DAY.length}` : "—"} />
          <Readout label="Day's P&L with the limit" value={d ? money(d.dayPnl) : "—"} tone={d && d.dayPnl < 0 ? "down" : "up"} />
          <Readout label="Without the limit" value={money(cum[cum.length - 1])} />
        </Readouts>
        <Result tone="info">
          {d?.stoppedAt !== null && d
            ? `The limit was reached after trade ${d.taken}, so the other ${d.skipped} were not taken. Here the end-of-day total without the limit was ${money(cum[cum.length - 1])}: sometimes stopping misses a recovery, sometimes it avoids a worse day. The point of a limit is not to pick the best outcome on one day but to cap the worst one, and to stop decisions made while upset.`
            : `The day never reached the limit of ${money(limit, "USD", 0)}, so every trade was taken.`}
        </Result>
      </div>
    </WidgetFrame>
  );
}

// ── L9. Averaging down ──────────────────────────────────────────────────────

export function AveragingDown({ title, caption }: FrameProps) {
  const [mode, setMode] = useState<"equal" | "double">("equal");
  const [step, setStep] = useState(10);
  const [adds, setAdds] = useState(3);
  const steps = averagingDown(100, 10, step, adds, mode) ?? [];
  const last = steps[steps.length - 1];
  const plannedLoss = 10 * 100 * (step / 100); // one stop one step below the first entry
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <p className="text-xs leading-relaxed text-fg-muted">Buy 10 shares at $100. Each time the price falls another step, buy more. The alternative: one stop, one step below the entry.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Choice label="Size of each add" value={mode} onChange={setMode} options={[{ id: "equal", label: "Same each time" }, { id: "double", label: "Double each time" }]} />
        <Slider label="Step between buys" value={step} min={2} max={20} step={1} onChange={setStep} format={(n) => `${n}% of $100`} />
        <Slider label="Number of adds" value={adds} min={0} max={6} step={1} onChange={setAdds} format={(n) => `${n}`} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] text-left text-xs tabular">
          <caption className="sr-only">Each buy: price, shares added, total shares, average price, open loss and rebound needed to break even</caption>
          <thead className="text-fg-subtle">
            <tr><th className="py-1 pr-2 font-normal">Price</th><th className="py-1 pr-2 font-normal">Added</th><th className="py-1 pr-2 font-normal">Held</th><th className="py-1 pr-2 font-normal">Average</th><th className="py-1 pr-2 font-normal">Open loss</th><th className="py-1 font-normal">Rebound to break even</th></tr>
          </thead>
          <tbody className="font-mono text-fg">
            {steps.map((s, i) => (
              <tr key={i} className="border-t border-line">
                <td className="py-1 pr-2">{money(s.price)}</td><td className="py-1 pr-2">{s.addQty}</td><td className="py-1 pr-2">{s.totalQty}</td>
                <td className="py-1 pr-2">{money(s.avgPrice)}</td><td className="py-1 pr-2 text-down">{money(-s.openLoss)}</td><td className="py-1">{pct(s.reboundToBreakevenPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Readouts cols={3}>
        <Readout label="Money now in the trade" value={last ? money(last.avgPrice * last.totalQty) : "—"} sub="from $1,000 at the start" />
        <Readout label="Open loss now" value={last ? money(-last.openLoss) : "—"} tone="down" />
        <Readout label="Loss with one stop instead" value={money(-plannedLoss)} tone="up" />
      </Readouts>
      <Result tone={last && last.openLoss > plannedLoss * 3 ? "bad" : "warn"}>
        {last
          ? `Averaging down lowers the average price (${money(last.avgPrice)}), which feels like progress, but it multiplies the size of a losing position: ${last.totalQty} shares instead of 10, and an open loss of ${money(last.openLoss)} against ${money(plannedLoss)} with a stop. ${mode === "double" ? "Doubling each time is a martingale: the size grows exponentially, so a long enough fall exhausts any account. " : ""}A price that falls a further ${step}% from here adds about ${money(last.totalQty * last.price * (step / 100))} more to the loss. A planned add with a fixed total risk is a different thing; adding because a trade is losing is not a plan.`
          : "Check the inputs."}
      </Result>
    </WidgetFrame>
  );
}

// ── L10. Risk of ruin: a Monte Carlo of equity curves ───────────────────────

export function MonteCarloTool({ title, caption }: FrameProps) {
  const [winRate, setWinRate] = useState(45);
  const [rr, setRr] = useState(1.5);
  const [risk, setRisk] = useState(2);
  const [trades, setTrades] = useState(200);
  const [mode, setMode] = useState<"fixed-fractional" | "fixed-dollar">("fixed-fractional");
  const [seed, setSeed] = useState(1);
  const input = { seed, paths: 500, trades, winRate: winRate / 100, rr, riskPct: risk, ruinPct: 50 };
  const res = useMemo(() => monteCarlo({ ...input, mode }), [seed, trades, winRate, rr, risk, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const other = useMemo(() => monteCarlo({ ...input, mode: mode === "fixed-fractional" ? "fixed-dollar" : "fixed-fractional" }), [seed, trades, winRate, rr, risk, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const edge = (winRate / 100) * rr - (1 - winRate / 100);
  const shown = res ? res.paths.slice(0, 20).map((p, i) => ({ values: p, tone: (p[p.length - 1] < 10_000 ? "down" : "up") as "down" | "up", opacity: i === 0 ? 1 : 0.45, width: i === 0 ? 2 : 1 })) : [];
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Win rate" value={winRate} min={20} max={80} step={1} onChange={setWinRate} format={(n) => `${n}%`} />
        <Slider label="Average win (in R)" value={rr} min={0.5} max={4} step={0.1} onChange={setRr} format={(n) => `${num(n, 1)} R`} />
        <Slider label="Risk per trade" value={risk} min={0.5} max={20} step={0.5} onChange={setRisk} format={(n) => `${num(n, 1)}%`} />
        <Slider label="Trades per path" value={trades} min={50} max={500} step={25} onChange={setTrades} format={(n) => `${n}`} />
      </div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <Choice label="Sizing" value={mode} onChange={setMode} options={[{ id: "fixed-fractional", label: "Fixed fractional (% of current equity)" }, { id: "fixed-dollar", label: "Fixed dollar (% of starting equity)" }]} />
        <Button onClick={() => setSeed((s) => s + 1)} aria-label="Draw new simulated paths with the next seed"><RotateCcw className="size-3.5" aria-hidden /> New paths (seed {seed})</Button>
      </div>
      <LinePlot
        label={`Twenty of 500 simulated equity curves over ${trades} trades, starting at $10,000, with the 50% ruin line`}
        series={shown}
        lines={[{ y: 10_000, label: "start", tone: "muted" }, { y: 5_000, label: "−50%: ruin line", tone: "down" }]}
        yMin={0}
        yFormat={(n) => (n >= 1000 ? `$${num(n / 1000, 0)}k` : `$${n}`)}
        xLabel="Trade number"
        height={210}
      />
      <Readouts cols={4}>
        <Readout label="Edge per trade" value={`${signed(edge, 2)} R`} tone={edge > 0 ? "up" : "down"} sub={`${winRate}% × ${num(rr, 1)} − ${100 - winRate}% × 1`} />
        <Readout label="Paths that fell 50% or more" value={res ? pct(res.ruinShare * 100) : "—"} tone={res && res.ruinShare > 0.05 ? "down" : undefined} />
        <Readout label="Median final equity" value={res ? money(res.medianFinal, "USD", 0) : "—"} sub={res ? `5th–95th: ${money(res.p5Final, "USD", 0)} to ${money(res.p95Final, "USD", 0)}` : undefined} />
        <Readout label="Median worst drawdown" value={res ? pct(res.medianMaxDrawdownPct) : "—"} sub={res ? `needs +${num(recoveryNeeded(res.medianMaxDrawdownPct) ?? 0, 0)}% to recover` : undefined} />
      </Readouts>
      {other && res && (
        <Readouts cols={2}>
          <Readout label={`Ruin share with ${mode === "fixed-fractional" ? "fixed dollar" : "fixed fractional"} instead`} value={pct(other.ruinShare * 100)} />
          <Readout label="Its median final equity" value={money(other.medianFinal, "USD", 0)} />
        </Readouts>
      )}
      <Result tone={edge <= 0 ? "bad" : res && res.ruinShare > 0.05 ? "warn" : "info"}>
        {`${edge <= 0 ? "With no edge, no sizing rule saves the account: the paths drift down. " : ""}These are 500 simulated paths from a seeded random model with a fixed win rate and payoff, not a forecast for any real strategy, whose win rate is only an estimate and can change. Fixed fractional shrinks each bet after losses, so it slows down in a losing run and cannot reach zero, though it can still fall a long way. Fixed dollar keeps betting the same amount however much is left, so a bad run can wipe it out. Raise the risk per trade and watch the spread of outcomes, and the drawdowns, widen even when the edge is positive.`}
      </Result>
    </WidgetFrame>
  );
}
