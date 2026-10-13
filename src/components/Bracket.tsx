import type { BracketMatch, Team } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TeamBadge } from "./ui";
import Link from "next/link";

function Line({ slug, score, win, teams }: { slug: string; score?: number; win: boolean; teams: Record<string, Team> }) {
  const t = teams[slug];
  const name = slug === "TBD" ? "À déterminer" : (t?.name ?? slug);
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2", win && "bg-accent/10")}>
      <TeamBadge team={t} size={22} />
      {t ? (
        <Link href={`/esport/equipes/${t.slug}`} className={cn("flex-1 truncate text-sm hover:text-accent", win ? "font-bold" : "text-fg/80")}>{name}</Link>
      ) : (
        <span className="flex-1 truncate text-sm text-muted">{name}</span>
      )}
      <span className={cn("w-5 text-right font-display text-lg tabular-nums", win ? "text-accent" : "text-muted")}>{score ?? "–"}</span>
    </div>
  );
}

export function Bracket({ rounds, teams }: { rounds: { name: string; matches: BracketMatch[] }[]; teams: Record<string, Team> }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-6">
        {rounds.map((r) => (
          <div key={r.name} className="flex w-60 flex-col">
            <p className="label mb-3 text-center">{r.name}</p>
            <div className="flex flex-1 flex-col justify-around gap-4">
              {r.matches.map((m, i) => {
                const done = m.scoreA !== undefined && m.scoreB !== undefined;
                return (
                  <div key={i} className="card divide-y divide-line">
                    <Line slug={m.teamA} score={m.scoreA} win={done && m.scoreA! > m.scoreB!} teams={teams} />
                    <Line slug={m.teamB} score={m.scoreB} win={done && m.scoreB! > m.scoreA!} teams={teams} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
