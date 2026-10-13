// ---------- valorant-api.com ----------

export interface ApiAbility {
  slot: "Ability1" | "Ability2" | "Grenade" | "Ultimate" | "Passive" | string;
  displayName: string;
  description: string;
  displayIcon: string | null;
}

export interface ApiAgent {
  uuid: string;
  displayName: string;
  description: string;
  developerName: string;
  displayIcon: string;
  displayIconSmall: string;
  bustPortrait: string | null;
  fullPortrait: string | null;
  fullPortraitV2?: string | null;
  killfeedPortrait: string;
  background: string | null;
  backgroundGradientColors: string[];
  isPlayableCharacter: boolean;
  role: { uuid: string; displayName: string; description: string; displayIcon: string } | null;
  abilities: ApiAbility[];
}

export interface ApiDamageRange {
  rangeStartMeters: number;
  rangeEndMeters: number;
  headDamage: number;
  bodyDamage: number;
  legDamage: number;
}

export interface ApiWeaponStats {
  fireRate: number;
  magazineSize: number;
  runSpeedMultiplier: number;
  equipTimeSeconds: number;
  reloadTimeSeconds: number;
  firstBulletAccuracy: number;
  shotgunPelletCount: number;
  wallPenetration: string;
  feature?: string | null;
  fireMode?: string | null;
  altFireType?: string | null;
  adsStats?: { zoomMultiplier: number; fireRate: number; runSpeedMultiplier: number; burstCount: number; firstBulletAccuracy: number } | null;
  damageRanges: ApiDamageRange[];
}

export interface ApiSkin {
  uuid: string;
  displayName: string;
  themeUuid: string;
  contentTierUuid: string | null;
  displayIcon: string | null;
  chromas: { uuid: string; displayName: string; displayIcon: string | null; fullRender: string | null; swatch: string | null }[];
  levels: { uuid: string; displayName: string; displayIcon: string | null; streamedVideo: string | null }[];
}

export interface ApiWeapon {
  uuid: string;
  displayName: string;
  category: string;
  defaultSkinUuid: string;
  displayIcon: string;
  killStreamIcon: string;
  weaponStats: ApiWeaponStats | null;
  shopData: { cost: number; category: string; categoryText: string } | null;
  skins: ApiSkin[];
}

export interface ApiCallout {
  regionName: string;
  superRegionName: string;
  location: { x: number; y: number };
}

export interface ApiMap {
  uuid: string;
  displayName: string;
  narrativeDescription: string | null;
  tacticalDescription: string | null;
  coordinates: string | null;
  displayIcon: string | null;
  listViewIcon: string;
  listViewIconTall?: string | null;
  splash: string;
  stylizedBackgroundImage?: string | null;
  premierBackgroundImage?: string | null;
  mapUrl: string;
  xMultiplier: number;
  yMultiplier: number;
  xScalarToAdd: number;
  yScalarToAdd: number;
  callouts: ApiCallout[] | null;
}

export interface ApiTier {
  tier: number;
  tierName: string;
  division: string;
  divisionName: string;
  color: string;
  backgroundColor: string;
  smallIcon: string | null;
  largeIcon: string | null;
}

export interface ApiCompetitiveTiers {
  uuid: string;
  assetObjectName: string;
  tiers: ApiTier[];
}

// ---------- Données éditoriales (dossier /data) ----------

export type Role = "Duelliste" | "Initiateur" | "Contrôleur" | "Sentinelle" | "Flex";
export type Region = "Americas" | "EMEA" | "Pacific" | "China";

export interface PlayerStats {
  rating: number;
  acs: number;
  kd: number;
  adr: number;
  kast: number;
  hs: number;
  fk: number; // first kills par map
  fd?: number; // first deaths par map
}

export interface Player {
  slug: string;
  ign: string;
  realName: string;
  country: string; // code ISO 3166-1 alpha-2
  team: string; // slug d'équipe
  role: Role;
  photo?: string;
  mainAgents: { agent: string; pickRate: number }[];
  stats: PlayerStats;
  career: { team: string; from: string; to?: string }[];
  achievements: { title: string; year: number; placement: string }[];
  socials: { twitch?: string; x?: string; youtube?: string; instagram?: string };
  recentMatches: { opponent: string; result: "V" | "D"; score: string; event: string; date: string; agent: string; acs: number; kda: string }[];
  settings?: {
    crosshair: string;
    dpi: number;
    sens: number;
    resolution?: string;
    mouse?: string;
  };
  featured?: boolean;
}

export interface Team {
  slug: string;
  name: string;
  tag: string;
  region: Region;
  country: string;
  color: string;
  logo?: string;
  founded?: number;
  coach?: string;
  points: number; // points de circuit VCT (classement)
  achievements: { title: string; year: number; placement: string }[];
  socials?: { x?: string; website?: string };
}

export interface MatchItem {
  id: string;
  event: string;
  stage: string;
  date: string; // ISO
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  status: "terminé" | "à venir" | "en direct";
  bestOf: number;
  maps?: { map: string; scoreA: number; scoreB: number }[];
}

export interface BracketMatch {
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
}

export interface Tournament {
  slug: string;
  name: string;
  tier: "Champions" | "Masters" | "VCT Ligue" | "Challengers";
  region: Region | "International";
  location: string;
  start: string;
  end: string;
  prizePool: string;
  status: "terminé" | "en cours" | "à venir";
  winner?: string;
  teams: string[];
  bracket?: { name: string; matches: BracketMatch[] }[];
}

export type Tier = "S" | "A" | "B" | "C" | "D";

export interface MetaData {
  updatedAt: string;
  patch: string;
  agentTiers: {
    global: Record<Tier, string[]>;
    byRank: Record<string, Record<Tier, string[]>>;
    byMap: Record<string, Record<Tier, string[]>>;
  };
  agentRates: Record<string, { pick: number; win: number; proPick: number }>;
  weaponTiers: { weapon: string; tier: Tier; rankedPick: number; proPick: number; note: string }[];
  maps: Record<
    string,
    {
      attackWin: number;
      defenseWin: number;
      playRate: number;
      bestAgents: string[];
      comps: { name: string; agents: string[]; winRate: number; note: string }[];
      tips: string[];
      inPool: boolean;
    }
  >;
  rankDistribution: { rank: string; percent: number }[];
  weaponTips: Record<string, { situations: string[]; tips: string }>;
}

export interface Lineup {
  id: string;
  map: string;
  agent: string;
  side: "Attaque" | "Défense";
  site: string;
  ability: string;
  title: string;
  description: string;
  video?: string;
}

export interface Patch {
  version: string;
  date: string;
  title: string;
  summary: string;
  highlights: string[];
  changes: {
    category: "Agents" | "Armes" | "Cartes" | "Systèmes" | "Mode de jeu";
    target: string;
    type: "buff" | "nerf" | "ajustement" | "nouveau" | "correctif";
    details: string[];
  }[];
}
