/**
 * Pure maths for Track 4 (Cryptocurrency) widgets. Everything here is a
 * teaching model: the hash is a toy (not cryptographically secure), and the
 * peg and volatility numbers come from what the learner sets.
 */

/** A small, deterministic, NON-cryptographic hash (FNV-1a, 32-bit), shown as 8 hex characters. */
export function toyHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export type ToyBlock = { index: number; data: string; prevHash: string; hash: string; storedPrevHash: string; valid: boolean };

/**
 * Builds a chain from block data. `storedPrev` holds the previous-hash each
 * block recorded when it was first made (from the original data); when a
 * block's data is edited, its new hash no longer matches what the next block
 * stored, and every block from there on is marked invalid.
 */
export function buildChain(original: readonly string[], current: readonly string[]): ToyBlock[] {
  const hashOf = (i: number, data: string, prev: string) => toyHash(`${i}|${prev}|${data}`);
  // What each block stored when the chain was first built.
  const stored: string[] = [];
  let prev = "00000000";
  for (let i = 0; i < original.length; i++) {
    stored.push(prev);
    prev = hashOf(i, original[i], prev);
  }
  const out: ToyBlock[] = [];
  let actualPrev = "00000000";
  let broken = false;
  for (let i = 0; i < current.length; i++) {
    const hash = hashOf(i, current[i], actualPrev);
    if (actualPrev !== stored[i]) broken = true;
    out.push({ index: i, data: current[i], prevHash: actualPrev, hash, storedPrevHash: stored[i], valid: !broken });
    actualPrev = hash;
  }
  return out;
}

/** Annualises a daily volatility (in %) for a market that trades `days` days a year. */
export function annualiseVol(dailyPct: number, days: number): number {
  if (!Number.isFinite(dailyPct) || dailyPct < 0 || !(days > 0)) return NaN;
  return dailyPct * Math.sqrt(days);
}

/**
 * Position size that risks the same money when the stop is k daily moves away.
 * size = risk ÷ (k × daily move in % × price / 100). Returns units of the asset.
 */
export function volAdjustedSize(account: number, riskPct: number, price: number, dailyVolPct: number, k: number): number | null {
  if (!(account > 0) || !(riskPct > 0) || !(price > 0) || !(dailyVolPct > 0) || !(k > 0)) return null;
  const risk = account * (riskPct / 100);
  const stopDistance = (k * dailyVolPct * price) / 100;
  return risk / stopDistance;
}

/**
 * A toy stablecoin run. Reserves are split into cash (paid at once), short
 * government bills (sold at a small discount when sold in a hurry) and risky
 * assets (sold at a large discount). Holders redeem `redeemPct` of supply.
 * Returns the value backing each remaining coin and whether the peg holds.
 */
export function stablecoinRun(i: { cashPct: number; billsPct: number; riskyPct: number; reserveRatio: number; redeemPct: number; billHaircut?: number; riskyHaircut?: number }) {
  const total = i.cashPct + i.billsPct + i.riskyPct;
  if (!(total > 0) || i.redeemPct < 0 || i.redeemPct > 100 || !(i.reserveRatio > 0)) return null;
  const billH = i.billHaircut ?? 0.01;
  const riskyH = i.riskyHaircut ?? 0.3;
  const supply = 100;
  const reserves = supply * i.reserveRatio;
  let cash = (reserves * i.cashPct) / total;
  let bills = (reserves * i.billsPct) / total;
  let risky = (reserves * i.riskyPct) / total;
  let owed = (supply * i.redeemPct) / 100;
  let lost = 0;
  // Pay from cash, then bills (small loss), then risky assets (large loss).
  const take = (avail: number, haircut: number) => {
    const neededFace = owed / (1 - haircut);
    const used = Math.min(avail, neededFace);
    owed -= used * (1 - haircut);
    lost += used * haircut;
    return avail - used;
  };
  cash = take(cash, 0);
  bills = take(bills, billH);
  risky = take(risky, riskyH);
  const remainingCoins = supply * (1 - i.redeemPct / 100);
  const remainingReserves = cash + bills + risky;
  const backing = remainingCoins > 0 ? remainingReserves / remainingCoins : NaN;
  return { paidInFull: owed <= 1e-9, shortfall: Math.max(0, owed), fireSaleLoss: lost, backingPerCoin: backing, pegHolds: owed <= 1e-9 && (remainingCoins === 0 || backing >= 0.995) };
}

export type RedFlag = { id: string; label: string; weight: number; why: string };

/** Warning signs of a crypto scam, with how strongly each one points to fraud. */
export const RED_FLAGS: readonly RedFlag[] = [
  { id: "seed", label: "Asks for your seed phrase or private key", weight: 100, why: "No legitimate service ever needs it. Anyone with it controls your coins." },
  { id: "guaranteed", label: "Promises guaranteed or fixed high returns", weight: 40, why: "Real investments cannot guarantee returns; high fixed returns are the hallmark of Ponzi schemes." },
  { id: "urgency", label: "Pressure to act now (\"offer ends in 1 hour\")", weight: 20, why: "Urgency stops you from checking." },
  { id: "dm", label: "Unsolicited message, often from a \"support\" account", weight: 25, why: "Real support teams do not cold-message you first." },
  { id: "celebrity", label: "Uses a celebrity or giveaway (\"send 1, get 2 back\")", weight: 45, why: "Giveaway scams impersonate famous people; no one doubles your money." },
  { id: "recruit", label: "Pays you mainly for recruiting others", weight: 35, why: "Recruitment-driven returns are how pyramid schemes pay early members with later members' money." },
  { id: "unknown-token", label: "Tiny, newly made token pushed in a group chat", weight: 25, why: "Thin tokens are easy to pump and dump on late buyers." },
  { id: "withdraw", label: "Lets you deposit easily but asks for a \"fee\" to withdraw", weight: 50, why: "A classic sign of a fake platform: the balance shown is not real." },
];

/** Sums the weights of the ticked warning signs, capped at 100. */
export function scamScore(ticked: readonly string[]): number {
  const s = RED_FLAGS.filter((f) => ticked.includes(f.id)).reduce((a, f) => a + f.weight, 0);
  return Math.min(100, s);
}
