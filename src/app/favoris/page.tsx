import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { FavoritesList } from "@/components/FavoritesList";

export const metadata: Metadata = { title: "Mes favoris", robots: { index: false } };

export default function FavoritesPage() {
  return (
    <>
      <PageHeader kicker="Votre sélection" title="Favoris" description="Joueurs, armes, agents, cartes et équipes enregistrés sur cet appareil." />
      <div className="container-x py-10">
        <FavoritesList />
      </div>
    </>
  );
}
