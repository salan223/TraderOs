"use client";

import { useState } from "react";
import { LESSONS } from "@/lib/academy/curriculum";
import { summarize } from "@/lib/academy/progress";
import { Button } from "@/components/ui/button";
import { useProgress } from "./progress-provider";
import { SaveNotice } from "./status";

/** Settings panel body: where Academy progress lives, plus a confirmed reset. */
export function AcademyStorageSettings() {
  const { ready, state, clock, resetAll } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const s = ready ? summarize(LESSONS, state, clock) : null;
  return (
    <div className="space-y-3 text-[13px]">
      <SaveNotice />
      <p className="text-xs text-fg-muted">
        {s ? `${s.started} lesson${s.started === 1 ? "" : "s"} started, ${s.completed} completed.` : " "} Clearing your browser data also clears this progress.
      </p>
      <div className="flex flex-wrap items-center gap-2" aria-live="polite">
        {!confirming ? (
          <Button onClick={() => { setConfirming(true); setDone(false); }} disabled={!ready || !s?.started}>
            Reset Academy progress
          </Button>
        ) : (
          <>
            <span className="text-xs text-warn">This deletes all lesson progress, quiz and assessment attempts, remediation and reflections in this browser.</span>
            <Button variant="primary" onClick={() => { resetAll(); setConfirming(false); setDone(true); }}>Yes, reset</Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
          </>
        )}
        {done && <span className="text-xs text-fg-muted">Progress reset.</span>}
      </div>
    </div>
  );
}
