import Link from "next/link";
import type { WeaponLite } from "@/lib/weapons";
import type { Tier } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";
import { TierBadge } from "./ui";

export function WeaponCard({ w, tier }: { w: WeaponLite; tier?: Tier }) {
  return (
    <Link href={`/armes/${w.slug}`} className="card card-hover clip-corner group flex flex-col">
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-surface-2 to-surface px-6">
        <div className="absolute inset-y-0 right-0 w-1/3 skew-x-[-18deg] bg-accent/5 transition group-hover:bg-accent/15" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={w.icon} alt={w.name} loading="lazy" className="relative max-h-20 w-full object-contain invert transition duration-300 group-hover:scale-105 dark:invert-0" />
        <div className="absolute right-2 top-2 flex items-center gap-1">
          {tier && <TierBadge tier={tier} size="sm" />}
          <FavoriteButton fav={{ type: "arme", id: w.slug, name: w.name, href: `/armes/${w.slug}`, image: w.icon, subtitle: w.categoryLabel }} />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-between gap-2 border-t border-line p-4">
        <div>
          <h3 className="h-display text-2xl transition group-hover:text-accent">{w.name}</h3>
          <p className="text-xs text-muted">{w.categoryLabel}</p>
        </div>
        <p className="font-display text-2xl tabular-nums text-accent">{w.cost ? `${w.cost.toLocaleString("fr-FR")} ¤` : "Gratuit"}</p>
      </div>
      {w.fireRate > 0 && (
        <dl className="grid grid-cols-3 border-t border-line text-center text-xs">
          <div className="py-2"><dt className="text-muted">Cadence</dt><dd className="font-semibold tabular-nums">{w.fireRate.toFixed(2).replace(".", ",")}/s</dd></div>
          <div className="py-2"><dt className="text-muted">Chargeur</dt><dd className="font-semibold tabular-nums">{w.magazine}</dd></div>
          <div className="py-2"><dt className="text-muted">Pénétration</dt><dd className="font-semibold">{w.wallPen}</dd></div>
        </dl>
      )}
    </Link>
  );
}
