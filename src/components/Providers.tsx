"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ---------- Thème ----------
type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

// ---------- Favoris ----------
export type FavoriteType = "joueur" | "arme" | "agent" | "carte" | "équipe";
export interface Favorite {
  type: FavoriteType;
  id: string;
  name: string;
  href: string;
  image?: string;
  subtitle?: string;
}

interface FavCtx {
  favorites: Favorite[];
  isFavorite: (type: FavoriteType, id: string) => boolean;
  toggleFavorite: (fav: Favorite) => void;
  ready: boolean;
}
const FavoritesContext = createContext<FavCtx>({ favorites: [], isFavorite: () => false, toggleFavorite: () => {}, ready: false });
export const useFavorites = () => useContext(FavoritesContext);

const FAV_KEY = "valostats-favoris";
const THEME_KEY = "valostats-theme";

function safeGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible (navigation privée) */
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    try {
      const raw = safeGet(FAV_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      /* JSON corrompu : on repart de zéro */
    }
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_KEY && e.newValue) setFavorites(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      safeSet(THEME_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((type: FavoriteType, id: string) => favorites.some((f) => f.type === type && f.id === id), [favorites]);

  const toggleFavorite = useCallback((fav: Favorite) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.type === fav.type && f.id === fav.id);
      const next = exists ? prev.filter((f) => !(f.type === fav.type && f.id === fav.id)) : [...prev, fav];
      safeSet(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const themeValue = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  const favValue = useMemo(() => ({ favorites, isFavorite, toggleFavorite, ready }), [favorites, isFavorite, toggleFavorite, ready]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <FavoritesContext.Provider value={favValue}>{children}</FavoritesContext.Provider>
    </ThemeContext.Provider>
  );
}

/**
 * Script inline exécuté avant le rendu pour éviter le flash de thème.
 * Il récupère aussi les préférences enregistrées sous l'ancien nom du site (ValoDex).
 */
export const themeInitScript = `(function(){try{[['valodex-theme','${THEME_KEY}'],['valodex-favoris','${FAV_KEY}']].forEach(function(k){var v=localStorage.getItem(k[0]);if(v!==null){if(localStorage.getItem(k[1])===null){localStorage.setItem(k[1],v)}localStorage.removeItem(k[0])}});var t=localStorage.getItem('${THEME_KEY}');if(t==='light'){document.documentElement.classList.remove('dark')}}catch(e){}})();`;
