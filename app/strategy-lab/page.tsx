import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";
import { ForecastLab } from "@/components/quant/forecast-lab";

export const metadata: Metadata = { title: "Strategy Lab" };

export default function Page() {
  return (
    <div className="space-y-4">
      <section className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-panel text-accent-strong">
          <FlaskConical className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">Strategy Lab · Forecast Lab</h2>
          <p className="mt-1 max-w-3xl text-sm text-fg-muted">
            Moving averages, trend lines, momentum and volatility ranges, run on years of real prices. For every method you see what it says now
            and how often it was right before, compared with simply guessing. The strategy builder and full backtester come next.
          </p>
        </div>
      </section>
      <ForecastLab />
    </div>
  );
}
