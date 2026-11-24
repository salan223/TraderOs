import type { Metadata } from "next";
import { ModulePage } from "@/components/module-page";

export const metadata: Metadata = { title: "Strategy Lab" };

export default function Page() {
  return (
    <ModulePage
      href="/strategy-lab"
      principle="A backtest shows how rules would have behaved in the past. It never guarantees future results, and the lab will always show the limitations: data quality, overfitting, survivorship bias, costs and slippage."
      features={[
        "Write a strategy with clear entry, exit, stop-loss and position sizing rules",
        "Choose markets and timeframes",
        "Test simple rule-based strategies on historical data",
        "Trade logs and equity curves",
        "Win rate, expectancy, profit factor, max drawdown, average R and Sharpe ratio, each explained",
        "Compare strategies side by side",
      ]}
    />
  );
}
