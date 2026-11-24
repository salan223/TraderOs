"use client";

import { useEffect, useState } from "react";

/** Current time, updated every `intervalMs`. Null until mounted (avoids server/client mismatch). */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
