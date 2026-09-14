/** Ordre du brief 9.1 ; les sections futures restent explicitement annoncées. */
export const AGENCY_SECTIONS = [
  { id: 'profil', label: 'Profil', available: true },
  { id: 'equipe', label: 'Équipe', available: true },
  { id: 'catalogue', label: 'Catalogue', available: true },
  { id: 'offres', label: 'Offres', available: false },
  { id: 'modeles', label: 'Modèles de documents', available: false },
  { id: 'documents', label: 'Documents', available: false },
] as const;

export type AgencySection = (typeof AGENCY_SECTIONS)[number]['id'];
