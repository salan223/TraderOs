import type { Metadata } from "next";
import { ModulePage } from "@/components/module-page";

export const metadata: Metadata = { title: "Trading Journal" };

export default function Page() {
  return (
    <ModulePage
      href="/journal"
      principle="The journal is where you learn the most. Statistics are only shown with a warning when there are too few trades to draw a conclusion."
      features={[
        "Instrument, direction, entry, exit, stop-loss, take-profit, size, risk, P&L and R-multiple",
        "Strategy, market conditions, thesis, entry reason and exit reason",
        "Emotional state, mistakes and lessons learned",
        "Screenshot or chart attachments",
        "Analytics by strategy, instrument, timeframe and market condition",
        "Mistake frequency and emotional patterns",
      ]}
    />
  );
}
