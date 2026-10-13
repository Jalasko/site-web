import type { Metadata } from "next";
import Link from "next/link";
import { getMeta } from "@/lib/data";
import { getMaps } from "@/lib/valorant-api";
import { pct, slugify } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { WinSplit } from "@/components/WinSplit";
import { ApiUnavailable, PageHeader, SectionHeading, UpdatedAt } from "@/components/ui";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Cartes VALORANT — callouts, sites, agents et win rates",
  description: "Toutes les cartes de VALORANT : minicarte avec callouts, sites, meilleurs agents, taux de victoire attaque/défense, compositions et lineups.",
};

export default async function MapsPage() {
  const [maps, meta] = await Promise.all([getMaps(), getMeta()]);
  const withMeta = maps.map((m) => ({ m, slug: slugify(m.displayName), info: meta.maps[slugify(m.displayName)] }));
  const groups = [
    { title: "Pool compétitif", items: withMeta.filter((x) => x.info?.inPool) },
    { title: "Hors rotation", items: withMeta.filter((x) => !x.info?.inPool) },
  ];
  return (
    <>
      <PageHeader kicker="Terrain" title="Cartes" description="Callouts, sites, meilleurs agents, statistiques attaque/défense et lineups pour chaque carte." >
        <UpdatedAt date={meta.updatedAt} />
      </PageHeader>
      <div className="container-x space-y-14 py-10">
        {maps.length === 0 && <ApiUnavailable what="les cartes" />}
        {groups.map((g) =>
          g.items.length ? (
            <section key={g.title}>
              <SectionHeading title={g.title} kicker={`${g.items.length} cartes`} />
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map(({ m, slug, info }) => (
                  <li key={m.uuid}>
                    <Link href={`/cartes/${slug}`} className="card card-hover clip-corner group block">
                      <div className="relative h-44 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.splash} alt={m.displayName} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                        <div className="absolute right-2 top-2">
                          <FavoriteButton fav={{ type: "carte", id: slug, name: m.displayName, href: `/cartes/${slug}`, image: m.listViewIcon, subtitle: m.coordinates ?? "" }} />
                        </div>
                        <div className="absolute bottom-3 left-4">
                          <h3 className="h-display text-4xl text-white drop-shadow transition group-hover:text-accent">{m.displayName}</h3>
                          <p className="text-xs text-white/70">{m.coordinates}</p>
                        </div>
                      </div>
                      {info && (
                        <div className="space-y-2 p-4">
                          <WinSplit attack={info.attackWin} defense={info.defenseWin} />
                          <p className="text-xs text-muted">Jouée dans {pct(info.playRate)} des parties classées</p>
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null
        )}
      </div>
    </>
  );
}
