/** Hash a string to 32 bits: FNV-1a, then a murmur3-style finalizer so nearby seeds ("…:1", "…:2") diverge fully. */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** mulberry32: small, well-distributed PRNG. Returns floats in [0, 1). */
function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fisherYates<T>(items: readonly T[], seed: string): T[] {
  const out = [...items];
  const rand = mulberry32(hashSeed(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Seeded shuffle: same seed, same order. Any order is possible, including the original. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  return fisherYates(items, seed);
}

/** Deterministic shuffle (same output on server and client, so no hydration mismatch). Never returns the original order for 2+ items. */
export function deterministicShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = fisherYates(items, seed);
  if (out.length > 1 && out.every((v, i) => v === items[i])) out.push(out.shift()!);
  return out;
}
/** Parse a number typed by a person: accepts "1,200", "$600", "2%", "−1" (Unicode minus), " +2 ". */
export function parseTypedNumber(input: string): number | null {
  const s = input.trim().replace(/[−–]/g, "-").replace(/[$€£%\s]/g, "").replace(/,(?=\d{3}(\D|$))/g, "");
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Forgiving parser for the widgets' number boxes (not for exercise answers,
 * which use the stricter parseTypedNumber). On top of what parseTypedNumber
 * accepts, it reads a comma as a decimal separator when it cannot be a
 * thousands separator ("12,5" → 12.5, "1,000" → 1000) and accepts
 * scientific notation ("1e3" → 1000). Returns null for anything else.
 */
export function parseFieldNumber(input: string): number | null {
  let s = input.trim().replace(/[−–]/g, "-").replace(/[$€£%\s_]/g, "");
  if (s === "") return null;
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d*)?$/.test(s)) s = s.replace(/,/g, "");
  else if (/^[+-]?\d*,\d+$/.test(s)) s = s.replace(",", ".");
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
