import Link from "next/link";
import { getSite } from "@/lib/data";
import { UpdatedAt } from "./ui";

/** Bandeau « données d'exemple », masqué via sampleDataNotice dans data/site.json. */
export async function DataNotice({ date }: { date?: string }) {
  const site = await getSite();
  if (!site.sampleDataNotice) return null;
  return (
    <div className="flex flex-col gap-1 border-l-2 border-gold bg-gold/10 px-4 py-3 text-xs text-fg/80 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Statistiques, effectifs et résultats esport fournis à titre indicatif (données d&apos;exemple). Ils sont modifiables depuis l&apos;
        <Link href="/admin" className="font-semibold underline">espace admin</Link>.
      </p>
      {date && <UpdatedAt date={date} />}
    </div>
  );
}

