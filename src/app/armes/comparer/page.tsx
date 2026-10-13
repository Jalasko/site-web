import type { Metadata } from "next";
import { Suspense } from "react";
import { getWeapons } from "@/lib/valorant-api";
import { toLite } from "@/lib/weapons";
import { ApiUnavailable, PageHeader } from "@/components/ui";
import { WeaponCompare } from "@/components/WeaponCompare";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Comparateur d'armes VALORANT",
  description: "Comparez deux armes de VALORANT : prix, cadence, dégâts, DPS, rechargement, mobilité et précision.",
};

export default async function CompareWeaponsPage() {
  const weapons = (await getWeapons()).map(toLite);
  return (
    <>
      <PageHeader kicker="Outil" title="Comparer des armes" description="Vandal ou Phantom ? Spectre ou Stinger ? Comparez toutes les statistiques côte à côte." />
      <div className="container-x py-10">
        {weapons.length === 0 ? <ApiUnavailable what="les armes" /> : (
          <Suspense fallback={<p className="text-muted">Chargement…</p>}>
            <WeaponCompare weapons={weapons} />
          </Suspense>
        )}
      </div>
    </>
  );
}
