"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { emptyProgress, mergeProgress, resetProgress, type Clock, type ProgressState } from "@/lib/academy/progress";
import { createBrowserStore, type ProgressStore } from "@/lib/academy/store";
import { createSupabaseProgressStore, type SyncStatus, type SyncedProgressStore } from "@/lib/academy/remote-store";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";

type ProgressContextValue = {
  /** False on the server and during the first client render. Render a placeholder until true. */
  ready: boolean;
  state: ProgressState;
  /** The time the UI uses for "today", refreshed every minute. */
  clock: Clock;
  /** Where progress lives right now. */
  storage: "local" | "memory";
  /** Account sync: "off" for guests (this browser only), otherwise the state of the last sync. */
  sync: "off" | SyncStatus;
  /** Last save failed (for example, storage full). */
  saveFailed: boolean;
  /** Stored data was damaged and had to be repaired on load. */
  repaired: boolean;
  /** Apply a pure update. It runs against the latest stored state, so other tabs' changes are kept. */
  update: (fn: (s: ProgressState, now: Date) => ProgressState) => void;
  resetAll: () => void;
  /** Preview mode: progress is shown but nothing is recorded (update and resetAll do nothing). */
  readOnly: boolean;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function deviceTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

const SERVER_CLOCK: Clock = { now: new Date(0) };

export function ProgressProvider({ children, store: injected }: { children: ReactNode; store?: ProgressStore }) {
  const storeRef = useRef<ProgressStore | null>(injected ?? null);
  /** Latest state in memory. Used instead of re-reading storage while saves are failing. */
  const memoryRef = useRef<ProgressState>(emptyProgress());
  const unsavedRef = useRef(false);
  const [state, setState] = useState<ProgressState>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [clock, setClock] = useState<Clock>(SERVER_CLOCK);
  const [storage, setStorage] = useState<"local" | "memory">("local");
  const [saveFailed, setSaveFailed] = useState(false);
  const [repaired, setRepaired] = useState(false);
  const [sync, setSync] = useState<"off" | SyncStatus>("off");
  const { status: authStatus, user, registerFlush } = useAuth();
  const userId = authStatus === "signed-in" ? user?.id ?? null : null;

  useEffect(() => {
    // Signed in: the browser store becomes a cache of the account copy (lib/academy/remote-store.ts).
    const supabase = userId && !injected ? getBrowserSupabase() : null;
    let synced: SyncedProgressStore | null = null;
    const store = injected ?? (supabase && userId ? (synced = createSupabaseProgressStore(createBrowserStore(), supabase, userId)) : createBrowserStore());
    storeRef.current = store;
    unsavedRef.current = false;
    setSaveFailed(false);
    setSync(synced ? synced.syncStatus : "off");
    const offStatus = synced ? synced.onStatus(setSync) : () => {};
    const offFlush = synced ? registerFlush(() => synced!.flush()) : () => {};
    const tz = deviceTimeZone();
    const load = () => {
      const r = store.load();
      memoryRef.current = r.state;
      setState(r.state);
      return r;
    };
    const first = load();
    setRepaired(first.repaired);
    setStorage(store.kind);
    setClock({ now: new Date(), timeZone: tz });
    setReady(true);
    // Another tab changed progress. If our own saves are failing, merge its changes into
    // what we hold in memory instead of replacing it.
    const refresh = () => {
      if (!unsavedRef.current) {
        load();
        return;
      }
      const merged = mergeProgress(memoryRef.current, store.load().state);
      memoryRef.current = merged;
      setState(merged);
    };
    const unsubscribe = store.subscribe(refresh);
    // A page restored from the back/forward cache missed storage events while it was frozen.
    const onShow = (e: PageTransitionEvent) => e.persisted && refresh();
    window.addEventListener("pageshow", onShow);
    const id = setInterval(() => setClock({ now: new Date(), timeZone: tz }), 60_000);
    return () => {
      unsubscribe();
      offStatus();
      offFlush();
      synced?.dispose();
      window.removeEventListener("pageshow", onShow);
      clearInterval(id);
    };
  }, [userId, injected, registerFlush]);

  const update = useCallback((fn: (s: ProgressState, now: Date) => ProgressState) => {
    const store = storeRef.current;
    if (!store) return;
    // Always build on the latest stored state so changes from other tabs are kept.
    // When earlier saves failed, merge the unsaved in-memory progress with whatever is
    // stored now (another tab may have saved meanwhile), so neither side is overwritten.
    const stored = store.load().state;
    const current = unsavedRef.current ? mergeProgress(memoryRef.current, stored) : stored;
    const now = new Date();
    const next = fn(current, now);
    // Nothing changed and nothing is waiting to be saved.
    if (next === current && !unsavedRef.current) {
      memoryRef.current = current;
      setState(current);
      return;
    }
    const { ok } = store.save(next);
    unsavedRef.current = !ok;
    memoryRef.current = next;
    setSaveFailed(!ok);
    setState(next);
    setClock((c) => ({ ...c, now }));
  }, []);

  const resetAll = useCallback(() => {
    const store = storeRef.current;
    if (!store) return;
    const now = new Date();
    store.reset(now);
    const fresh = resetProgress(now);
    memoryRef.current = fresh;
    unsavedRef.current = false;
    setSaveFailed(false);
    setState(fresh);
    setRepaired(false);
  }, []);

  const value = useMemo(
    () => ({ ready, state, clock, storage, sync, saveFailed, repaired, update, resetAll, readOnly: false }),
    [ready, state, clock, storage, sync, saveFailed, repaired, update, resetAll],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

const noop = () => {};

/**
 * Everything inside sees saved progress but cannot change it: Preview mode for
 * locked tracks. Sections read, exercises, quizzes and reflections are not recorded.
 */
export function ReadOnlyProgress({ children }: { children: ReactNode }) {
  const ctx = useProgress();
  const value = useMemo(() => ({ ...ctx, update: noop, resetAll: noop, readOnly: true }), [ctx]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
