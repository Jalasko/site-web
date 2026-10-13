import type { Metadata } from "next";
import Link from "next/link";
import { getMeta } from "@/lib/data";
import { getAgents } from "@/lib/valorant-api";
import { agentLite, ratesOf, tierOf } from "@/lib/agents";
import { AgentsGrid } from "@/components/AgentsGrid";
import { ApiUnavailable, PageHeader, UpdatedAt } from "@/components/ui";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Agents VALORANT — capacités, rôles, lore et tier list",
  description: "Tous les agents de VALORANT : rôle, capacités et coûts, origine, lore, taux de sélection et de victoire, tier list par carte et par rang.",
};

export default async function AgentsPage() {
  const [agents, meta] = await Promise.all([getAgents(), getMeta()]);
  const lite = agents.map(agentLite);
  const tiers = Object.fromEntries(lite.map((a) => [a.slug, tierOf(meta.agentTiers.global, a.name)]));
  const rates = Object.fromEntries(lite.map((a) => [a.slug, ratesOf(meta, a.name)]));
  return (
    <>
      <PageHeader kicker="Protocole VALORANT" title="Agents" description="Capacités, coûts, origine, lore et place dans la méta de chaque agent.">
        <div className="flex flex-wrap gap-2">
          <Link href="/agents/tier-list" className="btn-primary">Tier list</Link>
          <Link href="/agents/compositions" className="btn-ghost">Compositions par carte</Link>
        </div>
      </PageHeader>
      <div className="container-x py-10">
        {lite.length === 0 ? <ApiUnavailable what="les agents" /> : <AgentsGrid agents={lite} tiers={tiers} rates={rates} />}
        <div className="mt-4"><UpdatedAt date={meta.updatedAt} label={`Statistiques méta (patch ${meta.patch})`} /></div>
      </div>
    </>
  );
}
