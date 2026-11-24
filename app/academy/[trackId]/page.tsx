import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";
import { TRACKS, getTrack, trackTitle } from "@/lib/academy/curriculum";
import { Panel } from "@/components/ui/panel";
import { TrackLessons, TrackStatusPanel } from "@/components/academy/overview";
import { SaveNotice } from "@/components/academy/status";

type Params = { trackId: string };


export function generateStaticParams(): Params[] {
  return TRACKS.map((t) => ({ trackId: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trackId } = await params;
  const track = getTrack(trackId);
  return track ? { title: track.title, description: track.summary } : {};
}

export default async function TrackPage({ params }: { params: Promise<Params> }) {
  const { trackId } = await params;
  const track = getTrack(trackId);
  if (!track) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-fg-subtle">
        <Link href="/academy" className="hover:text-fg">Academy</Link>
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-fg-muted" aria-current="page">Track {track.order}</span>
      </nav>
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{track.title}</h2>
          {track.status === "planned" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] text-fg-subtle">
              <Lock className="size-2.5" aria-hidden /> Not written yet
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-fg-muted">{track.summary}</p>
      </header>

      {track.status === "written" ? (
        <>
          <TrackStatusPanel trackId={track.id} />
          <p className="text-xs leading-relaxed text-fg-subtle">
            Lessons build on each other, so the recommended order is top to bottom. Within an unlocked track every lesson is open, so you can jump ahead or revisit any of them.
            The track is complete only when every lesson is complete and the track assessment is passed.
          </p>
          <TrackLessons trackId={track.id} />
          <SaveNotice />
        </>
      ) : (
        <Panel title="Planned outline" hint="These lessons are not written yet. Titles may change before they are.">
          <ol className="space-y-2">
            {track.planned.map((title, i) => (
              <li key={title} className="flex items-center gap-3 text-[13px] text-fg-muted">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-dashed border-line-strong font-mono text-[11px] tabular text-fg-subtle">{i + 1}</span>
                <span className="flex-1">{title}</span>
                <span className="text-[10px] uppercase tracking-[0.06em] text-fg-subtle">Not written yet</span>
              </li>
            ))}
          </ol>
          {track.prerequisites.length > 0 && (
            <p className="mt-4 text-xs text-fg-muted" data-prerequisites>
              When it is written, this track will unlock after you complete {track.prerequisites.map((id, i) => (
                <span key={id}>{i > 0 && (i === track.prerequisites.length - 1 ? " and " : ", ")}<Link href={`/academy/${id}`} className="text-accent-strong hover:underline">{trackTitle(id)}</Link></span>
              ))}.
            </p>
          )}
          <p className="mt-4 text-xs text-fg-subtle">
            Start with <Link href="/academy/market-foundations" className="text-accent-strong hover:underline">Market Foundations</Link>, which is fully written.
          </p>
        </Panel>
      )}
    </div>
  );
}
