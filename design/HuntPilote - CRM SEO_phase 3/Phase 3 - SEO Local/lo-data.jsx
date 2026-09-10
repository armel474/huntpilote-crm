/* HuntPilote — SEO local : icônes, données de portefeuille et référentiels partagés (vue d'ensemble + fiche d'établissement). */
const { AIco: LAI, APill: LAP, ASec: LAS, ALbl: LAL, A_TONE: LA_TONE } = window;
const LOI = {
  Pin: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Star: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  Phone: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.68 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.32 1.85.55 2.81.68A2 2 0 0122 16.92z" /></svg>,
  Route: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8.5 19H15a4 4 0 000-8H9a4 4 0 010-8h6.5" /></svg>,
  Camera: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  Tag: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41L11 3.83A2 2 0 009.59 3.2L3 3v6.59a2 2 0 00.59 1.41l9.58 9.59a2 2 0 002.82 0l4.6-4.6a2 2 0 000-2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
  Cal: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Doc: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>,
  List: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
  Layers: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
  Attr: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
  Msg: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>,
  Megaphone: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 11-5.8-1.6" /></svg>,
  Building: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1" /><line x1="9" y1="8" x2="9" y2="8.01" /><line x1="15" y1="8" x2="15" y2="8.01" /><line x1="9" y1="12" x2="9" y2="12.01" /><line x1="15" y1="12" x2="15" y2="12.01" /><line x1="9" y1="16" x2="9" y2="16.01" /><line x1="15" y1="16" x2="15" y2="16.01" /></svg>,
  Lock: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  UserX: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="17" y1="8" x2="22" y2="13" /><line x1="22" y1="8" x2="17" y2="13" /></svg>,
  Ruler: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a1 1 0 010 1.4l-4.6 4.6a1 1 0 01-1.4 0L2.7 8.7a1 1 0 010-1.4l4.6-4.6a1 1 0 011.4 0z" /><line x1="14.5" y1="5.5" x2="16.5" y2="7.5" /><line x1="11.5" y1="8.5" x2="13.5" y2="10.5" /><line x1="8.5" y1="11.5" x2="10.5" y2="13.5" /><line x1="5.5" y1="14.5" x2="7.5" y2="16.5" /></svg>,
  Ext: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>,
};

const GBP_ICONS = { 'Nom et coordonnées': LOI.Building, 'Catégories': LOI.Tag, 'Horaires (dont horaires spéciaux)': LOI.Cal, 'Photos': LOI.Camera, 'Description': LOI.Doc, 'Services': LOI.List, 'Zone desservie': LOI.Layers, 'Attributs': LOI.Attr, 'Site web': LOI.Ext };
const ALL_GBP_FIELDS = Object.keys(GBP_ICONS);

const GBP_STATE = {
  revendiquee: { label: 'Revendiquée et vérifiée', tone: 'green', Ico: LAI.Check },
  non_revendiquee: { label: 'Non revendiquée', tone: 'yellow', Ico: LOI.UserX },
  suspendue: { label: 'Suspendue · en attente de validation', tone: 'red', Ico: LAI.Clock },
  tiers: { label: 'Revendiquée par un tiers', tone: 'red', Ico: LOI.Lock },
};

const ALERT_DEFS = {
  avis_negatif: { label: 'Avis négatif sans réponse', tone: 'red', Ico: LOI.Star },
  fiche_suspendue: { label: 'Fiche suspendue', tone: 'red', Ico: LAI.Clock },
  chute_position: { label: 'Chute de position · pack local', tone: 'yellow', Ico: LAI.Down },
  incoherence: { label: 'Incohérence de citation détectée', tone: 'yellow', Ico: LAI.Warn },
  fiche_tiers: { label: 'Fiche revendiquée par un tiers', tone: 'red', Ico: LOI.Lock },
  fiche_non_revendiquee: { label: 'Fiche Google Business non revendiquée', tone: 'yellow', Ico: LOI.UserX },
  zone_non_configuree: { label: 'Zone desservie jamais configurée', tone: 'yellow', Ico: LOI.Layers },
};

/* Portefeuille d'établissements. Les critères NAP / citations / avis reprennent le vocabulaire et les seuils de l'audit — jamais reformulés. */
const ESTABS = [
  {
    id: 'acme-siege', name: 'Acme Corp. — siège', client: 'Acme Corp.', clientId: 'acme', ville: 'Montréal (Ville-Marie)',
    gbp: 'revendiquee', scoreLocal: 64, scorePrev: 58, note: 4.6, nbAvis: 87, avisSansReponse: 1, citTotal: 12, citRef: 20, incoh: 3, incohSources: 14,
    packPos: 3.2, packPosPrev: 3.0, alerts: ['avis_negatif'], auditRef: { id: 'A-0142', date: '1 octobre 2026' },
    gbpFilled: 6, gbpMissing: ['Horaires (dont horaires spéciaux)', 'Services', 'Zone desservie'],
    criteres: [
      { c: 'Cohérence nom · adresse · téléphone', measure: '3 incohérences sur 14 sources', threshold: 'Seuil : 0 incohérence', st: 'fail' },
      { c: 'Citations en annuaires', measure: '12 annuaires sur 20 de référence', threshold: 'Seuil : 16 sur 20', st: 'warn' },
      { c: 'Avis clients', measure: '4,6 / 5 · 87 avis · 1 sans réponse', threshold: 'Seuil : ≥ 4,0 et 0 avis sans réponse', st: 'warn', note: 'Un avis négatif de juillet reste sans réponse publique.' },
    ],
    zone: null,
    stats: { appels: 34, appelsD: 6, itin: 58, itinD: 3, visites: 212, visitesD: -4 },
    publications: [
      { date: '2 sept. 2026', text: 'Offre : inspection de toiture gratuite en septembre', type: 'Offre', vues: 412 },
      { date: '18 août 2026', text: 'Nouvel horaire pour la période des fêtes', type: 'Mise à jour', vues: 156, expiree: true },
    ],
    qa: [
      { q: 'Faites-vous les soumissions le week-end ?', date: '29 août 2026' },
      { q: 'Acceptez-vous les paiements par Interac ?', date: '14 août 2026' },
    ],
  },
  {
    id: 'boreal-qc', name: 'Boréal Immobilier — Québec', client: 'Boréal Immobilier', clientId: 'boreal', ville: 'Québec (Sainte-Foy)',
    gbp: 'revendiquee', scoreLocal: 88, scorePrev: 85, note: 4.8, nbAvis: 142, avisSansReponse: 0, citTotal: 19, citRef: 20, incoh: 0, incohSources: 16,
    packPos: 1.8, packPosPrev: 2.0, alerts: [], auditRef: { id: 'A-0138', date: '1 septembre 2026' },
    gbpFilled: 9, gbpMissing: [],
    criteres: [
      { c: 'Cohérence nom · adresse · téléphone', measure: '0 incohérence sur 16 sources', threshold: 'Seuil : 0 incohérence', st: 'ok' },
      { c: 'Citations en annuaires', measure: '19 annuaires sur 20 de référence', threshold: 'Seuil : 16 sur 20', st: 'ok' },
      { c: 'Avis clients', measure: '4,8 / 5 · 142 avis · 0 sans réponse', threshold: 'Seuil : ≥ 4,0 et 0 avis sans réponse', st: 'ok' },
    ],
    zone: { mode: 'secteurs', secteurs: ['Québec', 'Lévis', 'Beauport', 'Charlesbourg', 'Sainte-Foy'] },
    stats: { appels: 61, appelsD: 4, itin: 88, itinD: 5, visites: 340, visitesD: 12 },
    publications: [], qa: [],
  },
  {
    id: 'lavoie-rs', name: 'Clinique Lavoie — Rive-Sud', client: 'Clinique Lavoie', clientId: 'lavoie', ville: 'Brossard',
    gbp: 'suspendue', scoreLocal: null, alerts: ['fiche_suspendue'], auditRef: { id: 'A-0140', date: '1 septembre 2026' },
    gbpFilled: null, gbpMissing: [], criteres: [], zone: null, stats: null, publications: [], qa: [],
  },
  {
    id: 'lavoie-laval', name: 'Clinique Lavoie — Laval', client: 'Clinique Lavoie', clientId: 'lavoie', ville: 'Laval',
    gbp: 'revendiquee', scoreLocal: 52, scorePrev: 55, note: 4.3, nbAvis: 29, avisSansReponse: 0, citTotal: 14, citRef: 20, incoh: 1, incohSources: 12,
    packPos: 4.6, packPosPrev: 4.2, alerts: ['zone_non_configuree'], auditRef: { id: 'A-0140', date: '1 septembre 2026' },
    gbpFilled: 7, gbpMissing: ['Zone desservie', 'Attributs'],
    criteres: [
      { c: 'Cohérence nom · adresse · téléphone', measure: '1 incohérence sur 12 sources', threshold: 'Seuil : 0 incohérence', st: 'warn' },
      { c: 'Citations en annuaires', measure: '14 annuaires sur 20 de référence', threshold: 'Seuil : 16 sur 20', st: 'warn' },
      { c: 'Avis clients', measure: '4,3 / 5 · 29 avis · 0 sans réponse', threshold: 'Seuil : ≥ 4,0 et 0 avis sans réponse', st: 'ok' },
    ],
    zone: null,
    stats: { appels: 12, appelsD: 1, itin: 19, itinD: 0, visites: 55, visitesD: 3 },
    publications: [{ date: '10 août 2026', text: 'Bienvenue à notre nouvelle physiothérapeute', type: 'Événement', vues: 74 }],
    qa: [{ q: 'Avez-vous une entrée accessible en fauteuil roulant ?', date: '2 sept. 2026' }],
  },
  {
    id: 'nordik', name: 'Spa Nordik Estrie', client: 'Spa Nordik Estrie', clientId: 'nordik', ville: 'Sherbrooke',
    gbp: 'non_revendiquee', scoreLocal: null, alerts: ['fiche_non_revendiquee'], auditRef: null,
    gbpFilled: null, gbpMissing: [], criteres: [], zone: null, stats: null, publications: [], qa: [],
  },
  {
    id: 'fortin', name: 'Quincaillerie Fortin', client: 'Quincaillerie Fortin', clientId: 'fortin', ville: 'Trois-Rivières',
    gbp: 'tiers', scoreLocal: null, alerts: ['fiche_tiers'], auditRef: null,
    gbpFilled: null, gbpMissing: [], criteres: [], zone: null, stats: null, publications: [], qa: [],
  },
  {
    id: 'marchebio', name: 'Le Marché Bio', client: 'Le Marché Bio', clientId: 'marchebio', ville: 'Repentigny',
    gbp: 'revendiquee', scoreLocal: 74, scorePrev: 79, note: 4.5, nbAvis: 63, avisSansReponse: 0, citTotal: 17, citRef: 20, incoh: 1, incohSources: 11,
    packPos: 5.4, packPosPrev: 2.1, alerts: ['chute_position'], auditRef: { id: 'A-0141', date: '1 septembre 2026' },
    gbpFilled: 9, gbpMissing: [],
    criteres: [
      { c: 'Cohérence nom · adresse · téléphone', measure: '1 incohérence sur 11 sources', threshold: 'Seuil : 0 incohérence', st: 'warn' },
      { c: 'Citations en annuaires', measure: '17 annuaires sur 20 de référence', threshold: 'Seuil : 16 sur 20', st: 'ok' },
      { c: 'Avis clients', measure: '4,5 / 5 · 63 avis · 0 sans réponse', threshold: 'Seuil : ≥ 4,0 et 0 avis sans réponse', st: 'ok' },
    ],
    zone: { mode: 'grille', rows: 5, cols: 5, spacingKm: 1.2, pricePerPoint: 0.35 },
    stats: { appels: 21, appelsD: 2, itin: 40, itinD: -9, visites: 98, visitesD: -11 },
    publications: [{ date: '30 août 2026', text: 'Nouveaux produits en épicerie fine locale', type: 'Offre', vues: 289 }],
    qa: [],
  },
];

const CLIENTS_SANS_ETAB = ['Novatech', 'Dupont SAS', 'Paris Médias', 'Vélo Urbain'];

Object.assign(window, { LOI, GBP_ICONS, ALL_GBP_FIELDS, GBP_STATE, ALERT_DEFS, ESTABS, CLIENTS_SANS_ETAB });
