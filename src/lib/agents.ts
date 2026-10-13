import type { ApiAgent, MetaData, Tier } from "./types";
import { normalizeRole, slugify, TIERS } from "./utils";

export interface AgentLite {
  slug: string;
  name: string;
  icon: string;
  portrait: string | null;
  role: string;
  roleIcon?: string;
}

export function agentLite(a: ApiAgent): AgentLite {
  return {
    slug: slugify(a.displayName),
    name: a.displayName,
    icon: a.displayIconSmall,
    portrait: a.fullPortrait ?? a.bustPortrait,
    role: String(normalizeRole(a.role?.displayName)),
    roleIcon: a.role?.displayIcon,
  };
}

export function tierOf(list: Record<Tier, string[]>, name: string): Tier | undefined {
  const s = slugify(name);
  return TIERS.find((t) => list[t]?.some((n) => slugify(n) === s));
}

export function ratesOf(meta: MetaData, name: string) {
  const s = slugify(name);
  const key = Object.keys(meta.agentRates).find((k) => slugify(k) === s);
  return key ? meta.agentRates[key] : undefined;
}
