/* HuntPilote — Priorités transversales : données (priorités ouvertes, tout le portefeuille). */
const XP_CLIENTS = { AC: 'Acme Corp.', BC: 'Bistro Le Chalet', TL: 'Toiture Lavoie', CD: 'Clinique DentAlex', GR: 'Groupe Immobilier Rousseau' };
const XP_AGE_WARN = 14; // seuil agence : au-delà, une priorité non assignée devient un problème d'agence
const XP_AGE_OLD = 30;

const XP_ALL = [
  { id: 'P-0418', client: 'AC', sev: 'critique', dim: 'SEO', label: 'LCP mobile à 4,2 s (p75) sur 6 pages stratégiques', age: 166, vis: 'traitement', assigned: true, task: '#142' },
  { id: 'P-0611', client: 'TL', sev: 'critique', dim: 'Présence en ligne', label: 'Certificat SSL expiré depuis 4 jours', age: 4, vis: 'interne', assigned: false },
  { id: 'P-0588', client: 'CD', sev: 'critique', dim: 'SEO', label: 'robots.txt bloque 80 % du site à l’indexation', age: 6, vis: 'interne', assigned: false },
  { id: 'P-0560', client: 'BC', sev: 'critique', dim: 'Présence en ligne', label: '48 pages en 404 depuis la refonte de mai', age: 41, vis: 'annonce', assigned: false },
  { id: 'P-0392', client: 'GR', sev: 'critique', dim: 'Design', label: 'Formulaire de contact non fonctionnel sur mobile', age: 52, vis: 'interne', assigned: false },
  { id: 'P-0655', client: 'GR', sev: 'critique', dim: 'SEO', label: 'Site désindexé par Google depuis la migration', age: 2, vis: 'interne', assigned: false },
  { id: 'P-0656', client: 'TL', sev: 'critique', dim: 'SEO', label: 'Balise noindex laissée sur la page d’accueil', age: 1, vis: 'interne', assigned: false },
  { id: 'P-0657', client: 'CD', sev: 'critique', dim: 'Présence en ligne', label: 'Numéro de téléphone erroné sur la fiche Google', age: 1, vis: 'interne', assigned: false },
  { id: 'P-0421', client: 'AC', sev: 'important', dim: 'SEO', label: 'Crawl interrompu après 128 pages (HTTP 429)', age: 12, vis: 'interne', assigned: false },
  { id: 'P-0503', client: 'BC', sev: 'important', dim: 'Présence en ligne', label: 'Note Google en baisse : 4,1 vs 4,6 il y a 6 mois', age: 18, vis: 'annonce', assigned: false },
  { id: 'P-0577', client: 'CD', sev: 'important', dim: 'SEO', label: '12 balises title dupliquées', age: 9, vis: 'traitement', assigned: true, task: '#165' },
  { id: 'P-0344', client: 'TL', sev: 'important', dim: 'Design', label: 'Site non responsive sur tablette', age: 71, vis: 'interne', assigned: false },
  { id: 'P-0630', client: 'GR', sev: 'important', dim: 'SEO', label: 'Maillage interne absent sur 40 pages quartiers', age: 15, vis: 'interne', assigned: false },
  { id: 'P-0499', client: 'AC', sev: 'important', dim: 'Design', label: 'Contraste insuffisant sur les boutons d’action principaux', age: 22, vis: 'interne', assigned: false },
  { id: 'P-0512', client: 'BC', sev: 'important', dim: 'Présence en ligne', label: 'Fiche Google Maps incomplète (horaires, photos)', age: 5, vis: 'interne', assigned: false },
  { id: 'P-0431', client: 'CD', sev: 'opportunite', dim: 'SEO', label: '45 mots-clés longue traîne inexploités', age: 25, vis: 'traitement', assigned: true, task: '#151' },
  { id: 'P-0470', client: 'TL', sev: 'opportunite', dim: 'Présence en ligne', label: 'Aucune présence sur les répertoires locaux', age: 33, vis: 'interne', assigned: false },
  { id: 'P-0481', client: 'GR', sev: 'opportunite', dim: 'Design', label: 'Aucune page dédiée pour les témoignages clients', age: 8, vis: 'interne', assigned: false },
  { id: 'P-0439', client: 'AC', sev: 'opportunite', dim: 'SEO', label: 'Métadonnées OG absentes pour le partage social', age: 19, vis: 'interne', assigned: false },
  { id: 'P-0522', client: 'BC', sev: 'opportunite', dim: 'Design', label: 'Palette de couleurs incohérente entre les pages', age: 45, vis: 'interne', assigned: false },
];

function xpScenario(key) {
  if (key === 'sain') return XP_ALL.filter(p => p.sev !== 'critique');
  if (key === 'afflux') return XP_ALL.filter(p => p.age <= 6);
  if (key === 'anciennes') return XP_ALL.filter(p => p.age >= XP_AGE_OLD && !p.assigned);
  return XP_ALL;
}

Object.assign(window, { XP_CLIENTS, XP_AGE_WARN, XP_AGE_OLD, XP_ALL, xpScenario });
