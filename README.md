# ValoStats

Hub d'informations fan-made sur **VALORANT**, entièrement en français : joueurs pro, armes, agents, cartes, esport, méta, guides et patch notes.

> ValoStats n'est pas affilié à Riot Games. VALORANT et Riot Games sont des marques déposées de Riot Games, Inc.

## Stack

- **Next.js 16** (App Router, rendu serveur + ISR) et **React 19**
- **Tailwind CSS 4** (thème sombre/clair via variables CSS)
- **Recharts** (radar de comparaison, distribution des rangs)
- Données de jeu : [valorant-api.com](https://valorant-api.com) (gratuit, sans clé, langue `fr-FR`)
- Données éditoriales : fichiers JSON dans [`data/`](data/)

## Démarrer

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

### Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL publique (sitemap, robots, balises Open Graph). |
| `ADMIN_TOKEN` | Jeton exigé par l'espace `/admin` pour enregistrer. Sans lui, l'admin est en lecture seule (export JSON uniquement). |
| `VALORANT_API_URL` | Optionnel : autre base que `https://valorant-api.com/v1` (miroir, mock de test). |

## Pages

| Route | Contenu |
| --- | --- |
| `/` | Recherche globale, méta actuelle (top agents, armes, carte), résultats et matchs à venir, joueur de la semaine, dernier patch |
| `/joueurs` | Grille filtrable (région, équipe, rôle, pays) et triable (rating, ACS, K/D, HS %) |
| `/joueurs/[slug]` | Stats, agents joués, carrière, palmarès, matchs récents, réseaux sociaux, réglages et réticule à copier |
| `/joueurs/comparer` | Comparaison de 2 joueurs avec radar (URL partageable `?a=…&b=…`) |
| `/armes` | Tier list (pick rate ranked/pro) et armes par catégorie |
| `/armes/[slug]` | Caractéristiques, table des dégâts tête/corps/jambes par distance, situations, galerie de skins |
| `/armes/comparer` | Comparateur d'armes |
| `/agents`, `/agents/[slug]` | Rôle, capacités et coûts, origine, lore, tier par rang et carte, pros, lineups |
| `/agents/tier-list` | Tier list globale / par rang / par carte, pick rate et win rate |
| `/agents/compositions` | Meilleures compositions par carte |
| `/cartes`, `/cartes/[slug]` | Minicarte avec callouts, sites, win rate attaque/défense, meilleurs agents, compositions, lineups |
| `/esport` | Calendrier, matchs en direct / à venir / terminés, classement par région |
| `/esport/tournois/[slug]` | Bracket, matchs, équipes |
| `/esport/equipes/[slug]` | Effectif, palmarès, résultats récents |
| `/guides` | Système de rangs (Fer → Radiant) avec répartition des joueurs, guides débutants |
| `/guides/reglages-pro` | DPI, sensibilité, eDPI et codes de réticule des pros (bouton copier) |
| `/actus` | Patch notes avec buffs (vert) et nerfs (rouge) |
| `/favoris` | Favoris enregistrés dans le `localStorage` |
| `/admin` | Back-office : formulaires joueurs/équipes, éditeur JSON pour le reste |

## Mettre à jour les données

Tout le contenu éditorial se trouve dans `data/` :

- `players.json`, `teams.json` : joueurs pro et équipes
- `matches.json`, `tournaments.json` : esport (matchs, calendrier, brackets)
- `meta.json` : tier lists, pick/win rates, compositions, stats des cartes, répartition des rangs
- `patches.json`, `lineups.json`, `agent-costs.json` (coûts et origines des agents)
- `site.json` : dates de « dernière mise à jour » affichées et joueur de la semaine

Deux façons de modifier :

1. **Espace `/admin`** (auto-hébergement) : définissez `ADMIN_TOKEN`, saisissez-le dans l'admin puis « Enregistrer ». Le fichier est réécrit et les pages se régénèrent.
2. **Hébergement en lecture seule** (Vercel…) : modifiez dans l'admin, cliquez « Télécharger JSON », remplacez le fichier dans `data/` et redéployez.

⚠️ Les statistiques, effectifs et résultats livrés sont des **données d'exemple** à vérifier et mettre à jour. Un bandeau l'indique sur les pages concernées ; passez `sampleDataNotice` à `false` dans `site.json` une fois les données vérifiées.

## Notes techniques

- Les appels à valorant-api.com sont mis en cache 24 h ; les pages sont régénérées toutes les heures (5 min pour l'esport). Si l'API est injoignable, la page affiche un message et se régénère plus tard.
- Recherche globale instantanée (`Ctrl/⌘ + K`) : index servi par `/api/search-index`, filtré côté client.
- SEO : métadonnées par page, `sitemap.xml`, `robots.txt`, données structurées JSON-LD sur les profils joueurs.
