"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Player, Team } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { TeamBadge } from "./ui";

export function ProSettingsTable({ players, teams }: { players: Player[]; teams: Record<string, Team> }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"ign" | "edpi">("ign");
  const rows = useMemo(
    () =>
      players
        .filter((p) => p.settings && `${p.ign} ${teams[p.team]?.name ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        .map((p) => ({ p, edpi: Math.round(p.settings!.dpi * p.settings!.sens) }))
        .sort((a, b) => (sort === "ign" ? a.p.ign.localeCompare(b.p.ign) : a.edpi - b.edpi)),
    [players, teams, q, sort]
  );
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.edpi, 0) / rows.length) : 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Joueur ou équipe…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filtrer" />
        <button className={`chip ${sort === "ign" ? "border-accent bg-accent text-white" : ""}`} onClick={() => setSort("ign")}>Nom</button>
        <button className={`chip ${sort === "edpi" ? "border-accent bg-accent text-white" : ""}`} onClick={() => setSort("edpi")}>eDPI croissant</button>
        <span className="ml-auto text-sm text-muted">eDPI moyen : <strong className="text-fg">{avg}</strong></span>
      </div>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-surface-2 text-left">
            <tr className="label">
              <th className="px-4 py-3">Joueur</th><th className="px-4 py-3 text-right">DPI</th><th className="px-4 py-3 text-right">Sens.</th><th className="px-4 py-3 text-right">eDPI</th>
              <th className="px-4 py-3">Résolution</th><th className="px-4 py-3">Code du réticule</th><th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, edpi }) => (
              <tr key={p.slug} className="border-t border-line hover:bg-surface">
                <td className="px-4 py-2.5">
                  <Link href={`/joueurs/${p.slug}`} className="flex items-center gap-2 font-semibold hover:text-accent">
                    <TeamBadge team={teams[p.team]} size={24} /> {p.ign}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{p.settings!.dpi}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{String(p.settings!.sens).replace(".", ",")}</td>
                <td className="px-4 py-2.5 text-right font-bold tabular-nums">{edpi}</td>
                <td className="px-4 py-2.5 text-muted">{p.settings!.resolution ?? "—"}</td>
                <td className="max-w-[260px] px-4 py-2.5"><code className="block truncate font-mono text-xs text-muted" title={p.settings!.crosshair}>{p.settings!.crosshair}</code></td>
                <td className="px-4 py-2.5 text-right"><CopyButton text={p.settings!.crosshair} label="Copier" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
