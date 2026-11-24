"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Practical } from "@/lib/academy/types";
import { MAX_REFLECTION_LENGTH, getLessonProgress, saveReflection } from "@/lib/academy/progress";
import { Button } from "@/components/ui/button";
import { RichText } from "./rich-text";
import { useProgress } from "./progress-provider";

export function PracticalView({ lessonId, practical }: { lessonId: string; practical: Practical }) {
  const { ready, state, update, storage, sync, saveFailed, readOnly } = useProgress();
  const saved = ready ? getLessonProgress(state, lessonId)?.reflection ?? null : null;
  const [text, setText] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  /** The saved text the box was last in sync with (null until progress loads). */
  const [baseline, setBaseline] = useState<string | null>(null);
  /** Saved text changed elsewhere (another tab, a reset) while the box had unsaved edits. */
  const [conflict, setConflict] = useState(false);
  const id = `${lessonId}-reflection`;
  const savedText = saved?.text ?? "";
  const loaded = baseline !== null;

  // Keep the box in sync with saved data. Untouched box: follow the saved text (including
  // a deletion). Box with unsaved edits: keep the user's text but say what happened.
  useEffect(() => {
    if (!ready || savedText === baseline) return;
    if (baseline === null || text === baseline) {
      setText(savedText);
      setConflict(false);
    } else if (text !== savedText) {
      setConflict(true);
      setJustSaved(false);
    } else {
      setConflict(false);
    }
    setBaseline(savedText);
  }, [ready, savedText, baseline, text]);

  const dirty = loaded && text !== savedText;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{practical.title}</h3>
      <p className="text-sm leading-relaxed text-fg-muted"><RichText text={practical.instructions} /></p>
      <ol className="list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed text-fg-muted marker:text-fg-subtle">
        {practical.steps.map((s) => (
          <li key={s}><RichText text={s} /></li>
        ))}
      </ol>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          update((s, now) => saveReflection(s, lessonId, text, now));
          setBaseline(text);
          setConflict(false);
          setJustSaved(true);
        }}
      >
        <label htmlFor={id} className="block text-[13px] text-fg">
          Reflection <span className="text-fg-subtle">(optional)</span>
          <span className="block text-xs text-fg-muted">{practical.reflectionPrompt}</span>
        </label>
        <textarea
          id={id}
          rows={4}
          maxLength={MAX_REFLECTION_LENGTH}
          disabled={!ready}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setJustSaved(false);
          }}
          className="block w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2 text-[13px] leading-relaxed text-fg placeholder:text-fg-subtle disabled:opacity-50"
          placeholder="Write a few sentences. Only you can see this."
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] tabular text-fg-subtle">
            {text.length}/{MAX_REFLECTION_LENGTH} · {storage === "memory" ? "Not saved: storage is blocked in this browser." : saveFailed ? "Could not save: browser storage is full." : sync !== "off" ? "Saved to your account." : "Saved only in this browser."}
          </span>
          <div className="flex items-center gap-2">
            <span aria-live="polite" className="text-xs text-up">
              {justSaved && !dirty && !saveFailed && storage === "local" && (
                <span className="inline-flex items-center gap-1"><Check className="size-3.5" aria-hidden />Saved</span>
              )}
            </span>
            <Button type="submit" disabled={!ready || !dirty || readOnly}>{readOnly ? "Not saved in Preview" : "Save reflection"}</Button>
          </div>
        </div>
        {conflict && dirty && (
          <p role="status" className="text-[11px] text-warn">
            {saved
              ? "This reflection was changed in another tab. Your unsaved text is kept here; saving replaces the other version."
              : "This reflection was deleted in another tab (or progress was reset). Your unsaved text is kept here; save it to keep it, or clear the box."}
          </p>
        )}
        {saved && (
          <p className="text-[11px] text-fg-subtle">Last saved {new Date(saved.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.</p>
        )}
      </form>
    </div>
  );
}
