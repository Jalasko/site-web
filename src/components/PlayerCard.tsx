import Link from "next/link";
import type { Player, Team } from "@/lib/types";
import { num } from "@/lib/utils";
import { FavoriteButton } from "./FavoriteButton";
import { Flag, PlayerAvatar, RoleBadge, TeamBadge } from "./ui";

export function PlayerCard({ player, team, agentIcons }: { player: Player; team?: Team; agentIcons: Record<string, string> }) {
  return (
    <Link href={`/joueurs/${player.slug}`} className="card card-hover clip-corner group block">
      <div className="relative">
        <div className="absolute inset-0 opacity-60" style={{ background: `linear-gradient(160deg, ${team?.color ?? "#FF4655"}55, transparent 70%)` }} />
        <div className="relative flex items-end gap-4 p-4">
          <PlayerAvatar ign={player.ign} photo={player.photo} color={team?.color} size={84} className="clip-corner" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Flag code={player.country} />
              <TeamBadge team={team} size={22} />
              <span className="truncate text-xs text-muted">{team?.name}</span>
            </div>
            <h3 className="h-display mt-1 truncate text-3xl transition group-hover:text-accent">{player.ign}</h3>
            <p className="truncate text-xs text-muted">{player.realName}</p>
          </div>
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton
            fav={{ type: "joueur", id: player.slug, name: player.ign, href: `/joueurs/${player.slug}`, subtitle: `${team?.name ?? ""} · ${player.role}` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3">
        <RoleBadge role={player.role} />
        <div className="flex -space-x-1">
          {player.mainAgents.slice(0, 3).map((a) =>
            agentIcons[a.agent] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={a.agent} src={agentIcons[a.agent]} alt={a.agent} title={a.agent} width={28} height={28} className="h-7 w-7 border border-line bg-surface-2" loading="lazy" />
            ) : (
              <span key={a.agent} className="chip px-1.5 py-0.5 text-[10px]">{a.agent}</span>
            )
          )}
        </div>
      </div>
      <dl className="grid grid-cols-3 border-t border-line text-center">
        {[
          ["Rating", num(player.stats.rating)],
          ["ACS", player.stats.acs.toFixed(0)],
          ["K/D", num(player.stats.kd)],
        ].map(([l, v]) => (
          <div key={l} className="py-2.5">
            <dt className="label text-[10px]">{l}</dt>
            <dd className="font-display text-xl tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}
