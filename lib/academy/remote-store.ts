import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeProgress, parseProgress, type ProgressState } from "./progress";
import type { ProgressStore } from "./store";

/*
  Academy progress synced to the signed-in user's Supabase account.

  It wraps the browser store, which stays the fast, synchronous cache the UI
  reads and writes (so ProgressProvider needs no changes to how it calls the
  store). On top of that:
  - on start it pulls the account copy and merges it with what is in this
    browser using mergeProgress, so the first sign-in carries a guest's local
    progress into the account and later sign-ins on other devices combine;
  - every save schedules a debounced push (read, merge, write, so another
    device's newer changes are never overwritten);
  - a failed push (offline, server error) is retried with backoff, when the
    browser comes back online, and when the tab becomes visible again;
  - the account copy is also mirrored into small per-row tables
    (reflections, assessment attempts) for querying. The JSON row is the
    source of truth; the mirrors are best effort.
*/

export type SyncStatus = "syncing" | "synced" | "offline" | "error";

export interface SyncedProgressStore extends ProgressStore {
  readonly syncStatus: SyncStatus;
  onStatus(listener: (s: SyncStatus) => void): () => void;
  /** Push anything unsaved now (used before signing out). Resolves true when the account is up to date. */
  flush(): Promise<boolean>;
  dispose(): void;
}

const DEBOUNCE_MS = 1500;
const MAX_BACKOFF_MS = 60_000;
/** localStorage key naming which account the browser's cached progress belongs to. */
export const OWNER_KEY = "traderos.account.owner";

type Row = { state: unknown; updated_at: string };

function sameState(a: ProgressState, b: ProgressState) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function createSupabaseProgressStore(local: ProgressStore, supabase: SupabaseClient, userId: string): SyncedProgressStore {
  const listeners = new Set<() => void>();
  const statusListeners = new Set<(s: SyncStatus) => void>();
  let status: SyncStatus = "syncing";
  let dirty = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let backoff = 2000;
  let inFlight: Promise<boolean> | null = null;
  let disposed = false;

  const setStatus = (s: SyncStatus) => {
    if (s === status) return;
    status = s;
    statusListeners.forEach((l) => l(s));
  };
  const notify = () => listeners.forEach((l) => l());

  async function fetchRemote(): Promise<ProgressState | null> {
    const { data, error } = await supabase.from("academy_progress").select("state, updated_at").eq("user_id", userId).maybeSingle<Row>();
    if (error) throw error;
    return data ? parseProgress(data.state).state : null;
  }

  /** Merge the account copy into this browser. Returns the merged state. */
  async function pull(): Promise<ProgressState> {
    const remote = await fetchRemote();
    const here = local.load().state;
    if (!remote) return here;
    const merged = mergeProgress(here, remote);
    if (!sameState(merged, here)) {
      local.save(merged);
      notify();
    }
    if (!sameState(merged, remote)) dirty = true;
    return merged;
  }

  async function push(): Promise<boolean> {
    if (disposed) return false;
    try {
      setStatus("syncing");
      const merged = await pull();
      const { error } = await supabase.from("academy_progress").upsert({ user_id: userId, state: merged, schema_version: merged.version, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
      dirty = false;
      backoff = 2000;
      setStatus("synced");
      void mirror(merged);
      return true;
    } catch {
      dirty = true;
      const offline = typeof navigator !== "undefined" && navigator.onLine === false;
      setStatus(offline ? "offline" : "error");
      schedule(backoff);
      backoff = Math.min(MAX_BACKOFF_MS, backoff * 2);
      return false;
    }
  }

  function run(): Promise<boolean> {
    if (inFlight) return inFlight.then(() => (dirty ? run() : true));
    inFlight = push().finally(() => {
      inFlight = null;
    });
    return inFlight;
  }

  function schedule(ms = DEBOUNCE_MS) {
    if (disposed) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void run();
    }, ms);
  }

  /** Best-effort copies into the per-row tables. Never blocks or fails the main sync. */
  async function mirror(state: ProgressState) {
    try {
      const reflections = Object.entries(state.lessons)
        .filter(([, l]) => l.reflection && l.reflection.text.trim())
        .map(([lessonId, l]) => ({ user_id: userId, lesson_id: lessonId, body: l.reflection!.text, updated_at: l.reflection!.updatedAt }));
      const cleared = Object.entries(state.lessons).filter(([, l]) => !l.reflection && l.reflectionClearedAt).map(([id]) => id);
      if (reflections.length) await supabase.from("lesson_reflections").upsert(reflections, { onConflict: "user_id,lesson_id" });
      if (cleared.length) await supabase.from("lesson_reflections").delete().eq("user_id", userId).in("lesson_id", cleared);
      const attempts = Object.entries(state.assessments ?? {}).flatMap(([trackId, t]) =>
        t.attempts.map((a) => ({
          user_id: userId,
          track_id: trackId,
          attempted_at: a.at,
          seq: a.seq ?? null,
          correct: a.items.filter((i) => i.ok).length,
          total: a.items.length,
          items: a.items,
          answers: a.answers ?? {},
        })),
      );
      if (attempts.length) await supabase.from("assessment_attempts").upsert(attempts, { onConflict: "user_id,track_id,attempted_at", ignoreDuplicates: true });
      if (state.resetAt) {
        await supabase.from("assessment_attempts").delete().eq("user_id", userId).lte("attempted_at", state.resetAt);
        await supabase.from("lesson_reflections").delete().eq("user_id", userId).lte("updated_at", state.resetAt);
      }
    } catch {
      /* mirrors are optional */
    }
  }

  const onOnline = () => dirty && void run();
  const onVisible = () => {
    if (document.visibilityState !== "visible") return;
    if (dirty) void run();
    else void pull().catch(() => {});
  };
  if (typeof window !== "undefined") {
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
  }

  // First sync: bring the account copy in, then push the combined result back.
  void (async () => {
    try {
      await pull();
      setStatus("synced");
      if (dirty || !(await fetchRemote())) await run();
    } catch {
      dirty = true;
      setStatus(typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "error");
      schedule(backoff);
    }
  })();

  return {
    kind: local.kind,
    get syncStatus() {
      return status;
    },
    load: () => local.load(),
    save(state) {
      const r = local.save(state);
      dirty = true;
      schedule();
      return r;
    },
    subscribe(listener) {
      listeners.add(listener);
      const off = local.subscribe(listener);
      return () => {
        listeners.delete(listener);
        off();
      };
    },
    clear: () => local.clear(),
    reset(at) {
      local.reset(at);
      dirty = true;
      // The reset marker (resetAt) wins in every later merge, so pushing it clears the account copy too.
      void run();
    },
    onStatus(listener) {
      statusListeners.add(listener);
      return () => statusListeners.delete(listener);
    },
    async flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (!dirty && !inFlight) return true;
      return run();
    },
    dispose() {
      disposed = true;
      if (timer) clearTimeout(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener("online", onOnline);
        document.removeEventListener("visibilitychange", onVisible);
      }
      listeners.clear();
      statusListeners.clear();
    },
  };
}
