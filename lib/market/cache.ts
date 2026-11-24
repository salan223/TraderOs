import "server-only";

/**
 * A tiny in-memory cache shared by every visitor of this server.
 *
 * However many people (or browser tabs) ask for prices, the provider is asked
 * at most once per `ttlMs`, so a public endpoint cannot burn through a free
 * plan's quota. Concurrent requests share one in-flight fetch. When a refresh
 * fails, the last good value is kept and marked stale rather than dropped.
 *
 * Stored on globalThis so it survives hot reloads in development.
 */
type Entry<T> = { value?: T; fetchedAt: number; expiresAt: number; inflight?: Promise<T>; error?: string };

const store: Map<string, Entry<unknown>> =
  ((globalThis as Record<string, unknown>).__traderosMarketCache as Map<string, Entry<unknown>>) ??
  ((globalThis as Record<string, unknown>).__traderosMarketCache = new Map<string, Entry<unknown>>());

export type Cached<T> = { value?: T; fetchedAt: number | null; stale: boolean; error?: string };

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<Cached<T>> {
  const now = Date.now();
  let e = store.get(key) as Entry<T> | undefined;
  if (!e) {
    e = { fetchedAt: 0, expiresAt: 0 };
    store.set(key, e);
  }
  if (e.expiresAt > now && e.value !== undefined) {
    return { value: e.value, fetchedAt: e.fetchedAt, stale: false };
  }
  if (e.expiresAt > now && e.error) {
    // A recent failure: don't hammer the provider, wait out the TTL.
    return { value: e.value, fetchedAt: e.fetchedAt || null, stale: e.value !== undefined, error: e.error };
  }
  if (!e.inflight) {
    const entry = e;
    entry.inflight = load()
      .then((v) => {
        entry.value = v;
        entry.fetchedAt = Date.now();
        entry.expiresAt = entry.fetchedAt + ttlMs;
        entry.error = undefined;
        return v;
      })
      .catch((err: unknown) => {
        entry.error = err instanceof Error ? err.message : String(err);
        // Back off for the TTL (at least 30 s) after a failure.
        entry.expiresAt = Date.now() + Math.max(ttlMs, 30_000);
        throw err;
      })
      .finally(() => {
        entry.inflight = undefined;
      });
  }
  try {
    const v = await e.inflight!;
    return { value: v, fetchedAt: e.fetchedAt, stale: false };
  } catch {
    return { value: e.value, fetchedAt: e.fetchedAt || null, stale: e.value !== undefined, error: e.error };
  }
}

/** Fetch with a timeout, never using Next's data cache. */
export async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, cache: "no-store", signal: ctrl.signal });
  } catch (err) {
    if (ctrl.signal.aborted) throw new Error("The provider took too long to answer.");
    throw err;
  } finally {
    clearTimeout(t);
  }
}

/**
 * A simple per-visitor rate limit for the public API routes: at most `limit`
 * requests per `windowMs` from one IP address. Data is cached anyway, so this
 * only stops one client from flooding the server.
 */
const hits: Map<string, { count: number; resetAt: number }> =
  ((globalThis as Record<string, unknown>).__traderosRateLimit as Map<string, { count: number; resetAt: number }>) ??
  ((globalThis as Record<string, unknown>).__traderosRateLimit = new Map());

export function rateLimited(request: Request, bucket: string, limit = 30, windowMs = 60_000) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    return false;
  }
  h.count += 1;
  return h.count > limit;
}
