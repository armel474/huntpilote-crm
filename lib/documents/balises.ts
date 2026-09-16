/**
 * Les balises des modèles de documents — session 9.3.
 *
 * La syntaxe canonique (décision du 14 septembre 2026) est celle des
 * maquettes : `{{groupe.champ}}` pour une valeur, `{{#bloc}}…{{/bloc}}` pour
 * répéter ou conditionner, `{{^bloc}}…{{/bloc}}` pour le contraire. Un bloc
 * sur une liste se répète ; sur une valeur vide, il ne se rend pas ; sur une
 * valeur pleine, il se rend une fois. C'est ainsi qu'une « ligne bonus » ou
 * une « section optionnelle » disparaît d'elle-même.
 *
 * Les gabarits réels de l'agence emploient deux formes héritées —
 * `[NOM DU CLIENT]` dans le contrat et l'annexe, `{{ENTREPRISE_CLIENT}}` dans
 * l'offre — que l'éditeur reconnaît et propose de convertir (annexe A de
 * l'analyse). Il ne les rend pas.
 *
 * Rien ici ne touche à la base ni au navigateur : tout se teste seul.
 */

export type TagGroup = {
  id: string;
  label: string;
  /** Balise sans les moustaches, et une valeur d'exemple. */
  tags: [string, string][];
};

/** Les valeurs simples, par groupe. */
export const TAG_GROUPS: TagGroup[] = [
  {
    id: 'agence',
    label: 'Agence',
    tags: [
      ['agence.nom', 'Agence DigiHunt'],
      ['agence.raison_sociale', 'Armel Junior Nguimbi, faisant affaire sous le nom d’« Agence DigiHunt »'],
      ['agence.adresse', '221, 25e Rue des Mouettes, Québec (QC) G1E 7G1'],
      ['agence.ville', 'Québec'],
      ['agence.telephone', '+1 (581) 994-0142'],
      ['agence.courriel', 'bonjour@agencedh.com'],
      ['agence.site', 'agencedh.com'],
      ['agence.tps', '123456789 RT0001'],
      ['agence.tvq', '1234567890 TQ0001'],
      ['agence.neq', '2272419658'],
      ['agence.logo', '(adresse de l’image du logo)'],
      ['agence.representant', 'Armel Junior Nguimbi'],
      ['agence.representant_titre', 'Fondateur'],
      ['agence.district_judiciaire', 'Québec'],
    ],
  },
  {
    id: 'client',
    label: 'Client',
    tags: [
      ['client.nom', 'SHGM'],
      ['client.raison_sociale', 'Société d’Histoire et de Généalogie de La Matapédia'],
      ['client.forme_juridique', 'organisme sans but lucratif'],
      ['client.adresse', '24 Promenade Marcel-Rioux, Amqui (Québec) G5J 3E1'],
      ['client.ville', 'Amqui'],
      ['client.secteur', 'Organisme sans but lucratif'],
      ['client.courriel', 'info@shgm.org'],
      ['client.telephone', '(418) 555-0142'],
      ['client.contact.nom', 'Audrey Venick'],
      ['client.contact.prenom', 'Audrey'],
      ['client.contact.nom_famille', 'Venick'],
      ['client.contact.titre', 'Présidente'],
      ['client.contact.courriel', 'presidence@shgm.org'],
    ],
  },
  {
    id: 'document',
    label: 'Document',
    tags: [
      ['document.reference', 'PR-2026-004'],
      ['document.date', '16 septembre 2026'],
      ['document.echeance', '16 octobre 2026'],
      ['document.objet', 'Refonte du site web'],
      ['document.engagement_mois', '3'],
      ['document.introduction', '(texte du modèle)'],
      ['document.mentions', '(texte du modèle)'],
      ['document.pied', '(texte du modèle)'],
      ['document.paiement', '(texte du modèle)'],
    ],
  },
  {
    id: 'proposition',
    label: 'Proposition acceptée (dans un contrat)',
    tags: [
      ['proposition.reference', 'PR-2026-004'],
      ['proposition.date', '2 septembre 2026'],
    ],
  },
  {
    id: 'contrat',
    label: 'Contrat',
    tags: [
      ['contrat.reference', '2026-007'],
      ['contrat.titre', 'Conception, développement et mise en ligne du site web'],
      ['contrat.date_debut', '1er octobre 2026'],
      ['contrat.taux_horaire', '100'],
      ['contrat.nombre_pages', '12'],
      ['contrat.collections_cms', '7'],
      ['contrat.solution_paiement', 'Zeffy'],
    ],
  },
  {
    id: 'brief',
    label: 'Brief de découverte',
    tags: [
      ['brief.date_appel', '9 septembre 2026'],
      ['brief.atout_principal', 'une expertise reconnue dans la région'],
      ['brief.probleme_cardinal', 'un site désuet qui ne génère aucune demande'],
      ['brief.objectif_principal', 'générer des demandes de soumission en ligne'],
      ['brief.resultat_vise', '+30 % de demandes en 6 mois'],
      ['brief.canal_actuel', 'les messages privés Facebook'],
      ['brief.canal_publicitaire', 'Meta (Facebook et Instagram)'],
      ['brief.taux_annulation', '25 %'],
      ['brief.coeur_metier', 'l’ébénisterie sur mesure'],
      ['brief.offre_specialisee', 'le mobilier sur mesure'],
      ['brief.atout_concurrentiel', 'un savoir-faire artisanal'],
      ['brief.systeme_reservation', 'Acuity'],
      ['brief.zone_secondaire', 'la Gaspésie et le Bas-Saint-Laurent'],
    ],
  },
  {
    id: 'offre_recommandee',
    label: 'Offre recommandée',
    tags: [
      ['offre_recommandee.nom', 'Croissance Digitale'],
      ['offre_recommandee.prix', '9 000'],
      ['offre_recommandee.delai', '5 à 6 semaines'],
    ],
  },
  {
    id: 'maintenance_recommandee',
    label: 'Maintenance recommandée',
    tags: [
      ['maintenance_recommandee.nom', 'Maintenance Croissance'],
      ['maintenance_recommandee.prix_mensuel', '450'],
    ],
  },
  {
    id: 'total',
    label: 'Totaux',
    tags: [
      ['total.ht', '9 000,00 $'],
      ['total.tps', '450,00 $'],
      ['total.tvq', '897,75 $'],
      ['total.ttc', '10 347,75 $'],
      ['total.ponctuel_ht', '9 000,00 $'],
      ['total.mensuel_ht', '450,00 $'],
      ['total.recurrent_engagement', '1 350,00 $'],
      ['total.avant_remise', '9 500,00 $'],
      ['total.global_estime', '12 750,00 $'],
    ],
  },
  {
    id: 'remise',
    label: 'Remise (bloc conditionnel {{#remise}})',
    tags: [
      ['remise.pourcentage', '10'],
      ['remise.montant', '500,00 $'],
    ],
  },
  {
    id: 'acompte',
    label: 'Acompte et solde',
    tags: [
      ['acompte.pourcentage', '50'],
      ['acompte.montant_ht', '4 500,00 $'],
      ['acompte.montant_ttc', '5 173,88 $'],
      ['solde.pourcentage', '50'],
      ['solde.montant_ht', '4 500,00 $'],
      ['solde.montant_ttc', '5 173,87 $'],
    ],
  },
  {
    id: 'budget',
    label: 'Budget média (lignes informatives)',
    tags: [
      ['budget.total', '1 800,00 $'],
      ['budget.mensuel', '600,00 $'],
      ['budget.quotidien', '20,00 $'],
    ],
  },
  {
    id: 'signature',
    label: 'Signature',
    tags: [
      ['signature.agence', 'Armel Junior Nguimbi, Fondateur'],
      ['signature.client', 'Audrey Venick, Présidente'],
      ['signature.date', '___________________'],
    ],
  },
];

export type BlockDef = {
  /** Le préfixe des champs d'un élément : `{{#lignes}} … {{ligne.description}} … {{/lignes}}`. */
  item: string;
  label: string;
  fields: [string, string][];
  /** Les blocs qu'un élément porte à son tour : `{{#offre.lignes}}`. */
  nested?: Record<string, BlockDef>;
};

/** Les blocs répétés : ce qu'ils parcourent, et ce que chaque élément expose. */
export const BLOCKS: Record<string, BlockDef> = {
  lignes: {
    item: 'ligne',
    label: 'Les lignes facturables du document',
    fields: [
      ['ligne.description', 'Forfait Croissance Digitale'],
      ['ligne.quantite', '1'],
      ['ligne.prix', '9 000,00 $'],
      ['ligne.montant', '9 000,00 $'],
      ['ligne.recurrence', 'paiement unique'],
    ],
  },
  lignes_ponctuelles: { item: 'ligne', label: 'Les lignes à paiement unique', fields: [['ligne.description', 'Landing page'], ['ligne.montant', '2 400,00 $']] },
  lignes_recurrentes: { item: 'ligne', label: 'Les lignes récurrentes', fields: [['ligne.description', 'Gestion mensuelle'], ['ligne.montant', '450,00 $'], ['ligne.recurrence', '/ mois']] },
  lignes_offertes: { item: 'ligne', label: 'Les lignes offertes — le bonus', fields: [['ligne.description', 'Séance photo produit'], ['ligne.montant', 'Offert']] },
  lignes_informatives: { item: 'ligne', label: 'Les lignes informatives, hors totaux', fields: [['ligne.description', 'Budget média Meta'], ['ligne.montant', '1 800,00 $']] },
  offres: {
    item: 'offre',
    label: 'Les forfaits web du catalogue',
    fields: [
      ['offre.nom', 'Présence Digitale'],
      ['offre.accroche', 'Votre vitrine professionnelle sur le web'],
      ['offre.description', '(le descriptif long de l’offre, s’il y en a un)'],
      ['offre.prix', '4 500'],
      ['offre.prix_prefixe', 'À partir de'],
      ['offre.delai', '4 semaines'],
      ['offre.consultation', '30'],
    ],
    nested: {
      lignes: { item: 'ligne', label: 'Ce que l’offre inclut', fields: [['ligne.texte', 'Maquette Figma (desktop et mobile)']] },
      benefices: { item: 'benefice', label: 'Ce que le client y gagne', fields: [['benefice.texte', 'Un site qui inspire confiance']] },
      segments: { item: 'segment', label: 'Pour qui', fields: [['segment.nom', 'Artisans']] },
      populaire: { item: 'offre', label: 'Condition : l’offre est mise en avant', fields: [] },
    },
  },
  offres_maintenance: {
    item: 'offre',
    label: 'Les packs de maintenance du catalogue',
    fields: [
      ['offre.nom', 'Maintenance Essentiel'],
      ['offre.prix_mensuel', '200'],
      ['offre.heures', '2'],
      ['offre.taux_depassement', '95'],
      ['offre.ideal_avec', 'Présence Digitale'],
    ],
    nested: { lignes: { item: 'ligne', label: 'Ce que le pack inclut', fields: [['ligne.texte', 'Sauvegardes du site']] } },
  },
  livrables: {
    item: 'livrable',
    label: 'Les livrables du contrat',
    fields: [
      ['livrable.code', 'L-01'],
      ['livrable.titre', 'Architecture et arborescence'],
      ['livrable.description', 'Structure des pages, hiérarchie de contenu et navigation.'],
      ['livrable.rondes', '1 ronde'],
      ['livrable.echeance', '15 octobre 2026'],
    ],
  },
  jalons: {
    item: 'jalon',
    label: 'Les jalons du contrat',
    fields: [
      ['jalon.code', 'J-01'],
      ['jalon.titre', 'Signature du contrat et versement de l’acompte'],
      ['jalon.responsable', 'Client'],
      ['jalon.date', '1er octobre 2026'],
    ],
  },
  exclusions: {
    item: 'exclusion',
    label: 'Ce qui est exclu du contrat',
    fields: [
      ['exclusion.texte', 'Prestation SEO'],
      ['exclusion.detail', 'L-11 inclut des conseils SEO de base uniquement.'],
    ],
  },
  paiements: {
    item: 'paiement',
    label: 'L’échéancier de paiement',
    fields: [
      ['paiement.titre', 'Acompte à la signature'],
      ['paiement.pourcentage', '50 %'],
      ['paiement.montant_ht', '4 875,00 $'],
      ['paiement.montant_ttc', '5 605,03 $'],
      ['paiement.echeance', '1er octobre 2026'],
      ['paiement.declencheur', 'À la signature du contrat'],
    ],
  },
  attendus_client: {
    item: 'attendu',
    label: 'Ce que le client doit fournir',
    fields: [
      ['attendu.texte', 'Textes de présentation (mission, historique, équipe)'],
      ['attendu.format', 'Document Word, PDF ou courriel'],
      ['attendu.note', 'Si indisponibles, le Prestataire rédigera sur la base des éléments bruts.'],
    ],
  },
};

/** Les groupes qui, sans être des listes, servent de condition : `{{#remise}}…{{/remise}}`. */
export const CONDITION_GROUPS = ['remise', 'maintenance_recommandee', 'offre_recommandee', 'brief', 'proposition', 'contrat', 'budget'];

const KNOWN = new Set<string>();
for (const g of TAG_GROUPS) for (const [t] of g.tags) KNOWN.add(t);
for (const [name, b] of Object.entries(BLOCKS)) {
  KNOWN.add(`#${name}`);
  for (const [t] of b.fields) KNOWN.add(t);
  for (const [sub, n] of Object.entries(b.nested ?? {})) {
    KNOWN.add(`#${b.item}.${sub}`);
    for (const [t] of n.fields) KNOWN.add(t);
  }
}
for (const c of CONDITION_GROUPS) KNOWN.add(`#${c}`);
/** Dans un bloc répété, chaque élément sait s'il est le premier, le dernier, et son rang. */
export const ITEM_META: [string, string][] = [['index', '1'], ['premier', '(condition)'], ['dernier', '(condition)']];
for (const [m] of ITEM_META) {
  KNOWN.add(m);
  KNOWN.add(`#${m}`);
}

/** Toutes les balises connues, moustaches comprises, pour les suggestions. */
export const KNOWN_TAGS: string[] = [...KNOWN].filter((t) => !t.startsWith('#'));

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array<number>(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]);
    }
  }
  return d[m][n];
}

/** La balise connue la plus proche d'une balise inconnue, ou null si rien ne ressemble. */
export function closestTag(tag: string): string | null {
  // Quand le groupe existe (`client.`, `total.`), la bonne balise est dans ce
  // groupe : on n'y cherche que là.
  const group = tag.split('.')[0];
  const sameGroup = KNOWN_TAGS.filter((k) => k.startsWith(`${group}.`));
  const candidates = sameGroup.length ? sameGroup : KNOWN_TAGS;
  // `client.nom_commercial` voulait dire `client.nom` : une balise connue qui
  // commence la balise inconnue l'emporte sur la distance d'édition.
  const prefix = candidates.filter((k) => tag.startsWith(k) && /[._]/.test(tag.charAt(k.length))).sort((a, b) => b.length - a.length)[0];
  if (prefix) return prefix;
  let best: string | null = null;
  let bestD = Infinity;
  for (const k of candidates) {
    const dist = levenshtein(tag, k);
    if (dist < bestD) {
      bestD = dist;
      best = k;
    }
  }
  return bestD <= Math.max(4, Math.ceil(tag.length / 2)) ? best : null;
}

/* ── Les formes héritées ── */

/** Annexe A de l'analyse : la balise héritée et sa forme canonique. */
export const LEGACY_MAP: Record<string, string> = {
  ENTREPRISE_CLIENT: 'client.nom',
  PRENOM_CLIENT: 'client.contact.prenom',
  NOM_CLIENT: 'client.contact.nom',
  TITRE_CLIENT: 'client.contact.titre',
  VILLE: 'client.ville',
  VILLE_CLIENT: 'client.ville',
  SECTEUR: 'client.secteur',
  SECTEUR_CLIENT: 'client.secteur',
  ADRESSE_CLIENT: 'client.adresse',
  COURRIEL_CLIENT: 'client.courriel',
  TEL_CLIENT: 'client.telephone',
  DATE: 'document.date',
  DATE_EXPIRATION: 'document.echeance',
  VALIDITE: 'document.echeance',
  DATE_RENCONTRE: 'brief.date_appel',
  ATOUT_PRINCIPAL: 'brief.atout_principal',
  PROBLEME_CARDINAL: 'brief.probleme_cardinal',
  OBJECTIF_PRINCIPAL: 'brief.objectif_principal',
  RESULTAT_CHIFFRE: 'brief.resultat_vise',
  CANAL_ACTUEL: 'brief.canal_actuel',
  CANAL_PUB: 'brief.canal_publicitaire',
  TAUX_ANNULATION: 'brief.taux_annulation',
  COEUR_METIER: 'brief.coeur_metier',
  OFFRE_SPECIALISEE: 'brief.offre_specialisee',
  ATOUT_CONCURRENTIEL: 'brief.atout_concurrentiel',
  SYSTEME_RESERVATION: 'brief.systeme_reservation',
  FORFAIT_RECOMMANDE: 'offre_recommandee.nom',
  PRIX_FORFAIT: 'offre_recommandee.prix',
  DUREE: 'offre_recommandee.delai',
  DELAI_LANCEMENT: 'offre_recommandee.delai',
  FORFAIT_MAINTENANCE: 'maintenance_recommandee.nom',
  PRIX_MAINTENANCE: 'maintenance_recommandee.prix_mensuel',
  PRIX_PHASE1: 'total.ponctuel_ht',
  PRIX_PHASE1_BARRE: 'total.avant_remise',
  ESCOMPTE_PCT: 'remise.pourcentage',
  MONTANT_ESCOMPTE: 'remise.montant',
  PRIX_MENSUEL: 'total.mensuel_ht',
  ENGAGEMENT_MOIS: 'document.engagement_mois',
  TOTAL_PHASE2: 'total.recurrent_engagement',
  TOTAL_HONORAIRES: 'total.ht',
  TOTAL_GLOBAL: 'total.global_estime',
  ACOMPTE: 'acompte.montant_ht',
  SOLDE: 'solde.montant_ht',
  BUDGET_META_TOTAL: 'budget.total',
  BUDGET_MENSUEL: 'budget.mensuel',
  BUDGET_JOUR: 'budget.quotidien',
  'NOM DU CLIENT': 'client.raison_sociale',
  'FORME JURIDIQUE DU CLIENT': 'client.forme_juridique',
  'ADRESSE DU CLIENT': 'client.adresse',
  'NOM DU REPRÉSENTANT DU CLIENT': 'client.contact.nom',
  'TITRE DU REPRÉSENTANT DU CLIENT': 'client.contact.titre',
  'NOM DU SIGNATAIRE CLIENT': 'client.contact.nom',
  'TITRE DU SIGNATAIRE CLIENT': 'client.contact.titre',
  'NOM DU CONTACT CLIENT': 'client.contact.nom',
  'TITRE DU CONTACT CLIENT': 'client.contact.titre',
  'NUMÉRO DE PROPOSITION': 'proposition.reference',
  'DATE DE LA PROPOSITION': 'proposition.date',
  'NUMÉRO DU CONTRAT': 'contrat.reference',
  'DATE DU DOCUMENT': 'document.date',
  'MONTANT DES HONORAIRES': 'total.ht',
  'MONTANT HONORAIRES': 'total.ht',
  'MONTANT TPS': 'total.tps',
  'MONTANT TVQ': 'total.tvq',
  'MONTANT TOTAL TTC': 'total.ttc',
  'MONTANT ACOMPTE TTC': 'acompte.montant_ttc',
  'MONTANT ACOMPTE HT': 'acompte.montant_ht',
  'MONTANT SOLDE TTC': 'solde.montant_ttc',
  'MONTANT SOLDE HT': 'solde.montant_ht',
  'DISTRICT JUDICIAIRE': 'agence.district_judiciaire',
  'ADRESSE DU PRESTATAIRE': 'agence.adresse',
  'NOMBRE DE PAGES': 'contrat.nombre_pages',
  'NOMBRE DE COLLECTIONS CMS': 'contrat.collections_cms',
  'SOLUTION DE PAIEMENT': 'contrat.solution_paiement',
  'DATE DE DÉBUT PRÉVUE': 'contrat.date_debut',
  'DATE DE DÉBUT — À CONFIRMER': 'contrat.date_debut',
};

/** `{{MAJUSCULES}}` (offre, Meta Ads) et `[MAJUSCULES]` (contrat, annexe), avec ou sans leur surlignage. */
const LEGACY_MUSTACHE = /(<mark class="tki?"[^>]*>\s*)?\{\{([A-Z][A-Z0-9_]+)\}\}(\s*<\/mark>)?/g;
const LEGACY_BRACKET = /(<(?:span|strong) data-todo=""[^>]*>\s*)?\[([A-ZÀ-Ý][A-ZÀ-Ý0-9 —'’]+)\](\s*<\/(?:span|strong)>)?/g;

export type LegacyTag = { raw: string; canonical: string | null };

/** Les balises héritées présentes, avec leur forme canonique quand l'annexe A la connaît. */
export function findLegacy(html: string): LegacyTag[] {
  const seen = new Map<string, string | null>();
  for (const m of html.matchAll(LEGACY_MUSTACHE)) {
    if (m[2] === 'TOKEN') continue;
    seen.set(`{{${m[2]}}}`, LEGACY_MAP[m[2]] ?? null);
  }
  for (const m of html.matchAll(LEGACY_BRACKET)) {
    const key = m[2].trim();
    if (['TOKEN', 'data-todo', 'data-token'].includes(key)) continue;
    seen.set(`[${key}]`, LEGACY_MAP[key] ?? null);
  }
  return [...seen].map(([raw, canonical]) => ({ raw, canonical }));
}

/**
 * Convertit les formes héritées connues en balises canoniques, en retirant
 * leur surlignage de gabarit. Ce que l'annexe A ne connaît pas reste tel
 * quel, et l'analyse continue de le signaler.
 */
export function convertLegacy(html: string): string {
  let out = html.replace(/<mark class="tki?"[^>]*>\s*\{\{PRENOM_CLIENT\}\} \{\{NOM_CLIENT\}\}\s*<\/mark>/g, '{{client.contact.nom}}');
  out = out.replace(LEGACY_MUSTACHE, (m, open, key, close) => {
    const canonical = LEGACY_MAP[key];
    if (!canonical) return m;
    return `${open && !close ? open : ''}{{${canonical}}}${close && !open ? close : ''}`;
  });
  out = out.replace(LEGACY_BRACKET, (m, open, key, close) => {
    const canonical = LEGACY_MAP[key.trim()];
    if (!canonical) return m;
    return `${open && !close ? open : ''}{{${canonical}}}${close && !open ? close : ''}`;
  });
  return out;
}

/* ── L'analyse ── */

export type Analysis = {
  /** Les balises reconnues, distinctes. */
  known: string[];
  unknown: { tag: string; suggestion: string | null }[];
  /** Les blocs répétés ou conditionnels rencontrés. */
  blocks: string[];
  /** Les sections du modèle que le corps désigne, et celles qu'il désigne sans les déclarer. */
  sectionsUsed: string[];
  sectionsMissing: string[];
  /** Les sections déclarées que le corps ne place nulle part. */
  sectionsUnplaced: string[];
  legacy: LegacyTag[];
  /** Les blocs ouverts sans être refermés, ou l'inverse. */
  unbalanced: string[];
};

const TAG_RE = /\{\{([#^/]?)([a-z][a-z0-9_.]*)\}\}/g;

/** Lit un corps HTML : ce qu'il reconnaît, ce qu'il ignore, ce qu'il répète. */
export function analyzeTemplate(html: string, sectionKeys: string[] = []): Analysis {
  const known = new Set<string>();
  const unknown = new Map<string, string | null>();
  const blocks = new Set<string>();
  const sectionsUsed = new Set<string>();
  const sectionsMissing = new Set<string>();
  const opened: string[] = [];
  const unbalanced: string[] = [];
  const stack: string[] = [];

  for (const m of html.matchAll(TAG_RE)) {
    const [, sigil, path] = m;
    if (sigil === '/') {
      const top = stack.pop();
      if (top !== path) unbalanced.push(`{{/${path}}}`);
      continue;
    }
    if (sigil === '#' || sigil === '^') {
      stack.push(path);
      blocks.add(path);
      opened.push(path);
      if (KNOWN.has(`#${path}`) || KNOWN.has(path) || path.startsWith('section.')) known.add(`${sigil}${path}`);
      else unknown.set(`${sigil}${path}`, null);
      continue;
    }
    if (path.startsWith('section.')) {
      const key = path.slice('section.'.length);
      sectionsUsed.add(key);
      if (sectionKeys.includes(key)) known.add(path);
      else sectionsMissing.add(key);
      continue;
    }
    if (KNOWN.has(path)) known.add(path);
    else unknown.set(path, closestTag(path));
  }
  for (const left of stack) unbalanced.push(`{{#${left}}}`);

  return {
    known: [...known],
    unknown: [...unknown].map(([tag, suggestion]) => ({ tag, suggestion })),
    blocks: [...blocks],
    sectionsUsed: [...sectionsUsed],
    sectionsMissing: [...sectionsMissing],
    sectionsUnplaced: sectionKeys.filter((k) => !sectionsUsed.has(k)),
    legacy: findLegacy(html),
    unbalanced,
  };
}

/** Un modèle est complet quand rien ne l'empêche de servir au générateur. */
export function isComplete(a: Analysis): boolean {
  return a.unknown.length === 0 && a.legacy.length === 0 && a.sectionsMissing.length === 0 && a.unbalanced.length === 0;
}

/* ── Le rendu ── */

export type DocValue = string | number | boolean | null | undefined | DocValue[] | { [key: string]: DocValue };
export type DocData = { [key: string]: DocValue };

function lookup(path: string, contexts: DocData[]): DocValue {
  const parts = path.split('.');
  for (const ctx of contexts) {
    let v: DocValue = ctx;
    let ok = true;
    for (const p of parts) {
      if (v && typeof v === 'object' && !Array.isArray(v) && p in v) v = (v as DocData)[p];
      else {
        ok = false;
        break;
      }
    }
    if (ok) return v;
  }
  return undefined;
}

const truthy = (v: DocValue) => !(v === undefined || v === null || v === false || v === '' || (Array.isArray(v) && v.length === 0));

const SECTION_RE = /\{\{([#^])([a-z][a-z0-9_.]*)\}\}([\s\S]*?)\{\{\/\2\}\}/;

/** Le nom qu'un élément de bloc porte : `lignes` → `ligne`, `offre.benefices` → `benefice`. */
function itemName(block: string): string {
  const last = block.split('.').pop() as string;
  const def = BLOCKS[last];
  if (def) return def.item;
  for (const b of Object.values(BLOCKS)) {
    const n = b.nested?.[last];
    if (n) return n.item;
  }
  return last.endsWith('s') ? last.slice(0, -1) : last;
}

function renderWith(html: string, contexts: DocData[]): string {
  let out = html;
  let m: RegExpMatchArray | null;
  // Les blocs, du plus intérieur au plus extérieur : la recherche non gourmande
  // trouve d'abord le premier bloc fermé, qui n'en contient aucun autre.
  while ((m = out.match(SECTION_RE))) {
    const [whole, sigil, path, inner] = m;
    const value = lookup(path, contexts);
    let replacement = '';
    if (sigil === '^') {
      replacement = truthy(value) ? '' : renderWith(inner, contexts);
    } else if (Array.isArray(value)) {
      const name = itemName(path);
      replacement = value
        .map((item, i) => {
          const ctx: DocData = item && typeof item === 'object' && !Array.isArray(item) ? { ...(item as DocData) } : { valeur: item };
          ctx.index = i + 1;
          ctx.premier = i === 0;
          ctx.dernier = i === value.length - 1;
          return renderWith(inner, [{ [name]: ctx }, ctx, ...contexts]);
        })
        .join('');
    } else if (truthy(value)) {
      const ctx = value && typeof value === 'object' ? (value as DocData) : {};
      replacement = renderWith(inner, [ctx, ...contexts]);
    }
    out = out.slice(0, m.index) + replacement + out.slice((m.index ?? 0) + whole.length);
  }
  return out.replace(/\{\{([a-z][a-z0-9_.]*)\}\}/g, (whole, path: string) => {
    const v = lookup(path, contexts);
    if (v === undefined || v === null) return whole;
    if (typeof v === 'object') return whole;
    return String(v);
  });
}

/**
 * Remplit un modèle. Une balise sans valeur reste visible telle quelle :
 * dans l'aperçu, c'est ce qui dit qu'il manque une donnée.
 */
export function renderTemplate(html: string, data: DocData): string {
  return renderWith(html, [data]);
}

/** Les balises restées sans valeur après le rendu. */
export function unfilledTags(rendered: string): string[] {
  return [...new Set([...rendered.matchAll(/\{\{([a-z][a-z0-9_.]*)\}\}/g)].map((m) => m[1]))];
}
