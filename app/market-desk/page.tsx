import type { Metadata } from "next";
import { ChartCandlestick } from "lucide-react";
import { LiveQuotes } from "@/components/market/live-quotes";
import { LiveNews } from "@/components/market/live-news";
import { ProviderSetup } from "@/components/market/provider-setup";
import { MarketOverview } from "@/components/dashboard/markets";

export const metadata: Metadata = { title: "Market Desk" };

// Reads the server environment (which providers have keys) on every request.
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="space-y-4">
      <section className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-panel text-accent-strong">
          <ChartCandlestick className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">Market Desk</h2>
          <p className="mt-1 max-w-3xl text-sm text-fg-muted">
            Real prices and the news moving them, in one place. Every number says where it came from and how fresh it is.
            If a source is down, the app says so instead of guessing.
          </p>
        </div>
      </section>

      <ProviderSetup />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="min-w-0 space-y-4 lg:col-span-7">
          <LiveQuotes />
          <MarketOverview />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <LiveNews className="lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100dvh-5.5rem)]" listClassName="max-h-[70vh] lg:max-h-none lg:flex-1" />
        </div>
      </div>
    </div>
  );
}
