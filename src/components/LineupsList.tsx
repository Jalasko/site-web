"use client";

import { useState } from "react";
import type { Lineup } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmptyState } from "./ui";

export function LineupsList({ lineups, agentIcons }: { lineups: Lineup[]; agentIcons: Record<string, string> }) {
  const [agent, setAgent] = useState("");
  const [side, setSide] = useState("");
  const agents = [...new Set(lineups.map((l) => l.agent))].sort();
  const list = lineups.filter((l) => (!agent || l.agent === agent) && (!side || l.side === side));
  if (!lineups.length) return <EmptyState>Aucun lineup pour cette carte pour le moment.</EmptyState>;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {["", ...agents].map((a) => (
          <button key={a || "all"} onClick={() => setAgent(a)} className={cn("chip transition", agent === a ? "border-accent bg-accent text-white" : "hover:border-accent")}>
            {a || "Tous les agents"}
          </button>
        ))}
        <span className="mx-1 w-px bg-line" />
        {["", "Attaque", "Défense"].map((s) => (
          <button key={s || "both"} onClick={() => setSide(s)} className={cn("chip transition", side === s ? "border-accent bg-accent text-white" : "hover:border-accent")}>
            {s || "Les deux côtés"}
          </button>
        ))}
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {list.map((l) => (
          <li key={l.id} className="card card-hover flex gap-4 p-5">
            {agentIcons[l.agent] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agentIcons[l.agent]} alt={l.agent} className="h-12 w-12 shrink-0 bg-surface-2" loading="lazy" />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-surface-2 font-display">{l.agent.slice(0, 2)}</span>
            )}
            <div>
              <div className="mb-1 flex flex-wrap gap-2 text-[11px] uppercase tracking-wider text-muted">
                <span>{l.agent}</span>·<span className={l.side === "Attaque" ? "text-accent" : "text-teal"}>{l.side}</span>·<span>Site {l.site}</span>
              </div>
              <h3 className="font-semibold">{l.title}</h3>
              <p className="text-xs text-accent">{l.ability}</p>
              <p className="mt-2 text-sm text-muted">{l.description}</p>
              {l.video && <a href={l.video} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline hover:text-accent">Voir la vidéo</a>}
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && <EmptyState>Aucun lineup pour ce filtre.</EmptyState>}
    </div>
  );
}
