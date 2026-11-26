"use client";

import { useState } from "react";
import { contractValue, crackSpread321, endingStocks, goldSilverRatio, priceInCurrency, rollSimulation, stocksToUse } from "@/lib/academy/commodities";
import { Choice, Readout, Readouts, Result, Slider, WidgetFrame, money, num, signed } from "./kit";
import { LinePlot } from "./risk-plot";

/*
  Tools for the Commodities track. Every price, harvest and curve shape is
  set by the learner; none is a real quote or report.
*/

type P = { title: string; caption: string };
const sp = (x: number, dp = 1) => (Number.isFinite(x) ? `${signed(x, dp)}%` : "–");

// ── Crack spread ────────────────────────────────────────────────────────────

export function CrackSpread({ title, caption }: P) {
  const [crude, setCrude] = useState(80);
  const [gas, setGas] = useState(2.4);
  const [ho, setHo] = useState(2.8);
  const crack = crackSpread321(crude, gas, ho);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Crude oil, $ a barrel" value={crude} min={30} max={150} step={1} onChange={setCrude} format={(v) => `$${v}`} />
        <Slider label="Gasoline, $ a gallon" value={gas} min={1} max={5} step={0.05} onChange={setGas} format={(v) => `$${num(v, 2)}`} />
        <Slider label="Heating oil (diesel), $ a gallon" value={ho} min={1} max={5} step={0.05} onChange={setHo} format={(v) => `$${num(v, 2)}`} />
      </div>
      <Readouts cols={3}>
        <Readout label="Gasoline per barrel (× 42 gallons)" value={money(gas * 42, "USD", 2)} />
        <Readout label="Heating oil per barrel" value={money(ho * 42, "USD", 2)} />
        <Readout label="3-2-1 crack spread" value={`${money(crack, "USD", 2)} / bbl`} tone={crack > 0 ? "up" : "down"} />
      </Readouts>
      <Result tone={crack > 0 ? "info" : "warn"}>
        {crack > 0
          ? "Refiners earn roughly this much per barrel before their own costs. A wide spread encourages them to buy more crude, which can support crude prices."
          : "Products are cheaper than the crude they come from: refining loses money, and refiners tend to cut runs, which can weigh on crude demand."}{" "}
        Prices here are made up.
      </Result>
    </WidgetFrame>
  );
}

// ── Metals ──────────────────────────────────────────────────────────────────

export function MetalsTool({ title, caption }: P) {
  const [gold, setGold] = useState(2000);
  const [silver, setSilver] = useState(25);
  const [copper, setCopper] = useState(4);
  const ratio = goldSilverRatio(gold, silver);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Gold, $ a troy ounce (made up)" value={gold} min={500} max={5000} step={10} onChange={setGold} format={(v) => `$${v}`} />
        <Slider label="Silver, $ a troy ounce (made up)" value={silver} min={5} max={80} step={0.5} onChange={setSilver} format={(v) => `$${num(v, 1)}`} />
        <Slider label="Copper, $ a pound (made up)" value={copper} min={1} max={8} step={0.05} onChange={setCopper} format={(v) => `$${num(v, 2)}`} />
      </div>
      <Readouts cols={2}>
        <Readout label="Gold-silver ratio" value={`${num(ratio, 1)} oz of silver per oz of gold`} />
        <Readout label="One gold contract (100 oz)" value={money(contractValue(gold, 100), "USD", 0)} />
        <Readout label="One silver contract (5,000 oz)" value={money(contractValue(silver, 5000), "USD", 0)} />
        <Readout label="One copper contract (25,000 lb)" value={money(contractValue(copper, 25_000), "USD", 0)} />
      </Readouts>
      <Result tone="info">
        A $10 move in gold changes one 100-ounce contract by $1,000. Contract sizes here follow common US exchange specifications; always check the exchange&apos;s own contract page, as sizes and mini versions differ.
      </Result>
    </WidgetFrame>
  );
}

// ── Stocks-to-use ───────────────────────────────────────────────────────────

export function StocksToUseTool({ title, caption }: P) {
  const [start, setStart] = useState(250);
  const [harvest, setHarvest] = useState(1100);
  const [use, setUse] = useState(1150);
  const end = endingStocks(start, harvest, use);
  const ratio = stocksToUse(Math.max(0, end), use);
  const tight = ratio < 10;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Stocks at the start (million t, made up)" value={start} min={0} max={600} step={10} onChange={setStart} />
        <Slider label="Harvest (million t)" value={harvest} min={700} max={1400} step={10} onChange={setHarvest} hint="A drought or a bumper crop moves this." />
        <Slider label="Use over the year (million t)" value={use} min={800} max={1400} step={10} onChange={setUse} />
      </div>
      <Readouts cols={2}>
        <Readout label="Stocks left at the end" value={`${num(Math.max(0, end), 0)} million t`} tone={end < 0 ? "down" : undefined} />
        <Readout label="Stocks-to-use ratio" value={`${num(ratio, 1)}%`} tone={tight ? "down" : "up"} sub={tight ? "tight" : "comfortable"} />
      </Readouts>
      <Result tone={tight ? "warn" : "info"}>
        {tight
          ? "With little left in store, a small change in the harvest has nowhere to be absorbed, so prices tend to swing much more."
          : "Plenty of stock acts as a buffer: a weather scare can be met from storage, so prices tend to move less."}{" "}
        The 10% line here is only a teaching marker; what counts as tight differs by crop.
      </Result>
    </WidgetFrame>
  );
}

// ── Roll yield ──────────────────────────────────────────────────────────────

export function RollYield({ title, caption }: P) {
  const [curve, setCurve] = useState(1.5);
  const [drift, setDrift] = useState(0);
  const [months, setMonths] = useState(12);
  const r = rollSimulation({ months, startSpot: 80, spotDriftPct: drift, curvePct: curve });
  const shape = curve > 0 ? "Contango (later contracts dearer)" : curve < 0 ? "Backwardation (later contracts cheaper)" : "Flat";
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Next month's contract vs spot" value={curve} min={-3} max={3} step={0.25} onChange={setCurve} format={(v) => sp(v, 2)} hint={shape} />
        <Slider label="Spot price change each month" value={drift} min={-3} max={3} step={0.25} onChange={setDrift} format={(v) => sp(v, 2)} />
        <Slider label="Months held, rolling monthly" value={months} min={1} max={36} step={1} onChange={setMonths} />
      </div>
      {r && (
        <>
          <LinePlot
            label="Spot price and the value of a rolled futures position, both starting at 100"
            series={[
              { values: r.steps.map((s) => (s.spot / 80) * 100), tone: "muted", label: "Spot" },
              { values: r.steps.map((s) => s.heldValue * 100), tone: curve > 0 ? "down" : "up", label: "Rolled futures" },
            ]}
            xLabel="Month"
            yFormat={(n) => num(n, 0)}
          />
          <Readouts cols={3}>
            <Readout label="Spot price change" value={sp(r.spotReturnPct)} />
            <Readout label="Rolled futures position" value={sp(r.heldReturnPct)} tone={r.heldReturnPct >= r.spotReturnPct ? "up" : "down"} />
            <Readout label="Gap from rolling" value={sp(r.rollReturnPct)} tone={r.rollReturnPct >= 0 ? "up" : "down"} />
          </Readouts>
          <Result tone={r.rollReturnPct < -5 ? "warn" : "info"}>
            Each month you sell the expiring contract at spot and buy the next one at its higher (contango) or lower (backwardation) price. That difference, repeated, is why a commodity fund can fall while the spot price goes nowhere. Real curves change shape over time; this one is held constant and made up.
          </Result>
        </>
      )}
    </WidgetFrame>
  );
}

// ── Dollar ──────────────────────────────────────────────────────────────────

export function DollarTool({ title, caption }: P) {
  const [usd, setUsd] = useState(80);
  const [rate, setRate] = useState(0.92);
  const [ccy, setCcy] = useState<"EUR" | "JPY" | "INR">("EUR");
  const ranges = { EUR: { min: 0.7, max: 1.2, step: 0.01, start: 0.92 }, JPY: { min: 90, max: 170, step: 1, start: 150 }, INR: { min: 60, max: 100, step: 0.5, start: 84 } } as const;
  const rr = ranges[ccy];
  const local = priceInCurrency(usd, rate);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <Choice label="Buyer's currency" value={ccy} onChange={(c) => { setCcy(c); setRate(ranges[c].start); }} options={[{ id: "EUR", label: "Euro" }, { id: "JPY", label: "Japanese yen" }, { id: "INR", label: "Indian rupee" }]} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Oil, $ a barrel (made up)" value={usd} min={30} max={150} step={1} onChange={setUsd} format={(v) => `$${v}`} />
        <Slider label={`${ccy} per 1 US dollar (made up)`} value={rate} min={rr.min} max={rr.max} step={rr.step} onChange={setRate} format={(v) => num(v, ccy === "EUR" ? 2 : 1)} hint="Higher = a stronger dollar." />
      </div>
      <Readouts cols={2}>
        <Readout label="Price in dollars" value={money(usd, "USD", 2)} />
        <Readout label={`Price in ${ccy}`} value={`${num(local, ccy === "EUR" ? 2 : 0)} ${ccy}`} />
      </Readouts>
      <Result tone="info">
        Most commodities are priced in dollars. When the dollar strengthens (more {ccy} per dollar), the same barrel costs more in {ccy}, which can damp demand outside the US; a weaker dollar does the opposite. That is one reason commodity prices and the dollar have often moved in opposite directions, though not always.
      </Result>
    </WidgetFrame>
  );
}
