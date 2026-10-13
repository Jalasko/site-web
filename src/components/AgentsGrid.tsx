"use client";

import Link from "next/link";
import { useState } from "react";
import type { AgentLite } from "@/lib/agents";
import type { Tier } from "@/lib/types";
import { cn, ROLE_COLORS, ROLES } from "@/lib/utils";
import { FavoriteButton } from "./FavoriteButton";
import { TierBadge } from "./ui";

export function AgentsGrid({ agents, tiers, rates }: { agents: AgentLite[]; tiers: Record<string, Tier | undefined>; rates: Record<string, { pick: number; win: number } | undefined> }) {
  const [role, setRole] = useState("");
  const list = agents.filter((a) => !role || a.role === role);
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrer par rôle">
        {["", ...ROLES].map((r) => (
          <button
            key={r || "all"}
            onClick={() => setRole(r)}
            className={cn("chip transition", role === r ? "border-accent bg-accent text-white" : "hover:border-accent")}
            aria-pressed={role === r}
          >
            {r || "Tous"} <span className="opacity-60">{r ? agents.filter((a) => a.role === r).length : agents.length}</span>
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {list.map((a) => (
          <li key={a.slug}>
            <Link href={`/agents/${a.slug}`} className="card card-hover clip-corner group block">
              <div className="relative h-56 overflow-hidden" style={{ background: `linear-gradient(180deg, ${ROLE_COLORS[a.role] ?? "#FF4655"}33, transparent)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.portrait ?? a.icon} alt={a.name} loading="lazy" className="absolute inset-x-0 top-0 mx-auto h-[130%] w-auto max-w-none object-cover object-top transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                <div className="absolute left-2 top-2">{tiers[a.slug] && <TierBadge tier={tiers[a.slug]!} size="sm" />}</div>
                <div className="absolute right-2 top-2">
                  <FavoriteButton fav={{ type: "agent", id: a.slug, name: a.name, href: `/agents/${a.slug}`, image: a.icon, subtitle: a.role }} />
                </div>
              </div>
              <div className="relative -mt-8 px-4 pb-4">
                <h3 className="h-display text-3xl transition group-hover:text-accent">{a.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: ROLE_COLORS[a.role] }}>{a.role}</p>
                {rates[a.slug] && (
                  <p className="mt-1 text-xs text-muted">
                    Pick {rates[a.slug]!.pick.toFixed(1).replace(".", ",")} % · WR {rates[a.slug]!.win.toFixed(1).replace(".", ",")} %
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
