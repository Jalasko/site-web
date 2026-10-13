import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLineups, getMeta } from "@/lib/data";
import { getAgents, getMap, getMaps } from "@/lib/valorant-api";
import { byName } from "@/lib/lookup";
import { tierOf } from "@/lib/agents";
import { normalizeRole, pct, ROLE_COLORS, slugify } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LineupsList } from "@/components/LineupsList";
import { MapCallouts, type CalloutPoint } from "@/components/MapCallouts";
import { WinSplit } from "@/components/WinSplit";
import { StatTile, TierBadge, UpdatedAt } from "@/components/ui";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getMaps()).map((m) => ({ slug: slugify(m.displayName) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const m = await getMap((await params).slug);
  if (!m) return { title: "Carte introuvable" };
  return {
    title: `${m.displayName} — callouts, meilleurs agents, compositions et lineups`,
    description: `Guide de la carte ${m.displayName} dans VALORANT : minicarte avec callouts, sites, win rate attaque/défense, meilleurs agents, compositions et lineups.`,
  };
}

export default async function MapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [map, meta, agents, lineups] = await Promise.all([getMap(slug), getMeta(), getAgents(), getLineups()]);
  if (!map) notFound();
  const info = meta.maps[slug];
  const tiers = meta.agentTiers.byMap[slug];

  // Conversion coordonnées monde -> minicarte (formule officielle valorant-api).
  const callouts: CalloutPoint[] = (map.callouts ?? []).map((c) => ({
    label: c.regionName,
    region: c.superRegionName,
    x: c.location.y * map.xMultiplier + map.xScalarToAdd,
    y: c.location.x * map.yMultiplier + map.yScalarToAdd,
  }));
  const sites = [...new Set((map.callouts ?? []).map((c) => c.superRegionName))].filter((r) => /^[A-C]$/.test(r)).sort();
  const agentIcons = Object.fromEntries(agents.map((a) => [a.displayName, a.displayIconSmall]));
  const mapLineups = lineups.filter((l) => l.map === slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={map.splash} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/20" />
        <div className="container-x relative py-16 md:py-24">
          <nav className="label mb-3" aria-label="Fil d'Ariane">
            <Link href="/cartes" className="hover:text-accent">Cartes</Link> / <span className="text-fg">{map.displayName}</span>
          </nav>
          <p className="label text-accent">{map.coordinates}</p>
          <h1 className="h-display text-7xl md:text-9xl">{map.displayName}</h1>
          {map.narrativeDescription && <p className="mt-3 max-w-2xl text-muted">{map.narrativeDescription}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <FavoriteButton withLabel fav={{ type: "carte", id: slug, name: map.displayName, href: `/cartes/${slug}`, image: map.listViewIcon, subtitle: map.coordinates ?? "" }} />
            {info && <span className={`chip ${info.inPool ? "border-teal/50 text-teal" : "text-muted"}`}>{info.inPool ? "Pool compétitif" : "Hors rotation"}</span>}
          </div>
        </div>
      </section>

      <div className="container-x space-y-12 py-10">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Sites" value={sites.length ? sites.join(" · ") : map.tacticalDescription ?? "—"} />
          <StatTile label="Callouts" value={callouts.length} />
          {info && <StatTile label="Taux de jeu" value={pct(info.playRate)} sub="des parties classées" />}
          {info && (
            <div className="card clip-corner p-4">
              <p className="label mb-3">Victoires par côté</p>
              <WinSplit attack={info.attackWin} defense={info.defenseWin} />
            </div>
          )}
        </section>

        <section className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 className="h-display mb-4 text-3xl">Carte des callouts</h2>
            {map.displayIcon && <MapCallouts image={map.displayIcon} name={map.displayName} callouts={callouts} />}
          </div>
          <div className="space-y-6">
            {info && (
              <div className="card clip-corner p-5">
                <h2 className="h-display mb-4 text-3xl">Meilleurs agents</h2>
                <ul className="space-y-2">
                  {info.bestAgents.map((name) => {
                    const a = byName(agents, name);
                    const role = String(normalizeRole(a?.role?.displayName));
                    const t = tiers ? tierOf(tiers, name) : undefined;
                    return (
                      <li key={name}>
                        <Link href={`/agents/${slugify(name)}`} className="flex items-center gap-3 p-1 transition hover:bg-surface-2">
                          {a && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.displayIconSmall} alt="" className="h-10 w-10 bg-surface-2" loading="lazy" />
                          )}
                          <span className="flex-1 font-semibold">{name}</span>
                          <span className="text-xs" style={{ color: ROLE_COLORS[role] }}>{role}</span>
                          {t && <TierBadge tier={t} size="sm" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {info && (
              <div className="card clip-corner p-5">
                <h2 className="h-display mb-3 text-3xl">Astuces</h2>
                <ul className="space-y-2 text-sm text-muted">
                  {info.tips.map((t) => (
                    <li key={t} className="accent-line">{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {info && (
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <h2 className="h-display text-3xl">Compositions recommandées</h2>
              <UpdatedAt date={meta.updatedAt} />
            </div>
            <ul className="grid gap-4 md:grid-cols-2">
              {info.comps.map((c) => (
                <li key={c.name} className="card clip-corner p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold">{c.name}</h3>
                    <span className="text-sm tabular-nums text-buff">{pct(c.winRate)} WR</span>
                  </div>
                  <div className="my-3 flex gap-2">
                    {c.agents.map((name) => {
                      const a = byName(agents, name);
                      return a ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={name} src={a.displayIconSmall} alt={name} title={name} className="h-12 w-12 bg-surface-2" loading="lazy" />
                      ) : (
                        <span key={name} className="chip">{name}</span>
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted">{c.note}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="h-display mb-4 text-3xl">Lineups & astuces par agent</h2>
          <LineupsList lineups={mapLineups} agentIcons={agentIcons} />
        </section>
      </div>
    </>
  );
}
