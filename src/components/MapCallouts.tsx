"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface CalloutPoint {
  label: string;
  region: string;
  x: number; // 0..1
  y: number; // 0..1
}

const REGION_COLORS: Record<string, string> = { A: "#FF4655", B: "#4C8DFF", C: "#F2C14E", Mid: "#3DD9B3" };

export function MapCallouts({ image, name, callouts }: { image: string; name: string; callouts: CalloutPoint[] }) {
  const [show, setShow] = useState(true);
  const [filter, setFilter] = useState("");
  const regions = [...new Set(callouts.map((c) => c.region))].sort();
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setShow((s) => !s)} className={cn("chip", show ? "border-accent text-accent" : "")} aria-pressed={show}>
          {show ? "Masquer" : "Afficher"} les callouts
        </button>
        {regions.map((r) => (
          <button key={r} onClick={() => setFilter((f) => (f === r ? "" : r))} className={cn("chip transition", filter === r && "bg-accent text-white border-accent")} aria-pressed={filter === r}>
            <span className="h-2 w-2" style={{ background: REGION_COLORS[r] ?? "#ECE8E1" }} />
            {r}
          </button>
        ))}
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-[640px] bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`Minicarte de ${name}`} className="h-full w-full object-contain" />
        {show &&
          callouts
            .filter((c) => !filter || c.region === filter)
            .map((c, i) => (
              <span
                key={`${c.label}-${i}`}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-black/75 px-1 py-px text-[9px] font-semibold uppercase text-white sm:text-[10px]"
                style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, borderLeft: `2px solid ${REGION_COLORS[c.region] ?? "#ECE8E1"}` }}
              >
                {c.label}
              </span>
            ))}
      </div>
    </div>
  );
}
