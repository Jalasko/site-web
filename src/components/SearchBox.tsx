"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "./Icons";
import { cn } from "@/lib/utils";

export interface SearchItem {
  type: "Joueur" | "Équipe" | "Agent" | "Arme" | "Carte";
  name: string;
  subtitle?: string;
  href: string;
  image?: string;
  keywords?: string;
}

let indexPromise: Promise<SearchItem[]> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/api/search-index")
    .then((r) => r.json() as Promise<SearchItem[]>)
    .catch(() => {
      indexPromise = null;
      return [];
    });
  return indexPromise;
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function SearchBox({ autoFocus, onNavigate, size = "md" }: { autoFocus?: boolean; onNavigate?: () => void; size?: "md" | "lg" }) {
  const [items, setItems] = useState<SearchItem[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) loadIndex().then(setItems);
  }, [autoFocus]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const results = useMemo(() => {
    const query = norm(q.trim());
    if (!query) return [];
    return items
      .map((it) => {
        const name = norm(it.name);
        const hay = norm(`${it.name} ${it.subtitle ?? ""} ${it.keywords ?? ""}`);
        const score = name.startsWith(query) ? 3 : name.includes(query) ? 2 : hay.includes(query) ? 1 : 0;
        return { it, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.it.name.localeCompare(b.it.name))
      .slice(0, 12)
      .map((x) => x.it);
  }, [q, items]);

  const go = (item: SearchItem) => {
    setOpen(false);
    setQ("");
    onNavigate?.();
    router.push(item.href);
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <label className="sr-only" htmlFor={`search-${size}`}>Rechercher</label>
      <div className={cn("glass flex items-center gap-3 px-4 focus-within:border-accent", size === "lg" ? "py-4" : "py-2.5")}>
        <SearchIcon className="shrink-0 text-accent" />
        <input
          id={`search-${size}`}
          autoFocus={autoFocus}
          value={q}
          onFocus={() => {
            setOpen(true);
            loadIndex().then(setItems);
          }}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && results[active]) {
              go(results[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder="Rechercher un joueur, un agent, une arme, une carte…"
          className={cn("w-full bg-transparent outline-none placeholder:text-muted", size === "lg" ? "text-lg" : "text-sm")}
          autoComplete="off"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={`search-results-${size}`}
        />
      </div>
      {open && q.trim() && (
        <ul
          id={`search-results-${size}`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto border border-line bg-surface shadow-2xl"
        >
          {results.length === 0 && <li className="px-4 py-3 text-sm text-muted">{items.length ? "Aucun résultat." : "Chargement…"}</li>}
          {results.map((r, i) => (
            <li key={`${r.type}-${r.href}`} role="option" aria-selected={i === active}>
              <Link
                href={r.href}
                onClick={(e) => {
                  e.preventDefault();
                  go(r);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn("flex items-center gap-3 px-4 py-2.5 transition", i === active && "bg-surface-2")}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-surface-2">
                  {r.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image} alt="" className="h-full w-full object-contain" loading="lazy" />
                  ) : (
                    <span className="font-display text-lg text-accent">{r.name.slice(0, 2)}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{r.name}</span>
                  {r.subtitle && <span className="block truncate text-xs text-muted">{r.subtitle}</span>}
                </span>
                <span className="chip shrink-0 text-[10px]">{r.type}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
