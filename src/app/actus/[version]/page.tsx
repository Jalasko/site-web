import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatches } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { PatchChanges } from "@/components/PatchChanges";
import { PageHeader } from "@/components/ui";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPatches()).map((p) => ({ version: p.version }));
}

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const { version } = await params;
  const p = (await getPatches()).find((x) => x.version === version);
  return p ? { title: `${p.title}`, description: p.summary } : { title: "Patch introuvable" };
}

export default async function PatchPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const p = (await getPatches()).find((x) => x.version === version);
  if (!p) notFound();
  return (
    <>
      <PageHeader kicker={`Patch ${p.version} · ${formatDate(p.date)}`} title={p.title.replace(/^Patch [\d.]+ — /, "")} description={p.summary}>
        <Link href="/actus" className="btn-ghost">Tous les patchs</Link>
      </PageHeader>
      <div className="container-x max-w-4xl py-10">
        <PatchChanges patch={p} />
      </div>
    </>
  );
}
