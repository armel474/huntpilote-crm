/**
 * Portail client — données de démonstration (session 5).
 *
 * Le compte principal du portail est **Acme Corp.**, le même client que le
 * rapport publié (`lib/data/rapport.ts`, session 1.3) et que la fiche client
 * (`lib/data/fiche-client.ts`). Le portail réutilise ce client réel plutôt que
 * d'en inventer un — la connexion, le tableau de bord et l'historique des
 * rapports racontent tous la même agence Acme Corp.
 *
 * L'état « client à plusieurs établissements » utilise **Clinique Lavoie**,
 * seul client du jeu de données qui a réellement plus d'un établissement
 * (`lib/data/local.ts` : Rive-Sud et Laval). Son résumé de tableau de bord
 * reprend ses vraies mesures locales (appels, itinéraires, visites, fiche
 * Google Business) plutôt que d'inventer un second rapport complet — Clinique
 * Lavoie n'a pas de rapport publié dans le jeu de données (`REPORT` ne modèle
 * qu'Acme Corp), donc ce résumé est composé à partir de ce qui existe vraiment
 * pour elle, pas recopié depuis le rapport d'Acme.
 */

import { CLIENTS } from '@/lib/data/clients';
import { ESTABS } from '@/lib/data/local';
import { REPORT } from '@/lib/data/rapport';

/* ── Compte connecté : Acme Corp. ── */

export const PORTAL_ACCOUNT = {
  clientId: REPORT.clientId,
  client: REPORT.client,
  person: 'Marie Tremblay',
  role: 'Directrice marketing',
  initials: 'MT',
  pm: REPORT.pm,
  pmInit: REPORT.pmInit,
  pmEmail: REPORT.pmEmail,
  since: 'avril 2026',
  phone: '514 555 0100',
} as const;

/** Adresses connues pour la connexion — l'inconnue déclenche l'état « adresse inconnue ». */
export const PORTAL_KNOWN_EMAILS = ['contact@acmecorp.fr', 'marie.tremblay@acmecorp.fr'];

export const PORTAL_LINK_MINUTES = 15;

/* ── Historique des rapports (12 mois), en tête duquel se trouve le rapport réel ── */

export type PortalVersion = { v: number; at: string; note: string; current: boolean };

export type PortalReportMonth = {
  id: string;
  label: string;
  short: string;
  period: string;
  published: boolean;
  publish: string | null;
  dataAt: string | null;
  score: number;
  first?: boolean;
  down?: boolean;
  proofsCount: number;
  versions?: readonly PortalVersion[];
};

/** Seuil de score inscrit au mandat — la trajectoire s'y compare toujours. */
export const PORTAL_TARGET_SCORE = 85;

const SEPT_PROOFS_COUNT = REPORT.proofs.filter((p) => p.on).length;
const SEPT_VERSIONS: readonly PortalVersion[] = REPORT.versions.map((v) => ({
  v: Number(v.v.replace('v', '')),
  at: v.date,
  note: v.note,
  current: v.v === REPORT.versions[0].v,
}));

/**
 * Douze mois de score pour Acme Corp. Le mois de septembre reprend
 * exactement les chiffres du rapport réel (`REPORT`) ; les mois précédents
 * complètent la trajectoire jusque-là pour que l'historique et la courbe
 * aient un sens — ce sont les seules valeurs de ce fichier qui ne
 * proviennent pas directement d'un autre fichier `lib/data/*`.
 */
export const PORTAL_HISTORY: readonly PortalReportMonth[] = [
  {
    id: 'oct25',
    label: 'Octobre 2025',
    short: 'oct.',
    period: 'Octobre 2025',
    published: false,
    publish: null,
    dataAt: null,
    score: 54,
    proofsCount: 0,
  },
  {
    id: 'nov25',
    label: 'Novembre 2025',
    short: 'nov.',
    period: 'Novembre 2025',
    published: true,
    publish: '2 décembre 2025',
    dataAt: '30 novembre 2025',
    score: 58,
    first: true,
    proofsCount: 2,
  },
  {
    id: 'dec25',
    label: 'Décembre 2025',
    short: 'déc.',
    period: 'Décembre 2025',
    published: true,
    publish: '2 janvier 2026',
    dataAt: '31 décembre 2025',
    score: 61,
    proofsCount: 3,
  },
  {
    id: 'jan26',
    label: 'Janvier 2026',
    short: 'janv.',
    period: 'Janvier 2026',
    published: true,
    publish: '2 février 2026',
    dataAt: '31 janvier 2026',
    score: 63,
    proofsCount: 2,
  },
  {
    id: 'fev26',
    label: 'Février 2026',
    short: 'févr.',
    period: 'Février 2026',
    published: true,
    publish: '2 mars 2026',
    dataAt: '28 février 2026',
    score: 66,
    proofsCount: 4,
  },
  {
    id: 'mar26',
    label: 'Mars 2026',
    short: 'mars',
    period: 'Mars 2026',
    published: true,
    publish: '2 avril 2026',
    dataAt: '31 mars 2026',
    score: 64,
    down: true,
    proofsCount: 1,
  },
  {
    id: 'avr26',
    label: 'Avril 2026',
    short: 'avr.',
    period: 'Avril 2026',
    published: true,
    publish: '2 mai 2026',
    dataAt: '30 avril 2026',
    score: 69,
    proofsCount: 3,
  },
  {
    id: 'mai26',
    label: 'Mai 2026',
    short: 'mai',
    period: 'Mai 2026',
    published: true,
    publish: '2 juin 2026',
    dataAt: '31 mai 2026',
    score: 72,
    proofsCount: 3,
  },
  {
    id: 'juin26',
    label: 'Juin 2026',
    short: 'juin',
    period: 'Juin 2026',
    published: true,
    publish: '2 juillet 2026',
    dataAt: '30 juin 2026',
    score: 74,
    proofsCount: 2,
  },
  {
    id: 'juil26',
    label: 'Juillet 2026',
    short: 'juil.',
    period: 'Juillet 2026',
    published: true,
    publish: '2 août 2026',
    dataAt: '31 juillet 2026',
    score: 81,
    proofsCount: 4,
  },
  {
    id: 'aout26',
    label: 'Août 2026',
    short: 'août',
    period: 'Août 2026',
    published: true,
    publish: '2 septembre 2026',
    dataAt: '31 août 2026',
    score: 87,
    proofsCount: 0,
  },
  {
    id: 'sept26',
    label: REPORT.period,
    short: 'sept.',
    period: REPORT.period,
    published: true,
    publish: REPORT.publish,
    dataAt: '30 septembre 2026',
    score: REPORT.score.now,
    proofsCount: SEPT_PROOFS_COUNT,
    versions: SEPT_VERSIONS,
  },
] as const;

export const PORTAL_PUBLISHED = PORTAL_HISTORY.filter((m) => m.published);

/** Étapes affichées au client qui se connecte avant tout premier rapport publié. */
export const PORTAL_ONBOARD_STEPS: readonly {
  state: 'done' | 'now' | 'todo';
  title: string;
  text: string;
}[] = [
  { state: 'done', title: 'Contrat signé', text: 'Le 12 septembre. Bienvenue chez HuntPilote.' },
  {
    state: 'done',
    title: 'Accès techniques connectés',
    text: 'Google Search Console et Google Analytics sont branchés depuis le 15 septembre.',
  },
  {
    state: 'now',
    title: 'Premier audit en cours',
    text: `${REPORT.pm} analyse votre présence en ligne, votre référencement et votre design. Terminé d’ici le 28 septembre.`,
  },
  {
    state: 'todo',
    title: 'Votre premier rapport',
    text: 'Publié ici le 2 octobre. Vous recevrez un courriel — rien à surveiller d’ici là.',
  },
];

/* ── État « client à plusieurs établissements » : Clinique Lavoie ── */

const lavoieClient = CLIENTS.find((c) => c.id === 'clinique-lavoie');
if (!lavoieClient || lavoieClient.type !== 'client') {
  throw new Error('Clinique Lavoie doit exister dans CLIENTS pour le portail.');
}

const lavoieEstabs = ESTABS.filter((e) => e.clientId === 'clinique-lavoie');

export const MULTI_ACCOUNT = {
  clientId: lavoieClient.id,
  client: lavoieClient.name,
  person: 'Sophie Lavoie',
  role: 'Directrice de clinique',
  initials: 'SL',
  pm: REPORT.pm,
  pmInit: REPORT.pmInit,
  pmEmail: REPORT.pmEmail,
  since: 'janvier 2026',
  phone: '514 555 0100',
  score: lavoieClient.score,
  scoreDelta: lavoieClient.scoreDelta,
} as const;

export type PortalPlace = { id: string; label: string; ville: string; ok: boolean };

/** Les deux établissements réels de Clinique Lavoie (`lib/data/local.ts`). */
export const MULTI_PLACES: readonly PortalPlace[] = lavoieEstabs.map((e) => ({
  id: e.id,
  label: e.name.replace('Clinique Lavoie — ', ''),
  ville: e.ville,
  ok: e.gbp === 'revendiquee',
}));

const lavoieLaval = lavoieEstabs.find((e) => e.id === 'lavoie-laval')!;
const lavoieRiveSud = lavoieEstabs.find((e) => e.id === 'lavoie-rs')!;

/** « Ce qui a bougé », par établissement — repris des statistiques réelles de la fiche locale. */
export type MultiStat = { label: string; value: number; delta: number; sentence: string };

export const MULTI_STATS: Record<'all' | 'lavoie-laval' | 'lavoie-rs', readonly MultiStat[]> = {
  'lavoie-laval': [
    {
      label: 'Appels depuis votre fiche',
      value: lavoieLaval.stats!.appels,
      delta: lavoieLaval.stats!.appelsD,
      sentence: 'Des patients qui vous appellent directement depuis votre fiche Google.',
    },
    {
      label: 'Demandes d’itinéraire',
      value: lavoieLaval.stats!.itin,
      delta: lavoieLaval.stats!.itinD,
      sentence: 'Des recherches qui se terminent par un trajet vers votre clinique.',
    },
    {
      label: 'Visites de votre fiche',
      value: lavoieLaval.stats!.visites,
      delta: lavoieLaval.stats!.visitesD,
      sentence: 'Le nombre de fois où votre fiche Google a été consultée ce mois-ci.',
    },
  ],
  'lavoie-rs': [],
  all: [
    {
      label: 'Appels depuis vos fiches',
      value: lavoieLaval.stats!.appels,
      delta: lavoieLaval.stats!.appelsD,
      sentence: 'Laval seulement — la fiche de Rive-Sud est suspendue, elle ne reçoit aucun appel.',
    },
    {
      label: 'Demandes d’itinéraire',
      value: lavoieLaval.stats!.itin,
      delta: lavoieLaval.stats!.itinD,
      sentence: 'Laval seulement — la fiche de Rive-Sud est suspendue, elle n’apparaît plus dans Maps.',
    },
    {
      label: 'Visites de vos fiches',
      value: lavoieLaval.stats!.visites,
      delta: lavoieLaval.stats!.visitesD,
      sentence: 'Laval seulement — la fiche de Rive-Sud est suspendue, elle n’apparaît plus dans Maps.',
    },
  ],
};

/** « Ce sur quoi on travaille » pour Clinique Lavoie — seules les priorités annoncées ou en traitement. */
export const MULTI_PRIORITIES: readonly {
  id: string;
  state: 'annonce' | 'traitement';
  place: string;
  title: string;
  text: string;
  pct: number;
  doing: string | null;
}[] = [
  {
    id: 'MP-1',
    state: 'traitement',
    place: 'Rive-Sud',
    title: 'Votre fiche de Rive-Sud est suspendue',
    text: 'Google a suspendu votre fiche de Rive-Sud le temps de valider votre adresse. Tant qu’elle est suspendue, votre clinique de Brossard n’apparaît plus dans les recherches ni dans Maps.',
    pct: 40,
    doing: 'Dossier de réactivation envoyé à Google le 3 septembre ; validation généralement sous 2 à 3 semaines.',
  },
  {
    id: 'MP-2',
    state: 'annonce',
    place: 'Laval',
    title: 'La zone desservie n’est pas configurée à Laval',
    text: 'Votre fiche de Laval ne précise pas les secteurs que vous desservez. Une personne qui cherche une clinique un peu plus loin que Laval a moins de chances de vous trouver.',
    pct: 0,
    doing: null,
  },
];

export const MULTI_NEXT: readonly (readonly [string, string])[] = [
  ['Suivre la réactivation de la fiche de Rive-Sud', 'Relance prévue auprès de Google si aucune réponse d’ici le 24 septembre.'],
  ['Configurer la zone desservie à Laval', 'Ajout des secteurs environnants dans votre fiche Google.'],
];

/* ── Échanges ── */

export type CtxKind = 'preuve' | 'priorite' | 'kpi' | 'rapport';

export const PORTAL_CTX_LABEL: Record<CtxKind, string> = {
  preuve: 'Preuve de valeur',
  priorite: 'Chantier en cours',
  kpi: 'Indicateur',
  rapport: 'Rapport',
};

export type PortalAnchor = { id: string; kind: CtxKind | null; label: string; from: string | null };

const proofA = REPORT.proofs.find((p) => p.id === 'PV-081')!;
const proofB = REPORT.proofs.find((p) => p.id === 'PV-082')!;
const prio = REPORT.priorities[0];
const kpiVisites = REPORT.kpis[0];
const kpiVitesse = REPORT.kpis[2];

export const PORTAL_ANCHORS: readonly PortalAnchor[] = [
  { id: 'a0', kind: null, label: 'Une question générale', from: null },
  { id: 'a1', kind: 'rapport', label: `Rapport de ${REPORT.period.toLowerCase()}`, from: `Publié le ${REPORT.publish}` },
  { id: 'a2', kind: 'preuve', label: proofA.title, from: `Rapport de ${REPORT.period.toLowerCase()} · Ce qu’on a fait` },
  { id: 'a3', kind: 'preuve', label: proofB.title, from: `Rapport de ${REPORT.period.toLowerCase()} · Ce qu’on a fait` },
  { id: 'a4', kind: 'priorite', label: prio.title, from: `Rapport de ${REPORT.period.toLowerCase()} · Ce sur quoi on travaille` },
  {
    id: 'a5',
    kind: 'kpi',
    label: `${kpiVisites.label} — ${kpiVisites.value}`,
    from: `Rapport de ${REPORT.period.toLowerCase()} · Ce qui a bougé`,
  },
  {
    id: 'a6',
    kind: 'kpi',
    label: `${kpiVitesse.label} — ${kpiVitesse.value}`,
    from: `Rapport de ${REPORT.period.toLowerCase()} · Ce qui a bougé`,
  },
];

export const portalAnchor = (id: string): PortalAnchor | undefined => PORTAL_ANCHORS.find((a) => a.id === id);

export type PortalFile = { name: string; size: string };

export type PortalMessage = {
  id: string;
  from: 'pm' | 'client';
  day: string;
  at: string;
  read: boolean;
  sent?: boolean;
  text: string;
  ctx: string;
  files?: readonly PortalFile[];
};

export const PORTAL_SLA_DAYS = 1;

export const PORTAL_THREAD: readonly PortalMessage[] = [
  {
    id: 'm1',
    from: 'pm',
    day: '2 octobre 2026',
    at: '08 h 04',
    read: true,
    ctx: 'a1',
    text: `Bonjour Marie, le rapport de ${REPORT.period.toLowerCase()} est en ligne. Le point le plus important : la vitesse d’affichage sur mobile est réglée, vos pages passent de 4,2 à 2,1 secondes. C’était ce qui vous coûtait le plus cher depuis le printemps. En octobre, on attaque les liens brisés.`,
    files: [{ name: `Rapport-${REPORT.slug}.pdf`, size: '1,2 Mo' }],
  },
  {
    id: 'm2',
    from: 'client',
    day: '3 octobre 2026',
    at: '14 h 40',
    read: true,
    ctx: 'a3',
    text: 'Merci ! Les deux nouveaux guides, on les relaie sur notre infolettre ? Et est-ce qu’il faut attendre quelque chose de votre côté avant de le faire ?',
  },
  {
    id: 'm3',
    from: 'pm',
    day: '3 octobre 2026',
    at: '15 h 05',
    read: true,
    ctx: 'a3',
    text: 'Oui, très bonne idée — un relais par infolettre amène des lectures tout de suite, et Google le remarque. Rien à attendre de notre côté : les deux pages sont en ligne et indexées. Je vous prépare deux accroches courtes d’ici vendredi.',
  },
  {
    id: 'm4',
    from: 'client',
    day: '6 octobre 2026',
    at: '09 h 22',
    read: true,
    ctx: 'a5',
    text: 'Une question sur un chiffre : les 38 400 visites, c’est uniquement Google ou tout le trafic du site ? Mon directeur me demande la comparaison avec nos campagnes payantes.',
    files: [{ name: 'Chiffres-campagnes-Q3.xlsx', size: '84 Ko' }],
  },
  {
    id: 'm5',
    from: 'pm',
    day: '6 octobre 2026',
    at: '11 h 48',
    read: false,
    ctx: 'a5',
    text: 'C’est uniquement ce qui vient des résultats de recherche Google, sans un sou de publicité. Vos campagnes payantes sont comptées à part — j’ai regardé votre fichier, je vous mets les deux côte à côte dans un tableau d’une page. Vous l’aurez demain matin.',
    files: [{ name: 'Organique-vs-payant-septembre.pdf', size: '640 Ko' }],
  },
];

/** Variante « question en attente de réponse » : le dernier message est du client, sans réponse encore. */
export const PORTAL_PENDING: readonly PortalMessage[] = [
  ...PORTAL_THREAD.slice(0, 4).map((m) => ({ ...m, read: true })),
  {
    id: 'm6',
    from: 'client',
    day: '9 octobre 2026',
    at: '08 h 15',
    read: true,
    sent: true,
    ctx: 'a0',
    text: 'Autre point : est-ce qu’on peut prévoir un appel avant la fin du mois pour parler du budget de l’an prochain ?',
  },
];
