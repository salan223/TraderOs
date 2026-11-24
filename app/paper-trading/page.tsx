import type { Metadata } from "next";
import { ModulePage } from "@/components/module-page";

export const metadata: Metadata = { title: "Paper Trading" };

export default function Page() {
  return (
    <ModulePage
      href="/paper-trading"
      principle="No real orders are ever sent. Before any simulated trade you must write a thesis and set your risk, so practice builds the same habits you would need with real money."
      features={[
        "A virtual account with balance, equity, drawdown and exposure",
        "Simulated long and short trades with entry, stop-loss and take-profit",
        "Position size and risk calculated for you before you submit",
        "Fees, spread and slippage assumptions shown on every fill",
        "Open positions, closed positions and full trade history",
        "Results clearly marked as simulated, never mixed with real performance",
      ]}
    />
  );
}
