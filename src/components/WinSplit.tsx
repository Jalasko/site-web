import { pct } from "@/lib/utils";

/** Barre attaque / défense (somme = 100 %), étiquetée des deux côtés. */
export function WinSplit({ attack, defense }: { attack: number; defense: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-semibold text-accent">Attaque {pct(attack)}</span>
        <span className="font-semibold text-teal">Défense {pct(defense)}</span>
      </div>
      <div className="flex h-2 gap-0.5">
        <div className="bg-accent" style={{ width: `${attack}%` }} />
        <div className="bg-teal" style={{ width: `${defense}%` }} />
      </div>
    </div>
  );
}
