import { emptyProgress, isValidIsoTime, parseProgress, resetProgress, type ParseResult, type ProgressState } from "./progress";

/**
 * Where Academy progress is kept.
 *
 * Guests: this browser (localStorage). Signed in: the same browser store,
 * wrapped by the Supabase store in remote-store.ts, which syncs it to the
 * account (supabase/migrations/0003_user_sync.sql). The UI uses only this
 * interface, so it does not care which one it has.
 */
export interface ProgressStore {
  /** "local": survives reloads in this browser. "memory": lost on reload (storage blocked). */
  readonly kind: "local" | "memory";
  load(): ParseResult;
  save(state: ProgressState): { ok: boolean };
  /** Called when progress changes elsewhere (another tab). Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
  clear(): void;
  /**
   * Delete all progress and leave a reset marker (tombstone), so a tab still
   * holding older unsaved progress cannot bring it back when it merges.
   */
  reset(at: Date): void;
}

export const STORAGE_KEY = "traderos.academy.progress.v1";
/** Newest backup of unreadable data. Older ones are kept at BACKUP_KEY + ".2" and ".3". */
export const BACKUP_KEY = "traderos.academy.progress.v1.corrupt-backup";
export const MAX_BACKUPS = 3;
export const backupKeys = (): string[] => Array.from({ length: MAX_BACKUPS }, (_, i) => (i === 0 ? BACKUP_KEY : `${BACKUP_KEY}.${i + 1}`));
/** Every key Trader OS's Academy may write. A reset removes all of them. */
export const ACADEMY_KEY_PREFIX = "traderos.academy.";
/** When progress was last reset. Written after the sweep, so it survives clear(). */
export const RESET_KEY = "traderos.academy.reset-at";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem"> & Partial<Pick<Storage, "key" | "length">>;
type EventTargetLike = Pick<Window, "addEventListener" | "removeEventListener">;

/** True if `storage` can actually be written (Safari private mode and blocked cookies can throw). */
export function storageWorks(storage: StorageLike | undefined | null): storage is StorageLike {
  if (!storage) return false;
  try {
    const k = "__traderos_probe__";
    storage.setItem(k, "1");
    storage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function createLocalStorageStore(storage: StorageLike, events?: EventTargetLike): ProgressStore {
  return {
    kind: "local",
    load() {
      let raw: string | null = null;
      try {
        raw = storage.getItem(STORAGE_KEY);
      } catch {
        return { state: emptyProgress(), repaired: false, issues: ["could not read browser storage"] };
      }
      const result = parseProgress(raw);
      // Apply the newest reset marker, even when the progress key itself was deleted.
      try {
        const marker = storage.getItem(RESET_KEY);
        if (isValidIsoTime(marker) && (!result.state.resetAt || Date.parse(marker) > Date.parse(result.state.resetAt))) {
          result.state = { ...result.state, resetAt: marker };
        }
      } catch {}
      // A reset marker more than 5 minutes in the future (wrong clock or corrupt data) would
      // hide every new action until that date, so it is ignored, like future quiz attempts.
      if (result.state.resetAt && Date.parse(result.state.resetAt) > Date.now() + 5 * 60_000) {
        const { resetAt: _ignored, ...rest } = result.state;
        result.state = rest;
        result.issues = [...(result.issues ?? []), "ignored a reset marker dated in the future"];
      }
      if (result.repaired && raw) {
        // Keep a copy of what we could not read before it is overwritten, so nothing is
        // silently lost. Each different corruption is kept; only the newest MAX_BACKUPS stay.
        try {
          const keys = backupKeys();
          // Skip if this exact content is already kept in any slot.
          if (!keys.some((k) => storage.getItem(k) === raw)) {
            for (let i = keys.length - 1; i > 0; i--) {
              const prev = storage.getItem(keys[i - 1]);
              if (prev !== null) storage.setItem(keys[i], prev);
            }
            storage.setItem(keys[0], raw);
          }
        } catch {}
      }
      return result;
    },
    save(state) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
        return { ok: true };
      } catch {
        return { ok: false };
      }
    },
    subscribe(listener) {
      if (!events) return () => {};
      const onStorage = (e: StorageEvent) => {
        // key === null means storage.clear() was called in another tab.
        if (e.key === STORAGE_KEY || e.key === RESET_KEY || e.key === null) listener();
      };
      events.addEventListener("storage", onStorage);
      return () => events.removeEventListener("storage", onStorage);
    },
    clear() {
      const keys = new Set([STORAGE_KEY, ...backupKeys()]);
      try {
        // Also sweep any other Academy keys (older versions, future additions).
        if (typeof storage.key === "function" && typeof storage.length === "number") {
          for (let i = 0; i < storage.length; i++) {
            const k = storage.key(i);
            if (k && k.startsWith(ACADEMY_KEY_PREFIX)) keys.add(k);
          }
        }
      } catch {}
      for (const k of keys) {
        try {
          storage.removeItem(k);
        } catch {}
      }
    },
    reset(at) {
      this.clear();
      try {
        storage.setItem(RESET_KEY, at.toISOString());
      } catch {}
    },
  };
}

export function createMemoryStore(initial?: ProgressState): ProgressStore {
  let data: ProgressState = initial ?? emptyProgress();
  return {
    kind: "memory",
    load: () => ({ state: data, repaired: false, issues: [] }),
    save(state) {
      data = state;
      return { ok: true };
    },
    subscribe: () => () => {},
    clear() {
      data = emptyProgress();
    },
    reset(at) {
      data = resetProgress(at);
    },
  };
}

/** The store for the current environment. Safe to call during SSR (returns a memory store). */
export function createBrowserStore(): ProgressStore {
  if (typeof window === "undefined") return createMemoryStore();
  let ls: Storage | undefined;
  try {
    ls = window.localStorage;
  } catch {
    ls = undefined;
  }
  return storageWorks(ls) ? createLocalStorageStore(ls, window) : createMemoryStore();
}
