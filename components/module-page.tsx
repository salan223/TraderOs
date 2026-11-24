import { ArrowRight, Check, Construction } from "lucide-react";
import { NAV } from "@/lib/nav";
import { Panel } from "@/components/ui/panel";
import { LinkButton } from "@/components/ui/button";

/** Placeholder for a module that is built in a later phase. States plainly what it will do. */
export function ModulePage({ href, features, principle }: { href: string; features: string[]; principle: string }) {
  const item = NAV.find((n) => n.href === href)!;
  const Icon = item.icon;
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <section className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-panel text-accent-strong">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">{item.label}</h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-line-strong px-2 py-0.5 text-[11px] text-fg-muted">
              <Construction className="size-3" strokeWidth={1.75} /> Built in phase {item.phase}
            </span>
          </div>
          <p className="mt-1 text-sm text-fg-muted">{item.purpose}</p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-5">
        <Panel title="What this section will do" className="md:col-span-3">
          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex gap-2.5 text-[13px] text-fg-muted">
                <Check className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" strokeWidth={2} />
                {f}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Guiding principle" className="md:col-span-2">
          <p className="text-sm leading-relaxed text-fg-muted">{principle}</p>
          <div className="mt-4">
            <LinkButton href="/dashboard" variant="ghost" className="-ml-3">
              Back to dashboard <ArrowRight className="size-3.5" />
            </LinkButton>
          </div>
        </Panel>
      </div>
    </div>
  );
}
