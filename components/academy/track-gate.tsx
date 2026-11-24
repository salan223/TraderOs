"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Eye, Lock } from "lucide-react";
import { TRACK_DEFS, getTrack, trackTitle } from "@/lib/academy/curriculum";
import { trackProgress, type TrackProgress } from "@/lib/academy/mastery";
import { Button } from "@/components/ui/button";
import { ReadOnlyProgress, useProgress } from "./progress-provider";

/** Track-level progress for every track, or null before progress loads. */
export function useTrackProgress(): ReadonlyMap<string, TrackProgress> | null {
  const { ready, state, clock } = useProgress();
  return useMemo(() => (ready ? trackProgress(TRACK_DEFS, state, clock) : null), [ready, state, clock]);
}

/** True when the page URL asks for Preview mode (?preview=1). */
export function usePreviewParam(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      setOn(new URLSearchParams(window.location.search).get("preview") === "1");
    } catch {}
  }, []);
  const set = (v: boolean) => {
    setOn(v);
    try {
      const u = new URL(window.location.href);
      if (v) u.searchParams.set("preview", "1");
      else u.searchParams.delete("preview");
      window.history.replaceState(window.history.state, "", u.toString());
    } catch {}
  };
  return [on, set];
}

/** "Unlocks after: A and B" with links. */
export function UnlockedBy({ missing }: { missing: string[] }) {
  return (
    <>
      {missing.map((id, i) => (
        <span key={id}>
          {i > 0 && (i === missing.length - 1 ? " and " : ", ")}
          <Link href={`/academy/${id}`} className="font-medium text-accent-strong hover:underline">{trackTitle(id)}</Link>
        </span>
      ))}
    </>
  );
}

/**
 * Wraps a lesson's content. Unlocked track: renders it normally. Locked track:
 * explains what unlocks it and offers Preview, which shows the lesson but
 * records nothing. Tracks without prerequisites never wait for progress to load.
 */
export function TrackGate({ trackId, children }: { trackId: string; children: ReactNode }) {
  const tp = useTrackProgress();
  const [preview, setPreview] = usePreviewParam();
  const track = getTrack(trackId);
  const hasPrereqs = !!track && track.prerequisites.length > 0;
  if (!hasPrereqs) return <>{children}</>;
  if (!tp) return <div className="min-h-40" aria-busy="true" aria-label="Checking whether this track is unlocked" />;
  const t = tp.get(trackId)!;
  if (t.unlocked) return <>{children}</>;
  if (preview) {
    return (
      <ReadOnlyProgress>
        <div className="space-y-5">
          <div role="status" data-preview-banner className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-info/30 bg-info-soft px-4 py-3">
            <p className="flex items-start gap-2 text-[13px] text-fg">
              <Eye className="mt-0.5 size-4 shrink-0 text-info" strokeWidth={1.75} aria-hidden />
              <span>
                <span className="font-medium">Preview mode.</span> You can read and try everything, but nothing here is saved or counts toward progress, and the track assessment is disabled.
                {" "}Unlocks after <UnlockedBy missing={t.missing} />.
              </span>
            </p>
            <Button variant="secondary" onClick={() => setPreview(false)}>Leave preview</Button>
          </div>
          {children}
        </div>
      </ReadOnlyProgress>
    );
  }
  return <LockedPanel trackId={trackId} missing={t.missing} onPreview={() => setPreview(true)} />;
}

export function LockedPanel({ trackId, missing, onPreview, what = "lesson" }: { trackId: string; missing: string[]; onPreview?: () => void; what?: "lesson" | "assessment" }) {
  return (
    <section data-locked className="rounded-[var(--radius-panel)] border border-line bg-panel px-4 py-5 sm:px-6" aria-labelledby="locked-h">
      <h2 id="locked-h" className="flex items-center gap-2 text-base font-semibold tracking-tight">
        <Lock className="size-4 text-fg-subtle" strokeWidth={1.75} aria-hidden /> {trackTitle(trackId)} is locked
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted">
        It unlocks after you complete <UnlockedBy missing={missing} />: every lesson, plus the track assessment (90% or more, with every safety-critical question right).
        Opening lessons is not enough on its own.
      </p>
      {what === "lesson" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {onPreview && <Button variant="primary" onClick={onPreview}><Eye className="size-3.5" aria-hidden />Preview this lesson</Button>}
          <span className="text-xs text-fg-subtle">Preview is read-only: nothing is saved or counted.</span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-fg-subtle">Assessments are not available in Preview mode.</p>
      )}
    </section>
  );
}
