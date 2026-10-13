import type { MetadataRoute } from "next";
import { getPatches, getPlayers, getTeams, getTournaments } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { getAgents, getMaps, getWeapons } from "@/lib/valorant-api";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [players, teams, tournaments, patches, agents, weapons, maps] = await Promise.all([
    getPlayers(), getTeams(), getTournaments(), getPatches(), getAgents(), getWeapons(), getMaps(),
  ]);
  const staticPaths = ["", "/joueurs", "/joueurs/comparer", "/armes", "/armes/comparer", "/agents", "/agents/tier-list", "/agents/compositions", "/cartes", "/esport", "/guides", "/guides/reglages-pro", "/actus"];
  const paths = [
    ...staticPaths,
    ...players.map((p) => `/joueurs/${p.slug}`),
    ...teams.map((t) => `/esport/equipes/${t.slug}`),
    ...tournaments.map((t) => `/esport/tournois/${t.slug}`),
    ...patches.map((p) => `/actus/${p.version}`),
    ...agents.map((a) => `/agents/${slugify(a.displayName)}`),
    ...weapons.map((w) => `/armes/${slugify(w.displayName)}`),
    ...maps.map((m) => `/cartes/${slugify(m.displayName)}`),
  ];
  return paths.map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));
}
