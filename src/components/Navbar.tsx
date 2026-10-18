"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon, HeartIcon, LogoMark, MenuIcon, MoonIcon, SearchIcon, SunIcon } from "./Icons";
import { useFavorites, useTheme } from "./Providers";
import { SearchBox } from "./SearchBox";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/joueurs", label: "Joueurs" },
  { href: "/armes", label: "Armes" },
  { href: "/agents", label: "Agents" },
  { href: "/cartes", label: "Cartes" },
  { href: "/esport", label: "Esport" },
  { href: "/guides", label: "Guides" },
  { href: "/actus", label: "Patch notes" },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { favorites, ready } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors",
          scrolled ? "glass border-line" : "border-transparent bg-bg/0"
        )}
      >
        <nav className="container-x flex h-16 items-center gap-4" aria-label="Navigation principale">
          <Link href="/" className="flex items-center gap-2" aria-label="ValoStats — accueil">
            <LogoMark />
            <span className="h-display text-2xl">
              Valo<span className="text-accent">Stats</span>
            </span>
          </Link>

          <ul className="ml-6 hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-semibold uppercase tracking-wider transition hover:text-accent",
                    isActive(l.href) ? "text-accent" : "text-fg/80"
                  )}
                >
                  {l.label}
                  {isActive(l.href) && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 bg-accent" />}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 border border-line px-3 py-2 text-sm text-muted transition hover:border-accent hover:text-fg"
              aria-label="Ouvrir la recherche"
            >
              <SearchIcon width={16} height={16} />
              <span className="hidden md:inline">Rechercher</span>
              <kbd className="hidden border border-line px-1.5 text-[10px] md:inline">Ctrl K</kbd>
            </button>
            <Link href="/favoris" className="relative p-2 transition hover:text-accent" aria-label="Mes favoris">
              <HeartIcon />
              {ready && favorites.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-accent px-1 text-[10px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </Link>
            <button onClick={toggle} className="p-2 transition hover:text-accent" aria-label={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}>
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button onClick={() => setMenuOpen((o) => !o)} className="p-2 lg:hidden" aria-label="Menu" aria-expanded={menuOpen}>
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="glass border-t border-line lg:hidden">
            <ul className="container-x grid grid-cols-2 gap-1 py-3">
              {[...LINKS, { href: "/favoris", label: "Favoris" }].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn("block px-3 py-3 text-sm font-semibold uppercase tracking-wider", isActive(l.href) ? "bg-accent text-white" : "hover:bg-surface-2")}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl animate-fade-up" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Recherche globale">
            <SearchBox autoFocus size="lg" onNavigate={() => setSearchOpen(false)} />
            <p className="mt-3 text-center text-xs text-white/60">Échap pour fermer · ↑ ↓ pour naviguer · Entrée pour ouvrir</p>
          </div>
        </div>
      )}
    </>
  );
}
