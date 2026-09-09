/* HuntPilote — Keyword Gap : données de démonstration. Résultats éphémères, cache 30 jours. */
const KGI = {
  Miss: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  Weak: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Strong: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>,
  Uniq: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l2.4 7.4H22l-6 4.4 2.4 7.4L12 16.8l-6.4 4.4L8 13.8l-6-4.4h7.6z" /></svg>,
  X: () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Plus: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Chev: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
};

const CLIENT = { name: 'Acme Corp.', domain: 'acmecorp.ca' };
const DEFAULT_COMPETITORS = [
  { domain: 'couvreur-rive-sud.ca', name: 'Couvreur Rive-Sud Inc.' },
  { domain: 'toitures-estrie.ca', name: 'Toitures Estrie' },
];

const CATS = [
  { id: 'manquants', label: 'Manquants', sub: 'Les concurrents s’y positionnent, pas vous', tone: 'red', Icon: KGI.Miss },
  { id: 'faibles', label: 'Faibles', sub: 'Vous êtes présent mais derrière', tone: 'yellow', Icon: KGI.Weak },
  { id: 'forts', label: 'Forts', sub: 'Vous devancez les concurrents suivis', tone: 'green', Icon: KGI.Strong },
  { id: 'uniques', label: 'Uniques', sub: 'Vous seul y êtes positionné', tone: 'blue', Icon: KGI.Uniq },
];

/* posClient / posComps[i] : null = non classé. Aligné sur l'ordre des concurrents actifs. */
const ROWS = {
  manquants: [
    { c: 'assurance toiture dommage', vol: 480, posClient: null, posComps: [3, 9] },
    { c: 'permis toiture municipal', vol: 320, posClient: null, posComps: [8, 14] },
    { c: 'toiture verte avantages', vol: 210, posClient: null, posComps: [5, null] },
  ],
  faibles: [
    { c: 'toiture montréal', vol: 1900, posClient: 7, posComps: [3, 15] },
    { c: 'bardeau asphalte prix', vol: 320, posClient: 19, posComps: [8, 22] },
  ],
  forts: [
    { c: 'couvreur rive-sud', vol: 520, posClient: 6, posComps: [11, 9] },
    { c: 'toiture urgence fuite', vol: 170, posClient: 3, posComps: [14, null] },
  ],
  uniques: [
    { c: 'inspection toiture drone', vol: 140, posClient: 8, posComps: [null, null] },
    { c: 'avis toiture acme', vol: 60, posClient: 2, posComps: [null, null] },
  ],
};
const VOL_FORT = 400;

const KG_SAVES = [
  { d: '15 août 2026', t: 'Keyword Gap', w: '3 concurrents comparés · carte Concurrence mise à jour' },
];

Object.assign(window, { KGI, CLIENT, DEFAULT_COMPETITORS, CATS, ROWS, VOL_FORT, KG_SAVES });
