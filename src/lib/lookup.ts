import { slugify } from "./utils";

/** Retrouve un élément de l'API par son nom (insensible aux accents / ponctuation). */
export function byName<T extends { displayName: string }>(list: T[], name: string): T | undefined {
  const s = slugify(name);
  return list.find((x) => slugify(x.displayName) === s);
}
