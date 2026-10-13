"use client";

import { useMemo, useState } from "react";
import type { Player, Team } from "@/lib/types";
import { countryName, REGION_LABELS, ROLES } from "@/lib/utils";
import { PlayerCard } from "./PlayerCard";
import { EmptyState } from "./ui";

const SORTS = [
  { key: "rating", label: "Rating" },
  { key: "acs", label: "ACS" },
  { key: "kd", label: "K/D" },
  { key: "hs", label: "HS %" },
  { key: "ign", label: "Nom" },
] as const;

export function PlayersExplorer({ players, teams, agentIcons }: { players: Player[]; teams: Record<string, Team>; agentIcons: Record<string, string> }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("rating");

  const countries = useMemo(() => [...new Set(players.map((p) => p.country))].sort((a, b) => countryName(a).localeCompare(countryName(b), "fr")), [players]);
  const teamOptions = useMemo(
    () => Object.values(teams).filter((t) => (!region || t.region === region) && players.some((p) => p.team === t.slug)).sort((a, b) => a.name.localeCompare(b.name)),
    [teams, region, players]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return players
      .filter((p) => (!region || teams[p.team]?.region === region) && (!team || p.team === team) && (!role || p.role === role) && (!country || p.country === country))
      .filter((p) => !query || `${p.ign} ${p.realName}`.toLowerCase().includes(query))
      .sort((a, b) => (sort === "ign" ? a.ign.localeCompare(b.ign) : b.stats[sort] - a.stats[sort]));
  }, [players, teams, q, region, team, role, country, sort]);

  const reset = () => {
    setQ("");
    setRegion("");
    setTeam("");
    setRole("");
    setCountry("");
  };

  return (
    <div>
      <div className="glass sticky top-16 z-20 mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input className="input lg:col-span-2" placeholder="Nom du joueur…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filtrer par nom" />
        <select className="input" value={region} onChange={(e) => { setRegion(e.target.value); setTeam(""); }} aria-label="Région">
          <option value="">Toutes les régions</option>
          {Object.entries(REGION_LABELS).filter(([k]) => k !== "International").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input" value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Équipe">
          <option value="">Toutes les équipes</option>
          {teamOptions.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
        </select>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Rôle">
          <option value="">Tous les rôles</option>
          {[...ROLES, "Flex"].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="input" value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Pays">
          <option value="">Tous les pays</option>
          {countries.map((c) => <option key={c} value={c}>{countryName(c)}</option>)}
        </select>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-6">
          <span className="label">Trier par</span>
          {SORTS.map((s) => (
            <button key={s.key} onClick={() => setSort(s.key)} className={`chip transition ${sort === s.key ? "border-accent bg-accent text-white" : "hover:border-accent"}`}>
              {s.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-muted">{filtered.length} joueur{filtered.length > 1 ? "s" : ""}</span>
          <button onClick={reset} className="text-sm text-muted underline hover:text-accent">Réinitialiser</button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState>Aucun joueur ne correspond à ces filtres.</EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => <PlayerCard key={p.slug} player={p} team={teams[p.team]} agentIcons={agentIcons} />)}
        </div>
      )}
    </div>
  );
}
