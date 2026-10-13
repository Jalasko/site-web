"use client";

import Link from "next/link";
import { useState } from "react";
import type { AgentLite } from "@/lib/agents";
import type { Tier } from "@/lib/types";
import { cn, slugify, TIERS } from "@/lib/utils";
import { TierBadge } from "./ui";

type Lists = Record<string, Record<Tier, string[]>>;

export function AgentTierList({ global, byRank, byMap, agents, mapNames }: { global: Record<Tier, string[]>; byRank: Lists; byMap: Lists; agents: AgentLite[]; mapNames: Record<string, string> }) {
  const [mode, setMode] = useState<"global" | "rang" | "carte">("global");
  const [rank, setRank] = useState(Object.keys(byRank)[0]);
  const [map, setMap] = useState(Object.keys(byMap)[0]);
  const bySlug = Object.fromEntries(agents.map((a) => [a.slug, a]));
  const lists = mode === "global" ? global : mode === "rang" ? byRank[rank] : byMap[map];

  return (
    <div>
      <div className="glass mb-6 flex flex-wrap items-center gap-3 p-3">
        {(["global", "rang", "carte"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={cn("chip transition", mode === m ? "border-accent bg-accent text-white" : "hover:border-accent")} aria-pressed={mode === m}>
            {m === "global" ? "Global" : m === "rang" ? "Par rang" : "Par carte"}
          </button>
        ))}
        {mode === "rang" && (
          <select className="input w-auto" value={rank} onChange={(e) => setRank(e.target.value)} aria-label="Rang">
            {Object.keys(byRank).map((r) => <option key={r}>{r}</option>)}
          </select>
        )}
        {mode === "carte" && (
          <select className="input w-auto" value={map} onChange={(e) => setMap(e.target.value)} aria-label="Carte">
            {Object.keys(byMap).map((m) => <option key={m} value={m}>{mapNames[m] ?? m}</option>)}
          </select>
        )}
      </div>
      <div className="space-y-2">
        {TIERS.map((tier) => (
          <div key={tier} className="card flex items-stretch">
            <div className="flex w-16 shrink-0 items-center justify-center border-r border-line sm:w-20"><TierBadge tier={tier} size="lg" /></div>
            <ul className="flex min-h-20 flex-1 flex-wrap items-center gap-2 p-3">
              {(lists?.[tier] ?? []).map((name) => {
                const a = bySlug[slugify(name)];
                return (
                  <li key={name}>
                    <Link href={`/agents/${slugify(name)}`} className="group flex flex-col items-center gap-1" title={name}>
                      <span className="block h-14 w-14 overflow-hidden border border-line bg-surface-2 transition group-hover:-translate-y-0.5 group-hover:border-accent">
                        {a ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.icon} alt={name} className="h-full w-full" loading="lazy" />
                        ) : (
                          <span className="flex h-full items-center justify-center font-display">{name.slice(0, 2)}</span>
                        )}
                      </span>
                      <span className="text-[11px] font-medium">{name}</span>
                    </Link>
                  </li>
                );
              })}
              {(lists?.[tier] ?? []).length === 0 && <li className="text-sm text-muted">—</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
