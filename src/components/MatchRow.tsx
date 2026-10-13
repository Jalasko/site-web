import type { MatchItem, Team } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { TeamBadge } from "./ui";
import Link from "next/link";

function Side({ slug, teams, align, win }: { slug: string; teams: Record<string, Team>; align: "left" | "right"; win?: boolean }) {
  const t = teams[slug];
  const name = slug === "TBD" ? "À déterminer" : (t?.name ?? slug);
  const content = (
    <span className={cn("flex min-w-0 items-center gap-2", align === "right" && "flex-row-reverse text-right")}>
      <TeamBadge team={t} size={32} />
      <span className={cn("truncate font-semibold", win === false && "text-muted")}>{name}</span>
    </span>
  );
  return t ? (
    <Link href={`/esport/equipes/${t.slug}`} className="min-w-0 transition hover:text-accent">
      {content}
    </Link>
  ) : (
    content
  );
}

export function MatchRow({ match, teams }: { match: MatchItem; teams: Record<string, Team> }) {
  const done = match.status === "terminé";
  const live = match.status === "en direct";
  const aWin = done && (match.scoreA ?? 0) > (match.scoreB ?? 0);
  const bWin = done && (match.scoreB ?? 0) > (match.scoreA ?? 0);
  return (
    <div className="card card-hover px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] uppercase tracking-wider text-muted">
        <span className="truncate">
          {match.event} · {match.stage}
        </span>
        {live ? (
          <span className="flex items-center gap-1 font-bold text-accent">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> En direct
          </span>
        ) : (
          <time dateTime={match.date}>{formatDateTime(match.date)}</time>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Side slug={match.teamA} teams={teams} align="left" win={done ? aWin : undefined} />
        <div className="text-center font-display text-2xl tabular-nums">
          {done || live ? (
            <>
              <span className={cn(aWin && "text-accent")}>{match.scoreA}</span>
              <span className="mx-1 text-muted">:</span>
              <span className={cn(bWin && "text-accent")}>{match.scoreB}</span>
            </>
          ) : (
            <span className="text-base text-muted">BO{match.bestOf}</span>
          )}
        </div>
        <Side slug={match.teamB} teams={teams} align="right" win={done ? bWin : undefined} />
      </div>
      {match.maps && match.maps.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {match.maps.map((m, i) => (
            <span key={i} className="bg-surface-2 px-2 py-0.5 text-[11px] tabular-nums text-muted">
              {m.map} {m.scoreA}-{m.scoreB}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
