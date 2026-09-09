/* HuntPilote — Domain Overview : données de démonstration. Vue rapide pour qualifier un prospect. */
const DOI = {
  Traf: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.1-3-3L3 17.6" /></svg>,
  Kw: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  Auth: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Page: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Map: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>,
  Up: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>,
  Down: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
  UserPlus: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>,
  Link: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07l1.49-1.49" /></svg>,
};

/* trafficHistory : 12 points mensuels. 'chute' insère un décrochage daté au mois 9. */
const OVERVIEW = {
  traffic: 3400, trafficPrev: 2650,
  trafficHistory: [2500, 2600, 2650, 2700, 2900, 3050, 3100, 3200, 3250, 3300, 3350, 3400],
  keywords: 187, buckets: { top3: 8, top10: 34, top30: 61, hors: 84 },
  authority: 34, refDomains: 214,
  topPages: [
    { url: '/services/toiture-plate', vol: 720 }, { url: '/', vol: 610 }, { url: '/blogue/entretien-hiver', vol: 340 },
    { url: '/services/reparation-toiture', vol: 290 }, { url: '/realisations/', vol: 180 },
  ],
  topQueries: [
    { q: 'toiture montréal', vol: 1900, pos: 7 }, { q: 'couvreur rive-sud', vol: 520, pos: 6 },
    { q: 'réparation toiture prix', vol: 880, pos: 12 }, { q: 'toiture urgence fuite', vol: 170, pos: 3 },
    { q: 'combien coûte une toiture', vol: 1400, pos: 24 },
  ],
  geo: [{ region: 'Québec', pct: 71 }, { region: 'Ontario', pct: 14 }, { region: 'Reste du Canada', pct: 9 }, { region: 'Hors Canada', pct: 6 }],
};
const CHUTE_HISTORY = [3400, 3350, 3300, 3250, 3200, 1400, 1350, 1300, 1280, 1250, 1230, 1200];
const CHUTE_DATE = '14 avril 2026';

Object.assign(window, { DOI, OVERVIEW, CHUTE_HISTORY, CHUTE_DATE });
