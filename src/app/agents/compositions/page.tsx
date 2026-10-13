import type { Metadata } from "next";
import Link from "next/link";
import { getMeta } from "@/lib/data";
import { getAgents, getMaps } from "@/lib/valorant-api";
import { byName } from "@/lib/lookup";
import { normalizeRole, pct, ROLE_COLORS, slugify } from "@/lib/utils";
import { PageHeader, UpdatedAt } from "@/components/ui";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Meilleures compositions d'équipe VALORANT par carte",
  description: "Les meilleures compositions à 5 agents pour chaque carte de VALORANT, avec taux de victoire et explications.",
};

export default async function CompositionsPage() {
  const [meta, agents, maps] = await Promise.all([getMeta(), getAgents(), getMaps()]);
  const entries = Object.entries(meta.maps).sort((a, b) => Number(b[1].inPool) - Number(a[1].inPool) || b[1].playRate - a[1].playRate);
  return (
    <>
      <PageHeader kicker={`Patch ${meta.patch}`} title="Compositions par carte" description="Les line-ups d'agents les plus performants carte par carte, en ranked comme en compétition.">
        <UpdatedAt date={meta.updatedAt} />
      </PageHeader>
      <div className="container-x space-y-8 py-10">
        {entries.map(([slug, m]) => {
          const api = maps.find((x) => slugify(x.displayName) === slug);
          return (
            <section key={slug} id={slug} className="card clip-corner scroll-mt-24 overflow-hidden">
              <div className="relative flex items-center justify-between gap-4 border-b border-line px-5 py-4">
                {api && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={api.listViewIcon} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" loading="lazy" />
                )}
                <Link href={`/cartes/${slug}`} className="h-display relative text-4xl hover:text-accent">{api?.displayName ?? slug}</Link>
                <span className={`chip relative ${m.inPool ? "border-teal/50 text-teal" : "text-muted"}`}>{m.inPool ? "Pool compétitif" : "Hors rotation"}</span>
              </div>
              <ul className="divide-y divide-line">
                {m.comps.map((c) => (
                  <li key={c.name} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h3 className="font-semibold">{c.name}</h3>
                        <span className={`text-sm tabular-nums ${c.winRate >= 50 ? "text-buff" : "text-nerf"}`}>{pct(c.winRate)} de victoires</span>
                      </div>
                      <p className="mt-1 text-sm text-muted">{c.note}</p>
                    </div>
                    <ul className="flex gap-2">
                      {c.agents.map((name) => {
                        const a = byName(agents, name);
                        const role = String(normalizeRole(a?.role?.displayName));
                        return (
                          <li key={name}>
                            <Link href={`/agents/${slugify(name)}`} className="group flex flex-col items-center gap-1" title={`${name} — ${role}`}>
                              <span className="block h-12 w-12 overflow-hidden border-b-2 bg-surface-2 transition group-hover:-translate-y-0.5 sm:h-14 sm:w-14" style={{ borderColor: ROLE_COLORS[role] ?? "transparent" }}>
                                {a ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={a.displayIconSmall} alt={name} className="h-full w-full" loading="lazy" />
                                ) : (
                                  <span className="flex h-full items-center justify-center font-display">{name.slice(0, 2)}</span>
                                )}
                              </span>
                              <span className="text-[10px]">{name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
