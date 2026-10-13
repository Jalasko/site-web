import type { Metadata } from "next";
import Link from "next/link";
import { getMeta } from "@/lib/data";
import { getRanks } from "@/lib/valorant-api";
import { GUIDES } from "@/content/guides";
import { SimpleBarChart } from "@/components/Charts";
import { ArrowIcon } from "@/components/Icons";
import { PageHeader, SectionHeading, UpdatedAt } from "@/components/ui";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Guides VALORANT & système de classement (Fer à Radiant)",
  description: "Le système de rangs de VALORANT expliqué, la répartition des joueurs par rang et des guides pour débutants : placement du réticule, économie, déplacements et paramètres.",
};

export default async function GuidesPage() {
  const [ranks, meta] = await Promise.all([getRanks(), getMeta()]);
  // Un palier par division (ex. Fer 1/2/3 -> une ligne avec 3 icônes).
  const divisions = ranks.reduce<Record<string, typeof ranks>>((acc, t) => {
    (acc[t.divisionName] ??= []).push(t);
    return acc;
  }, {});
  const divColor = (name: string) => {
    const t = ranks.find((r) => r.divisionName === name);
    return t ? `#${t.color.slice(0, 6)}` : "#FF4655";
  };

  return (
    <>
      <PageHeader kicker="Progresser" title="Guides & classé" description="Comprendre le système de rangs, maîtriser les fondamentaux et copier la configuration des meilleurs joueurs.">
        <Link href="/guides/reglages-pro" className="btn-primary">Réglages des pros</Link>
      </PageHeader>
      <div className="container-x space-y-16 py-10">
        <section>
          <SectionHeading kicker="Mode classé" title="Le système de rangs" />
          <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
            <div className="space-y-4 text-muted">
              <p>
                VALORANT compte <strong className="text-fg">9 rangs</strong> : Fer, Bronze, Argent, Or, Platine, Diamant, Ascendant, Immortel et Radiant. Chacun (sauf Radiant) est divisé en
                <strong className="text-fg"> 3 paliers</strong>, soit 25 niveaux au total.
              </p>
              <p>
                Votre progression se mesure en <strong className="text-fg">points de rang (RR)</strong> : il en faut 100 pour monter d&apos;un palier. Une victoire rapporte généralement 10 à 25 RR, une défaite en retire autant, selon votre
                <strong className="text-fg"> MMR caché</strong> et votre performance individuelle.
              </p>
              <p>
                Il faut gagner <strong className="text-fg">5 parties de placement</strong> pour obtenir un premier rang. À partir d&apos;Immortel, les joueurs sont classés sur un leaderboard régional ; Radiant est réservé aux 500 meilleurs joueurs de chaque région.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {["Une seule défaite ne fait pas perdre de rang : un « bouclier » protège à 0 RR.", "Les joueurs de Diamant et plus ne peuvent jouer qu'avec un écart de rang limité.", "Le rang est réinitialisé partiellement à chaque nouvel acte.", "Jouer en groupe de 5 permet de mélanger tous les rangs (RR réduits)."].map((t) => (
                  <li key={t} className="accent-line text-sm">{t}</li>
                ))}
              </ul>
            </div>
            <div className="card clip-corner p-5">
              <h3 className="label mb-2">Répartition des joueurs par rang</h3>
              <SimpleBarChart data={meta.rankDistribution.map((r) => ({ label: r.rank, value: r.percent }))} valueLabel="Joueurs" />
              <table className="sr-only">
                <caption>Répartition des joueurs par rang</caption>
                <tbody>{meta.rankDistribution.map((r) => <tr key={r.rank}><th>{r.rank}</th><td>{r.percent} %</td></tr>)}</tbody>
              </table>
              <UpdatedAt date={meta.updatedAt} label="Estimation" />
            </div>
          </div>

          {ranks.length > 0 && (
            <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(divisions).map(([div, tiers], i) => (
                <li key={div} className="card clip-corner flex items-center gap-4 p-4" style={{ borderLeft: `3px solid ${divColor(div)}` }}>
                  <span className="font-display text-3xl text-muted">{i + 1}</span>
                  <div className="flex-1">
                    <p className="h-display text-2xl">{div.charAt(0) + div.slice(1).toLowerCase()}</p>
                    <p className="text-xs text-muted">{tiers.length > 1 ? `${tiers.length} paliers` : "Palier unique"}</p>
                  </div>
                  <div className="flex">
                    {tiers.map((t) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={t.tier} src={t.largeIcon!} alt={t.tierName} title={t.tierName} width={44} height={44} className="h-11 w-11" loading="lazy" />
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <SectionHeading kicker="Débutants" title="Guides essentiels" />
          <ul className="grid gap-5 md:grid-cols-2">
            {GUIDES.map((g, i) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="card card-hover clip-corner group flex h-full gap-5 p-6">
                  <span className="font-display text-6xl leading-none text-accent/30 transition group-hover:text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex flex-1 flex-col">
                    <span className="label text-accent">{g.kicker} · {g.readingTime} min</span>
                    <span className="h-display mt-1 text-3xl">{g.title}</span>
                    <span className="mt-2 text-sm text-muted">{g.summary}</span>
                    <span className="mt-4 flex items-center gap-1 text-sm font-semibold uppercase tracking-wider">Lire <ArrowIcon width={16} height={16} className="transition group-hover:translate-x-1" /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
