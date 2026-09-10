/**
 * Calendrier éditorial — données de démonstration (session 6.1).
 *
 * Le contenu est déjà vendu dans les forfaits : ces écrans formalisent un
 * service existant, ils n'en créent pas un nouveau. Le client porté est
 * Acme Corp. (`lib/data/fiche-client.ts`), le même compte que la tâche #151
 * (`TASK_CONTENT`) — deux des articles ci-dessous sont exactement les deux
 * guides déjà livrés par cette tâche (mêmes titres, mêmes adresses), et le
 * troisième reprend le guide qu'elle décrit comme « en relecture ». Le reste
 * du calendrier prolonge la même opportunité longue traîne que la priorité
 * P-0431 / `p-0426` (« 45 mots-clés longue traîne inexploités », volume
 * cumulé ~8 400 recherches/mois) — jamais un mot-clé inventé sans rattache.
 *
 * Les rédacteurs sont repris tels quels de l'équipe de l'agence
 * (`lib/data/settings.ts` → `TEAM`) : Tom Bélanger (Rédacteur) et
 * Aïcha Lemaire (Spécialiste SEO). La relecture revient à Marie Chen,
 * chargée de compte d'Acme Corp partout ailleurs dans l'application.
 */

import type { Tone } from '@/components/ui/Atoms';
import { CLIENT } from '@/lib/data/fiche-client';
import { TEAM } from '@/lib/data/settings';

export const CT_CLIENT_ID = CLIENT.id;

export const CONTENU_CLIENT = {
  id: CLIENT.id,
  name: CLIENT.name,
  plan: CLIENT.plan,
  /** Nombre d'articles inclus au forfait — la raison commerciale de l'écran. */
  quota: 4,
  quotaLabel: '4 articles par mois',
} as const;

/** Seuil : un article publié depuis moins de 30 jours n'a pas de performance interprétable. */
export const CT_MEASURE_DAYS = 30;

/** « Aujourd'hui » du jeu de démonstration — même semaine que `agenda.ts` (mercredi 9 septembre 2026). */
export const CT_TODAY = '2026-09-09';

export const CT_MONTH_DEFAULT = '2026-09';

/* ── Cycle de vie d'un contenu ── */

export type ContenuState =
  | 'idee'
  | 'brief'
  | 'assigne'
  | 'redaction'
  | 'relecture'
  | 'publie'
  | 'mesure';

export const CT_STATES: Record<ContenuState, { label: string; tone: Tone; short: string }> = {
  idee: { label: 'Idée à cadrer', tone: 'neutral', short: 'Idée' },
  brief: { label: 'Brief en préparation', tone: 'neutral', short: 'Brief' },
  assigne: { label: 'Assigné', tone: 'blue', short: 'Assigné' },
  redaction: { label: 'En rédaction', tone: 'blue', short: 'Rédaction' },
  relecture: { label: 'En relecture', tone: 'yellow', short: 'Relecture' },
  publie: { label: 'Publié', tone: 'green', short: 'Publié' },
  mesure: { label: 'Publié et mesuré', tone: 'green', short: 'Mesuré' },
};

/** États comptant comme « livré » pour le quota du forfait. */
export const CT_DONE: readonly ContenuState[] = ['publie', 'mesure'];

/* ── Équipe — reprise telle quelle, pas de second roster ── */

const findMember = (initials: string) => {
  const m = TEAM.find((t) => t.initials === initials);
  if (!m) throw new Error(`Membre d'équipe introuvable : ${initials}`);
  return m;
};

export const CT_WRITERS = {
  TB: findMember('TB'),
  AL: findMember('AL'),
};
export type WriterKey = keyof typeof CT_WRITERS;

export const CT_REVIEWER = CLIENT.pm; // Marie Chen — chargée de compte d'Acme Corp.

/* ── Modèle ── */

export type ContenuPerf = { visits: number; pos: number; prevPos: number | null };

export type ContenuItem = {
  id: string;
  title: string;
  kw: string;
  vol: number;
  due: string;
  state: ContenuState;
  writer: WriterKey | null;
  url?: string;
  pubAt?: string;
  perf?: ContenuPerf | null;
  /** Né d'une opportunité repérée par Keyword Hunter — lien vers la priorité source. */
  fromKw?: boolean;
  /** Identifiant de la priorité source, pour `routes.priorite`. */
  prioSlug?: string;
  /** Identifiant de la preuve de valeur déjà au rapport, pour `routes.rapport`. */
  proof?: string;
};

/**
 * Huit contenus, du plus ancien (mesuré) au plus récent (idée). Trois
 * viennent tels quels de `TASK_CONTENT` (`lib/data/tache.ts`) : les deux
 * guides déjà publiés et le troisième, en relecture. Les autres prolongent
 * la même opportunité longue traîne (P-0431 / `p-0426`).
 */
export const CONTENU_ITEMS: ContenuItem[] = [
  {
    id: 'a-095',
    title: 'Balises title uniques : corriger les 12 pages dupliquées de votre catalogue',
    kw: 'balises title dupliquées e-commerce',
    vol: 390,
    due: '2026-08-05',
    state: 'mesure',
    writer: 'TB',
    url: 'acmecorp.fr/blogue/balises-title-catalogue',
    pubAt: '5 août 2026',
    perf: { visits: 260, pos: 9, prevPos: 15 },
    proof: 'PV-090',
  },
  {
    id: 'a-101',
    title: 'Comment faire un audit SEO complet',
    kw: 'audit seo complet',
    vol: 880,
    due: '2026-09-05',
    state: 'publie',
    writer: 'TB',
    url: 'acmecorp.fr/blogue/guide-audit-seo-complet',
    pubAt: '5 septembre 2026',
    perf: null,
    proof: 'PV-082',
  },
  {
    id: 'a-102',
    title: 'Corriger les liens brisés',
    kw: 'corriger liens brisés site web',
    vol: 320,
    due: '2026-09-07',
    state: 'publie',
    writer: 'TB',
    url: 'acmecorp.fr/blogue/corriger-liens-brises',
    pubAt: '7 septembre 2026',
    perf: null,
    proof: 'PV-082',
  },
  {
    id: 'a-103',
    title: 'Comprendre les Core Web Vitals : ce que Google mesure vraiment',
    kw: 'core web vitals',
    vol: 720,
    due: '2026-09-16',
    state: 'relecture',
    writer: 'TB',
  },
  {
    id: 'a-104',
    title: 'Éviter le contenu dupliqué entre variantes de produits',
    kw: 'contenu dupliqué variantes produits',
    vol: 310,
    due: '2026-09-20',
    state: 'redaction',
    writer: 'AL',
    fromKw: true,
    prioSlug: 'p-0426',
  },
  {
    id: 'a-105',
    title: 'Structurer les URL d’une fiche produit pour le SEO',
    kw: 'structure url fiche produit seo',
    vol: 610,
    due: '2026-09-25',
    state: 'assigne',
    writer: 'TB',
    fromKw: true,
    prioSlug: 'p-0426',
  },
  {
    id: 'a-106',
    title: 'Balises canonical sur un catalogue : le guide complet',
    kw: 'balise canonical e-commerce',
    vol: 260,
    due: '2026-10-02',
    state: 'brief',
    writer: null,
    fromKw: true,
    prioSlug: 'p-0426',
  },
  {
    id: 'a-107',
    title: 'Vitesse de chargement du panier : les leviers qui comptent vraiment',
    kw: 'vitesse chargement panier e-commerce',
    vol: 180,
    due: '2026-10-09',
    state: 'idee',
    writer: null,
  },
];

export const CONTENU_IDS = CONTENU_ITEMS.map((c) => c.id);

/* ── Format et calculs ── */

export const ctMonth = (due: string): string => due.slice(0, 7);

/** Article en retard : l'échéance est passée et le contenu n'est pas publié. */
export const ctLate = (c: ContenuItem): boolean => !CT_DONE.includes(c.state) && c.due < CT_TODAY;

/* ── Scénarios de démonstration ── */

export type CtScenarioId = 'normal' | 'complet' | 'retard' | 'souscota' | 'vide';

export const CT_SCENARIOS: readonly (readonly [CtScenarioId, string])[] = [
  ['normal', 'Vue normale'],
  ['complet', 'Mois complet'],
  ['retard', 'Article en retard'],
  ['souscota', 'Quota du forfait non atteint'],
  ['vide', 'Aucun contenu planifié'],
];

export function ctScenario(id: CtScenarioId): { content: ContenuItem[]; month: string } {
  const all = CONTENU_ITEMS.map((c) => ({ ...c }));
  const month = CT_MONTH_DEFAULT;
  if (id === 'vide') return { content: [], month };
  if (id === 'complet') {
    return {
      content: all.map((c) =>
        ctMonth(c.due) === month && !CT_DONE.includes(c.state)
          ? {
              ...c,
              state: 'publie',
              pubAt: c.pubAt ?? '30 septembre 2026',
              url: c.url ?? `acmecorp.fr/blogue/${c.id}`,
              perf: null,
            }
          : c,
      ),
      month,
    };
  }
  if (id === 'retard') {
    return {
      content: all.map((c) =>
        c.id === 'a-103' ? { ...c, due: '2026-09-04' } : c.id === 'a-104' ? { ...c, due: '2026-09-08' } : c,
      ),
      month,
    };
  }
  if (id === 'souscota') {
    return { content: all.filter((c) => ctMonth(c.due) !== month || c.id === 'a-101'), month };
  }
  return { content: all, month };
}
