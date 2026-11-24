import type { Metadata } from "next";
import { Database, KeyRound, ShieldCheck } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { DataBadge } from "@/components/ui/data-badge";
import { DATA_SOURCE_META, type DataSource } from "@/lib/data-source";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/cn";
import { AcademyStorageSettings } from "@/components/academy/reset-progress";

export const metadata: Metadata = { title: "Settings" };

const SOURCES: DataSource[] = ["live", "delayed", "simulated", "sample", "computed", "none"];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <section>
        <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-fg-muted">Account, connections and how data is labelled.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Account and database" hint="Sign-in and saved progress use Supabase.">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 size-4 text-fg-subtle" strokeWidth={1.75} />
            <div className="text-[13px]">
              <div className="flex items-center gap-2">
                <span
                  className={cn("size-1.5 rounded-full", isSupabaseConfigured ? "bg-up" : "bg-fg-subtle")}
                  aria-hidden
                />
                {isSupabaseConfigured ? "Supabase keys found" : "Supabase not connected yet"}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                {isSupabaseConfigured
                  ? "Accounts are on. When you are signed in, Academy progress, reflections and saved plans sync to your account; use the menu at the top right to sign out."
                  : "The app runs in guest mode: Academy progress is saved in this browser only. To add accounts, follow the Supabase steps in the README (copy .env.example to .env.local, add the project URL and anon key, run the migrations)."}
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Safety" hint="What Trader OS will and will not do.">
          <ul className="space-y-2 text-[13px] text-fg-muted">
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-up" strokeWidth={1.75} />Never connects to a broker or places real orders.</li>
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-up" strokeWidth={1.75} />Your data is only readable by your account (Row Level Security).</li>
            <li className="flex gap-2"><KeyRound className="mt-0.5 size-3.5 shrink-0 text-up" strokeWidth={1.75} />Secret API keys live on the server and are never sent to your browser.</li>
          </ul>
        </Panel>
      </div>

      <Panel title="Academy progress" hint="Where your lessons, quiz attempts and reflections are kept.">
        <AcademyStorageSettings />
      </Panel>

      <Panel title="Data labels" hint="Every number in the app carries one of these, so you always know what you are looking at.">
        <ul className="divide-y divide-line">
          {SOURCES.map((s) => (
            <li key={s} className="flex flex-col gap-1.5 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
              <span className="w-32 shrink-0"><DataBadge source={s} /></span>
              <span className="text-[13px] text-fg-muted">{DATA_SOURCE_META[s].description}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
