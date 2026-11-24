"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createBrowserStore } from "@/lib/academy/store";
import { OWNER_KEY } from "@/lib/academy/remote-store";
import { clearLocalDocs, startDocSync } from "@/lib/user-docs";

export type AuthUser = { id: string; email: string | null };
type AuthStatus = "loading" | "signed-in" | "signed-out";

type AuthContextValue = {
  /** False when no Supabase URL and key are set: the app runs in guest mode only. */
  configured: boolean;
  status: AuthStatus;
  user: AuthUser | null;
  /** Saves anything unsynced, signs out, clears this browser's copy of the account's data, then goes to "/". */
  signOut: () => Promise<void>;
  /** Lets the progress store register a "push everything now" step for sign-out. */
  registerFlush: (fn: () => Promise<boolean>) => () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readOwner(): string | null {
  try {
    return window.localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
}
function writeOwner(id: string | null) {
  try {
    if (id) window.localStorage.setItem(OWNER_KEY, id);
    else window.localStorage.removeItem(OWNER_KEY);
  } catch {}
}
/** Remove the account's cached progress and documents from this browser. */
function clearAccountCache() {
  createBrowserStore().clear();
  clearLocalDocs();
  writeOwner(null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isSupabaseConfigured ? "loading" : "signed-out");
  const [user, setUser] = useState<AuthUser | null>(null);
  const flushers = useRef(new Set<() => Promise<boolean>>());
  const docSync = useRef<ReturnType<typeof startDocSync> | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    let current: string | null = null;
    const apply = (u: { id: string; email?: string | null } | null) => {
      const id = u?.id ?? null;
      if (id === current) return;
      current = id;
      docSync.current?.stop();
      docSync.current = null;
      if (id) {
        // Progress cached in this browser for a different account must not leak into this one.
        // Guest progress (no owner) is kept, and merges into the account on first sync.
        const owner = readOwner();
        if (owner && owner !== id) clearAccountCache();
        writeOwner(id);
        docSync.current = startDocSync(supabase, id);
        setUser({ id, email: u?.email ?? null });
        setStatus("signed-in");
      } else {
        setUser(null);
        setStatus("signed-out");
      }
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user ?? null)).catch(() => apply(null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user ?? null));
    return () => {
      sub.subscription.unsubscribe();
      docSync.current?.stop();
    };
  }, []);

  const registerFlush = useCallback((fn: () => Promise<boolean>) => {
    flushers.current.add(fn);
    return () => {
      flushers.current.delete(fn);
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    // Give unsynced changes a few seconds to reach the account before the session ends.
    const timeout = new Promise<boolean[]>((r) => setTimeout(() => r([false]), 5000));
    const jobs = [...flushers.current].map((f) => f().catch(() => false));
    if (docSync.current) jobs.push(docSync.current.flush().catch(() => false));
    const results = await Promise.race([Promise.all(jobs), timeout]);
    const allSaved = results.every(Boolean);
    if (!allSaved && !window.confirm("Some recent changes have not reached your account yet (you may be offline). Sign out anyway? They stay in this browser and are synced the next time you sign in here.")) return;
    await supabase.auth.signOut().catch(() => {});
    // Only remove this browser's copy once everything is safely in the account.
    if (allSaved) clearAccountCache();
    window.location.assign("/");
  }, []);

  const value = useMemo(() => ({ configured: isSupabaseConfigured, status, user, signOut, registerFlush }), [status, user, signOut, registerFlush]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const GUEST: AuthContextValue = {
  configured: false,
  status: "signed-out",
  user: null,
  signOut: async () => {},
  registerFlush: () => () => {},
};

/** Auth state. Outside an AuthProvider (tests, previews) it reports a signed-out guest. */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext) ?? GUEST;
}
