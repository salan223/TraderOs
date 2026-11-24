import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GlossaryBrowser } from "@/components/academy/glossary-browser";
import { GLOSSARY_LIST } from "@/lib/academy/glossary";

export const metadata: Metadata = { title: "Glossary", description: "Every trading term used in Trader OS, in plain English." };

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-fg-subtle">
        <Link href="/academy" className="hover:text-fg">Academy</Link>
        <ChevronRight className="size-3" aria-hidden />
        <span className="text-fg-muted" aria-current="page">Glossary</span>
      </nav>
      <header>
        <h2 className="text-xl font-semibold tracking-tight">Glossary</h2>
        <p className="mt-1 text-sm text-fg-muted">
          {GLOSSARY_LIST.length} terms in plain English. A term counts as learned once you complete the lesson that introduces it.
        </p>
      </header>
      <GlossaryBrowser />
    </div>
  );
}
