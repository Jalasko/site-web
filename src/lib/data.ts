import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Lineup, MatchItem, MetaData, Patch, Player, Team, Tournament } from "./types";

/**
 * Les données éditoriales (joueurs, équipes, esport, méta...) sont de simples
 * fichiers JSON dans /data. Ils sont relus à chaque régénération de page, ce
 * qui permet à l'espace admin de les modifier sans rebuild en auto-hébergement.
 */
export const DATA_DIR = path.join(process.cwd(), "data");

export const COLLECTIONS = ["players", "teams", "matches", "tournaments", "meta", "patches", "lineups", "agent-costs", "site"] as const;
export type Collection = (typeof COLLECTIONS)[number];

async function load<T>(name: Collection): Promise<T> {
  const raw = await readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
  return JSON.parse(raw) as T;
}

export interface SiteInfo {
  updatedAt: Record<string, string>;
  featuredPlayer: string;
  sampleDataNotice: boolean;
}

export const getSite = () => load<SiteInfo>("site");
export const getPlayers = () => load<Player[]>("players");
export const getTeams = () => load<Team[]>("teams");
export const getMatches = () => load<MatchItem[]>("matches");
export const getTournaments = () => load<Tournament[]>("tournaments");
export const getMeta = () => load<MetaData>("meta");
export const getPatches = () => load<Patch[]>("patches");
export const getLineups = () => load<Lineup[]>("lineups");
export const getAgentCosts = () => load<Record<string, Record<string, string>>>("agent-costs");

export async function getPlayer(slug: string) {
  return (await getPlayers()).find((p) => p.slug === slug);
}

export async function getTeam(slug: string) {
  return (await getTeams()).find((t) => t.slug === slug);
}

export async function getTeamMap() {
  const teams = await getTeams();
  return Object.fromEntries(teams.map((t) => [t.slug, t])) as Record<string, Team>;
}
