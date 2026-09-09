/**
 * Cadre commun des outils SEO — données et logique partagées par les sept
 * outils (session 2.1). Ce n'est pas un tableau de bord : un outil sert à
 * interroger, filtrer, exporter et agir sur des lignes de résultat.
 *
 * Le sélecteur de compte pré-remplit le domaine et mémorise le dernier
 * compte consulté. Les prospects y figurent aussi, distingués des clients —
 * sans quoi Organic Research et Domain Overview perdent leur usage
 * commercial (décision « Les outils sont rattachés à un client »).
 */

import { CLIENTS, type Entry } from '@/lib/data/clients';

export type ToolAccount = Pick<Entry, 'id' | 'name' | 'domain' | 'type'>;

/** Les cinq comptes utilisés dans les démonstrations des écrans d'outils. */
export const TOOL_ACCOUNT_IDS = [
  'acme-corp',
  'boreal-immobilier',
  'clinique-lavoie',
  'spa-nordik-estrie',
  'quincaillerie-fortin',
] as const;

export const TOOL_ACCOUNTS: ToolAccount[] = TOOL_ACCOUNT_IDS.map((id) => {
  const c = CLIENTS.find((e) => e.id === id);
  if (!c) throw new Error(`Compte outil introuvable dans CLIENTS : ${id}`);
  return { id: c.id, name: c.name, domain: c.domain, type: c.type };
});

const LAST_ACCOUNT_KEY = 'huntpilote-outil-compte';

/** Dernier compte consulté, tous outils confondus — c'est l'élément le plus utilisé de l'écran. */
export function readLastAccount(): string | null {
  try {
    return localStorage.getItem(LAST_ACCOUNT_KEY);
  } catch {
    return null;
  }
}

export function writeLastAccount(id: string): void {
  try {
    localStorage.setItem(LAST_ACCOUNT_KEY, id);
  } catch {
    /* stockage indisponible : la mémorisation reste limitée à la session */
  }
}

/** Filtre du sélecteur de compte. */
export type AccountFilter = 'clients' | 'prospects' | 'tous';

/**
 * Coût par période, pour les outils facturés « à la requête » — crédits du
 * fournisseur de données et équivalent en dollars. Certains outils (suivi de
 * positions, par exemple) ont un modèle de coût différent : ils passent
 * `costText`/`costTitle` à `ContextBar` plutôt que ces paliers.
 */
export const DEFAULT_COSTS: Record<string, { credits: number; dollars: string; weight: string }> = {
  '30 derniers jours': { credits: 12, dollars: '0,06 $', weight: 'Requête légère' },
  '3 derniers mois': { credits: 26, dollars: '0,13 $', weight: 'Requête moyenne' },
  '12 derniers mois': { credits: 48, dollars: '0,24 $', weight: 'Requête lourde' },
};

export const DEFAULT_PERIODS = ['30 derniers jours', '3 derniers mois', '12 derniers mois'];

/** Quota mensuel de l'agence chez le fournisseur de données. */
export type Quota = { used: number; max: number };

export const NORMAL_QUOTA: Quota = { used: 8240, max: 10000 };
export const NEAR_LIMIT_QUOTA: Quota = { used: 9610, max: 10000 };

/** Historique générique du panneau « Enregistré dans la fiche ». */
export type SaveEntry = { date: string; tool: string; what: string };

export const RECENT_SAVES: SaveEntry[] = [
  { date: '4 sept. 2026', tool: 'Position Tracking', what: '34 mots-clés · instantané mensuel' },
  { date: '28 août 2026', tool: 'Site Audit', what: 'Score technique 71 · 12 constats' },
  { date: '21 août 2026', tool: 'Backlink Analyse', what: '+18 domaines référents (delta)' },
];
