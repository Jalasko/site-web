"use client";

import { useMemo, useState } from "react";

export function SkinsGallery({ skins }: { skins: { uuid: string; name: string; image: string }[] }) {
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(12);
  const [zoom, setZoom] = useState<{ name: string; image: string } | null>(null);
  const filtered = useMemo(() => skins.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())), [skins, q]);

  if (!skins.length) return <p className="text-muted">Aucun skin disponible pour cette arme.</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Rechercher un skin…" value={q} onChange={(e) => { setQ(e.target.value); setLimit(12); }} aria-label="Rechercher un skin" />
        <span className="text-sm text-muted">{filtered.length} skin{filtered.length > 1 ? "s" : ""}</span>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.slice(0, limit).map((s) => (
          <li key={s.uuid}>
            <button onClick={() => setZoom(s)} className="card card-hover group flex h-full w-full flex-col text-left">
              <span className="flex h-28 items-center justify-center bg-gradient-to-br from-surface-2 to-surface p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.name} loading="lazy" className="max-h-20 w-full object-contain transition duration-300 group-hover:scale-110" />
              </span>
              <span className="truncate border-t border-line px-3 py-2 text-xs font-medium">{s.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {limit < filtered.length && (
        <div className="mt-6 text-center">
          <button className="btn-ghost" onClick={() => setLimit((l) => l + 24)}>Voir plus ({filtered.length - limit})</button>
        </div>
      )}
      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur" onClick={() => setZoom(null)} role="dialog" aria-modal="true" aria-label={zoom.name}>
          <figure className="max-w-3xl text-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoom.image} alt={zoom.name} className="mx-auto max-h-[60vh] w-full object-contain" />
            <figcaption className="h-display mt-4 text-3xl text-white">{zoom.name}</figcaption>
            <button className="btn-primary mt-4" onClick={() => setZoom(null)}>Fermer</button>
          </figure>
        </div>
      )}
    </div>
  );
}
