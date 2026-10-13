import type { Metadata } from "next";
import { getPlayers, getSite, getTeamMap } from "@/lib/data";
import { ProSettingsTable } from "@/components/ProSettingsTable";
import { PageHeader } from "@/components/ui";
import { DataNotice } from "@/components/DataNotice";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Réticules et sensibilités des pros VALORANT (codes à copier)",
  description: "Codes de réticule, DPI, sensibilité et eDPI des joueurs professionnels VALORANT. Copiez le réticule de votre joueur préféré en un clic.",
};

export default async function ProSettingsPage() {
  const [players, teams, site] = await Promise.all([getPlayers(), getTeamMap(), getSite()]);
  return (
    <>
      <PageHeader kicker="Configuration" title="Réglages des pros" description="Réticules, DPI, sensibilité et eDPI des meilleurs joueurs. Cliquez sur « Copier » puis importez le code dans Paramètres → Réticule." />
      <div className="container-x space-y-6 py-10">
        <DataNotice date={site.updatedAt.players} />
        <ProSettingsTable players={players} teams={teams} />
      </div>
    </>
  );
}
