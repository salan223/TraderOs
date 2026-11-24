import type { Metadata } from "next";
import Link from "next/link";
import { BookA, GraduationCap } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { AcademySummary, TrackList } from "@/components/academy/overview";
import { MasteryBadge } from "@/components/academy/status";
import { MASTERY_LEVELS, MASTERY_META } from "@/lib/academy/progress";
import { LESSONS, TRACKS } from "@/lib/academy/curriculum";

export const metadata: Metadata = { title: "Academy" };

export default function AcademyPage() {
  const written = TRACKS.filter((t) => t.status === "written").length;
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-panel text-accent-strong">
            <GraduationCap className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Academy</h2>
            <p className="mt-1 max-w-2xl text-sm text-fg-muted">
              A structured course from zero. {TRACKS.length} tracks are planned; {written} {written === 1 ? "is" : "are"} written so far, with {LESSONS.length} full lessons.
              Every term is explained the first time it appears.
            </p>
          </div>
        </div>
        <Link
          href="/academy/glossary"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong bg-raised px-3 text-[13px] font-medium hover:bg-hover"
        >
          <BookA className="size-3.5" aria-hidden /> Glossary
        </Link>
      </section>

      <AcademySummary />

      <section aria-labelledby="tracks-h" className="space-y-3">
        <h2 id="tracks-h" className="text-[13px] font-medium text-fg">Tracks</h2>
        <TrackList />
      </section>

      <Panel title="How mastery works" hint="Finishing a lesson and mastering it are different things.">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 text-[13px] leading-relaxed text-fg-muted">
            <p><span className="text-fg">A lesson is complete</span> when you have read every section, solved the interactive exercise and scored at least 80% on the quiz (your best attempt counts).</p>
            <p><span className="text-fg">Mastery</span> asks for more: pass the quiz on two different days, with your latest attempt a pass. Remembering it on a later day is the real test.</p>
            <p><span className="text-fg">Mastery %</span> for a track is the average of its lessons: Mastered counts 100%, Practising 50%, and Learning or Not started 0%. Reading alone never raises it.</p>
            <p><span className="text-fg">A track is complete</span> when every lesson is complete and you pass its track assessment: 90% or more, every safety-critical question right (leverage, margin, position sizing and stop-losses), and a sound decision in the applied scenario. If you miss something, you see why, work through each missed concept a different way (a new angle each time you miss it again), and retest with a fresh question for every concept, ones you have not seen first. Opening lessons never completes a track.</p>
            <p data-practical-rule><span className="text-fg">Practical competency</span> means every lesson exercise solved plus the applied scenario answered soundly in a passing assessment. Lesson reflections are optional: they help you think, and they are counted on your progress, but they never block a track.</p>
            <p><span className="text-fg">After a pass</span>, retakes are practice. They are recorded, but a practice result never removes your pass or your best (mastery) score, and its misses never lock further practice.</p>
            <p><span className="text-fg">Tracks unlock</span> when the tracks they build on are complete. A locked track can be read in Preview mode, which records nothing.</p>
            <p><span className="text-fg">Your journey stage</span> on the dashboard moves from Awareness to Learning once Market Foundations is complete, including its assessment. The other Academy tracks keep you in Learning: the later stages need chart reading, paper trading and a journal, which arrive in later phases.</p>
          </div>
          <ul className="space-y-2.5">
            {MASTERY_LEVELS.map((l) => (
              <li key={l} className="flex items-start gap-3">
                <MasteryBadge level={l} className="w-24 justify-center" />
                <span className="text-xs leading-relaxed text-fg-muted">{MASTERY_META[l].description}</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
