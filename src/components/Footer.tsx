import Link from "next/link";
import { LogoMark } from "./Icons";

const COLS = [
  { title: "Base de données", links: [["/joueurs", "Joueurs pro"], ["/agents", "Agents"], ["/armes", "Armes"], ["/cartes", "Cartes"]] },
  { title: "Compétition", links: [["/esport", "Calendrier & résultats"], ["/esport#classement", "Classement des équipes"], ["/joueurs/comparer", "Comparer des joueurs"]] },
  { title: "Progresser", links: [["/guides", "Guides & rangs"], ["/guides/reglages-pro", "Réglages des pros"], ["/agents/tier-list", "Tier list"], ["/actus", "Patch notes"]] },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-line bg-surface">
      <div className="absolute left-0 top-0 h-0.5 w-32 bg-accent" />
      <div className="container-x grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="h-display text-2xl">
              Valo<span className="text-accent">Dex</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted">Le hub d&apos;informations fan-made sur VALORANT : joueurs pro, armes, agents, cartes, esport et méta.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h2 className="label mb-3">{c.title}</h2>
            <ul className="space-y-2 text-sm">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-fg/80 transition hover:text-accent">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>ValoDex n&apos;est pas affilié à Riot Games. VALORANT et Riot Games sont des marques déposées de Riot Games, Inc.</p>
          <p>
            Données de jeu : <a className="underline hover:text-accent" href="https://valorant-api.com" target="_blank" rel="noopener noreferrer">valorant-api.com</a> ·{" "}
            <Link href="/admin" className="underline hover:text-accent">Admin</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
