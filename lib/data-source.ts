/**
 * Every number shown in Trader OS must say where it came from.
 * Components render a <DataBadge source=...> next to any data.
 */
export type DataSource =
  | "live"      // real-time feed from a market data provider
  | "delayed"   // real market data, delayed (e.g. 15 minutes)
  | "simulated" // produced by a simulation: the paper trading engine (virtual money) or the Academy's seeded price generator
  | "sample"    // illustrative example data, not real
  | "computed"  // calculated on your device (e.g. from the clock)
  | "none";     // no source connected yet

export const DATA_SOURCE_META: Record<DataSource, { label: string; description: string }> = {
  live: { label: "Live", description: "Real-time prices from a connected market data provider." },
  delayed: { label: "Delayed", description: "Real market prices, but delayed by the provider (often 15 minutes). Not suitable for timing entries." },
  simulated: { label: "Simulated", description: "Produced by a simulation, not by a real market: paper trading with virtual money, or prices made by a seeded random model for teaching. Not real prices or real performance." },
  sample: { label: "Sample", description: "Illustrative example data used for teaching. It is not real market data." },
  computed: { label: "Computed", description: "Calculated on your device, for example from your clock. Not a market feed." },
  none: { label: "No data source", description: "No data provider is connected yet, so nothing is shown rather than inventing numbers." },
};
