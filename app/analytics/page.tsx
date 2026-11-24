import type { Metadata } from "next";
import { ModulePage } from "@/components/module-page";

export const metadata: Metadata = { title: "Analytics" };

export default function Page() {
  return (
    <ModulePage
      href="/analytics"
      principle="Every metric comes with a plain-English explanation of what it means and when it is misleading. Results from a handful of trades are flagged as not yet meaningful."
      features={[
        "Paper trading equity curve",
        "Win rate, average R, expectancy, profit factor and drawdown",
        "Trade frequency and risk statistics",
        "Performance by instrument, strategy, timeframe and market condition",
        "Filters and date ranges",
      ]}
    />
  );
}
