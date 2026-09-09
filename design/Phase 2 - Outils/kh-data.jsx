/* HuntPilote — Keyword Hunter : données de démonstration. Résultats éphémères, cache 30 jours.
   Exporté sur window. */
const KHI = {
  Srch: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  Doc: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /><line x1="9" y1="11" x2="15" y2="11" /></svg>,
  Snow: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="22" /><line x1="4.9" y1="7" x2="19.1" y2="17" /><line x1="4.9" y1="17" x2="19.1" y2="7" /></svg>,
  Sun: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="4.9" y1="4.9" x2="6.3" y2="6.3" /><line x1="17.7" y1="17.7" x2="19.1" y2="19.1" /></svg>,
  Flat: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Chev: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
};

const KH_INTENTS = ['Informationnelle', 'Commerciale', 'Transactionnelle'];
const KH_TREND = { hiver: { label: 'Pic en hiver', Icon: KHI.Snow }, ete: { label: 'Pic en été', Icon: KHI.Sun }, stable: { label: 'Stable à l’année', Icon: KHI.Flat } };

/* diff = difficulté estimée 0-100. words = longueur en mots. */
const SUGGESTIONS = [
  { c: 'toiture résidentielle prix moyen', theme: 'Toiture résidentielle — prix et matériaux', vol: 720, diff: 38, intent: 'Commerciale', trend: 'stable', words: 4, question: false },
  { c: 'bardeau asphalte vs métal', theme: 'Toiture résidentielle — prix et matériaux', vol: 390, diff: 44, intent: 'Commerciale', trend: 'ete', words: 4, question: false },
  { c: 'combien coûte une toiture', theme: 'Toiture résidentielle — prix et matériaux', vol: 1400, diff: 52, intent: 'Commerciale', trend: 'stable', words: 4, question: true },
  { c: 'toiture plate ou pente', theme: 'Toiture résidentielle — prix et matériaux', vol: 260, diff: 41, intent: 'Informationnelle', trend: 'stable', words: 4, question: false },
  { c: 'durée de vie toiture bardeau', theme: 'Toiture résidentielle — prix et matériaux', vol: 310, diff: 33, intent: 'Informationnelle', trend: 'stable', words: 5, question: false },
  { c: 'toiture urgence 24h rive-sud', theme: 'Urgence et réparation', vol: 480, diff: 29, intent: 'Transactionnelle', trend: 'hiver', words: 5, question: false },
  { c: 'que faire fuite toiture', theme: 'Urgence et réparation', vol: 890, diff: 24, intent: 'Informationnelle', trend: 'hiver', words: 4, question: true },
  { c: 'réparation toiture urgente prix', theme: 'Urgence et réparation', vol: 340, diff: 36, intent: 'Transactionnelle', trend: 'hiver', words: 4, question: false },
  { c: 'toiture endommagée grêle assurance', theme: 'Urgence et réparation', vol: 210, diff: 47, intent: 'Commerciale', trend: 'ete', words: 4, question: false },
  { c: 'signes toiture à refaire', theme: 'Questions fréquentes sur la toiture', vol: 590, diff: 27, intent: 'Informationnelle', trend: 'stable', words: 4, question: false },
  { c: 'combien de temps pour refaire une toiture', theme: 'Questions fréquentes sur la toiture', vol: 320, diff: 22, intent: 'Informationnelle', trend: 'stable', words: 7, question: true },
  { c: 'faut-il un permis pour changer sa toiture', theme: 'Questions fréquentes sur la toiture', vol: 410, diff: 31, intent: 'Informationnelle', trend: 'stable', words: 7, question: true },
  { c: 'qui appeler pour une fuite de toit', theme: 'Questions fréquentes sur la toiture', vol: 260, diff: 19, intent: 'Informationnelle', trend: 'hiver', words: 7, question: true },
  { c: 'toiture verte avantages', theme: 'Questions fréquentes sur la toiture', vol: 150, diff: 45, intent: 'Informationnelle', trend: 'ete', words: 3, question: false },
];

const KH_SAVES = [
  { d: '2 sept. 2026', t: 'Keyword Hunter', w: '8 requêtes sélectionnées · brief « Urgence et réparation »' },
];

Object.assign(window, { KHI, KH_INTENTS, KH_TREND, SUGGESTIONS, KH_SAVES });
