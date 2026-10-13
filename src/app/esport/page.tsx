import type { Metadata } from "next";
import Link from "next/link";
import { getMatches, getSite, getTeams, getTeamMap, getTournaments } from "@/lib/data";
import { REGION_LABELS } from "@/lib/utils";
import type { Region } from "@/lib/types";
import { MatchRow } from "@/components/MatchRow";
import { TournamentCard } from "@/components/TournamentCard";
import { Flag, PageHeader, SectionHeading, TeamBadge } from "@/components/ui";
import { DataNotice } from "@/components/DataNotice";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Esport VALORANT — calendrier VCT, résultats et classements",
  description: "Calendrier des compétitions VALORANT (VCT, Masters, Champions), brackets, résultats, matchs à venir et classement des équipes par région.",
};

const REGIONS: Region[] = ["Americas", "EMEA", "Pacific", "China"];

export default async function EsportPage() {
  const [tournaments, matches, teams, teamMap, site] = await Promise.all([getTournaments(), getMatches(), getTeams(), getTeamMap(), getSite()]);
  const sorted = [...tournaments].sort((a, b) => b.start.localeCompare(a.start));
  const ongoing = sorted.filter((t) => t.status === "en cours");
  const upcomingT = sorted.filter((t) => t.status === "à venir").reverse();
  const past = sorted.filter((t) => t.status === "terminé");
  const live = matches.filter((m) => m.status === "en direct");
  const upcoming = matches.filter((m) => m.status === "à venir").sort((a, b) => a.date.localeCompare(b.date));
  const results = matches.filter((m) => m.status === "terminé").sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader kicker="Valorant Champions Tour" title="Esport" description="Calendrier, brackets, résultats et classements des équipes du circuit professionnel." />
      <div className="container-x space-y-16 py-10">
        <DataNotice date={site.updatedAt.matches} />

        {live.length > 0 && (
          <section>
            <SectionHeading kicker="Maintenant" title="En direct" />
            <div className="grid gap-3 md:grid-cols-2">{live.map((m) => <MatchRow key={m.id} match={m} teams={teamMap} />)}</div>
          </section>
        )}

        <section id="calendrier" className="scroll-mt-24">
          <SectionHeading kicker="Calendrier" title="Compétitions" />
          {[...ongoing, ...upcomingT].length > 0 && (
            <div className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[...ongoing, ...upcomingT].map((t) => <TournamentCard key={t.slug} t={t} teams={teamMap} />)}
            </div>
          )}
          <h3 className="label mb-3">Terminées</h3>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{past.map((t) => <TournamentCard key={t.slug} t={t} teams={teamMap} />)}</div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading title="Matchs à venir" />
            <div className="space-y-3">{upcoming.map((m) => <MatchRow key={m.id} match={m} teams={teamMap} />)}</div>
          </div>
          <div>
            <SectionHeading title="Derniers résultats" />
            <div className="space-y-3">{results.slice(0, 8).map((m) => <MatchRow key={m.id} match={m} teams={teamMap} />)}</div>
          </div>
        </section>

        <section id="classement" className="scroll-mt-24">
          <SectionHeading kicker="Points de circuit" title="Classement par région" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {REGIONS.map((r) => {
              const list = teams.filter((t) => t.region === r).sort((a, b) => b.points - a.points);
              return (
                <div key={r} className="card clip-corner">
                  <h3 className="h-display border-b border-line px-4 py-3 text-2xl">{REGION_LABELS[r]}</h3>
                  <ol>
                    {list.map((t, i) => (
                      <li key={t.slug} className="border-b border-line last:border-0">
                        <Link href={`/esport/equipes/${t.slug}`} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-surface-2">
                          <span className={`w-5 font-display text-xl ${i === 0 ? "text-gold" : "text-muted"}`}>{i + 1}</span>
                          <TeamBadge team={t} size={30} />
                          <span className="flex-1 truncate font-semibold">{t.name}</span>
                          <Flag code={t.country} />
                          <span className="w-10 text-right text-sm tabular-nums text-muted">{t.points}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
