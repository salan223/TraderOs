"use client";

import { AlertTriangle, Cloud, CloudOff, HardDrive } from "lucide-react";
import { MASTERY_META, type MasteryLevel } from "@/lib/academy/progress";
import { cn } from "@/lib/cn";
import { useProgress } from "./progress-provider";

const LEVEL_STYLE: Record<MasteryLevel, string> = {
  "not-started": "border-line-strong text-fg-subtle",
  learning: "border-info/30 bg-info-soft text-info",
  practising: "border-warn/30 bg-warn-soft text-warn",
  mastered: "border-up/30 bg-up-soft text-up",
};

/** Mastery level pill. `level={null}` renders a neutral placeholder (used before progress loads). */
export function MasteryBadge({ level, className }: { level: MasteryLevel | null; className?: string }) {
  return (
    <span
      title={level ? MASTERY_META[level].description : undefined}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase leading-4 tracking-[0.06em]",
        level ? LEVEL_STYLE[level] : "border-line text-transparent",
        className,
      )}
    >
      {level ? MASTERY_META[level].label : "Loading"}
    </span>
  );
}

/** Honest note about where progress is stored. */
export function SaveNotice({ className }: { className?: string }) {
  const { ready, storage, sync, saveFailed, repaired } = useProgress();
  if (!ready) return <p className={cn("text-[11px] text-fg-subtle", className)}>&nbsp;</p>;
  if (storage === "local" && saveFailed) {
    return (
      <p className={cn("flex items-start gap-1.5 text-[11px] text-warn", className)} role="status">
        <AlertTriangle className="mt-px size-3 shrink-0" strokeWidth={1.75} />
        Could not save: browser storage is full or unavailable. Your progress is kept until you close this tab.
      </p>
    );
  }
  if (storage === "memory") {
    return (
      <p className={cn("flex items-start gap-1.5 text-[11px] text-warn", className)} role="status">
        <AlertTriangle className="mt-px size-3 shrink-0" strokeWidth={1.75} />
        This browser is blocking storage, so progress will be lost when you close the tab.
      </p>
    );
  }
  if (sync !== "off") {
    const behind = sync === "offline" || sync === "error";
    const Icon = behind ? CloudOff : Cloud;
    return (
      <p className={cn("flex items-start gap-1.5 text-[11px]", behind ? "text-warn" : "text-fg-subtle", className)} role="status">
        <Icon className="mt-px size-3 shrink-0" strokeWidth={1.75} />
        <span>
          {sync === "synced" && "Saved to your account."}
          {sync === "syncing" && "Saving to your account…"}
          {sync === "offline" && "Offline: saved in this browser, and sent to your account when you reconnect."}
          {sync === "error" && "Could not reach your account: saved in this browser and retrying."}
          {repaired && " Some saved data was damaged and has been repaired."}
        </span>
      </p>
    );
  }
  return (
    <p className={cn("flex items-start gap-1.5 text-[11px] text-fg-subtle", className)}>
      <HardDrive className="mt-px size-3 shrink-0" strokeWidth={1.75} />
      <span>
        Saved in this browser only. Sign in to keep progress in your account.
        {repaired && " Some saved data was damaged and has been repaired."}
      </span>
    </p>
  );
}
