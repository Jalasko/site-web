import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgentCosts, getLineups, getMeta, getPlayers, getTeamMap } from "@/lib/data";
import { getAgent, getMaps, getAgents } from "@/lib/valorant-api";
import { ratesOf, tierOf } from "@/lib/agents";
import { ABILITY_KEYS, ABILITY_ORDER, normalizeRole, pct, ROLE_COLORS, slugify } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { RoleBadge, StatTile, TeamBadge, TierBadge, UpdatedAt } from "@/components/ui";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getAgents()).map((a) => ({ slug: slugify(a.displayName) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await getAgent((await params).slug);
  if (!a) return { title: "Agent introuvable" };
  return {
    title: `${a.displayName} — capacités, coûts, lore et méta`,
    description: `Guide de ${a.displayName} (${normalizeRole(a.role?.displayName)}) dans VALORANT : capacités, coûts, lore, tier list par rang et carte, lineups et joueurs pro.`,
  };
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [agent, meta, costs, players, teams, lineups, maps] = await Promise.all([getAgent(slug), getMeta(), getAgentCosts(), getPlayers(), getTeamMap(), getLineups(), getMaps()]);
  if (!agent) notFound();
  const role = String(normalizeRole(agent.role?.displayName));
  const color = `#${agent.backgroundGradientColors?.[0]?.slice(0, 6) ?? "FF4655"}`;
  const info = costs[slug] ?? {};
  const rates = ratesOf(meta, agent.displayName);
  const abilities = [...agent.abilities].sort((a, b) => ABILITY_ORDER.indexOf(a.slot) - ABILITY_ORDER.indexOf(b.slot));
  const globalTier = tierOf(meta.agentTiers.global, agent.displayName);
  const rankTiers = Object.entries(meta.agentTiers.byRank).map(([rank, list]) => ({ rank, tier: tierOf(list, agent.displayName) }));
  const mapTiers = Object.entries(meta.agentTiers.byMap)
    .map(([map, list]) => ({ map, tier: tierOf(list, agent.displayName), api: maps.find((m) => slugify(m.displayName) === map) }))
    .filter((m) => m.tier === "S" || m.tier === "A")
    .sort((a, b) => (a.tier ?? "Z").localeCompare(b.tier ?? "Z"));
  const pros = players.filter((p) => p.mainAgents.some((m) => slugify(m.agent) === slug)).slice(0, 8);
  const agentLineups = lineups.filter((l) => slugify(l.agent) === slug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 70% 30%, ${color}55, transparent 60%)` }} />
        {agent.background && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={agent.background} alt="" className="pointer-events-none absolute right-0 top-0 h-full opacity-10" />
        )}
        <div className="container-x relative grid gap-6 md:grid-cols-2 md:items-end">
          <div className="py-12">
            <nav className="label mb-3" aria-label="Fil d'Ariane">
              <Link href="/agents" className="hover:text-accent">Agents</Link> / <span className="text-fg">{agent.displayName}</span>
            </nav>
            <RoleBadge role={role} icon={agent.role?.displayIcon} />
            <h1 className="h-display mt-3 text-7xl md:text-9xl">{agent.displayName}</h1>
            {info.origin && <p className="label mt-1">Origine : <span className="text-fg">{info.origin}</span></p>}
            <p className="mt-4 max-w-xl text-muted">{agent.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <FavoriteButton withLabel fav={{ type: "agent", id: slug, name: agent.displayName, href: `/agents/${slug}`, image: agent.displayIconSmall, subtitle: role }} />
              {globalTier && <span className="flex items-center gap-2 text-sm text-muted"><TierBadge tier={globalTier} /> Tier global</span>}
            </div>
          </div>
          {agent.fullPortrait && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={agent.fullPortrait} alt={agent.displayName} className="mx-auto -mb-8 max-h-[520px] w-auto object-contain md:-mb-16" />
          )}
        </div>
      </section>

      <div className="container-x space-y-12 py-10">
        {rates && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Pick rate (ranked)" value={pct(rates.pick)} />
            <StatTile label="Win rate (ranked)" value={pct(rates.win)} highlight={rates.win >= 50} />
            <StatTile label="Pick rate (pro)" value={pct(rates.proPick, 0)} />
            <StatTile label="Rôle" value={<span style={{ color: ROLE_COLORS[role] }}>{role}</span>} />
          </section>
        )}

        <section>
          <h2 className="h-display mb-4 text-3xl">Capacités</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {abilities.map((ab) => (
              <li key={ab.slot} className="card clip-corner flex gap-4 p-5">
                <div className="flex flex-col items-center gap-2">
                  <span className="flex h-14 w-14 items-center justify-center bg-surface-2">
                    {ab.displayIcon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ab.displayIcon} alt="" className="h-10 w-10 invert dark:invert-0" loading="lazy" />
                    )}
                  </span>
                  <kbd className="min-w-8 border border-line px-1.5 py-0.5 text-center text-xs font-bold">{ABILITY_KEYS[ab.slot] ?? ab.slot}</kbd>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="h-display text-2xl">{ab.displayName}</h3>
                    {info[ab.slot] && <span className={`chip ${ab.slot === "Ultimate" ? "border-gold/50 text-gold" : "border-accent/40 text-accent"}`}>{info[ab.slot]}</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted">{ab.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Coûts indicatifs, susceptibles d&apos;évoluer selon les patchs.</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card clip-corner p-6">
            <h2 className="h-display mb-4 text-3xl">Tier par rang</h2>
            <ul className="space-y-3">
              {rankTiers.map((r) => (
                <li key={r.rank} className="flex items-center justify-between border-b border-line pb-3 last:border-0">
                  <span>{r.rank}</span>
                  {r.tier ? <TierBadge tier={r.tier} /> : <span className="text-muted">—</span>}
                </li>
              ))}
            </ul>
            <div className="mt-3"><UpdatedAt date={meta.updatedAt} /></div>
          </div>
          <div className="card clip-corner p-6">
            <h2 className="h-display mb-4 text-3xl">Meilleures cartes</h2>
            {mapTiers.length === 0 ? (
              <p className="text-muted">Aucune carte où {agent.displayName} est en tier S ou A actuellement.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3">
                {mapTiers.map((m) => (
                  <li key={m.map}>
                    <Link href={`/cartes/${m.map}`} className="card card-hover group relative block h-24 overflow-hidden">
                      {m.api && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.api.listViewIcon} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50 transition group-hover:opacity-70" loading="lazy" />
                      )}
                      <span className="absolute inset-0 bg-gradient-to-r from-bg/90 to-transparent" />
                      <span className="relative flex h-full items-center justify-between px-4">
                        <span className="h-display text-2xl">{m.api?.displayName ?? m.map}</span>
                        <TierBadge tier={m.tier!} size="sm" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {pros.length > 0 && (
          <section>
            <h2 className="h-display mb-4 text-3xl">Joué par les pros</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {pros.map((p) => (
                <li key={p.slug}>
                  <Link href={`/joueurs/${p.slug}`} className="card card-hover flex items-center gap-3 p-3">
                    <TeamBadge team={teams[p.team]} size={36} />
                    <span className="flex-1">
                      <span className="block font-semibold">{p.ign}</span>
                      <span className="text-xs text-muted">{pct(p.mainAgents.find((m) => slugify(m.agent) === slug)?.pickRate ?? 0, 0)} de ses cartes</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {agentLineups.length > 0 && (
          <section>
            <h2 className="h-display mb-4 text-3xl">Lineups & astuces</h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {agentLineups.map((l) => (
                <li key={l.id} className="card p-5">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Link href={`/cartes/${l.map}`} className="chip hover:border-accent">{maps.find((m) => slugify(m.displayName) === l.map)?.displayName ?? l.map}</Link>
                    <span className="chip">{l.side}</span>
                    <span className="chip">Site {l.site}</span>
                  </div>
                  <h3 className="font-semibold">{l.title}</h3>
                  <p className="text-xs uppercase tracking-wider text-accent">{l.ability}</p>
                  <p className="mt-2 text-sm text-muted">{l.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
