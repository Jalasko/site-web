import type { Metadata } from "next";
import { getMeta } from "@/lib/data";
import { getAgents, getMaps } from "@/lib/valorant-api";
import { agentLite, ratesOf } from "@/lib/agents";
import { pct, ROLE_COLORS, slugify } from "@/lib/utils";
import { AgentTierList } from "@/components/AgentTierList";
import { PageHeader, SectionHeading, UpdatedAt } from "@/components/ui";
import Link from "next/link";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Tier list des agents VALORANT — par rang et par carte",
  description: "La tier list des agents VALORANT du patch actuel : classement global, par rang (Fer à Radiant) et par carte, avec pick rate et win rate.",
};

export default async function TierListPage() {
  const [meta, agents, maps] = await Promise.all([getMeta(), getAgents(), getMaps()]);
  const lite = agents.map(agentLite);
  const mapNames = Object.fromEntries(Object.keys(meta.agentTiers.byMap).map((k) => [k, maps.find((m) => slugify(m.displayName) === k)?.displayName ?? k.charAt(0).toUpperCase() + k.slice(1)]));
  const rows = Object.entries(meta.agentRates).sort((a, b) => b[1].pick - a[1].pick);
  const role = Object.fromEntries(lite.map((a) => [a.slug, a.role]));

  return (
    <>
      <PageHeader kicker={`Patch ${meta.patch}`} title="Tier list des agents" description="Classement des agents selon leur efficacité actuelle : globalement, par tranche de rang et carte par carte.">
        <UpdatedAt date={meta.updatedAt} />
      </PageHeader>
      <div className="container-x space-y-14 py-10">
        <AgentTierList global={meta.agentTiers.global} byRank={meta.agentTiers.byRank} byMap={meta.agentTiers.byMap} agents={lite} mapNames={mapNames} />

        <section>
          <SectionHeading title="Pick rate & win rate" kicker="Ranked · toutes régions" />
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-surface-2 text-left">
                <tr className="label"><th className="px-4 py-3">#</th><th className="px-4 py-3">Agent</th><th className="px-4 py-3">Pick rate</th><th className="px-4 py-3 text-right">Win rate</th><th className="px-4 py-3 text-right">Pick pro</th></tr>
              </thead>
              <tbody>
                {rows.map(([name, r], i) => {
                  const s = slugify(name);
                  const a = lite.find((x) => x.slug === s);
                  return (
                    <tr key={name} className="border-t border-line hover:bg-surface">
                      <td className="px-4 py-2.5 text-muted">{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <Link href={`/agents/${s}`} className="flex items-center gap-3 font-semibold hover:text-accent">
                          {a && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.icon} alt="" className="h-8 w-8 bg-surface-2" loading="lazy" />
                          )}
                          {name}
                          {role[s] && <span className="text-[10px] uppercase tracking-wider" style={{ color: ROLE_COLORS[role[s]] }}>{role[s]}</span>}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 bg-surface-2"><div className="h-full bg-accent" style={{ width: `${(r.pick / rows[0][1].pick) * 100}%` }} /></div>
                          <span className="tabular-nums">{pct(r.pick)}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-2.5 text-right tabular-nums ${r.win >= 50 ? "text-buff" : "text-nerf"}`}>{pct(ratesOf(meta, name)?.win ?? r.win)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{pct(r.proPick, 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
