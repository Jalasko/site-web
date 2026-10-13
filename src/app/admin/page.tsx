import type { Metadata } from "next";
import { getLineups, getMatches, getMeta, getPatches, getPlayers, getSite, getTeams, getTournaments, getAgentCosts } from "@/lib/data";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const [players, teams, matches, tournaments, meta, patches, lineups, site, agentCosts] = await Promise.all([
    getPlayers(), getTeams(), getMatches(), getTournaments(), getMeta(), getPatches(), getLineups(), getSite(), getAgentCosts(),
  ]);
  return (
    <>
      <PageHeader kicker="Back-office" title="Administration" description="Ajoutez et modifiez les joueurs, les équipes et toutes les données éditoriales du site." />
      <div className="container-x py-10">
        <AdminPanel
          initial={{ players, teams, matches, tournaments, meta, patches, lineups, site, "agent-costs": agentCosts }}
          tokenConfigured={Boolean(process.env.ADMIN_TOKEN)}
        />
      </div>
    </>
  );
}
