"use client";

import Link from "next/link";
import { type FavoriteType, useFavorites } from "./Providers";
import { CloseIcon } from "./Icons";
import { EmptyState } from "./ui";

const GROUPS: { type: FavoriteType; label: string }[] = [
  { type: "joueur", label: "Joueurs" },
  { type: "équipe", label: "Équipes" },
  { type: "agent", label: "Agents" },
  { type: "arme", label: "Armes" },
  { type: "carte", label: "Cartes" },
];

export function FavoritesList() {
  const { favorites, toggleFavorite, ready } = useFavorites();
  if (!ready) return <p className="text-muted">Chargement…</p>;
  if (!favorites.length)
    return (
      <EmptyState>
        Aucun favori pour le moment. Cliquez sur le cœur d&apos;un joueur, d&apos;une arme, d&apos;un agent ou d&apos;une carte pour l&apos;enregistrer ici.
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/joueurs" className="btn-primary">Explorer les joueurs</Link>
          <Link href="/armes" className="btn-ghost">Voir les armes</Link>
        </div>
      </EmptyState>
    );
  return (
    <div className="space-y-10">
      {GROUPS.map((g) => {
        const list = favorites.filter((f) => f.type === g.type);
        if (!list.length) return null;
        return (
          <section key={g.type}>
            <h2 className="h-display mb-4 text-3xl">{g.label} <span className="text-muted">({list.length})</span></h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((f) => (
                <li key={f.id} className="card card-hover flex items-center gap-3 p-3">
                  <Link href={f.href} className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden bg-surface-2">
                      {f.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={f.image} alt="" className={`h-full w-full object-contain ${f.type === "arme" ? "invert dark:invert-0" : ""}`} />
                      ) : (
                        <span className="font-display text-xl text-accent">{f.name.slice(0, 2)}</span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{f.name}</span>
                      {f.subtitle && <span className="block truncate text-xs text-muted">{f.subtitle}</span>}
                    </span>
                  </Link>
                  <button onClick={() => toggleFavorite(f)} className="p-1 text-muted transition hover:text-accent" aria-label={`Retirer ${f.name} des favoris`}>
                    <CloseIcon width={16} height={16} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
