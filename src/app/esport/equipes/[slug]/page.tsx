import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatches, getPlayers, getSite, getTeam, getTeamMap, getTeams, getTournaments } from "@/lib/data";
import { countryName, num, REGION_LABELS } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { MatchRow } from "@/components/MatchRow";
import { Flag, PlayerAvatar, RoleBadge, StatTile, TeamBadge } from "@/components/ui";
import { DataNotice } from "@/components/DataNotice";
import { TrophyIcon } from "@/components/Icons";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getTeams()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = await getTeam((await params).slug);
  if (!t) return { title: "Équipe introuvable" };
  return { title: `${t.name} — roster, palmarès et résultats`, description: `${t.name} (${REGION_LABELS[t.region]}) : effectif, palmarès, résultats récents et classement VCT.` };
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [team, players, teams, matches, tournaments, site] = await Promise.all([getTeam(slug), getPlayers(), getTeamMap(), getMatches(), getTournaments(), getSite()]);
  if (!team) notFound();
  const roster = players.filter((p) => p.team === slug);
  const teamMatches = matches.filter((m) => m.teamA === slug || m.teamB === slug).sort((a, b) => b.date.localeCompare(a.date));
  const regionRank = Object.values(teams).filter((t) => t.region === team.region).sort((a, b) => b.points - a.points).findIndex((t) => t.slug === slug) + 1;
  const titles = tournaments.filter((t) => t.winner === slug);
  const avgRating = roster.length ? roster.reduce((s, p) => s + p.stats.rating, 0) / roster.length : 0;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, ${team.color}40, transparent 60%)` }} />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="container-x relative flex flex-wrap items-center gap-8 py-12">
          <TeamBadge team={team} size={140} />
          <div className="flex-1">
            <nav className="label mb-3" aria-label="Fil d'Ariane">
              <Link href="/esport" className="hover:text-accent">Esport</Link> / <span className="text-fg">{team.name}</span>
            </nav>
            <p className="label flex items-center gap-2 text-accent">
              {REGION_LABELS[team.region]} · <Flag code={team.country} /> {countryName(team.country)}
            </p>
            <h1 className="h-display text-7xl md:text-8xl">{team.name}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <FavoriteButton withLabel fav={{ type: "équipe", id: slug, name: team.name, href: `/esport/equipes/${slug}`, subtitle: REGION_LABELS[team.region] }} />
              {team.socials?.x && <a href={team.socials.x} target="_blank" rel="noopener noreferrer" className="btn-ghost">X / Twitter</a>}
              {team.socials?.website && <a href={team.socials.website} target="_blank" rel="noopener noreferrer" className="btn-ghost">Site officiel</a>}
            </div>
          </div>
        </div>
      </section>

      <div className="container-x space-y-12 py-10">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label={`Classement ${REGION_LABELS[team.region]}`} value={`#${regionRank}`} highlight sub={`${team.points} points`} />
          <StatTile label="Fondée en" value={team.founded ?? "—"} />
          <StatTile label="Coach" value={<span className="text-2xl">{team.coach ?? "—"}</span>} />
          <StatTile label="Rating moyen" value={roster.length ? num(avgRating) : "—"} />
        </section>

        <section>
          <h2 className="h-display mb-4 text-3xl">Effectif</h2>
          {roster.length === 0 ? (
            <p className="text-muted">Aucun joueur enregistré pour cette équipe.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {roster.map((p) => (
                <li key={p.slug}>
                  <Link href={`/joueurs/${p.slug}`} className="card card-hover clip-corner group flex flex-col items-center p-5 text-center">
                    <PlayerAvatar ign={p.ign} photo={p.photo} color={team.color} size={88} className="clip-corner" />
                    <p className="h-display mt-3 text-3xl transition group-hover:text-accent">{p.ign}</p>
                    <p className="flex items-center gap-1 text-xs text-muted"><Flag code={p.country} /> {p.realName}</p>
                    <div className="mt-2"><RoleBadge role={p.role} /></div>
                    <p className="mt-2 text-sm tabular-nums text-muted">Rating {num(p.stats.rating)} · ACS {p.stats.acs.toFixed(0)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="h-display mb-4 text-3xl">Palmarès</h2>
            <ul className="space-y-2">
              {[...team.achievements, ...titles.filter((t) => !team.achievements.some((a) => a.title === t.name)).map((t) => ({ title: t.name, year: Number(t.end.slice(0, 4)), placement: "1er" }))]
                .sort((a, b) => b.year - a.year)
                .map((a) => (
                  <li key={`${a.title}-${a.year}`} className="card flex items-center gap-3 p-3">
                    <TrophyIcon className={a.placement.startsWith("1") ? "text-gold" : "text-muted"} />
                    <span className="flex-1 font-semibold">{a.title}</span>
                    <span className="text-sm text-muted">{a.year} · {a.placement}</span>
                  </li>
                ))}
              {team.achievements.length === 0 && titles.length === 0 && <li className="text-muted">Aucun titre majeur pour le moment.</li>}
            </ul>
          </div>
          <div>
            <h2 className="h-display mb-4 text-3xl">Résultats récents</h2>
            <div className="space-y-3">
              {teamMatches.length === 0 && <p className="text-muted">Aucun match récent enregistré.</p>}
              {teamMatches.slice(0, 6).map((m) => <MatchRow key={m.id} match={m} teams={teams} />)}
            </div>
          </div>
        </section>
        <DataNotice date={site.updatedAt.teams} />
      </div>
    </>
  );
}
