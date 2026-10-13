import "server-only";
import type { ApiAgent, ApiCompetitiveTiers, ApiMap, ApiWeapon } from "./types";
import { slugify } from "./utils";

/**
 * Client pour https://valorant-api.com (gratuit, sans clé).
 * Les réponses sont mises en cache 24 h par Next.js. En cas d'erreur réseau,
 * on renvoie une liste vide : la page affiche alors un message et se régénère
 * à la prochaine revalidation.
 */
const BASE = process.env.VALORANT_API_URL ?? "https://valorant-api.com/v1";
const LANG = "fr-FR";
const ONE_DAY = 60 * 60 * 24;

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  const qs = new URLSearchParams({ language: LANG, ...params });
  try {
    const res = await fetch(`${BASE}${path}?${qs}`, { next: { revalidate: ONE_DAY, tags: ["valorant-api"] } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { status: number; data: T };
    return json.data;
  } catch (err) {
    console.error(`[valorant-api] ${path} indisponible :`, (err as Error).message);
    return null;
  }
}

export async function getAgents(): Promise<ApiAgent[]> {
  const data = await get<ApiAgent[]>("/agents", { isPlayableCharacter: "true" });
  return (data ?? [])
    .filter((a) => a.isPlayableCharacter && a.role)
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "fr"));
}

export async function getAgent(slug: string): Promise<ApiAgent | undefined> {
  return (await getAgents()).find((a) => slugify(a.displayName) === slug);
}

export async function getWeapons(): Promise<ApiWeapon[]> {
  const data = await get<ApiWeapon[]>("/weapons");
  return data ?? [];
}

export async function getWeapon(slug: string): Promise<ApiWeapon | undefined> {
  return (await getWeapons()).find((w) => slugify(w.displayName) === slug);
}

/** Cartes jouables en compétitif (avec callouts et description tactique). */
export async function getMaps(): Promise<ApiMap[]> {
  const data = await get<ApiMap[]>("/maps");
  return (data ?? [])
    .filter((m) => m.tacticalDescription && m.callouts && m.callouts.length > 0 && m.displayIcon)
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "fr"));
}

export async function getMap(slug: string): Promise<ApiMap | undefined> {
  return (await getMaps()).find((m) => slugify(m.displayName) === slug);
}

/** Dernier épisode des rangs compétitifs, sans les paliers inutilisés. */
export async function getRanks() {
  const data = await get<ApiCompetitiveTiers[]>("/competitivetiers");
  const latest = data?.[data.length - 1];
  return (latest?.tiers ?? []).filter((t) => t.tier >= 3 && t.largeIcon);
}
