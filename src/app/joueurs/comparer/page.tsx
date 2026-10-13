import type { Metadata } from "next";
import { Suspense } from "react";
import { getPlayers, getSite, getTeamMap } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import { DataNotice } from "@/components/DataNotice";
import { PlayerCompare } from "@/components/PlayerCompare";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Comparateur de joueurs pro VALORANT",
  description: "Comparez deux joueurs professionnels VALORANT côte à côte : rating, ACS, K/D, ADR, KAST, headshots et first kills sur un radar.",
};

export default async function ComparePlayersPage() {
  const [players, teams, site] = await Promise.all([getPlayers(), getTeamMap(), getSite()]);
  return (
    <>
      <PageHeader kicker="Outil" title="Comparer deux joueurs" description="Sélectionnez deux joueurs pour comparer leurs statistiques publiques. L'URL est partageable." />
      <div className="container-x space-y-6 py-10">
        <Suspense fallback={<p className="text-muted">Chargement…</p>}>
          <PlayerCompare players={players} teams={teams} />
        </Suspense>
        <DataNotice date={site.updatedAt.players} />
      </div>
    </>
  );
}
