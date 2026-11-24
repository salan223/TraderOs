/**
 * Compatibility shim. The curriculum now lives in lib/academy/ (Phase 2).
 * Kept so older imports keep working.
 */
export { TRACKS, LESSONS, getLesson, getTrack } from "./academy/curriculum";
export type { Track, Lesson } from "./academy/types";
