import type { SupabaseClient } from "@supabase/supabase-js";

/*
  Saved widget documents: the trading checklist and plan, the strategy
  spec, the backtest checklist and anything else a widget keeps with
  saveLocal() (lib/academy/psychology.ts). They always live in this
  browser's localStorage under keys starting with "trader-os:". When the
  user is signed in, each change is also sent to the user_documents table,
  and on sign-in the account's copies are brought into this browser.
  Newest wins per document, using the time each copy was last changed.
*/

export const DOC_PREFIX = "trader-os:";
const META_KEY = "traderos.docs.meta.v1";
/** Window event fired after a document was replaced by the account's copy. detail = key. */
export const DOC_UPDATED_EVENT = "traderos:doc-updated";

type Sink = (key: string, value: unknown | null) => void;
let sink: Sink | null = null;

/** Called by saveLocal / removeLocal. value null means the document was cleared. */
export function noteDocChange(key: string, value: unknown | null) {
  if (!key.startsWith(DOC_PREFIX)) return;
  setMeta(key, new Date().toISOString());
  sink?.(key, value);
}

function readMeta(): Record<string, string> {
  try {
    const v = JSON.parse(window.localStorage.getItem(META_KEY) ?? "{}");
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}
function setMeta(key: string, at: string) {
  try {
    if (typeof window === "undefined") return;
    const m = readMeta();
    m[key] = at;
    window.localStorage.setItem(META_KEY, JSON.stringify(m));
  } catch {}
}

function localDocKeys(): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(DOC_PREFIX)) out.push(k);
    }
  } catch {}
  return out;
}

function readLocal(key: string): unknown | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Remove every saved widget document from this browser (used on sign-out). */
export function clearLocalDocs() {
  try {
    for (const k of localDocKeys()) window.localStorage.removeItem(k);
    window.localStorage.removeItem(META_KEY);
  } catch {}
}

type DocRow = { key: string; value: unknown | null; updated_at: string };

/** Start syncing documents for one user. Returns flush and stop functions. */
export function startDocSync(supabase: SupabaseClient, userId: string) {
  const pending = new Map<string, { value: unknown | null; at: string }>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let backoff = 2000;
  let stopped = false;

  async function pushPending(): Promise<boolean> {
    if (!pending.size) return true;
    const rows = [...pending.entries()].map(([key, p]) => ({ user_id: userId, key, value: p.value, updated_at: p.at }));
    const { error } = await supabase.from("user_documents").upsert(rows, { onConflict: "user_id,key" });
    if (error) {
      schedule(backoff);
      backoff = Math.min(60_000, backoff * 2);
      return false;
    }
    rows.forEach((r) => {
      if (pending.get(r.key)?.at === r.updated_at) pending.delete(r.key);
    });
    backoff = 2000;
    return true;
  }
  function schedule(ms = 1500) {
    if (stopped) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void pushPending();
    }, ms);
  }

  sink = (key, value) => {
    pending.set(key, { value, at: new Date().toISOString() });
    schedule();
  };

  // Initial merge: newest copy of each document wins.
  void (async () => {
    const { data, error } = await supabase.from("user_documents").select("key, value, updated_at").eq("user_id", userId);
    if (error || stopped) return;
    const meta = readMeta();
    const remote = new Map((data as DocRow[]).map((r) => [r.key, r]));
    for (const [key, r] of remote) {
      const localAt = meta[key];
      if (!localAt || Date.parse(r.updated_at) > Date.parse(localAt)) {
        try {
          if (r.value === null) window.localStorage.removeItem(key);
          else window.localStorage.setItem(key, JSON.stringify(r.value));
        } catch {}
        setMeta(key, r.updated_at);
        window.dispatchEvent(new CustomEvent(DOC_UPDATED_EVENT, { detail: key }));
      }
    }
    for (const key of localDocKeys()) {
      const r = remote.get(key);
      const at = meta[key] ?? new Date(0).toISOString();
      if (!r || Date.parse(at) > Date.parse(r.updated_at)) pending.set(key, { value: readLocal(key), at: meta[key] ?? new Date().toISOString() });
    }
    // Documents cleared here while offline: their meta time is newer than the account's copy.
    for (const [key, at] of Object.entries(meta)) {
      const r = remote.get(key);
      if (readLocal(key) === null && r && r.value !== null && Date.parse(at) > Date.parse(r.updated_at)) pending.set(key, { value: null, at });
    }
    if (pending.size) void pushPending();
  })();

  const onOnline = () => pending.size && void pushPending();
  window.addEventListener("online", onOnline);

  return {
    flush: () => pushPending(),
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("online", onOnline);
      sink = null;
    },
  };
}
