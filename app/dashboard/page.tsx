import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Journey } from "@/components/dashboard/journey";
import { LearningProgress, NextLesson } from "@/components/dashboard/learning";
import { MarketOverview, DailyBriefing, Watchlist } from "@/components/dashboard/markets";
import { PaperAccount, OpenPositions, Performance, RecentJournal, Discipline, MentorQuick } from "@/components/dashboard/practice";
import { cn } from "@/lib/cn";

function Cell({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("min-w-0", className)}>{children}</div>;
}

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <Journey />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
        <Cell className="lg:col-span-5"><LearningProgress /></Cell>
        <Cell className="lg:col-span-4"><NextLesson /></Cell>
        <Cell className="md:col-span-2 lg:col-span-3"><MentorQuick /></Cell>

        <Cell className="lg:col-span-4"><MarketOverview /></Cell>
        <Cell className="lg:col-span-4"><DailyBriefing /></Cell>
        <Cell className="md:col-span-2 lg:col-span-4"><PaperAccount /></Cell>

        <Cell className="md:col-span-2 lg:col-span-5 lg:row-span-2"><Watchlist /></Cell>
        <Cell className="lg:col-span-4"><OpenPositions /></Cell>
        <Cell className="lg:col-span-3"><Performance /></Cell>
        <Cell className="lg:col-span-4"><RecentJournal /></Cell>
        <Cell className="lg:col-span-3"><Discipline /></Cell>
      </div>
    </div>
  );
}
