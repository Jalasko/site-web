"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { Player, PlayerStats, Team } from "@/lib/types";
import { num } from "@/lib/utils";
import { RadarCompare, SERIES } from "./Charts";
import { Flag, PlayerAvatar, RoleBadge } from "./ui";
import Link from "next/link";

const STATS: { key: keyof PlayerStats; label: string; fmt: (n: number) => string; lowerIsBetter?: boolean }[] = [
  { key: "rating", label: "Rating", fmt: (n) => num(n) },
  { key: "acs", label: "ACS", fmt: (n) => n.toFixed(0) },
  { key: "kd", label: "K/D", fmt: (n) => num(n) },
  { key: "adr", label: "ADR", fmt: (n) => n.toFixed(0) },
  { key: "kast", label: "KAST", fmt: (n) => `${n} %` },
  { key: "hs", label: "HS %", fmt: (n) => `${n} %` },
  { key: "fk", label: "First kills", fmt: (n) => num(n, 1) },
];

export function PlayerCompare({ players, teams }: { players: Player[]; teams: Record<string, Team> }) {
  const params = useSearchParams();
  const router = useRouter();
  const sorted = useMemo(() => [...players].sort((a, b) => a.ign.localeCompare(b.ign)), [players]);
  const aSlug = params.get("a") ?? sorted[0]?.slug;
  const bSlug = params.get("b") ?? sorted.find((p) => p.slug !== aSlug)?.slug;
  const A = players.find((p) => p.slug === aSlug);
  const B = players.find((p) => p.slug === bSlug);

  const set = (key: "a" | "b", value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    if (!next.get(key === "a" ? "b" : "a")) next.set(key === "a" ? "b" : "a", (key === "a" ? bSlug : aSlug) ?? "");
    router.replace(`/joueurs/comparer?${next}`, { scroll: false });
  };

  // Normalisation min-max sur l'ensemble des joueurs (20 → 100) pour un radar lisible.
  const ranges = useMemo(
    () =>
      Object.fromEntries(
        STATS.map((s) => {
          const vals = players.map((p) => p.stats[s.key] ?? 0);
          return [s.key, [Math.min(...vals), Math.max(...vals)]];
        })
      ) as Record<string, [number, number]>,
    [players]
  );

  if (!A || !B) return null;
  const norm = (k: string, v: number) => {
    const [min, max] = ranges[k];
    return max === min ? 60 : Math.round(20 + ((v - min) / (max - min)) * 80);
  };
  const data = STATS.map((s) => ({ stat: s.label, [A.ign]: norm(s.key, A.stats[s.key] ?? 0), [B.ign]: norm(s.key, B.stats[s.key] ?? 0) }));
  const raw = Object.fromEntries([A, B].map((p) => [p.ign, Object.fromEntries(STATS.map((s) => [s.label, s.fmt(p.stats[s.key] ?? 0)]))]));
  const sameName = A.ign === B.ign;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { p: A, key: "a" as const, color: SERIES[0] },
          { p: B, key: "b" as const, color: SERIES[1] },
        ].map(({ p, key, color }) => (
          <div key={key} className="card clip-corner p-5" style={{ borderTop: `3px solid ${color}` }}>
            <label className="label mb-2 block" htmlFor={`select-${key}`}>Joueur {key === "a" ? "1" : "2"}</label>
            <select id={`select-${key}`} className="input mb-4" value={p.slug} onChange={(e) => set(key, e.target.value)}>
              {sorted.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.ign} — {teams[o.team]?.name ?? o.team}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-4">
              <PlayerAvatar ign={p.ign} photo={p.photo} color={teams[p.team]?.color} size={72} className="clip-corner" />
              <div>
                <Link href={`/joueurs/${p.slug}`} className="h-display text-4xl transition hover:text-accent">{p.ign}</Link>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                  <Flag code={p.country} /> {teams[p.team]?.name} <RoleBadge role={p.role} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card clip-corner p-4">
          <h2 className="h-display px-2 text-2xl">Radar des statistiques</h2>
          <p className="px-2 text-xs text-muted">Valeurs relatives à l&apos;ensemble des joueurs de la base (survolez pour les valeurs réelles).</p>
          {sameName ? <p className="p-6 text-muted">Choisissez deux joueurs différents.</p> : <RadarCompare data={data} series={[A.ign, B.ign]} raw={raw} />}
        </div>
        <div className="card clip-corner overflow-hidden">
          <table className="w-full text-sm">
            <caption className="sr-only">Comparaison des statistiques</caption>
            <thead className="bg-surface-2">
              <tr>
                <th className="px-4 py-3 text-left font-display text-xl" style={{ color: SERIES[0] }}>{A.ign}</th>
                <th className="label px-4 py-3 text-center">Stat</th>
                <th className="px-4 py-3 text-right font-display text-xl" style={{ color: SERIES[1] }}>{B.ign}</th>
              </tr>
            </thead>
            <tbody>
              {STATS.map((s) => {
                const a = A.stats[s.key] ?? 0;
                const b = B.stats[s.key] ?? 0;
                return (
                  <tr key={s.key} className="border-t border-line">
                    <td className={`px-4 py-3 text-left tabular-nums ${a > b ? "font-bold" : "text-muted"}`}>{a > b && "▲ "}{s.fmt(a)}</td>
                    <td className="px-4 py-3 text-center text-muted">{s.label}</td>
                    <td className={`px-4 py-3 text-right tabular-nums ${b > a ? "font-bold" : "text-muted"}`}>{s.fmt(b)}{b > a && " ▲"}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-line">
                <td className="px-4 py-3">{A.mainAgents.map((x) => x.agent).join(", ")}</td>
                <td className="px-4 py-3 text-center text-muted">Agents</td>
                <td className="px-4 py-3 text-right">{B.mainAgents.map((x) => x.agent).join(", ")}</td>
              </tr>
              <tr className="border-t border-line">
                <td className="px-4 py-3">{A.achievements.filter((x) => x.placement.startsWith("1")).length}</td>
                <td className="px-4 py-3 text-center text-muted">Titres</td>
                <td className="px-4 py-3 text-right">{B.achievements.filter((x) => x.placement.startsWith("1")).length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
