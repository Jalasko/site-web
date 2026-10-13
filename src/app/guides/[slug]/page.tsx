import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES } from "@/content/guides";
import { ArrowIcon } from "@/components/Icons";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  return g ? { title: `${g.title} — guide VALORANT`, description: g.summary } : { title: "Guide introuvable" };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idx = GUIDES.findIndex((g) => g.slug === slug);
  if (idx < 0) notFound();
  const g = GUIDES[idx];
  const next = GUIDES[(idx + 1) % GUIDES.length];
  return (
    <article className="container-x max-w-3xl py-12">
      <nav className="label mb-4" aria-label="Fil d'Ariane">
        <Link href="/guides" className="hover:text-accent">Guides</Link> / <span className="text-fg">{g.title}</span>
      </nav>
      <p className="label text-accent">{g.kicker} · {g.readingTime} min de lecture</p>
      <h1 className="h-display mt-2 text-6xl md:text-7xl">{g.title}</h1>
      <p className="mt-4 text-lg text-muted">{g.summary}</p>
      <div className="mt-10 space-y-10">
        {g.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="h-display mb-3 text-3xl">{s.heading}</h2>
            <div className="space-y-3 leading-relaxed text-fg/85">
              {s.body.map((p) => <p key={p}>{p}</p>)}
            </div>
            {s.tips && (
              <aside className="glass mt-4 p-4">
                <p className="label mb-2 text-accent">Conseils</p>
                <ul className="space-y-1.5 text-sm">
                  {s.tips.map((t) => <li key={t} className="accent-line">{t}</li>)}
                </ul>
              </aside>
            )}
          </section>
        ))}
      </div>
      <Link href={`/guides/${next.slug}`} className="card card-hover clip-corner group mt-14 flex items-center justify-between p-5">
        <span>
          <span className="label">Guide suivant</span>
          <span className="h-display block text-3xl transition group-hover:text-accent">{next.title}</span>
        </span>
        <ArrowIcon className="text-accent transition group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
