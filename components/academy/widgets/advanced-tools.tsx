"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  betaAlpha, cagr, corr, correlatedReturns, equityFromReturns, futuresMarginPath, madeUpTrack, maxDrawdownPct, parametricVaR, portfolioVol, sharpe, sharpeStandardError,
} from "@/lib/academy/advanced";
import { rng } from "@/lib/academy/charts";
import { blackScholes, breakeven, payoffAtExpiry, type OptionKind } from "@/lib/quant/options";
import { Choice, Readout, Readouts, Result, Slider, WidgetFrame, money, num, signed } from "./kit";
import { LinePlot } from "./risk-plot";

/*
  Tools for the Advanced Trading Concepts track. Every return series is drawn
  from a seeded random model and every price is set by the learner. Nothing
  here is live or real data.
*/

type P = { title: string; caption: string };

// ── Correlation ─────────────────────────────────────────────────────────────

export function CorrelationLab({ title, caption }: P) {
  const [rho, setRho] = useState(0.5);
  const [n, setN] = useState(60);
  const [seed, setSeed] = useState(1);
  const { a, b } = useMemo(() => correlatedReturns(n, rho, 1, 1, seed), [n, rho, seed]);
  const measured = corr(a, b);
  const W = 220, H = 220, pad = 14;
  const lim = 3.5;
  const sx = (v: number) => pad + ((Math.max(-lim, Math.min(lim, v)) + lim) / (2 * lim)) * (W - 2 * pad);
  const sy = (v: number) => H - pad - ((Math.max(-lim, Math.min(lim, v)) + lim) / (2 * lim)) * (H - 2 * pad);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="True correlation in the model" value={rho} min={-1} max={1} step={0.05} onChange={setRho} format={(v) => signed(v, 2)} />
        <Slider label="Days of data measured" value={n} min={10} max={500} step={10} onChange={setN} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[240px] rounded border border-line bg-canvas" role="img" aria-label={`Scatter of ${n} made-up daily returns of two assets; measured correlation ${num(measured, 2)}`}>
          <line x1={pad} x2={W - pad} y1={H / 2} y2={H / 2} className="stroke-line-strong" />
          <line y1={pad} y2={H - pad} x1={W / 2} x2={W / 2} className="stroke-line-strong" />
          {a.map((x, i) => <circle key={i} cx={sx(x)} cy={sy(b[i])} r={2.2} className="fill-accent" opacity={0.7} />)}
        </svg>
        <div className="min-w-0 flex-1 space-y-3">
          <Readouts cols={2}>
            <Readout label="True correlation" value={signed(rho, 2)} />
            <Readout label="Measured from this sample" value={signed(measured, 2)} tone={Math.abs(measured - rho) > 0.15 ? "warn" : undefined} />
          </Readouts>
          <Button onClick={() => setSeed((s) => s + 1)}>Draw another sample</Button>
        </div>
      </div>
      <Result tone="info">
        With few days of data the measured correlation jumps around the true one; draw a few samples at 20 days, then at 400. Real correlations also change over time, and tend to rise in sell-offs, just when diversification is needed most.
      </Result>
    </WidgetFrame>
  );
}

// ── Portfolio risk ──────────────────────────────────────────────────────────

export function PortfolioRisk({ title, caption }: P) {
  const [wA, setWA] = useState(60);
  const [volA, setVolA] = useState(18);
  const [volB, setVolB] = useState(8);
  const [rho, setRho] = useState(0.2);
  const [value, setValue] = useState(100_000);
  const [conf, setConf] = useState<"95" | "99">("95");
  const w = [wA / 100, 1 - wA / 100];
  const pv = portfolioVol(w, [volA, volB], () => rho);
  const naive = w[0] * volA + w[1] * volB;
  const dailyPct = pv / Math.sqrt(252);
  const risk = parametricVaR(value, dailyPct, Number(conf) as 95 | 99);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Weight in asset A (the rest in B)" value={wA} min={0} max={100} step={5} onChange={setWA} format={(v) => `${v}% / ${100 - v}%`} />
        <Slider label="Correlation between A and B" value={rho} min={-1} max={1} step={0.05} onChange={setRho} format={(v) => signed(v, 2)} />
        <Slider label="Yearly volatility of A (made up)" value={volA} min={2} max={60} step={1} onChange={setVolA} format={(v) => `${v}%`} />
        <Slider label="Yearly volatility of B (made up)" value={volB} min={2} max={60} step={1} onChange={setVolB} format={(v) => `${v}%`} />
        <Slider label="Portfolio value" value={value} min={10_000} max={1_000_000} step={10_000} onChange={setValue} format={(v) => money(v, "USD", 0)} />
        <Choice label="Confidence level" value={conf} onChange={setConf} options={[{ id: "95", label: "95%" }, { id: "99", label: "99%" }]} />
      </div>
      <Readouts cols={2}>
        <Readout label="Weighted average volatility" value={`${num(naive, 1)}%`} />
        <Readout label="Portfolio volatility" value={`${num(pv, 1)}%`} tone={pv < naive - 0.05 ? "up" : undefined} sub="lower when correlation is below 1" />
        <Readout label={`One-day VaR (${conf}%)`} value={money(risk?.varAmount ?? NaN, "USD", 0)} />
        <Readout label={`Expected shortfall (${conf}%)`} value={money(risk?.esAmount ?? NaN, "USD", 0)} tone="warn" sub="average loss on days worse than VaR" />
      </Readouts>
      <Result tone="info">
        VaR says &quot;on {conf === "95" ? "19 days in 20" : "99 days in 100"} the loss should be smaller than this, if returns are normal and the volatility and correlation are right&quot;. It says nothing about how bad the other days are; expected shortfall does. Both use a normal model, which understates extreme days in real markets.
      </Result>
    </WidgetFrame>
  );
}

// ── Option payoff and Greeks ────────────────────────────────────────────────

export function OptionPayoff({ title, caption }: P) {
  const [kind, setKind] = useState<OptionKind>("call");
  const [side, setSide] = useState<"long" | "short">("long");
  const [strike, setStrike] = useState(100);
  const [spot, setSpot] = useState(100);
  const [vol, setVol] = useState(30);
  const [days, setDays] = useState(30);
  const bs = blackScholes({ kind, spot, strike, years: days / 365, vol: vol / 100, rate: 0.03 });
  const premium = bs?.price ?? 0;
  const be = breakeven(kind, strike, premium);
  const xs = Array.from({ length: 61 }, (_, i) => 70 + i);
  const expiry = xs.map((s) => payoffAtExpiry(kind, side, strike, premium, s));
  const today = xs.map((s) => {
    const v = blackScholes({ kind, spot: s, strike, years: days / 365, vol: vol / 100, rate: 0.03 })?.price ?? 0;
    return side === "long" ? v - premium : premium - v;
  });
  const sgn = side === "long" ? 1 : -1;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="flex flex-wrap gap-3">
        <Choice label="Option" value={kind} onChange={setKind} options={[{ id: "call", label: "Call (right to buy)" }, { id: "put", label: "Put (right to sell)" }]} />
        <Choice label="You" value={side} onChange={setSide} options={[{ id: "long", label: "Buy it" }, { id: "short", label: "Sell (write) it" }]} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Strike price" value={strike} min={80} max={120} step={1} onChange={setStrike} />
        <Slider label="Share price now (made up)" value={spot} min={70} max={130} step={1} onChange={setSpot} />
        <Slider label="Volatility (yearly)" value={vol} min={5} max={100} step={1} onChange={setVol} format={(v) => `${v}%`} />
        <Slider label="Days to expiry" value={days} min={0} max={365} step={1} onChange={setDays} />
      </div>
      <LinePlot
        label={`Profit or loss per share for a ${side} ${kind}, at expiry and today, across share prices from 70 to 130`}
        series={[
          { values: expiry, tone: "accent", label: "At expiry" },
          { values: today, tone: "muted", label: "Today (model)", opacity: 0.8 },
        ]}
        xValues={xs}
        xLabel="Share price at expiry"
        lines={[{ y: 0, label: "Break-even line", tone: "muted", dashed: true }]}
        markers={[{ x: spot, y: 0, label: "now", tone: "warn" }]}
        yFormat={(n) => num(n, 0)}
      />
      <Readouts cols={4}>
        <Readout label="Premium (model price)" value={money(premium, "USD", 2)} sub="per share; ×100 per contract" />
        <Readout label="Break-even at expiry" value={num(be, 2)} />
        <Readout label="Most you can lose" value={side === "long" ? money(premium, "USD", 2) : kind === "call" ? "Unlimited" : money(strike - premium, "USD", 2)} tone="down" />
        <Readout label="Intrinsic / time value" value={`${num(bs?.intrinsic ?? 0, 2)} / ${num(bs?.timeValue ?? 0, 2)}`} />
        <Readout label="Delta" value={signed(sgn * (bs?.delta ?? 0), 2)} sub="per $1 share move" />
        <Readout label="Gamma" value={num(sgn * (bs?.gamma ?? 0), 3)} sub="delta change per $1" />
        <Readout label="Theta" value={signed(sgn * (bs?.theta ?? 0), 3)} sub="per day" tone={sgn * (bs?.theta ?? 0) < 0 ? "down" : "up"} />
        <Readout label="Vega" value={signed(sgn * (bs?.vega ?? 0), 3)} sub="per 1 vol point" />
      </Readouts>
      <Result tone={side === "short" ? "warn" : "info"}>
        {side === "long"
          ? "A bought option can lose at most its premium, but time decay (theta) eats its value every day the share does not move enough."
          : "A sold option collects the premium up front and gains from time decay, but a large move against you can cost many times the premium."}{" "}
        Prices come from the Black-Scholes model with a 3% rate; real option prices differ.
      </Result>
    </WidgetFrame>
  );
}

// ── Futures margin ──────────────────────────────────────────────────────────

function pricePath(seed: number, days: number, start: number, dailyPct: number, trend: number): number[] {
  const r = rng(seed);
  const out = [start];
  for (let i = 1; i < days; i++) {
    const z = (r() + r() + r() + r() - 2) * 1.7;
    out.push(Math.max(1, out[i - 1] * (1 + (trend + dailyPct * z) / 100)));
  }
  return out.map((p) => Math.round(p * 100) / 100);
}

export function FuturesMargin({ title, caption }: P) {
  const [contracts, setContracts] = useState(1);
  const [side, setSide] = useState<"long" | "short">("long");
  const [trend, setTrend] = useState(-0.3);
  const [seed, setSeed] = useState(5);
  const prices = useMemo(() => pricePath(seed, 20, 75, 1.8, trend), [seed, trend]);
  const multiplier = 1000, initial = 6000, maintenance = 5000;
  const r = futuresMarginPath({ prices, contracts, multiplier, side, initialMargin: initial, maintenanceMargin: maintenance });
  const notional = prices[0] * multiplier * contracts;
  const finalPnl = (side === "long" ? 1 : -1) * (prices[prices.length - 1] - prices[0]) * multiplier * contracts;
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="flex flex-wrap gap-3">
        <Choice label="Position" value={side} onChange={setSide} options={[{ id: "long", label: "Long (bought)" }, { id: "short", label: "Short (sold)" }]} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Contracts" value={contracts} min={1} max={5} step={1} onChange={setContracts} />
        <Slider label="Average daily drift of the price (made up)" value={trend} min={-1} max={1} step={0.1} onChange={setTrend} format={(v) => `${signed(v, 1)}%`} />
      </div>
      {r && (
        <>
          <LinePlot label="Made-up futures price over 20 days" series={[{ values: prices, tone: "accent" }]} xLabel="Day" yFormat={(n) => num(n, 1)} height={140} />
          <Readouts cols={4}>
            <Readout label="Contract value at the start" value={money(notional, "USD", 0)} sub={`${multiplier.toLocaleString()} units × price`} />
            <Readout label="Initial margin posted" value={money(initial * contracts, "USD", 0)} sub={`about ${num(notional / (initial * contracts), 1)}× leverage`} tone="warn" />
            <Readout label="Margin calls" value={String(r.calls)} tone={r.calls ? "down" : "up"} />
            <Readout label="Cash added to meet calls" value={money(r.totalTopUp, "USD", 0)} tone={r.totalTopUp ? "down" : undefined} />
          </Readouts>
          <div className="max-h-48 overflow-auto rounded border border-line">
            <table className="w-full text-left text-[12px] tabular">
              <thead className="sticky top-0 bg-raised text-fg-muted"><tr><th className="px-2 py-1">Day</th><th className="px-2 py-1">Price</th><th className="px-2 py-1">Daily P&amp;L</th><th className="px-2 py-1">Margin balance</th><th className="px-2 py-1">Call</th></tr></thead>
              <tbody>
                {r.days.map((d) => (
                  <tr key={d.day} className={d.call ? "bg-down-soft" : undefined}>
                    <td className="px-2 py-0.5">{d.day}</td>
                    <td className="px-2 py-0.5">{num(d.price, 2)}</td>
                    <td className={d.pnl >= 0 ? "px-2 py-0.5 text-up" : "px-2 py-0.5 text-down"}>{money(d.pnl, "USD", 0)}</td>
                    <td className="px-2 py-0.5">{money(d.call ? d.balance - d.topUp : d.balance, "USD", 0)}</td>
                    <td className="px-2 py-0.5">{d.call ? `add ${money(d.topUp, "USD", 0)}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={() => setSeed((s) => s + 1)}>New made-up price path</Button>
          <Result tone={r.calls ? "bad" : "info"}>
            Over the 20 days the position {finalPnl >= 0 ? "made" : "lost"} {money(Math.abs(finalPnl), "USD", 0)}. Futures settle gains and losses every day: a loss must be paid in cash now, even if the price comes back later. Not meeting a call means the broker closes the position.
          </Result>
        </>
      )}
    </WidgetFrame>
  );
}

// ── Performance ─────────────────────────────────────────────────────────────

export function PerformanceLab({ title, caption }: P) {
  const [alpha, setAlpha] = useState(0.2);
  const [beta, setBeta] = useState(1);
  const [years, setYears] = useState(3);
  const [seed, setSeed] = useState(11);
  const months = years * 12;
  const t = useMemo(() => madeUpTrack(months, alpha, beta, 2.5, seed), [months, alpha, beta, seed]);
  const eq = equityFromReturns(t.strategy);
  const bench = equityFromReturns(t.bench);
  const sr = sharpe(t.strategy, 12);
  const se = sharpeStandardError(sr, years);
  const ba = betaAlpha(t.strategy, t.bench, 12);
  return (
    <WidgetFrame title={title} caption={caption} source="simulated">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="True skill (alpha) per month" value={alpha} min={-0.5} max={1} step={0.05} onChange={setAlpha} format={(v) => `${signed(v, 2)}%`} />
        <Slider label="Market exposure (beta)" value={beta} min={0} max={2} step={0.1} onChange={setBeta} format={(v) => num(v, 1)} />
        <Slider label="Years of track record" value={years} min={1} max={20} step={1} onChange={setYears} />
      </div>
      <LinePlot
        label="Made-up equity curves of a strategy and its benchmark, both starting at 100"
        series={[{ values: eq, tone: "accent", label: "Strategy" }, { values: bench, tone: "muted", label: "Benchmark" }]}
        xLabel="Month"
        yFormat={(n) => num(n, 0)}
        height={150}
      />
      <Readouts cols={4}>
        <Readout label="CAGR" value={`${num(cagr(100, eq[eq.length - 1], years), 1)}%`} />
        <Readout label="Max drawdown" value={`${num(maxDrawdownPct(eq), 1)}%`} tone="down" />
        <Readout label="Sharpe ratio" value={num(sr, 2)} sub={`± ${num(1.96 * se, 2)} (95% range)`} />
        <Readout label="Measured alpha / beta" value={ba ? `${signed(ba.alphaPct, 1)}% / ${num(ba.beta, 2)}` : "–"} sub="alpha per year" />
      </Readouts>
      <Button onClick={() => setSeed((s) => s + 1)}>Same skill, different luck</Button>
      <Result tone="info">
        Set skill to zero and redraw a few times: some records still look good by luck. With 3 years of data the Sharpe ratio is uncertain by about ±{num(1.96 * se, 1)}, so a high number on a short record proves little. A return that came from beta (market exposure) is not skill.
      </Result>
    </WidgetFrame>
  );
}
