"use client";

import { useState, type ReactNode } from "react";
import { atr, simulateSeries, swings } from "@/lib/academy/charts";
import {
  atrStop, equityAfterLosses, expectancy, futuresSize, fxSize, lossesToDrawdown, recoveryNeeded, riskAmount, stockSize, streakProbability, structureStop,
} from "@/lib/academy/risk";
import { CandleChart, fmtPrice, type Annotation } from "@/components/academy/charts/candle-chart";
import { Bar, Choice, NumberField, Readout, Readouts, Result, Slider, WidgetFrame, money, num } from "./kit";
import { LinePlot } from "./risk-plot";

type FrameProps = { title: string; caption: string };
const pct = (n: number | null | undefined, dp = 1) => (n === null || n === undefined || !Number.isFinite(n) ? "—" : `${num(n, dp)}%`);

// ── L1. Risk per trade: what a losing streak does at each risk level ────────

export function RiskBudget({ title, caption }: FrameProps) {
  const [account, setAccount] = useState(10_000);
  const [risk, setRisk] = useState(1);
  const [streak, setStreak] = useState(10);
  const amount = riskAmount(account, risk);
  const left = equityAfterLosses(risk, streak);
  const to20 = lossesToDrawdown(risk, 20), to50 = lossesToDrawdown(risk, 50);
  const curve = Array.from({ length: 31 }, (_, n) => (equityAfterLosses(risk, n) ?? 0) * 100);
  const compare = [0.5, 1, 2, 5, 10].map((r) => ({ r, left: (equityAfterLosses(r, streak) ?? 0) * 100 }));
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Account size" value={account} onChange={setAccount} min={100} max={10_000_000} suffix="USD" />
        <Slider label="Risk per trade" value={risk} min={0.25} max={10} step={0.25} onChange={setRisk} format={(n) => `${num(n, 2)}%`} />
        <Slider label="Losses in a row" value={streak} min={1} max={30} step={1} onChange={setStreak} format={(n) => `${n}`} />
      </div>
      <Readouts cols={4}>
        <Readout label="Money at risk on the next trade" value={money(amount)} tone="accent" />
        <Readout label={`Account left after ${streak} losses`} value={pct(left === null ? null : left * 100)} sub={money(left === null ? null : left * account)} tone={left !== null && left < 0.8 ? "down" : undefined} />
        <Readout label="Losses in a row to fall 20%" value={to20 ?? "—"} />
        <Readout label="Losses in a row to fall 50%" value={to50 ?? "—"} />
      </Readouts>
      <LinePlot
        label={`Share of the account left after 0 to 30 losses in a row at ${num(risk, 2)}% risk per trade`}
        series={[{ values: curve }]}
        lines={[{ y: 80, label: "−20%" }, { y: 50, label: "−50%", tone: "down" }]}
        markers={[{ x: streak, y: curve[streak], label: pct(curve[streak]) }]}
        yMin={0}
        yMax={100}
        yFormat={(n) => `${n}%`}
        xLabel="Losses in a row"
      />
      <div className="space-y-2">
        {compare.map((c) => (
          <Bar key={c.r} label={`${num(c.r, c.r < 1 ? 1 : 0)}% per trade`} pct={c.left} value={`${num(c.left, 1)}% left`} tone={c.left < 50 ? "down" : c.left < 80 ? "warn" : "up"} />
        ))}
      </div>
      <Result tone={left !== null && left < 0.5 ? "bad" : left !== null && left < 0.8 ? "warn" : "info"}>
        {`Each loss takes ${num(risk, 2)}% of what is left, so after ${streak} losses the account is at (1 − ${num(risk / 100, 4)})^${streak} = ${pct(left === null ? null : left * 100)} of its start. Streaks of this length are not rare over hundreds of trades (lesson 5 shows how to estimate how often). The risk you choose decides how much of the account a bad run can take; it does not change how good your trades are.`}
      </Result>
    </WidgetFrame>
  );
}

// ── L2. Position size: stocks, FX and futures ───────────────────────────────

type Market = "stock" | "fx" | "futures";
type PairId = "EURUSD" | "USDJPY" | "EURGBP";
const PAIRS: Record<PairId, { base: string; quote: string; rate: number; label: string; note: string }> = {
  EURUSD: { base: "EUR", quote: "USD", rate: 1.1, label: "EUR/USD", note: "The quote currency (USD) is the account currency, so one pip on one unit is worth 0.0001 USD." },
  USDJPY: { base: "USD", quote: "JPY", rate: 150, label: "USD/JPY", note: "The base currency (USD) is the account currency. A pip is 0.01 JPY per unit, worth 0.01 ÷ rate in USD." },
  EURGBP: { base: "EUR", quote: "GBP", rate: 0.85, label: "EUR/GBP", note: "A cross: neither currency is the account currency. A pip is 0.0001 GBP per unit, converted to USD with the GBP/USD rate." },
};

export function PositionSizeTool({ title, caption }: FrameProps) {
  const [market, setMarket] = useState<Market>("stock");
  const [account, setAccount] = useState(10_000);
  const [risk, setRisk] = useState(1);
  // stock
  const [entry, setEntry] = useState(50);
  const [stop, setStop] = useState(48);
  // fx
  const [pair, setPair] = useState<PairId>("EURUSD");
  const [pips, setPips] = useState(20);
  const [gbpusd, setGbpusd] = useState(1.25);
  const [jpyRate, setJpyRate] = useState(150);
  // futures
  const [points, setPoints] = useState(10);
  const [pointValue, setPointValue] = useState(5);
  const amount = riskAmount(account, risk);

  let body: ReactNode = null;
  let message = "";
  let tone: "info" | "warn" | "bad" = "info";
  if (market === "stock") {
    const s = stockSize(account, risk, entry, stop);
    body = (
      <Readouts cols={4}>
        <Readout label="Risk per share" value={s ? money(s.perShareRisk) : "—"} />
        <Readout label="Shares" value={s ? s.shares.toLocaleString("en-US") : "—"} tone="accent" />
        <Readout label="Loss if the stop fills" value={s ? money(s.actualRisk) : "—"} />
        <Readout label="Position value" value={s ? money(s.notional) : "—"} sub={s ? `${num(s.notionalPct, 0)}% of the account` : undefined} tone={s && s.notionalPct > 100 ? "warn" : undefined} />
      </Readouts>
    );
    if (s) {
      message = `${money(amount)} ÷ |${num(entry, 2)} − ${num(stop, 2)}| = ${num(s.perShareRisk === 0 ? 0 : (amount ?? 0) / s.perShareRisk, 2)} → ${s.shares} shares (rounded down). ${stop > entry ? "The stop is above the entry, so this is a short position. " : ""}${s.notionalPct > 100 ? "The position is worth more than the account: it needs margin (leverage), and a gap past the stop could cost far more than planned." : "The position value is not the risk: the risk is what you lose if the stop fills at its price."}`;
      tone = s.notionalPct > 100 ? "warn" : "info";
    } else { message = "Enter an entry and a different stop price."; tone = "warn"; }
  } else if (market === "fx") {
    const p = PAIRS[pair];
    const rate = pair === "USDJPY" ? jpyRate : p.rate;
    const s = fxSize({ account, riskPct: risk, stopPips: pips, base: p.base, quote: p.quote, rate, accountCcy: "USD", quoteToAccount: pair === "EURGBP" ? gbpusd : undefined });
    body = (
      <>
        <Readouts cols={4}>
          <Readout label="Pip value per unit" value={s ? `${num(s.pipValuePerUnit, 7)} USD` : "—"} />
          <Readout label="Pip value per standard lot" value={s ? money(s.pipValuePerUnit * 100_000) : "—"} />
          <Readout label="Units (lots)" value={s ? `${s.units.toLocaleString("en-US")} (${num(s.lots, 2)})` : "—"} tone="accent" />
          <Readout label="Loss if the stop fills" value={s ? money(s.actualRisk) : "—"} />
        </Readouts>
        <p className="text-xs leading-relaxed text-fg-muted">{p.note}</p>
      </>
    );
    message = s
      ? `${money(amount)} ÷ (${pips} pips × ${num(s.pipValuePerUnit, 7)} USD) = ${Math.floor((amount ?? 0) / (pips * s.pipValuePerUnit)).toLocaleString("en-US")} units, rounded down to ${s.units.toLocaleString("en-US")} (whole micro lots of 1,000).${s.units === 0 ? " That is zero: even one micro lot would risk more than planned, so the trade does not fit." : ""}`
      : "Check the inputs.";
    tone = s && s.units === 0 ? "warn" : "info";
  } else {
    const f = futuresSize(account, risk, points, pointValue);
    body = (
      <Readouts cols={4}>
        <Readout label="Risk per contract" value={f ? money(f.riskPerContract) : "—"} />
        <Readout label="Contracts" value={f ? f.contracts : "—"} tone={f?.tooSmall ? "down" : "accent"} />
        <Readout label="Loss if the stop fills" value={f ? money(f.actualRisk) : "—"} />
        <Readout label="Planned risk" value={money(amount)} />
      </Readouts>
    );
    message = f
      ? `${money(amount)} ÷ (${num(points, 2)} points × ${money(pointValue)} a point) = ${num((amount ?? 0) / f.riskPerContract, 2)} → ${f.contracts} contract${f.contracts === 1 ? "" : "s"}. ${f.tooSmall ? "Even one contract risks more than your plan. The honest answer is no trade (or a smaller contract, such as a micro contract, if one exists), not a closer stop chosen to make the numbers fit." : "Contracts come in whole numbers, so the actual risk is usually below the plan."}`
      : "Check the inputs.";
    tone = f?.tooSmall ? "bad" : "info";
  }

  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <Choice label="Market" value={market} onChange={setMarket} options={[{ id: "stock", label: "Shares" }, { id: "fx", label: "Forex" }, { id: "futures", label: "Futures" }]} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Account size" value={account} onChange={setAccount} min={100} max={10_000_000} suffix="USD" />
        <Slider label="Risk per trade" value={risk} min={0.25} max={5} step={0.25} onChange={setRisk} format={(n) => `${num(n, 2)}% = ${money(riskAmount(account, n))}`} />
      </div>
      {market === "stock" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Entry price" value={entry} onChange={setEntry} min={0.01} max={100_000} step={0.01} suffix="USD" />
          <NumberField label="Stop price" value={stop} onChange={setStop} min={0.01} max={100_000} step={0.01} suffix="USD" />
        </div>
      )}
      {market === "fx" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice label="Pair (account in USD)" value={pair} onChange={setPair} options={(Object.keys(PAIRS) as PairId[]).map((id) => ({ id, label: PAIRS[id].label }))} />
          <Slider label="Stop distance" value={pips} min={5} max={150} step={1} onChange={setPips} format={(n) => `${n} pips`} />
          {pair === "EURGBP" && <NumberField label="GBP/USD rate (to convert GBP pips into USD)" value={gbpusd} onChange={setGbpusd} min={0.5} max={3} step={0.0001} />}
          {pair === "USDJPY" && <NumberField label="USD/JPY rate" value={jpyRate} onChange={setJpyRate} min={50} max={400} step={0.01} />}
        </div>
      )}
      {market === "futures" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Stop distance" value={points} onChange={setPoints} min={0.25} max={10_000} step={0.25} suffix="points" />
          <NumberField label="Value of one point, one contract" value={pointValue} onChange={setPointValue} min={0.01} max={10_000} step={0.01} suffix="USD" />
        </div>
      )}
      {body}
      <Result tone={tone}>{message}</Result>
    </WidgetFrame>
  );
}

// ── L3. Stop placement: structure or ATR ────────────────────────────────────

const STOP_BARS = simulateSeries({ seed: 8303, bars: 120, vol: 0.012, trend: 0.0025, initial: "up", switchChance: 0.01, start: 40 }).bars;
const STOP_ATR = atr(STOP_BARS, 14);

export function StopPlacement({ title, caption }: FrameProps) {
  const [method, setMethod] = useState<"structure" | "atr">("structure");
  const [mult, setMult] = useState(2);
  const [bufferPct, setBufferPct] = useState(0.3);
  const end = STOP_BARS.length - 1;
  const entry = STOP_BARS[end].c;
  const atrNow = STOP_ATR[end] ?? 0;
  const sw = swings(STOP_BARS.slice(0, end - 2), 3).filter((s) => s.kind === "low" && s.price < entry);
  const swing = sw[sw.length - 1];
  const sStop = swing ? structureStop(swing.price, (entry * bufferPct) / 100, "long") : null;
  const aStop = atrStop(entry, atrNow, mult, "long");
  const stop = method === "structure" ? sStop : aStop;
  const size = stop ? stockSize(10_000, 1, entry, stop) : null;
  const distAtr = stop && atrNow > 0 ? (entry - stop) / atrNow : null;
  const annotations: Annotation[] = [
    { kind: "hline", price: entry, label: `entry ${fmtPrice(entry, 2)}`, tone: "accent", dashed: false },
    ...(stop ? [{ kind: "hline" as const, price: stop, label: `stop ${fmtPrice(stop, 2)}`, tone: "down" as const }] : []),
    ...(swing ? [{ kind: "marker" as const, index: swing.index, price: swing.price, label: "swing low", tone: "up" as const, pos: "below" as const }] : []),
  ];
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <Choice label="Stop method (long position at the last close)" value={method} onChange={setMethod} options={[{ id: "structure", label: "Beyond the last swing low" }, { id: "atr", label: "A multiple of ATR" }]} />
      <CandleChart bars={STOP_BARS} label="Simulated price chart with an entry line and a stop line" height={200} annotations={annotations} initialWindow={80} barLabel={(i) => `${i + 1}`} decimals={2} />
      {method === "atr"
        ? <Slider label="ATR multiple" value={mult} min={0.5} max={4} step={0.25} onChange={setMult} format={(n) => `${num(n, 2)} × ATR(14)`} />
        : <Slider label="Buffer below the swing low" value={bufferPct} min={0} max={2} step={0.1} onChange={setBufferPct} format={(n) => `${num(n, 1)}% of price`} />}
      <Readouts cols={4}>
        <Readout label="ATR(14) now" value={fmtPrice(atrNow, 2)} />
        <Readout label="Stop distance" value={stop ? `${fmtPrice(entry - stop, 2)} (${num(((entry - stop) / entry) * 100, 2)}%)` : "—"} sub={distAtr === null ? undefined : `${num(distAtr, 2)} × ATR`} />
        <Readout label="Shares for 1% of $10,000" value={size ? size.shares : "—"} tone="accent" />
        <Readout label="Position value" value={size ? money(size.notional) : "—"} />
      </Readouts>
      <Result tone={distAtr !== null && distAtr < 1 ? "warn" : "info"}>
        {stop
          ? `${method === "structure" ? `The stop sits ${num(bufferPct, 1)}% below the most recent swing low (${fmtPrice(swing!.price, 2)}): if price trades there, the higher-low structure that justified the trade is broken.` : `The stop sits ${num(mult, 2)} × ATR below the entry: far enough that ordinary bar-to-bar noise of this size is less likely to reach it.`} ${distAtr !== null && distAtr < 1 ? "It is less than one ATR away, so normal noise could easily hit it. " : ""}Notice that the size changes with the stop: a wider stop means fewer shares for the same 1% risk. Choose the stop from the chart first, then the size from the stop, never the other way round.`
          : "No swing low below the entry was found in this window."}
      </Result>
    </WidgetFrame>
  );
}

// ── L4. Risk-reward and expectancy ──────────────────────────────────────────

export function ExpectancyTool({ title, caption }: FrameProps) {
  const [winRate, setWinRate] = useState(40);
  const [avgWin, setAvgWin] = useState(150);
  const [avgLoss, setAvgLoss] = useState(100);
  const e = expectancy(winRate / 100, avgWin, avgLoss);
  const rr = avgLoss > 0 ? avgWin / avgLoss : null;
  const be = e?.breakevenWinRate ?? null;
  const curve = Array.from({ length: 41 }, (_, i) => 1 / (1 + (0.25 + i * 0.125)) * 100);
  const xs = Array.from({ length: 41 }, (_, i) => 0.25 + i * 0.125);
  const good = e !== null && e.perTrade > 0;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Win rate" value={winRate} min={5} max={95} step={1} onChange={setWinRate} format={(n) => `${n}%`} />
        <NumberField label="Average win" value={avgWin} onChange={setAvgWin} min={0} max={1_000_000} suffix="USD" />
        <NumberField label="Average loss" value={avgLoss} onChange={setAvgLoss} min={0} max={1_000_000} suffix="USD" />
      </div>
      <Readouts cols={4}>
        <Readout label="Expectancy per trade" value={e ? money(e.perTrade) : "—"} tone={good ? "up" : "down"} sub={e?.inR !== null && e?.inR !== undefined ? `${num(e.inR, 2)} R` : undefined} />
        <Readout label="Reward-to-risk (avg win ÷ avg loss)" value={rr === null ? "—" : `${num(rr, 2)} : 1`} />
        <Readout label="Break-even win rate" value={be === null ? "—" : pct(be * 100)} tone={be !== null && winRate / 100 < be ? "down" : undefined} />
        <Readout label="Profit factor" value={e?.profitFactor === null || e?.profitFactor === undefined ? "—" : num(e.profitFactor, 2)} />
      </Readouts>
      <LinePlot
        label="Break-even win rate for each reward-to-risk ratio, with your current ratio and win rate marked"
        series={[{ values: curve, tone: "muted" }]}
        xValues={xs}
        markers={rr !== null && rr >= 0.25 && rr <= 5.25 ? [{ x: rr, y: winRate, label: `you: ${winRate}%`, tone: good ? "up" : "down" }] : []}
        yMin={0}
        yMax={100}
        yFormat={(n) => `${n}%`}
        xFormat={(n) => `${num(n, n % 1 ? 1 : 0)}`}
        xLabel="Reward-to-risk ratio (grey line: break-even win rate)"
      />
      <Result tone={good ? "good" : "bad"}>
        {e
          ? `${winRate}% × ${money(avgWin)} − ${100 - winRate}% × ${money(avgLoss)} = ${money(e.perTrade)} per trade. ${good ? "Above the grey line: on these numbers the average trade makes money." : "On or below the grey line: on these numbers the average trade loses money, however good the wins feel."} The numbers only mean something if they come from many trades of one consistent method, after costs. A high win rate with small wins and large losses can lose; a low win rate with large wins can make money.`
          : "Check the inputs."}
      </Result>
    </WidgetFrame>
  );
}

// ── L5. Drawdown, recovery and losing streaks ───────────────────────────────

export function DrawdownTool({ title, caption }: FrameProps) {
  const [loss, setLoss] = useState(30);
  const [lossRate, setLossRate] = useState(55);
  const [run, setRun] = useState(6);
  const [trades, setTrades] = useState(100);
  const rec = recoveryNeeded(loss);
  const xs = Array.from({ length: 91 }, (_, i) => i);
  const curve = xs.map((x) => recoveryNeeded(x) ?? NaN);
  const p = streakProbability(lossRate / 100, run, trades);
  const table = [4, 6, 8, 10, 12].map((k) => ({ k, p: streakProbability(lossRate / 100, k, trades) ?? 0 }));
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <Slider label="Loss from the peak" value={loss} min={0} max={90} step={1} onChange={setLoss} format={(n) => `${n}%`} />
      <Readouts cols={3}>
        <Readout label="Account after the loss" value={money(10_000 * (1 - loss / 100), "USD", 0)} sub="from $10,000" />
        <Readout label="Gain needed to get back" value={pct(rec)} tone={rec !== null && rec > 50 ? "down" : "accent"} />
        <Readout label="Formula" value={`${loss}% ÷ (100% − ${loss}%)`} />
      </Readouts>
      <LinePlot
        label="Gain needed to recover from each size of loss, from 0% to 90%"
        series={[{ values: curve }]}
        xValues={xs}
        markers={[{ x: loss, y: rec ?? 0, label: `−${loss}% needs +${num(rec ?? 0, 0)}%` }]}
        yMin={0}
        yMax={Math.max(100, Math.min(900, (rec ?? 0) * 1.2))}
        yFormat={(n) => `${n}%`}
        xFormat={(n) => `−${n}%`}
        xLabel="Loss from the peak"
      />
      <div className="grid gap-3 border-t border-line pt-3 sm:grid-cols-3">
        <Slider label="Chance each trade loses" value={lossRate} min={20} max={80} step={1} onChange={setLossRate} format={(n) => `${n}%`} />
        <Slider label="Losing streak of at least" value={run} min={2} max={15} step={1} onChange={setRun} format={(n) => `${n} in a row`} />
        <Slider label="Over this many trades" value={trades} min={20} max={500} step={10} onChange={setTrades} format={(n) => `${n}`} />
      </div>
      <Readouts cols={2}>
        <Readout label={`Chance of at least one streak of ${run}+ losses`} value={pct(p === null ? null : p * 100)} tone={p !== null && p > 0.5 ? "warn" : undefined} />
        <Readout label="Assumes" value="Independent trades" sub="Real results can cluster, which makes long streaks more likely." />
      </Readouts>
      <div className="space-y-2">
        {table.map((t) => <Bar key={t.k} label={`${t.k}+ losses in a row`} pct={t.p * 100} value={pct(t.p * 100)} tone={t.p > 0.5 ? "warn" : "accent"} />)}
      </div>
      <Result tone={rec !== null && rec > 50 ? "bad" : "info"}>
        {`A ${loss}% loss leaves ${100 - loss}% of the account, so getting back needs ${loss} ÷ ${100 - loss} = ${pct(rec)}. The curve bends upwards: small losses are cheap to recover, deep ones very expensive. With a ${lossRate}% chance of losing each trade, a run of ${run} or more losses somewhere in ${trades} trades has a ${pct(p === null ? null : p * 100)} chance, before any change in the market or in you.`}
      </Result>
    </WidgetFrame>
  );
}
