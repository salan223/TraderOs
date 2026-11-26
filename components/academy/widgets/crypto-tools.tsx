"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RED_FLAGS, annualiseVol, buildChain, scamScore, stablecoinRun, volAdjustedSize } from "@/lib/academy/crypto";
import { cn } from "@/lib/cn";
import { Choice, Readout, Readouts, Result, Slider, WidgetFrame, money, num } from "./kit";

/*
  Tools for the Cryptocurrency track. The hash is a toy (not secure), and
  every price, reserve and volatility is set by the learner. Nothing here is
  live or real data.
*/

type P = { title: string; caption: string };

// ── Hash chain ──────────────────────────────────────────────────────────────

const ORIGINAL = ["Ana pays Ben 2", "Ben pays Cai 1", "Cai pays Dee 0.5", "Dee pays Eli 0.2"];

export function HashChain({ title, caption }: P) {
  const [data, setData] = useState<string[]>([...ORIGINAL]);
  const chain = useMemo(() => buildChain(ORIGINAL, data), [data]);
  const broken = chain.findIndex((b) => !b.valid);
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <ol className="grid gap-2 sm:grid-cols-2">
        {chain.map((b, i) => (
          <li key={i} className={cn("rounded-md border p-2.5", b.valid ? "border-line-strong bg-raised" : "border-down/50 bg-down-soft")}>
            <p className="t-label">Block {i + 1}</p>
            <label className="mt-1 block text-xs text-fg-muted">
              Transactions
              <input
                value={b.data}
                onChange={(e) => setData((d) => d.map((x, k) => (k === i ? e.target.value : x)))}
                className="mt-1 w-full rounded border border-line-strong bg-surface px-2 py-1 font-mono text-[13px] text-fg"
              />
            </label>
            <p className="mt-1.5 font-mono text-[11px] text-fg-subtle">previous link: {b.prevHash}</p>
            <p className="font-mono text-[11px] text-fg-subtle">stored link: {b.storedPrevHash}</p>
            <p className={cn("font-mono text-[11px]", b.valid ? "text-up" : "text-down")}>this block&apos;s hash: {b.hash}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setData([...ORIGINAL])}>Undo my edits</Button>
      </div>
      <Result tone={broken === -1 ? "good" : "bad"}>
        {broken === -1
          ? "Every block's stored link matches the hash of the block before it. Try changing an amount in block 2."
          : `Block ${broken + 1} no longer matches the link it stored, so it and every block after it are invalid. To hide an edit you would have to redo all later blocks faster than the rest of the network, which is what proof of work makes expensive.`}
      </Result>
    </WidgetFrame>
  );
}

// ── Custody ─────────────────────────────────────────────────────────────────

type Custody = "exchange" | "hot" | "cold";
type Event = "exchange-fails" | "phone-lost" | "phishing" | "seed-lost";

const OUTCOME: Record<Custody, Record<Event, { ok: boolean; text: string }>> = {
  exchange: {
    "exchange-fails": { ok: false, text: "Your coins are a claim on the exchange. If it fails or freezes withdrawals, you queue with other creditors and may get back little or nothing." },
    "phone-lost": { ok: true, text: "You log in from another device. The exchange holds the keys, so losing a phone does not lose the coins (if your account security holds)." },
    phishing: { ok: false, text: "A fake login page captures your password and one-time code; the thief withdraws. Hardware security keys and withdrawal allow-lists reduce this risk." },
    "seed-lost": { ok: true, text: "You never had a seed phrase: the exchange holds the keys. That is convenient, and it is exactly why its failure is your risk." },
  },
  hot: {
    "exchange-fails": { ok: true, text: "Your coins sit at your own address, so an exchange failure does not touch them." },
    "phone-lost": { ok: true, text: "You restore the wallet on a new device from your written seed phrase." },
    phishing: { ok: false, text: "A fake wallet app or a malicious site that you approve can drain an online (hot) wallet. Check every address and every approval." },
    "seed-lost": { ok: false, text: "If the device is also gone and the seed phrase is lost, nobody can recover the coins. There is no help desk." },
  },
  cold: {
    "exchange-fails": { ok: true, text: "The coins are at your own address and the keys never touch the internet." },
    "phone-lost": { ok: true, text: "A lost phone does not matter; the keys are on the hardware device and in your seed backup." },
    phishing: { ok: true, text: "A phishing site cannot sign without the device in your hand and your confirmation on its screen, as long as you read what you confirm." },
    "seed-lost": { ok: false, text: "Lose the device and the seed backup and the coins are gone for good. Cold storage moves the risk onto you." },
  },
};

export function CustodyTool({ title, caption }: P) {
  const [c, setC] = useState<Custody>("exchange");
  const [e, setE] = useState<Event>("exchange-fails");
  const o = OUTCOME[c][e];
  return (
    <WidgetFrame title={title} caption={caption}>
      <Choice label="Where the coins are held" value={c} onChange={setC} options={[{ id: "exchange", label: "On an exchange" }, { id: "hot", label: "Phone wallet (hot)" }, { id: "cold", label: "Hardware wallet (cold)" }]} />
      <Choice label="What goes wrong" value={e} onChange={setE} options={[{ id: "exchange-fails", label: "The exchange fails" }, { id: "phone-lost", label: "You lose your phone" }, { id: "phishing", label: "You click a phishing link" }, { id: "seed-lost", label: "You lose your seed phrase" }]} />
      <Result tone={o.ok ? "good" : "bad"}>{o.text}</Result>
      <p className="t-small">No option removes risk; each one moves it. Exchange custody adds the exchange&apos;s risk. Self-custody puts the risk of losing keys on you.</p>
    </WidgetFrame>
  );
}

// ── Stablecoin run ──────────────────────────────────────────────────────────

export function StablecoinRun({ title, caption }: P) {
  const [cash, setCash] = useState(20);
  const [bills, setBills] = useState(70);
  const [risky, setRisky] = useState(10);
  const [ratio, setRatio] = useState(100);
  const [redeem, setRedeem] = useState(30);
  const r = stablecoinRun({ cashPct: cash, billsPct: bills, riskyPct: risky, reserveRatio: ratio / 100, redeemPct: redeem });
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Reserves held as bank cash (share)" value={cash} min={0} max={100} step={5} onChange={setCash} format={(v) => `${v}`} />
        <Slider label="Reserves in short government bills (share)" value={bills} min={0} max={100} step={5} onChange={setBills} format={(v) => `${v}`} />
        <Slider label="Reserves in riskier assets (share)" value={risky} min={0} max={100} step={5} onChange={setRisky} format={(v) => `${v}`} />
        <Slider label="Reserves per 100 coins issued" value={ratio} min={80} max={110} step={1} onChange={setRatio} format={(v) => `${v}`} />
        <Slider label="Holders asking to cash out" value={redeem} min={0} max={90} step={5} onChange={setRedeem} format={(v) => `${v}% of coins`} />
      </div>
      {r && (
        <>
          <Readouts cols={3}>
            <Readout label="Paid out in full?" value={r.paidInFull ? "Yes" : "No"} tone={r.paidInFull ? "up" : "down"} />
            <Readout label="Lost selling assets in a hurry" value={num(r.fireSaleLoss, 1)} sub="per 100 coins" tone={r.fireSaleLoss > 0.5 ? "warn" : undefined} />
            <Readout label="Backing per remaining coin" value={Number.isFinite(r.backingPerCoin) ? `$${num(r.backingPerCoin, 3)}` : "–"} tone={r.pegHolds ? "up" : "down"} />
          </Readouts>
          <Result tone={r.pegHolds ? "good" : "bad"}>
            {r.pegHolds
              ? "The reserves cover the run. Cash pays first; bills sell at almost full value."
              : "The reserves fall short. Holders who leave first get $1; those who stay hold coins backed by less than $1. That is why runs speed up once they start."}{" "}
            The reserve mix and discounts are made up.
          </Result>
        </>
      )}
    </WidgetFrame>
  );
}

// ── Volatility and sizing ───────────────────────────────────────────────────

export function CryptoVolatility({ title, caption }: P) {
  const [daily, setDaily] = useState(3.5);
  const [stockDaily, setStockDaily] = useState(1);
  const [account, setAccount] = useState(10_000);
  const [riskPct, setRiskPct] = useState(1);
  const [k, setK] = useState(2);
  const price = 100; // a made-up price; size is shown as money, so the price cancels out
  const cryptoAnnual = annualiseVol(daily, 365);
  const stockAnnual = annualiseVol(stockDaily, 252);
  const cryptoUnits = volAdjustedSize(account, riskPct, price, daily, k) ?? 0;
  const stockUnits = volAdjustedSize(account, riskPct, price, stockDaily, k) ?? 0;
  return (
    <WidgetFrame title={title} caption={caption} source="computed">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Typical daily move, crypto coin (made up)" value={daily} min={0.5} max={10} step={0.1} onChange={setDaily} format={(v) => `${num(v, 1)}%`} />
        <Slider label="Typical daily move, large share (made up)" value={stockDaily} min={0.3} max={4} step={0.1} onChange={setStockDaily} format={(v) => `${num(v, 1)}%`} />
        <Slider label="Account" value={account} min={1_000} max={100_000} step={1_000} onChange={setAccount} format={(v) => money(v, "USD", 0)} />
        <Slider label="Risk per trade" value={riskPct} min={0.25} max={3} step={0.25} onChange={setRiskPct} format={(v) => `${num(v, 2)}%`} />
        <Slider label="Stop distance in typical daily moves" value={k} min={1} max={4} step={0.5} onChange={setK} format={(v) => `${num(v, 1)}×`} />
      </div>
      <Readouts cols={2}>
        <Readout label="Crypto: yearly volatility (365 trading days)" value={`${num(cryptoAnnual, 0)}%`} tone="warn" />
        <Readout label="Share: yearly volatility (252 trading days)" value={`${num(stockAnnual, 0)}%`} />
        <Readout label="Crypto position for the same risk" value={money(cryptoUnits * price, "USD", 0)} />
        <Readout label="Share position for the same risk" value={money(stockUnits * price, "USD", 0)} />
      </Readouts>
      <Result tone="info">
        Both positions lose {money(account * (riskPct / 100), "USD", 0)} if the stop is hit. The more a market moves each day, the smaller the position must be for the same risk.
        Crypto trades every day of the year, so a weekend move can hit a stop while stock markets are shut.
      </Result>
    </WidgetFrame>
  );
}

// ── Scam check ──────────────────────────────────────────────────────────────

export function ScamCheck({ title, caption }: P) {
  const [ticked, setTicked] = useState<string[]>([]);
  const score = scamScore(ticked);
  const toggle = (id: string) => setTicked((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  return (
    <WidgetFrame title={title} caption={caption}>
      <fieldset>
        <legend className="mb-1.5 text-xs text-fg-muted">Tick every sign you see in the offer</legend>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {RED_FLAGS.map((f) => (
            <li key={f.id}>
              <label className={cn("flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 text-[13px]", ticked.includes(f.id) ? "border-down/50 bg-down-soft text-fg" : "border-line-strong bg-raised text-fg-muted")}>
                <input type="checkbox" checked={ticked.includes(f.id)} onChange={() => toggle(f.id)} className="mt-0.5 accent-accent" />
                <span>{f.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <Readouts cols={2}>
        <Readout label="Warning score" value={`${score} / 100`} tone={score >= 60 ? "down" : score >= 25 ? "warn" : "up"} />
        <Readout label="Verdict" value={score >= 60 ? "Walk away" : score >= 25 ? "Strong warning" : score > 0 ? "Be careful" : "No signs ticked"} />
      </Readouts>
      {ticked.length > 0 && (
        <ul className="space-y-1">
          {RED_FLAGS.filter((f) => ticked.includes(f.id)).map((f) => (
            <li key={f.id} className="t-small"><span className="text-fg">{f.label}:</span> {f.why}</li>
          ))}
        </ul>
      )}
      <Result tone={score >= 60 ? "bad" : "info"}>
        A low score does not prove an offer is safe; scams change their wording. Any request for your seed phrase ends the conversation on its own.
      </Result>
    </WidgetFrame>
  );
}
