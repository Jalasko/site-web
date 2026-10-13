import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatches, getSite, getTeamMap, getTournaments } from "@/lib/data";
import { formatDate, REGION_LABELS } from "@/lib/utils";
import { Bracket } from "@/components/Bracket";
import { MatchRow } from "@/components/MatchRow";
import { StatTile, TeamBadge } from "@/components/ui";
import { DataNotice } from "@/components/DataNotice";
import { TrophyIcon } from "@/components/Icons";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getTournaments()).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const t = (await getTournaments()).find((x) => x.slug === slug);
  if (!t) return { title: "Compétition introuvable" };
  return { title: `${t.name} — bracket, résultats et équipes`, description: `${t.name} (${t.location}) : bracket, résultats, équipes participantes et cashprize de ${t.prizePool}.` };
}

export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tournaments, teams, matches, site] = await Promise.all([getTournaments(), getTeamMap(), getMatches(), getSite()]);
  const t = tournaments.find((x) => x.slug === slug);
  if (!t) notFound();
  const winner = t.winner ? teams[t.winner] : undefined;
  const eventMatches = matches.filter((m) => m.event === t.name).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -right-24 top-0 h-full w-1/2 skew-x-[-18deg] bg-accent/10" />
        <div className="container-x relative py-12">
          <nav className="label mb-3" aria-label="Fil d'Ariane">
            <Link href="/esport" className="hover:text-accent">Esport</Link> / <span className="text-fg">{t.name}</span>
          </nav>
          <p className="label text-accent">{t.tier} · {REGION_LABELS[t.region]}</p>
          <h1 className="h-display text-6xl md:text-8xl">{t.name}</h1>
          <p className="mt-2 text-muted">{t.location}</p>
        </div>
      </section>
      <div className="container-x space-y-12 py-10">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Dates" value={<span className="text-xl">{formatDate(t.start, { day: "numeric", month: "short" })} – {formatDate(t.end, { day: "numeric", month: "short", year: "numeric" })}</span>} />
          <StatTile label="Cashprize" value={t.prizePool} />
          <StatTile label="Équipes" value={t.teams.length} />
          <StatTile label="Statut" value={<span className="capitalize">{t.status}</span>} highlight={t.status === "en cours"} />
        </section>

        {winner && (
          <section className="card clip-corner flex flex-wrap items-center gap-5 border-gold/50 p-6">
            <TrophyIcon width={40} height={40} className="text-gold" />
            <TeamBadge team={winner} size={64} />
            <div>
              <p className="label text-gold">Vainqueur</p>
              <Link href={`/esport/equipes/${winner.slug}`} className="h-display text-5xl hover:text-accent">{winner.name}</Link>
            </div>
          </section>
        )}

        {t.bracket && t.bracket.length > 0 && (
          <section>
            <h2 className="h-display mb-4 text-3xl">Bracket des playoffs</h2>
            <Bracket rounds={t.bracket} teams={teams} />
          </section>
        )}

        {eventMatches.length > 0 && (
          <section>
            <h2 className="h-display mb-4 text-3xl">Matchs</h2>
            <div className="grid gap-3 md:grid-cols-2">{eventMatches.map((m) => <MatchRow key={m.id} match={m} teams={teams} />)}</div>
          </section>
        )}

        <section>
          <h2 className="h-display mb-4 text-3xl">Équipes participantes</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {t.teams.map((s) => (
              <li key={s}>
                <Link href={`/esport/equipes/${s}`} className="card card-hover flex flex-col items-center gap-2 p-4 text-center">
                  <TeamBadge team={teams[s]} size={48} />
                  <span className="text-sm font-semibold">{teams[s]?.name ?? s}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <DataNotice date={site.updatedAt.tournaments} />
      </div>
    </>
  );
}
