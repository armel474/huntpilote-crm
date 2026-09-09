/* HuntPilote — Position Tracking : données de démonstration. Relevé hebdomadaire, positions 1..100+.
   Réutilise AIco / A_STATUS (au-data.jsx). Exporté sur window. */
const PTI = {
  Up: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>,
  Down: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Flat: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Target: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /></svg>,
  Layers: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
  Tag: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41L11 3.83V3H3v8l.83.83L13.41 20.6a2 2 0 002.83 0l4.35-4.35a2 2 0 000-2.83z" /><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" /></svg>,
  X: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Plus: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Fork: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" /><path d="M6 8.5V12a4 4 0 004 4M18 8.5V12a4 4 0 01-4 4" /></svg>,
};

const PT_PERIODS = ['4 dernières semaines', '12 dernières semaines', '26 dernières semaines'];
const PT_THRESHOLD = 10; /* objectif première page */
const PLAN_TIERS = [{ max: 50, price: 'Inclus au forfait' }, { max: 150, price: '19,00 $ / mois' }, { max: 400, price: '49,00 $ / mois' }];
const PT_GROUPS = ['Toiture résidentielle', 'Urgence & réparation', 'Marque'];

/* pos: position actuelle, null = hors top 100. prev: position au relevé précédent, null = premier relevé.
   history: 8 relevés hebdomadaires (position), null = hors classement ce jour-là. urls: >1 = cannibalisation. */
const KEYWORDS = [
  { c: 'toiture montréal', group: 'Toiture résidentielle', intent: 'Transactionnelle', pos: 7, prev: 9, vol: 1900, urls: ['/services/toiture-plate'], history: [14, 13, 13, 12, 11, 10, 9, 7] },
  { c: 'réparation toiture prix', group: 'Toiture résidentielle', intent: 'Transactionnelle', pos: 12, prev: 12, vol: 880, urls: ['/services/reparation-toiture'], history: [12, 13, 12, 11, 13, 12, 12, 12], prio: 'P-0431' },
  { c: 'soumission toiture rive-sud', group: 'Toiture résidentielle', intent: 'Transactionnelle', pos: null, prev: 34, vol: 640, urls: [], history: [28, 30, 32, 40, 70, null, null, null], dropped: true },
  { c: 'couvreur rive-sud', group: 'Urgence & réparation', intent: 'Transactionnelle', pos: 6, prev: 6, vol: 520, urls: ['/services/'], history: [7, 6, 7, 6, 6, 6, 6, 6] },
  { c: 'toiture urgence fuite', group: 'Urgence & réparation', intent: 'Transactionnelle', pos: 3, prev: 5, vol: 170, urls: ['/services/urgence'], history: [8, 7, 6, 6, 5, 5, 4, 3] },
  { c: 'entretien toiture hiver', group: 'Urgence & réparation', intent: 'Informationnelle', pos: 14, prev: 11, vol: 210, urls: ['/blogue/entretien-hiver'], history: [10, 10, 11, 10, 11, 11, 12, 14] },
  { c: 'fuite toiture que faire', group: 'Urgence & réparation', intent: 'Informationnelle', pos: 9, prev: 9, vol: 260, urls: ['/blogue/fuite-toiture', '/services/urgence'], history: [11, 10, 10, 9, 9, 10, 9, 9], cannib: true },
  { c: 'bardeau asphalte prix', group: 'Toiture résidentielle', intent: 'Transactionnelle', pos: 19, prev: 15, vol: 320, urls: ['/services/bardeau-asphalte'], history: [13, 14, 13, 14, 15, 16, 17, 19] },
  { c: 'toiture acme corp', group: 'Marque', intent: 'Navigationnelle', pos: 1, prev: 1, vol: 90, urls: ['/'], history: [1, 1, 1, 1, 1, 1, 1, 1] },
  { c: 'avis toiture acme', group: 'Marque', intent: 'Navigationnelle', pos: 2, prev: 4, vol: 60, urls: ['/avis'], history: [6, 5, 5, 4, 4, 3, 3, 2] },
  { c: 'inspection toiture drone', group: 'Toiture résidentielle', intent: 'Informationnelle', pos: 8, prev: null, vol: 140, urls: ['/services/inspection-drone'], history: [8], isNew: true },
];

const PT_SAVES = [
  { d: '4 sept. 2026', t: 'Position Tracking', w: '11 mots-clés · relevé hebdomadaire' },
  { d: '28 août 2026', t: 'Position Tracking', w: '11 mots-clés · +2 en top 10' },
];

Object.assign(window, { PTI, PT_PERIODS, PT_THRESHOLD, PLAN_TIERS, PT_GROUPS, KEYWORDS, PT_SAVES });
