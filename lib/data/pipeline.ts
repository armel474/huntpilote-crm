/** Pipeline commercial — étapes, responsables et opportunités de démonstration. */

export type StageId = 'prospect' | 'qualifie' | 'proposition' | 'negociation' | 'gagne';

export const STAGES: { id: StageId; label: string; accent: string }[] = [
  { id: 'prospect', label: 'Prospect', accent: '#A1A1AA' },
  { id: 'qualifie', label: 'Qualifié', accent: '#3B82F6' },
  { id: 'proposition', label: 'Proposition', accent: '#7C3AED' },
  { id: 'negociation', label: 'Négociation', accent: '#D4B24A' },
  { id: 'gagne', label: 'Gagné', accent: '#16A34A' },
];

/** Probabilité par défaut appliquée quand une carte change d'étape. */
export const STAGE_PROBABILITY: Record<StageId, number> = {
  prospect: 15,
  qualifie: 38,
  proposition: 55,
  negociation: 78,
  gagne: 100,
};

export type OwnerId = 'MC' | 'JD' | 'AL';

export const OWNERS: Record<OwnerId, { name: string; color: string }> = {
  MC: { name: 'Marie Chen', color: 'var(--green)' },
  JD: { name: 'Julien Dubois', color: 'var(--blue)' },
  AL: { name: 'Aïcha Lemaire', color: 'var(--violet)' },
};

export type Deal = {
  id: number;
  company: string;
  sector: string;
  /** MRR mensuel en dollars canadiens. */
  mrr: number;
  services: string[];
  owner: OwnerId;
  /** Jours passés dans l'étape courante. */
  days: number;
  prob: number;
  stage: StageId;
  next: string;
};

export const DEALS: Deal[] = [
  { id: 1, company: 'Boutique Lumière', sector: 'E-commerce', mrr: 900, services: ['SEO Tech.', 'Contenu'], owner: 'MC', days: 4, prob: 15, stage: 'prospect', next: 'Appel de découverte' },
  { id: 2, company: 'Garage Méca-Pro', sector: 'Automobile', mrr: 700, services: ['SEO Local'], owner: 'JD', days: 9, prob: 10, stage: 'prospect', next: 'Envoyer présentation' },
  { id: 3, company: 'Pharmacie Centrale', sector: 'Santé', mrr: 1100, services: ['SEO Local', 'Contenu'], owner: 'AL', days: 2, prob: 20, stage: 'prospect', next: 'Qualifier le besoin' },
  { id: 4, company: 'Resto Le Margaux', sector: 'Restauration', mrr: 850, services: ['SEO Local'], owner: 'MC', days: 6, prob: 35, stage: 'qualifie', next: 'Audit gratuit planifié' },
  { id: 5, company: 'Académie Vélo', sector: 'Éducation', mrr: 1200, services: ['SEO Tech.', 'Backlinks'], owner: 'JD', days: 12, prob: 40, stage: 'qualifie', next: "Présenter l'audit" },
  { id: 6, company: 'Maison Bois Franc', sector: 'Construction', mrr: 1500, services: ['SEO Tech.', 'Contenu'], owner: 'AL', days: 8, prob: 35, stage: 'qualifie', next: 'Relance audit' },
  { id: 7, company: 'TechNord Solutions', sector: 'SaaS B2B', mrr: 2200, services: ['SEO Tech.', 'Contenu', 'Backlinks'], owner: 'MC', days: 5, prob: 60, stage: 'proposition', next: 'Proposition envoyée' },
  { id: 8, company: 'Cabinet Lefebvre', sector: 'Juridique', mrr: 1800, services: ['SEO Local', 'Contenu'], owner: 'JD', days: 11, prob: 50, stage: 'proposition', next: 'Suivi de proposition' },
  { id: 9, company: 'Voyages Évasion', sector: 'Tourisme', mrr: 1300, services: ['Contenu', 'Backlinks'], owner: 'AL', days: 7, prob: 55, stage: 'proposition', next: 'Ajuster le devis' },
  { id: 10, company: 'Clinique Santé Plus', sector: 'Santé', mrr: 1900, services: ['SEO Tech.', 'SEO Local'], owner: 'MC', days: 3, prob: 75, stage: 'negociation', next: "Négocier l'engagement" },
  { id: 11, company: 'Studio Pixel', sector: 'Agence créative', mrr: 1400, services: ['SEO Tech.', 'Backlinks'], owner: 'JD', days: 14, prob: 80, stage: 'negociation', next: 'Signature imminente' },
  { id: 12, company: 'Immobilier Vista', sector: 'Immobilier', mrr: 1600, services: ['SEO Local', 'Contenu'], owner: 'AL', days: 1, prob: 100, stage: 'gagne', next: 'Onboarding lancé' },
  { id: 13, company: 'Brasserie Houblon', sector: 'Agroalimentaire', mrr: 1000, services: ['SEO Local'], owner: 'MC', days: 2, prob: 100, stage: 'gagne', next: 'Onboarding lancé' },
];

/** Format monétaire québécois (espace insécable comme séparateur de milliers). */
export const fmt = (n: number) => n.toLocaleString('fr-CA');

/** Initiales affichées sur la vignette d'une entreprise. */
export const initials = (company: string) =>
  company
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

export const probColor = (p: number) =>
  p >= 75 ? 'var(--green)' : p >= 45 ? 'var(--yellow-fg)' : p >= 25 ? 'var(--blue-fg)' : 'var(--fg4)';
