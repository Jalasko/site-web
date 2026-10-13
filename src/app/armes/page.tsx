import type { Metadata } from "next";
import Link from "next/link";
import { getMeta } from "@/lib/data";
import { getWeapons } from "@/lib/valorant-api";
import { toLite } from "@/lib/weapons";
import { pct, slugify, TIERS, WEAPON_CATEGORIES } from "@/lib/utils";
import type { Tier } from "@/lib/types";
import { WeaponCard } from "@/components/WeaponCard";
import { ApiUnavailable, PageHeader, SectionHeading, TierBadge, UpdatedAt } from "@/components/ui";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Armes VALORANT — stats, dégâts, prix et tier list",
  description: "Toutes les armes de VALORANT classées par catégorie : prix, cadence de tir, chargeur, dégâts par zone et distance, pénétration des murs, tier list méta et skins.",
};

export default async function WeaponsPage() {
  const [weapons, meta] = await Promise.all([getWeapons(), getMeta()]);
  const lite = weapons.map(toLite);
  const tierOf = Object.fromEntries(meta.weaponTiers.map((t) => [slugify(t.weapon), t.tier])) as Record<string, Tier>;
  const bySlug = Object.fromEntries(lite.map((w) => [w.slug, w]));

  return (
    <>
      <PageHeader kicker="Arsenal" title="Armes" description="Statistiques complètes, tables de dégâts, recommandations et skins de chaque arme.">
        <Link href="/armes/comparer" className="btn-primary">Comparer des armes</Link>
      </PageHeader>
      <div className="container-x py-10">
        {weapons.length === 0 && <ApiUnavailable what="les armes" />}

        <nav className="mb-10 flex flex-wrap gap-2" aria-label="Catégories">
          <a href="#tier-list" className="chip hover:border-accent hover:text-accent">Tier list</a>
          {WEAPON_CATEGORIES.map((c) => (
            <a key={c.key} href={`#${c.key.toLowerCase()}`} className="chip hover:border-accent hover:text-accent">{c.plural}</a>
          ))}
        </nav>

        <section id="tier-list" className="scroll-mt-24">
          <SectionHeading kicker={`Patch ${meta.patch}`} title="Tier list des armes" />
          <div className="space-y-2">
            {TIERS.map((tier) => {
              const list = meta.weaponTiers.filter((w) => w.tier === tier);
              if (!list.length) return null;
              return (
                <div key={tier} className="card flex items-stretch">
                  <div className="flex w-16 shrink-0 items-center justify-center border-r border-line sm:w-20"><TierBadge tier={tier} size="lg" /></div>
                  <ul className="flex flex-1 flex-wrap gap-2 p-3">
                    {list.map((w) => {
                      const lw = bySlug[slugify(w.weapon)];
                      return (
                        <li key={w.weapon}>
                          <Link href={`/armes/${slugify(w.weapon)}`} title={w.note} className="group flex items-center gap-3 border border-line bg-surface-2 px-3 py-2 transition hover:border-accent">
                            {lw && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={lw.icon} alt="" className="h-6 w-16 object-contain invert dark:invert-0" loading="lazy" />
                            )}
                            <span>
                              <span className="block text-sm font-semibold group-hover:text-accent">{w.weapon}</span>
                              <span className="block text-[11px] text-muted">Ranked {pct(w.rankedPick)} · Pro {pct(w.proPick)}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mt-3"><UpdatedAt date={meta.updatedAt} /></div>
        </section>

        {WEAPON_CATEGORIES.map((c) => {
          const list = lite.filter((w) => w.category === c.key).sort((a, b) => a.cost - b.cost);
          if (!list.length) return null;
          return (
            <section key={c.key} id={c.key.toLowerCase()} className="mt-14 scroll-mt-24">
              <SectionHeading title={c.plural} kicker={`${list.length} arme${list.length > 1 ? "s" : ""}`} />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((w) => <WeaponCard key={w.slug} w={w} tier={tierOf[w.slug]} />)}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
