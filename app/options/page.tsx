import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { OptionsLab } from "@/components/quant/options-lab";

export const metadata: Metadata = { title: "Options Lab" };

export default function Page() {
  return (
    <div className="space-y-4">
      <section className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-panel text-accent-strong">
          <Layers className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">Options Lab</h2>
          <p className="mt-1 max-w-3xl text-sm text-fg-muted">
            Learn options by trading them. You get a real market on a hidden past date, buy a call or a put, set a target, then move time forward
            day by day or jump to expiry to see what really happened. Virtual money only; option prices come from the Black-Scholes model.
          </p>
        </div>
      </section>
      <OptionsLab />
    </div>
  );
}
