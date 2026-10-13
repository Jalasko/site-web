import { timingSafeEqual } from "node:crypto";
import { writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { COLLECTIONS, DATA_DIR, type Collection } from "@/lib/data";

export const dynamic = "force-dynamic";

const ARRAY_COLLECTIONS: Collection[] = ["players", "teams", "matches", "tournaments", "patches", "lineups"];

function authorized(req: NextRequest) {
  const expected = process.env.ADMIN_TOKEN;
  const given = req.headers.get("x-admin-token") ?? "";
  if (!expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function validate(collection: Collection, data: unknown): string | null {
  if (ARRAY_COLLECTIONS.includes(collection)) {
    if (!Array.isArray(data)) return "Le contenu doit être un tableau JSON.";
    if (collection === "players" || collection === "teams") {
      const slugs = new Set<string>();
      for (const [i, item] of data.entries()) {
        const it = item as Record<string, unknown>;
        if (typeof it.slug !== "string" || !/^[a-z0-9-]+$/.test(it.slug)) return `Élément ${i + 1} : slug manquant ou invalide (minuscules, chiffres, tirets).`;
        if (slugs.has(it.slug)) return `Slug en double : « ${it.slug} ».`;
        slugs.add(it.slug);
        if (collection === "players" && (typeof it.ign !== "string" || typeof it.team !== "string" || typeof it.stats !== "object")) return `Joueur « ${it.slug} » : champs ign, team et stats requis.`;
        if (collection === "teams" && (typeof it.name !== "string" || typeof it.region !== "string")) return `Équipe « ${it.slug} » : champs name et region requis.`;
      }
    }
  } else if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return "Le contenu doit être un objet JSON.";
  }
  return null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  if (!COLLECTIONS.includes(collection as Collection)) return NextResponse.json({ error: "Collection inconnue." }, { status: 404 });
  if (!process.env.ADMIN_TOKEN) return NextResponse.json({ error: "ADMIN_TOKEN n'est pas défini sur le serveur : l'enregistrement est désactivé. Téléchargez le JSON et remplacez le fichier dans /data." }, { status: 503 });
  if (!authorized(req)) return NextResponse.json({ error: "Jeton d'administration invalide." }, { status: 401 });

  let data: unknown;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }
  const error = validate(collection as Collection, data);
  if (error) return NextResponse.json({ error }, { status: 422 });

  const file = path.join(DATA_DIR, `${collection}.json`);
  try {
    // Écriture atomique : fichier temporaire puis renommage.
    const tmp = `${file}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
    await rename(tmp, file);
  } catch (e) {
    return NextResponse.json({ error: `Écriture impossible (système de fichiers en lecture seule ?) : ${(e as Error).message}` }, { status: 500 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}
