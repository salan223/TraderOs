import type { Metadata } from "next";
import { ModulePage } from "@/components/module-page";

export const metadata: Metadata = { title: "AI Mentor" };

export default function Page() {
  return (
    <ModulePage
      href="/mentor"
      principle="The mentor is a teacher and reviewer, not a signal service. When it looks at a chart it separates facts, interpretation, hypotheses, alternatives, uncertainty and what would prove it wrong. It never places trades."
      features={[
        "Eight modes: Teach Me, Analyze a Chart, Explain a Strategy, Review My Trade, Risk Coach, Psychology Coach, Market Research and Quiz Me",
        "Aware of your lessons, quiz results, journal, paper trades and strategies",
        "Explains at your level and defines terms as it goes",
        "Challenges your assumptions instead of agreeing with you",
        "Spots behaviour patterns and recommends lessons based on your mistakes",
        "API keys stay on the server, never in your browser",
      ]}
    />
  );
}
