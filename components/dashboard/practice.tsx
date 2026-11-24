import { Wallet, Layers, NotebookPen, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { Stat } from "@/components/ui/stat";
import { EmptyState } from "@/components/ui/empty-state";
import { Term } from "@/components/ui/term";
import { LinkButton } from "@/components/ui/button";

export function PaperAccount() {
  return (
    <Panel title="Paper trading account" hint="Virtual money only. Results here are never real performance." source="simulated">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Balance" value={null} sub="Cash in the account" />
        <Stat label={<Term id="equity">Equity</Term>} value={null} sub="Balance + open P&L" />
        <Stat label={<Term id="drawdown">Drawdown</Term>} value={null} sub="From peak" />
        <Stat label={<Term id="exposure">Exposure</Term>} value={null} sub="In open trades" />
      </div>
      <div className="mt-4 rounded-lg border border-line bg-surface px-3 py-2.5">
        <EmptyState icon={Wallet} title="No paper account yet">
          You&apos;ll create one in phase 4, choose a starting balance, and every trade will need a written thesis and a stop-loss before it can be opened.
        </EmptyState>
      </div>
    </Panel>
  );
}

export function OpenPositions() {
  return (
    <Panel title="Open simulated positions" hint="Trades you are currently in, with their risk." source="simulated">
      <EmptyState icon={Layers} title="No open positions">
        A <Term id="position">position</Term> will show its entry price,{" "}
        <Term id="stop-loss">stop-loss</Term>,{" "}
        <Term id="take-profit">take-profit</Term>{" "}
        and how much you stand to lose.
      </EmptyState>
    </Panel>
  );
}

export function Performance() {
  return (
    <Panel title="Performance" hint="Daily and weekly profit and loss from simulated trades." source="simulated">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Today" value={null} sub="0 trades" />
        <Stat label="This week" value={null} sub="0 trades" />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-fg-muted">
        Short-term results are mostly noise. Judge yourself on following your plan, not on one day&apos;s{" "}
        <Term id="pnl">P&amp;L</Term>.
      </p>
    </Panel>
  );
}

export function RecentJournal() {
  return (
    <Panel title="Recent journal entries" hint="Why you traded, how it went and what you learned.">
      <EmptyState
        icon={NotebookPen}
        title="Your journal is empty"
        action={<LinkButton href="/journal" variant="ghost" className="-ml-3">See what the journal will track <ArrowRight className="size-3.5" /></LinkButton>}
      >
        Every paper trade will create a journal entry for you to complete: thesis, emotions, mistakes and lessons.
      </EmptyState>
    </Panel>
  );
}

const DISCIPLINE = [
  { label: "Trades with a written thesis", def: "A thesis is your reason for the trade, written before you enter. Trading without one is guessing." },
  { label: "Trades with a stop-loss set", def: "Whether you decided your exit for a losing trade before entering it." },
  { label: "Risk within your limit", def: "Whether each trade risked no more than the percentage of your account you chose, often 1%." },
  { label: "Journal entries completed", def: "How many trades you reviewed afterwards. Reviewing is where most learning happens." },
];

export function Discipline() {
  return (
    <Panel title="Trading discipline" hint="Process habits, which you control, rather than outcomes." source="simulated">
      <ul className="space-y-2.5">
        {DISCIPLINE.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex items-center gap-2 text-fg-muted">
              <ShieldCheck className="size-3.5 text-fg-subtle" strokeWidth={1.75} />
              <Term def={d.def}>{d.label}</Term>
            </span>
            <span className="font-mono tabular text-fg-subtle">—</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-fg-subtle">Shown after your first simulated trades. Small samples are flagged as unreliable.</p>
    </Panel>
  );
}

const MODES = ["Teach Me", "Analyze a Chart", "Explain a Strategy", "Review My Trade", "Risk Coach", "Psychology Coach", "Market Research", "Quiz Me"];

export function MentorQuick() {
  return (
    <Panel title="AI Mentor" hint="A tutor, not a signal service. It explains, questions and reviews.">
      <div className="flex flex-wrap gap-1.5">
        {MODES.map((m) => (
          <span key={m} className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-fg-muted">
            {m}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-fg-subtle" aria-disabled>
        <Sparkles className="size-3.5" strokeWidth={1.75} />
        <span className="flex-1">Ask the mentor anything…</span>
        <span className="rounded border border-line px-1 text-[10px]">Phase 7</span>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
        It will know your lessons, quiz results and journal, and will never place trades for you.
      </p>
    </Panel>
  );
}
