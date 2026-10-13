import Link from "next/link";
import { getMatches, getMeta, getPatches, getPlayers, getSite, getTeamMap } from "@/lib/data";
import { byName } from "@/lib/lookup";
import { getAgents, getMaps, getWeapons } from "@/lib/valorant-api";
import { normalizeRole, num, pct, slugify } from "@/lib/utils";
import { SearchBox } from "@/components/SearchBox";
import { MatchRow } from "@/components/MatchRow";
import { Flag, PlayerAvatar, RoleBadge, SectionHeading, StatTile, TeamBadge, TierBadge, UpdatedAt } from "@/components/ui";
import { DataNotice } from "@/components/DataNotice";
import { ArrowIcon, TrophyIcon } from "@/components/Icons";

export const revalidate = 3600;

export default async function HomePage() {
  const [meta, matches, players, teams, site, patches, agents, weapons, maps] = await Promise.all([
    getMeta(), getMatches(), getPlayers(), getTeamMap(), getSite(), getPatches(), getAgents(), getWeapons(), getMaps(),
  ]);

  const topAgents = meta.agentTiers.global.S
    .map((name) => ({ name, rates: meta.agentRates[name], api: byName(agents, name) }))
    .sort((a, b) => (b.rates?.pick ?? 0) - (a.rates?.pick ?? 0))
    .slice(0, 3);
  const topWeapons = [...meta.weaponTiers].sort((a, b) => b.rankedPick - a.rankedPick).slice(0, 3).map((w) => ({ ...w, api: byName(weapons, w.weapon) }));
  const [topMapSlug, topMap] = Object.entries(meta.maps).sort((a, b) => b[1].playRate - a[1].playRate)[0];
  const topMapApi = maps.find((m) => slugify(m.displayName) === topMapSlug);

  const results = matches.filter((m) => m.status !== "à venir").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const upcoming = matches.filter((m) => m.status === "à venir").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const featured = players.find((p) => p.slug === site.featuredPlayer) ?? players.find((p) => p.featured) ?? players[0];
  const featuredTeam = teams[featured.team];
  const latestPatch = patches[0];

  return (
    <>
      {/* HERO */}
      <section className="relative -mt-16 overflow-hidden pt-16">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-40 top-0 h-full w-[60%] skew-x-[-18deg] bg-gradient-to-b from-accent/20 to-transparent" />
        <div className="pointer-events-none absolute right-[18%] top-0 h-full w-px skew-x-[-18deg] bg-accent/40" />
        <div className="container-x relative py-20 md:py-28">
          <p className="label animate-fade-up text-accent">Le hub VALORANT francophone</p>
          <h1 className="h-display mt-3 max-w-4xl animate-fade-up text-6xl sm:text-7xl md:text-8xl">
            Tout VALORANT.<br />
            <span className="text-accent">Un seul</span> endroit.
          </h1>
          <p className="mt-5 max-w-xl animate-fade-up text-lg text-muted">
            Joueurs pro, agents, armes, cartes, esport et méta : statistiques, tier lists, compositions et réglages des meilleurs joueurs du monde.
          </p>
          <div className="relative z-10 mt-8 max-w-2xl animate-fade-up">
            <SearchBox size="lg" />
          </div>
          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              [players.length, "Joueurs pro"],
              [agents.length || "—", "Agents"],
              [weapons.length || "—", "Armes"],
              [maps.length || "—", "Cartes"],
            ].map(([n, l]) => (
              <div key={String(l)} className="accent-line">
                <dt className="label">{l}</dt>
                <dd className="font-display text-4xl">{n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* MÉTA */}
      <section className="container-x py-12">
        <SectionHeading kicker={`Patch ${meta.patch}`} title="La méta actuelle" href="/agents/tier-list" linkLabel="Tier list complète" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card clip-corner p-5">
            <h3 className="label mb-4">Top 3 agents</h3>
            <ol className="space-y-3">
              {topAgents.map((a, i) => (
                <li key={a.name}>
                  <Link href={`/agents/${slugify(a.name)}`} className="group flex items-center gap-3">
                    <span className="w-6 font-display text-2xl text-muted">{i + 1}</span>
                    {a.api && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.api.displayIconSmall} alt="" width={48} height={48} className="h-12 w-12 bg-surface-2" />
                    )}
                    <span className="flex-1">
                      <span className="block font-semibold transition group-hover:text-accent">{a.name}</span>
                      <span className="text-xs text-muted">{a.api ? normalizeRole(a.api.role?.displayName) : ""} · {pct(a.rates?.pick ?? 0)} pick · {pct(a.rates?.win ?? 0)} WR</span>
                    </span>
                    <TierBadge tier="S" size="sm" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <div className="card clip-corner p-5">
            <h3 className="label mb-4">Top 3 armes</h3>
            <ol className="space-y-3">
              {topWeapons.map((w, i) => (
                <li key={w.weapon}>
                  <Link href={`/armes/${slugify(w.weapon)}`} className="group flex items-center gap-3">
                    <span className="w-6 font-display text-2xl text-muted">{i + 1}</span>
                    <span className="flex h-12 w-24 items-center justify-center bg-surface-2 px-1">
                      {w.api && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={w.api.displayIcon} alt="" className="max-h-9 w-full object-contain invert dark:invert-0" />
                      )}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold transition group-hover:text-accent">{w.weapon}</span>
                      <span className="text-xs text-muted">{pct(w.rankedPick)} en ranked · {pct(w.proPick)} en pro</span>
                    </span>
                    <TierBadge tier={w.tier} size="sm" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <Link href={`/cartes/${topMapSlug}`} className="card card-hover clip-corner group relative block min-h-56 p-5">
            {topMapApi && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={topMapApi.splash} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-500 group-hover:scale-105 group-hover:opacity-55" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
            <div className="relative flex h-full flex-col">
              <h3 className="label">Carte la plus jouée</h3>
              <p className="h-display mt-auto pt-16 text-5xl">{topMapApi?.displayName ?? topMapSlug}</p>
              <p className="text-sm text-muted">
                {pct(topMap.playRate)} des parties · Attaque {pct(topMap.attackWin)} / Défense {pct(topMap.defenseWin)}
              </p>
            </div>
          </Link>
        </div>
        <div className="mt-3"><UpdatedAt date={meta.updatedAt} /></div>
      </section>

      {/* ESPORT */}
      <section className="container-x py-12">
        <SectionHeading kicker="Esport" title="Résultats & matchs à venir" href="/esport" linkLabel="Calendrier" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="label mb-3">Derniers résultats</h3>
            <div className="space-y-3">{results.map((m) => <MatchRow key={m.id} match={m} teams={teams} />)}</div>
          </div>
          <div>
            <h3 className="label mb-3">Prochains matchs</h3>
            <div className="space-y-3">{upcoming.map((m) => <MatchRow key={m.id} match={m} teams={teams} />)}</div>
          </div>
        </div>
      </section>

      {/* JOUEUR DE LA SEMAINE */}
      <section className="container-x py-12">
        <SectionHeading kicker="À la une" title="Joueur de la semaine" href="/joueurs" linkLabel="Tous les joueurs" />
        <div className="card clip-corner relative grid gap-8 overflow-hidden p-6 md:grid-cols-[auto_1fr] md:p-10">
          <div className="pointer-events-none absolute -right-20 top-0 h-full w-1/3 skew-x-[-18deg]" style={{ background: `${featuredTeam?.color ?? "#FF4655"}22` }} />
          <PlayerAvatar ign={featured.ign} photo={featured.photo} color={featuredTeam?.color} size={180} className="clip-corner" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <Flag code={featured.country} />
              <TeamBadge team={featuredTeam} size={28} />
              <span className="text-sm text-muted">{featuredTeam?.name}</span>
              <RoleBadge role={featured.role} />
            </div>
            <h3 className="h-display mt-3 text-6xl md:text-7xl">{featured.ign}</h3>
            <p className="text-muted">{featured.realName}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Rating" value={num(featured.stats.rating)} highlight />
              <StatTile label="ACS" value={featured.stats.acs.toFixed(0)} />
              <StatTile label="K/D" value={num(featured.stats.kd)} />
              <StatTile label="HS %" value={`${featured.stats.hs} %`} />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href={`/joueurs/${featured.slug}`} className="btn-primary">
                Voir le profil <ArrowIcon width={16} height={16} />
              </Link>
              {featured.achievements[0] && (
                <span className="flex items-center gap-2 text-sm text-muted">
                  <TrophyIcon className="text-gold" width={16} height={16} />
                  {featured.achievements[0].title} {featured.achievements[0].year} — {featured.achievements[0].placement}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PATCH + RACCOURCIS */}
      <section className="container-x grid gap-6 py-12 lg:grid-cols-[2fr_1fr]">
        <Link href={`/actus/${latestPatch.version}`} className="card card-hover clip-corner group block p-6">
          <p className="label text-accent">Dernier patch · {latestPatch.version}</p>
          <h3 className="h-display mt-2 text-4xl transition group-hover:text-accent">{latestPatch.title}</h3>
          <p className="mt-3 text-muted">{latestPatch.summary}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {latestPatch.changes.slice(0, 6).map((c) => (
              <li key={c.target} className={`chip ${c.type === "buff" ? "border-buff/50 text-buff" : c.type === "nerf" ? "border-nerf/50 text-nerf" : "text-muted"}`}>
                {c.type === "buff" ? "▲" : c.type === "nerf" ? "▼" : "◆"} {c.target}
              </li>
            ))}
          </ul>
        </Link>
        <div className="grid gap-3">
          {[
            ["/joueurs/comparer", "Comparer deux joueurs", "Radar de stats côte à côte"],
            ["/guides/reglages-pro", "Réticules des pros", "Copiez leurs codes en un clic"],
            ["/agents/compositions", "Compositions par carte", "Les meilleures équipes du moment"],
          ].map(([href, title, sub]) => (
            <Link key={href} href={href} className="card card-hover group flex items-center justify-between p-4">
              <span>
                <span className="block font-semibold transition group-hover:text-accent">{title}</span>
                <span className="text-sm text-muted">{sub}</span>
              </span>
              <ArrowIcon className="text-accent transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {site.sampleDataNotice && (
        <div className="container-x">
          <DataNotice date={site.updatedAt.players} />
        </div>
      )}
    </>
  );
}
