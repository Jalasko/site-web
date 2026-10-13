import type { Metadata } from "next";
import Link from "next/link";
import { getPatches } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { ArrowIcon } from "@/components/Icons";
import { PageHeader } from "@/components/ui";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Patch notes VALORANT — buffs, nerfs et nouveautés",
  description: "Résumé des derniers patch notes de VALORANT : buffs et nerfs d'agents et d'armes, changements de cartes et nouveautés.",
};

export default async function NewsPage() {
  const patches = await getPatches();
  return (
    <>
      <PageHeader kicker="Actualités" title="Patch notes" description="Les changements de chaque mise à jour, résumés et classés : buffs en vert, nerfs en rouge." />
      <div className="container-x py-10">
        <ol className="relative space-y-6 border-l border-line pl-6 md:pl-10">
          {patches.map((p, i) => {
            const buffs = p.changes.filter((c) => c.type === "buff").length;
            const nerfs = p.changes.filter((c) => c.type === "nerf").length;
            return (
              <li key={p.version} className="relative">
                <span className={`absolute -left-[31px] top-6 h-3 w-3 md:-left-[47px] ${i === 0 ? "bg-accent" : "border border-line bg-surface"}`} />
                <Link href={`/actus/${p.version}`} className="card card-hover clip-corner group block p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="h-display text-4xl text-accent">{p.version}</span>
                    <time className="text-sm text-muted" dateTime={p.date}>{formatDate(p.date)}</time>
                    {i === 0 && <span className="chip border-accent bg-accent text-white">Dernier patch</span>}
                  </div>
                  <h2 className="h-display mt-2 text-3xl transition group-hover:text-accent">{p.title}</h2>
                  <p className="mt-2 text-muted">{p.summary}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.highlights.map((h) => <li key={h} className="chip">{h}</li>)}
                  </ul>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="font-semibold text-buff">▲ {buffs} buff{buffs > 1 ? "s" : ""}</span>
                    <span className="font-semibold text-nerf">▼ {nerfs} nerf{nerfs > 1 ? "s" : ""}</span>
                    <span className="ml-auto flex items-center gap-1 font-semibold uppercase tracking-wider">Détails <ArrowIcon width={16} height={16} className="transition group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
