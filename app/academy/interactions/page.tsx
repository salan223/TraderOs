import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Interaction } from "@/lib/academy/types";
import { InteractionView } from "@/components/academy/interactions";

export const metadata: Metadata = { title: "Interaction types", robots: { index: false } };

/*
  A reference page for content authors and testers: one working sample of
  every interaction kind that lessons, assessments and remediation can use.
  Nothing here is recorded. All numbers are made up for the example.
*/
const SAMPLES: { id: string; title: string; interaction: Interaction }[] = [
  {
    id: "sample-single", title: "Which price do you pay?",
    interaction: { kind: "single", prompt: "A share is quoted bid $20.00, ask $20.04. You buy straight away. Which price do you usually pay?", correct: "b", options: [
      { id: "a", text: "$20.00, the bid", explain: "The bid is what a seller receives." },
      { id: "b", text: "$20.04, the ask", explain: "Right. Buying straight away happens at the ask." },
      { id: "c", text: "$20.02, the middle", explain: "You cannot usually trade at the mid-price." },
      { id: "d", text: "Any price you choose", explain: "That would be a limit order, which may not fill." },
    ] },
  },
  { id: "sample-tf", title: "Stop-losses", interaction: { kind: "true-false", statement: "A standard stop-loss guarantees your exit price.", answer: false, explain: "False. It closes at the next available price, which can be worse after a gap." } },
  { id: "sample-num", title: "A share result", interaction: { kind: "numeric", prompt: "You buy 10 shares at $5.00 and sell at $5.50. What is the gain in dollars, before costs?", unit: "US dollars", answer: 5, tolerance: 0.01, explain: "(5.50 − 5.00) × 10 = $5." } },
  {
    id: "sample-multi", title: "Costs of a trade",
    interaction: { kind: "multi-select", prompt: "Which of these are costs of trading? Select all that apply.", correct: ["a", "b", "d"], options: [
      { id: "a", text: "The spread", explain: "A cost: you buy at the ask and sell at the bid." },
      { id: "b", text: "Commission", explain: "A cost charged by many brokers." },
      { id: "c", text: "The share's dividend", explain: "A dividend is paid to holders, not a trading cost." },
      { id: "d", text: "Overnight financing on a leveraged position", explain: "A cost for many leveraged products held overnight." },
    ] },
  },
  {
    id: "sample-scenario", title: "A decision under pressure",
    interaction: { kind: "scenario", situation: "A stranger online offers a \"guaranteed\" 10% a month if you send money today.", question: "What is the soundest response?", options: [
      { id: "a", text: "Send a small amount to test it", explain: "Smaller, but it ignores the warning signs.", process: "partial" },
      { id: "b", text: "Decline: guarantees and deadlines are warning signs", explain: "Right. No legitimate investment guarantees returns.", process: "sound" },
      { id: "c", text: "Send everything before the offer ends", explain: "Pressure to act fast is a classic scam sign.", process: "unsound" },
    ], outcome: "Even if the first month paid out, that would not make the decision sound: early payouts are a common trick." },
  },
  {
    id: "sample-error", title: "Find the error in this trade plan",
    interaction: { kind: "find-error", prompt: "Select every line with a mistake.", explain: "A stop is an order at the next available price, not a guarantee.", lines: [
      { id: "l1", text: "Risk 1% of the account on this trade." },
      { id: "l2", text: "The stop-loss guarantees I lose no more than 1%.", error: "A gap or slippage can fill the stop at a worse price." },
      { id: "l3", text: "Write down why I am taking the trade." },
    ] },
  },
  {
    id: "sample-chart", title: "Mark a level",
    interaction: { kind: "chart-annotate", prompt: "On this illustrative chart, mark the lowest closing price.", series: [10.4, 10.1, 10.6, 10.2, 9.8, 10.3, 10.7], decimals: 1, target: { mode: "level", value: 9.8, tolerance: 0.05 }, explain: "The lowest close is 9.8, the fifth bar." },
  },
  { id: "sample-cards", title: "Flashcards", interaction: { kind: "flashcards", cards: [{ front: "Spread", back: "The gap between the bid and the ask." }, { front: "Leverage", back: "A small deposit controls a bigger position; gains and losses are multiplied." }] } },
  { id: "sample-reveal", title: "Think, then reveal", interaction: { kind: "reveal", prompt: "Before you look: why does a new trade start slightly negative?", label: "Show the answer", content: "You buy at the ask and could only sell at the lower bid, so the spread is lost straight away." } },
  {
    id: "sample-steps", title: "Sizing a position, step by step",
    interaction: { kind: "steps", steps: [
      { title: "Decide the risk", text: "A $1,000 account risking 1% has $10 at risk." },
      { title: "Measure the stop", text: "The stop is 20 pips away.", check: { kind: "numeric", prompt: "How many dollars per pip can you afford?", unit: "US dollars per pip", answer: 0.5, tolerance: 0.001, explain: "$10 ÷ 20 pips = $0.50 per pip." } },
      { title: "Size the trade", text: "On EUR/USD in a dollar account, $0.50 a pip is 5,000 units (0.05 lots)." },
    ] },
  },
];

export default function InteractionsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-fg-subtle">
        <Link href="/academy" className="hover:text-fg">Academy</Link>
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-fg-muted" aria-current="page">Interaction types</span>
      </nav>
      <header>
        <h2 className="text-xl font-semibold tracking-tight">Interaction types</h2>
        <p className="mt-1 text-sm text-fg-muted">One working sample of every kind of interaction the Academy uses in lessons, assessments and remediation. Nothing here is recorded, and every number is made up for the example.</p>
      </header>
      <div className="space-y-4">
        {SAMPLES.map((s) => <InteractionView key={s.id} id={s.id} title={s.title} interaction={s.interaction} />)}
      </div>
    </div>
  );
}
