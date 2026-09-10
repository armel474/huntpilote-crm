/**
 * Priorités transversales — données de démonstration (session 4.1).
 *
 * Deuxième écran transversal : toutes les priorités ouvertes du portefeuille,
 * triées par sévérité puis par ancienneté — jamais par client. Comme pour
 * `plan-travail.ts`, aucun jeu agrégé n'existait : celui-ci réutilise de
 * vrais comptes de `clients.ts` et les trois états de visibilité déjà
 * définis dans `priorite.ts` (règle 1 du socle).
 *
 * P-0418 (→ tâche #142) et P-0431 (→ tâche #151) sont les deux priorités
 * réellement assignées à une tâche détaillée en 1.2 — leurs lignes ferment
 * vraiment la boucle Priorité → Tâche. Les autres pointent vers des id
 * plausibles sans détail livré, comme documenté dans `plan-travail.ts`.
 */

import type { Severity } from '@/lib/data/priorite';
import type { Visibility } from '@/lib/data/priorite';

/** Seuil agence : au-delà, une priorité non assignée devient un problème d'agence. */
export const XP_AGE_WARN = 14;
/** Seuil « ancienne » : non traitée depuis plus d'un mois. */
export const XP_AGE_OLD = 30;

export type AuditDimension = 'Présence en ligne' | 'SEO' | 'Design';

export const AUDIT_DIMENSIONS: AuditDimension[] = ['Présence en ligne', 'SEO', 'Design'];

export type CrossPriority = {
  /** Identifiant affiché, format `P-0418`. */
  id: string;
  /** Segment d'URL vers `routes.priorite(clientId, slug)`. */
  slug: string;
  /** Vrai compte de `lib/data/clients.ts`. */
  clientId: string;
  sev: Severity;
  dim: AuditDimension;
  label: string;
  /** Jours écoulés depuis la détection. */
  age: number;
  vis: Visibility;
  assigned: boolean;
  /** Slug de la tâche du plan d'action, si `assigned`. */
  taskSlug?: string;
};

export const ALL_PRIORITIES: CrossPriority[] = [
  {
    id: 'P-0418',
    slug: 'p-0418',
    clientId: 'acme-corp',
    sev: 'critique',
    dim: 'SEO',
    label: 'LCP mobile à 4,2 s (p75) sur 6 pages stratégiques',
    age: 166,
    vis: 'traitement',
    assigned: true,
    taskSlug: '142',
  },
  {
    id: 'P-0611',
    slug: 'p-0611',
    clientId: 'dupont-sas',
    sev: 'critique',
    dim: 'Présence en ligne',
    label: 'Certificat SSL expiré depuis 4 jours',
    age: 4,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0588',
    slug: 'p-0588',
    clientId: 'clinique-lavoie',
    sev: 'critique',
    dim: 'SEO',
    label: 'robots.txt bloque 80 % du site à l’indexation',
    age: 6,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0560',
    slug: 'p-0560',
    clientId: 'le-marche-bio',
    sev: 'critique',
    dim: 'Présence en ligne',
    label: '48 pages en 404 depuis la refonte de mai',
    age: 41,
    vis: 'annonce',
    assigned: false,
  },
  {
    id: 'P-0392',
    slug: 'p-0392',
    clientId: 'boreal-immobilier',
    sev: 'critique',
    dim: 'Design',
    label: 'Formulaire de contact non fonctionnel sur mobile',
    age: 52,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0655',
    slug: 'p-0655',
    clientId: 'boreal-immobilier',
    sev: 'critique',
    dim: 'SEO',
    label: 'Site désindexé par Google depuis la migration',
    age: 2,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0656',
    slug: 'p-0656',
    clientId: 'dupont-sas',
    sev: 'critique',
    dim: 'SEO',
    label: 'Balise noindex laissée sur la page d’accueil',
    age: 1,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0657',
    slug: 'p-0657',
    clientId: 'clinique-lavoie',
    sev: 'critique',
    dim: 'Présence en ligne',
    label: 'Numéro de téléphone erroné sur la fiche Google',
    age: 1,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0421',
    slug: 'p-0421',
    clientId: 'acme-corp',
    sev: 'important',
    dim: 'SEO',
    label: 'Crawl interrompu après 128 pages (HTTP 429)',
    age: 12,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0503',
    slug: 'p-0503',
    clientId: 'le-marche-bio',
    sev: 'important',
    dim: 'Présence en ligne',
    label: 'Note Google en baisse : 4,1 vs 4,6 il y a 6 mois',
    age: 18,
    vis: 'annonce',
    assigned: false,
  },
  {
    id: 'P-0577',
    slug: 'p-0577',
    clientId: 'clinique-lavoie',
    sev: 'important',
    dim: 'SEO',
    label: '12 balises title dupliquées',
    age: 9,
    vis: 'traitement',
    assigned: true,
    taskSlug: '165',
  },
  {
    id: 'P-0344',
    slug: 'p-0344',
    clientId: 'dupont-sas',
    sev: 'important',
    dim: 'Design',
    label: 'Site non responsive sur tablette',
    age: 71,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0630',
    slug: 'p-0630',
    clientId: 'boreal-immobilier',
    sev: 'important',
    dim: 'SEO',
    label: 'Maillage interne absent sur 40 pages quartiers',
    age: 15,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0499',
    slug: 'p-0499',
    clientId: 'acme-corp',
    sev: 'important',
    dim: 'Design',
    label: 'Contraste insuffisant sur les boutons d’action principaux',
    age: 22,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0512',
    slug: 'p-0512',
    clientId: 'le-marche-bio',
    sev: 'important',
    dim: 'Présence en ligne',
    label: 'Fiche Google Maps incomplète (horaires, photos)',
    age: 5,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0431',
    slug: 'p-0426',
    // Même compte que la tâche #151 (`TASK_CONTENT`) qu'elle a produite —
    // l'agrégat XP_ALL d'origine la plaçait chez un autre pseudo-client ;
    // ici, priorité et tâche doivent rester le même compte réel.
    clientId: 'acme-corp',
    sev: 'opportunite',
    dim: 'SEO',
    label: '45 mots-clés longue traîne inexploités',
    age: 25,
    vis: 'traitement',
    assigned: true,
    taskSlug: '151',
  },
  {
    id: 'P-0470',
    slug: 'p-0470',
    clientId: 'dupont-sas',
    sev: 'opportunite',
    dim: 'Présence en ligne',
    label: 'Aucune présence sur les répertoires locaux',
    age: 33,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0481',
    slug: 'p-0481',
    clientId: 'boreal-immobilier',
    sev: 'opportunite',
    dim: 'Design',
    label: 'Aucune page dédiée pour les témoignages clients',
    age: 8,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0439',
    slug: 'p-0439',
    clientId: 'acme-corp',
    sev: 'opportunite',
    dim: 'SEO',
    label: 'Métadonnées OG absentes pour le partage social',
    age: 19,
    vis: 'interne',
    assigned: false,
  },
  {
    id: 'P-0522',
    slug: 'p-0522',
    clientId: 'le-marche-bio',
    sev: 'opportunite',
    dim: 'Design',
    label: 'Palette de couleurs incohérente entre les pages',
    age: 45,
    vis: 'interne',
    assigned: false,
  },
];

export type XpScenarioId = 'normal' | 'sain' | 'afflux' | 'anciennes';

export const XP_SCENARIOS: [XpScenarioId, string][] = [
  ['normal', 'Vue normale'],
  ['sain', 'Aucune priorité critique'],
  ['afflux', 'Afflux après un audit'],
  ['anciennes', 'Anciennes non traitées'],
];

export function xpScenario(id: XpScenarioId): CrossPriority[] {
  if (id === 'sain') return ALL_PRIORITIES.filter((p) => p.sev !== 'critique');
  if (id === 'afflux') return ALL_PRIORITIES.filter((p) => p.age <= 6);
  if (id === 'anciennes') return ALL_PRIORITIES.filter((p) => p.age >= XP_AGE_OLD && !p.assigned);
  return ALL_PRIORITIES;
}
