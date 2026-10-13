import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeta } from "@/lib/data";
import { getWeapon, getWeapons } from "@/lib/valorant-api";
import { dps, playableSkins, shotsToKill, toLite } from "@/lib/weapons";
import { fireModeLabel, num, pct, slugify } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SkinsGallery } from "@/components/SkinsGallery";
import { StatTile, TierBadge, UpdatedAt } from "@/components/ui";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getWeapons()).map((w) => ({ slug: slugify(w.displayName) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = await getWeapon((await params).slug);
  if (!w) return { title: "Arme introuvable" };
  return {
    title: `${w.displayName} — dégâts, stats, prix et skins`,
    description: `Tout sur la ${w.displayName} dans VALORANT : prix, cadence, chargeur, table de dégâts tête/corps/jambes par distance, pénétration et skins.`,
  };
}

export default async function WeaponPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [weapon, meta] = await Promise.all([getWeapon(slug), getMeta()]);
  if (!weapon) notFound();
  const w = toLite(weapon);
  const tier = meta.weaponTiers.find((t) => slugify(t.weapon) === slug);
  const tips = meta.weaponTips[slug];
  const skins = playableSkins(weapon);
  const s = weapon.weaponStats;
  const mode = fireModeLabel(s?.fireMode);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 skew-x-[-18deg] bg-accent/10" />
        <div className="container-x relative grid gap-8 py-12 md:grid-cols-2 md:items-center">
          <div>
            <nav className="label mb-3" aria-label="Fil d'Ariane">
              <Link href="/armes" className="hover:text-accent">Armes</Link> / <span className="text-fg">{w.name}</span>
            </nav>
            <p className="label text-accent">{w.categoryLabel}</p>
            <h1 className="h-display text-7xl md:text-8xl">{w.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="font-display text-4xl text-accent">{w.cost ? `${w.cost.toLocaleString("fr-FR")} ¤` : "Gratuit"}</span>
              {tier && (
                <span className="flex items-center gap-2 text-sm text-muted"><TierBadge tier={tier.tier} /> Tier {tier.tier}</span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <FavoriteButton withLabel fav={{ type: "arme", id: w.slug, name: w.name, href: `/armes/${w.slug}`, image: w.icon, subtitle: w.categoryLabel }} />
              <Link href={`/armes/comparer?a=${w.slug}`} className="btn-ghost">Comparer</Link>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={w.icon} alt={w.name} className="mx-auto max-h-48 w-full object-contain invert drop-shadow-[0_20px_30px_rgba(255,70,85,0.25)] dark:invert-0" />
        </div>
      </section>

      <div className="container-x space-y-12 py-10">
        {s ? (
          <>
            <section>
              <h2 className="h-display mb-4 text-3xl">Caractéristiques</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label="Cadence de tir" value={`${num(w.fireRate)}/s`} sub={mode ?? undefined} />
                <StatTile label="Chargeur" value={w.magazine} />
                <StatTile label="Rechargement" value={`${num(w.reload)} s`} />
                <StatTile label="Équipement" value={`${num(w.equip)} s`} />
                <StatTile label="Pénétration des murs" value={w.wallPen} highlight />
                <StatTile label="Vitesse de course" value={`${num(w.runSpeed)} m/s`} />
                <StatTile label="Précision 1re balle" value={`${num(w.firstShot)}°`} sub="Déviation (plus bas = mieux)" />
                <StatTile label="DPS (corps)" value={dps(w)} sub={w.pellets > 1 ? `${w.pellets} plombs par tir` : "Première portée"} />
              </div>
            </section>

            <section>
              <h2 className="h-display mb-1 text-3xl">Table des dégâts</h2>
              <p className="mb-4 text-sm text-muted">Dégâts par balle{w.pellets > 1 ? " (par plomb)" : ""} selon la zone touchée et la distance. Entre parenthèses : balles nécessaires pour tuer une cible à 150 PV (bouclier lourd).</p>
              <div className="overflow-x-auto border border-line">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="bg-surface-2">
                    <tr className="label text-left">
                      <th className="px-4 py-3">Distance</th>
                      <th className="px-4 py-3">Tête</th>
                      <th className="px-4 py-3">Corps</th>
                      <th className="px-4 py-3">Jambes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.ranges.map((r) => (
                      <tr key={r.start} className="border-t border-line">
                        <td className="px-4 py-3 font-semibold">{r.start} – {r.end} m</td>
                        {[r.head, r.body, r.legs].map((d, i) => (
                          <td key={i} className="px-4 py-3 tabular-nums">
                            <span className={`font-display text-2xl ${i === 0 ? "text-accent" : ""}`}>{Math.round(d)}</span>{" "}
                            <span className="text-xs text-muted">({shotsToKill(d * (w.pellets > 1 ? w.pellets : 1))} {w.pellets > 1 ? "tir(s)" : "balle(s)"})</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <p className="text-muted">Arme de corps à corps : 50 dégâts au clic gauche, 75 au clic droit (attaque lourde), sans dégâts par distance.</p>
        )}

        {(tips || tier) && (
          <section className="grid gap-6 lg:grid-cols-2">
            {tips && (
              <div className="card clip-corner p-6">
                <h2 className="h-display mb-3 text-3xl">Situations recommandées</h2>
                <ul className="mb-4 flex flex-wrap gap-2">
                  {tips.situations.map((x) => <li key={x} className="chip border-accent/40 text-accent">{x}</li>)}
                </ul>
                <p className="text-muted">{tips.tips}</p>
              </div>
            )}
            {tier && (
              <div className="card clip-corner p-6">
                <h2 className="h-display mb-3 text-3xl">Place dans la méta</h2>
                <div className="flex items-center gap-4">
                  <TierBadge tier={tier.tier} size="lg" />
                  <p className="text-muted">{tier.note}</p>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3">
                  <StatTile label="Pick rate ranked" value={pct(tier.rankedPick)} />
                  <StatTile label="Pick rate pro" value={pct(tier.proPick)} />
                </dl>
                <div className="mt-3"><UpdatedAt date={meta.updatedAt} /></div>
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="h-display mb-4 text-3xl">Galerie de skins</h2>
          <SkinsGallery skins={skins} />
        </section>
      </div>
    </>
  );
}
