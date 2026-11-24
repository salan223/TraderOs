import "server-only";
import { ExternalLink, KeyRound } from "lucide-react";
import { Panel } from "@/components/ui/panel";

/**
 * Shown on the Market Desk while a provider key is missing. Reads the server
 * environment directly; only whether a key exists is used, never its value.
 */
const PROVIDERS = [
  {
    env: "FINNHUB_API_KEY",
    name: "Finnhub",
    url: "https://finnhub.io/register",
    gives: "US stocks and the S&P 500, Nasdaq and Dow funds in real time, plus a market news feed.",
  },
  {
    env: "TWELVE_DATA_API_KEY",
    name: "Twelve Data",
    url: "https://twelvedata.com/register",
    gives: "Forex pairs and gold in real time (free plan: refreshed every 3 minutes).",
  },
];

export function ProviderSetup() {
  const missing = PROVIDERS.filter((p) => !process.env[p.env]?.trim());
  if (missing.length === 0) return null;
  return (
    <Panel
      title="Connect free market data"
      hint="Crypto prices and most news work already. Two free accounts unlock the rest."
      className="border-accent/30"
    >
      <ol className="space-y-3">
        {missing.map((p, i) => (
          <li key={p.env} className="flex gap-3 text-[13px]">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] text-accent-strong">
              {i + 1}
            </span>
            <div className="min-w-0">
              <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent-strong hover:underline">
                Sign up for {p.name} (free) <ExternalLink className="size-3" />
              </a>
              <p className="mt-0.5 text-xs text-fg-muted">{p.gives}</p>
              <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-fg-subtle">
                <KeyRound className="size-3" /> Copy your API key into <code className="rounded bg-raised px-1 font-mono">.env.local</code> as
                <code className="rounded bg-raised px-1 font-mono">{p.env}=your-key</code>
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-fg-subtle">
        Then stop the app and start it again (<code className="font-mono">npm run dev</code>). Keys stay on the server and are never sent to the browser.
      </p>
    </Panel>
  );
}
