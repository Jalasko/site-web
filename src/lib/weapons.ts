import type { ApiWeapon } from "./types";
import { slugify, wallPenetrationLabel, weaponCategoryKey, weaponCategoryLabel } from "./utils";

/** Version allégée d'une arme (sans skins) transmise aux composants client. */
export interface WeaponLite {
  slug: string;
  name: string;
  icon: string;
  category: string;
  categoryLabel: string;
  cost: number;
  fireRate: number;
  magazine: number;
  reload: number;
  equip: number;
  runSpeed: number;
  firstShot: number;
  wallPen: string;
  pellets: number;
  ranges: { start: number; end: number; head: number; body: number; legs: number }[];
}

export function toLite(w: ApiWeapon): WeaponLite {
  const s = w.weaponStats;
  return {
    slug: slugify(w.displayName),
    name: w.displayName,
    icon: w.displayIcon,
    category: weaponCategoryKey(w),
    categoryLabel: weaponCategoryLabel(w),
    cost: w.shopData?.cost ?? 0,
    fireRate: s?.fireRate ?? 0,
    magazine: s?.magazineSize ?? 0,
    reload: s?.reloadTimeSeconds ?? 0,
    equip: s?.equipTimeSeconds ?? 0,
    runSpeed: (s?.runSpeedMultiplier ?? 1) * 6.75,
    firstShot: s?.firstBulletAccuracy ?? 0,
    wallPen: wallPenetrationLabel(s?.wallPenetration),
    pellets: s?.shotgunPelletCount ?? 1,
    ranges: (s?.damageRanges ?? []).map((r) => ({ start: r.rangeStartMeters, end: r.rangeEndMeters, head: r.headDamage, body: r.bodyDamage, legs: r.legDamage })),
  };
}

/** Nombre de balles pour tuer une cible à 150 PV (100 PV + bouclier lourd 50). */
export function shotsToKill(damage: number, hp = 150) {
  if (!damage) return "—";
  return String(Math.ceil(hp / damage));
}

/** Dégâts par seconde au corps, à la première portée. */
export function dps(w: WeaponLite) {
  const body = w.ranges[0]?.body ?? 0;
  return Math.round(body * w.pellets * w.fireRate);
}

export function playableSkins(w: ApiWeapon) {
  return w.skins
    .filter((s) => !/standard|favori|random/i.test(s.displayName))
    .map((s) => ({ uuid: s.uuid, name: s.displayName, image: s.chromas[0]?.fullRender ?? s.displayIcon ?? s.chromas[0]?.displayIcon ?? null }))
    .filter((s): s is { uuid: string; name: string; image: string } => Boolean(s.image))
    .sort((a, b) => a.name.localeCompare(b.name, "fr", { numeric: true }));
}
