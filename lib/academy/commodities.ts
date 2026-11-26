/**
 * Pure maths for Track 5 (Commodities) widgets. All prices are whatever the
 * learner sets; none is a real quote.
 */

/** US gallons in one barrel. */
export const GALLONS_PER_BARREL = 42;

/**
 * The 3-2-1 crack spread, in $ per barrel of crude: a rough refining margin
 * from turning 3 barrels of crude into 2 of gasoline and 1 of heating oil
 * (diesel). Product prices are in $ per gallon, crude in $ per barrel.
 */
export function crackSpread321(crudePerBbl: number, gasolinePerGal: number, heatingOilPerGal: number): number {
  if (![crudePerBbl, gasolinePerGal, heatingOilPerGal].every((x) => Number.isFinite(x) && x >= 0)) return NaN;
  const products = 2 * gasolinePerGal * GALLONS_PER_BARREL + heatingOilPerGal * GALLONS_PER_BARREL;
  return (products - 3 * crudePerBbl) / 3;
}

/** How many ounces of silver buy one ounce of gold. */
export function goldSilverRatio(goldPerOz: number, silverPerOz: number): number {
  if (!(goldPerOz > 0) || !(silverPerOz > 0)) return NaN;
  return goldPerOz / silverPerOz;
}

/** Value of one futures contract: price × contract size. */
export function contractValue(price: number, size: number): number {
  if (!Number.isFinite(price) || !(size > 0)) return NaN;
  return price * size;
}

/** Stocks-to-use ratio in %: stocks left at the end of the season ÷ a year's use. */
export function stocksToUse(endingStocks: number, annualUse: number): number {
  if (!(endingStocks >= 0) || !(annualUse > 0)) return NaN;
  return (endingStocks / annualUse) * 100;
}

/** Ending stocks after a season: start + production − use. */
export function endingStocks(start: number, production: number, use: number): number {
  return start + production - use;
}

export type RollStep = { month: number; spot: number; front: number; heldValue: number };

/**
 * Holding a commodity through futures by rolling every month. The curve
 * keeps the same shape: the next contract trades `curvePct` % above (contango,
 * positive) or below (backwardation, negative) the expiring one, and the
 * expiring contract converges to spot. Spot moves by `spotDriftPct` % a month.
 * Ignores interest on the cash collateral and costs.
 */
export function rollSimulation(i: { months: number; startSpot: number; spotDriftPct: number; curvePct: number }): { steps: RollStep[]; spotReturnPct: number; heldReturnPct: number; rollReturnPct: number } | null {
  if (!(i.months >= 1) || !(i.startSpot > 0) || !Number.isFinite(i.spotDriftPct) || !Number.isFinite(i.curvePct)) return null;
  const steps: RollStep[] = [];
  let spot = i.startSpot;
  // You buy the next-month contract, which is priced at spot × (1 + curve).
  let held = 1;
  for (let m = 0; m <= i.months; m++) {
    const front = spot * (1 + i.curvePct / 100);
    steps.push({ month: m, spot, front, heldValue: held });
    if (m === i.months) break;
    const nextSpot = spot * (1 + i.spotDriftPct / 100);
    // The contract bought at `front` expires at the new spot.
    held *= nextSpot / front;
    spot = nextSpot;
  }
  const spotReturnPct = (spot / i.startSpot - 1) * 100;
  const heldReturnPct = (held - 1) * 100;
  return { steps, spotReturnPct, heldReturnPct, rollReturnPct: heldReturnPct - spotReturnPct };
}

/** Price in another currency, given the dollar price and how many units of that currency one dollar buys. */
export function priceInCurrency(usdPrice: number, unitsPerUsd: number): number {
  if (!Number.isFinite(usdPrice) || !(unitsPerUsd > 0)) return NaN;
  return usdPrice * unitsPerUsd;
}
