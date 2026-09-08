/* HuntPilote — Audit : données partagées (détail et comparaison). Trois dimensions pondérées. */
const AIco = {
  Check: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Warn: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  X: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Plus: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Arrow: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Up: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>,
  Down: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Eye: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  Globe: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
  Srch: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  Pen: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
  Clock: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Plug: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22v-5" /><path d="M9 8V2M15 8V2" /><path d="M18 8v3a6 6 0 01-12 0V8z" /></svg>,
  Cmp: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="7" height="16" rx="1" /><rect x="14" y="4" width="7" height="10" rx="1" /></svg>,
  Refresh: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>,
  Back: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
};

const A_TONE = {
  green: ['var(--green-m)', 'var(--green-b)', 'var(--green-fg)'], yellow: ['var(--yellow-m)', 'var(--yellow-b)', 'var(--yellow-fg)'],
  red: ['var(--red-m)', 'var(--red-b)', 'var(--red)'], blue: ['var(--blue-m)', 'var(--blue-b)', 'var(--blue-fg)'],
  violet: ['var(--violet-m)', 'var(--violet-b)', 'var(--violet-fg)'], neutral: ['var(--bg-muted)', 'var(--bd-solid)', 'var(--fg2)'],
};
const APill = ({ label, tone = 'neutral', icon, sm }) => { const [bg, bd, fg] = A_TONE[tone]; return <span className="pill" style={{ background: bg, border: `1px solid ${bd}`, color: fg, fontSize: sm ? '0.5625rem' : '0.625rem' }}>{icon}{label}</span>; };
const ALbl = ({ children, mb = 8, style }) => <div className="lbl" style={{ marginBottom: mb, ...style }}>{children}</div>;
const ASec = ({ title, sub, right, children, accent, style }) => (
  <div className="card" style={{ padding: '0.875rem 1rem', borderTop: accent ? `2px solid ${accent}` : undefined, ...style }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{title}</div>{sub && <div style={{ fontSize: '0.625rem', color: 'var(--fg3)', marginTop: 2, lineHeight: 1.5 }}>{sub}</div>}</div>
      {right}
    </div>
    {children}
  </div>
);
/* Statut d'un critère — jamais la couleur seule : chaque état porte un mot et une icône. */
const A_STATUS = {
  ok: { label: 'Au seuil', tone: 'green', Ico: AIco.Check },
  warn: { label: 'Sous le seuil', tone: 'yellow', Ico: AIco.Warn },
  fail: { label: 'Hors seuil', tone: 'red', Ico: AIco.X },
  na: { label: 'Non mesuré', tone: 'neutral', Ico: AIco.Plug },
};

const AUDIT = {
  id: 'A-0142', client: 'Acme Corp.', pmInit: 'MC', date: '1 octobre 2026', hour: '04 h 12', prev: '1 septembre 2026',
  score: 72, prevScore: 67, pages: 412, duration: '6 min 41 s',
  dims: [
    {
      id: 'presence', name: 'Présence en ligne', Icon: AIco.Globe, weight: 25, score: 64, prev: 58,
      sub: 'Fiche Google Business, annuaires, réseaux, cohérence des informations',
      items: [
        { c: 'Fiche Google Business', measure: '6 champs remplis sur 9', threshold: 'Seuil : 9 sur 9', st: 'warn', note: 'Horaires, services et zone desservie manquants.', prio: 'P-0431' },
        { c: 'Cohérence nom · adresse · téléphone', measure: '3 incohérences sur 14 sources', threshold: 'Seuil : 0 incohérence', st: 'fail', note: 'Deux annuaires affichent l’ancien numéro, un affiche l’ancienne adresse.', prio: null },
        { c: 'Citations en annuaires', measure: '12 annuaires sur 20 de référence', threshold: 'Seuil : 16 sur 20', st: 'warn', note: 'Absent de 8 annuaires sectoriels québécois.', prio: null },
        { c: 'Avis clients', measure: '4,6 / 5 · 87 avis · 1 sans réponse', threshold: 'Seuil : ≥ 4,0 et 0 avis sans réponse', st: 'warn', note: 'Un avis négatif de juillet reste sans réponse publique.', prio: null },
        { c: 'Réseaux sociaux liés au site', measure: '3 profils actifs sur 4 déclarés', threshold: 'Seuil : tous les profils déclarés actifs', st: 'ok', note: null, prio: null },
      ],
    },
    {
      id: 'seo', name: 'SEO', Icon: AIco.Srch, weight: 45, score: 76, prev: 71,
      sub: 'Technique, on-page, contenu, backlinks',
      items: [
        { c: 'Vitesse d’affichage mobile (LCP)', measure: '2,1 s', threshold: 'Seuil : ≤ 2,5 s', st: 'ok', note: null, prio: 'P-0418' },
        { c: 'Liens internes brisés', measure: '23 liens en erreur 404', threshold: 'Seuil : 0 lien brisé', st: 'fail', note: 'Concentrés sur les anciennes pages de service.', prio: 'P-0421' },
        { c: 'Pages orphelines', measure: '23 pages sans lien entrant', threshold: 'Seuil : 0 page orpheline', st: 'fail', note: 'Inaccessibles depuis la navigation, donc rarement explorées.', prio: 'P-0428' },
        { c: 'Descriptions dans les résultats Google', measure: '18 pages sans description', threshold: 'Seuil : 100 % des pages indexables', st: 'warn', note: null, prio: 'P-0402' },
        { c: 'Contenus qui se font concurrence', measure: '4 pages sur le même sujet', threshold: 'Seuil : 1 page par intention', st: 'warn', note: 'Deux paires de pages traitent des mêmes recherches.', prio: 'P-0430' },
        { c: 'Domaines référents', measure: '3 292 domaines · 12 nouveaux', threshold: 'Seuil : croissance mensuelle > 0', st: 'ok', note: null, prio: null },
        { c: 'Indexation', measure: '389 pages indexées sur 412', threshold: 'Seuil : ≥ 95 % des pages utiles', st: 'ok', note: null, prio: null },
      ],
    },
  ],
  /* Dimension design — mesurable (entre dans le score) */
  design: {
    weight: 30, score: 71, prev: 68,
    items: [
      { c: 'Mobile', measure: '9 cibles tactiles sous 44 px · viewport déclaré · aucun débordement', threshold: 'Seuil : 0 cible sous 44 px', st: 'warn', note: 'Menu de pied de page et filtres du catalogue.', prio: null },
      { c: 'Lisibilité', measure: 'Contraste 3,1:1 sur les intertitres · corps 15 px · 96 caractères par ligne', threshold: 'Seuil : 4,5:1 · corps ≥ 16 px · ≤ 80 caractères', st: 'fail', note: 'Deux niveaux de titres partagent la même taille : la hiérarchie ne se lit pas.', prio: 'P-0433' },
      { c: 'Parcours', measure: '4 niveaux de navigation · appel à l’action sous la ligne de flottaison sur 6 pages', threshold: 'Seuil : ≤ 3 niveaux · appel à l’action visible sans défilement', st: 'warn', note: null, prio: null },
      { c: 'Conversion', measure: '11 champs au formulaire de devis · erreurs affichées à l’envoi seulement', threshold: 'Seuil : ≤ 7 champs · validation au champ', st: 'fail', note: 'Aucune preuve sociale sur la page de devis.', prio: 'P-0435' },
      { c: 'Cohérence de marque', measure: '3 familles typographiques · 14 teintes · 2 styles de bouton', threshold: 'Seuil : ≤ 2 familles · palette ≤ 10 teintes', st: 'warn', note: null, prio: null },
    ],
    /* Caractérisation — décrite, jamais notée */
    style: { dominant: 'corporate', all: ['éditorial', 'minimaliste', 'tech', 'corporate', 'artisanal'], note: 'Mise en page en blocs pleine largeur, photographies d’équipe, vocabulaire institutionnel. Le registre correspond au secteur : ce n’est ni un défaut ni une qualité.' },
    modern: {
      pos: 38, label: 'Plutôt daté',
      signals: [
        ['Densité', 'Grandes zones vides entre les blocs, densité faible', 'daté'],
        ['Ombres', 'Ombres portées marquées sur les cartes et les boutons', 'daté'],
        ['Dégradés', 'Deux dégradés bleu-violet en arrière-plan de section', 'daté'],
        ['Largeur des conteneurs', 'Contenu limité à 1 100 px, aligné aux usages actuels', 'actuel'],
        ['Typographie', 'Titres en Arial gras, corps en Georgia', 'daté'],
        ['Images', 'Photographies de banque d’images, format 4:3, sans traitement', 'daté'],
      ],
    },
  },
  running: { presence: 100, seo: 62, design: 0 },
  /* État « audit ancien » : c'est un audit antérieur qui est affiché, pas A-0142 rehabillé. */
  staleShown: { id: 'A-0119', date: '1 août 2026', duration: '7 min 02 s', dims: { presence: [54, 50], seo: [66, 63], design: [60, 56] } },
  history: [
    { id: 'A-0142', date: '1 oct. 2026', score: 72, ok: true },
    { id: 'A-0131', date: '1 sept. 2026', score: 67, ok: true },
    { id: 'A-0119', date: '1 août 2026', score: 61, ok: true },
    { id: 'A-0104', date: '1 juill. 2026', score: 58, ok: true },
  ],
};
/* Score global pondéré : la pondération est affichée à l'écran, sinon le chiffre est incompréhensible. */
const A_WEIGHTED = dims => Math.round(dims.reduce((s, d) => s + d.score * d.weight, 0) / dims.reduce((s, d) => s + d.weight, 0));

Object.assign(window, { AIco, A_TONE, APill, ALbl, ASec, A_STATUS, AUDIT, A_WEIGHTED });
