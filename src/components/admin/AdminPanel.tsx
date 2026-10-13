"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Player, Role, Team } from "@/lib/types";
import { cn, REGION_LABELS, slugify } from "@/lib/utils";

type Data = Record<string, unknown> & { players: Player[]; teams: Team[] };
type Tab = "players" | "teams" | "json";
const JSON_COLLECTIONS = ["matches", "tournaments", "meta", "patches", "lineups", "site", "agent-costs"] as const;
const ROLES: Role[] = ["Duelliste", "Initiateur", "Contrôleur", "Sentinelle", "Flex"];
const TOKEN_KEY = "valodex-admin-token";

const emptyPlayer = (): Player => ({
  slug: "", ign: "", realName: "", country: "FR", team: "", role: "Duelliste", mainAgents: [],
  stats: { rating: 1, acs: 200, kd: 1, adr: 130, kast: 72, hs: 25, fk: 2, fd: 2 },
  career: [], achievements: [], socials: {}, recentMatches: [],
  settings: { crosshair: "0;P;c;5;h;0;f;0;0l;4;0o;2;0a;1;0f;0;1b;0", dpi: 800, sens: 0.35, resolution: "1920x1080" },
});
const emptyTeam = (): Team => ({ slug: "", name: "", tag: "", region: "EMEA", country: "FR", color: "#FF4655", points: 0, achievements: [], socials: {} });

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label mb-1 block">{label}</span>
      {children}
    </label>
  );
}

/** Champ texte JSON avec validation à la volée. */
function JsonField({ label, value, onChange, rows = 6 }: { label: string; value: unknown; onChange: (v: unknown) => void; rows?: number }) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [err, setErr] = useState<string | null>(null);
  const emitted = useRef<unknown>(value);
  // Ne reformate le texte que si la valeur change de l'extérieur (autre élément sélectionné).
  useEffect(() => {
    if (value !== emitted.current) {
      emitted.current = value;
      setText(JSON.stringify(value, null, 2));
      setErr(null);
    }
  }, [value]);
  return (
    <Field label={label}>
      <textarea
        className={cn("input font-mono text-xs", err && "border-nerf")}
        rows={rows}
        value={text}
        spellCheck={false}
        onChange={(e) => {
          setText(e.target.value);
          try {
            const v = JSON.parse(e.target.value);
            setErr(null);
            emitted.current = v;
            onChange(v);
          } catch (x) {
            setErr((x as Error).message);
          }
        }}
      />
      {err && <span className="text-xs text-nerf">JSON invalide : {err}</span>}
    </Field>
  );
}

export function AdminPanel({ initial, tokenConfigured }: { initial: Data; tokenConfigured: boolean }) {
  const [data, setData] = useState<Data>(initial);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<Tab>("players");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [selPlayer, setSelPlayer] = useState(0);
  const [selTeam, setSelTeam] = useState(0);
  const [jsonCol, setJsonCol] = useState<(typeof JSON_COLLECTIONS)[number]>("matches");
  const [q, setQ] = useState("");

  useEffect(() => {
    try {
      setToken(sessionStorage.getItem(TOKEN_KEY) ?? "");
    } catch {}
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.size) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (col: string, value: unknown) => {
    setData((d) => ({ ...d, [col]: value }) as Data);
    setDirty((s) => new Set(s).add(col));
  };

  const players = data.players;
  const teams = data.teams;
  const player = players[selPlayer];
  const team = teams[selTeam];
  const setPlayer = (patch: Partial<Player>) => update("players", players.map((p, i) => (i === selPlayer ? { ...p, ...patch } : p)));
  const setTeam = (patch: Partial<Team>) => update("teams", teams.map((t, i) => (i === selTeam ? { ...t, ...patch } : t)));

  const save = async (col: string) => {
    setStatus(null);
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {}
    const res = await fetch(`/api/admin/${col}`, { method: "PUT", headers: { "content-type": "application/json", "x-admin-token": token }, body: JSON.stringify(data[col]) });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setDirty((s) => {
        const n = new Set(s);
        n.delete(col);
        return n;
      });
      setStatus({ ok: true, msg: `« ${col} » enregistré. Les pages seront mises à jour sous peu.` });
    } else {
      setStatus({ ok: false, msg: json.error ?? `Erreur ${res.status}` });
    }
  };

  const download = (col: string) => {
    const blob = new Blob([JSON.stringify(data[col], null, 2) + "\n"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${col}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const currentCol = tab === "players" ? "players" : tab === "teams" ? "teams" : jsonCol;
  const filteredPlayers = useMemo(() => players.map((p, i) => ({ p, i })).filter(({ p }) => `${p.ign} ${p.realName} ${p.team}`.toLowerCase().includes(q.toLowerCase())), [players, q]);
  const num = (v: string) => (v === "" ? 0 : Number(v));

  return (
    <div className="space-y-6">
      {!tokenConfigured && (
        <div className="border-l-2 border-gold bg-gold/10 p-4 text-sm">
          <strong>Mode lecture seule :</strong> la variable d&apos;environnement <code>ADMIN_TOKEN</code> n&apos;est pas définie sur le serveur. Vous pouvez modifier les données et
          <strong> télécharger le JSON</strong> pour remplacer le fichier correspondant dans <code>/data</code>.
        </div>
      )}

      <div className="glass sticky top-16 z-20 flex flex-wrap items-center gap-3 p-3">
        {(["players", "teams", "json"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("chip", tab === t ? "border-accent bg-accent text-white" : "hover:border-accent")}>
            {t === "players" ? `Joueurs (${players.length})` : t === "teams" ? `Équipes (${teams.length})` : "Autres données (JSON)"}
          </button>
        ))}
        <input type="password" className="input ml-auto w-48" placeholder="Jeton admin" value={token} onChange={(e) => setToken(e.target.value)} aria-label="Jeton d'administration" />
        <button className="btn-primary" onClick={() => save(currentCol)} disabled={!tokenConfigured}>
          Enregistrer {dirty.has(currentCol) && "•"}
        </button>
        <button className="btn-ghost" onClick={() => download(currentCol)}>Télécharger JSON</button>
      </div>
      {status && <p className={cn("text-sm", status.ok ? "text-buff" : "text-nerf")} role="status">{status.msg}</p>}

      {tab === "players" && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="card max-h-[75vh] overflow-y-auto">
            <div className="sticky top-0 space-y-2 border-b border-line bg-surface p-3">
              <input className="input" placeholder="Filtrer…" value={q} onChange={(e) => setQ(e.target.value)} />
              <button
                className="btn-primary w-full"
                onClick={() => {
                  update("players", [...players, emptyPlayer()]);
                  setSelPlayer(players.length);
                }}
              >
                + Nouveau joueur
              </button>
            </div>
            <ul>
              {filteredPlayers.map(({ p, i }) => (
                <li key={i}>
                  <button onClick={() => setSelPlayer(i)} className={cn("w-full px-3 py-2 text-left text-sm transition", i === selPlayer ? "bg-accent text-white" : "hover:bg-surface-2")}>
                    <span className="font-semibold">{p.ign || "(sans nom)"}</span> <span className="opacity-70">· {p.team}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {player ? (
            <div className="card space-y-6 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="h-display text-3xl">{player.ign || "Nouveau joueur"}</h2>
                <button
                  className="btn-ghost text-nerf"
                  onClick={() => {
                    if (!confirm(`Supprimer ${player.ign || "ce joueur"} ?`)) return;
                    update("players", players.filter((_, i) => i !== selPlayer));
                    setSelPlayer(0);
                  }}
                >
                  Supprimer
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Pseudo (IGN)"><input className="input" value={player.ign} onChange={(e) => setPlayer({ ign: e.target.value, slug: player.slug || slugify(e.target.value) })} /></Field>
                <Field label="Slug (URL)"><input className="input" value={player.slug} onChange={(e) => setPlayer({ slug: slugify(e.target.value) })} /></Field>
                <Field label="Nom réel"><input className="input" value={player.realName} onChange={(e) => setPlayer({ realName: e.target.value })} /></Field>
                <Field label="Pays (code ISO, ex. FR)"><input className="input" maxLength={2} value={player.country} onChange={(e) => setPlayer({ country: e.target.value.toUpperCase() })} /></Field>
                <Field label="Équipe">
                  <select className="input" value={player.team} onChange={(e) => setPlayer({ team: e.target.value })}>
                    <option value="">—</option>
                    {teams.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                  </select>
                </Field>
                <Field label="Rôle">
                  <select className="input" value={player.role} onChange={(e) => setPlayer({ role: e.target.value as Role })}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Photo (URL, optionnel)" className="sm:col-span-2"><input className="input" value={player.photo ?? ""} onChange={(e) => setPlayer({ photo: e.target.value || undefined })} /></Field>
                <label className="flex items-center gap-2 self-end pb-2 text-sm">
                  <input type="checkbox" checked={Boolean(player.featured)} onChange={(e) => setPlayer({ featured: e.target.checked || undefined })} /> Mis en avant
                </label>
              </div>

              <fieldset>
                <legend className="label mb-2">Statistiques</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(["rating", "acs", "kd", "adr", "kast", "hs", "fk", "fd"] as const).map((k) => (
                    <Field key={k} label={k.toUpperCase()}>
                      <input type="number" step="0.01" className="input" value={player.stats[k] ?? 0} onChange={(e) => setPlayer({ stats: { ...player.stats, [k]: num(e.target.value) } })} />
                    </Field>
                  ))}
                </div>
              </fieldset>

              <Field label="Agents principaux (format : Jett:45, Raze:30)">
                <input
                  className="input"
                  defaultValue={player.mainAgents.map((a) => `${a.agent}:${a.pickRate}`).join(", ")}
                  key={`agents-${selPlayer}`}
                  onBlur={(e) =>
                    setPlayer({
                      mainAgents: e.target.value.split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
                        const [agent, rate] = s.split(":");
                        return { agent: agent.trim(), pickRate: Number(rate) || 0 };
                      }),
                    })
                  }
                />
              </Field>

              <fieldset>
                <legend className="label mb-2">Réseaux sociaux</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(["twitch", "x", "youtube"] as const).map((k) => (
                    <Field key={k} label={k}><input className="input" value={player.socials[k] ?? ""} onChange={(e) => setPlayer({ socials: { ...player.socials, [k]: e.target.value || undefined } })} /></Field>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="label mb-2">Réglages</legend>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Field label="Code réticule" className="lg:col-span-2"><input className="input font-mono text-xs" value={player.settings?.crosshair ?? ""} onChange={(e) => setPlayer({ settings: { ...emptyPlayer().settings!, ...player.settings, crosshair: e.target.value } })} /></Field>
                  <Field label="DPI"><input type="number" className="input" value={player.settings?.dpi ?? 800} onChange={(e) => setPlayer({ settings: { ...emptyPlayer().settings!, ...player.settings, dpi: num(e.target.value) } })} /></Field>
                  <Field label="Sensibilité"><input type="number" step="0.001" className="input" value={player.settings?.sens ?? 0.35} onChange={(e) => setPlayer({ settings: { ...emptyPlayer().settings!, ...player.settings, sens: num(e.target.value) } })} /></Field>
                  <Field label="Résolution"><input className="input" value={player.settings?.resolution ?? ""} onChange={(e) => setPlayer({ settings: { ...emptyPlayer().settings!, ...player.settings, resolution: e.target.value } })} /></Field>
                </div>
              </fieldset>

              <div className="grid gap-4 lg:grid-cols-2">
                <JsonField label="Carrière [{ team, from: AAAA-MM, to? }]" value={player.career} onChange={(v) => setPlayer({ career: v as Player["career"] })} />
                <JsonField label="Palmarès [{ title, year, placement }]" value={player.achievements} onChange={(v) => setPlayer({ achievements: v as Player["achievements"] })} />
              </div>
              <JsonField label="Matchs récents" value={player.recentMatches} onChange={(v) => setPlayer({ recentMatches: v as Player["recentMatches"] })} rows={10} />
            </div>
          ) : (
            <p className="text-muted">Aucun joueur sélectionné.</p>
          )}
        </div>
      )}

      {tab === "teams" && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="card max-h-[75vh] overflow-y-auto">
            <div className="sticky top-0 border-b border-line bg-surface p-3">
              <button
                className="btn-primary w-full"
                onClick={() => {
                  update("teams", [...teams, emptyTeam()]);
                  setSelTeam(teams.length);
                }}
              >
                + Nouvelle équipe
              </button>
            </div>
            <ul>
              {teams.map((t, i) => (
                <li key={i}>
                  <button onClick={() => setSelTeam(i)} className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition", i === selTeam ? "bg-accent text-white" : "hover:bg-surface-2")}>
                    <span className="h-3 w-3" style={{ background: t.color }} />
                    <span className="font-semibold">{t.name || "(sans nom)"}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          {team ? (
            <div className="card space-y-6 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="h-display text-3xl">{team.name || "Nouvelle équipe"}</h2>
                <button
                  className="btn-ghost text-nerf"
                  onClick={() => {
                    const used = players.filter((p) => p.team === team.slug).length;
                    if (!confirm(used ? `${used} joueur(s) sont rattachés à cette équipe. Supprimer quand même ?` : `Supprimer ${team.name || "cette équipe"} ?`)) return;
                    update("teams", teams.filter((_, i) => i !== selTeam));
                    setSelTeam(0);
                  }}
                >
                  Supprimer
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Nom"><input className="input" value={team.name} onChange={(e) => setTeam({ name: e.target.value, slug: team.slug || slugify(e.target.value) })} /></Field>
                <Field label="Slug (URL)"><input className="input" value={team.slug} onChange={(e) => setTeam({ slug: slugify(e.target.value) })} /></Field>
                <Field label="Tag"><input className="input" value={team.tag} maxLength={5} onChange={(e) => setTeam({ tag: e.target.value.toUpperCase() })} /></Field>
                <Field label="Région">
                  <select className="input" value={team.region} onChange={(e) => setTeam({ region: e.target.value as Team["region"] })}>
                    {(["Americas", "EMEA", "Pacific", "China"] as const).map((r) => <option key={r} value={r}>{REGION_LABELS[r]}</option>)}
                  </select>
                </Field>
                <Field label="Pays (ISO)"><input className="input" maxLength={2} value={team.country} onChange={(e) => setTeam({ country: e.target.value.toUpperCase() })} /></Field>
                <Field label="Couleur"><input type="color" className="input h-10 p-1" value={team.color} onChange={(e) => setTeam({ color: e.target.value })} /></Field>
                <Field label="Logo (URL, optionnel)" className="sm:col-span-2"><input className="input" value={team.logo ?? ""} onChange={(e) => setTeam({ logo: e.target.value || undefined })} /></Field>
                <Field label="Fondée en"><input type="number" className="input" value={team.founded ?? ""} onChange={(e) => setTeam({ founded: e.target.value ? Number(e.target.value) : undefined })} /></Field>
                <Field label="Coach"><input className="input" value={team.coach ?? ""} onChange={(e) => setTeam({ coach: e.target.value || undefined })} /></Field>
                <Field label="Points VCT"><input type="number" className="input" value={team.points} onChange={(e) => setTeam({ points: num(e.target.value) })} /></Field>
                <Field label="X / Twitter"><input className="input" value={team.socials?.x ?? ""} onChange={(e) => setTeam({ socials: { ...team.socials, x: e.target.value || undefined } })} /></Field>
              </div>
              <JsonField label="Palmarès [{ title, year, placement }]" value={team.achievements} onChange={(v) => setTeam({ achievements: v as Team["achievements"] })} />
              <div>
                <p className="label mb-2">Effectif actuel</p>
                <p className="text-sm text-muted">{players.filter((p) => p.team === team.slug).map((p) => p.ign).join(", ") || "Aucun joueur — assignez des joueurs depuis l'onglet Joueurs."}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted">Aucune équipe sélectionnée.</p>
          )}
        </div>
      )}

      {tab === "json" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {JSON_COLLECTIONS.map((c) => (
              <button key={c} onClick={() => setJsonCol(c)} className={cn("chip", jsonCol === c ? "border-accent bg-accent text-white" : "hover:border-accent")}>
                {c}.json {dirty.has(c) && "•"}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">
            Éditez directement le fichier <code>data/{jsonCol}.json</code>. Pensez à mettre à jour les dates dans <code>site.json → updatedAt</code> pour afficher la date de dernière mise à jour.
          </p>
          <JsonField key={jsonCol} label={`${jsonCol}.json`} value={data[jsonCol]} onChange={(v) => update(jsonCol, v)} rows={28} />
        </div>
      )}
    </div>
  );
}
