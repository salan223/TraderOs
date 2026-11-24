import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { TRACKS, getTrack } from "@/lib/academy/curriculum";
import { getAssessment } from "@/lib/academy/assessments";
import { AssessmentFlow } from "@/components/academy/assessment-flow";

type Params = { trackId: string };

export function generateStaticParams(): Params[] {
  return TRACKS.filter((t) => getAssessment(t.id)).map((t) => ({ trackId: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { trackId } = await params;
  const track = getTrack(trackId);
  return track && getAssessment(trackId) ? { title: `${track.title} assessment`, description: `Track assessment for ${track.title}.` } : {};
}

export default async function AssessmentPage({ params }: { params: Promise<Params> }) {
  const { trackId } = await params;
  const track = getTrack(trackId);
  if (!track || !getAssessment(trackId)) notFound();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-fg-subtle">
        <Link href="/academy" className="hover:text-fg">Academy</Link>
        <ChevronRight className="size-3" aria-hidden />
        <Link href={`/academy/${track.id}`} className="hover:text-fg">{track.title}</Link>
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-fg-muted" aria-current="page">Assessment</span>
      </nav>
      <header>
        <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">Track {track.order} · Track assessment</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{track.title}: track assessment</h2>
        <p className="mt-1 max-w-2xl text-sm text-fg-muted">
          Passing completes the track and unlocks the tracks that depend on it. Clicking through lessons is not enough: this checks that the key ideas, the calculations and the safety rules have stuck.
        </p>
      </header>
      <AssessmentFlow trackId={track.id} />
    </div>
  );
}
