/* HuntPilote — Organic Research : données de démonstration. Exploration approfondie avant proposition. */
const ORI = {
  Traf: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.1-3-3L3 17.6" /></svg>,
  Doc: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /><line x1="9" y1="11" x2="15" y2="11" /></svg>,
  Coin: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M15 9.5A3 3 0 0012 8h-1a2 2 0 000 4h2a2 2 0 010 4h-1a3 3 0 01-3-1.5" /></svg>,
  Up: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>,
  Down: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
};

/* 24 points mensuels de trafic et de position moyenne, avec un décrochage daté au mois 14. */
const OR_TRAFFIC = [1800, 1850, 1900, 2100, 2200, 2300, 2450, 2500, 2600, 2700, 2750, 2800, 2900, 950, 1000, 1050, 1080, 1100, 1150, 1180, 1200, 1220, 1250, 1280];
const OR_POS = [22, 21, 20, 18, 17, 16, 15, 14, 13, 12, 12, 11, 11, 38, 36, 34, 33, 32, 31, 30, 29, 28, 27, 26];
const OR_DROP = { month: 13, date: '2 juin 2025', label: 'Migration de plateforme sans redirections 301' };
const OR_TRAFFIC_OK = [1800, 1850, 1900, 2100, 2200, 2300, 2450, 2500, 2600, 2700, 2750, 2800, 2900, 2950, 3050, 3100, 3180, 3220, 3300, 3350, 3400, 3450, 3500, 3560];
const OR_POS_OK = [22, 21, 20, 18, 17, 16, 15, 14, 13, 12, 12, 11, 11, 10, 10, 9, 9, 9, 8, 8, 8, 7, 7, 7];

const QUERIES = [
  { c: 'toiture montréal', vol: 1900, pos: 7, page: '/services/toiture-plate' },
  { c: 'réparation toiture prix', vol: 880, pos: 12, page: '/services/reparation-toiture' },
  { c: 'combien coûte une toiture', vol: 1400, pos: 24, page: '/blogue/prix-toiture' },
  { c: 'couvreur rive-sud', vol: 520, pos: 6, page: '/services/' },
  { c: 'toiture urgence fuite', vol: 170, pos: 3, page: '/services/urgence' },
  { c: 'entretien toiture hiver', vol: 210, pos: 14, page: '/blogue/entretien-hiver' },
  { c: 'bardeau asphalte prix', vol: 320, pos: 19, page: '/services/bardeau-asphalte' },
  { c: 'toiture verte avantages', vol: 150, pos: 44, page: '/blogue/toiture-verte' },
];

/* Pages qui progressent vs qui reculent, sur la période affichée. */
const PAGES_UP = [
  { url: '/services/toiture-plate', delta: 34 }, { url: '/blogue/entretien-hiver', delta: 21 }, { url: '/services/urgence', delta: 12 },
];
const PAGES_DOWN = [
  { url: '/blogue/prix-toiture', delta: -46 }, { url: '/realisations/', delta: -28 }, { url: '/a-propos/', delta: -9 },
];

/* Potentiel : requêtes en position 4-10, valeur estimée si elles passaient en top 3 (CTR ×2,4 approximatif). */
const POTENTIAL_ROWS = QUERIES.filter(q => q.pos >= 4 && q.pos <= 10);
const CTR_MULT = 2.4;

const OR_SAVES = [{ d: '20 juil. 2026', t: 'Organic Research', w: 'Audit de prospect généré et partagé' }];

Object.assign(window, { ORI, OR_TRAFFIC, OR_POS, OR_TRAFFIC_OK, OR_POS_OK, OR_DROP, QUERIES, PAGES_UP, PAGES_DOWN, POTENTIAL_ROWS, CTR_MULT, OR_SAVES });
