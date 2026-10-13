import type { Metadata } from "next";
import Link from "next/link";
import { getPlayers, getSite, getTeamMap } from "@/lib/data";
import { getAgents } from "@/lib/valorant-api";
import { PageHeader } from "@/components/ui";
import { DataNotice } from "@/components/DataNotice";
import { PlayersExplorer } from "@/components/PlayersExplorer";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Joueurs pro VALORANT — statistiques, équipes et agents",
  description: "Base de données des joueurs professionnels VALORANT : rating, ACS, K/D, agents joués, équipes et régions (Americas, EMEA, Pacific, China).",
};

export default async function PlayersPage() {
  const [players, teams, agents, site] = await Promise.all([getPlayers(), getTeamMap(), getAgents(), getSite()]);
  const agentIcons = Object.fromEntries(agents.map((a) => [a.displayName, a.displayIconSmall]));
  return (
    <>
      <PageHeader kicker="Base de données" title="Joueurs pro" description="Les meilleurs joueurs du circuit VCT : statistiques publiques, rôles, agents et palmarès.">
        <Link href="/joueurs/comparer" className="btn-primary">Comparer deux joueurs</Link>
      </PageHeader>
      <div className="container-x py-10">
        <div className="mb-6"><DataNotice date={site.updatedAt.players} /></div>
        <PlayersExplorer players={players} teams={teams} agentIcons={agentIcons} />
      </div>
    </>
  );
}
