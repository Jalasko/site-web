import type { Patch } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE: Record<string, { label: string; cls: string; icon: string }> = {
  buff: { label: "Buff", cls: "border-buff/50 bg-buff/10 text-buff", icon: "▲" },
  nerf: { label: "Nerf", cls: "border-nerf/50 bg-nerf/10 text-nerf", icon: "▼" },
  ajustement: { label: "Ajustement", cls: "border-gold/50 bg-gold/10 text-gold", icon: "◆" },
  nouveau: { label: "Nouveau", cls: "border-teal/50 bg-teal/10 text-teal", icon: "★" },
  correctif: { label: "Correctif", cls: "text-muted", icon: "✓" },
};

export function ChangeTypeBadge({ type }: { type: string }) {
  const t = TYPE[type] ?? TYPE.correctif;
  return <span className={cn("chip", t.cls)}>{t.icon} {t.label}</span>;
}

export function PatchChanges({ patch }: { patch: Patch }) {
  const cats = [...new Set(patch.changes.map((c) => c.category))];
  return (
    <div className="space-y-10">
      {cats.map((cat) => (
        <section key={cat}>
          <h2 className="h-display mb-4 text-3xl">{cat}</h2>
          <ul className="space-y-3">
            {patch.changes.filter((c) => c.category === cat).map((c) => (
              <li
                key={c.target}
                className={cn("card border-l-4 p-5", c.type === "buff" ? "border-l-buff" : c.type === "nerf" ? "border-l-nerf" : c.type === "nouveau" ? "border-l-teal" : "border-l-gold")}
              >
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h3 className="h-display text-2xl">{c.target}</h3>
                  <ChangeTypeBadge type={c.type} />
                </div>
                <ul className="space-y-1 text-sm text-fg/85">
                  {c.details.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span className={c.type === "buff" ? "text-buff" : c.type === "nerf" ? "text-nerf" : "text-muted"}>›</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
