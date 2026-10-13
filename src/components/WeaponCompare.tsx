"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { WeaponLite } from "@/lib/weapons";
import { SERIES } from "./Charts";

type Metric = { label: string; get: (w: WeaponLite) => number; fmt: (n: number) => string; lowerIsBetter?: boolean };
const f = (n: number, d = 2) => n.toFixed(d).replace(".", ",");
const METRICS: Metric[] = [
  { label: "Prix", get: (w) => w.cost, fmt: (n) => `${n.toLocaleString("fr-FR")} ¤`, lowerIsBetter: true },
  { label: "Cadence de tir", get: (w) => w.fireRate, fmt: (n) => `${f(n)}/s` },
  { label: "Chargeur", get: (w) => w.magazine, fmt: (n) => String(n) },
  { label: "Dégâts tête (1re portée)", get: (w) => (w.ranges[0]?.head ?? 0) * w.pellets, fmt: (n) => String(Math.round(n)) },
  { label: "Dégâts corps (1re portée)", get: (w) => (w.ranges[0]?.body ?? 0) * w.pellets, fmt: (n) => String(Math.round(n)) },
  { label: "Dégâts tête (portée max)", get: (w) => (w.ranges.at(-1)?.head ?? 0) * w.pellets, fmt: (n) => String(Math.round(n)) },
  { label: "DPS corps", get: (w) => (w.ranges[0]?.body ?? 0) * w.pellets * w.fireRate, fmt: (n) => String(Math.round(n)) },
  { label: "Rechargement", get: (w) => w.reload, fmt: (n) => `${f(n)} s`, lowerIsBetter: true },
  { label: "Temps d'équipement", get: (w) => w.equip, fmt: (n) => `${f(n)} s`, lowerIsBetter: true },
  { label: "Vitesse de course", get: (w) => w.runSpeed, fmt: (n) => `${f(n)} m/s` },
  { label: "Déviation 1re balle", get: (w) => w.firstShot, fmt: (n) => `${f(n)}°`, lowerIsBetter: true },
];

export function WeaponCompare({ weapons }: { weapons: WeaponLite[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const list = weapons.filter((w) => w.fireRate > 0).sort((a, b) => a.cost - b.cost);
  const a = list.find((w) => w.slug === params.get("a")) ?? list.find((w) => w.slug === "vandal") ?? list[0];
  const b = list.find((w) => w.slug === params.get("b")) ?? list.find((w) => w.slug === "phantom" && w.slug !== a?.slug) ?? list.find((w) => w.slug !== a?.slug);
  if (!a || !b) return <p className="text-muted">Données des armes indisponibles.</p>;

  const set = (key: "a" | "b", v: string) => {
    const next = new URLSearchParams({ a: a.slug, b: b.slug });
    next.set(key, v);
    router.replace(`/armes/comparer?${next}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {[{ w: a, key: "a" as const, c: SERIES[0] }, { w: b, key: "b" as const, c: SERIES[1] }].map(({ w, key, c }) => (
          <div key={key} className="card clip-corner p-5" style={{ borderTop: `3px solid ${c}` }}>
            <label className="label mb-2 block" htmlFor={`w-${key}`}>Arme {key === "a" ? "1" : "2"}</label>
            <select id={`w-${key}`} className="input" value={w.slug} onChange={(e) => set(key, e.target.value)}>
              {list.map((o) => <option key={o.slug} value={o.slug}>{o.name} — {o.categoryLabel}</option>)}
            </select>
            <div className="mt-4 flex h-24 items-center justify-center bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={w.icon} alt={w.name} className="max-h-16 object-contain invert dark:invert-0" />
            </div>
            <p className="h-display mt-3 text-3xl" style={{ color: c }}>{w.name}</p>
          </div>
        ))}
      </div>

      <div className="card clip-corner p-5">
        <h2 className="h-display mb-4 text-2xl">Comparaison</h2>
        <ul className="space-y-4">
          {METRICS.map((m) => {
            const va = m.get(a);
            const vb = m.get(b);
            const max = Math.max(va, vb) || 1;
            const better = va === vb ? null : (va > vb) !== Boolean(m.lowerIsBetter) ? "a" : "b";
            return (
              <li key={m.label}>
                <p className="label mb-1 text-center">{m.label}</p>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-sm tabular-nums ${better === "a" ? "font-bold" : "text-muted"}`}>{m.fmt(va)}</span>
                    <div className="h-2 w-full max-w-[220px] bg-surface-2"><div className="ml-auto h-full" style={{ width: `${(va / max) * 100}%`, background: SERIES[0] }} /></div>
                  </div>
                  <span className="w-4 text-center text-xs text-muted">{better === "a" ? "◀" : better === "b" ? "▶" : "="}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full max-w-[220px] bg-surface-2"><div className="h-full" style={{ width: `${(vb / max) * 100}%`, background: SERIES[1] }} /></div>
                    <span className={`text-sm tabular-nums ${better === "b" ? "font-bold" : "text-muted"}`}>{m.fmt(vb)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-muted">La flèche indique l&apos;arme avantagée sur chaque critère (pour le prix, le rechargement et la déviation, la valeur la plus basse l&apos;emporte).</p>
      </div>
    </div>
  );
}
