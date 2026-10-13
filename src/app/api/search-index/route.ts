import { NextResponse } from "next/server";
import { getPlayers, getTeamMap, getTeams } from "@/lib/data";
import { slugify, weaponCategoryLabel, normalizeRole, REGION_LABELS } from "@/lib/utils";
import { getAgents, getMaps, getWeapons } from "@/lib/valorant-api";
import type { SearchItem } from "@/components/SearchBox";

export const revalidate = 3600;

/** Index de recherche global, filtré côté client pour des résultats instantanés. */
export async function GET() {
  const [players, teams, teamMap, agents, weapons, maps] = await Promise.all([getPlayers(), getTeams(), getTeamMap(), getAgents(), getWeapons(), getMaps()]);

  const items: SearchItem[] = [
    ...players.map((p) => ({
      type: "Joueur" as const,
      name: p.ign,
      subtitle: `${p.realName} · ${teamMap[p.team]?.name ?? p.team} · ${p.role}`,
      href: `/joueurs/${p.slug}`,
      keywords: p.mainAgents.map((a) => a.agent).join(" "),
    })),
    ...teams.map((t) => ({ type: "Équipe" as const, name: t.name, subtitle: `${t.tag} · ${REGION_LABELS[t.region]}`, href: `/esport/equipes/${t.slug}`, keywords: t.tag })),
    ...agents.map((a) => ({
      type: "Agent" as const,
      name: a.displayName,
      subtitle: String(normalizeRole(a.role?.displayName)),
      href: `/agents/${slugify(a.displayName)}`,
      image: a.displayIconSmall,
      keywords: a.abilities.map((ab) => ab.displayName).join(" "),
    })),
    ...weapons.map((w) => ({
      type: "Arme" as const,
      name: w.displayName,
      subtitle: `${weaponCategoryLabel(w)}${w.shopData ? ` · ${w.shopData.cost} ¤` : ""}`,
      href: `/armes/${slugify(w.displayName)}`,
      image: w.displayIcon,
    })),
    ...maps.map((m) => ({ type: "Carte" as const, name: m.displayName, subtitle: m.coordinates ?? "Carte", href: `/cartes/${slugify(m.displayName)}`, image: m.listViewIcon })),
  ];
  return NextResponse.json(items);
}
