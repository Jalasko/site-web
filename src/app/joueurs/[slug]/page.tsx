import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer, getPlayers, getSite, getTeamMap } from "@/lib/data";
import { byName } from "@/lib/lookup";
import { getAgents } from "@/lib/valorant-api";
import { countryName, formatDate, num, ROLE_COLORS, slugify } from "@/lib/utils";
import { CopyButton } from "@/components/CopyButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { TrophyIcon, TwitchIcon, XIcon, YoutubeIcon } from "@/components/Icons";
import { Flag, PlayerAvatar, RateBar, RoleBadge, StatTile, TeamBadge, TeamName, UpdatedAt } from "@/components/ui";
import { DataNotice } from "@/components/DataNotice";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPlayers()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPlayer((await params).slug);
  if (!p) return { title: "Joueur introuvable" };
  return {
    title: `${p.ign} (${p.realName}) — stats, agents et réglages`,
    description: `Profil de ${p.ign} : rating ${num(p.stats.rating)}, ACS ${p.stats.acs.toFixed(0)}, K/D ${num(p.stats.kd)}, agents les plus joués, carrière, palmarès et réticule.`,
  };
}

const MONTHS = (ym: string) => formatDate(`${ym}-01`, { month: "short", year: "numeric" });

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [player, teams, agents, site] = await Promise.all([getPlayer(slug), getTeamMap(), getAgents(), getSite()]);
  if (!player) notFound();
  const team = teams[player.team];
  const s = player.stats;
  const edpi = player.settings ? Math.round(player.settings.dpi * player.settings.sens) : null;
  const socials = [
    player.socials.twitch && { href: player.socials.twitch, label: "Twitch", Icon: TwitchIcon },
    player.socials.x && { href: player.socials.x, label: "X", Icon: XIcon },
    player.socials.youtube && { href: player.socials.youtube, label: "YouTube", Icon: YoutubeIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof TwitchIcon }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.realName,
    alternateName: player.ign,
    nationality: countryName(player.country),
    memberOf: team ? { "@type": "SportsTeam", name: team.name } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, ${team?.color ?? "#FF4655"}33, transparent 60%)` }} />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="container-x relative grid gap-8 py-12 md:grid-cols-[auto_1fr_auto] md:items-end">
          <PlayerAvatar ign={player.ign} photo={player.photo} color={team?.color} size={200} className="clip-corner" />
          <div>
            <nav className="label mb-3" aria-label="Fil d'Ariane">
              <Link href="/joueurs" className="hover:text-accent">Joueurs</Link> / <span className="text-fg">{player.ign}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <Flag code={player.country} />
              <span className="text-sm text-muted">{countryName(player.country)}</span>
              <RoleBadge role={player.role} />
            </div>
            <h1 className="h-display mt-2 text-7xl md:text-8xl">{player.ign}</h1>
            <p className="text-lg text-muted">{player.realName}</p>
            {team && (
              <Link href={`/esport/equipes/${team.slug}`} className="mt-3 inline-flex items-center gap-2 font-semibold transition hover:text-accent">
                <TeamBadge team={team} size={32} /> {team.name}
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
            <FavoriteButton withLabel fav={{ type: "joueur", id: player.slug, name: player.ign, href: `/joueurs/${player.slug}`, subtitle: `${team?.name ?? ""} · ${player.role}` }} />
            <Link href={`/joueurs/comparer?a=${player.slug}`} className="btn-ghost">Comparer</Link>
            <div className="flex gap-1">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="glass p-2 transition hover:text-accent" aria-label={`${player.ign} sur ${label}`}>
                  <Icon width={18} height={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-x space-y-12 py-10">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h2 className="h-display text-3xl">Statistiques publiques</h2>
            <UpdatedAt date={site.updatedAt.players} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <StatTile label="Rating" value={num(s.rating)} highlight />
            <StatTile label="ACS" value={s.acs.toFixed(0)} sub="Score de combat moyen" />
            <StatTile label="K/D" value={num(s.kd)} />
            <StatTile label="ADR" value={s.adr.toFixed(0)} sub="Dégâts / round" />
            <StatTile label="KAST" value={`${s.kast} %`} />
            <StatTile label="HS %" value={`${s.hs} %`} />
            <StatTile label="First kills" value={num(s.fk, 1)} sub="par carte" />
            <StatTile label="First deaths" value={s.fd !== undefined ? num(s.fd, 1) : "—"} sub="par carte" />
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="card clip-corner p-6">
            <h2 className="h-display mb-4 text-3xl">Agents les plus joués</h2>
            <ul className="space-y-4">
              {player.mainAgents.map((a) => {
                const api = byName(agents, a.agent);
                return (
                  <li key={a.agent} className="flex items-center gap-3">
                    <Link href={`/agents/${slugify(a.agent)}`} className="shrink-0">
                      {api ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={api.displayIconSmall} alt={a.agent} width={44} height={44} className="h-11 w-11 border border-line bg-surface-2" />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center bg-surface-2 font-display">{a.agent.slice(0, 2)}</span>
                      )}
                    </Link>
                    <div className="flex-1">
                      <RateBar value={a.pickRate} label={a.agent} color={ROLE_COLORS[player.role] ?? "#FF4655"} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted">Taux de sélection sur les cartes jouées en compétition officielle.</p>
          </section>

          <section className="card clip-corner p-6">
            <h2 className="h-display mb-4 text-3xl">Carrière</h2>
            <ol className="relative space-y-5 border-l border-line pl-6">
              {[...player.career].reverse().map((c, i) => (
                <li key={`${c.team}-${c.from}`} className="relative">
                  <span className={`absolute -left-[31px] top-1 h-3 w-3 border-2 ${i === 0 ? "border-accent bg-accent" : "border-line bg-surface"}`} />
                  <TeamName slug={c.team} teams={teams} />
                  <p className="text-sm text-muted">
                    {MONTHS(c.from)} — {c.to ? MONTHS(c.to) : "aujourd'hui"}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section>
          <h2 className="h-display mb-4 text-3xl">Palmarès</h2>
          {player.achievements.length === 0 ? (
            <p className="text-muted">Aucun titre majeur pour le moment.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {player.achievements.map((a) => (
                <li key={`${a.title}-${a.year}`} className="card flex items-center gap-4 p-4">
                  <TrophyIcon width={28} height={28} className={a.placement.startsWith("1") ? "text-gold" : "text-muted"} />
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-muted">{a.year} · {a.placement}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="h-display mb-4 text-3xl">Matchs récents</h2>
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-surface-2 text-left">
                <tr className="label">
                  <th className="px-4 py-3">Date</th><th className="px-4 py-3">Adversaire</th><th className="px-4 py-3">Résultat</th>
                  <th className="px-4 py-3">Agent</th><th className="px-4 py-3 text-right">ACS</th><th className="px-4 py-3 text-right">K/D/A</th><th className="px-4 py-3">Compétition</th>
                </tr>
              </thead>
              <tbody>
                {player.recentMatches.map((m, i) => (
                  <tr key={i} className="border-t border-line transition hover:bg-surface">
                    <td className="px-4 py-3 text-muted">{formatDate(m.date, { day: "numeric", month: "short" })}</td>
                    <td className="px-4 py-3"><TeamName slug={m.opponent} teams={teams} /></td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${m.result === "V" ? "text-buff" : "text-nerf"}`}>{m.result === "V" ? "Victoire" : "Défaite"}</span> <span className="text-muted">{m.score}</span>
                    </td>
                    <td className="px-4 py-3">{m.agent}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{m.acs}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{m.kda}</td>
                    <td className="px-4 py-3 text-muted">{m.event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {player.settings && (
          <section className="card clip-corner p-6">
            <h2 className="h-display mb-4 text-3xl">Réglages & réticule</h2>
            <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
              <dl className="grid grid-cols-2 gap-3">
                <StatTile label="DPI" value={player.settings.dpi} />
                <StatTile label="Sensibilité" value={String(player.settings.sens).replace(".", ",")} />
                <StatTile label="eDPI" value={edpi ?? "—"} highlight />
                <StatTile label="Résolution" value={<span className="text-2xl">{player.settings.resolution ?? "—"}</span>} />
              </dl>
              <div>
                <p className="label mb-2">Code du réticule</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <code className="flex-1 overflow-x-auto whitespace-nowrap border border-line bg-surface-2 px-3 py-2.5 font-mono text-sm">{player.settings.crosshair}</code>
                  <CopyButton text={player.settings.crosshair} label="Copier le réticule" />
                </div>
                <p className="mt-3 text-sm text-muted">
                  Dans VALORANT : Paramètres → Réticule → icône d&apos;import, puis collez le code.{player.settings.mouse && <> Souris : {player.settings.mouse}.</>}
                </p>
              </div>
            </div>
          </section>
        )}

        <DataNotice date={site.updatedAt.players} />
      </div>
    </>
  );
}
