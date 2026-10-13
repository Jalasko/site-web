"use client";

import { HeartIcon } from "./Icons";
import { type Favorite, useFavorites } from "./Providers";
import { cn } from "@/lib/utils";

export function FavoriteButton({ fav, className, withLabel }: { fav: Favorite; className?: string; withLabel?: boolean }) {
  const { isFavorite, toggleFavorite, ready } = useFavorites();
  const active = ready && isFavorite(fav.type, fav.id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(fav);
      }}
      aria-pressed={active}
      aria-label={active ? `Retirer ${fav.name} des favoris` : `Ajouter ${fav.name} aux favoris`}
      title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(
        "inline-flex items-center gap-2 transition",
        withLabel ? "btn-ghost" : "glass p-2 hover:text-accent",
        active && "text-accent",
        className
      )}
    >
      <HeartIcon filled={active} width={18} height={18} />
      {withLabel && (active ? "En favori" : "Ajouter aux favoris")}
    </button>
  );
}
