import type { ApiWeapon, Role, Tier } from "./types";

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const WEAPON_CATEGORIES: { key: string; label: string; plural: string }[] = [
  { key: "Sidearm", label: "Arme de poing", plural: "Armes de poing" },
  { key: "SMG", label: "Mitraillette", plural: "Mitraillettes" },
  { key: "Shotgun", label: "Fusil à pompe", plural: "Fusils à pompe" },
  { key: "Rifle", label: "Fusil d'assaut", plural: "Fusils d'assaut" },
  { key: "Sniper", label: "Fusil de précision", plural: "Fusils de précision" },
  { key: "Heavy", label: "Mitrailleuse", plural: "Mitrailleuses" },
  { key: "Melee", label: "Mêlée", plural: "Mêlée" },
];

export function weaponCategoryKey(w: ApiWeapon): string {
  return w.category.replace("EEquippableCategory::", "");
}

export function weaponCategoryLabel(w: ApiWeapon): string {
  const key = weaponCategoryKey(w);
  return WEAPON_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export function wallPenetrationLabel(raw?: string | null): string {
  const v = raw?.replace("EWallPenetrationDisplayType::", "") ?? "";
  return { Low: "Faible", Medium: "Moyenne", High: "Élevée" }[v] ?? "—";
}

export function fireModeLabel(raw?: string | null): string | null {
  const v = raw?.replace("EWeaponFireModeDisplayType::", "");
  if (!v) return null;
  return { SemiAutomatic: "Semi-automatique" }[v] ?? v;
}

export const ROLES: Role[] = ["Duelliste", "Initiateur", "Contrôleur", "Sentinelle"];

/** Rôle API (fr-FR) -> rôle normalisé. */
export function normalizeRole(apiRole?: string | null): Role | string {
  if (!apiRole) return "—";
  const r = apiRole.toLowerCase();
  if (r.startsWith("duel")) return "Duelliste";
  if (r.startsWith("init")) return "Initiateur";
  if (r.startsWith("contr")) return "Contrôleur";
  if (r.startsWith("sent")) return "Sentinelle";
  return apiRole;
}

export const ROLE_COLORS: Record<string, string> = {
  Duelliste: "#FF4655",
  Initiateur: "#3DD9B3",
  Contrôleur: "#8B7CF6",
  Sentinelle: "#F2C14E",
  Flex: "#7FB3FF",
};

export const TIER_COLORS: Record<Tier, string> = {
  S: "#FF4655",
  A: "#FF8A5B",
  B: "#F2C14E",
  C: "#3DD9B3",
  D: "#7F8C99",
};

export const TIERS: Tier[] = ["S", "A", "B", "C", "D"];

export const REGION_LABELS: Record<string, string> = {
  Americas: "Amériques",
  EMEA: "EMEA",
  Pacific: "Pacifique",
  China: "Chine",
  International: "International",
};

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris", ...opts });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function pct(n: number, digits = 1) {
  return `${n.toFixed(digits).replace(".", ",")} %`;
}

export function num(n: number, digits = 2) {
  return n.toFixed(digits).replace(".", ",");
}

export function countryName(code: string) {
  try {
    return new Intl.DisplayNames(["fr"], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** Les catégories d'emplacement de l'API correspondent aux touches par défaut. */
export const ABILITY_KEYS: Record<string, string> = {
  Grenade: "C",
  Ability1: "Q",
  Ability2: "E",
  Ultimate: "X",
  Passive: "Passif",
};

export const ABILITY_ORDER = ["Grenade", "Ability1", "Ability2", "Ultimate", "Passive"];
