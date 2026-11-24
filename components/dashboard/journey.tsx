"use client";

import { TRACKS, lessonsOfTrack } from "@/lib/academy/curriculum";
import { journeyStage, summarize } from "@/lib/academy/progress";
import { useAcademySummary } from "@/components/academy/overview";
import { Progression } from "./progression";

/**
 * Dashboard heading and stage strip, derived from saved Academy progress.
 * Awareness lasts until Market Foundations is COMPLETE: every lesson and its
 * track assessment (see journeyStage's `gate`). The current track is the first
 * unlocked written track that is not complete.
 */
export function Journey() {
  const data = useAcademySummary();
  const stage = (() => {
    if (!data) return null;
    const cur = TRACKS.find((t) => t.id === data.currentTrackId) ?? null;
    const s = cur ? summarize(lessonsOfTrack(cur.id), data.state, data.clock) : null;
    return journeyStage(
      summarize(lessonsOfTrack(TRACKS[0].id), data.state, data.clock),
      cur && s ? { title: cur.title, completed: s.completed, total: s.total, assessmentPending: s.completed >= s.total && !data.tracks.get(cur.id)?.assessment?.passed } : null,
      { foundationsAssessmentPassed: !!data.tracks.get(TRACKS[0].id)?.assessment?.passed },
    );
  })();
  return (
    <>
      <section>
        <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">Your journey</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{stage?.headline ?? "Start with understanding, not with trading."}</h2>
        <p className="mt-1 min-h-5 max-w-2xl text-sm text-fg-muted">{stage?.detail ?? "\u00a0"}</p>
      </section>
      <Progression current={stage?.index ?? -1} />
    </>
  );
}
