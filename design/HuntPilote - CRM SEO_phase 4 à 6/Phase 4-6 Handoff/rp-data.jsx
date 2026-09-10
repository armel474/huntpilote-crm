/* HuntPilote — Rapport : données partagées entre l'éditeur et la page client. */
const RIco = {
  Check: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Warn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Up: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>,
  Down: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Eye: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  Send: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  Link: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>,
  Doc: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  Clock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Trophy: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>,
  Grip: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></svg>,
  Lock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  Pen: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
};

const R_TONE = {
  green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'],
  red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'],
  violet: ['var(--violet-m)', 'var(--violet-b)', 'var(--violet-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'],
};
const RPill = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = R_TONE[tone]; return <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };
const RLbl = ({ children, mb = 8, style }) => <div className="lbl" style={{ marginBottom: mb, ...style }}>{children}</div>;
const RSec = ({ title, sub, right, children, accent, style }) => (
  <div className="card" style={{ padding: '0.875rem 1rem', borderTop: accent ? `2px solid ${accent}` : undefined, ...style }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{title}</div>{sub && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2 }}>{sub}</div>}</div>
      {right}
    </div>
    {children}
  </div>
);

const REPORT = {
  period: 'Septembre 2026', client: 'Acme Corp.', pm: 'Marie Chen', pmInit: 'MC',
  email: 'contact@acmecorp.fr', publish: '2 octobre 2026', token: 'r/9f3a-acme-sept26',
  score: { now: 92, prev: 87 },
  objective: { label: 'Doubler le trafic organique d’ici le T4 2026', pct: 68, prevPct: 62, sentence: 'Vous êtes à 68 % de l’objectif : le trafic a progressé de 72 % depuis le début du mandat, il en reste 28 % à couvrir en trois mois.' },
  summary: 'Septembre a été un mois de consolidation technique. La vitesse d’affichage sur mobile — le point le plus pénalisant depuis le printemps — est réglée : vos pages passent de 4,2 à 2,1 secondes. Le trafic organique suit avec 38 400 visites, en hausse de 10 % sur un mois. Deux nouveaux guides sont en ligne et commencent à capter des recherches que votre site ne couvrait pas. Le mois prochain, nous nous attaquons aux liens brisés et au maillage interne.',
  kpis: [
    { label: 'Visites depuis Google', value: '38 400', prev: '34 800', delta: '+10,3 %', up: true, sentence: '3 600 visites de plus que le mois précédent, sans publicité.' },
    { label: 'Mots-clés en première page', value: '31', prev: '27', delta: '+4', up: true, sentence: 'Quatre requêtes de plus vous placent parmi les dix premiers résultats.' },
    { label: 'Vitesse d’affichage mobile', value: '2,1 s', prev: '4,2 s', delta: '−50 %', up: true, sentence: 'Sous le seuil de 2,5 s recommandé par Google : vos pages sont désormais considérées comme rapides.' },
    { label: 'Sites qui vous recommandent', value: '3 292', prev: '3 280', delta: '+12', up: true, sentence: 'Douze nouveaux liens externes pointent vers votre site ce mois-ci.' },
  ],
  proofs: [
    { id: 'PV-081', title: 'Vos pages s’affichent deux fois plus vite sur mobile', text: 'Vos pages s’affichent maintenant en 2,1 secondes sur mobile, contre 4,2 secondes avant. Les visiteurs voient le contenu deux fois plus vite, et Google considère désormais ces pages comme rapides.', before: '4,2 s', after: '2,1 s', task: '#142', prio: 'P-0418', ok: true, on: true },
    { id: 'PV-082', title: 'Deux nouveaux guides en ligne sur votre blogue', text: 'Deux nouveaux guides sont en ligne sur votre blogue. Ils répondent à des questions que vos clients tapent dans Google et n’étaient couvertes par aucune page de votre site.', before: null, after: null, task: '#151', prio: 'P-0431', ok: false, on: true },
    { id: 'PV-083', title: '18 pages mieux décrites dans les résultats Google', text: 'Nous avons réécrit le texte qui apparaît sous le titre de vos pages dans Google, sur 18 pages. Un texte plus clair donne envie de cliquer.', before: '2,9 %', after: '3,4 %', task: '#138', prio: 'P-0402', ok: true, on: true },
    { id: 'PV-084', title: '12 nouveaux sites pointent vers vous', text: 'Douze sites externes de bonne réputation ont ajouté un lien vers vos pages. C’est un signal de confiance pour Google.', before: null, after: null, task: '#133', prio: null, ok: true, on: false },
  ],
  priorities: [
    { id: 'P-0421', state: 'traitement', title: 'Liens qui ne mènent nulle part', text: 'Vingt-trois liens de votre site mènent vers des pages qui n’existent plus. Cela gaspille le temps que Google consacre à explorer votre site, et frustre les visiteurs qui tombent dessus.', pct: 25, doing: 'Inventaire terminé, redirections en cours d’écriture.', ok: true },
    { id: 'P-0428', state: 'annonce', title: 'Des pages difficiles à trouver depuis votre menu', text: 'Vingt-trois pages de votre site ne sont accessibles par aucun lien depuis votre navigation. Google les visite rarement, et vos visiteurs ne les trouvent pas.', pct: 0, doing: null, ok: false },
    { id: 'P-0430', state: 'traitement', title: 'Quatre pages qui se font concurrence', text: 'Quatre de vos pages traitent du même sujet. Google ne sait pas laquelle proposer, et les deux perdent en visibilité.', pct: 60, doing: 'Deux pages fusionnées, deux restantes à traiter.', ok: true },
  ],
  next: [
    ['Corriger les 23 liens brisés', 'Terminé avant le 15 octobre — les redirections sont écrites, il reste la mise en ligne.'],
    ['Rendre les 23 pages orphelines accessibles', 'Ajout de liens depuis votre menu et vos pages de service.'],
    ['Publier le troisième guide longue traîne', 'Il est écrit, il passe en relecture cette semaine.'],
  ],
  versions: [
    { v: 'v2', date: '3 oct. 2026, 09 h 41', who: 'Marie Chen', note: 'Correction du chiffre de vitesse (2,1 s au lieu de 2,2 s)' },
    { v: 'v1', date: '2 oct. 2026, 08 h 00', who: 'Automatisation', note: 'Première publication' },
  ],
};

const SECTIONS = [
  { id: 'synthese', name: 'Synthèse du mois', desc: 'Rédigée par l’agent, modifiable', ai: true },
  { id: 'situation', name: 'Où on en est', desc: 'Score de santé et objectif' },
  { id: 'kpis', name: 'Ce qui a bougé', desc: 'Chiffres de la période' },
  { id: 'preuves', name: 'Ce qu’on a fait', desc: 'Preuves de valeur retenues' },
  { id: 'travail', name: 'Ce sur quoi on travaille', desc: 'Priorités visibles au client' },
  { id: 'suite', name: 'La suite', desc: 'Prévu le mois prochain' },
];

Object.assign(window, { RIco, R_TONE, RPill, RLbl, RSec, REPORT, SECTIONS });
