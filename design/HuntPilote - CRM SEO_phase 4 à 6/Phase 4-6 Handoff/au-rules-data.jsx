/* HuntPilote — Éditeur d'automatisation : déclencheurs, conditions, actions, règles et journal. */
const AR_TRIGGERS = {
  position: { label: 'Chute de position', phrase: n => `un mot-clé suivi perd ${n} places ou plus`, param: { key: 'places', label: 'Places perdues', unit: 'places', def: 5, min: 1, max: 30 }, icon: 'chart' },
  score: { label: 'Score de santé sous un seuil', phrase: n => `le score de santé d’un client passe sous ${n}`, param: { key: 'seuil', label: 'Seuil de score', unit: '/100', def: 70, min: 30, max: 95 }, icon: 'warn' },
  crawl: { label: 'Nouvelle erreur de crawl', phrase: n => `le crawl découvre ${n} nouvelles erreurs ou plus`, param: { key: 'erreurs', label: 'Erreurs découvertes', unit: 'erreurs', def: 10, min: 1, max: 200 }, icon: 'link' },
  avis: { label: 'Nouvel avis', phrase: n => `un nouvel avis de ${n} étoiles ou moins est publié`, param: { key: 'etoiles', label: 'Note maximale', unit: '★', def: 3, min: 1, max: 5 }, icon: 'star' },
  date: { label: 'Date récurrente', phrase: n => `on atteint le ${n} de chaque mois`, param: { key: 'jour', label: 'Jour du mois', unit: 'du mois', def: 2, min: 1, max: 28 }, icon: 'cal' },
  pipeline: { label: 'Changement d’étape au pipeline', phrase: n => `un deal passe à l’étape « ${n} »`, param: { key: 'etape', label: 'Étape visée', options: ['Qualifié', 'Proposition', 'Négociation', 'Gagné', 'Perdu'], def: 'Gagné' }, icon: 'trophy' },
  facture: { label: 'Facture en retard', phrase: n => `une facture dépasse ${n} jours de retard`, param: { key: 'jours', label: 'Jours de retard', unit: 'jours', def: 3, min: 1, max: 90 }, icon: 'bill' },
  citation: { label: 'Incohérence de citation', phrase: n => `${n} annuaire ou plus affiche des coordonnées différentes de la fiche`, param: { key: 'annuaires', label: 'Annuaires en écart', unit: 'annuaires', def: 1, min: 1, max: 20 }, icon: 'pin' },
};

const AR_COND_KINDS = {
  clients: { label: 'Seulement certains clients', phrase: v => `le client fait partie de ${v.length ? v.join(', ') : '— aucun client choisi'}`, kind: 'clients' },
  forfait: { label: 'Seulement certains forfaits', phrase: v => `le client est au forfait ${v.length ? v.join(' ou ') : '— aucun forfait choisi'}`, kind: 'forfait' },
  dim: { label: 'Seulement une dimension d’audit', phrase: v => `la priorité concerne la dimension ${v}`, kind: 'dim', only: ['crawl', 'score', 'citation'] },
  volume: { label: 'Seulement au-delà d’un volume de recherche', phrase: v => `le mot-clé dépasse ${v} recherches par mois`, kind: 'nombre', def: 500, only: ['position'] },
  semaine: { label: 'Seulement en semaine', phrase: () => 'on est du lundi au vendredi, entre 8 h et 18 h', kind: 'bool' },
  nonassignee: { label: 'Seulement si rien n’est déjà assigné', phrase: () => 'aucune tâche ouverte ne couvre déjà le sujet', kind: 'bool' },
};

const AR_ACTIONS = {
  tache: { label: 'Créer une tâche', phrase: v => `créer une tâche assignée à ${v.assignee} avec ${v.effort} h estimées`, icon: 'task', creates: 'une tâche dans le plan d’action' },
  priorite: { label: 'Créer une priorité', phrase: v => `créer une priorité de sévérité « ${v.sev} » sur la dimension ${v.dim}`, icon: 'warn', creates: 'une priorité rattachée à l’audit' },
  notifier: { label: 'Notifier l’équipe', phrase: v => `notifier ${v.assignee} dans HuntPilote`, icon: 'bell', creates: 'une notification interne' },
  courriel: { label: 'Envoyer un courriel', phrase: v => `envoyer un courriel au ${v.dest}`, icon: 'send', creates: 'un courriel sortant' },
  rapport: { label: 'Générer un rapport', phrase: () => 'générer le rapport de la période en brouillon', icon: 'doc', creates: 'un brouillon de rapport' },
  audit: { label: 'Lancer un audit', phrase: v => `lancer un audit ${v.dim === 'Toutes' ? 'complet' : `de ${v.dim}`}`, icon: 'search', creates: 'une exécution d’audit' },
};

const AR_CLIENTS = ['Acme Corp.', 'Bistro Le Chalet', 'Toiture Lavoie', 'Clinique DentAlex', 'Groupe Immobilier Rousseau', 'Garage Pelletier', 'Physio Saint-Roch'];
const AR_TEAM = ['Marie Chen', 'Marc Tremblay', 'Julie Bergeron'];
const AR_FORFAITS = ['Essentiel', 'Croissance', 'Sur mesure'];
const AR_DIMS = ['Présence en ligne', 'SEO', 'Design'];
const AR_SEVS = ['Critique', 'Important', 'Opportunité'];
const AR_FAIL_MAX = 3; // seuil : au-delà de 3 échecs consécutifs, la règle est mise en pause automatiquement

/* Règle éditée par défaut : celle que « Modifier » ouvre depuis la page Workflow. */
const AR_RULE0 = {
  name: 'Alerte chute de position',
  desc: 'Surveille les mots-clés stratégiques et ouvre une priorité quand ils décrochent.',
  status: 'active',
  trigger: 'position',
  params: { places: 5 },
  conds: [{ kind: 'volume', value: 500 }, { kind: 'clients', value: ['Acme Corp.', 'Toiture Lavoie', 'Clinique DentAlex'] }],
  action: 'priorite',
  actionParams: { sev: 'Important', dim: 'SEO', assignee: 'Marie Chen', effort: 2, dest: 'client' },
};

const AR_LOG0 = [
  { id: 'X-0912', at: '9 sept. 2026, 07 h 58', ok: true, matched: 1, produced: 'Priorité P-0661 créée — « couvreur rive-nord prix » perd 10 places', href: 'Priorite Detail.html' },
  { id: 'X-0905', at: '2 sept. 2026, 07 h 55', ok: true, matched: 2, produced: '2 priorités créées — Acme Corp. et Clinique DentAlex', href: 'Priorite Detail.html' },
  { id: 'X-0898', at: '26 août 2026, 07 h 56', ok: false, matched: 0, produced: 'Échec : jeton Google Search Console expiré pour Toiture Lavoie', err: true, href: 'Parametres.html' },
  { id: 'X-0891', at: '19 août 2026, 07 h 54', ok: true, matched: 0, produced: 'Aucun mot-clé au-delà du seuil — rien créé' },
  { id: 'X-0884', at: '12 août 2026, 07 h 57', ok: true, matched: 3, produced: '3 priorités créées — Toiture Lavoie (2), Acme Corp. (1)', href: 'Priorite Detail.html' },
];

const AR_LOG_FAIL = [
  { id: 'X-0912', at: '9 sept. 2026, 07 h 58', ok: false, matched: 0, produced: 'Échec : jeton Google Search Console expiré pour Toiture Lavoie', err: true, href: 'Parametres.html' },
  { id: 'X-0905', at: '2 sept. 2026, 07 h 55', ok: false, matched: 0, produced: 'Échec : jeton Google Search Console expiré pour Toiture Lavoie', err: true, href: 'Parametres.html' },
  { id: 'X-0898', at: '26 août 2026, 07 h 56', ok: false, matched: 0, produced: 'Échec : quota d’API dépassé pour le relevé de positions', err: true, href: 'Parametres.html' },
  { id: 'X-0891', at: '19 août 2026, 07 h 54', ok: true, matched: 1, produced: 'Priorité P-0640 créée — Bistro Le Chalet', href: 'Priorite Detail.html' },
];

/* Test à blanc : ce que la règle aurait fait le mois dernier, avec ses réglages actuels. */
const AR_DRY = [
  { date: '2 sept.', client: 'Acme Corp.', detail: '« métadonnées og » perd 6 places (1 200 rech./mois)', would: 'Priorité importante · SEO' },
  { date: '2 sept.', client: 'Clinique DentAlex', detail: '« dentiste laval prix » perd 8 places (940 rech./mois)', would: 'Priorité importante · SEO' },
  { date: '26 août', client: 'Toiture Lavoie', detail: '« couvreur laval » perd 5 places (610 rech./mois)', would: 'Priorité importante · SEO' },
  { date: '19 août', client: 'Acme Corp.', detail: '« audit seo montréal » perd 11 places (780 rech./mois)', would: 'Priorité importante · SEO' },
  { date: '12 août', client: 'Toiture Lavoie', detail: '« toiture urgence rive-nord » perd 7 places (520 rech./mois)', would: 'Priorité importante · SEO' },
];

/* Données du mois dernier par déclencheur : le test à blanc les rejoue avec les réglages courants.
   Chaque entrée porte la valeur mesurée (v) comparée au paramètre de la règle. */
const AR_DRY_BY_TRIGGER = {
  position: [
    { date: '2 sept.', client: 'Acme Corp.', v: 6, detail: '« métadonnées og » perd 6 places (1 200 rech./mois)', vol: 1200 },
    { date: '2 sept.', client: 'Clinique DentAlex', v: 8, detail: '« dentiste laval prix » perd 8 places (940 rech./mois)', vol: 940 },
    { date: '26 août', client: 'Toiture Lavoie', v: 5, detail: '« couvreur laval » perd 5 places (610 rech./mois)', vol: 610 },
    { date: '19 août', client: 'Acme Corp.', v: 11, detail: '« audit seo montréal » perd 11 places (780 rech./mois)', vol: 780 },
    { date: '12 août', client: 'Toiture Lavoie', v: 7, detail: '« toiture urgence rive-nord » perd 7 places (520 rech./mois)', vol: 520 },
    { date: '12 août', client: 'Bistro Le Chalet', v: 4, detail: '« fondue vieux-québec » perd 4 places (310 rech./mois)', vol: 310 },
  ],
  score: [
    { date: '5 sept.', client: 'Toiture Lavoie', v: 61, detail: 'score de santé descendu à 61' },
    { date: '28 août', client: 'Physio Saint-Roch', v: 66, detail: 'score de santé descendu à 66' },
    { date: '21 août', client: 'Dépanneur Lachine', v: 58, detail: 'score de santé descendu à 58' },
    { date: '14 août', client: 'Bistro Le Chalet', v: 74, detail: 'score de santé descendu à 74' },
  ],
  crawl: [
    { date: '8 sept.', client: 'Acme Corp.', v: 23, detail: '23 nouveaux liens brisés découverts' },
    { date: '3 sept.', client: 'Bistro Le Chalet', v: 48, detail: '48 pages en 404 après la refonte' },
    { date: '27 août', client: 'Groupe Rousseau', v: 4, detail: '4 pages en 404 sur les pages quartiers' },
    { date: '20 août', client: 'Clinique DentAlex', v: 12, detail: '12 balises title dupliquées' },
  ],
  avis: [
    { date: '9 sept.', client: 'Bistro Le Chalet', v: 1, detail: 'avis 1 ★ — « service très lent »' },
    { date: '30 août', client: 'Toiture Lavoie', v: 2, detail: 'deux avis 2 ★ le même jour' },
    { date: '24 août', client: 'Physio Saint-Roch', v: 3, detail: 'avis 3 ★ — délai de rendez-vous' },
    { date: '16 août', client: 'Clinique DentAlex', v: 5, detail: 'avis 5 ★ — aucune action attendue' },
  ],
  facture: [
    { date: '9 sept.', client: 'Toiture Lavoie', v: 12, detail: 'facture 2026-0431 · 1 850 $ · 12 jours de retard' },
    { date: '2 sept.', client: 'Garage Pelletier', v: 5, detail: 'facture 2026-0425 · 1 400 $ · 5 jours de retard' },
    { date: '25 août', client: 'Dépanneur Lachine', v: 2, detail: 'facture 2026-0419 · 780 $ · 2 jours de retard' },
  ],
  citation: [
    { date: '6 sept.', client: 'Toiture Lavoie', v: 4, detail: '4 annuaires affichent l’ancien numéro' },
    { date: '29 août', client: 'Bistro Le Chalet', v: 2, detail: '2 annuaires affichent d’anciennes heures' },
    { date: '18 août', client: 'Physio Saint-Roch', v: 1, detail: '1 annuaire affiche une adresse périmée' },
  ],
  date: [
    { date: '2 sept.', client: 'Tout le portefeuille', v: 2, detail: 'le 2 du mois est passé une fois sur la période' },
  ],
  pipeline: [
    { date: '8 sept.', client: 'Immobilier Vista', v: 'Gagné', detail: 'deal passé à l’étape « Gagné »' },
    { date: '4 sept.', client: 'Clinique Santé Plus', v: 'Négociation', detail: 'deal passé à l’étape « Négociation »' },
    { date: '27 août', client: 'Brasserie Houblon', v: 'Gagné', detail: 'deal passé à l’étape « Gagné »' },
  ],
};

/* Le test compare la valeur mesurée au paramètre : « au moins » pour les volumes, « au plus » pour les notes. */
const AR_DRY_CMP = {
  position: (v, n) => v >= n, crawl: (v, n) => v >= n, citation: (v, n) => v >= n,
  facture: (v, n) => v >= n, score: (v, n) => v < n, avis: (v, n) => v <= n,
  date: () => true, pipeline: (v, n) => v === n,
};

function arDryRun(rule) {
  const t = window.AR_TRIGGERS[rule.trigger];
  if (!t) return [];
  const p = t.param;
  const n = rule.params[p.key] !== undefined ? rule.params[p.key] : p.def;
  const cmp = AR_DRY_CMP[rule.trigger] || (() => true);
  const volCond = rule.conds.find(c => c.kind === 'volume');
  const cliCond = rule.conds.find(c => c.kind === 'clients');
  const label = rule.action === 'priorite' ? `Priorité ${rule.actionParams.sev.toLowerCase()} · ${rule.actionParams.dim}`
    : rule.action === 'tache' ? `Tâche · ${rule.actionParams.assignee} · ${rule.actionParams.effort} h`
    : rule.action ? window.AR_ACTIONS[rule.action].label : '—';
  return (AR_DRY_BY_TRIGGER[rule.trigger] || [])
    .filter(r => cmp(r.v, n))
    .filter(r => !volCond || (r.vol === undefined ? true : r.vol >= volCond.value))
    .filter(r => !cliCond || cliCond.value.length === 0 || cliCond.value.includes(r.client) || r.client === 'Tout le portefeuille')
    .map(r => ({ ...r, would: label }));
}

function arScenario(key) {
  const r = { ...AR_RULE0, params: { ...AR_RULE0.params }, conds: AR_RULE0.conds.map(c => ({ ...c })), actionParams: { ...AR_RULE0.actionParams } };
  if (key === 'nouvelle') return { rule: { name: '', desc: '', status: 'brouillon', trigger: null, params: {}, conds: [], action: null, actionParams: { sev: 'Important', dim: 'SEO', assignee: 'Marie Chen', effort: 2, dest: 'client' } }, log: [] };
  if (key === 'pause') return { rule: { ...r, status: 'pause' }, log: AR_LOG0 };
  if (key === 'echec') return { rule: { ...r, status: 'echec' }, log: AR_LOG_FAIL };
  if (key === 'jamais') return { rule: { ...r, name: 'Incohérence de citation détectée', desc: 'Ouvre une tâche dès qu’un annuaire affiche des coordonnées divergentes.', status: 'active', trigger: 'citation', params: { annuaires: 3 }, conds: [], action: 'tache' }, log: [] };
  return { rule: r, log: AR_LOG0 };
}

/* Une condition qui ne parle pas du déclencheur choisi est retirée : la phrase doit rester vraie. */
const arCondAllowed = (kind, trigger) => { const k = AR_COND_KINDS[kind]; return !k.only || (trigger && k.only.includes(trigger)); };
const arPruneConds = (conds, trigger) => conds.filter(c => arCondAllowed(c.kind, trigger));

Object.assign(window, { arCondAllowed, arPruneConds, AR_DRY_BY_TRIGGER, arDryRun, AR_TRIGGERS, AR_COND_KINDS, AR_ACTIONS, AR_CLIENTS, AR_TEAM, AR_FORFAITS, AR_DIMS, AR_SEVS, AR_FAIL_MAX, AR_RULE0, AR_LOG0, AR_DRY, arScenario });
