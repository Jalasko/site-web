import Link from "next/link";
import type { Team, Tournament } from "@/lib/types";
import { cn, formatDate, REGION_LABELS } from "@/lib/utils";
import { TeamBadge } from "./ui";
import { TrophyIcon } from "./Icons";

const TIER_STYLE: Record<string, string> = {
  Champions: "border-gold/60 text-gold",
  Masters: "border-accent/60 text-accent",
  "VCT Ligue": "border-teal/60 text-teal",
  Challengers: "text-muted",
};

export function TournamentCard({ t, teams }: { t: Tournament; teams: Record<string, Team> }) {
  const winner = t.winner ? teams[t.winner] : undefined;
  return (
    <Link href={`/esport/tournois/${t.slug}`} className="card card-hover clip-corner group flex flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("chip", TIER_STYLE[t.tier])}>{t.tier}</span>
        <span className="chip text-muted">{REGION_LABELS[t.region]}</span>
        {t.status === "en cours" && (
          <span className="chip border-accent bg-accent text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> En cours
          </span>
        )}
      </div>
      <h3 className="h-display mt-3 text-3xl transition group-hover:text-accent">{t.name}</h3>
      <p className="text-sm text-muted">
        {t.location} · {formatDate(t.start, { day: "numeric", month: "short" })} – {formatDate(t.end, { day: "numeric", month: "short", year: "numeric" })}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm">
        <span className="text-muted">{t.prizePool}</span>
        {winner ? (
          <span className="flex items-center gap-2 font-semibold">
            <TrophyIcon width={16} height={16} className="text-gold" />
            <TeamBadge team={winner} size={22} /> {winner.name}
          </span>
        ) : (
          <span className="text-muted">{t.teams.length} équipes</span>
        )}
      </div>
    </Link>
  );
}
