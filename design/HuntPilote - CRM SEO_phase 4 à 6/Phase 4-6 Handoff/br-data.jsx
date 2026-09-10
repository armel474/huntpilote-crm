/* HuntPilote — Brief d'article : ce qu'on remet au rédacteur. On cadre et on suit, on n'écrit pas ici. */
const BR_STAGES = [
  ['brief', 'Brief en préparation', 'Le cadrage n’est pas terminé : le brief n’est pas remettable.'],
  ['assigne', 'Assigné', 'Remis au rédacteur, pas encore commencé.'],
  ['redaction', 'En rédaction', 'Le texte s’écrit hors de HuntPilote.'],
  ['relecture', 'En relecture', 'Le texte est arrivé, il attend une validation.'],
  ['publie', 'Publié', 'En ligne. La performance n’est pas encore interprétable.'],
  ['mesure', 'Publié et mesuré', 'En ligne depuis plus de 30 jours : les chiffres veulent dire quelque chose.'],
];

const BR_INTENTS = {
  info: { label: 'Informationnelle', tone: 'blue', hint: 'la personne veut comprendre' },
  compare: { label: 'Comparative', tone: 'yellow', hint: 'la personne hésite entre des options' },
  transac: { label: 'Transactionnelle', tone: 'green', hint: 'la personne est prête à agir' },
};

const BRIEF = {
  id: 'A-127', client: 'Acme Corp.', title: 'Fiche Google : les champs qui changent tout en local',
  stage: 'redaction', writer: 'Sophie Lanctôt', assignedAt: '2 septembre 2026', due: '18 septembre 2026',
  kw: { term: 'fiche google entreprise', vol: 2100, difficulty: 34, intent: 'info', pos: null },
  fromKw: true, fromKwNote: 'Repéré par Keyword Hunter le 28 août : 2 100 recherches par mois, aucune page d’Acme Corp. ne la couvre.',
  secondary: [
    { term: 'créer fiche google my business', vol: 890, intent: 'transac' },
    { term: 'optimiser fiche google', vol: 640, intent: 'info' },
    { term: 'fiche google vs site web', vol: 210, intent: 'compare' },
    { term: 'horaires fiche google modifier', vol: 320, intent: 'transac' },
    { term: 'photos fiche google combien', vol: 170, intent: 'info' },
  ],
  intentText: 'La personne qui tape « fiche google entreprise » vient presque toujours de constater un problème : sa fiche est incomplète, ou un concurrent apparaît devant elle sur Google Maps. Elle ne cherche pas une définition — elle cherche quoi remplir, dans quel ordre, et ce qui change vraiment le classement. Un article qui commence par « qu’est-ce qu’une fiche Google » perd ce lecteur au deuxième paragraphe.',
  intentProof: 'Les 5 premiers résultats sont tous des guides pas-à-pas avec captures. Aucun n’est une définition.',
  outline: [
    { h: 2, t: 'Les 4 champs qui pèsent le plus dans le classement local' },
    { h: 3, t: 'La catégorie principale : le champ le plus sous-estimé' },
    { h: 3, t: 'Les horaires, y compris les jours fériés' },
    { h: 3, t: 'Les photos : combien, lesquelles, à quelle fréquence' },
    { h: 3, t: 'La description : ce qu’il ne faut surtout pas y mettre' },
    { h: 2, t: 'Ce qui ne change rien, malgré ce qu’on lit partout' },
    { h: 2, t: 'Les avis : leur poids réel, et comment y répondre' },
    { h: 2, t: 'Vérifier sa fiche en 10 minutes — la liste à cocher' },
    { h: 2, t: 'Ce qu’il faut surveiller après coup' },
  ],
  competitors: [
    { rank: 1, domain: 'guide-referencement-local.ca', words: 2400, angle: 'Guide pas-à-pas avec 18 captures d’écran. Très complet, mais écrit en 2023 : l’interface montrée n’existe plus.' },
    { rank: 2, domain: 'blog-agence-montreal.com', words: 1650, angle: 'Liste de 10 conseils. Rapide à lire, mais aucune hiérarchie : le lecteur ne sait pas par quoi commencer.' },
    { rank: 3, domain: 'petitesentreprises.qc.ca', words: 900, angle: 'Article court et institutionnel. Peu de détail concret, mais très bien positionné grâce au domaine.' },
    { rank: 5, domain: 'forum-webmasters.fr', words: 480, angle: 'Fil de discussion. Contenu faible : c’est la place la plus facile à prendre.' },
  ],
  rules: {
    length: '1 800 à 2 200 mots', lengthWhy: 'Le premier résultat en fait 2 400 ; en dessous de 1 800, on ne couvre pas les 4 champs avec des exemples.',
    tone: 'Direct, à la deuxième personne. Zéro jargon SEO — le lecteur est un propriétaire de commerce, pas un référenceur.',
    links: [
      ['Nos services de SEO local', 'acmecorp.fr/services/seo-local'],
      ['Comment choisir un prestataire SEO au Québec', 'acmecorp.fr/blogue/choisir-prestataire-seo'],
      ['Audit technique : les 8 vérifications', 'acmecorp.fr/blogue/audit-technique-verifications'],
    ],
    cta: 'Vérification gratuite de votre fiche Google — formulaire en fin d’article, pas de bandeau flottant.',
    images: '4 captures d’écran de l’interface actuelle, prises en septembre 2026.',
  },
  track: { url: null, pubAt: null, reviewer: 'Marie Chen' },
  proofDraft: 'Un guide sur les fiches Google est en ligne sur votre blogue. Il répond à une question que 2 100 personnes par mois tapent dans Google, et qu’aucune page de votre site ne couvrait.',
};

function brScenario(key) {
  const b = { ...BRIEF, kw: { ...BRIEF.kw }, track: { ...BRIEF.track } };
  if (key === 'preparation') return { ...b, stage: 'brief', writer: null, assignedAt: null };
  if (key === 'assigne') return { ...b, stage: 'assigne' };
  if (key === 'relecture') return { ...b, stage: 'relecture' };
  if (key === 'publie') return { ...b, stage: 'publie', track: { ...b.track, url: 'acmecorp.fr/blogue/fiche-google-champs-essentiels', pubAt: '16 septembre 2026' } };
  if (key === 'mesure') return {
    ...b, stage: 'mesure',
    kw: { ...b.kw, pos: 8 },
    track: { ...b.track, url: 'acmecorp.fr/blogue/fiche-google-champs-essentiels', pubAt: '16 septembre 2026' },
    perf: { visits: 520, pos: 8, top10: 3, proof: 'PV-086' },
  };
  return b;
}

Object.assign(window, { BR_STAGES, BR_INTENTS, BRIEF, brScenario });
